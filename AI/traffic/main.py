import os
import time
import json
import threading
import traceback
from datetime import datetime
from io import BytesIO
from urllib.parse import urljoin

import requests
from PIL import Image
import numpy as np
import cv2
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    TimeoutException, NoSuchElementException, WebDriverException
)
import signal
from concurrent.futures import ThreadPoolExecutor, as_completed

# ----------------- CONFIG (tùy chỉnh nếu cần) -----------------
CONFIG_FILE = "./config/cameras.json"
BASE_SAVE_DIR = "./data"
LOG_FILE = "./logs/collector.log"
GLOBAL_INTERVAL_SEC = 10          # mặc định nếu camera không định nghĩa interval_sec
HEADLESS = True
WAIT_TIMEOUT = 20                # chờ img đổi từ loading.gif -> url thật
MAX_DRIVERS = 2                  # giới hạn số Chrome instances đồng thời
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
# ------------------------------------------------------------

os.makedirs(BASE_SAVE_DIR, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# semaphore để giới hạn số driver cùng lúc
driver_semaphore = threading.Semaphore(MAX_DRIVERS)

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    s = f"[{ts}] {msg}"
    print(s, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(s + "\n")

def make_driver(headless=True):
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument(f"user-agent={USER_AGENT}")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_argument("--window-size=1280,720")
    # nếu cần thêm các arg khác, bổ sung ở đây
    driver = webdriver.Chrome(options=opts)
    return driver

def selenium_cookies_to_requests(driver, session):
    try:
        for c in driver.get_cookies():
            session.cookies.set(c['name'], c['value'], domain=c.get('domain'))
    except Exception:
        # không fatal
        pass

def wait_for_real_img_src(driver, selector="img", timeout=WAIT_TIMEOUT, poll=0.5):
    """
    Chờ tới khi src của img không chứa 'loading.gif' hoặc rỗng.
    Trả về src hiện tại hoặc raise TimeoutException.
    """
    t0 = time.time()
    last_src = None
    while True:
        try:
            el = driver.find_element(By.CSS_SELECTOR, selector)
            src = el.get_attribute("src") or ""
            src = src.strip()
            data_src = el.get_attribute("org-src") or el.get_attribute("data-src") or el.get_attribute("data-original")
            if data_src and "loading.gif" not in data_src.lower():
                return data_src
            if src and ("loading.gif" not in src.lower()) and (src.lower().startswith("http") or src.startswith("/")):
                return src
            last_src = src
        except NoSuchElementException:
            last_src = None
        if time.time() - t0 > timeout:
            raise TimeoutException(f"Timeout waiting for real img src. Last src: {last_src}")
        time.sleep(poll)

def download_image_via_requests(session, img_url, base_domain=None, connect_timeout=5, read_timeout=20):
    """
    Tải ảnh bằng requests (timeout tách connect/read). Trả về numpy BGR và final_url.
    """
    if base_domain:
        url = urljoin(base_domain, img_url)
    else:
        url = img_url
    r = session.get(url, timeout=(connect_timeout, read_timeout))
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    arr = np.array(img)[:, :, ::-1]  # RGB -> BGR
    return arr, r.url

def element_screenshot_to_frame(el):
    """
    Fallback: chụp element screenshot bằng selenium và decode PNG -> OpenCV
    """
    png = el.screenshot_as_png
    img = Image.open(BytesIO(png)).convert("RGB")
    return np.array(img)[:, :, ::-1]

def camera_worker_loop(cam, stop_event):
    """
    Worker chính cho mỗi camera, thay đổi nhỏ: nhận stop_event để dừng gọn.
    Giữ nguyên logic: acquire semaphore -> mở driver -> loop fetch -> release
    Nếu gặp lỗi fatal sẽ raise để managed_worker xử lý restart (nếu cần).
    """
    name = cam.get("name") or cam.get("url")[:40].replace("/", "_")
    url = cam["url"]
    interval = cam.get("interval_sec", GLOBAL_INTERVAL_SEC)
    save_dir = os.path.join(BASE_SAVE_DIR, name)
    os.makedirs(save_dir, exist_ok=True)
    base_domain = "{uri.scheme}://{uri.netloc}".format(uri=requests.utils.urlparse(url))

    log(f"[{name}] waiting for driver slot...")
    # nếu stop_event đã được set thì return ngay
    if stop_event.is_set():
        log(f"[{name}] stop_event set before acquiring driver - exiting")
        return

    acquired = driver_semaphore.acquire(timeout=60)
    if not acquired:
        raise RuntimeError(f"[{name}] timeout waiting for driver slot")

    driver = None
    try:
        log(f"[{name}] acquiring driver...")
        driver = make_driver(headless=HEADLESS)
        driver.get(url)
        time.sleep(1.0)

        try:
            initial_src = wait_for_real_img_src(driver)
            log(f"[{name}] initial src: {initial_src}")
        except Exception as e:
            log(f"[{name}] warning: initial src not found: {e}")
            initial_src = None

        session = requests.Session()
        session.headers.update({"User-Agent": USER_AGENT})
        selenium_cookies_to_requests(driver, session)

        idx = 0
        while not stop_event.is_set():
            t0 = time.time()
            try:
                el = None
                try:
                    el = driver.find_element(By.CSS_SELECTOR, "img")
                    src_dyn = el.get_attribute("src") or ""
                    if src_dyn and "loading.gif" not in src_dyn.lower():
                        img_src = src_dyn
                    else:
                        data_src = el.get_attribute("org-src") or el.get_attribute("data-src") or el.get_attribute("data-original")
                        img_src = data_src or initial_src or src_dyn
                    if not img_src:
                        raise RuntimeError("No usable img src")
                except Exception as e:
                    log(f"[{name}] cannot read img element: {e}")
                    # try refresh once, but if stop_event set break
                    if stop_event.is_set():
                        break
                    try:
                        driver.refresh()
                        time.sleep(1)
                        el = driver.find_element(By.CSS_SELECTOR, "img")
                        img_src = el.get_attribute("src") or el.get_attribute("org-src")
                    except Exception as ee:
                        raise RuntimeError("Cannot recover img element: " + str(ee))

                # try download via requests
                try:
                    frame, final_url = download_image_via_requests(session, img_src, base_domain=base_domain)
                    try:
                        final_path = save_and_prune(frame, save_dir, keep=5, prefix="frame_")
                        log(f"[{name}] saved {final_path} (pruned to keep 5 newest)")
                    except Exception as e:
                        log(f"[{name}] failed saving frame: {e}")
                except Exception as e:
                    log(f"[{name}] request fetch failed: {e} -- attempting fallback screenshot")
                    # fallback screenshot if possible and not asked to stop
                    if stop_event.is_set():
                        break
                    try:
                        if el is None:
                            el = driver.find_element(By.CSS_SELECTOR, "img")
                        frame = element_screenshot_to_frame(el)
                        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                        fname = os.path.join(save_dir, f"frame_fallback_{ts}.jpg")
                        cv2.imwrite(fname, frame)
                        log(f"[{name}] saved fallback {fname}")
                    except Exception as e2:
                        log(f"[{name}] fallback screenshot failed: {e2}")
                        # attempt page refresh (but honor stop_event)
                        if stop_event.is_set():
                            break
                        try:
                            driver.refresh()
                            time.sleep(1)
                            selenium_cookies_to_requests(driver, session)
                        except Exception:
                            pass

            except Exception as e_loop:
                log(f"[{name}] loop error: {e_loop}\n{traceback.format_exc()}")
                # recover by sleeping, refreshing page; if stop requested, break and let outer clean
                if stop_event.is_set():
                    break
                try:
                    driver.refresh()
                    time.sleep(2)
                    selenium_cookies_to_requests(driver, session)
                except Exception as e:
                    log(f"[{name}] refresh failed during recovery: {e}")
                    raise

            idx += 1
            elapsed = time.time() - t0
            to_sleep = max(0, interval - elapsed)
            # sleep in small increments to be responsive to stop_event
            slept = 0.0
            while slept < to_sleep:
                if stop_event.is_set():
                    break
                chunk = min(0.5, to_sleep - slept)
                time.sleep(chunk)
                slept += chunk

    finally:
        try:
            if driver:
                driver.quit()
        except Exception:
            pass
        driver_semaphore.release()
        log(f"[{name}] driver released and worker exiting")

def managed_worker(cam, stop_event, max_restarts=10, backoff_base=5):
    """
    Wrapper để restart worker khi crash, nhưng tôn trọng stop_event để dừng.
    Synchronous-friendly: returns when stop_event set and worker stopped.
    """
    name = cam.get("name") or cam.get("url")[:30]
    attempt = 0
    while not stop_event.is_set():
        try:
            camera_worker_loop(cam, stop_event)
            # If loop returns normally (e.g. stop_event set), break
            break
        except Exception as e:
            attempt += 1
            log(f"[{name}] worker crashed: {e}\n{traceback.format_exc()}")
            if attempt >= max_restarts:
                log(f"[{name}] reached max restarts ({max_restarts}), giving up.")
                break
            # backoff but be responsive to stop_event
            sleep_for = backoff_base * attempt
            log(f"[{name}] restarting in {sleep_for}s (attempt {attempt}/{max_restarts})")
            slept = 0.0
            while slept < sleep_for:
                if stop_event.is_set():
                    log(f"[{name}] stop_event set during backoff, exiting restart loop")
                    return
                chunk = min(0.5, sleep_for - slept)
                time.sleep(chunk)
                slept += chunk
            continue
    log(f"[{name}] managed_worker exiting (stop_event={stop_event.is_set()})")

import glob
import os
from tempfile import NamedTemporaryFile

def save_and_prune(frame_bgr, save_dir, keep=5, prefix="frame_"):
    """
    Lưu frame (OpenCV BGR numpy array) vào save_dir với tên timestamped,
    rồi xóa các file cũ hơn, chỉ giữ `keep` file mới nhất.
    Trả về đường dẫn file vừa lưu.
    """
    os.makedirs(save_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]  # ms precision
    tmp_path = None
    final_name = f"{prefix}{ts}.jpg"
    final_path = os.path.join(save_dir, final_name)

    # Ghi atomic: ghi vào file tạm rồi rename (os.replace) để tránh partial file
    try:
        # PIL/cv2 imwrite supports direct write; but to be atomic, write to NamedTemporaryFile
        # We'll use cv2.imencode -> bytes -> write to temp then replace
        encode_success, encimg = cv2.imencode(".jpg", frame_bgr)
        if not encode_success:
            raise RuntimeError("Failed to encode image before saving")
        with NamedTemporaryFile(delete=False, dir=save_dir, prefix=".tmp_write_", suffix=".jpg") as tmpf:
            tmp_path = tmpf.name
            tmpf.write(encimg.tobytes())
        # atomic replace
        os.replace(tmp_path, final_path)
    except Exception as e:
        # cleanup tmp file if exists
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        raise

    # tạo/ cập nhật symlink latest.jpg (tùy hệ file có hỗ trợ)
    try:
        latest_link = os.path.join(save_dir, "latest.jpg")
        # remove existing link/file if any, then create symlink to final_path
        if os.path.exists(latest_link) or os.path.islink(latest_link):
            try:
                os.remove(latest_link)
            except Exception:
                pass
        # create a relative symlink if possible, else copy
        try:
            os.symlink(os.path.basename(final_path), latest_link)
        except Exception:
            # fallback: copy file (if symlink not allowed on FS e.g. Windows without admin)
            import shutil
            shutil.copy2(final_path, latest_link)
    except Exception:
        # non-fatal
        pass

    # prune older files: only keep `keep` newest files that match prefix*.jpg (exclude latest.jpg)
    try:
        pattern = os.path.join(save_dir, f"{prefix}*.jpg")
        files = [p for p in glob.glob(pattern) if os.path.basename(p) != "latest.jpg"]
        # sort by modification time descending (newest first)
        files.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        # keep top `keep`, remove the rest
        for old in files[keep:]:
            try:
                os.remove(old)
            except Exception:
                pass
    except Exception:
        # non-fatal
        pass

    return final_path


def main():
    """
    Đồng bộ: start all managed_worker in ThreadPoolExecutor, block until stop_event set,
    then set stop_event and wait for workers to shutdown gracefully.
    """
    # load config
    if not os.path.exists(CONFIG_FILE):
        log(f"Config file not found: {CONFIG_FILE}")
        return
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        cams = json.load(f)

    stop_event = threading.Event()

    # signal handlers set the stop_event
    def _signal_handler(signum, frame):
        log(f"Received signal {signum}, initiating graceful shutdown...")
        stop_event.set()

    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    num_workers = len(cams)
    log(f"Starting {num_workers} camera workers (max drivers={MAX_DRIVERS})")

    # Use ThreadPoolExecutor for clearer lifecycle (synchronous)
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = []
        for cam in cams:
            fut = executor.submit(managed_worker, cam, stop_event)
            futures.append(fut)
            time.sleep(0.5)  # stagger startup

        try:
            # Block until all futures complete or stop_event is set
            # Use a loop to be responsive to stop_event
            while not stop_event.is_set():
                # check if any future finished with exception
                for fut in futures:
                    if fut.done():
                        try:
                            fut.result()  # raise exception if worker raised
                        except Exception as e:
                            log(f"Worker raised unhandled exception: {e}\n{traceback.format_exc()}")
                time.sleep(1)
            # stop_event is set -> wait for workers to finish cleanly
            log("Stop event set: waiting for workers to finish (grace period 30s)...")
            # wait up to timeout for thread pool to finish
            wait_deadline = time.time() + 30
            for fut in futures:
                remaining = max(0, wait_deadline - time.time())
                try:
                    fut.result(timeout=remaining)
                except Exception as e:
                    log(f"Worker did not finish cleanly: {e}")
            log("All workers terminated (or timed out waiting). Exiting main.")
        except KeyboardInterrupt:
            log("KeyboardInterrupt caught in main: setting stop_event and shutting down")
            stop_event.set()
        finally:
            stop_event.set()
            # executor.shutdown() will be called by context manager

if __name__=="__main__":
    main()
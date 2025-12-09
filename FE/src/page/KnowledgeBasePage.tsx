import { useEffect, useState } from "react";
import {
  FaAws,
  FaRss,
  FaPlus,
  FaTrash,
  FaRotateRight,
  FaXmark,
} from "react-icons/fa6";
import { toast } from "react-toastify";
import { AI_URL } from "../utils/Url";

interface WatcherState {
  rss: boolean;
  s3: boolean;
}

export default function KnowledgeBaseManager() {
  const [watchers, setWatchers] = useState<WatcherState>({
    rss: false,
    s3: false,
  });
  const [connection, setConnection] = useState<string>("Đang kiểm tra...");
  const [rssList, setRssList] = useState<string[]>([]);
  const [rssUrl, setRssUrl] = useState<string>("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [maxAge, setMaxAge] = useState<number>(7);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMsg, setUploadMsg] = useState<string>("");

  useEffect(() => {
    checkHealth();
    loadWatchers();
    loadRss();
    loadDocuments();
  }, []);

  async function checkHealth() {
    try {
      const res = await fetch(`${AI_URL}/watcher/status`);
      setConnection(res.ok ? "Online" : "Offline");
    } catch {
      setConnection("Offline");
    }
  }

  async function loadWatchers() {
    try {
      const res = await fetch(`${AI_URL}/watcher/status`);
      const data = await res.json();

      if (data.status === "success") {
        setWatchers(data.watchers);
        if (data.rss_config?.max_age_days)
          setMaxAge(data.rss_config.max_age_days);
      }
    } catch {}
  }

  async function toggleWatcher(name: keyof WatcherState) {
    const newValue = !watchers[name];
    setWatchers({ ...watchers, [name]: newValue });

    try {
      const res = await fetch(`${AI_URL}/watcher/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watcher: name, enabled: newValue }),
      });

      if (!res.ok) throw new Error();
    } catch {
      toast.error("Không thể thay đổi trạng thái Watcher.");
      setWatchers({ ...watchers, [name]: !newValue });
    }
  }

  async function loadRss() {
    try {
      const res = await fetch(`${AI_URL}/rss/urls`);
      const data = await res.json();
      setRssList(data.urls || []);
    } catch {
      setRssList([]);
    }
  }

  async function addRss() {
    if (!rssUrl.trim()) return;

    try {
      const res = await fetch(`${AI_URL}/rss/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rssUrl }),
      });

      if (res.ok) {
        setRssUrl("");
        loadRss();
        toast.success("Đã thêm RSS Feed!");
      } else {
        const err = await res.json();
        toast.error(err.detail);
      }
    } catch {
      toast.error("Có lỗi khi thêm RSS Feed.");
    }
  }

  async function removeRss(url: string) {
    if (!confirm(`Bạn có chắc muốn xóa RSS này?\n${url}`)) return;

    try {
      const res = await fetch(`${AI_URL}/rss/urls`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        loadRss();
        toast.success("Đã xóa RSS Feed!");
      } else {
        toast.error("Không thể xóa RSS Feed.");
      }
    } catch {
      toast.error("Lỗi khi xóa RSS Feed.");
    }
  }

  async function updateAge() {
    try {
      const res = await fetch(`${AI_URL}/rss/config/age`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: maxAge }),
      });

      res.ok ? toast.success("Đã cập nhật!") : toast.error("Thất bại!");
    } catch {
      toast.error("Lỗi mạng!");
    }
  }

  async function loadDocuments() {
    try {
      const res = await fetch(`${AI_URL}/rag/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    }
  }

  async function deleteDocument(filename: string) {
    if (!confirm(`Bạn có chắc muốn xóa: ${filename}?`)) return;

    try {
      await fetch(`${AI_URL}/rag/s3/document`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      loadDocuments();
      toast.success("Đã xóa!");
    } catch {
      toast.error("Lỗi khi xóa.");
    }
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${AI_URL}/rag/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok) {
        setUploadMsg(`Đã tải lên: ${data.filename}`);
        loadDocuments();
      } else {
        setUploadMsg(`Lỗi: ${data.detail}`);
      }
    } catch {
      setUploadMsg("Tải lên thất bại.");
    }

    setUploading(false);
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Knowledge Base</h1>
            <p className="text-gray-500 mt-1">
              Quản lý Document S3, RSS Feeds và Watchers
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              connection === "Online"
                ? "bg-green-100 text-green-700"
                : connection === "Offline"
                ? "bg-red-100 text-red-700"
                : "bg-gray-200"
            }`}
          >
            {connection}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow  flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <FaRss />
              </div>
              <div>
                <h3 className="font-semibold">RSS Watcher</h3>
                <p className="text-xs text-gray-500">Tự động lấy tin</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={watchers.rss}
              onChange={() => toggleWatcher("rss")}
              className="w-5 h-5"
            />
          </div>

          <div className="p-6 bg-white rounded-lg shadow ">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <FaAws />
                </div>
                <div>
                  <h3 className="font-semibold">S3 Watcher</h3>
                  <p className="text-xs text-gray-500">Đồng bộ Bucket</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={watchers.s3}
                onChange={() => toggleWatcher("s3")}
                className="w-5 h-5"
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50  rounded flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Retention Policy</p>
                <p className="text-xs text-gray-500">
                  Giữ lại bài viết trong X ngày
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-20  px-2 py-1 rounded text-sm"
                />
                <button
                  onClick={updateAge}
                  className="px-3 cursor-pointer py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RSS FEEDS */}
        <div className="p-6 bg-white rounded-lg shadow  mb-8">
          <h2 className="text-xl font-bold mb-4">Danh sách RSS Feeds</h2>

          <div className="flex gap-3 mb-6">
            <input
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="flex-1  px-4 py-2 rounded"
            />
            <button
              onClick={addRss}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaPlus /> Thêm
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded ">
            <h3 className="text-xs uppercase text-gray-500 mb-3">
              Danh sách hiện tại
            </h3>

            {rssList.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                Chưa có RSS Feed nào.
              </p>
            ) : (
              <ul className="space-y-2">
                {rssList.map((url) => (
                  <li
                    key={url}
                    className="bg-white  p-2 rounded flex justify-between items-center"
                  >
                    <span className="truncate">{url}</span>
                    <button
                      onClick={() => removeRss(url)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaXmark />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow  mb-8">
          <h2 className="text-xl font-bold">Tải tài liệu lên S3</h2>

          <input
            type="file"
            onChange={uploadFile}
            className="mt-3 block w-full cursor-pointer"
          />

          <p className="mt-2 text-sm">
            {uploading ? "Đang tải lên..." : uploadMsg}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow ">
          <div className="p-6 -b flex justify-between items-center">
            <h2 className="text-xl font-bold">Danh sách tài liệu</h2>
            <button
              onClick={loadDocuments}
              className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <FaRotateRight /> Làm mới
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Tên file</th>
                <th className="px-6 py-3">Nguồn</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {documents.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-400">
                    Không có tài liệu nào.
                  </td>
                </tr>
              )}

              {documents.map((doc, i) => (
                <tr key={i} className="-b hover:bg-gray-50">
                  <td className="px-6 py-4">{doc}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                      S3 Bucket
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteDocument(doc)}
                      className="flex cursor-pointer items-center gap-1 text-red-500 hover:text-red-700 ml-auto"
                    >
                      <FaTrash /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

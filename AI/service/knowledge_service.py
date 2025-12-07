# -----------------------------------------------------------------------------
# Copyright 2025 Fenwick Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------
import threading
import os
from typing import List, Set

from components.logging.logger import setup_logger

logger = setup_logger("knowledge_service")

class KnowledgeService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(KnowledgeService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        with self._lock:
            default_days = int(os.getenv("RSS_MAX_AGE_DAYS", "1"))
            self._state = {
                's3': bool(os.getenv("KNOWLEDGE_S3_ENABLED")),
                'rss': bool(os.getenv("WATCHER_RSS_URLS"))
            }

            self._rss_urls: Set[str] = set()
            self._load_rss_config()
            self._rss_max_age_days = default_days

            self._initialized = True
            logger.info(f"KnowledgeService initialized. RSS URLs loaded: {len(self._rss_urls)}")

    def _load_rss_config(self):
        env_urls = os.getenv("WATCHER_RSS_URLS", "")
        if env_urls:
            for url in env_urls.split(','):
                if url.strip():
                    self._rss_urls.add(url.strip())

    def get_rss_urls(self) -> List[str]:
        with self._lock:
            return list(self._rss_urls)

    def add_rss_url(self, url: str):
        with self._lock:
            if url not in self._rss_urls:
                self._rss_urls.add(url)
                logger.info(f"Added RSS URL (Memory only): {url}")
                return True
            return False

    def remove_rss_url(self, url: str):
        with self._lock:
            if url in self._rss_urls:
                self._rss_urls.remove(url)
                logger.info(f"Removed RSS URL (Memory only): {url}")
                return True
            return False

    def is_enabled(self, watcher_name: str) -> bool:
        with self._lock:
            return self._state.get(watcher_name, False)

    def set_state(self, watcher_name: str, is_enabled: bool):
        with self._lock:
            if watcher_name in self._state:
                self._state[watcher_name] = is_enabled
            else:
                logger.warning(f"Warning: Tried to set state for unknown watcher '{watcher_name}'")

    def get_all_states(self) -> dict:
        with self._lock:
            return self._state.copy()

    def get_rss_max_age_days(self) -> int:
            with self._lock:
                return self._rss_max_age_days

    def set_rss_max_age_days(self, days: int):
        with self._lock:
            self._rss_max_age_days = days
            logger.info(f"Updated RSS Max Age to: {days} days")
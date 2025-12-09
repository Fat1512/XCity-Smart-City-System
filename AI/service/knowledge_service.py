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
from datetime import datetime, timezone, timedelta
from dateutil import parser as date_parser
from typing import List, Set

from components.logging.logger import setup_logger
from components.manager import ConfigManager
from components.manager import DatabaseManager

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
            self.config_manager = ConfigManager()
            self.db_manager = DatabaseManager()
            self.collection_name = "rag_documents"

            default_days = int(os.getenv("RSS_MAX_AGE_DAYS", "1"))
            self._state = {
                's3': bool(os.getenv("KNOWLEDGE_S3_ENABLED")),
                'rss': bool(os.getenv("WATCHER_RSS_URLS"))
            }

            self._rss_urls: Set[str] = set()
            self._load_rss_config()
            self._rss_max_age_days = default_days

            self._initialized = True
            logger.info(f"KnowledgeService initialized.")

    def cleanup_stale_documents(self, prefix: str):
        days = self._rss_max_age_days
        if days <= 0: return 0

        try:
            cutoff_dt = datetime.now(timezone.utc) - timedelta(days=days)
            logger.info(f"Checking for stale documents (older than {days} days, prefix='{prefix}')...")

            db_data = self.db_manager.get_all(collection_name=self.collection_name, include=["metadatas"])
            all_metadatas = db_data.get("metadatas", [])
            
            deleted_count = 0
            files_to_delete = set()

            for meta in all_metadatas:
                filename = meta.get("source")
                pub_date_str = meta.get("publication_date")

                if not filename or not pub_date_str: continue
                if not filename.startswith(prefix): continue

                try:
                    pub_date_dt = date_parser.parse(pub_date_str)
                    if pub_date_dt.tzinfo is None: 
                        pub_date_dt = pub_date_dt.replace(tzinfo=timezone.utc)
                    
                    if pub_date_dt < cutoff_dt:
                        files_to_delete.add(filename)
                except: continue

            for filename in files_to_delete:
                self.db_manager.delete(self.collection_name, where_filter={"source": filename})
                logger.info(f"Deleted stale document: {filename}")
                deleted_count += 1
            
            if deleted_count > 0:
                logger.info(f"Cleanup complete. Removed {deleted_count} files.")
            return deleted_count

        except Exception as e:
            logger.error(f"Error cleaning up stale documents: {e}")
            return 0

    @property
    def streams_config(self):
        return self.config_manager.get_all_streams()

    def _load_rss_config(self):
        env_urls = os.getenv("WATCHER_RSS_URLS", "")
        if env_urls:
            for url in env_urls.split(','):
                if url.strip():
                    self._rss_urls.add(url.strip())
    
    def get_rss_urls(self) -> List[str]:
        with self._lock: return list(self._rss_urls)

    def add_rss_url(self, url: str):
        with self._lock:
            if url not in self._rss_urls:
                self._rss_urls.add(url)
                return True
            return False

    def remove_rss_url(self, url: str):
        with self._lock:
            if url in self._rss_urls:
                self._rss_urls.remove(url)
                return True
            return False

    def is_enabled(self, watcher_name: str) -> bool:
        with self._lock: return self._state.get(watcher_name, False)

    def set_state(self, watcher_name: str, is_enabled: bool):
        with self._lock: self._state[watcher_name] = is_enabled

    def get_all_states(self) -> dict:
        with self._lock: return self._state.copy()

    def get_rss_max_age_days(self) -> int:
        with self._lock: return self._rss_max_age_days

    def set_rss_max_age_days(self, days: int):
        with self._lock: self._rss_max_age_days = days
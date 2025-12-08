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
import asyncio
import feedparser
import httpx
import trafilatura
import hashlib
import os
import functools
import json
from dateutil import parser as date_parser
from datetime import datetime, timezone, timedelta
import boto3
from botocore.exceptions import ClientError

from components.interfaces import BaseWatcher
from service.rag.rag_service import MiniRagService
from service.knowledge_service import KnowledgeService
from components.manager import GenerationManager, PromptManager

class RSSWatcher(BaseWatcher):
    def __init__(
        self,
        feed_urls: list[str],
        check_interval_seconds: int = 3600,
        save_dir: str | None = None,
        s3_bucket: str | None = None,
        s3_prefix: str = "",
    ):
        self.check_interval = check_interval_seconds
        self.max_backfill_pages = int(os.getenv("RSS_MAX_BACKFILL_PAGES", "1"))
        
        self.state_service = KnowledgeService()

        self.llm = GenerationManager()
        self.prompts = PromptManager()

        self.rag_service: MiniRagService = None
        self.loop: asyncio.AbstractEventLoop = None
        self.seen_articles: dict[str, str] = {}
        
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            )
        }
        self.http_client = httpx.AsyncClient(
            timeout=20.0, follow_redirects=True, headers=headers
        )

        self.save_dir = save_dir
        self.s3_bucket = s3_bucket
        self.s3_prefix = s3_prefix
        self.s3_client = boto3.client("s3") if s3_bucket else None

        print(f"Initialized RSSWatcher, checking every {check_interval_seconds} seconds.")

    async def start(self, rag_service: MiniRagService, loop: asyncio.AbstractEventLoop):
        self.rag_service = rag_service
        self.loop = loop
        
        current_max_age = self.state_service.get_rss_max_age_days()
        if self.state_service.is_enabled('rss') and current_max_age > 0:
            print(f"RSSWatcher: Running startup cleanup (Files older than {current_max_age} days)...")
            
            self.state_service.cleanup_stale_documents(prefix="rss_")
            
            if self.s3_client:
                await self._cleanup_old_s3_files(current_max_age)

        try:
            while True:
                if self.state_service.is_enabled('rss'):
                    current_urls = self.state_service.get_rss_urls()
                    current_max_age = self.state_service.get_rss_max_age_days()
                    
                    print(f"RSSWatcher: Scanning {len(current_urls)} feeds. Max Age: {current_max_age} days.")
                    
                    for feed_url in current_urls:
                        await self._process_feed_url(feed_url, is_backfill=False, max_age_days=current_max_age)

                    if current_max_age > 0:
                        self.state_service.cleanup_stale_documents(prefix="rss_")
                        if self.s3_client:
                            await self._cleanup_old_s3_files(current_max_age)

                    print(f"RSSWatcher: Finished checking. Sleeping for {self.check_interval} seconds...")
                    await asyncio.sleep(self.check_interval)
                
                else:
                    await asyncio.sleep(10)

        except asyncio.CancelledError:
            print("RSSWatcher is stopping...")
        except Exception as e:
            print(f"Critical error in RSSWatcher: {e}")
        finally:
            await self.http_client.aclose()

    async def _refine_content_with_llm(self, raw_text: str) -> str | None:
        if not raw_text or len(raw_text) < 50: 
            return None

        try:
            prompt = self.prompts.load("rss_filter", text=raw_text[:3000]) 
            response = await self.loop.run_in_executor(None, lambda: self.llm.generate(prompt))
            
            text_resp = response.get("text", "").strip()
            if "```" in text_resp:
                text_resp = text_resp.split("```json")[-1].split("```")[0].strip()
                if "```" in text_resp: 
                     text_resp = text_resp.replace("```", "")
            
            data = json.loads(text_resp)
            
            if data.get("is_relevant") is True:
                print(f"  [FILTER] Kept article (Reason: {data.get('reason')})")
                return raw_text 
            else:
                print(f"  [FILTER] Skipped article (Reason: {data.get('reason')})")
                return None

        except Exception as e:
            print(f"  [FILTER] Error processing LLM: {e}. Fallback to keeping text.")
            return raw_text 

    def _s3_object_exists(self, key: str) -> bool:
        if not self.s3_client or not self.s3_bucket:
            return False
        try:
            self.s3_client.head_object(Bucket=self.s3_bucket, Key=key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == "404":
                return False
            return False

    async def _process_feed_url(self, feed_url: str, is_backfill: bool, max_age_days: int = 0) -> bool:
        try:
            response = await self.http_client.get(feed_url)
            response.raise_for_status()
            feed_content_bytes = response.content
            
            func_to_run = functools.partial(feedparser.parse, feed_content_bytes)
            parsed_feed = await self.loop.run_in_executor(None, func_to_run)

            if parsed_feed.bozo or not parsed_feed.entries:
                return False 

            now_utc = datetime.now(timezone.utc)
            had_valid_entries = False

            for entry in parsed_feed.entries:
                article_id = entry.get("id", entry.get("guid", entry.link))
                pub_date_str = entry.get("published", entry.get("updated", None))
                last_updated = entry.get("updated", pub_date_str)
                title = entry.get("title", "No Title")

                if max_age_days > 0 and pub_date_str:
                    try:
                        pub_date_dt = date_parser.parse(pub_date_str)
                        if pub_date_dt.tzinfo is None:
                            pub_date_dt = pub_date_dt.replace(tzinfo=timezone.utc)
                        cutoff_dt = now_utc - timedelta(days=max_age_days)
                        if pub_date_dt < cutoff_dt:
                            continue
                    except Exception:
                        pass 

                if not is_backfill and article_id in self.seen_articles and \
                   self.seen_articles.get(article_id) == last_updated:
                    continue

                filename = self._create_filename(entry.link, title)
                s3_key = f"{self.s3_prefix}{filename}" if self.s3_prefix else filename

                if self.s3_client:
                    exists_on_s3 = await self.loop.run_in_executor(None, self._s3_object_exists, s3_key)
                    if exists_on_s3:
                        self.seen_articles[article_id] = last_updated
                        continue

                raw_bytes = await self._fetch_and_extract_content(entry.link)
                if not raw_bytes: continue
                
                raw_text_str = raw_bytes.decode("utf-8")
                # refined_text = await self._refine_content_with_llm(raw_text_str)
                refined_text = raw_text_str
                
                self.seen_articles[article_id] = last_updated

                if not refined_text:
                    continue 

                final_bytes = refined_text.encode("utf-8")
                publication_date = pub_date_str or now_utc.isoformat()

                if self.s3_bucket and self.s3_client:
                    await self.loop.run_in_executor(
                        None, self._upload_to_s3, filename, final_bytes, publication_date, entry.link
                    )
                elif self.save_dir:
                    save_path = os.path.join(self.save_dir, filename)
                    with open(save_path, "wb") as f: f.write(final_bytes)
                else:
                    await self.rag_service.ingest_bytes(
                        final_bytes, filename, extra_metadata={"publication_date": publication_date, "source_url": entry.link}
                    )

                had_valid_entries = True
                await asyncio.sleep(1)

            return had_valid_entries

        except Exception as e:
            print(f"Error processing feed {feed_url}: {e}")
            return False

    async def _fetch_and_extract_content(self, url: str) -> bytes | None:
        try:
            response = await self.http_client.get(url)
            response.raise_for_status() 
            text_content = trafilatura.extract(response.text, include_comments=False, include_tables=True)
            if text_content: return text_content.encode("utf-8")
            return None
        except Exception: return None

    def _create_filename(self, url: str, title: str) -> str:
        url_hash = hashlib.md5(url.encode()).hexdigest()
        safe_title = "".join(c for c in title if c.isalnum() or c in " _-").strip()
        safe_title = safe_title[:50].strip().replace(" ", "_")
        return f"rss_{safe_title}_{url_hash}.txt"

    def _upload_to_s3(self, filename: str, raw_bytes: bytes, publication_date: str, source_url: str):
        if not self.s3_client or not self.s3_bucket: raise RuntimeError("S3 client/bucket not configured")
        key = f"{self.s3_prefix}{filename}" if self.s3_prefix else filename
        extra_args = {"Metadata": {"publication_date": publication_date, "source_url": source_url}}
        self.s3_client.put_object(Bucket=self.s3_bucket, Key=key, Body=raw_bytes, **extra_args)

    async def _cleanup_old_s3_files(self, max_age_days: int):
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=max_age_days)
        
        def _do_cleanup():
            paginator = self.s3_client.get_paginator('list_objects_v2')
            deleted_count = 0
            for page in paginator.paginate(Bucket=self.s3_bucket, Prefix=self.s3_prefix):
                if 'Contents' not in page: continue
                for obj in page['Contents']:
                    key = obj['Key']
                    try:
                        head = self.s3_client.head_object(Bucket=self.s3_bucket, Key=key)
                        meta = head.get('Metadata', {})
                        pub_date_str = meta.get('publication_date')
                        
                        file_date = None
                        if pub_date_str:
                            file_date = date_parser.parse(pub_date_str)
                        else:
                            file_date = obj['LastModified']

                        if file_date.tzinfo is None: file_date = file_date.replace(tzinfo=timezone.utc)

                        if file_date < cutoff_date:
                            print(f"Deleting expired S3 file: {key}")
                            self.s3_client.delete_object(Bucket=self.s3_bucket, Key=key)
                            deleted_count += 1
                    except Exception: pass
            return deleted_count

        count = await self.loop.run_in_executor(None, _do_cleanup)
        if count > 0:
            print(f"RSSWatcher: Cleanup finished. Deleted {count} files from S3.")
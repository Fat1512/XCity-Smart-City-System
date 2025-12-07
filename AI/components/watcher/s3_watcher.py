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
import os
from typing import Dict, Set
from pathlib import Path

import boto3

from components.interfaces import BaseWatcher
from service.rag.rag_service import MiniRagService
from service.knowledge_service import KnowledgeService

from components.logging.logger import setup_logger

logger = setup_logger("s3_watcher")

class S3Watcher(BaseWatcher):
    def __init__(
        self,
        bucket_name: str,
        prefix: str = "",
        poll_interval: int = 60,
    ):
        self.bucket_name = bucket_name
        self.prefix = prefix
        self.poll_interval = poll_interval

        self.s3_client = boto3.client("s3")
        self.rag_service: MiniRagService = None
        self.loop: asyncio.AbstractEventLoop = None

        self.state_service = KnowledgeService()
        self._known_keys: Set[str] = set()
        self._processing: Dict[str, float] = {}

    async def start(self, rag_service: MiniRagService, loop: asyncio.AbstractEventLoop):
        self.rag_service = rag_service
        self.loop = loop

        if not self.state_service.is_enabled("s3"):
            logger.info("S3Watcher: DISABLED (knowledge_service is_enabled('s3') = False)")
            return

        logger.info(
            f"S3Watcher: ENABLED. Bucket={self.bucket_name}, Prefix='{self.prefix}', "
            f"Interval={self.poll_interval}s"
        )

        await self._scan_once(initial=True)

        try:
            while True:
                await asyncio.sleep(self.poll_interval)
                await self._scan_once(initial=False)
        except asyncio.CancelledError:
            logger.info("S3Watcher: cancelled, stopping watcher...")
        except Exception as e:
            logger.error(f"S3Watcher: unexpected error in main loop: {e}")

    async def _scan_once(self, initial: bool = False):
        phase = "initial" if initial else "poll"
        logger.info(f"S3Watcher: starting {phase} scan...")

        try:
            all_keys = await self.loop.run_in_executor(
                None,
                self._list_all_keys,
            )

            current_keys = set(all_keys)
            new_keys = current_keys - self._known_keys
            deleted_keys = self._known_keys - current_keys

            for key in new_keys:
                await self._process_new_object(key)

            for key in deleted_keys:
                await self._process_deleted_object(key)

            self._known_keys = current_keys

            logger.info(
                f"S3Watcher: scan done. total={len(current_keys)}, "
                f"new={len(new_keys)}, deleted={len(deleted_keys)}"
            )

        except Exception as e:
            logger.error(f"S3Watcher: error while scanning S3: {e}")

    def _list_all_keys(self):
        keys = []
        continuation_token = None

        while True:
            kwargs = {
                "Bucket": self.bucket_name,
            }
            if self.prefix:
                kwargs["Prefix"] = self.prefix
            if continuation_token:
                kwargs["ContinuationToken"] = continuation_token

            resp = self.s3_client.list_objects_v2(**kwargs)

            contents = resp.get("Contents", [])
            for obj in contents:
                keys.append(obj["Key"])

            if resp.get("IsTruncated"):
                continuation_token = resp.get("NextContinuationToken")
            else:
                break

        return keys

    async def _process_new_object(self, key: str):
        logger.info(f"S3Watcher: new object detected: {key}")

        filename = Path(key).name

        try:
            exists = await self.loop.run_in_executor(
                None,
                self.rag_service.document_exists,
                filename,
            )
            if exists:
                logger.info(f"S3Watcher: document already exists in DB, skip: {filename}")
                return

            obj = await self.loop.run_in_executor(
                None,
                lambda: self.s3_client.get_object(
                    Bucket=self.bucket_name, Key=key
                ),
            )
            body_bytes = obj["Body"].read()

            meta = obj.get("Metadata", {}) or {}
            publication_date = meta.get("publication_date")
            source_url = meta.get("source_url")

            def _ingest():
                extra_metadata = {
                    "s3_bucket": self.bucket_name,
                    "s3_key": key,
                }
                if publication_date:
                    extra_metadata["publication_date"] = publication_date
                if source_url:
                    extra_metadata["source_url"] = source_url

                return self.rag_service.ingest_bytes(
                    raw_bytes=body_bytes,
                    filename=filename,
                    extra_metadata=extra_metadata,
                )

            await self.loop.run_in_executor(None, _ingest)

            logger.info(f"S3Watcher: ingest completed for {filename}")

        except Exception as e:
            logger.error(f"S3Watcher: error ingesting object {key}: {e}")

    async def _process_deleted_object(self, key: str):
            logger.info(f"S3Watcher: Object deleted from S3: {key}")
            
            filename = Path(key).name

            try:
                await self.loop.run_in_executor(
                    None,
                    self.rag_service.delete_document,
                    filename
                )
                logger.info(f"S3Watcher: Removed document '{filename}' from RAG database.")
            except Exception as e:
                logger.error(f"S3Watcher: Error removing document '{filename}': {e}")
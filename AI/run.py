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
import sys
import asyncio
import threading
import os

try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
    print("Using pysqlite3-binary for ChromaDB compatibility")
except ImportError:
    print("Warning: pysqlite3-binary not installed, using system SQLite")

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import knowledge, streams, navigation
from app.ws_traffic import router as ws_traffic_router
from app.ws_flood import router as ws_flood_router

from service.rag.rag_service import MiniRagService
from components.watcher.rss_watcher import RSSWatcher
from components.watcher.s3_watcher import S3Watcher

from components.manager import ToolManager


def initialize_tools():
    tool_manager = ToolManager()
    tool_manager.auto_register_from_package()
    print(f"Registered tools: {[t['name'] for t in tool_manager.list_tools()]}")


async def start_watchers(loop):
    print("Initializing Watchers...")

    rag_service = MiniRagService()
    tasks = []

    s3_bucket = os.getenv("WATCHER_S3_BUCKET")
    s3_prefix = os.getenv("WATCHER_S3_PREFIX", "")
    s3_interval = int(os.getenv("WATCHER_S3_INTERVAL", "60"))

    rss_urls_str = os.getenv("WATCHER_RSS_URLS")
    if rss_urls_str:
        rss_urls = [u.strip() for u in rss_urls_str.split(',') if u.strip()]
        if rss_urls:
            rss_interval = int(os.getenv("WATCHER_RSS_INTERVAL", "3600"))
            rss_watcher = RSSWatcher(
                feed_urls=rss_urls,
                check_interval_seconds=rss_interval,
                save_dir=None,
                s3_bucket=s3_bucket,
                s3_prefix=s3_prefix,
            )
            tasks.append(loop.create_task(rss_watcher.start(rag_service, loop)))

    if s3_bucket:
        print(
            f"Watching S3 bucket: {s3_bucket}, prefix='{s3_prefix}', "
            f"interval={s3_interval}s"
        )
        s3_watcher = S3Watcher(
            bucket_name=s3_bucket,
            prefix=s3_prefix,
            poll_interval=s3_interval,
        )
        tasks.append(loop.create_task(s3_watcher.start(rag_service, loop)))

    if tasks:
        print(f"Running {len(tasks)} watchers...")
        await asyncio.gather(*tasks)



def run_watcher_thread():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(start_watchers(loop))
    loop.close()


def create_app():
    initialize_tools()
    
    app = FastAPI(title="AI API + WS Stream")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api/v1"
    
    app.include_router(knowledge.router, prefix=api_prefix)
    app.include_router(streams.router, prefix=api_prefix)
    app.include_router(navigation.router, prefix=api_prefix)

    app.include_router(ws_traffic_router)
    app.include_router(ws_flood_router)

    @app.get("/")
    async def root():
        return {
            "message": "AI API + WebSocket Stream Server",
            "endpoints": {
                "traffic": {
                    "frontend": "/ws/frontend",
                    "process": "/ws/process",
                    "active_streams": "/ws/active_streams"
                },
                "flood": {
                    "frontend": "/ws/flood/frontend",
                    "process": "/ws/process/flood",
                    "active_streams": "/ws/flood/active_streams"
                }
            }
        }

    return app


app = create_app()

threading.Thread(target=run_watcher_thread, daemon=True).start()
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
from typing import Optional
from fastapi import APIRouter, HTTPException

from service.stream_producer.client_traffic import (
    main as traffic_stream_main,
    DEFAULT_CONFIG_PATH as TRAFFIC_CONFIG_PATH,
    DEFAULT_WS as TRAFFIC_DEFAULT_WS,
)
from service.stream_producer.client_flood import main as flood_stream_main

router = APIRouter(tags=["Streams"])

# Global variables for tasks
traffic_stream_task: Optional[asyncio.Task] = None
flood_stream_task: Optional[asyncio.Task] = None

@router.post("/stream/traffic/start")
async def start_traffic_stream():
    global traffic_stream_task

    if traffic_stream_task and not traffic_stream_task.done():
        raise HTTPException(status_code=400, detail="Traffic stream is already running")

    concurrency = 4
    traffic_stream_task = asyncio.create_task(
        traffic_stream_main(TRAFFIC_CONFIG_PATH, TRAFFIC_DEFAULT_WS, concurrency)
    )

    return {
        "status": "started",
        "config_path": TRAFFIC_CONFIG_PATH,
        "ws_url": TRAFFIC_DEFAULT_WS,
        "concurrency": concurrency,
    }

@router.post("/stream/traffic/stop")
async def stop_traffic_stream():
    global traffic_stream_task
    if not traffic_stream_task or traffic_stream_task.done():
        return {"status": "not_running"}

    traffic_stream_task.cancel()
    return {"status": "stopping"}

@router.get("/stream/traffic/status")
async def traffic_stream_status():
    if traffic_stream_task is None:
        return {"status": "never_started"}
    if traffic_stream_task.cancelled():
        return {"status": "cancelled"}
    if traffic_stream_task.done():
        try:
            traffic_stream_task.result()
            return {"status": "finished", "error": None}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    return {"status": "running"}

@router.post("/stream/flood/start")
async def start_flood_stream():
    global flood_stream_task
    if flood_stream_task and not flood_stream_task.done():
        raise HTTPException(status_code=400, detail="Flood stream is already running")

    flood_stream_task = asyncio.create_task(flood_stream_main())
    return {"status": "started"}

@router.post("/stream/flood/stop")
async def stop_flood_stream():
    global flood_stream_task
    if not flood_stream_task or flood_stream_task.done():
        return {"status": "not_running"}

    flood_stream_task.cancel()
    return {"status": "stopping"}

@router.get("/stream/flood/status")
async def flood_stream_status():
    if flood_stream_task is None:
        return {"status": "never_started"}
    if flood_stream_task.cancelled():
        return {"status": "cancelled"}
    if flood_stream_task.done():
        try:
            flood_stream_task.result()
            return {"status": "finished", "error": None}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    return {"status": "running"}
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
from typing import Optional, Tuple

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os

from app.schemas import *

from service.rag.rag_service import MiniRagService
from service.knowledge_service import KnowledgeService
from service.route_service import RouteService

from service.stream_producer.client_traffic import (
    main as traffic_stream_main,
    DEFAULT_CONFIG_PATH as TRAFFIC_CONFIG_PATH,
    DEFAULT_WS as TRAFFIC_DEFAULT_WS,
)
from service.stream_producer.client_flood import main as flood_stream_main

router = APIRouter()

rag_service = MiniRagService()
watcher_state_service = KnowledgeService()
route_service = RouteService()

traffic_stream_task: Optional[asyncio.Task] = None
flood_stream_task: Optional[asyncio.Task] = None



@router.get("/watcher/status")
def watcher_status():
    try:
        states = watcher_state_service.get_all_states()
        return {"status": "success", "watchers": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watcher/toggle")
def toggle_watcher(payload: dict):
    watcher = payload.get("watcher")
    enabled = payload.get("enabled")

    if watcher not in ["local", "rss"]:
        raise HTTPException(400, "Invalid watcher")

    if not isinstance(enabled, bool):
        raise HTTPException(400, "'enabled' must be boolean")

    watcher_state_service.set_state(watcher, enabled)
    return {"status": "success", "watcher": watcher, "new_state": enabled}


@router.post("/rag/upload")
def rag_upload(file: UploadFile = File(...)):
    watch_dir = os.getenv("WATCHER_LOCAL_PATH")
    if not watch_dir:
        raise HTTPException(500, "WATCHER_LOCAL_PATH not configured")

    save_path = os.path.join(watch_dir, file.filename)
    os.makedirs(watch_dir, exist_ok=True)

    with open(save_path, "wb") as f:
        f.write(file.file.read())

    return {"status": "success", "filename": file.filename}


@router.post("/rag/chat")
def rag_chat(payload: dict):
    query = payload.get("query")
    if not query:
        raise HTTPException(400, "Missing query")

    conversation_id = payload.get("conversation_id")
    res = rag_service.chat(query=query, conversation_id=conversation_id)
    return res


@router.get("/rag/documents")
def rag_list():
    return {"documents": rag_service.list_documents()}


@router.delete("/rag/document")
def rag_delete(payload: dict):
    filename = payload.get("filename")
    if not filename:
        raise HTTPException(400, "Missing filename")

    db_res = rag_service.delete_document(filename)

    watch_dir = os.getenv("WATCHER_LOCAL_PATH")
    if watch_dir:
        fp = os.path.join(watch_dir, filename)
        if os.path.exists(fp):
            os.remove(fp)

    return {"status": "success", "deleted": filename}



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


@router.post("/route")
async def compute_route(payload: RouteRequest):
    try:
        geojson = route_service.compute_route(payload.start, payload.end)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute route: {e}")

    if isinstance(geojson, dict) and geojson.get("error"):
        raise HTTPException(status_code=400, detail=geojson["error"])

    return geojson
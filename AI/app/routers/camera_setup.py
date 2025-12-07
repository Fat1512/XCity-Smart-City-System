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
import os
import cv2
import json
import uuid
import numpy as np
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

from components.manager import ConfigManager

router = APIRouter(tags=["Camera Setup"])
config_manager = ConfigManager()

class CameraConfigPayload(BaseModel):
    stream_id: str
    video_path: str
    address: str
    image_pts: List[List[int]]
    real_width: float
    real_height: float
    limit_fps: int = 5
    classes: List[int] = [2, 3, 5, 7]

@router.get("/setup/videos")
def list_videos():
    files = [f for f in os.listdir(".") if f.endswith(".mp4")]
    return {"videos": files}

@router.get("/setup/snapshot")
def get_video_snapshot(video_path: str):
    if not os.path.exists(video_path):
        raise HTTPException(404, "Video not found")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(400, "Cannot open video")

    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise HTTPException(400, "Cannot read frame from video")

    ret, jpeg = cv2.imencode('.jpg', frame)
    if not ret:
        raise HTTPException(500, "Image encoding failed")

    return Response(content=jpeg.tobytes(), media_type="image/jpeg")

@router.post("/setup/save")
def save_camera_config(payload: CameraConfigPayload):
    w = payload.real_width
    h = payload.real_height
    
    world_pts = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h]
    ]

    config_data = {
        "stream_id": payload.stream_id,
        "video_path": payload.video_path,
        "address": payload.address,
        "limit_fps": payload.limit_fps,
        "image_pts": payload.image_pts,
        "world_pts": world_pts,
        "classes": payload.classes,
        "conf": 0.35,
        "tracker_cfg": "bytetrack.yaml",
        "segment_ids": [str(uuid.uuid4().int)[:10]] 
    }

    try:
        config_manager.upsert_stream(config_data)
        return {"status": "success", "message": "Configuration saved", "config": config_data}
    except Exception as e:
        raise HTTPException(500, f"Failed to save config: {str(e)}")
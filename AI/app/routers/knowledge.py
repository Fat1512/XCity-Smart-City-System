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
import boto3
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import *
from service.rag.rag_service import MiniRagService
from service.knowledge_service import KnowledgeService

router = APIRouter(tags=["Knowledge & RAG"])

# Khởi tạo Service
rag_service = MiniRagService()
watcher_state_service = KnowledgeService()
s3_client = boto3.client("s3")

@router.get("/watcher/status")
def watcher_status():
    try:
        states = watcher_state_service.get_all_states()
        rss_urls = watcher_state_service.get_rss_urls()
        max_age = watcher_state_service.get_rss_max_age_days()
        
        return {
            "status": "success", 
            "watchers": states,
            "rss_config": {
                "urls": rss_urls,
                "max_age_days": max_age
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/watcher/toggle")
def toggle_watcher(payload: dict):
    watcher = payload.get("watcher")
    enabled = payload.get("enabled")

    if watcher not in ["local", "rss", "s3"]:
        raise HTTPException(400, "Invalid watcher")

    if not isinstance(enabled, bool):
        raise HTTPException(400, "'enabled' must be boolean")

    watcher_state_service.set_state(watcher, enabled)
    return {"status": "success", "watcher": watcher, "new_state": enabled}

@router.post("/rag/upload")
async def rag_upload(file: UploadFile = File(...)):
    bucket_name = os.getenv("WATCHER_S3_BUCKET")
    if not bucket_name:
        raise HTTPException(500, "WATCHER_S3_BUCKET environment variable is not set")

    prefix = os.getenv("WATCHER_S3_PREFIX", "")
    s3_key = f"{prefix}{file.filename}"

    try:
        file_content = await file.read()
        s3_client.put_object(Bucket=bucket_name, Key=s3_key, Body=file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to S3: {str(e)}")

    return {
        "status": "success", 
        "filename": file.filename, 
        "s3_bucket": bucket_name, 
        "s3_key": s3_key,
        "message": "File uploaded to S3. RAG ingestion will start automatically via S3Watcher."
    }

@router.delete("/rag/s3/document")
def rag_delete_s3(payload: dict):
    filename = payload.get("filename")
    if not filename:
        raise HTTPException(400, "Missing filename")

    bucket_name = os.getenv("WATCHER_S3_BUCKET")
    if not bucket_name:
        raise HTTPException(500, "WATCHER_S3_BUCKET environment variable is not set")
    
    prefix = os.getenv("WATCHER_S3_PREFIX", "")
    target_key = f"{prefix}{filename}"

    try:
        s3_client.delete_object(Bucket=bucket_name, Key=target_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from S3: {str(e)}")

    return {
        "status": "success", 
        "deleted_s3_key": target_key,
        "message": "File deleted from S3. S3Watcher will remove it from RAG DB shortly."
    }

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

@router.get("/rss/urls")
def get_rss_urls():
    return {"urls": watcher_state_service.get_rss_urls()}

@router.post("/rss/urls")
def add_rss_url(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(400, "Missing 'url'")
    if not url.startswith("http"):
        raise HTTPException(400, "Invalid URL")

    added = watcher_state_service.add_rss_url(url)
    return {
        "status": "success", 
        "message": "URL added" if added else "URL already exists", 
        "url": url
    }

@router.delete("/rss/urls")
def remove_rss_url(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(400, "Missing 'url'")

    removed = watcher_state_service.remove_rss_url(url)
    if not removed:
        raise HTTPException(404, "URL not found")
        
    return {"status": "success", "message": "URL removed", "url": url}

@router.post("/rss/config/age")
def set_rss_max_age(payload: dict):
    days = payload.get("days")
    if not isinstance(days, int) or days < 1:
        raise HTTPException(400, "Days must be a positive integer")
    
    watcher_state_service.set_rss_max_age_days(days)
    return {"status": "success", "message": f"RSS Max Age set to {days} days"}
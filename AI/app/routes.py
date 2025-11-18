from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
from service.mini_rag_service import MiniRagService
from service.knowledge_service import KnowledgeService

router = APIRouter()
rag_service = MiniRagService()
watcher_state_service = KnowledgeService()


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

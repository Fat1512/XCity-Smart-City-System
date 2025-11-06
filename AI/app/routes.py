from flask import Blueprint, request, jsonify
import os

from werkzeug.utils import secure_filename

from service.mini_rag_service import MiniRagService 
from service.knowledge_service import KnowledgeService


bp = Blueprint("ai-api", __name__, url_prefix="/api")


rag_service = MiniRagService()
watcher_state_service = KnowledgeService()


@bp.route("/watcher/status", methods=["GET"])
def get_watcher_status():
    try:
        states = watcher_state_service.get_all_states()
        return jsonify({"status": "success", "watchers": states})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@bp.route("/watcher/toggle", methods=["POST"])
def toggle_watcher():
    data = request.json
    watcher_name = data.get("watcher")
    enabled_state = data.get("enabled")

    if watcher_name not in ["local", "rss"]:
        return jsonify({"status": "error", "message": "Invalid 'watcher' name. Must be 'local' or 'rss'."}), 400

    if not isinstance(enabled_state, bool):
        return jsonify({"status": "error", "message": "'enabled' field must be a boolean (true or false)."}), 400

    try:
        watcher_state_service.set_state(watcher_name, enabled_state)
        return jsonify({
            "status": "success",
            "watcher": watcher_name,
            "new_state": enabled_state
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



    
    
@bp.route("/rag/upload", methods=["POST"])
def upload_document():
    watch_dir = os.getenv("WATCHER_LOCAL_PATH", None)
    if not watch_dir:
        return jsonify({"error": "Server error: WATCHER_LOCAL_PATH not configured."}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        save_path = os.path.join(watch_dir, filename)

        try:
            os.makedirs(watch_dir, exist_ok=True)
        except Exception as e:
            return jsonify({"error": f"Cannot create watch directory: {e}"}), 500
        
        try:
            file.save(save_path)
            
            return jsonify({
                "status": "success", 
                "filename": filename,
                "message": "File saved to watch directory. Ingest process will start automatically."
            })

        except Exception as e:
            return jsonify({"error": f"Cannot save file {filename}: {e}"}), 500


@bp.route("/rag/chat", methods=["POST"])
def rag_chat():
    data = request.json
    query = data.get("query")
    conversation_id = data.get("conversation_id", None)

    if not query:
        return jsonify({"error": "Missing 'query'"}), 400
    
    res = rag_service.chat(query=query, conversation_id=conversation_id)
    return jsonify(res)


@bp.route("/rag/documents", methods=["GET"])
def list_all_documents():
    try:
        documents = rag_service.list_documents()
        return jsonify({"documents": documents})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/rag/document", methods=["DELETE"])
def delete_one_document():
    data = request.json
    filename_from_request = data.get("filename")
    
    if not filename_from_request:
        return jsonify({"error": "Missing 'filename' in request body"}), 400
    
    filename = secure_filename(filename_from_request)
    if filename != filename_from_request:
        return jsonify({"error": "Invalid filename format."}), 400

    db_result = {}
    file_result = {}
    
    try:
        db_result = rag_service.delete_document(filename)
    except Exception as e:
        db_result = {"error": f"Error deleting from DB: {e}"}

    watch_dir = os.getenv("WATCHER_LOCAL_PATH", None)
    if not watch_dir:
        file_result = {"status": "skipped", "message": "WATCHER_LOCAL_PATH not configured, cannot delete local file."}
    else:
        try:
            file_path = os.path.join(watch_dir, filename)
            
            if os.path.exists(file_path) and os.path.isfile(file_path):
                os.remove(file_path)
                file_result = {"status": "deleted", "filename": filename}
            else:
                file_result = {"status": "not_found", "message": "Local file not found for deletion."}
        
        except Exception as e:
            file_result = {"error": f"Error deleting local file {filename}: {e}"}

    return jsonify({
        "database_status": db_result,
        "filesystem_status": file_result
    })
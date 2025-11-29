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
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from dateutil import parser as date_parser
import uuid
import os
import json

from components.manager import EmbeddingManager
from langchain_text_splitters import RecursiveCharacterTextSplitter
from components.manager import ReaderManager
from components.manager import DatabaseManager
from components.manager import PromptManager
from components.manager import GenerationManager
from components.manager import ToolManager

from service.guardrail_service import RAGGuardrailService
from service.history_service import RedisHistoryService


import re
COORD_PAIR_RE = re.compile(
    r"(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)"
)

def parse_two_coord_pairs(text: str):
    matches = COORD_PAIR_RE.findall(text)
    if len(matches) < 2:
        return None
    try:
        a = matches[0]
        b = matches[1]
        c1 = (float(a[0]), float(a[1]))
        c2 = (float(b[0]), float(b[1]))
        return c1, c2
    except Exception:
        return None


class MiniRagService:
    def __init__(self, collection_name="rag_documents"):
        self.embedder = EmbeddingManager()
        self.reader_manager = ReaderManager()
        self.db = DatabaseManager()
        self.collection_name = collection_name

        self.rag_guardrails = RAGGuardrailService()
        self.history_service = RedisHistoryService()

        self.rag_prompts = PromptManager()
        self.rag_llm = GenerationManager()

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        print("MiniRag initialized.")

    def chat(self, query: str, conversation_id: int = None):
        if not self.history_service.is_available:
            return {"error": "Server error: Chat history service (Redis) is unavailable."}
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            print(f"Starting new conversation: {conversation_id}")
        history_list = self.history_service.load_history(conversation_id)
        K_TURNS = int(os.getenv("K_TURNS", 5))
        recent_history_list = history_list[-K_TURNS:]
        history_string = ""
        for turn in recent_history_list:
            history_string += f"Người dùng: {turn['query']}\nTrợ lý: {turn['answer']}\n\n"


        intent, router_tokens = self.rag_guardrails.route_intent(query)

        coord_pairs = parse_two_coord_pairs(query)

        if intent == "ROUTE" or coord_pairs:
            if coord_pairs:
                start, end = coord_pairs
            else:
                return {"answer": "Bạn muốn tính đường — vui lòng cung cấp hai tọa độ theo định dạng: lat,lon ví dụ 10.7769,106.7009 -> 10.78,106.71."}

            tm = ToolManager()
            try:
                tm.auto_register_from_package()
            except Exception:
                pass

            if "route_tool" not in tm.tools:
                return {"answer": "Chức năng tính đường chưa được bật trên hệ thống."}

            try:
                geojson = tm.execute("route_tool", start, end)
            except Exception as e:
                return {"answer": f"Không thể tính đường: {e}"}

            prompt = (
                f"Người dùng: {query}\n\n"
                "Bạn là trợ lý bằng tiếng Việt. Dưới đây là kết quả route (GeoJSON FeatureCollection):\n"
                f"{json.dumps(geojson, ensure_ascii=False)}\n\n"
                "Hãy tóm tắt ngắn gọn (2-3 câu): 1) Tổng thời gian ước tính (phút), 2) Tổng khoảng cách (m), 3) Bắt đầu và kết thúc. Trả bằng tiếng Việt."
            )
            answer = self.rag_llm.generate(prompt)
            summary_text = answer.get("text")

            history_list.append({"query": query, "answer": answer})
            self.history_service.save_history(conversation_id, history_list)

            return {
                "answer": summary_text,
                "tool_result": geojson,
                "conversation_id": conversation_id
            }

        if intent == "GREETING":
            try:
                greeting_prompt = self.rag_prompts.load("greeting_response", query=query)
                final_prompt_with_history = f"{history_string}{greeting_prompt}"
                response = self.rag_llm.generate(final_prompt_with_history)
                answer = response.get("text", "Xin chào! Tôi có thể giúp gì cho bạn?")
                
                history_list.append({"query": query, "answer": answer})
                self.history_service.save_history(conversation_id, history_list)
                
                return {
                    "answer": answer,
                    "token_usage": {
                        "prompt_tokens": response.get("prompt_tokens", 0),
                        "completion_tokens": response.get("completion_tokens", 0),
                        "total_tokens": response.get("total_tokens", 0)
                    },
                    "conversation_id": conversation_id
                }
            except Exception as e:
                return {"error": f"Could not load greeting_response prompt: {e}"}

        elif intent == "META_QUERY":
            try:
                meta_prompt_template = self.rag_prompts.load("meta_info")
                final_prompt_with_history = f"{history_string}{meta_prompt_template}\n\nCâu hỏi của người dùng: {query}\nCâu trả lời của bạn:"
                response = self.rag_llm.generate(final_prompt_with_history)
                answer = response.get("text", "Tôi là một trợ lý AI.")
                
                history_list.append({"query": query, "answer": answer})
                self.history_service.save_history(conversation_id, history_list)
                
                return {
                    "answer": answer,
                    "token_usage": {
                        "prompt_tokens": response.get("prompt_tokens", 0),
                        "completion_tokens": response.get("completion_tokens", 0),
                        "total_tokens": response.get("total_tokens", 0)
                    },
                    "conversation_id": conversation_id
                }
            except Exception as e:
                return {"error": f"Could not load meta_info prompt: {e}"}
        elif intent == "OUT_OF_DOMAIN":
            try:
                answer = "Tôi xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến chủ đề sức khỏe và dinh dưỡng. Bạn có câu hỏi nào khác về chủ đề này không?"

                history_list.append({"query": query, "answer": answer})
                self.history_service.save_history(conversation_id, history_list)

                return {
                    "answer": answer,
                    "token_usage": router_tokens,
                    "conversation_id": conversation_id
                }
            except Exception as e:
                return {"error": f"Error handling OUT_OF_DOMAIN: {e}"}

        else:
            print(f"Executing RAG query for: {query}")
            context_chunks = self.retrieve_context(query, n_results=3)
            
            is_valid, failure_answer = self.rag_guardrails.check_retrieval(context_chunks)

            if not is_valid:
                history_list.append({"query": query, "answer": failure_answer})
                self.history_service.save_history(conversation_id, history_list)
                
                return {
                    "answer": failure_answer,
                    "token_usage": router_tokens,
                    "conversation_id": conversation_id
                }

            context_str = "\n\n---\n\n".join(context_chunks)
            
            try:
                chat_prompt = self.rag_prompts.load(
                    "rag_chat",
                    context=context_str,
                    query=query
                )
            except Exception as e:
                return {"error": f"Could not load rag_chat prompt: {e}"}, 500

            final_prompt_with_history = f"{history_string}{chat_prompt}"
            
            response = self.rag_llm.generate(final_prompt_with_history)
            answer = response.get("text", "Error generating response.")
            
            history_list.append({"query": query, "answer": answer})
            self.history_service.save_history(conversation_id, history_list)
            
            return {
                "answer": answer,
                "token_usage": {
                    "prompt_tokens": response.get("prompt_tokens", 0),
                    "completion_tokens": response.get("completion_tokens", 0),
                    "total_tokens": response.get("total_tokens", 0)
                },
                "conversation_id": conversation_id
            }

    def ingest_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        text, error = self.reader_manager.read_file(file_path)
        if error:
            return {"error": error, "filename": filename}
        
        return self._process_and_store_text(text, filename, extra_metadata=None)

    def ingest_bytes(self, raw_bytes: bytes, filename: str, extra_metadata: dict = None) -> Dict[str, Any]:
        try:
            text = raw_bytes.decode('utf-8')
        except Exception as e:
            return {"error": f"Error decoding bytes: {e}", "filename": filename}
        
        return self._process_and_store_text(text, filename, extra_metadata)

    def _process_and_store_text(self, text: str, filename: str, extra_metadata: dict = None) -> Dict[str, Any]:
        chunks = self.text_splitter.split_text(text)
        print(f"Split '{filename}' into {len(chunks)} chunks.")

        embeddings = self.embedder.vectorize(chunks)

        ids = [f"{filename}_{i}" for i in range(len(chunks))]
        metadatas = []
        for i in range(len(chunks)):
            meta = {"source": filename, "chunk_index": i}
            if extra_metadata:
                meta.update(extra_metadata)
            metadatas.append(meta)
        
        documents = chunks
        
        self.db.delete(
            collection_name=self.collection_name,
            where_filter={"source": filename}
        )
        
        self.db.add(
            collection_name=self.collection_name,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Successfully ingested and vectorized file: {filename}")
        return {
            "status": "success",
            "filename": filename,
            "chunks_added": len(chunks)
        }

    def retrieve_context(self, query: str, n_results: int = 3) -> List[str]:
        query_vector = self.embedder.vectorize_single(query)
        results = self.db.query(
            collection_name=self.collection_name,
            query_embeddings=[query_vector],
            n_results=n_results
        )
        
        return results.get("documents", [[]])[0]

    def list_documents(self) -> List[str]:
        print("Listing unique documents...")
        unique_files = self.db.get_unique_metadata_values(
            self.collection_name, 
            "source"
        )
        return sorted(list(unique_files))

    def delete_document(self, filename: str) -> Dict[str, Any]:
        print(f"Attempting to delete document: {filename}")
        try:
            self.db.delete(
                collection_name=self.collection_name,
                where_filter={"source": filename}
            )
            print(f"Successfully deleted document: {filename}")
            return {"status": "deleted", "filename": filename}
        except Exception as e:
            print(f"Error deleting document {filename}: {e}")
            return {"error": str(e), "filename": filename}

    def document_exists(self, filename: str) -> bool:
        results = self.db.get_unique_metadata_values(self.collection_name, "source")
        return filename in results

    def delete_documents_older_than(self, prefix: str, days: int):
        if days <= 0:
            print(f"Stale document deletion is disabled (days={days}).")
            return 0
        
        if date_parser is None:
            print("Cannot delete old files: 'python-dateutil' is not installed.")
            return 0

        try:
            cutoff_dt = datetime.now(timezone.utc) - timedelta(days=days)
            print(f"Deleting documents with prefix '{prefix}' published before {cutoff_dt.isoformat()}...")

            db_data = self.db.get_all(
                collection_name=self.collection_name,
                include=["metadatas"]
            )

            all_metadatas = db_data.get('metadatas', [])
            if not all_metadatas:
                print("No documents found in the collection. Nothing to check.")
                return 0

            document_dates = {}
            
            for meta in all_metadatas:
                filename = meta.get("source")
                pub_date_str = meta.get("publication_date")

                if not filename or not pub_date_str:
                    continue
                
                if not filename.startswith(prefix):
                    continue
                    
                try:
                    pub_date_dt = date_parser.parse(pub_date_str)
                    if pub_date_dt.tzinfo is None:
                        pub_date_dt = pub_date_dt.replace(tzinfo=timezone.utc)
                except Exception as e:
                    print(f"Skipping check for {filename}: Cound not parse date '{pub_date_str}'. Error: {e}")
                    continue

                if filename not in document_dates:
                    document_dates[filename] = pub_date_dt

            if not document_dates:
                print(f"No documents with prefix '{prefix}' and valid 'publication_date' found.")
                return 0

            print(f"Found {len(document_dates)} document(s) with prefix '{prefix}'. Checking publication dates...")

            deleted_count = 0
            for filename, pub_date in document_dates.items():
                if pub_date < cutoff_dt:
                    print(f"🗑️ Deleting stale file: {filename} (Published: {pub_date.isoformat()})")
                    self.delete_document(filename)
                    deleted_count += 1


            print(f"Stale document check complete. Deleted {deleted_count} document(s).")
            return deleted_count

        except Exception as e:
            print(f"Error in delete_documents_older_than: {e}")
            return 0
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
from datetime import datetime
import os
from typing import Any, Dict, List
import pytz
from .base_intent import BaseIntent
from components.manager import RerankerManager, ToolManager
from components.logging.logger import setup_logger

logger = setup_logger("rag_intent")

class RagIntent(BaseIntent):
    name = "RAG_CHAT"

    def __init__(self):
        self.reranker_manager = RerankerManager()
        self.tool_manager = ToolManager()

    def handles(self, intent: str) -> bool:
        return True

    def handle(
        self,
        query: str,
        intent: str,
        service,
        history_string: str,
        history_list: List[Dict[str, Any]],
        conversation_id: str,
        router_tokens: Dict[str, Any],
    ) -> Dict[str, Any]:
        logger.info(f"Handling RAG intent for query: {query}")

        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        
        days_map = {0: "Hai", 1: "Ba", 2: "Tư", 3: "Năm", 4: "Sáu", 5: "Bảy", 6: "Chủ Nhật"}
        current_date_str = now.strftime("%d/%m/%Y")
        current_weekday = days_map[now.weekday()]
        current_time_str = now.strftime("%H:%M")
        
        full_time_display = f"Thứ {current_weekday}, {current_date_str} {current_time_str}"

        local_search_query = query
        if "xcity" in query.lower():
            local_search_query = f"{query} thành phố hồ chí minh sài gòn"

        web_search_query = local_search_query

        time_keywords = ["hôm nay", "qua", "kia", "tuần", "tháng", "nay", "giờ", "mới nhất", "hiện tại", "sáng", "chiều", "tối"]
        has_time_intent = any(kw in query.lower() for kw in time_keywords)

        if has_time_intent:
            try:
                logger.info("Detected temporal keywords. Calling LLM to resolve date for Web Search...")
                date_prompt = service.rag_prompts.load(
                    "rewrite_date_query",
                    current_date=current_date_str,
                    weekday=current_weekday,
                    query=query
                )
                rw_resp = service.rag_llm.generate(date_prompt)
                rewritten = rw_resp.get("text", "").strip().replace('"', '')
                logger.info(f"Original: '{query}' -> Rewritten for Web: '{rewritten}'")
                web_search_query = rewritten
            except Exception as e:
                logger.error(f"Error resolving date: {e}")
                web_search_query = f"{local_search_query} ngày {current_date_str}"
        
        initial_objects = service.retrieve_context(local_search_query, n_results=int(os.getenv("TOP_R", 20)))
        
        initial_texts = []
        if initial_objects and isinstance(initial_objects[0], dict):
            initial_texts = [obj["text"] for obj in initial_objects]
        else:
            initial_texts = initial_objects 
        
        context_chunks = []
        final_sources = []
        source_type = "LOCAL_DB"

        if initial_texts:
            ranked_texts = self.reranker_manager.rerank(
                query=query, 
                documents=initial_texts, 
                top_k=int(os.getenv("TOP_K", 5)),
                threshold=float(os.getenv("RERANK_THRESHOLD", 0.0))
            )
            
            if ranked_texts:
                context_chunks = ranked_texts
                
                if initial_objects and isinstance(initial_objects[0], dict):
                    for text in ranked_texts:
                        for obj in initial_objects:
                            if obj["text"] == text:
                                meta = obj.get("metadata", {})
                                title = meta.get("title") or os.path.basename(str(meta.get("source", "Tài liệu nội bộ")))
                                url = meta.get("source_url") or meta.get("source", "")
                                
                                final_sources.append({
                                    "title": title,
                                    "url": url,
                                    "type": "local"
                                })
                                break
            else:
                logger.info("Reranker filtered out all local documents (Low relevance).")

        if not context_chunks:
            logger.info(f"Fallback to Web Search with query: {web_search_query}")
            
            try:
                web_result = self.tool_manager.execute(
                    "web_search", 
                    query=web_search_query, 
                    max_results=3
                )
                
                if isinstance(web_result, dict):
                    if web_result.get("context"):
                        context_chunks = [web_result["context"]]
                        final_sources = web_result.get("sources", []) # Lấy nguồn từ WebSearchTool
                        source_type = "WEB_SEARCH"
                    else:
                        source_type = "LLM_KNOWLEDGE"
                elif isinstance(web_result, str) and web_result:
                    context_chunks = [web_result]
                    source_type = "WEB_SEARCH"
                else:
                    logger.info("Web search returned empty result.")
                    source_type = "LLM_KNOWLEDGE"

            except Exception as e:
                logger.error(f"Web Search Tool failed: {e}")
                source_type = "LLM_KNOWLEDGE"

        raw_context_str = "\n\n---\n\n".join(context_chunks)
        final_context = f"NGUỒN DỮ LIỆU: {source_type}\n\n{raw_context_str}"

        if source_type == "LOCAL_DB":
            is_valid, failure_answer = service.rag_guardrails.check_retrieval(context_chunks)
            if not is_valid:
                history_list.append({"query": query, "answer": failure_answer})
                service.history_service.save_history(conversation_id, history_list)
                return {
                    "answer": failure_answer,
                    "token_usage": router_tokens,
                    "conversation_id": conversation_id,
                }

        try:
            chat_prompt = service.rag_prompts.load(
                "rag_chat", 
                context=final_context, 
                query=query,
                current_time=full_time_display
            )
        except Exception as e:
            return {"error": f"Prompt Error: {e}", "conversation_id": conversation_id}

        final_prompt_with_history = f"{history_string}{chat_prompt}"

        response = service.rag_llm.generate(final_prompt_with_history)
        answer = response.get("text", "Error generating response.")

        history_list.append({"query": query, "answer": answer})
        service.history_service.save_history(conversation_id, history_list)

        return {
            "answer": answer,
            "sources": final_sources,
            "token_usage": {
                "prompt_tokens": response.get("prompt_tokens", 0),
                "completion_tokens": response.get("completion_tokens", 0),
                "total_tokens": response.get("total_tokens", 0),
            },
            "conversation_id": conversation_id,
        }
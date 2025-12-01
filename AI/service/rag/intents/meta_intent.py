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
from typing import Any, Dict, List

from .base_intent import BaseIntent


class MetaIntent(BaseIntent):
    name = "META_QUERY"

    def handles(self, intent: str) -> bool:
        return intent == self.name

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
        try:
            meta_prompt_template = service.rag_prompts.load("meta_info")
            final_prompt_with_history = (
                f"{history_string}{meta_prompt_template}\n\n"
                f"Câu hỏi của người dùng: {query}\n"
                f"Câu trả lời của bạn:"
            )
            response = service.rag_llm.generate(final_prompt_with_history)
            answer = response.get("text", "Tôi là một trợ lý AI.")

            history_list.append({"query": query, "answer": answer})
            service.history_service.save_history(conversation_id, history_list)

            return {
                "answer": answer,
                "token_usage": {
                    "prompt_tokens": response.get("prompt_tokens", 0),
                    "completion_tokens": response.get("completion_tokens", 0),
                    "total_tokens": response.get("total_tokens", 0),
                },
                "conversation_id": conversation_id,
            }
        except Exception as e:
            return {
                "error": f"Could not load meta_info prompt: {e}",
                "conversation_id": conversation_id,
            }

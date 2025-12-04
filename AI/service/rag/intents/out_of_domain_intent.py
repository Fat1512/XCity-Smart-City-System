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


class OutOfDomainIntent(BaseIntent):
    name = "OUT_OF_DOMAIN"

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
            answer = (
                "Tôi xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến "
                "thành phố. Bạn có câu hỏi nào khác về chủ đề này không?"
            )

            history_list.append({"query": query, "answer": answer})
            service.history_service.save_history(conversation_id, history_list)

            return {
                "answer": answer,
                "token_usage": router_tokens,
                "conversation_id": conversation_id,
            }
        except Exception as e:
            return {
                "error": f"Error handling OUT_OF_DOMAIN: {e}",
                "conversation_id": conversation_id,
            }

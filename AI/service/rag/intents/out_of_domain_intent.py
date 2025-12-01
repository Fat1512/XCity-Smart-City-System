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
                "chủ đề sức khỏe và dinh dưỡng. Bạn có câu hỏi nào khác về chủ đề này không?"
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

from typing import Any, Dict, List

from .base_intent import BaseIntent


class GreetingIntent(BaseIntent):
    name = "GREETING"

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
            greeting_prompt = service.rag_prompts.load(
                "greeting_response", query=query
            )
            final_prompt_with_history = f"{history_string}{greeting_prompt}"
            response = service.rag_llm.generate(final_prompt_with_history)
            answer = response.get("text", "Xin chào! Tôi có thể giúp gì cho bạn?")

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
                "error": f"Could not load greeting_response prompt: {e}",
                "conversation_id": conversation_id,
            }

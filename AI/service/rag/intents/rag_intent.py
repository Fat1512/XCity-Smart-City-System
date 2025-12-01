from typing import Any, Dict, List

from .base_intent import BaseIntent


class RagIntent(BaseIntent):
    name = "RAG_CHAT"

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
        service.logger = service.__dict__.get("logger", None)  # không bắt buộc

        context_chunks = service.retrieve_context(query, n_results=3)

        is_valid, failure_answer = service.rag_guardrails.check_retrieval(
            context_chunks
        )

        if not is_valid:
            history_list.append({"query": query, "answer": failure_answer})
            service.history_service.save_history(conversation_id, history_list)

            return {
                "answer": failure_answer,
                "token_usage": router_tokens,
                "conversation_id": conversation_id,
            }

        context_str = "\n\n---\n\n".join(context_chunks)

        try:
            chat_prompt = service.rag_prompts.load(
                "rag_chat", context=context_str, query=query
            )
        except Exception as e:
            return {
                "error": f"Could not load rag_chat prompt: {e}",
                "conversation_id": conversation_id,
            }

        final_prompt_with_history = f"{history_string}{chat_prompt}"

        response = service.rag_llm.generate(final_prompt_with_history)
        answer = response.get("text", "Error generating response.")

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
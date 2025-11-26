from components.manager import GenerationManager, PromptManager
from components.logging.logger import setup_logger
from typing import List, Dict, Any, Tuple

logger = setup_logger("guardrail_service")

class RAGGuardrailService:
    def __init__(self):
        self.llm = GenerationManager()
        self.prompts = PromptManager()
        logger.info("RAGGuardrailService initialized.")

    def route_intent(self, query: str) -> Tuple[str, Dict[str, Any]]:
        try:
            router_prompt_str = self.prompts.load("router_prompt", query=query)
            router_response = self.llm.generate(router_prompt_str)
            intent = router_response.get("text").strip().upper()
            
            router_tokens = {
                "prompt_tokens": router_response.get("prompt_tokens", 0),
                "completion_tokens": router_response.get("completion_tokens", 0),
                "total_tokens": router_response.get("total_tokens", 0)
            }
            
            if "GREETING" in intent:
                return "GREETING", router_tokens
            if "META_QUERY" in intent:
                return "META_QUERY", router_tokens
            if "OUT_OF_DOMAIN" in intent:
                logger.info(f"Guardrail triggered: Out-of-domain query detected. Query: '{query}'")
                return "OUT_OF_DOMAIN", router_tokens
            if "ROUTE" in intent:
                return "ROUTE", router_tokens
            
            return "RAG_QUERY", router_tokens
            
        except Exception as e:
            logger.info(f"Error in intent routing: {e}. Defaulting to RAG_QUERY.")
            return "RAG_QUERY", {}

    def check_retrieval(self, context_chunks: List[str]) -> Tuple[bool, str]:
        if not context_chunks:
            answer = "I couldn't find this information in the documents. Could you please clarify your question?"
            return False, answer
            
        return True, ""
from typing import Any, Dict, List


class BaseIntent:
    name: str = ""

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
        raise NotImplementedError

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
from typing import Any, Dict, List, TYPE_CHECKING
if TYPE_CHECKING:
    from service.rag.rag_service import MiniRagService

class BaseIntent:
    name: str = ""

    def handles(self, intent: str) -> bool:
        return intent == self.name

    def handle(
        self,
        query: str,
        intent: str,
        service: "MiniRagService",
        history_string: str,
        history_list: List[Dict[str, Any]],
        conversation_id: str,
        router_tokens: Dict[str, Any],
    ) -> Dict[str, Any]:
        raise NotImplementedError

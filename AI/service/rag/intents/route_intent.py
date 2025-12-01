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

from components.manager import ToolManager
from .base_intent import BaseIntent
import json


class RouteIntent(BaseIntent):
    name = "ROUTE"

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
        # dùng helper của service để parse tọa độ
        coord_pairs = service.parse_two_coord_pairs(query)

        if not coord_pairs:
            # giống logic cũ: intent ROUTE nhưng không có 2 cặp tọa độ
            return {
                "answer": (
                    "Bạn muốn tính đường — vui lòng cung cấp hai tọa độ theo định dạng: "
                    "lat,lon ví dụ 10.7769,106.7009 -> 10.78,106.71."
                ),
                "conversation_id": conversation_id,
            }

        start, end = coord_pairs

        tm = ToolManager()
        try:
            tm.auto_register_from_package()
        except Exception:
            # nếu auto register fail vẫn tiếp tục, sẽ check route_tool tồn tại bên dưới
            pass

        if "route_tool" not in tm.tools:
            return {
                "answer": "Chức năng tính đường chưa được bật trên hệ thống.",
                "conversation_id": conversation_id,
            }

        try:
            geojson = tm.execute("route_tool", start, end)
        except Exception as e:
            return {
                "answer": f"Không thể tính đường: {e}",
                "conversation_id": conversation_id,
            }

        try:
            geojson_str = json.dumps(geojson, ensure_ascii=False)
            route_prompt = service.rag_prompts.load(
                "route_summary",
                query=query,
                geojson=geojson_str,
                history=history_string,
            )
        except Exception as e:
            return {
                "error": f"Could not load route_summary prompt: {e}",
                "conversation_id": conversation_id,
            }

        response = service.rag_llm.generate(route_prompt)
        summary_text = response.get("text", "Đã tính xong lộ trình.")

        history_list.append({"query": query, "answer": summary_text})
        service.history_service.save_history(conversation_id, history_list)

        return {
            "answer": summary_text,
            "tool_result": geojson,
            "conversation_id": conversation_id,
        }

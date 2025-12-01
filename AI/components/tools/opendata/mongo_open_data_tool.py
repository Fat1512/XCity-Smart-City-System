from typing import Any, Dict, Optional
import os

from pymongo import MongoClient
from bson import ObjectId

from components.interfaces import Tool


class MongoOpenDataTool(Tool):
    name = "mongo_open_data_tool"
    description = (
        "Truy vấn dữ liệu mở (open data) được lưu trong MongoDB "
        "bằng các filter đơn giản dạng {field: value}."
    )
    category = "open_data"
    enabled = True

    def __init__(self):
        # Config qua env cho linh hoạt
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGO_DB_OPEN_DATA", "open_data")
        coll_name = os.getenv("MONGO_COLLECTION_OPEN_DATA", "records")

        self.client = MongoClient(uri)
        self.collection = self.client[db_name][coll_name]

    def _convert_id(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                out[k] = str(v)
            else:
                out[k] = v
        return out

    def validate_input(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc",
    ) -> Optional[str]:
        if limit <= 0 or limit > 100:
            return "limit must be between 1 and 100"
        if sort_dir not in ("asc", "desc"):
            return "sort_dir must be 'asc' or 'desc'"
        if filters is not None and not isinstance(filters, dict):
            return "filters must be an object/dict"
        return None

    def call(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
        sort_by: Optional[str] = None,
        sort_dir: str = "desc",
    ) -> Dict[str, Any]:
        mongo_filter: Dict[str, Any] = filters or {}

        cursor = self.collection.find(mongo_filter)

        if sort_by:
            direction = 1 if sort_dir == "asc" else -1
            cursor = cursor.sort(sort_by, direction)

        cursor = cursor.limit(limit)

        docs = [self._convert_id(d) for d in cursor]

        return {
            "filters": mongo_filter,
            "limit": limit,
            "count": len(docs),
            "results": docs,
        }

    def get_function_schema(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "filters": {
                        "type": "object",
                        "description": (
                            "Bộ lọc Mongo đơn giản dạng {\"field\": value}. "
                            "Ví dụ: {\"province\": \"HCMC\", \"type\": \"traffic\"}."
                        ),
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Số bản ghi tối đa trả về (1-100).",
                        "default": 20,
                        "minimum": 1,
                        "maximum": 100,
                    },
                    "sort_by": {
                        "type": "string",
                        "description": "Tên field để sort, ví dụ 'timestamp'.",
                    },
                    "sort_dir": {
                        "type": "string",
                        "enum": ["asc", "desc"],
                        "default": "desc",
                        "description": "Thứ tự sắp xếp.",
                    },
                },
                "required": [],
            },
        }

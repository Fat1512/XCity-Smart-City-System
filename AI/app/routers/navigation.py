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
from fastapi import APIRouter, HTTPException
from app.schemas import RouteRequest
from service.route_service import RouteService

router = APIRouter(tags=["Navigation"])
route_service = RouteService()

@router.post("/route")
async def compute_route(payload: RouteRequest):
    try:
        geojson = route_service.compute_route(payload.start, payload.end)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute route: {e}")

    if isinstance(geojson, dict) and geojson.get("error"):
        raise HTTPException(status_code=400, detail=geojson["error"])

    return geojson
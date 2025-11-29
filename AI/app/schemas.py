
from typing import Tuple
from pydantic import BaseModel, Field

class RouteRequest(BaseModel):
    start: Tuple[float, float] = Field(..., description="Begin [lat, lon]")
    end: Tuple[float, float] = Field(..., description="End [lat, lon]")
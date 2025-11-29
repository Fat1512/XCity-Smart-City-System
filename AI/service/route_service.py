from typing import Tuple, Dict, Any

from components.manager import ToolManager

from components.logging.logger import setup_logger

logger = setup_logger("route_service")

class RouteService:
    def __init__(self) -> None:
        self.tool_name = "route_tool"
        self.tm = ToolManager()

        try:
            self.tm.auto_register_from_package()
        except Exception:
            logger.error("auto register tool fail")

    def _get_route_tool(self):
        tool = self.tm.get(self.tool_name)
        if tool is None:
            raise RuntimeError(f"Tool '{self.tool_name}' hasn't registered")
        return tool

    def compute_route(self, start: Tuple[float, float], end: Tuple[float, float]) -> Dict[str, Any]:
        tool = self._get_route_tool()

        err = tool.validate_input(start, end)
        if err:
            raise ValueError(err)

        result = tool.call(start, end)
        return result

from .base_intent import BaseIntent
from .route_intent import RouteIntent
from .traffic_intent import TrafficIntent
from .greeting_intent import GreetingIntent
from .meta_intent import MetaIntent
from .out_of_domain_intent import OutOfDomainIntent
from .rag_intent import RagIntent


def create_intent_handlers():
    """
    Thứ tự quan trọng:
    - ROUTE / TRAFFIC / GREETING / META / OUT_OF_DOMAIN
    - RAGIntent luôn để cuối cùng để làm default handler.
    """
    return [
        RouteIntent(),
        TrafficIntent(),
        GreetingIntent(),
        MetaIntent(),
        OutOfDomainIntent(),
        RagIntent(),
    ]

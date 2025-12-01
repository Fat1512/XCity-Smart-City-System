from .base_intent import BaseIntent
from .route_intent import RouteIntent
from .traffic_intent import TrafficIntent
from .greeting_intent import GreetingIntent
from .meta_intent import MetaIntent
from .out_of_domain_intent import OutOfDomainIntent
from .rag_intent import RagIntent


def create_intent_handlers():
    return [
        RouteIntent(),
        TrafficIntent(),
        GreetingIntent(),
        MetaIntent(),
        RagIntent(),
        OutOfDomainIntent(),
    ]

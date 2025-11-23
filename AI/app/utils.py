from datetime import datetime, timezone
from typing import Optional
from PIL import Image
import os

import numpy as np
import requests


def resize_image(image_path, max_size=(1024, 1024), quality=85):
    try:
        img = Image.open(image_path)
        img_format = img.format
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            img_format = "JPEG"

        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        save_suffix = ".jpg" if img_format == "JPEG" else os.path.splitext(image_path)[1]

        img.save(image_path, format="JPEG", quality=quality, optimize=True)

        print(f"Resized and compressed image saved to: {image_path}")
        return image_path

    except Exception as e:
        print(f"Error resizing image {image_path}: {e}")
        return image_path


ORION_URL = "http://localhost:1026"


def publish_to_orion_ld(sensor_id: str, metrics: dict) -> bool:
    import logging
    logger = logging.getLogger("ws.orion.upsert")

    def to_native(o):
        if isinstance(o, np.generic):
            return o.item()
        if isinstance(o, np.ndarray):
            return [to_native(x) for x in o.tolist()]
        if isinstance(o, (list, tuple, set)):
            return [to_native(x) for x in o]
        if isinstance(o, dict):
            return {str(k): to_native(v) for k, v in o.items()}
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, (bytes, bytearray)):
            try:
                return o.decode("utf-8")
            except:
                return list(o)
        return o

    try:
        observed_at = datetime.now(timezone.utc).isoformat()
        entity_id = f"urn:ngsi-ld:TrafficFlowObserved:{sensor_id}"
        entity_type = "TrafficFlowObserved"

        cur_count = float(metrics.get("current_count", 0) or 0)
        cur_avg_speed = float(metrics.get("current_avg_speed", 0) or 0)

        capacity = float(metrics.get("capacity", 20))
        threshold_speed = float(metrics.get("threshold_speed", 30))

        occupancy = min(cur_count / capacity, 1.0) if capacity > 0 else 0.0
        congested = bool(cur_avg_speed < threshold_speed)

        attrs = {
            "averageVehicleSpeed": {
                "type": "Property",
                "value": to_native(cur_avg_speed),
                "observedAt": observed_at
            },
            "intensity": {
                "type": "Property",
                "value": to_native(cur_count),
                "observedAt": observed_at
            },
            "occupancy": {
                "type": "Property",
                "value": to_native(occupancy),
                "observedAt": observed_at
            },
            "congested": {
                "type": "Property",
                "value": to_native(congested),
                "observedAt": observed_at
            },
            "dateObserved": {
                "type": "Property",
                "value": observed_at
            },
            "refDevice": {
                "type": "Relationship",
                "value": "urn:ngsi-ld:Camera:70027910-094d-4567-82bf-341ad3156f8e",
                "observedAt": observed_at
            },
        }

        entity_body = {
            "id": entity_id,
            "type": entity_type,
            "@context": [
                "https://smart-data-models.github.io/dataModel.Transportation/context.jsonld",
                "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
            ],
            **attrs
        }

        payload = [entity_body]
        upsert_url = ORION_URL.rstrip("/") + "/ngsi-ld/v1/entityOperations/upsert"
        headers = {
            "Content-Type": "application/ld+json",
        }

        logger.info(f"[ORION UPSERT] sending entity {entity_id} with occupancy={occupancy:.3f} congested={congested}")
        resp = requests.post(upsert_url, json=payload, headers=headers, timeout=8)
        logger.info(f"[ORION UPSERT] status={resp.status_code} body={resp.text[:500]}")
        return resp.status_code in (200, 201, 204)

    except Exception:
        logger.exception("[ORION UPSERT] Unexpected error")
        return False

from typing import Any, Dict, List

from .base_intent import BaseIntent
from app.utils import traffic_media, traffic_state
from components.logging import logger as log_module
import json as _json
import traceback


logger = log_module.setup_logger("traffic_intent")


class TrafficIntent(BaseIntent):
    name = "TRAFFIC"

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
        all_segments_data = traffic_state.snapshot_with_addresses()
        all_frames = traffic_media.snapshot()

        streams_config = service.streams_config

        streams_list_text = ""
        for stream in streams_config:
            stream_id = stream.get("stream_id", "")
            address = stream.get("address", "")
            segment_ids = stream.get("segment_ids", [])
            streams_list_text += (
                f"- stream_id: {stream_id}\n"
                f"  địa chỉ: {address}\n"
                f"  segment_ids: {segment_ids}\n\n"
            )

        logger.info(f"Streams list:\n{streams_list_text}")

        selected_stream_ids: List[str] = []
        is_specific_query = False

        try:
            select_prompt = service.rag_prompts.load(
                "select_traffic_streams",
                query=query,
                streams_list=streams_list_text,
            )
            select_response = service.rag_llm.generate(select_prompt)
            llm_result = select_response.get("text", "").strip()
            logger.info(f"LLM raw response: '{llm_result}'")

            llm_result = llm_result.replace("```", "").strip()

            valid_stream_ids = {s.get("stream_id") for s in streams_config}

            upper_result = llm_result.upper()
            if upper_result == "ALL" or "ALL" in upper_result.split():
                logger.info("General query - using ALL streams")
                selected_stream_ids = list(valid_stream_ids)
                is_specific_query = False
            elif upper_result == "NONE" or "NONE" in upper_result.split():
                logger.info("No matching streams found")
                answer = "Xin lỗi, hiện tại hệ thống chưa có camera tại khu vực bạn hỏi."
                history_list.append({"query": query, "answer": answer})
                service.history_service.save_history(conversation_id, history_list)
                return {
                    "answer": answer,
                    "traffic_stats": None,
                    "traffic_images": [],
                    "conversation_id": conversation_id,
                }
            else:
                found_ids = []
                for stream_id in valid_stream_ids:
                    if stream_id and stream_id in llm_result:
                        found_ids.append(stream_id)

                if found_ids:
                    selected_stream_ids = found_ids
                    is_specific_query = True
                    logger.info(
                        f"Extracted streams from response: {selected_stream_ids}"
                    )
                else:
                    potential_ids = [s.strip() for s in llm_result.split(",")]
                    valid_ids = [sid for sid in potential_ids if sid in valid_stream_ids]

                    if valid_ids:
                        selected_stream_ids = valid_ids
                        is_specific_query = True
                        logger.info(
                            f"Parsed comma-separated streams: {selected_stream_ids}"
                        )
                    else:
                        logger.info(
                            "Could not extract valid stream IDs, falling back to ALL"
                        )
                        selected_stream_ids = list(valid_stream_ids)
                        is_specific_query = False

        except Exception as e:
            logger.info(f"Error selecting streams: {e}")
            logger.info(traceback.format_exc())
            selected_stream_ids = [s.get("stream_id") for s in streams_config]
            is_specific_query = False

        target_segment_ids: List[str] = []
        target_stream_ids: List[str] = []

        for stream in streams_config:
            stream_id = stream.get("stream_id")
            if stream_id in selected_stream_ids:
                target_stream_ids.append(stream_id)
                segment_ids = stream.get("segment_ids", [])
                target_segment_ids.extend(segment_ids)
                logger.info(
                    f"  ✓ Using stream: {stream_id} ({stream.get('address')})"
                )

        final_segments: Dict[str, Any] = {}
        final_frames: Dict[str, Any] = {}

        logger.info("Filtering data...")

        for seg_id in target_segment_ids:
            if seg_id in all_segments_data:
                final_segments[seg_id] = all_segments_data[seg_id]
                logger.info(
                    f"Segment: {seg_id} - {all_segments_data[seg_id]['address']}"
                )

        for stream_id in target_stream_ids:
            if stream_id in all_frames:
                final_frames[stream_id] = all_frames[stream_id]
                logger.info(f"Frame: {stream_id}")
            else:
                logger.info(f"No frame data for stream: {stream_id}")

        if not final_segments and not final_frames:
            if is_specific_query:
                selected_addresses = []
                for stream in streams_config:
                    if stream.get("stream_id") in target_stream_ids:
                        selected_addresses.append(stream.get("address", ""))

                addr_str = (
                    ", ".join(selected_addresses) if selected_addresses else "khu vực này"
                )
                answer = (
                    f"Hệ thống xác định được {addr_str}, nhưng hiện tại camera đang "
                    f"mất kết nối hoặc chưa có dữ liệu."
                )
            else:
                answer = "Hiện hệ thống chưa có dữ liệu giao thông realtime."

            history_list.append({"query": query, "answer": answer})
            service.history_service.save_history(conversation_id, history_list)
            return {
                "answer": answer,
                "traffic_stats": None,
                "traffic_images": [],
                "conversation_id": conversation_id,
            }

        logger.info("FINAL DATA:")
        logger.info(f"  - Segments: {list(final_segments.keys())}")
        logger.info(f"  - Frames: {list(final_frames.keys())}")

        n = len(final_segments)
        total_speed = sum(data["speed"] for data in final_segments.values())
        avg_speed = total_speed / n if n > 0 else 0

        congested_details: List[str] = []
        visible_locations: List[str] = []

        for seg_id, data in final_segments.items():
            speed = data["speed"]
            address = data["address"]
            visible_locations.append(address)

            if speed < 20:
                congested_details.append(f"{address} ({speed:.1f} km/h)")

        stats = {
            "num_segments": n,
            "avg_speed_kmh": round(avg_speed, 1),
            "num_congested": len(congested_details),
            "congested_segments": congested_details,
            "visible_locations": list(set(visible_locations)),
            "scope": "specific_location" if is_specific_query else "general_overview",
        }

        logger.info(f"Stats: {stats}")

        stats_str = _json.dumps(stats, ensure_ascii=False)

        try:
            if is_specific_query:
                context_note = (
                    " (Hãy mô tả cụ thể tình trạng tại: "
                    f"{', '.join(set(visible_locations))} dựa trên dữ liệu JSON)"
                )
            else:
                context_note = (
                    " (Mô tả tổng quan tình hình giao thông toàn thành phố)"
                )

            traffic_prompt = service.rag_prompts.load(
                "traffic_summary",
                query=query + context_note,
                history=history_string,
                stats_json=stats_str,
            )
        except Exception as e:
            return {
                "error": f"Could not load traffic_summary prompt: {e}",
                "conversation_id": conversation_id,
            }

        response = service.rag_llm.generate(traffic_prompt)
        answer = response.get(
            "text", "Hiện tại hệ thống đang ghi nhận tình trạng giao thông bình thường."
        )

        history_list.append({"query": query, "answer": answer})
        service.history_service.save_history(conversation_id, history_list)

        traffic_images = [
            {
                "stream_id": sid,
                "ts": info["ts"],
                "mime_type": "image/jpeg",
                "image_base64": info["image_base64"],
            }
            for sid, info in final_frames.items()
        ]

        logger.info("=" * 60)
        logger.info("RESPONSE SUMMARY:")
        logger.info(
            f"  - Query type: {'SPECIFIC' if is_specific_query else 'OVERVIEW'}"
        )
        logger.info(f"  - Selected streams: {target_stream_ids}")
        logger.info(f"  - Answer length: {len(answer)} chars")
        logger.info(f"  - Images count: {len(traffic_images)}")
        logger.info(
            f"  - Image streams: {[img['stream_id'] for img in traffic_images]}"
        )
        logger.info("=" * 60)

        return {
            "answer": answer,
            "traffic_stats": stats,
            "traffic_images": traffic_images,
            "conversation_id": conversation_id,
        }

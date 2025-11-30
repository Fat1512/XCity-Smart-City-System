from dataclasses import dataclass
from typing import List, Sequence, Any
import json
import math
import os


@dataclass
class TrafficSource:
    stream_id: str
    segment_ids: List[str]
    address: str
    embedding: List[float]


def _cosine(a: Sequence[float], b: Sequence[float]) -> float:
    num = sum(x * y for x, y in zip(a, b))
    da = math.sqrt(sum(x * x for x in a))
    db = math.sqrt(sum(y * y for y in b))
    if da == 0 or db == 0:
        return 0.0
    return num / (da * db)


class TrafficSearchService:
    """
    embedding_client: nên truyền vào EmbeddingManager (hoặc object có:
      - vectorize(List[str]) -> List[List[float]]
      - vectorize_single(str) -> List[float]
    """
    def __init__(
        self,
        embedding_client: Any,
        streams_config_path: str = "streams_config.json",
    ) -> None:
        self.embedding_client = embedding_client
        self.streams: List[TrafficSource] = []

        if os.path.exists(streams_config_path):
            with open(streams_config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = []

        texts: List[str] = []
        raw_items = []

        for item in data:
            stream_id = item.get("stream_id")
            address = item.get("address") or ""
            segment_ids = item.get("segment_ids") or []

            if not stream_id:
                continue

            # mô tả để embed
            text = f"camera giao thông tại {address} ({stream_id})"
            texts.append(text)
            raw_items.append((stream_id, segment_ids, address))

        if texts:
            # dùng EmbeddingManager.vectorize
            embeddings = self.embedding_client.vectorize(texts)
        else:
            embeddings = []

        for (stream_id, segment_ids, address), emb in zip(raw_items, embeddings):
            self.streams.append(
                TrafficSource(
                    stream_id=stream_id,
                    segment_ids=[str(s) for s in segment_ids],
                    address=address,
                    embedding=list(emb),
                )
            )

    def search(
        self,
        query: str,
        top_k: int = 3,
        min_score: float = 0.35,
    ) -> List[TrafficSource]:
        if not self.streams:
            return []

        # dùng EmbeddingManager.vectorize_single
        q_emb = self.embedding_client.vectorize_single(query)
        scored: List[tuple[float, TrafficSource]] = []

        for src in self.streams:
            score = _cosine(q_emb, src.embedding)
            if score >= min_score:
                scored.append((score, src))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [s for _, s in scored[:top_k]]

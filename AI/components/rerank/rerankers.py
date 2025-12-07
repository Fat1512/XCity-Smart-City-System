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
from typing import List
from sentence_transformers import CrossEncoder
from components.interfaces import Reranker
import torch

class BaseCrossEncoderReranker(Reranker):
    def __init__(self, model_name: str):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Reranker model: {model_name} on {device}...")
        self.model = CrossEncoder(model_name, device=device, trust_remote_code=True)

    def rerank(self, query: str, documents: List[str], top_k: int = 3) -> List[str]:
        if not documents:
            return []
        
        pairs = [[query, doc] for doc in documents]
        
        scores = self.model.predict(pairs)
        
        doc_scores = list(zip(documents, scores))
        
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        
        ranked_docs = [doc for doc, score in doc_scores[:top_k]]
        
        return ranked_docs
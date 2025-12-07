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
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from dateutil import parser as date_parser
import uuid
import os
import json
import re

from components.manager import EmbeddingManager
from langchain_text_splitters import RecursiveCharacterTextSplitter
from components.manager import ReaderManager
from components.manager import DatabaseManager
from components.manager import PromptManager
from components.manager import GenerationManager
from components.manager import ConfigManager

from service.guardrail_service import RAGGuardrailService
from service.history_service import RedisHistoryService

from components.logging import logger
from service.rag.intents import create_intent_handlers

COORD_PAIR_RE = re.compile(
    r"(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)"
)

logger = logger.setup_logger("mini_rag_service")


class MiniRagService:
    def __init__(self, collection_name: str = "rag_documents"):
        self.embedder = EmbeddingManager()
        self.reader_manager = ReaderManager()
        self.db = DatabaseManager()
        self.collection_name = collection_name
        self.config_manager = ConfigManager()

        self.rag_guardrails = RAGGuardrailService()
        self.history_service = RedisHistoryService()

        self.rag_prompts = PromptManager()
        self.rag_llm = GenerationManager()

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        # self.streams_config = self._load_streams_config()
        # logger.info(f"Loaded {len(self.streams_config)} traffic streams")

        self.intent_handlers = create_intent_handlers()

    @property
    def streams_config(self):
        return self.config_manager.get_all_streams()

    # def _load_streams_config(self):
    #     config_path = "config/streams_config.json"
    #     if os.path.exists(config_path):
    #         with open(config_path, "r", encoding="utf-8") as f:
    #             return json.load(f)
    #     return []

    def parse_two_coord_pairs(self, text: str):
        matches = COORD_PAIR_RE.findall(text)
        if len(matches) < 2:
            return None
        try:
            a = matches[0]
            b = matches[1]
            c1 = (float(a[0]), float(a[1]))
            c2 = (float(b[0]), float(b[1]))
            return c1, c2
        except Exception:
            return None


    def chat(self, query: str, conversation_id: str = None):
        if not self.history_service.is_available:
            return {"error": "Server error: Chat history service (Redis) is unavailable."}

        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            logger.info(f"Starting new conversation: {conversation_id}")

        history_list = self.history_service.load_history(conversation_id)
        K_TURNS = int(os.getenv("K_TURNS", 5))
        recent_history_list = history_list[-K_TURNS:]

        history_string = ""
        for turn in recent_history_list:
            history_string += f"Người dùng: {turn['query']}\nTrợ lý: {turn['answer']}\n\n"

        intent, router_tokens = self.rag_guardrails.route_intent(query)
        logger.info(f"Routed intent: {intent}")

        coord_pairs = self.parse_two_coord_pairs(query)
        if coord_pairs and intent != "ROUTE":
            logger.info("Detected coordinate pairs in query, overriding intent to ROUTE")
            intent = "ROUTE"

        response_payload = None
        for handler in self.intent_handlers:
            if handler.handles(intent):
                response_payload = handler.handle(
                    query=query,
                    intent=intent,
                    service=self,
                    history_string=history_string,
                    history_list=history_list,
                    conversation_id=conversation_id,
                    router_tokens=router_tokens,
                )
                break
        
        if not response_payload:
            answer = "Hiện tại intent này chưa được hỗ trợ."
            history_list.append({"query": query, "answer": answer})
            self.history_service.save_history(conversation_id, history_list)
            return {"answer": answer, "conversation_id": conversation_id}

        raw_answer = response_payload.get("answer", "")
        
        if intent == "RAG_QUERY" or intent == "META_QUERY":
            is_valid, fallback_answer = self.rag_guardrails.check_answer_quality(query, raw_answer)
            
            if not is_valid:
                response_payload["answer"] = fallback_answer
                if history_list:
                    history_list.pop() 
                history_list.append({"query": query, "answer": fallback_answer})
                self.history_service.save_history(conversation_id, history_list)

        return response_payload

    def ingest_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        text, error = self.reader_manager.read_file(file_path)
        if error:
            return {"error": error, "filename": filename}

        return self._process_and_store_text(text, filename, extra_metadata=None)

    def ingest_bytes(
        self,
        raw_bytes: bytes,
        filename: str,
        extra_metadata: dict = None
    ) -> Dict[str, Any]:
        try:
            text = raw_bytes.decode("utf-8")
        except Exception as e:
            return {"error": f"Error decoding bytes: {e}", "filename": filename}

        return self._process_and_store_text(text, filename, extra_metadata)

    def _process_and_store_text(
        self, text: str, filename: str, extra_metadata: dict = None
    ) -> Dict[str, Any]:
        chunks = self.text_splitter.split_text(text)
        logger.info(f"Split '{filename}' into {len(chunks)} chunks.")

        embeddings = self.embedder.vectorize(chunks)

        ids = [f"{filename}_{i}" for i in range(len(chunks))]
        metadatas = []
        for i in range(len(chunks)):
            meta = {"source": filename, "chunk_index": i}
            if extra_metadata:
                meta.update(extra_metadata)
            metadatas.append(meta)

        documents = chunks

        self.db.delete(
            collection_name=self.collection_name,
            where_filter={"source": filename},
        )

        self.db.add(
            collection_name=self.collection_name,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids,
        )

        logger.info(f"Successfully ingested and vectorized file: {filename}")
        return {
            "status": "success",
            "filename": filename,
            "chunks_added": len(chunks),
        }

    def retrieve_context(self, query: str, n_results: int = 3) -> List[str]:
        query_vector = self.embedder.vectorize_single(query)
        results = self.db.query(
            collection_name=self.collection_name,
            query_embeddings=[query_vector],
            n_results=n_results,
        )
        return results.get("documents", [[]])[0]

    def list_documents(self) -> List[str]:
        logger.info("Listing unique documents...")
        unique_files = self.db.get_unique_metadata_values(
            self.collection_name, "source"
        )
        return sorted(list(unique_files))

    def delete_document(self, filename: str) -> Dict[str, Any]:
        logger.info(f"Attempting to delete document: {filename}")
        try:
            self.db.delete(
                collection_name=self.collection_name,
                where_filter={"source": filename},
            )
            logger.info(f"Successfully deleted document: {filename}")
            return {"status": "deleted", "filename": filename}
        except Exception as e:
            logger.info(f"Error deleting document {filename}: {e}")
            return {"error": str(e), "filename": filename}

    def document_exists(self, filename: str) -> bool:
        results = self.db.get_unique_metadata_values(
            self.collection_name, "source"
        )
        return filename in results

    def delete_documents_older_than(self, prefix: str, days: int):
        if days <= 0:
            logger.info(f"Stale document deletion is disabled (days={days}).")
            return 0

        if date_parser is None:
            logger.info(
                "Cannot delete old files: 'python-dateutil' is not installed."
            )
            return 0

        try:
            cutoff_dt = datetime.now(timezone.utc) - timedelta(days=days)
            logger.info(
                f"Deleting documents with prefix '{prefix}' published before {cutoff_dt.isoformat()}..."
            )

            db_data = self.db.get_all(
                collection_name=self.collection_name,
                include=["metadatas"],
            )

            all_metadatas = db_data.get("metadatas", [])
            if not all_metadatas:
                logger.info(
                    "No documents found in the collection. Nothing to check."
                )
                return 0

            document_dates = {}

            for meta in all_metadatas:
                filename = meta.get("source")
                pub_date_str = meta.get("publication_date")

                if not filename or not pub_date_str:
                    continue

                if not filename.startswith(prefix):
                    continue

                try:
                    pub_date_dt = date_parser.parse(pub_date_str)
                    if pub_date_dt.tzinfo is None:
                        pub_date_dt = pub_date_dt.replace(tzinfo=timezone.utc)
                except Exception as e:
                    logger.info(
                        f"Skipping check for {filename}: Could not parse date '{pub_date_str}'. Error: {e}"
                    )
                    continue

                if filename not in document_dates:
                    document_dates[filename] = pub_date_dt

            if not document_dates:
                logger.info(
                    f"No documents with prefix '{prefix}' and valid 'publication_date' found."
                )
                return 0

            logger.info(
                f"Found {len(document_dates)} document(s) with prefix '{prefix}'. Checking publication dates..."
            )

            deleted_count = 0
            for filename, pub_date in document_dates.items():
                if pub_date < cutoff_dt:
                    logger.info(
                        f"🗑️ Deleting stale file: {filename} (Published: {pub_date.isoformat()})"
                    )
                    self.delete_document(filename)
                    deleted_count += 1

            logger.info(
                f"Stale document check complete. Deleted {deleted_count} document(s)."
            )
            return deleted_count

        except Exception as e:
            logger.info(f"Error in delete_documents_older_than: {e}")
            return 0

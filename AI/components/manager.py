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
import os

from typing import List, Dict, Type, Any, Optional, List
import importlib
import inspect
import pkgutil
import os

# Generator
from components.generation.ollama_generator import OllamaGenerator
from components.generation.openai_generator import OpenAIGenerator
from components.interfaces import Generator

# Embedder
from components.embedding.sentence_transformer_embedder import SentenceTransformerEmbedder
from components.embedding.ollama_embedder import OllamaEmbedder
from components.interfaces import Embedding

# Reader
from components.reader import basic_reader

# Database
from components.interfaces import VectorDatabase
from components.database.chroma_db import ChromaDB

# Ingestor
from components.ingest_strategy.strategies import (
    HTMLIngestStrategy,
    MarkdownIngestStrategy,
    PlainTextIngestStrategy,
    BinaryIngestStrategy,
)

# Config
from pymongo import MongoClient, errors

# Tools
from components.interfaces import Tool

# Reranker
from components.interfaces import Reranker
from components.rerank.reranker_bge import BgeReranker
from components.rerank.reranker_jina import JinaReranker

from components.logging.logger import setup_logger

logger = setup_logger("manager")


class RerankerManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RerankerManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        provider = os.getenv("RERANKER_PROVIDER", "bge").lower()
        self.reranker: Reranker = None

        if provider == "bge":
            print("Initializing RerankerManager with BgeReranker")
            self.reranker = BgeReranker()
        elif provider == "jina":
            print("Initializing RerankerManager with JinaReranker")
            self.reranker = JinaReranker()
        else:
            print(f"Unknown RERANKER_PROVIDER: {provider}, fall back to JinaReranker")
            self.reranker = JinaReranker()
        
        self._initialized = True

    def rerank(self, query: str, documents: List[str], top_k: int = 3, threshold: float = None) -> List[str]:
        return self.reranker.rerank(query, documents, top_k, threshold)

class ToolManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ToolManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, tools_package: str = "components.tools", tools_path: Optional[str] = None):
        if self._initialized:
            return
        self.tools_package = tools_package
        self.tools: Dict[str, Type[Tool]] = {}
        self.instances: Dict[str, Tool] = {}
        # tools_path for dynamic load (optional)
        self.tools_path = tools_path or os.path.join(os.getcwd(), "components", "tools")
        self._initialized = True

    def register(self, tool_cls: Type[Tool]):
        if not issubclass(tool_cls, Tool):
            raise TypeError("tool_cls must be subclass of Tool")
        self.tools[tool_cls.name] = tool_cls

    def unregister(self, tool_name: str):
        self.tools.pop(tool_name, None)
        self.instances.pop(tool_name, None)

    def get(self, tool_name: str) -> Optional[Tool]:
        if tool_name in self.instances:
            return self.instances[tool_name]
        tool_cls = self.tools.get(tool_name)
        if tool_cls is None:
            return None
        inst = tool_cls()
        self.instances[tool_name] = inst
        return inst

    def list_tools(self) -> List[Dict[str, Any]]:
        return [{"name": n, "description": cls.description, "category": cls.category, "enabled": cls.enabled}
                for n, cls in self.tools.items()]

    def execute(self, tool_name: str, *args, **kwargs) -> Any:
        tool = self.get(tool_name)
        if tool is None:
            raise ValueError(f"Tool '{tool_name}' not registered")
        if not getattr(tool, "enabled", True):
            raise RuntimeError(f"Tool '{tool_name}' is disabled")
        err = tool.validate_input(*args, **kwargs)
        if err:
            raise ValueError(f"Invalid input: {err}")
        return tool.call(*args, **kwargs)

    def auto_register_from_package(self):
        package = self.tools_package
        try:
            pkg = importlib.import_module(package)
        except ModuleNotFoundError as ex:
            logger.error(ex)

        for finder, name, ispkg in pkgutil.iter_modules(pkg.__path__, pkg.__name__ + "."):
            module = importlib.import_module(name)
            for _, obj in inspect.getmembers(module, inspect.isclass):
                if issubclass(obj, Tool) and obj is not Tool:
                    self.register(obj)

    def get_function_schemas(self) -> List[Dict]:
        schemas = []
        for tool_name, tool_cls in self.tools.items():
            # use class to get schema without instantiating if schema static
            schema = None
            try:
                inst = self.get(tool_name)
                schema = inst.get_function_schema()
            except Exception:
                continue
            if schema:
                schemas.append(schema)
        return schemas


class GenerationManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GenerationManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        provider = os.getenv("LLM_PROVIDER")
        self.generator: Generator = None

        if provider == "openai":
            print("Initializing GenerationManager with OpenAILLM")
            self.generator = OpenAIGenerator()
        elif provider == "ollama":
            print("Initializing GenerationManager with OllamaLLM")
            self.generator = OllamaGenerator()
        else:
            raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
        
        self._initialized = True

    def generate(self, prompt: str, images: list = None):
        return self.generator.generate(prompt, images)

        

class EmbeddingManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        provider = os.getenv("EMBEDDING_PROVIDER", "sentence_transformer")

        self.embedder: Embedding = None

        if provider == "sentence_transformer":
            print(f"Initializing EmbeddingManager with SentenceTransformerEmbedding")
            self.embedder = SentenceTransformerEmbedder() 
        elif provider == "ollama":
            print(f"Initializing EmbeddingManager with OllamaEmbedding")
            self.embedder = OllamaEmbedder()
        else:
            raise ValueError(f"Unknown EMBEDDING_PROVIDER: {provider}")
        
        self._initialized = True

    def vectorize(self, content: List[str]) -> List[List[float]]:
        return self.embedder.vectorize(content)

    def vectorize_single(self, content: str) -> List[float]:
        return self.embedder.vectorize([content])[0]

        

class PromptManager:
    def __init__(self, base_dir="prompt"):
        self.base_dir = base_dir

    def load(self, name: str, **kwargs) -> str:
        path = os.path.join(self.base_dir, f"{name}.txt")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Prompt file not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        if kwargs:
            content = content.format(**kwargs)

        return content

        
class ReaderManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ReaderManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.readers = {
            ".pdf": basic_reader.read_pdf,
            ".docx": basic_reader.read_docx,
            ".md": basic_reader.read_text_based,
            ".txt": basic_reader.read_text_based
        }
        print("ReaderManager initialized.")
        self._initialized = True

    def read_file(self, file_path: str):
        _, extension = os.path.splitext(file_path)
        extension = extension.lower()
        
        reader_func = self.readers.get(extension)
        
        if not reader_func:
            error_msg = f"Unsupported file type: {extension}"
            print(error_msg)
            return None, error_msg

        content = reader_func(file_path)
        
        if not content or not content.strip():
            error_msg = f"Could not extract text from file: {file_path}"
            print(error_msg)
            return None, error_msg
            
        return content, None

        
class IngestStrategyManager:
    def __init__(self):
        self.strategies = [
            HTMLIngestStrategy(),
            MarkdownIngestStrategy(),
            PlainTextIngestStrategy(),
            BinaryIngestStrategy(),
        ]

    def get_strategy(self, filename: str):
        for strategy in self.strategies:
            if strategy.can_handle(filename):
                return strategy
        return None


class DatabaseManager:
    _instance: VectorDatabase = None

    def __new__(cls):
        if cls._instance is None:
            provider = os.getenv("DB_PROVIDER", "chroma")
            
            if provider == "chroma":
                print("Initializing DatabaseManager with ChromaDB.")
                cls._instance = ChromaDB()
            else:
                raise ValueError(f"Unknown DB_PROVIDER: {provider}")
        
        return cls._instance


class ConfigManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")       
        
        try:
            self.client = MongoClient(uri, serverSelectionTimeoutMS=2000)
            self.db = self.client[db_name]
            self.collection = self.db["camera_config"]
            self.client.server_info()
            print(f"ConfigManager connected to MongoDB: {db_name}.traffic_streams")
        except Exception as e:
            print(f"ConfigManager: Failed to connect to MongoDB. Error: {e}")
            self.collection = None

        self._initialized = True

    def get_all_streams(self) -> List[Dict]:
        if self.collection is None:
            return []
        return list(self.collection.find({}, {"_id": 0}))

    def upsert_stream(self, stream_config: Dict):
        if self.collection is None:
            return
        stream_id = stream_config.get("stream_id")
        if not stream_id:
            return
        self.collection.update_one(
            {"stream_id": stream_id}, 
            {"$set": stream_config}, 
            upsert=True
        )
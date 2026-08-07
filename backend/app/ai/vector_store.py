from typing import List
import requests
from qdrant_client import QdrantClient
from langchain_core.embeddings import Embeddings
from langchain_community.vectorstores import Qdrant
from langchain.schema import Document

from app.core.config import settings

class NvidiaNIMEmbeddings(Embeddings):
    def __init__(self, model="nvidia/nv-embedqa-e5-v5", api_key=None):
        self.model = model
        self.api_key = api_key or settings.NVIDIA_API_KEY
        self.url = "https://integrate.api.nvidia.com/v1/embeddings"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def _embed(self, texts: List[str], input_type: str) -> List[List[float]]:
        all_embeddings = []
        batch_size = 50
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            payload = {
                "input": batch,
                "model": self.model,
                "input_type": input_type
            }
            response = requests.post(self.url, headers=self.headers, json=payload)
            if response.status_code != 200:
                print(f"Error {response.status_code}: {response.text}")
            response.raise_for_status()
            data = response.json().get("data", [])
            all_embeddings.extend([item["embedding"] for item in data])
        return all_embeddings

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._embed(texts, "passage")

    def embed_query(self, text: str) -> List[float]:
        return self._embed([text], "query")[0]

# In a real app we'd likely instantiate QdrantClient centrally
if settings.QDRANT_HOST.startswith("http"):
    client = QdrantClient(url=settings.QDRANT_HOST, api_key=settings.QDRANT_API_KEY)
else:
    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

# Use real NVIDIA embeddings via custom class to avoid Langchain API parsing bugs
embeddings = NvidiaNIMEmbeddings()

# Size for nvidia/nv-embedqa-e5-v5 is 1024
COLLECTION_NAME = "interview_experiences_nvidia_v3"

class VectorStoreManager:
    def __init__(self):
        self.client = client
        self.embeddings = embeddings
        self.collection_name = COLLECTION_NAME
        self._ensure_collection()
        self.vector_store = Qdrant(
            client=client,
            collection_name=COLLECTION_NAME,
            embeddings=embeddings,
        )

    def _ensure_collection(self):
        # check if collection exists, if not, recreate it
        try:
            collections = self.client.get_collections().collections
            if not any(c.name == self.collection_name for c in collections):
                from qdrant_client.http import models as rest
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=rest.VectorParams(size=1024, distance=rest.Distance.COSINE)
                )
        except Exception:
            pass

    def add_documents(self, documents: List[Document]):
        # LangChain's Qdrant will create collection if missing when using from_documents
        # However for an existing one, we use add_documents
        self.vector_store.add_documents(documents)

    def get_vector_store(self) -> Qdrant:
        return self.vector_store

vector_store_manager = VectorStoreManager()

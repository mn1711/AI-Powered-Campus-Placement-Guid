from typing import Dict, Any
from langchain.schema.retriever import BaseRetriever
from qdrant_client.http import models as rest
from app.ai.vector_store import vector_store_manager

class InterviewRetriever:
    @staticmethod
    def get_retriever(filters: Dict[str, Any] = None, k: int = 5) -> BaseRetriever:
        """
        Builds a LangChain retriever with Qdrant metadata filters.
        """
        # Build Qdrant filter
        qdrant_filter = None
        if filters:
            must_conditions = []
            for key, value in filters.items():
                must_conditions.append(
                    rest.FieldCondition(
                        key=f"metadata.{key}",
                        match=rest.MatchValue(value=value)
                    )
                )
            qdrant_filter = rest.Filter(must=must_conditions)
            
        vector_store = vector_store_manager.get_vector_store()
        
        search_kwargs = {"k": k}
        if qdrant_filter:
            search_kwargs["filter"] = qdrant_filter
            
        return vector_store.as_retriever(search_kwargs=search_kwargs)

interview_retriever = InterviewRetriever()

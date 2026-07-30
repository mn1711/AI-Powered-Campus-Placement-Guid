import os
import sys

# Add the backend root to Python path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.document_processor import document_processor
from app.ai.vector_store import vector_store_manager

def ingest_directory(directory_path: str):
    """
    Scans a directory for PDF, DOCX, and TXT files, processes them, 
    and embeds them into Qdrant as global/public knowledge base.
    """
    if not os.path.exists(directory_path):
        print(f"Directory {directory_path} not found.")
        return

    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith((".pdf", ".docx", ".txt")):
                file_path = os.path.join(root, file)
                print(f"Processing: {file_path}")
                
                with open(file_path, "rb") as f:
                    content = f.read()
                
                # Here you can dynamically extract metadata based on folder structure or filename
                # For example, if your folder is named "Google", you could extract that.
                # For now, we apply generic 'public' metadata.
                metadata = {
                    "source": file,
                    "visibility": "public",
                    "type": "pre_existing_experience"
                }

                try:
                    import time
                    # 1. Chunk the document
                    chunks = document_processor.process_document(content, file, metadata)
                    
                    # 2. Add to Vector Store (Qdrant)
                    # Add backoff for rate limiting
                    max_retries = 3
                    for attempt in range(max_retries):
                        try:
                            vector_store_manager.add_documents(chunks)
                            print(f"✅ Successfully embedded {len(chunks)} chunks from {file}")
                            time.sleep(2) # Respect rate limits
                            break
                        except Exception as inner_e:
                            if '429' in str(inner_e) and attempt < max_retries - 1:
                                print(f"⚠️ Rate limited. Sleeping 60 seconds before retry...")
                                time.sleep(60)
                            else:
                                raise inner_e

                except Exception as e:
                    print(f"❌ Failed to process {file}: {e}")

if __name__ == "__main__":
    # Specify the path to your folder containing the interview experiences
    # You can change this to wherever your documents are stored locally.
    data_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    print(f"Starting ingestion from {data_dir}...")
    ingest_directory(data_dir)

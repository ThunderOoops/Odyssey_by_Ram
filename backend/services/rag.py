import json
import re
import uuid

import numpy as np
from sqlalchemy.orm import Session

from config import CHUNK_OVERLAP, CHUNK_SIZE, RAG_TOP_K
from models.document import Document, DocumentChunk
from services.gemini import embed_texts, generate_text


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap
    return chunks


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def ingest_document(db: Session, filename: str, file_type: str, text: str) -> Document:
    chunks = chunk_text(text)
    if not chunks:
        raise ValueError("No readable text found in the uploaded file.")

    doc = Document(id=str(uuid.uuid4()), filename=filename, file_type=file_type)
    db.add(doc)
    db.flush()

    embeddings = embed_texts(chunks)
    for i, (content, embedding) in enumerate(zip(chunks, embeddings)):
        db.add(
            DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                chunk_index=i,
                content=content,
                embedding_json=json.dumps(embedding),
            )
        )

    db.commit()
    db.refresh(doc)
    return doc


def retrieve_relevant_chunks(db: Session, query: str, top_k: int = RAG_TOP_K) -> list[dict]:
    chunks = db.query(DocumentChunk).all()
    if not chunks:
        return []

    query_embedding = embed_texts([query])[0]
    scored = []
    for chunk in chunks:
        embedding = json.loads(chunk.embedding_json)
        score = cosine_similarity(query_embedding, embedding)
        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, chunk in scored[:top_k]:
        if score < 0.3:
            continue
        doc = db.query(Document).filter(Document.id == chunk.document_id).first()
        results.append(
            {
                "document_id": chunk.document_id,
                "filename": doc.filename if doc else "unknown",
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
                "score": round(score, 4),
            }
        )
    return results


def build_rag_context(chunks: list[dict]) -> str:
    if not chunks:
        return ""
    parts = []
    for i, c in enumerate(chunks, 1):
        parts.append(
            f"[Source {i}: {c['filename']} (chunk {c['chunk_index']})]\n{c['content']}"
        )
    return (
        "Use the following document excerpts to answer the user's question when relevant. "
        "Cite sources by filename when you use them.\n\n" + "\n\n".join(parts)
    )

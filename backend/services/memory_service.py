import re
import uuid

from sqlalchemy.orm import Session

from models.memory import Memory
from services.gemini import generate_text


def extract_keywords(text: str) -> str:
    words = re.findall(r"[a-zA-Z0-9]{3,}", text.lower())
    return " ".join(sorted(set(words)))


def retrieve_relevant_memories(db: Session, query: str, limit: int = 5) -> list[Memory]:
    memories = db.query(Memory).order_by(Memory.updated_at.desc()).all()
    if not memories:
        return []

    query_words = set(extract_keywords(query).split())
    scored = []
    for mem in memories:
        mem_words = set(mem.keywords.split())
        overlap = len(query_words & mem_words)
        if overlap > 0 or not query_words:
            scored.append((overlap, mem))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scored[:limit]]


def build_memory_context(memories: list[Memory]) -> str:
    if not memories:
        return ""
    facts = "\n".join(f"- {m.fact}" for m in memories)
    return (
        "Known facts about the user (use naturally when relevant, do not recite verbatim):\n"
        + facts
    )


def maybe_extract_memory(db: Session, user_message: str, assistant_reply: str):
    prompt = f"""Analyze this exchange and extract ONE new personal fact about the user worth remembering long-term.
If there is nothing new to remember, respond with exactly: NONE

User: {user_message}
Assistant: {assistant_reply}

Respond with only the fact (one short sentence) or NONE."""

    try:
        result = generate_text(prompt)
    except Exception:
        return

    if not result or result.upper().startswith("NONE"):
        return

    fact = result.strip().strip('"').strip("'")
    if len(fact) < 5:
        return

    existing = db.query(Memory).filter(Memory.fact == fact).first()
    if existing:
        return

    db.add(
        Memory(
            id=str(uuid.uuid4()),
            fact=fact,
            keywords=extract_keywords(fact + " " + user_message),
        )
    )
    db.commit()

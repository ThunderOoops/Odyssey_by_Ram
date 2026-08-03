import json
import uuid
from datetime import datetime, timezone

from flask import Blueprint, Response, jsonify, request, stream_with_context
from sqlalchemy.orm import Session

from models.conversation import Conversation
from models.database import SessionLocal
from models.message import Message
from services.gemini import stream_chat
from services.memory_service import (
    build_memory_context,
    maybe_extract_memory,
    retrieve_relevant_memories,
)
from services.rag import build_rag_context, retrieve_relevant_chunks
from services.usage_tracker import usage_tracker

chat_bp = Blueprint("chat", __name__)


def get_db_session() -> Session:
    return SessionLocal()


@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    conversation_id = data.get("conversation_id")
    user_message = (data.get("message") or "").strip()
    use_rag = bool(data.get("use_rag", True))

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    db = get_db_session()
    try:
        if conversation_id:
            conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if not conv:
                return jsonify({"error": "Conversation not found."}), 404
        else:
            conv = Conversation(id=str(uuid.uuid4()), title=user_message[:48])
            db.add(conv)
            db.commit()

        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conv.id,
            role="user",
            content=user_message,
        )
        db.add(user_msg)
        db.commit()

        history = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.asc())
            .all()
        )
        messages = [{"role": m.role, "content": m.content} for m in history]

        memories = retrieve_relevant_memories(db, user_message)
        memory_ctx = build_memory_context(memories)

        rag_chunks = retrieve_relevant_chunks(db, user_message) if use_rag else []
        rag_ctx = build_rag_context(rag_chunks)

        current_time = datetime.now(timezone.utc)
        system_parts = [
       "You are Odyssey, a thoughtful and precise AI assistant. "
       "Format responses in markdown. Use code blocks with language tags for code. "
       f"The current date and time is {current_time.strftime('%A, %B %d, %Y, %H:%M UTC')}. "
       "If asked about the time in another timezone, calculate it precisely from this UTC time "
       "rather than guessing or assuming the user's local time."
        ]
        ]
        if memory_ctx:
            system_parts.append(memory_ctx)
        if rag_ctx:
            system_parts.append(rag_ctx)
        system_instruction = "\n\n".join(system_parts)

        citations = [
            {
                "filename": c["filename"],
                "chunk_index": c["chunk_index"],
                "snippet": c["content"][:280],
                "score": c["score"],
            }
            for c in rag_chunks
        ]

        conv_id = conv.id
        citations_json = json.dumps(citations) if citations else None

        def generate():
            full_response = []
            usage = {"input_tokens": 0, "output_tokens": 0}

            yield f"data: {json.dumps({'type': 'start', 'conversation_id': conv_id, 'citations': citations})}\n\n"

            try:
                for chunk in stream_chat(messages, system_instruction):
                    if isinstance(chunk, dict) and "__usage__" in chunk:
                        usage = chunk["__usage__"]
                        continue
                    full_response.append(chunk)
                    yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                return

            assistant_text = "".join(full_response)
            usage_tracker.add_chat_usage(usage["input_tokens"], usage["output_tokens"])

            save_db = get_db_session()
            try:
                assistant_msg = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conv_id,
                    role="model",
                    content=assistant_text,
                    citations_json=citations_json,
                )
                save_db.add(assistant_msg)

                conv_obj = save_db.query(Conversation).filter(Conversation.id == conv_id).first()
                if conv_obj:
                    conv_obj.updated_at = datetime.now(timezone.utc)
                    if conv_obj.title == user_message[:48] and len(history) <= 1:
                        conv_obj.title = user_message[:48] or "New Chat"

                save_db.commit()
                maybe_extract_memory(save_db, user_message, assistant_text)
            finally:
                save_db.close()

            yield f"data: {json.dumps({'type': 'done', 'usage': usage_tracker.to_dict()})}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

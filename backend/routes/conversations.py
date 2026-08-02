import uuid

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session

from models.conversation import Conversation
from models.database import SessionLocal
from models.message import Message

conversations_bp = Blueprint("conversations", __name__)


def get_db_session() -> Session:
    return SessionLocal()


@conversations_bp.route("/api/conversations", methods=["GET"])
def list_conversations():
    db = get_db_session()
    try:
        convs = (
            db.query(Conversation)
            .order_by(Conversation.updated_at.desc())
            .all()
        )
        return jsonify(
            [
                {
                    "id": c.id,
                    "title": c.title,
                    "created_at": c.created_at.isoformat(),
                    "updated_at": c.updated_at.isoformat(),
                }
                for c in convs
            ]
        )
    finally:
        db.close()


@conversations_bp.route("/api/conversations", methods=["POST"])
def create_conversation():
    db = get_db_session()
    try:
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "New Chat").strip()[:255]
        conv = Conversation(id=str(uuid.uuid4()), title=title)
        db.add(conv)
        db.commit()
        return jsonify(
            {
                "id": conv.id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
            }
        ), 201
    finally:
        db.close()


@conversations_bp.route("/api/conversations/<conv_id>", methods=["GET"])
def get_conversation(conv_id):
    db = get_db_session()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            return jsonify({"error": "Conversation not found."}), 404

        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conv_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        import json

        return jsonify(
            {
                "id": conv.id,
                "title": conv.title,
                "messages": [
                    {
                        "id": m.id,
                        "role": m.role,
                        "content": m.content,
                        "citations": json.loads(m.citations_json) if m.citations_json else [],
                        "created_at": m.created_at.isoformat(),
                    }
                    for m in messages
                ],
            }
        )
    finally:
        db.close()


@conversations_bp.route("/api/conversations/<conv_id>", methods=["PATCH"])
def rename_conversation(conv_id):
    db = get_db_session()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            return jsonify({"error": "Conversation not found."}), 404

        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "Title cannot be empty."}), 400

        conv.title = title[:255]
        db.commit()
        return jsonify({"id": conv.id, "title": conv.title})
    finally:
        db.close()


@conversations_bp.route("/api/conversations/<conv_id>", methods=["DELETE"])
def delete_conversation(conv_id):
    db = get_db_session()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            return jsonify({"error": "Conversation not found."}), 404
        db.delete(conv)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()

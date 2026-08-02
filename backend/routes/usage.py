from flask import Blueprint, jsonify

from models.database import SessionLocal
from models.memory import Memory
from services.usage_tracker import usage_tracker

usage_bp = Blueprint("usage", __name__)


@usage_bp.route("/api/usage", methods=["GET"])
def get_usage():
    return jsonify(usage_tracker.to_dict())


@usage_bp.route("/api/usage/reset", methods=["POST"])
def reset_usage():
    usage_tracker.input_tokens = 0
    usage_tracker.output_tokens = 0
    usage_tracker.embed_tokens = 0
    return jsonify(usage_tracker.to_dict())


@usage_bp.route("/api/memories", methods=["GET"])
def list_memories():
    db = SessionLocal()
    try:
        memories = db.query(Memory).order_by(Memory.updated_at.desc()).all()
        return jsonify(
            [{"id": m.id, "fact": m.fact, "created_at": m.created_at.isoformat()} for m in memories]
        )
    finally:
        db.close()

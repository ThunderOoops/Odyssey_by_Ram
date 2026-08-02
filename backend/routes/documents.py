import uuid
from pathlib import Path

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename

from config import MAX_UPLOAD_SIZE, UPLOAD_FOLDER
from models.database import SessionLocal
from models.document import Document
from services.rag import ingest_document
from services.usage_tracker import usage_tracker
from utils.file_parser import detect_file_type, extract_text

documents_bp = Blueprint("documents", __name__)


def get_db_session() -> Session:
    return SessionLocal()


@documents_bp.route("/api/documents", methods=["GET"])
def list_documents():
    db = get_db_session()
    try:
        docs = db.query(Document).order_by(Document.created_at.desc()).all()
        return jsonify(
            [
                {
                    "id": d.id,
                    "filename": d.filename,
                    "file_type": d.file_type,
                    "created_at": d.created_at.isoformat(),
                    "chunk_count": len(d.chunks),
                }
                for d in docs
            ]
        )
    finally:
        db.close()


@documents_bp.route("/api/documents/upload", methods=["POST"])
def upload_document():
    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"error": "No file selected."}), 400

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size == 0:
        return jsonify({"error": "File is empty."}), 400
    if size > MAX_UPLOAD_SIZE:
        return jsonify({"error": "File exceeds 10 MB limit."}), 400

    filename = secure_filename(file.filename)
    db = get_db_session()
    try:
        file_type = detect_file_type(filename)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    file_id = str(uuid.uuid4())
    save_path = Path(UPLOAD_FOLDER) / f"{file_id}_{filename}"
    file.save(save_path)

    try:
        text = extract_text(save_path, file_type)
        if not text:
            return jsonify({"error": "Could not extract text from file."}), 400

        doc = ingest_document(db, filename, file_type, text)
        usage_tracker.add_embed_tokens(len(text.split()))

        return jsonify(
            {
                "id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "chunk_count": len(doc.chunks),
            }
        ), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Upload failed: {e}"}), 500
    finally:
        db.close()
        if save_path.exists():
            save_path.unlink(missing_ok=True)


@documents_bp.route("/api/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    db = get_db_session()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return jsonify({"error": "Document not found."}), 404
        db.delete(doc)
        db.commit()
        return jsonify({"success": True})
    finally:
        db.close()

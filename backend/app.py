import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

from models.database import init_db
from routes.chat import chat_bp
from routes.conversations import conversations_bp
from routes.documents import documents_bp
from routes.usage import usage_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    init_db()

    app.register_blueprint(chat_bp)
    app.register_blueprint(conversations_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(usage_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "Odyssey"})

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") == "development", threaded=True)

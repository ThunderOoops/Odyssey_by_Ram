# Odyssey

A premium full-stack AI chat application powered by Google Gemini. Built for hackathons — dark-mode-first UI, streaming responses, persistent memory, document RAG, voice mode, and live usage tracking.

## Features

- **Streaming chat** — Real-time Gemini responses with markdown and syntax-highlighted code blocks
- **Persistent memory** — Key user facts stored in SQLite and injected into prompts when relevant
- **Document RAG** — Upload PDF or text files, chunk + embed with Gemini, answer with source citations
- **Voice mode** — Web Speech API for speech-to-text input and text-to-speech playback
- **Usage dashboard** — Live session token count and estimated cost
- **Conversation history** — Multiple chats with rename, delete, and switch

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend  | Python Flask (REST + SSE streaming) |
| Database | SQLite via SQLAlchemy               |
| LLM      | Google Gemini API                   |

## Prerequisites

- Node.js 18+
- Python 3.10+
- A [Google AI Studio](https://aistudio.google.com/) API key

## Setup

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:5000`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

| Variable         | Required | Default              | Description                |
|------------------|----------|----------------------|----------------------------|
| `GEMINI_API_KEY` | Yes      | —                    | Google Gemini API key      |
| `FLASK_PORT`     | No       | `5000`               | Backend port               |
| `FLASK_ENV`      | No       | `development`        | Flask environment          |
| `VITE_API_URL`   | No       | *(proxy in dev)*     | Frontend API base URL      |

## Deployment

### Backend (Render / Railway)

- Root directory: `backend`
- Start command: `python app.py`
- Set `GEMINI_API_KEY` in environment variables
- For production, set `FLASK_ENV=production`

### Frontend (Vercel)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL

## Project Structure

```
├── backend/          Flask API, models, Gemini/RAG services
├── frontend/         React app (Vite + Tailwind)
├── .env.example      Environment template
└── README.md
```

## License

MIT — hackathon use encouraged.

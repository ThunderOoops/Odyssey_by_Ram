import time

import google.generativeai as genai

from config import GEMINI_API_KEY, GEMINI_EMBED_MODEL, GEMINI_MODEL

_configured = False


def ensure_configured():
    global _configured
    if not _configured:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
        # transport="rest" avoids a gRPC/OAuth auth error seen on some hosts (e.g. Render),
        # but this SDK version's REST streaming is broken, so stream_chat below
        # fetches the full response and chunks it manually instead of stream=True.
        genai.configure(api_key=GEMINI_API_KEY, transport="rest")
        _configured = True


def get_model(system_instruction: str | None = None):
    ensure_configured()
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_instruction,
    )


def stream_chat(messages: list[dict], system_instruction: str):
    ensure_configured()
    model = get_model(system_instruction)

    history = []
    for msg in messages[:-1]:
        history.append({"role": msg["role"], "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    last = messages[-1]["content"]
    response = chat.send_message(last, stream=False)

    text = response.text or ""

    input_tokens = 0
    output_tokens = 0
    try:
        usage = response.usage_metadata
        if usage:
            input_tokens = usage.prompt_token_count or input_tokens
            output_tokens = usage.candidates_token_count or output_tokens
    except AttributeError:
        pass

    # Chunk the full response into small pieces so the frontend still
    # sees it stream in word-by-word instead of appearing all at once.
    words = text.split(" ")
    chunk_size = 3
    for i in range(0, len(words), chunk_size):
        piece = " ".join(words[i:i + chunk_size])
        if i + chunk_size < len(words):
            piece += " "
        yield piece
        time.sleep(0.03)

    yield {"__usage__": {"input_tokens": input_tokens, "output_tokens": output_tokens}}


def generate_text(prompt: str) -> str:
    ensure_configured()
    model = get_model()
    response = model.generate_content(prompt)
    return response.text.strip()


def embed_texts(texts: list[str]) -> list[list[float]]:
    ensure_configured()
    if not texts:
        return []

    embeddings = []
    for text in texts:
        result = genai.embed_content(
            model=GEMINI_EMBED_MODEL,
            content=text,
            task_type="retrieval_document",
        )
        embedding = result.get("embedding")
        if not embedding:
            raise RuntimeError("Failed to generate embedding.")
        embeddings.append(embedding)
    return embeddings

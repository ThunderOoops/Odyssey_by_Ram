from pathlib import Path

from pypdf import PdfReader


def extract_text(file_path: Path, file_type: str) -> str:
    if file_type == "pdf":
        reader = PdfReader(str(file_path))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
        return "\n\n".join(pages).strip()

    if file_type in ("txt", "md", "text"):
        return file_path.read_text(encoding="utf-8", errors="replace").strip()

    raise ValueError(f"Unsupported file type: {file_type}")


def detect_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext == "pdf":
        return "pdf"
    if ext in ("txt", "md", "text"):
        return "txt"
    raise ValueError(f"Unsupported file extension: .{ext}")

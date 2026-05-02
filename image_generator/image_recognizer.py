import base64
import sys
import io
from pathlib import Path
from PIL import Image
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_BASE_URL

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

MAX_LONG_SIDE = 1024
JPEG_QUALITY = 80


def encode_image(image_path: str, max_long_side: int = MAX_LONG_SIDE, quality: int = JPEG_QUALITY) -> tuple:
    with Image.open(image_path) as img:
        orig_w, orig_h = img.size
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        long_side = max(orig_w, orig_h)
        if long_side > max_long_side:
            scale = max_long_side / long_side
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)
            print(f"Resized: {orig_w}x{orig_h} -> {new_w}x{new_h}")
        else:
            print(f"No resize needed: {orig_w}x{orig_h}")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return b64, "image/jpeg"


def recognize_image(image_path: str, prompt: str = None, api_key: str = None, base_url: str = None) -> str:
    key = api_key or OPENAI_API_KEY
    url = base_url or OPENAI_BASE_URL or None
    if not key:
        raise ValueError("OPENAI_API_KEY not set. Please set it via config.py or environment variable.")

    if not Path(image_path).exists():
        raise FileNotFoundError(f"File not found: {image_path}")

    ext = Path(image_path).suffix.lower()
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/jpeg")

    print(f"Encoding image: {image_path}")
    b64, mime_type = encode_image(image_path)

    client = OpenAI(api_key=key, base_url=url)

    default_prompt = (
        "Please carefully observe this photo and describe in detail: "
        "1) All objects, food, and drinks visible "
        "2) The environment and atmosphere "
        "3) Any text or signs visible "
        "4) The overall mood of the scene. "
        "Be specific and thorough."
    )

    print("Sending to GPT-4o for recognition...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt or default_prompt},
                        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
                    ],
                }
            ],
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"API Error: {e}")
        raise


def main():
    if len(sys.argv) < 2:
        print("Usage: python image_recognizer.py <image_path> [custom_prompt]")
        print("Example: python image_recognizer.py image/photo.jpg")
        print("         python image_recognizer.py image/photo.jpg 'Describe the food'")
        sys.exit(1)

    image_path = sys.argv[1]
    custom_prompt = sys.argv[2] if len(sys.argv) > 2 else None

    result = recognize_image(image_path, custom_prompt)
    print("\n--- Recognition Result ---")
    print(result)


if __name__ == "__main__":
    main()

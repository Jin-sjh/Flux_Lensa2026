import base64
import sys
import json
import hashlib
from pathlib import Path
from PIL import Image
from openai import OpenAI
import redis
from config import OPENAI_API_KEY, OPENAI_BASE_URL, VOCAB_PATH, REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_VOCAB_KEY, REDIS_VOCAB_HASH_KEY

SUPPORTED_SIZES = [
    "1024x1024", "1024x1536", "1536x1024",
    "1024x1792", "1792x1024",
]


def _compute_file_hash(file_path: str) -> str:
    h = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _format_vocab_text(vocab: list) -> str:
    word_list = []
    for entry in vocab:
        line = f"{entry['word']} ({entry.get('pos','')}) [{entry.get('cefr_level','')}] {entry.get('translation_en','')}"
        word_list.append(line)
    return "\n".join(word_list)


def load_vocabulary(vocab_path: str = VOCAB_PATH) -> str:
    if not Path(vocab_path).exists():
        print(f"Warning: Vocabulary file not found: {vocab_path}")
        return ""

    current_hash = _compute_file_hash(vocab_path)

    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
        r.ping()
        cached_hash = r.get(REDIS_VOCAB_HASH_KEY)
        cached_text = r.get(REDIS_VOCAB_KEY)

        if cached_hash == current_hash and cached_text:
            print(f"Loaded vocabulary from Redis cache ({len(cached_text)} chars, {len(cached_text.splitlines())} words).")
            return cached_text

        print("Vocabulary cache miss or file changed. Reloading into Redis...")
    except redis.ConnectionError:
        print("Redis not available, loading from file directly.")

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab = json.load(f)
    result = _format_vocab_text(vocab)
    print(f"Loaded {len(vocab)} words from file.")

    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
        r.ping()
        r.set(REDIS_VOCAB_KEY, result)
        r.set(REDIS_VOCAB_HASH_KEY, current_hash)
        print(f"Cached vocabulary in Redis (key: {REDIS_VOCAB_KEY}).")
    except redis.ConnectionError:
        print("Redis not available, skipping cache.")

    return result


def get_best_size(image_path: str) -> str:
    with Image.open(image_path) as img:
        w, h = img.size
    ratio = w / h
    best = SUPPORTED_SIZES[0]
    best_diff = float("inf")
    for s in SUPPORTED_SIZES:
        sw, sh = s.split("x")
        sr = int(sw) / int(sh)
        diff = abs(ratio - sr)
        if diff < best_diff:
            best_diff = diff
            best = s
    print(f"Original: {w}x{h} (ratio {ratio:.2f}) -> Using API size: {best}")
    return best

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ANNOTATION_PROMPT = (
    "You are a Japanese-style kawaii illustration annotator. "
    "Take this photo and overlay hand-drawn style annotations on it. Follow these rules strictly:\n"
    "\n"
    "DRAWING RULES:\n"
    "- Use thin white pen-like hand-drawn lines, one-stroke style, casual and slightly uneven\n"
    "- Trace outlines around objects/items in the photo with these thin white sketch lines (following the outer contour of each item)\n"
    "- Use thin arrows (→) and dotted lines (⋯) to guide the viewer's eyes from text labels to the corresponding items\n"
    "- Keep the original photo clearly visible underneath\n"
    "- Do NOT add any heavy borders, thick frames, or rectangular boxes around the photo or text\n"
    "\n"
    "TEXT RULES:\n"
    "- All text MUST use a cute Japanese handwritten font style (kawaii, rounded, diary-like)\n"
    "- Sentences should be very short, like mumbling to yourself in a diary\n"
    "- The tone should feel diary-like, with a little emotion and feeling\n"
    "- Place the Indonesian text annotations I provide below at appropriate positions near each item\n"
    "- Text should feel like casual diary scribbles, soft and warm\n"
    "- Do NOT put text inside boxes or frames — just free-floating handwritten text\n"
    "\n"
    "DECORATIONS:\n"
    "- Add small cute decorations: steam wisps (for hot items), sparkles (✦), tiny hearts (♥), small stars (★)\n"
    "- Keep decorations minimal and spaced out — leave white space, don't clutter\n"
    "- Overall feeling: gentle, warm, diary-page aesthetic\n"
    "\n"
    "IMPORTANT: Do NOT modify or redraw the original photo content. Only ADD annotation overlays on top.\n"
    "\n"
    "Here are the Indonesian text annotations to place on the image:\n"
)


def annotate_image(image_path: str, annotations: str, output_path: str = None, api_key: str = None, base_url: str = None) -> str:
    key = api_key or OPENAI_API_KEY
    url = base_url or OPENAI_BASE_URL or None

    if not key:
        raise ValueError("OPENAI_API_KEY not set. Please set it via config.py or environment variable.")

    if not Path(image_path).exists():
        raise FileNotFoundError(f"File not found: {image_path}")

    if not output_path:
        stem = Path(image_path).stem
        parent = Path(image_path).parent
        existing = list(parent.glob(f"{stem}_annotated*.png"))
        max_num = 0
        for f in existing:
            name = f.stem.replace(f"{stem}_annotated", "").strip("_")
            if name.isdigit():
                max_num = max(max_num, int(name))
        next_num = max_num + 1
        output_path = str(parent / f"{stem}_annotated_{next_num}.png")

    full_prompt = ANNOTATION_PROMPT + annotations
    best_size = get_best_size(image_path)

    print(f"Loading image: {image_path}")
    print(f"Annotations: {annotations[:100]}...")
    print(f"Sending to gpt-image-2 for annotation...")

    client = OpenAI(api_key=key, base_url=url)

    try:
        with open(image_path, "rb") as img_file:
            result = client.images.edit(
                model="gpt-image-2",
                image=img_file,
                prompt=full_prompt,
                size=best_size,
                quality="medium",
                response_format="b64_json",
            )

        image_data = result.data[0]

        if hasattr(image_data, "b64_json") and image_data.b64_json:
            image_bytes = base64.b64decode(image_data.b64_json)
        elif hasattr(image_data, "url") and image_data.url:
            import urllib.request
            print(f"Downloading from URL: {image_data.url[:80]}...")
            resp = urllib.request.urlopen(image_data.url)
            image_bytes = resp.read()
        else:
            raise RuntimeError("No image data returned from API.")

        with open(output_path, "wb") as f:
            f.write(image_bytes)

        print(f"\nAnnotated image saved to: {output_path}")
        return output_path

    except Exception as e:
        print(f"API Error: {e}")
        raise


def run_full_pipeline(image_path: str, output_path: str = None):
    from image_recognizer import recognize_image

    vocab_text = load_vocabulary()

    print("=" * 50)
    print("STEP 1: Recognizing image content...")
    print("=" * 50)

    recognition_prompt = (
        "Please carefully observe this photo and list ALL visible items, food, drinks, and scene elements. "
        "For each item, write a short Indonesian diary-style annotation following these rules:\n"
        "- Drinks: describe taste/temperature/mood in Indonesian\n"
        "- Food: describe texture/deliciousness in Indonesian\n"
        "- Scene/objects: describe atmosphere in Indonesian\n"
        "- Each annotation MUST be exactly 4-5 Indonesian words only, very short and simple\n"
        "- Keep it kawaii casual style\n"
        "- End with one overall mood summary sentence (also 4-5 words only)\n"
        "- Use only natural spoken Indonesian, no Chinese\n"
        "- Keep it soft, cute, diary-like\n"
        "Format each line as: [item name in Indonesian]: [4-5 word annotation]\n"
        "\n"
        "VOCABULARY REFERENCE:\n"
        "Please try to use words from this vocabulary list as much as possible. "
        "This is a reference, not a strict ban on other words, but prefer these words:\n"
        f"{vocab_text}"
    )

    annotations = recognize_image(image_path, prompt=recognition_prompt)

    print("\n" + "=" * 50)
    print("Generated annotations:")
    print("=" * 50)
    print(annotations)

    print("\n" + "=" * 50)
    print("STEP 2: Generating annotated image...")
    print("=" * 50)

    return annotate_image(image_path, annotations, output_path)


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Step 2 only (with annotations text):")
        print("    python image_annotator.py <image_path> --text <annotations>")
        print()
        print("  Full pipeline (recognize + annotate):")
        print("    python image_annotator.py <image_path> --full")
        print()
        print("  With custom output path:")
        print("    python image_annotator.py <image_path> --full --output <path>")
        print()
        print("  From annotations file:")
        print("    python image_annotator.py <image_path> --file <annotations.txt>")
        sys.exit(1)

    image_path = sys.argv[1]
    annotations = None
    output_path = None
    full_pipeline = False

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--text" and i + 1 < len(sys.argv):
            annotations = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--file" and i + 1 < len(sys.argv):
            with open(sys.argv[i + 1], "r", encoding="utf-8") as f:
                annotations = f.read()
            i += 2
        elif sys.argv[i] == "--output" and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--full":
            full_pipeline = True
            i += 1
        else:
            i += 1

    if full_pipeline:
        run_full_pipeline(image_path, output_path)
    elif annotations:
        annotate_image(image_path, annotations, output_path)
    else:
        print("Error: Please provide --text <annotations>, --file <file>, or --full")
        sys.exit(1)


if __name__ == "__main__":
    main()

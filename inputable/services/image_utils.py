import base64
import io
import logging
import os
import uuid
from datetime import datetime

from PIL import Image

logger = logging.getLogger(__name__)

IMAGE_DIR = os.getenv("IMAGE_DIR", "images")


def save_uploaded_image(image_base64: str, user_id: str) -> str:
    """Decode base64 image, compress to max 1024px short edge at JPEG quality 85,
    save to images/{user_id}_{timestamp}_{uuid6}.jpg.
    Returns the relative file path (e.g. images/user1_20260501_143022_abc123.jpg).
    """
    os.makedirs(IMAGE_DIR, exist_ok=True)

    # Decode base64
    image_bytes = base64.b64decode(image_base64)

    # Open and compress with Pillow
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((1024, 1024), Image.LANCZOS)

    # Build filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    uid = uuid.uuid4().hex[:6]
    filename = f"{user_id}_{timestamp}_{uid}.jpg"
    filepath = os.path.join(IMAGE_DIR, filename)

    # Save compressed JPEG
    img.save(filepath, format="JPEG", quality=85)
    logger.info(f"Saved uploaded image: {filepath}")

    return filepath


def image_path_to_base64(image_path: str) -> str:
    """Read an image file from disk and return its base64-encoded content."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

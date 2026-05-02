import base64
import io
import logging
import os
import uuid
from datetime import datetime

from PIL import Image

logger = logging.getLogger(__name__)


def _image_dir() -> str:
    return os.getenv("IMAGE_DIR", "images")


def save_uploaded_image(image_base64: str, user_id: str) -> str:
    """Decode base64 image, compress to max 1024px short edge at JPEG quality 85,
    save to images/{user_id}_{timestamp}_{uuid6}.jpg.
    Returns the relative file path (e.g. images/user1_20260501_143022_abc123.jpg).
    """
    os.makedirs(_image_dir(), exist_ok=True)

    # Decode base64
    image_bytes = base64.b64decode(image_base64)

    # Open and compress with Pillow
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((1024, 1024), Image.LANCZOS)

    # Build filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    uid = uuid.uuid4().hex[:6]
    filename = f"{user_id}_{timestamp}_{uid}.jpg"
    filepath = os.path.join(_image_dir(), filename)

    # Save compressed JPEG
    img.save(filepath, format="JPEG", quality=85)
    logger.info(f"Saved uploaded image: {filepath}")

    return filepath


def image_path_to_base64(image_path: str) -> str:
    """Read an image file from disk and return its base64-encoded content."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def generate_thumbnail(image_path: str, max_size: tuple[int, int] = (200, 200), quality: int = 70) -> str | None:
    """Generate a thumbnail version of the image for preview purposes.
    
    Args:
        image_path: Path to the original image file
        max_size: Maximum size (width, height) for the thumbnail
        quality: JPEG quality (1-100), lower means more compression
    
    Returns:
        Path to the generated thumbnail file, or None if generation fails
    """
    try:
        if not os.path.exists(image_path):
            logger.warning(f"Image file not found: {image_path}")
            return None
        
        img = Image.open(image_path)
        
        # Convert to RGB if necessary (for JPEG saving)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Create thumbnail maintaining aspect ratio
        img.thumbnail(max_size, Image.LANCZOS)
        
        # Generate thumbnail filename
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        thumb_filename = f"{base_name}_thumb.jpg"
        thumb_path = os.path.join(_image_dir(), thumb_filename)
        
        # Save compressed thumbnail
        img.save(thumb_path, format="JPEG", quality=quality, optimize=True)
        logger.info(f"Generated thumbnail: {thumb_path}")
        
        return thumb_path
        
    except Exception as e:
        logger.error(f"Failed to generate thumbnail for {image_path}: {e}")
        return None


def get_or_create_thumbnail(image_path: str | None, max_size: tuple[int, int] = (200, 200)) -> str | None:
    """Get existing thumbnail or create a new one.
    
    Args:
        image_path: Path to the original image file
        max_size: Maximum size for the thumbnail
    
    Returns:
        Path to the thumbnail file, or None if not available
    """
    if not image_path:
        return None
    
    # Check if thumbnail already exists
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    thumb_filename = f"{base_name}_thumb.jpg"
    thumb_path = os.path.join(_image_dir(), thumb_filename)
    
    if os.path.exists(thumb_path):
        # Check if thumbnail is newer than original, otherwise regenerate
        if os.path.getmtime(thumb_path) >= os.path.getmtime(image_path):
            return thumb_path
    
    # Generate new thumbnail
    return generate_thumbnail(image_path, max_size)

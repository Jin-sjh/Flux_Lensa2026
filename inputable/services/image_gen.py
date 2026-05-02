from __future__ import annotations

import logging
import os
from pathlib import Path

from PIL import Image
from services.llm_factory import LLMFactory
from services.llm_base import LLMError
from services.demo_service import is_demo_mode, demo_render

logger = logging.getLogger(__name__)


def _image_dir() -> str:
    return os.getenv("IMAGE_DIR", "images")


def _base_url() -> str:
    return os.getenv("BASE_URL", "http://localhost:7860")

_SUPPORTED_SIZES = [
    "1024x1024",
    "1024x1536",
    "1536x1024",
]

STYLE_MAP = {
    "A1": (
        "卡通学习卡片风格，字体大且圆润，背景柔和，每个词汇旁有可爱图标，色彩鲜艳。"
        "使用白色手写风格描边文字，在图片上叠加印尼语标注，不修改原始照片内容。"
    ),
    "A2": (
        "简约杂志风格，整洁排版，文字清晰，适合语言学习。"
        "使用白色细体字带轻微阴影，在图片上叠加印尼语标注，不修改原始照片内容。"
    ),
    "B1": (
        "小红书/朋友圈风格，手写体感觉，诗意，有电影感。"
        "白色文字带细微黑色描边，排版错落有致，在图片上叠加印尼语标注，不修改原始照片内容。"
    ),
}


def _get_best_size(image_path: str) -> str:
    """Pick the closest supported API size based on original image aspect ratio."""
    try:
        with Image.open(image_path) as img:
            w, h = img.size
        ratio = w / h
        best = _SUPPORTED_SIZES[0]
        best_diff = float("inf")
        for s in _SUPPORTED_SIZES:
            sw, sh = s.split("x")
            diff = abs(ratio - int(sw) / int(sh))
            if diff < best_diff:
                best_diff = diff
                best = s
        logger.info(f"Image {w}x{h} (ratio={ratio:.2f}) → API size {best}")
        return best
    except Exception as e:
        logger.warning(f"Could not read image dimensions ({e}), defaulting to 1024x1024")
        return "1024x1024"


async def render_card(
    annotations: list,
    caption: str,
    cefr: str,
    session_id: str,
    original_image_path: str,
) -> str:
    """Generate annotated card using OpenAI gpt-image-2 Edit API.

    Passes the original user photo as input — the model overlays text
    annotations without redrawing the scene content.

    Returns local file path to the saved PNG.
    Raises on failure — caller in render.py handles the fallback.
    """
    os.makedirs(_image_dir(), exist_ok=True)
    output_path = os.path.join(_image_dir(), f"{session_id}.png")

    if os.path.exists(output_path):
        logger.info(f"Image cache hit for session {session_id}")
        return output_path

    if is_demo_mode():
        return await demo_render(session_id)

    client = LLMFactory.get_openai_client()
    if client is None:
        raise LLMError("OpenAI client not available")
    
    style_desc = STYLE_MAP.get(cefr, STYLE_MAP["A1"])

    lines = [ann.get("label", "") for ann in annotations if ann.get("label")]
    annotation_block = "\n".join(lines)
    if caption:
        annotation_block += f"\n\n{caption}"

    prompt = (
        f"在这张照片上叠加以下印尼语文字标注。{style_desc}\n\n"
        f"需要叠加的文字内容：\n{annotation_block}\n\n"
        "重要要求：只添加文字标注层，不要改变或重绘原始照片的任何内容。"
        "文字排版美观，不遮挡画面主体，适合直接分享到社交媒体。"
    )

    image_url = await client.image_edit(
        image=Path(original_image_path),
        prompt=prompt,
        n=1,
        size=_get_best_size(original_image_path)
    )

    await client.download_image(image_url, Path(output_path))

    file_size = os.path.getsize(output_path) // 1024
    logger.info(f"Rendered card saved: {output_path} ({file_size} KB)")
    return output_path


def build_image_url(session_id: str) -> str:
    """Build the public URL for a rendered card image."""
    return f"{_base_url()}/images/{session_id}.png"

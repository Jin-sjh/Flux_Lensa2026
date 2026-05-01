from __future__ import annotations

import logging
import os

import httpx
from openai import OpenAI

logger = logging.getLogger(__name__)

IMAGE_DIR = os.getenv("IMAGE_DIR", "images")
BASE_URL = os.getenv("BASE_URL", "http://localhost:7860")

STYLE_MAP = {
    "A1": "卡通学习卡片风格，字体大且圆润，背景柔和，每个词汇旁有可爱图标，色彩鲜艳",
    "A2": "简约杂志风格，整洁排版，文字清晰，适合语言学习，白色背景",
    "B1": "小红书/朋友圈风格，手写体感觉，诗意，有电影感，白色文字带细微黑色描边",
}


def render_card(
    annotations: list,
    caption: str,
    cefr: str,
    session_id: str,
    original_image_path: str,
) -> str:
    """Generate annotated card using OpenAI Image Edit API.
    Passes the original user photo as input to preserve the scene.
    Downloads result to images/{session_id}.png.
    Returns the local file path.
    Raises on failure — caller handles fallback.
    """
    os.makedirs(IMAGE_DIR, exist_ok=True)
    output_path = os.path.join(IMAGE_DIR, f"{session_id}.png")

    # Cache check — skip API call if already rendered
    if os.path.exists(output_path):
        logger.info(f"Image cache hit for session {session_id}")
        return output_path

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    style_desc = STYLE_MAP.get(cefr, STYLE_MAP["A1"])

    # Build annotation text for the prompt
    lines = [ann.get("label", "") for ann in annotations if ann.get("label")]
    full_text = "\n".join(lines)
    if caption:
        full_text += f"\n\n{caption}"

    prompt = (
        f"在这张照片上叠加以下印尼语文字标注，{style_desc}。\n"
        f"文字内容：\n{full_text}\n\n"
        "要求：文字排版美观，不遮挡画面主体，适合直接分享到社交媒体。"
    )

    with open(original_image_path, "rb") as img_file:
        response = client.images.edit(
            model="gpt-image-1",
            image=img_file,
            prompt=prompt,
            n=1,
            size="1024x1024",
        )

    # Download the result image
    image_url = response.data[0].url
    with httpx.Client(timeout=60) as http:
        img_response = http.get(image_url)
        img_response.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(img_response.content)

    logger.info(f"Rendered card saved: {output_path}")
    return output_path


def build_image_url(session_id: str) -> str:
    """Build the public URL for a rendered card image."""
    return f"{BASE_URL}/images/{session_id}.png"

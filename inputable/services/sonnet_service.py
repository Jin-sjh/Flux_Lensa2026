from __future__ import annotations

import asyncio
import json
import logging
from models.schemas import Annotation, NewWord, OutputTask
from services.llm_factory import LLMFactory
from services.llm_base import LLMError
from services.demo_service import is_demo_mode, demo_generate

logger = logging.getLogger(__name__)

CEFR_CAPS = {"A1": 1, "A2": 2, "B1": 3}

HARDCODED_DEFAULT = {
    "annotations": [
        {
            "object": "scene",
            "label": "pemandangan indah",
            "new_words": [
                {
                    "word": "pemandangan",
                    "translation_zh": "风景",
                    "translation_en": "scenery",
                }
            ],
        }
    ],
    "caption": "Ini pemandangan yang indah.",
    "output_task": {
        "type": "fill_blank",
        "prompt": "Ini ___ yang indah.",
        "answer": "pemandangan",
    },
}


def _build_style_prompt(cefr: str) -> str:
    if cefr == "A1":
        return (
            "为每个物体生成一个印尼语「词汇标签」：\n"
            "- 格式：形容词 + 名词，最多4个词。\n"
            "- 全部使用A1核心词。\n"
            "- 每个标签后附中文释义，写法：pohon hijau（绿树）\n"
            f"- 最多引入{CEFR_CAPS['A1']}个新词，首次出现时括号内注中文释义。"
        )
    elif cefr == "A2":
        return (
            "为每个物体生成一句简单的印尼语描述句：\n"
            "- 完整单句，≤10个词。\n"
            "- 句式模板：Ini + [名词] 或 [名词] ini + [形容词] 或 [主语] + ada di [地点]。\n"
            f"- 最多引入{CEFR_CAPS['A2']}个新词，首次出现括号注中文。\n"
            "- 不要情感词或口语缩写，保持教科书式清晰。"
        )
    else:  # B1
        return (
            "为每个物体生成2-3句口语化、有情感的印尼语描述：\n"
            "- 风格像朋友聊天，可以使用 banget, kayak, deh 等口语词。\n"
            "- 可以加入比喻、感受或联想。\n"
            f"- 最多引入{CEFR_CAPS['B1']}个新词，首次出现括号注中文。"
        )


def enforce_i1_cap(new_vocab: list, cefr: str) -> list:
    """Hard-truncate new_vocab list to the CEFR cap."""
    cap = CEFR_CAPS.get(cefr, 1)
    return new_vocab[:cap]


async def generate_annotations(
    image_base64: str, cefr: str, learned_words: list[str]
) -> dict:
    """Call Claude Sonnet 4.6 with image + CEFR-tiered prompt.
    Returns parsed {annotations, caption, output_task}.
    Raises on failure — caller handles retry logic.
    """
    client = LLMFactory.get_anthropic_client()
    if client is None:
        logger.info("Anthropic client not available, falling back to OpenAI Vision")
        client = LLMFactory.get_openai_client()
        if client is None:
            raise LLMError("No LLM client available")
    
    words_list = learned_words[:60]
    style = _build_style_prompt(cefr)
    cap = CEFR_CAPS.get(cefr, 1)

    prompt_text = f"""你是印尼语语言教学助手。
用户CEFR水平：{cefr}。已掌握词汇（严格优先使用）：{words_list}。

请识别图片中的所有显眼物体，{style}

词汇约束（严格遵守）：
- 内容中90%的词必须来自已掌握词表
- 最多引入{cap}个新词

返回严格JSON，不要任何额外文本：
{{
  "annotations": [
    {{
      "object": "物体英文名",
      "label": "印尼语标注文字",
      "new_words": [{{"word": "词", "translation_zh": "中文", "translation_en": "英文"}}]
    }}
  ],
  "caption": "整张图的一句话总结（符合{cefr}水平）",
  "output_task": {{
    "type": "fill_blank",
    "prompt": "挑一个新词挖空作为题目",
    "answer": "答案"
  }}
}}
"""

    response = await client.vision_completion(
        image=image_base64,
        prompt=prompt_text,
        max_tokens=2048
    )

    raw = response["content"]
    return json.loads(raw)


async def generate_annotations_with_fallback(
    image_base64: str, cefr: str, learned_words: list[str]
) -> dict:
    """Calls generate_annotations with one retry. Returns HARDCODED_DEFAULT on double failure."""
    if is_demo_mode():
        return await demo_generate()

    for attempt in range(2):
        try:
            result = await generate_annotations(image_base64, cefr, learned_words)
            all_new_words = []
            for ann in result.get("annotations", []):
                all_new_words.extend(ann.get("new_words", []))

            capped = enforce_i1_cap(all_new_words, cefr)
            cap_remaining = len(capped)
            for ann in result.get("annotations", []):
                ann_new = ann.get("new_words", [])
                take = min(len(ann_new), cap_remaining)
                ann["new_words"] = ann_new[:take]
                cap_remaining -= take

            return result

        except Exception as e:
            logger.warning(f"Sonnet attempt {attempt + 1} failed: {e}")

    logger.error("Both Sonnet attempts failed — returning hardcoded default")
    return HARDCODED_DEFAULT

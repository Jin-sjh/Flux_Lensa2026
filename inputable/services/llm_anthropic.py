from __future__ import annotations

import base64
import logging
from pathlib import Path
from typing import Any

from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError, AuthenticationError

from services.llm_base import BaseLLMClient, LLMError, LLMTimeoutError
from services.llm_config import AnthropicConfig, LLMGeneralConfig

logger = logging.getLogger(__name__)


class AnthropicClient(BaseLLMClient):
    def __init__(self, config: AnthropicConfig, general_config: LLMGeneralConfig):
        super().__init__(general_config)
        self.config = config
        self.general_config = general_config
        self.client = Anthropic(
            api_key=config.api_key,
            base_url=config.base_url,
            timeout=general_config.timeout
        )
    
    async def chat_completion(
        self,
        messages: list[dict[str, Any]],
        **kwargs
    ) -> dict[str, Any]:
        @self._retry_with_backoff
        async def _call():
            try:
                model = kwargs.pop("model", self.config.model)
                max_tokens = kwargs.pop("max_tokens", 2048)
                system = kwargs.pop("system", None)
                
                anthropic_messages = self._convert_messages(messages)
                
                params = {
                    "model": model,
                    "max_tokens": max_tokens,
                    "messages": anthropic_messages,
                }
                
                if system:
                    params["system"] = system
                
                params.update(kwargs)
                
                response = self.client.messages.create(**params)
                
                return {
                    "content": response.content[0].text,
                    "role": response.role,
                    "model": response.model,
                    "usage": {
                        "input_tokens": response.usage.input_tokens,
                        "output_tokens": response.usage.output_tokens
                    }
                }
            except APITimeoutError as e:
                self._handle_error(e, "Anthropic chat completion timeout")
            except RateLimitError as e:
                self._handle_error(e, "Anthropic rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "Anthropic authentication")
            except APIError as e:
                self._handle_error(e, "Anthropic API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in Anthropic chat completion")
        
        return await _call()
    
    async def image_generation(
        self,
        prompt: str,
        **kwargs
    ) -> str:
        raise LLMError("Anthropic does not support image generation")
    
    async def image_edit(
        self,
        image: Path | bytes,
        prompt: str,
        **kwargs
    ) -> str:
        raise LLMError("Anthropic does not support image editing")
    
    async def vision_completion(
        self,
        image: Path | bytes | str,
        prompt: str,
        **kwargs
    ) -> dict[str, Any]:
        @self._retry_with_backoff
        async def _call():
            try:
                model = kwargs.pop("model", self.config.model)
                max_tokens = kwargs.pop("max_tokens", 2048)
                
                if isinstance(image, Path):
                    with open(image, "rb") as img_file:
                        image_data = base64.b64encode(img_file.read()).decode("utf-8")
                        media_type = self._get_media_type(image)
                elif isinstance(image, bytes):
                    image_data = base64.b64encode(image).decode("utf-8")
                    media_type = "image/jpeg"
                else:
                    image_data = image
                    media_type = "image/jpeg"
                
                response = self.client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": media_type,
                                        "data": image_data,
                                    },
                                },
                                {
                                    "type": "text",
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                )
                
                return {
                    "content": response.content[0].text,
                    "role": response.role,
                    "model": response.model,
                    "usage": {
                        "input_tokens": response.usage.input_tokens,
                        "output_tokens": response.usage.output_tokens
                    }
                }
            except APITimeoutError as e:
                self._handle_error(e, "Anthropic vision completion timeout")
            except RateLimitError as e:
                self._handle_error(e, "Anthropic rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "Anthropic authentication")
            except APIError as e:
                self._handle_error(e, "Anthropic API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in Anthropic vision completion")
        
        return await _call()
    
    def _convert_messages(self, messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
        anthropic_messages = []
        
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            if role == "system":
                continue
            
            anthropic_messages.append({
                "role": role,
                "content": content
            })
        
        return anthropic_messages
    
    def _get_media_type(self, image_path: Path) -> str:
        suffix = image_path.suffix.lower()
        media_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp"
        }
        return media_types.get(suffix, "image/jpeg")

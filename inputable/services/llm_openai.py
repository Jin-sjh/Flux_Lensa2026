from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import httpx
from openai import OpenAI, APIError, APITimeoutError, RateLimitError, AuthenticationError

from services.llm_base import BaseLLMClient, LLMError, LLMTimeoutError
from services.llm_config import OpenAIConfig, LLMGeneralConfig

logger = logging.getLogger(__name__)


class OpenAIClient(BaseLLMClient):
    def __init__(self, config: OpenAIConfig, general_config: LLMGeneralConfig):
        super().__init__(general_config)
        self.config = config
        self.general_config = general_config
        self.client = OpenAI(
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
                model = kwargs.pop("model", self.config.model_text)
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    **kwargs
                )
                
                return {
                    "content": response.choices[0].message.content,
                    "role": response.choices[0].message.role,
                    "model": response.model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens
                    }
                }
            except APITimeoutError as e:
                self._handle_error(e, "OpenAI chat completion timeout")
            except RateLimitError as e:
                self._handle_error(e, "OpenAI rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "OpenAI authentication")
            except APIError as e:
                self._handle_error(e, "OpenAI API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in OpenAI chat completion")
        
        return await _call()
    
    async def image_generation(
        self,
        prompt: str,
        **kwargs
    ) -> str:
        @self._retry_with_backoff
        async def _call():
            try:
                model = kwargs.pop("model", self.config.model_image)
                size = kwargs.pop("size", "1024x1024")
                n = kwargs.pop("n", 1)
                
                response = self.client.images.generate(
                    model=model,
                    prompt=prompt,
                    size=size,
                    n=n,
                    **kwargs
                )
                
                return response.data[0].url
            except APITimeoutError as e:
                self._handle_error(e, "OpenAI image generation timeout")
            except RateLimitError as e:
                self._handle_error(e, "OpenAI rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "OpenAI authentication")
            except APIError as e:
                self._handle_error(e, "OpenAI API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in OpenAI image generation")
        
        return await _call()
    
    async def image_edit(
        self,
        image: Path | bytes,
        prompt: str,
        **kwargs
    ) -> str:
        @self._retry_with_backoff
        async def _call():
            try:
                model = kwargs.pop("model", self.config.model_image)
                size = kwargs.pop("size", "1024x1024")
                n = kwargs.pop("n", 1)
                
                if isinstance(image, Path):
                    with open(image, "rb") as img_file:
                        image_data = img_file
                        response = self.client.images.edit(
                            model=model,
                            image=image_data,
                            prompt=prompt,
                            size=size,
                            n=n,
                            **kwargs
                        )
                else:
                    import io
                    image_data = io.BytesIO(image)
                    response = self.client.images.edit(
                        model=model,
                        image=image_data,
                        prompt=prompt,
                        size=size,
                        n=n,
                        **kwargs
                    )
                
                image_url = response.data[0].url
                
                return image_url
            except APITimeoutError as e:
                self._handle_error(e, "OpenAI image edit timeout")
            except RateLimitError as e:
                self._handle_error(e, "OpenAI rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "OpenAI authentication")
            except APIError as e:
                self._handle_error(e, "OpenAI API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in OpenAI image edit")
        
        return await _call()
    
    async def vision_completion(
        self,
        image: Path | bytes | str,
        prompt: str,
        **kwargs
    ) -> dict[str, Any]:
        """Vision completion using GPT-4 Vision API."""
        @self._retry_with_backoff
        async def _call():
            try:
                model = kwargs.pop("model", self.config.model_text)
                max_tokens = kwargs.pop("max_tokens", 2048)
                
                if isinstance(image, Path):
                    with open(image, "rb") as img_file:
                        import base64
                        image_data = base64.b64encode(img_file.read()).decode("utf-8")
                elif isinstance(image, bytes):
                    import base64
                    image_data = base64.b64encode(image).decode("utf-8")
                else:
                    image_data = image
                
                response = self.client.chat.completions.create(
                    model=model,
                    max_tokens=max_tokens,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_data}"
                                    }
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
                    "content": response.choices[0].message.content,
                    "role": response.choices[0].message.role,
                    "model": response.model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens
                    }
                }
            except APITimeoutError as e:
                self._handle_error(e, "OpenAI vision completion timeout")
            except RateLimitError as e:
                self._handle_error(e, "OpenAI rate limit")
            except AuthenticationError as e:
                self._handle_error(e, "OpenAI authentication")
            except APIError as e:
                self._handle_error(e, "OpenAI API error")
            except Exception as e:
                self._handle_error(e, "Unexpected error in OpenAI vision completion")
        
        return await _call()
    
    async def download_image(self, url: str, output_path: Path) -> None:
        max_retries = self.general_config.max_retries
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                import ssl
                ssl_ctx = ssl.create_default_context()
                ssl_ctx.check_hostname = True
                ssl_ctx.verify_mode = ssl.CERT_REQUIRED
                ssl_ctx.options |= 0x4

                async with httpx.AsyncClient(timeout=self.general_config.timeout, verify=ssl_ctx) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    
                    with open(output_path, "wb") as f:
                        f.write(response.content)
                    
                    self.logger.info(f"Image downloaded to {output_path}")
                    return
                    
            except Exception as e:
                last_exception = e
                self.logger.warning(
                    f"Image download failed on attempt {attempt + 1}/{max_retries + 1}: {e}"
                )
                if attempt < max_retries:
                    wait_time = 2 ** attempt
                    self.logger.info(f"Retrying in {wait_time} seconds...")
                    import asyncio
                    await asyncio.sleep(wait_time)
        
        self._handle_error(last_exception, f"Failed to download image from {url} after {max_retries + 1} attempts")

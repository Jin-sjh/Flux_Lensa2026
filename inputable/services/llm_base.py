from __future__ import annotations

import asyncio
import logging
import functools
from abc import ABC, abstractmethod
from typing import Any, Callable, Optional, TypeVar
from pathlib import Path

from services.llm_config import LLMGeneralConfig

logger = logging.getLogger(__name__)

T = TypeVar('T')


class LLMError(Exception):
    pass


class LLMRetryError(LLMError):
    pass


class LLMTimeoutError(LLMError):
    pass


class BaseLLMClient(ABC):
    def __init__(self, config: LLMGeneralConfig):
        self.general_config = config
        self.logger = logger if config.enable_logging else logging.getLogger(__name__)
    
    @abstractmethod
    async def chat_completion(
        self,
        messages: list[dict[str, Any]],
        **kwargs
    ) -> dict[str, Any]:
        pass
    
    @abstractmethod
    async def image_generation(
        self,
        prompt: str,
        **kwargs
    ) -> str:
        pass
    
    @abstractmethod
    async def image_edit(
        self,
        image: Path | bytes,
        prompt: str,
        **kwargs
    ) -> str:
        pass
    
    def _retry_with_backoff(
        self,
        func: Callable[..., T],
        max_retries: Optional[int] = None
    ) -> Callable[..., T]:
        if max_retries is None:
            max_retries = self.general_config.max_retries
        
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except LLMTimeoutError as e:
                    last_exception = e
                    self.logger.warning(
                        f"LLM timeout on attempt {attempt + 1}/{max_retries + 1}: {e}"
                    )
                    if attempt < max_retries:
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                except LLMError as e:
                    last_exception = e
                    self.logger.warning(
                        f"LLM error on attempt {attempt + 1}/{max_retries + 1}: {e}"
                    )
                    if attempt < max_retries:
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                except Exception as e:
                    last_exception = e
                    self.logger.error(
                        f"Unexpected error on attempt {attempt + 1}/{max_retries + 1}: {e}",
                        exc_info=True
                    )
                    if attempt < max_retries:
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
            
            raise LLMRetryError(
                f"All {max_retries + 1} attempts failed. Last error: {last_exception}"
            )
        
        return wrapper
    
    def _handle_error(self, error: Exception, context: str = "") -> None:
        error_msg = f"{context}: {str(error)}" if context else str(error)
        
        if "timeout" in str(error).lower():
            raise LLMTimeoutError(error_msg)
        
        if "rate limit" in str(error).lower():
            raise LLMError(f"Rate limit exceeded: {error_msg}")
        
        if "api key" in str(error).lower() or "authentication" in str(error).lower():
            raise LLMError(f"Authentication error: {error_msg}")
        
        raise LLMError(error_msg)

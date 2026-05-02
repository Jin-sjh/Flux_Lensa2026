from __future__ import annotations

import os
import logging
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class OpenAIConfig:
    api_key: str
    base_url: str = "https://api.openai.com/v1"
    model_text: str = "gpt-4"
    model_image: str = "gpt-image-1"
    
    @classmethod
    def from_env(cls) -> Optional[OpenAIConfig]:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not set — OpenAI client will not be available")
            return None
        
        return cls(
            api_key=api_key,
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            model_text=os.getenv("OPENAI_MODEL_TEXT", "gpt-4"),
            model_image=os.getenv("OPENAI_MODEL_IMAGE", "gpt-image-1"),
        )


@dataclass
class AnthropicConfig:
    api_key: str
    base_url: str = "https://api.anthropic.com"
    model: str = "claude-sonnet-4-5"
    
    @classmethod
    def from_env(cls) -> Optional[AnthropicConfig]:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not set — Anthropic client will not be available")
            return None
        
        return cls(
            api_key=api_key,
            base_url=os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com"),
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5"),
        )


@dataclass
class LLMGeneralConfig:
    max_retries: int = 2
    timeout: int = 60
    enable_logging: bool = True
    
    @classmethod
    def from_env(cls) -> LLMGeneralConfig:
        return cls(
            max_retries=int(os.getenv("LLM_MAX_RETRIES", "2")),
            timeout=int(os.getenv("LLM_TIMEOUT", "60")),
            enable_logging=os.getenv("LLM_ENABLE_LOGGING", "true").lower() == "true",
        )


@dataclass
class LLMConfig:
    openai: Optional[OpenAIConfig] = None
    anthropic: Optional[AnthropicConfig] = None
    general: LLMGeneralConfig = field(default_factory=LLMGeneralConfig)
    
    @classmethod
    def from_env(cls) -> LLMConfig:
        openai_config = OpenAIConfig.from_env()
        anthropic_config = AnthropicConfig.from_env()
        general_config = LLMGeneralConfig.from_env()
        
        if not openai_config and not anthropic_config:
            logger.error("No LLM API keys configured — at least one provider is required")
        
        return cls(
            openai=openai_config,
            anthropic=anthropic_config,
            general=general_config,
        )
    
    def validate(self) -> bool:
        if not self.openai and not self.anthropic:
            logger.error("At least one LLM provider must be configured")
            return False
        
        if self.general.max_retries < 0:
            logger.error("LLM_MAX_RETRIES must be >= 0")
            return False
        
        if self.general.timeout <= 0:
            logger.error("LLM_TIMEOUT must be > 0")
            return False
        
        return True

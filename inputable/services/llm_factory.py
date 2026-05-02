from __future__ import annotations

import logging
from typing import Optional

from services.llm_base import BaseLLMClient
from services.llm_config import LLMConfig
from services.llm_openai import OpenAIClient
from services.llm_anthropic import AnthropicClient

logger = logging.getLogger(__name__)


class LLMFactory:
    _instance: Optional[LLMFactory] = None
    _config: Optional[LLMConfig] = None
    _openai_client: Optional[OpenAIClient] = None
    _anthropic_client: Optional[AnthropicClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    def initialize(cls, config: Optional[LLMConfig] = None) -> None:
        if config is None:
            config = LLMConfig.from_env()
        
        if not config.validate():
            raise ValueError("Invalid LLM configuration")
        
        cls._config = config
        logger.info("LLM Factory initialized successfully")
    
    @classmethod
    def get_openai_client(cls) -> Optional[OpenAIClient]:
        if cls._config is None:
            cls.initialize()
        
        if cls._config is None or cls._config.openai is None:
            logger.warning("OpenAI client not available - configuration missing")
            return None
        
        if cls._openai_client is None:
            cls._openai_client = OpenAIClient(
                config=cls._config.openai,
                general_config=cls._config.general
            )
            logger.info("OpenAI client created")
        
        return cls._openai_client
    
    @classmethod
    def get_anthropic_client(cls) -> Optional[AnthropicClient]:
        if cls._config is None:
            cls.initialize()
        
        if cls._config is None or cls._config.anthropic is None:
            logger.warning("Anthropic client not available - configuration missing")
            return None
        
        if cls._anthropic_client is None:
            cls._anthropic_client = AnthropicClient(
                config=cls._config.anthropic,
                general_config=cls._config.general
            )
            logger.info("Anthropic client created")
        
        return cls._anthropic_client
    
    @classmethod
    def get_client(cls, provider: str = "openai") -> Optional[BaseLLMClient]:
        provider = provider.lower()
        
        if provider == "openai":
            return cls.get_openai_client()
        elif provider == "anthropic":
            return cls.get_anthropic_client()
        else:
            logger.error(f"Unknown LLM provider: {provider}")
            return None
    
    @classmethod
    def reset(cls) -> None:
        cls._config = None
        cls._openai_client = None
        cls._anthropic_client = None
        logger.info("LLM Factory reset")
    
    @classmethod
    def is_openai_available(cls) -> bool:
        if cls._config is None:
            cls.initialize()
        return cls._config is not None and cls._config.openai is not None
    
    @classmethod
    def is_anthropic_available(cls) -> bool:
        if cls._config is None:
            cls.initialize()
        return cls._config is not None and cls._config.anthropic is not None

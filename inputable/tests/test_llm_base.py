import pytest
import os
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock
import asyncio

from services.llm_config import LLMConfig, OpenAIConfig, AnthropicConfig, LLMGeneralConfig
from services.llm_base import BaseLLMClient, LLMError, LLMRetryError, LLMTimeoutError
from services.llm_factory import LLMFactory


class TestLLMConfig:
    def test_openai_config_from_env(self):
        with patch.dict(os.environ, {
            "OPENAI_API_KEY": "test-key",
            "OPENAI_BASE_URL": "https://test.com",
            "OPENAI_MODEL_TEXT": "gpt-3.5",
            "OPENAI_MODEL_IMAGE": "dall-e-2"
        }):
            config = OpenAIConfig.from_env()
            assert config is not None
            assert config.api_key == "test-key"
            assert config.base_url == "https://test.com"
            assert config.model_text == "gpt-3.5"
            assert config.model_image == "dall-e-2"
    
    def test_openai_config_missing_key(self):
        with patch.dict(os.environ, {}, clear=True):
            config = OpenAIConfig.from_env()
            assert config is None
    
    def test_anthropic_config_from_env(self):
        with patch.dict(os.environ, {
            "ANTHROPIC_API_KEY": "test-key",
            "ANTHROPIC_BASE_URL": "https://test.com",
            "ANTHROPIC_MODEL": "claude-3"
        }):
            config = AnthropicConfig.from_env()
            assert config is not None
            assert config.api_key == "test-key"
            assert config.base_url == "https://test.com"
            assert config.model == "claude-3"
    
    def test_anthropic_config_missing_key(self):
        with patch.dict(os.environ, {}, clear=True):
            config = AnthropicConfig.from_env()
            assert config is None
    
    def test_llm_general_config_defaults(self):
        with patch.dict(os.environ, {}, clear=True):
            config = LLMGeneralConfig.from_env()
            assert config.max_retries == 2
            assert config.timeout == 60
            assert config.enable_logging == True
    
    def test_llm_general_config_from_env(self):
        with patch.dict(os.environ, {
            "LLM_MAX_RETRIES": "5",
            "LLM_TIMEOUT": "120",
            "LLM_ENABLE_LOGGING": "false"
        }):
            config = LLMGeneralConfig.from_env()
            assert config.max_retries == 5
            assert config.timeout == 120
            assert config.enable_logging == False
    
    def test_llm_config_validation(self):
        config = LLMConfig(
            openai=OpenAIConfig(api_key="test"),
            anthropic=AnthropicConfig(api_key="test"),
            general=LLMGeneralConfig()
        )
        assert config.validate() == True
    
    def test_llm_config_validation_no_providers(self):
        config = LLMConfig(
            general=LLMGeneralConfig()
        )
        assert config.validate() == False
    
    def test_llm_config_validation_invalid_retries(self):
        config = LLMConfig(
            openai=OpenAIConfig(api_key="test"),
            general=LLMGeneralConfig(max_retries=-1)
        )
        assert config.validate() == False
    
    def test_llm_config_validation_invalid_timeout(self):
        config = LLMConfig(
            openai=OpenAIConfig(api_key="test"),
            general=LLMGeneralConfig(timeout=0)
        )
        assert config.validate() == False


class TestLLMFactory:
    def teardown_method(self):
        LLMFactory.reset()
    
    def test_factory_initialization(self):
        with patch.dict(os.environ, {
            "OPENAI_API_KEY": "test-key",
            "ANTHROPIC_API_KEY": "test-key"
        }):
            LLMFactory.initialize()
            assert LLMFactory._config is not None
    
    def test_factory_initialization_invalid_config(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError):
                LLMFactory.initialize()
    
    def test_get_openai_client(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            LLMFactory.initialize()
            client = LLMFactory.get_openai_client()
            assert client is not None
    
    def test_get_openai_client_not_available(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError):
                LLMFactory.initialize()
    
    def test_get_anthropic_client(self):
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            LLMFactory.initialize()
            client = LLMFactory.get_anthropic_client()
            assert client is not None
    
    def test_get_anthropic_client_not_available(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError):
                LLMFactory.initialize()
    
    def test_is_openai_available(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            LLMFactory.initialize()
            assert LLMFactory.is_openai_available() == True
    
    def test_is_anthropic_available(self):
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            LLMFactory.initialize()
            assert LLMFactory.is_anthropic_available() == True
    
    def test_reset(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            LLMFactory.initialize()
            LLMFactory.reset()
            assert LLMFactory._config is None
            assert LLMFactory._openai_client is None


class TestBaseLLMClient:
    def test_retry_with_backoff_success(self):
        config = LLMGeneralConfig(max_retries=2)
        client = Mock(spec=BaseLLMClient, config=config)
        
        async def success_func():
            return "success"
        
        wrapped = BaseLLMClient._retry_with_backoff(client, success_func, max_retries=2)
        result = asyncio.run(wrapped())
        assert result == "success"
    
    def test_retry_with_backoff_all_failures(self):
        config = LLMGeneralConfig(max_retries=2)
        client = Mock(spec=BaseLLMClient, config=config)
        client.logger = Mock()
        
        async def fail_func():
            raise LLMError("test error")
        
        wrapped = BaseLLMClient._retry_with_backoff(client, fail_func, max_retries=2)
        
        with pytest.raises(LLMRetryError):
            asyncio.run(wrapped())
    
    def test_handle_error_timeout(self):
        config = LLMGeneralConfig()
        client = Mock(spec=BaseLLMClient, config=config)
        
        error = Exception("timeout occurred")
        with pytest.raises(LLMTimeoutError):
            BaseLLMClient._handle_error(client, error, "test context")
    
    def test_handle_error_rate_limit(self):
        config = LLMGeneralConfig()
        client = Mock(spec=BaseLLMClient, config=config)
        
        error = Exception("rate limit exceeded")
        with pytest.raises(LLMError, match="Rate limit exceeded"):
            BaseLLMClient._handle_error(client, error, "test context")
    
    def test_handle_error_auth(self):
        config = LLMGeneralConfig()
        client = Mock(spec=BaseLLMClient, config=config)
        
        error = Exception("api key invalid")
        with pytest.raises(LLMError, match="Authentication error"):
            BaseLLMClient._handle_error(client, error, "test context")

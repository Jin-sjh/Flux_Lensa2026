# 大模型API调用抽象重构计划

## 一、目标

将当前分散的大模型API调用代码抽象为一个OpenAI-like的通用基类，统一管理所有API配置，提高代码的可维护性和扩展性。

## 二、当前状况分析

### 2.1 现有API调用情况

1. **Anthropic Claude API** ([sonnet_service.py](file:///d:/迅雷云盘/Flux_Lensa2026/inputable/services/sonnet_service.py))
   - 用途：图像识别、文本生成、词汇标注
   - 模型：claude-sonnet-4-5
   - 调用方式：直接创建 `Anthropic` 客户端

2. **OpenAI API** ([image_gen.py](file:///d:/迅雷云盘/Flux_Lensa2026/inputable/services/image_gen.py))
   - 用途：图像编辑、文字叠加
   - 模型：gpt-image-1
   - 调用方式：直接创建 `OpenAI` 客户端

### 2.2 存在的问题

- API客户端创建分散在各个服务文件中
- 缺乏统一的配置管理
- 错误处理和重试逻辑重复
- 日志记录不统一
- 难以扩展支持新的大模型API

## 三、设计方案

### 3.1 架构设计

创建三层架构：

```
BaseLLMClient (抽象基类)
    ├── OpenAIClient (OpenAI实现)
    ├── AnthropicClient (Anthropic实现)
    └── 其他LLM实现...
```

### 3.2 核心组件

#### 3.2.1 配置管理 (`services/llm_config.py`)
- 统一管理所有LLM API配置
- 从环境变量加载配置
- 提供配置验证

#### 3.2.2 基类设计 (`services/llm_base.py`)
- 定义统一的接口规范
- 提供通用的错误处理
- 实现重试机制
- 统一日志记录

#### 3.2.3 具体实现类
- `services/llm_openai.py`：OpenAI API实现
- `services/llm_anthropic.py`：Anthropic API实现

#### 3.2.4 客户端工厂 (`services/llm_factory.py`)
- 根据配置创建对应的LLM客户端
- 管理客户端实例缓存

## 四、实施步骤

### 步骤1：创建配置管理模块
**文件**: `inputable/services/llm_config.py`

**功能**:
- 定义LLM配置数据类
- 从环境变量加载配置
- 验证必需的配置项

**配置项**:
```python
# OpenAI配置
OPENAI_API_KEY
OPENAI_BASE_URL (可选，默认https://api.openai.com/v1)
OPENAI_MODEL_TEXT (可选，默认gpt-4)
OPENAI_MODEL_IMAGE (可选，默认gpt-image-1)

# Anthropic配置
ANTHROPIC_API_KEY
ANTHROPIC_BASE_URL (可选)
ANTHROPIC_MODEL (可选，默认claude-sonnet-4-5)

# 通用配置
LLM_MAX_RETRIES (可选，默认2)
LLM_TIMEOUT (可选，默认60)
LLM_ENABLE_LOGGING (可选，默认True)
```

### 步骤2：创建抽象基类
**文件**: `inputable/services/llm_base.py`

**核心方法**:
```python
class BaseLLMClient(ABC):
    @abstractmethod
    async def chat_completion(self, messages, **kwargs) -> dict
    
    @abstractmethod
    async def image_generation(self, prompt, **kwargs) -> str
    
    @abstractmethod
    async def image_edit(self, image, prompt, **kwargs) -> str
    
    def _handle_error(self, error)
    def _retry_with_backoff(self, func, max_retries)
```

### 步骤3：实现OpenAI客户端
**文件**: `inputable/services/llm_openai.py`

**功能**:
- 继承 `BaseLLMClient`
- 实现OpenAI特定的API调用
- 处理OpenAI特定的错误

### 步骤4：实现Anthropic客户端
**文件**: `inputable/services/llm_anthropic.py`

**功能**:
- 继承 `BaseLLMClient`
- 实现Anthropic特定的API调用
- 将Anthropic的消息格式转换为统一格式

### 步骤5：创建客户端工厂
**文件**: `inputable/services/llm_factory.py`

**功能**:
- 提供统一的客户端创建接口
- 管理客户端实例缓存
- 支持动态切换不同的LLM提供商

### 步骤6：重构现有服务
**文件**: 
- `inputable/services/sonnet_service.py`
- `inputable/services/image_gen.py`

**改动**:
- 移除直接的API客户端创建代码
- 使用工厂获取LLM客户端
- 保持原有业务逻辑不变

### 步骤7：更新环境变量配置
**文件**: `inputable/.env.example` (新建)

**内容**:
```
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_TEXT=gpt-4
OPENAI_MODEL_IMAGE=gpt-image-1

# Anthropic API Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-sonnet-4-5

# LLM General Configuration
LLM_MAX_RETRIES=2
LLM_TIMEOUT=60
LLM_ENABLE_LOGGING=true

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///./app.db

# Application Configuration
IMAGE_DIR=images
ANKI_DIR=anki
BASE_URL=http://localhost:7860
SECRET_KEY=your-secret-key-here
```

### 步骤8：更新主应用配置
**文件**: `inputable/main.py`

**改动**:
- 更新环境变量检查逻辑
- 添加LLM配置验证

### 步骤9：添加单元测试
**文件**: `inputable/tests/test_llm_base.py` (新建)

**测试内容**:
- 配置加载测试
- 客户端创建测试
- 错误处理测试
- 重试机制测试

## 五、文件清单

### 新建文件
1. `inputable/services/llm_config.py` - 配置管理
2. `inputable/services/llm_base.py` - 抽象基类
3. `inputable/services/llm_openai.py` - OpenAI实现
4. `inputable/services/llm_anthropic.py` - Anthropic实现
5. `inputable/services/llm_factory.py` - 客户端工厂
6. `inputable/.env.example` - 环境变量示例
7. `inputable/tests/test_llm_base.py` - 单元测试

### 修改文件
1. `inputable/services/sonnet_service.py` - 重构API调用
2. `inputable/services/image_gen.py` - 重构API调用
3. `inputable/main.py` - 更新配置检查
4. `inputable/services/__init__.py` - 导出新模块

## 六、优势

1. **统一管理**：所有LLM API配置集中在.env文件
2. **易于扩展**：新增LLM提供商只需实现基类
3. **错误处理**：统一的异常处理和重试机制
4. **日志记录**：统一的API调用日志
5. **代码复用**：消除重复的客户端创建代码
6. **测试友好**：便于mock和单元测试

## 七、注意事项

1. 保持向后兼容，不改变现有API接口
2. 确保所有环境变量都有合理的默认值或提示
3. 添加详细的文档注释
4. 保持原有的错误处理逻辑不变
5. 确保异步操作的正确性

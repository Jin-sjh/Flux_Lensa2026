# Lensa 项目概述

## 项目简介

**Lensa** 是一个基于 AI 的印尼语学习应用，核心功能是通过**拍照识别物体**来学习印尼语词汇，采用 **i+1 输入假说** 和 **FSRS 间隔重复算法** 进行个性化学习。

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend                              │
│  (react-frontend/)                                              │
│  ├── AuthPage - 认证页面                                        │
│  ├── LevelTest - 水平测试                                       │
│  ├── MyLearningPage - 学习页面                                   │
│  ├── Practice - 练习模块                                         │
│  └── AnkiExportPage - Anki导出                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                                │
│  (inputable/main.py)                                            │
│  ├── /api/generate - 图片识别+标注生成                           │
│  ├── /api/render - 渲染学习卡片                                  │
│  ├── /api/evaluate - 评估用户答案                                │
│  ├── /api/placement_test - 水平测试                              │
│  └── /api/export_anki - 导出Anki牌组                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Claude Sonnet │  │  OpenAI GPT   │  │   SQLite      │
│ (图片识别)     │  │  (图片渲染)   │  │   Database    │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 核心功能

### 1. 智能图片识别与词汇标注

- 用户上传/拍摄图片，系统自动识别图片中的物体
- 调用 **Claude Sonnet 4.5** API 进行图像理解
- 为每个识别的物体生成印尼语标注（词汇标签或描述句）
- 自动生成填空练习题

**代码位置**: `inputable/routers/generate.py` | `inputable/services/sonnet_service.py`

---

### 2. i+1 输入假说实现

- 根据用户 CEFR 等级严格控制每次引入的新词数量
  - **A1**: 最多 1 个新词
  - **A2**: 最多 2 个新词
  - **B1**: 最多 3 个新词
- 优先使用用户已掌握的词汇生成内容
- 确保学习内容略高于当前水平，符合语言习得理论

**代码位置**: `inputable/services/sonnet_service.py`

---

### 3. CEFR 分级学习系统

- **水平测试**: 通过词汇测试确定用户初始等级
- **自适应升级**: 根据掌握词汇量自动升级
  - A1 → A2: 掌握 ≥8 个词汇
  - A2 → B1: 掌握 ≥20 个词汇
- **分级内容生成**: 不同等级生成不同风格的学习内容
  - A1: 词汇标签（形容词+名词）
  - A2: 简单描述句
  - B1: 口语化描述

**代码位置**: `inputable/services/user_model.py`

---

### 4. FSRS 间隔重复算法

- 根据答题正确性动态调整复习间隔
- **正确**: 间隔 × 难度因子，难度因子 +0.1
- **错误**: 间隔重置为 1，难度因子 -0.2
- 词汇状态自动转换:
  - `interval ≥ 21` → mastered (已掌握)
  - `interval ≥ 7` → learned (已学会)
  - `interval < 7` → learning (学习中)

**代码位置**: `inputable/services/user_model.py`

---

### 5. AI 图片渲染生成

- 调用 **OpenAI GPT-Image-1** API 在原图上叠加标注
- 根据 CEFR 等级选择不同视觉风格:
  - **A1**: 卡通学习卡片风格，字体大且圆润
  - **A2**: 简约杂志风格，整洁排版
  - **B1**: 小红书/朋友圈风格，有电影感
- 支持图片缓存，避免重复生成

**代码位置**: `inputable/services/image_gen.py`

---

### 6. Anki 牌组导出

- 将学习过的词汇导出为 **.apkg** 格式
- 每张卡片包含: 词汇、翻译、例句、图片
- 支持导入到 Anki 进行间隔重复复习

**代码位置**: `inputable/services/anki_builder.py`

---

### 7. 用户认证与个性化

- 用户注册/登录系统
- 每个用户独立的学习进度追踪
- 个人词汇库管理

**代码位置**: `inputable/routers/users.py`

---

### 8. 练习与即时反馈

- 填空题练习形式
- 即时判断答案正误
- 提供详细反馈信息（正确答案、用户答案）
- 自动更新词汇学习状态

**代码位置**: `inputable/routers/evaluate.py`

---

## 核心处理流程

### 流程 1: 用户认证与水平测试

```
用户打开应用
    │
    ├── 未认证 → AuthPage (登录/注册)
    │
    └── 已认证但未测试 → LevelTest
                              │
                              ▼
                    POST /api/placement_test
                              │
                    ┌─────────┴─────────┐
                    │ 已知词汇列表       │
                    │ (A1/A2/B1测试词)  │
                    └─────────┬─────────┘
                              ▼
                    compute_cefr() 计算CEFR等级
                              │
                              ▼
                    seed_known_words() 初始化词汇状态
```

---

### 流程 2: 图片上传与标注生成

```
用户上传/拍摄图片
    │
    ▼
POST /api/generate
    │
    ├── 1. 获取/创建用户 → get_or_create_user()
    │
    ├── 2. 保存图片 → save_uploaded_image()
    │
    ├── 3. 获取已学词汇 → get_learned_vocabulary()
    │       (用于 i+1 约束)
    │
    ├── 4. 调用 Claude Sonnet API
    │       │
    │       ▼
    │   generate_annotations_with_fallback()
    │       │
    │       ├── 构建CEFR级别提示词
    │       │   ├── A1: 词汇标签 (形容词+名词)
    │       │   ├── A2: 简单描述句
    │       │   └── B1: 口语化描述
    │       │
    │       ├── i+1 约束: 新词数量限制
    │       │   ├── A1: 最多1个新词
    │       │   ├── A2: 最多2个新词
    │       │   └── B1: 最多3个新词
    │       │
    │       └── 返回: {annotations, caption, output_task}
    │
    ├── 5. 解析结果为类型化对象
    │
    └── 6. 持久化会话到数据库
            │
            ▼
        返回 GenerateResponse
        (session_id, annotations, caption, output_task)
```

---

### 流程 3: 学习卡片渲染

```
GET /api/render?session_id=xxx
    │
    ├── 1. 获取会话信息
    │
    ├── 2. 获取用户CEFR等级
    │
    ├── 3. 解析标注数据
    │
    └── 4. 调用 OpenAI GPT-Image-1 API
            │
            ▼
        render_card()
            │
            ├── 检查缓存 (已渲染则跳过)
            │
            ├── 根据CEFR选择风格
            │   ├── A1: 卡通学习卡片风格
            │   ├── A2: 简约杂志风格
            │   └── B1: 小红书/朋友圈风格
            │
            └── 生成带标注的图片
                    │
                    ▼
            保存到 images/{session_id}.png
```

---

### 流程 4: 用户练习与评估

```
用户填写填空题答案
    │
    ▼
POST /api/evaluate
    │
    ├── 1. 获取会话
    │
    ├── 2. 比较答案 (忽略大小写和空格)
    │
    ├── 3. 对每个新词应用 FSRS 更新
    │       │
    │       ▼
    │   apply_fsrs_update(record, is_correct)
    │       │
    │       ├── 正确: interval *= ease_factor, ease += 0.1
    │       │   └── interval >= 21 → mastered
    │       │   └── interval >= 7 → learned
    │       │
    │       └── 错误: interval = 1, ease -= 0.2
    │
    ├── 4. 更新会话反馈
    │
    └── 5. 检查CEFR升级
            │
            ▼
        maybe_upgrade_cefr()
            │
            ├── A1 → A2: learned+mastered >= 8词
            └── A2 → B1: learned+mastered >= 20词
```

---

### 流程 5: Anki 导出

```
GET /api/export_anki?user_id=xxx
    │
    ├── 1. 验证用户存在
    │
    └── 2. 构建Anki牌组
            │
            ▼
        build_deck()
            │
            ├── 获取用户所有学习会话
            │
            ├── 遍历新词汇
            │   ├── 从词汇缓存获取详情
            │   └── 创建 Anki Note
            │
            └── 生成 .apkg 文件
                    │
                    ▼
            返回文件下载
```

---

## 数据模型

| 模型 | 用途 | 主要字段 |
|------|------|----------|
| `User` | 用户信息 | user_id, target_lang, estimated_cefr |
| `UserWordStatus` | 词汇学习状态 | user_id, word, status, interval, ease_factor |
| `LearningSession` | 学习会话记录 | session_id, user_id, image_path, new_vocab, output_task |
| `AnkiExport` | Anki导出记录 | export_id, user_id, apkg_path |

**代码位置**: `inputable/models/db_models.py`

---

## 核心算法

### 1. i+1 输入假说

根据 CEFR 等级严格控制每次引入的新词数量，确保学习内容略高于当前水平。

### 2. FSRS 间隔重复算法

根据答题正确性动态调整复习间隔，实现科学的记忆曲线管理。

### 3. CEFR 自适应升级

根据掌握词汇量自动升级学习难度，实现个性化学习路径。

---

## 项目结构

```
Flux_Lensa2026/
├── inputable/                 # 后端服务
│   ├── main.py               # FastAPI 入口
│   ├── routers/              # API 路由
│   │   ├── generate.py       # 图片识别+标注
│   │   ├── render.py         # 卡片渲染
│   │   ├── evaluate.py       # 答案评估
│   │   ├── placement.py      # 水平测试
│   │   └── export_anki.py    # Anki导出
│   ├── services/             # 业务逻辑
│   │   ├── sonnet_service.py # Claude API调用
│   │   ├── image_gen.py      # OpenAI图片生成
│   │   ├── user_model.py     # 用户模型+FSRS
│   │   └── anki_builder.py   # Anki牌组构建
│   └── models/               # 数据模型
│
├── react-frontend/           # 前端应用
│   └── src/
│       ├── components/       # UI组件
│       ├── contexts/         # React Context
│       ├── hooks/            # 自定义Hooks
│       └── services/         # API服务
│
└── image_generator/          # 图片标注工具(独立模块)
```

---

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: SQLite (SQLAlchemy ORM)
- **AI服务**: Claude Sonnet 4.5, OpenAI GPT-Image-1
- **算法**: FSRS 间隔重复

### 前端
- **框架**: React + TypeScript
- **构建工具**: Vite
- **状态管理**: React Context

---

## API 接口列表

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/generate` | 图片识别与标注生成 |
| GET | `/api/render` | 渲染学习卡片 |
| POST | `/api/evaluate` | 评估用户答案 |
| POST | `/api/placement_test` | 水平测试 |
| GET | `/api/export_anki` | 导出Anki牌组 |
| GET | `/health` | 健康检查 |

---

## 环境变量

| 变量名 | 用途 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接 | `sqlite+aiosqlite:///./app.db` |
| `IMAGE_DIR` | 图片存储目录 | `images` |
| `ANKI_DIR` | Anki文件目录 | `anki` |
| `BASE_URL` | 服务基础URL | `http://localhost:7860` |
| `ANTHROPIC_API_KEY` | Claude API密钥 | - |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |

---

## 总结

Lensa 是一个完整的 **AI 驱动的印尼语学习系统**，实现了从图片识别、内容生成、学习练习到复习导出的完整学习闭环。核心技术亮点包括：

1. **多模态AI能力**: 结合图像识别与图像生成
2. **科学的学习理论**: i+1 输入假说 + FSRS 间隔重复
3. **个性化学习路径**: CEFR 分级 + 自适应升级
4. **完整的学习闭环**: 学习 → 练习 → 复习 → 导出

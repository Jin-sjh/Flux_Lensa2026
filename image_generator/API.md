# Lensa API 文档

## 概述

Lensa 是一个AI图像注解应用，可以识别图片并生成印尼语注解，同时生成手绘风格的注解图片。

- **基础URL**: `http://localhost:8000`
- **协议**: HTTP
- **格式**: JSON

---

## API 接口列表

### 1. 首页

获取Web应用首页。

- **URL**: `GET /`
- **响应**: HTML页面

---

### 2. 上传图片

上传需要注解的图片。

- **URL**: `POST /api/upload`
- **Content-Type**: `multipart/form-data`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 图片文件，支持格式：jpg, jpeg, png, gif, webp |

#### 响应示例

```json
{
  "task_id": "a1b2c3d4e5f6",
  "filename": "a1b2c3d4e5f6.jpg",
  "filepath": "C:\\Users\\Administrator\\Desktop\\Lensa\\uploads\\a1b2c3d4e5f6.jpg"
}
```

#### 错误响应

| 状态码 | 说明 |
|--------|------|
| 400 | 只支持图片文件或图片格式不支持 |

---

### 3. 开始注解

开始图片注解流程（异步处理）。

- **URL**: `POST /api/annotate/{task_id}`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | String | 是 | 上传图片时获得的任务ID |

#### 响应示例

```json
{
  "task_id": "a1b2c3d4e5f6",
  "status": "processing"
}
```

#### 错误响应

| 状态码 | 说明 |
|--------|------|
| 404 | 图片未找到 |

---

### 4. 查询任务状态

查询注解任务的执行状态和进度。

- **URL**: `GET /api/status/{task_id}`

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | String | 是 | 任务ID |

#### 响应示例 (处理中)

```json
{
  "status": "processing",
  "step": "recognizing",
  "progress": 25,
  "message": "Recognizing image with GPT-4o..."
}
```

#### 响应示例 (完成)

```json
{
  "status": "completed",
  "step": "done",
  "progress": 100,
  "message": "Done!",
  "annotations": "Apel: Segar dan manis sekali | 苹果：非常新鲜甜美\nAir dingin: Segar dan nyaman | 冰水：清凉舒适",
  "result_url": "/results/a1b2c3d4e5f6_annotated.png",
  "original_url": "/uploads/a1b2c3d4e5f6.jpg",
  "created_at": "2026-05-01 14:30"
}
```

#### 响应示例 (错误)

```json
{
  "status": "error",
  "step": "failed",
  "progress": 0,
  "message": "错误信息"
}
```

#### 错误响应

| 状态码 | 说明 |
|--------|------|
| 404 | 任务未找到 |

---

### 5. 获取历史记录

获取所有历史注解记录。

- **URL**: `GET /api/history`

#### 响应示例

```json
[
  {
    "task_id": "a1b2c3d4e5f6",
    "result_url": "/results/a1b2c3d4e5f6_annotated.png",
    "original_url": "/uploads/a1b2c3d4e5f6.jpg",
    "created_at": "2026-05-01 14:30",
    "annotations": "Apel: Segar dan manis sekali | 苹果：非常新鲜甜美"
  },
  {
    "task_id": "g7h8i9j0k1l2",
    "result_url": "/results/g7h8i9j0k1l2_annotated.png",
    "original_url": "/uploads/g7h8i9j0k1l2.png",
    "created_at": "2026-05-01 13:15"
  }
]
```

---

### 6. 静态文件访问

#### 上传的图片

- **URL**: `GET /uploads/{filename}`
- **说明**: 访问用户上传的原始图片

#### 注解结果图片

- **URL**: `GET /results/{filename}`
- **说明**: 访问生成的注解结果图片

---

## 完整使用流程

1. **上传图片** → `POST /api/upload` → 获取 task_id
2. **开始注解** → `POST /api/annotate/{task_id}`
3. **轮询状态** → `GET /api/status/{task_id}` (每1-2秒一次)
4. **完成后** → 访问 `result_url` 获取注解图片，`annotations` 获取注解文本
5. **查看历史** → `GET /api/history`

---

## 注解格式说明

生成的注解文本格式如下：

```
[物品名印尼语]: [4-5个印尼语单词注解] | [中文翻译]
```

示例：
```
Apel: Segar dan manis sekali | 苹果：非常新鲜甜美
Air dingin: Segar dan nyaman | 冰水：清凉舒适
Suasana: Tenang dan nyaman | 氛围：宁静舒适
```

---

## 状态字段说明

| status | 说明 |
|--------|------|
| processing | 处理中 |
| completed | 完成 |
| error | 错误 |

| step | 说明 |
|------|------|
| recognizing | 正在识别图片 |
| annotating | 正在生成注解图片 |
| done | 完成 |
| failed | 失败 |

---

## 配置说明

请确保在 `config.py` 文件中正确配置以下参数：

```python
OPENAI_API_KEY = "your-api-key-here"
OPENAI_BASE_URL = "your-base-url-here"
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0
```

---

## 启动服务

```bash
python app.py
```

服务将在 `http://localhost:8000` 启动。

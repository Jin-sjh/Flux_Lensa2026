# Lensa - AI Image Annotator

基于 GPT-4o + GPT-Image-2 的日系可爱手写风图片注解工具。上传照片，自动生成印尼语碎碎念文案 + 手绘风注解成品图。

## 环境要求

- Python 3.11+
- Redis（可选，用于词库缓存加速）
- OpenAI API Key（支持代理地址）

## 安装步骤

### 1. 安装 Python 依赖

```powershell
pip install openai pillow redis fastapi uvicorn
```

### 2. 启动 Redis（可选但推荐）

首次需要下载 Redis for Windows：

```powershell
# 如果已解压到 C:\Redis，直接启动：
C:\Redis\redis-server.exe C:\Redis\redis.windows.conf
```

> 不启动 Redis 也能用，只是每次会从文件读取词库，稍慢。

### 3. 配置 API Key

已预配置在代码中，无需额外设置：

```python
API_KEY = os.environ.get("OPENAI_API_KEY", "sk-asiRsIGfTmov0OadA97c6aF81e134cEd9eE0CaB2D734756f")
BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai-next.com/v1")
```

如需修改，编辑 `image_recognizer.py` 和 `image_annotator.py` 顶部即可。

## 使用方式

### 方式一：Web 界面（推荐）

```powershell
# 先确保 Redis 已启动（可选）
C:\Redis\redis-server.exe C:\Redis\redis.windows.conf

# 启动 Web 服务
python app.py
```

浏览器打开 **http://localhost:8000**，即可：

1. 拖拽或点击上传图片
2. 点击 "Start Annotation" 开始处理
3. 实时查看进度条
4. 完成后对比原图和注解图
5. 底部查看历史记录

### 方式二：命令行

```powershell
# 完整流水线（识别 + 注解，一键完成）
python image_annotator.py "image/照片.jpg" --full

# 指定输出路径
python image_annotator.py "image/照片.jpg" --full --output "output/result.png"

# 只做识别（生成文案，不生成图）
python image_recognizer.py "image/照片.jpg"

# 自定义识别提示词
python image_recognizer.py "image/照片.jpg" "请用日语描述这张照片"

# 自定义文案后只做注解（跳过识别步骤）
python image_annotator.py "image/照片.jpg" --text "Pohon: Hijau dan rimbun."

# 从文件读取文案
python image_annotator.py "image/照片.jpg" --file annotations.txt
```

> 输出图片自动递增编号，不会覆盖已有文件。

## 项目结构

```
Lensa/
├── app.py                    # FastAPI Web 服务
├── image_recognizer.py       # 图像识别模块（GPT-4o 视觉）
├── image_annotator.py        # 图像注解模块（GPT-Image-2）
├── id_vocabulary.json         # 印尼语词库（500词）
├── static/
│   └── index.html            # 前端页面
├── uploads/                  # 上传图片目录
├── results/                  # 生成结果目录
└── README.md
```

## 核心流程

```
上传图片 → GPT-4o 识别（生成印尼语碎碎念文案）→ GPT-Image-2 注解（叠加手绘风标注）→ 输出成品图
     ↑              ↑                                        ↑
  压缩优化       词库约束（4-5词/句）                    白色描边+箭头+装饰
```

## 配置说明

| 配置项 | 位置 | 说明 |
|--------|------|------|
| API_KEY | image_recognizer.py / image_annotator.py | OpenAI API 密钥 |
| BASE_URL | image_recognizer.py / image_annotator.py | API 代理地址 |
| MAX_LONG_SIDE | image_recognizer.py | 识别时图片压缩长边上限（默认1024） |
| JPEG_QUALITY | image_recognizer.py | 压缩JPEG质量（默认80） |
| VOCAB_PATH | image_annotator.py | 词库文件路径 |
| REDIS_HOST/PORT | image_annotator.py | Redis 连接配置 |

## API 文档

启动 Web 服务后访问 **http://localhost:8000/docs** 查看自动生成的 API 文档。

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/upload | POST | 上传图片 |
| /api/annotate/{task_id} | POST | 开始注解流水线 |
| /api/status/{task_id} | GET | 查询任务进度 |
| /api/history | GET | 获取历史记录 |

## 常见问题

**Q: 浏览器打开显示 ERR_ABORTED？**
A: 请使用 Chrome/Edge 等外部浏览器打开 http://localhost:8000 ，不要用 IDE 内置预览。

**Q: 生成一张图要多久？**
A: 完整流程约 1-2 分钟。其中 GPT-4o 识别 ~12秒，GPT-Image-2 生图 ~50-70秒。

**Q: 不启动 Redis 能用吗？**
A: 可以，Redis 只是缓存加速，不启动时自动从文件读取词库。

**Q: 词库可以自定义吗？**
A: 可以，编辑 id_vocabulary.json，格式参考现有词条。Redis 缓存会自动检测文件变更并更新。

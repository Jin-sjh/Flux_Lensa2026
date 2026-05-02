import os

# OpenAI API Configuration
# Set your API key and base URL here or via environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "your-api-key-here")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai-next.com/v1")

# Redis Configuration
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_VOCAB_KEY = "lensa:id_vocabulary:text"
REDIS_VOCAB_HASH_KEY = "lensa:id_vocabulary:hash"

# Vocabulary Path
VOCAB_PATH = r"C:\Users\Administrator\Desktop\Lensa\id_vocabulary.json"

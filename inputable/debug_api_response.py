"""调试 API 响应格式"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

def test_chat():
    print("\n" + "="*60)
    print("测试 Chat API 响应格式")
    print("="*60)
    
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL"),
    )
    
    print(f"Base URL: {os.getenv('OPENAI_BASE_URL')}")
    print(f"Model: {os.getenv('OPENAI_MODEL_TEXT')}")
    
    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL_TEXT", "gpt-4"),
            messages=[{"role": "user", "content": "Say 'Hello'"}],
            max_tokens=10
        )
        
        print(f"\n响应类型: {type(response)}")
        print(f"响应内容: {response}")
        print(f"\n是否有 choices 属性: {hasattr(response, 'choices')}")
        if hasattr(response, 'choices'):
            print(f"choices: {response.choices}")
        
    except Exception as e:
        print(f"错误: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


def test_image_gen():
    print("\n" + "="*60)
    print("测试 Image Generation API 响应格式")
    print("="*60)
    
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL"),
    )
    
    print(f"Base URL: {os.getenv('OPENAI_BASE_URL')}")
    print(f"Model: {os.getenv('OPENAI_MODEL_IMAGE')}")
    
    try:
        response = client.images.generate(
            model=os.getenv("OPENAI_MODEL_IMAGE", "dall-e-2"),
            prompt="A red circle",
            size="1024x1024",
            n=1
        )
        
        print(f"\n响应类型: {type(response)}")
        print(f"响应内容: {response}")
        print(f"\n是否有 data 属性: {hasattr(response, 'data')}")
        if hasattr(response, 'data'):
            print(f"data: {response.data}")
        
    except Exception as e:
        print(f"错误: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_chat()
    test_image_gen()

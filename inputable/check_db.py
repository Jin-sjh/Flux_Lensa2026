import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

async def check():
    engine = create_async_engine('sqlite+aiosqlite:///./app.db')
    async with AsyncSession(engine) as db:
        # 列出所有表
        result = await db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        print("=== 所有表 ===")
        tables = [row[0] for row in result]
        for t in tables:
            print(t)
        
        # 找包含 session 的表
        for t in tables:
            if 'session' in t.lower():
                print(f"\n=== {t} 最近5条记录 ===")
                r = await db.execute(text(f"SELECT session_id, image_path FROM {t} ORDER BY rowid DESC LIMIT 5"))
                for row in r:
                    print(row)

asyncio.run(check())
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv

load_dotenv()

from config import DATABASE_URL, DATA_ROOT

os.makedirs(DATA_ROOT, exist_ok=True)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

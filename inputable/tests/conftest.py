import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from models.db_models import Base
from services.sonnet_service import HARDCODED_DEFAULT


@pytest_asyncio.fixture
async def db():
    """In-memory async SQLite session for tests."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest.fixture
def mock_sonnet(monkeypatch):
    """Mock Sonnet to return HARDCODED_DEFAULT without API call."""
    monkeypatch.setattr(
        "services.sonnet_service.generate_annotations",
        lambda *args, **kwargs: HARDCODED_DEFAULT,
    )


@pytest.fixture
def mock_image_gen(monkeypatch, tmp_path):
    """Mock Image Gen to write a tiny PNG without API call."""
    fake_png = tmp_path / "fake.png"
    fake_png.write_bytes(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
        b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
        b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    def fake_render(annotations, caption, cefr, session_id, original_image_path):
        import os
        out = os.path.join("images", f"{session_id}.png")
        os.makedirs("images", exist_ok=True)
        import shutil
        shutil.copy(str(fake_png), out)
        return out

    monkeypatch.setattr("services.image_gen.render_card", fake_render)

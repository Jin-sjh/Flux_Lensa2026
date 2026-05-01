import pytest
from fastapi.testclient import TestClient


def test_health():
    """GET /health returns expected JSON with HTTP 200."""
    from main import app
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}

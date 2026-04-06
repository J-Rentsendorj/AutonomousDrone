"""Health check endpoint."""
from fastapi import APIRouter
from api.config import settings

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "active", "app": settings.APP_NAME, "version": settings.APP_VERSION}

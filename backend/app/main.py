from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.cloudinary_config import configure_cloudinary

configure_cloudinary()

app = FastAPI(title=settings.app_name, version="0.1.0", description="Backend API for AdventureLog, a mobile-first personal adventure journal.")

@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {
        "message": "Welcome to the AdventureLog API.",
        "docs": "/docs"
    }

app.include_router(api_router, prefix=settings.api_v1_prefix)
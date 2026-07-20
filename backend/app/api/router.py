from fastapi import APIRouter

from app.api.routes import health, auth, users, adventures, media, collections

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(adventures.router)
api_router.include_router(media.router)
api_router.include_router(collections.router)
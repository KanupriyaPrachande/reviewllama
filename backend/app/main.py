from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.reviews import router as reviews_router
from app.api.webhook import router as webhook_router
from app.core.config import settings
from app.core.db import init_db

app = FastAPI(
    title="ReviewLlama",
    description="Hybrid ML + LLM code review assistant",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reviews_router)
app.include_router(webhook_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "env": settings.app_env, "version": "0.2.0"}

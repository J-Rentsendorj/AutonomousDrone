"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.config import settings
from api.database import init_db, async_session
from api.routes import health, runs, telemetry, gates, quality
from api.services.csv_importer import import_csv_logs

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with async_session() as db:
        await import_csv_logs(db)
    yield

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(runs.router, prefix="/api")
app.include_router(telemetry.router, prefix="/api")
app.include_router(gates.router, prefix="/api")
app.include_router(quality.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AIGP Flight Manager API", "docs": "/docs"}

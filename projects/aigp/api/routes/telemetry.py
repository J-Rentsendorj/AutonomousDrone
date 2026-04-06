"""Telemetry ingestion and retrieval."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import get_db
from api.schemas import TelemetryCreate, TelemetryOut
from api.services.run_service import get_run
from api.models import TelemetrySnapshot
from sqlalchemy import select

router = APIRouter(prefix="/runs/{run_id}/telemetry", tags=["telemetry"])

@router.post("", response_model=TelemetryOut, status_code=201)
async def add(run_id: int, payload: TelemetryCreate, db: AsyncSession = Depends(get_db)):
    run = await get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    snap = TelemetrySnapshot(run_id=run_id, **payload.model_dump())
    db.add(snap)
    await db.commit()
    await db.refresh(snap)
    return snap

@router.get("", response_model=list[TelemetryOut])
async def index(run_id: int, limit: int = Query(default=500, ge=1, le=5000), db: AsyncSession = Depends(get_db)):
    stmt = select(TelemetrySnapshot).where(TelemetrySnapshot.run_id == run_id).order_by(TelemetrySnapshot.elapsed_sec.asc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

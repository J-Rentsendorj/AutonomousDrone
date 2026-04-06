"""Gate event logging and retrieval."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import get_db
from api.schemas import GateEventCreate, GateEventOut
from api.services.run_service import get_run
from api.models import GateEvent
from sqlalchemy import select

router = APIRouter(prefix="/runs/{run_id}/gates", tags=["gates"])

@router.post("", response_model=GateEventOut, status_code=201)
async def add(run_id: int, payload: GateEventCreate, db: AsyncSession = Depends(get_db)):
    run = await get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    event = GateEvent(run_id=run_id, **payload.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.get("", response_model=list[GateEventOut])
async def index(run_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(GateEvent).where(GateEvent.run_id == run_id).order_by(GateEvent.gate_index.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())

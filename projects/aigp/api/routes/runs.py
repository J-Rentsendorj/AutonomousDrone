"""Flight run CRUD + stats."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import get_db
from api.schemas import RunCreate, RunUpdate, RunOut, RunStats
from api.services.run_service import create_run, get_run, list_runs, update_run, delete_run, get_stats

router = APIRouter(prefix="/runs", tags=["runs"])

@router.post("", response_model=RunOut, status_code=201)
async def create(payload: RunCreate, db: AsyncSession = Depends(get_db)):
    return await create_run(db, payload)

@router.get("", response_model=list[RunOut])
async def index(
    status: str | None = Query(default=None, pattern="^(in_progress|completed|crashed|timed_out)$"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    return await list_runs(db, status=status, limit=limit, offset=offset)

@router.get("/stats", response_model=RunStats)
async def stats(db: AsyncSession = Depends(get_db)):
    return await get_stats(db)

@router.get("/{run_id}", response_model=RunOut)
async def show(run_id: int, db: AsyncSession = Depends(get_db)):
    run = await get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return run

@router.patch("/{run_id}", response_model=RunOut)
async def update(run_id: int, payload: RunUpdate, db: AsyncSession = Depends(get_db)):
    run = await update_run(db, run_id, payload)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return run

@router.delete("/{run_id}", status_code=204)
async def destroy(run_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_run(db, run_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")

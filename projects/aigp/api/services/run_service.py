"""Run CRUD and stats business logic."""
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from api.models import Run, GateEvent
from api.schemas import RunCreate, RunUpdate, RunStats

async def create_run(db: AsyncSession, payload: RunCreate) -> Run:
    run = Run(**payload.model_dump())
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return run

async def get_run(db: AsyncSession, run_id: int) -> Run | None:
    stmt = select(Run).options(selectinload(Run.telemetry_snapshots), selectinload(Run.gate_events)).where(Run.id == run_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def list_runs(db: AsyncSession, status: str | None = None, limit: int = 50, offset: int = 0) -> list[Run]:
    stmt = select(Run).order_by(Run.started_at.desc()).offset(offset).limit(limit)
    if status:
        stmt = stmt.where(Run.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def update_run(db: AsyncSession, run_id: int, payload: RunUpdate) -> Run | None:
    run = await db.get(Run, run_id)
    if not run:
        return None
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(run, key, value)
    if payload.status in ("completed", "crashed", "timed_out"):
        run.ended_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(run)
    return run

async def delete_run(db: AsyncSession, run_id: int) -> bool:
    run = await db.get(Run, run_id)
    if not run:
        return False
    await db.delete(run)
    await db.commit()
    return True

async def get_stats(db: AsyncSession) -> RunStats:
    total = (await db.execute(select(func.count(Run.id)))).scalar() or 0
    completed = (await db.execute(select(func.count(Run.id)).where(Run.status == "completed"))).scalar() or 0
    crashed = (await db.execute(select(func.count(Run.id)).where(Run.status == "crashed"))).scalar() or 0
    best = (await db.execute(select(func.min(Run.lap_time_sec)).where(Run.status == "completed"))).scalar()
    avg = (await db.execute(select(func.avg(Run.lap_time_sec)).where(Run.status == "completed"))).scalar()
    best_speed = (await db.execute(select(func.max(Run.speed_ms)).where(Run.status == "completed"))).scalar()
    gates = (await db.execute(select(func.count(GateEvent.id)))).scalar() or 0
    return RunStats(
        total_runs=total, completed_runs=completed, crashed_runs=crashed,
        completion_rate=round(completed / total, 4) if total > 0 else 0.0,
        best_lap_sec=best, avg_lap_sec=round(avg, 3) if avg else None,
        best_speed_ms=best_speed, total_gates_passed=gates,
    )

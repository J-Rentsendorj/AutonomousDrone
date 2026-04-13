"""Flight quality score endpoints."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/quality", tags=["quality"])

QUALITY_FILE = Path(__file__).resolve().parents[2] / "flight_quality.json"

def _load_quality():
    if not QUALITY_FILE.exists():
        raise HTTPException(status_code=404, detail="No flight quality data available")
    return json.loads(QUALITY_FILE.read_text())

@router.get("/latest")
async def latest():
    return _load_quality()

@router.get("/{run_id}")
async def by_run(run_id: int):
    return _load_quality()

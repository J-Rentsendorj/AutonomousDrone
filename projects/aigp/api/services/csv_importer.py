"""Import existing race_log CSV files into the database on startup."""
import csv
import glob
import os
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from api.models import Run, TelemetrySnapshot, GateEvent
from api.config import settings

def _float(val, default=0.0):
    """Safely parse a float from a CSV value, returning default for empty strings."""
    if val is None or val == "":
        return default
    return float(val)

async def import_csv_logs(db: AsyncSession):
    """Scan for race_log_*.csv files and import any not already in the DB."""
    pattern = os.path.join(settings.RACE_LOG_DIR, "race_log_*.csv")
    csv_files = sorted(glob.glob(pattern))
    if not csv_files:
        print(f"[csv_importer] No race logs found in {settings.RACE_LOG_DIR}")
        return
    for csv_path in csv_files:
        filename = os.path.basename(csv_path)
        # Check if already imported
        from sqlalchemy import select
        existing = (await db.execute(select(Run).where(Run.source_csv == filename))).scalar_one_or_none()
        if existing:
            continue
        try:
            rows = []
            with open(csv_path, newline="") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rows.append(row)
            if not rows:
                continue
            # Parse timestamp from filename: race_log_YYYYMMDD_HHMMSS.csv
            ts_str = filename.replace("race_log_", "").replace(".csv", "")
            try:
                started = datetime.strptime(ts_str, "%Y%m%d_%H%M%S").replace(tzinfo=timezone.utc)
            except ValueError:
                started = datetime.now(timezone.utc)
            # Determine lap time from last row timestamp
            last_elapsed = _float(rows[-1].get("timestamp"))
            # Calculate max position error from gate_error column
            max_error = max(_float(row.get("gate_error")) for row in rows)
            run = Run(
                status="completed",
                sim_environment="cosys-airsim",
                controller_version="classical-v0",
                gate_count=8,
                gates_completed=len(rows),
                lap_time_sec=round(last_elapsed, 3) if last_elapsed > 0 else None,
                max_position_error_m=round(max_error, 3),
                source_csv=filename,
                started_at=started,
            )
            db.add(run)
            await db.flush()
            # Import telemetry rows
            for row in rows:
                snap = TelemetrySnapshot(
                    run_id=run.id,
                    elapsed_sec=_float(row.get("timestamp")),
                    pos_n=_float(row.get("x")),
                    pos_e=_float(row.get("y")),
                    pos_d=_float(row.get("z")),
                    vel_n=_float(row.get("vx")),
                    vel_e=_float(row.get("vy")),
                    vel_d=_float(row.get("vz")),
                    roll=_float(row.get("roll")),
                    pitch=_float(row.get("pitch")),
                    yaw=_float(row.get("yaw")),
                    speed=_float(row.get("speed")),
                )
                db.add(snap)
            # Import gate events (each row is a gate passage)
            for idx, row in enumerate(rows):
                event = GateEvent(
                    run_id=run.id,
                    gate_index=idx,
                    gate_name=row.get("current_gate", "gate"),
                    split_time_sec=_float(row.get("timestamp")),
                    position_error_m=_float(row.get("gate_error")),
                )
                db.add(event)
            await db.commit()
            print(f"[csv_importer] Imported {filename}: {len(rows)} telemetry rows, {len(rows)} gate events, lap={run.lap_time_sec}s, max_err={run.max_position_error_m}m")
        except Exception as e:
            print(f"[csv_importer] Failed to import {filename}: {e}")
            await db.rollback()

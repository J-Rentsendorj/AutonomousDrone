# AIGP System Delivery

## System Overview

AIGP autonomous drone racing stack — hybrid trajectory + YOLO drift correction architecture.
Frontend dashboard (React) connected to FastAPI backend connected to SQLite database,
consuming real flight data from the autonomy stack.

## End-to-End Flow

1. Autonomy stack flies drone through 12 gates in ADRL simulator
2. `flight_tracker.py` records per-gate passage offsets to `flight_quality.json`
3. `telemetry.py` logs 10 Hz position/velocity/attitude to CSV
4. FastAPI backend serves flight quality data via `GET /api/quality/latest`
5. FastAPI backend serves run history via `GET /api/runs`
6. React frontend fetches from both endpoints and renders dashboard

## Test Results

- Gates passed: 12/12
- Average passage offset: 0.37m
- Worst gate: Gate 6 at 0.78m
- Best gate: Gate 7 at 0.11m
- Stuck events: 0
- YOLO gate detection: 97.5% mAP@0.5
- Flight time: ~70 seconds for 12 gates

## API Endpoints Tested

- `GET /api/health` — 200 OK
- `GET /api/runs` — returns 6 flight runs
- `GET /api/runs/stats` — aggregate statistics
- `GET /api/quality/latest` — flight quality metrics from latest run
- `POST /api/runs` — creates new run (validated via New Run form)

## Architecture

- **Frontend**: React 18 (CDN), Chart.js, CSS variables dark theme
- **Backend**: FastAPI, SQLAlchemy async, SQLite
- **Autonomy**: Python 3.12, airsimdroneracinglab, YOLOv8-nano, moveOnSplineVelConstraintsAsync
- 13 active Python modules, 14 frontend files

## Known Limitations

- Frontend uses mock data fallback when backend is offline
- Drift correction monitors only (not applied to flight path)
- Telemetry visualization in Run Detail screen is a placeholder
- CSV importer maps old race log format; newer `flight_quality.json` served via separate endpoint

# AIGP — Autonomous Drone Racing

Autonomy stack and flight management backend for the Anduril AI Grand Prix autonomous drone racing competition.

## Project Overview

This project implements an autonomous drone racing system with two integrated components:

1. **Autonomy Stack** — Python-based flight controller for Cosys-AirSim (UE5.5) that autonomously navigates a drone through a sequence of 3D gates. Supports position-level waypoint navigation and attitude-level (TRPY) direct control.

2. **Flight Manager API** — FastAPI backend that ingests telemetry from flight runs, tracks gate passage events, and provides run analytics (best lap times, completion rates, speed comparisons).

## Tech Stack

- **Runtime:** Python 3.12
- **Simulator:** Cosys-AirSim v3.3 (Unreal Engine 5.5)
- **Flight API:** cosysairsim (Python bindings)
- **Backend Framework:** FastAPI + Uvicorn
- **Database:** SQLite via SQLAlchemy (async)
- **Data Validation:** Pydantic v2

## Project Structure

```
aigp/
├── flight_controller.py   # DroneController class (position + TRPY attitude control)
├── gate_provider.py        # Gate provider abstraction (static, sim, camera)
├── telemetry.py            # 10 Hz CSV telemetry logger + matplotlib plots
├── camera.py               # FPV camera manager (640x480 @ 10 fps)
├── courses.py              # Race courses (DEFAULT_COURSE, SIMPLE_COURSE)
├── main.py                 # Autonomy entry point (--race, --square, --attitude)
├── api/
│   ├── server.py           # FastAPI app with CSV auto-import on startup
│   ├── config.py           # Environment-based configuration
│   ├── database.py         # Async SQLAlchemy engine + session
│   ├── models.py           # ORM models (Run, TelemetrySnapshot, GateEvent)
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── routes/
│   │   ├── health.py       # GET /api/health
│   │   ├── runs.py         # CRUD for flight runs + aggregate stats
│   │   ├── telemetry.py    # Telemetry snapshot ingestion + retrieval
│   │   └── gates.py        # Gate event logging + retrieval
│   └── services/
│       ├── run_service.py  # Run business logic + stats aggregation
│       └── csv_importer.py # Auto-imports race_log CSV files into DB
├── audits/                 # Security audit reports
├── requirements-api.txt    # Backend dependencies
├── .env.example            # Environment variable template
└── .gitignore
```

## How to Run

### Prerequisites

- Python 3.12+
- Cosys-AirSim (for autonomous flight)
- Windows (Cosys-AirSim requirement)

### Setup
```bash
python -m venv aigp-env
aigp-env\Scripts\activate
pip install cosysairsim
pip install -r requirements-api.txt
```

### Run Autonomous Flight

Start Cosys-AirSim Blocks environment first, then:
```bash
python main.py --race --speed 8 --plot --camera
```

Options:
- `--race` — Fly the gate course autonomously
- `--square` — Fly a square test pattern
- `--attitude` — Test TRPY attitude commands
- `--speed N` — Set flight speed in m/s (default 5)
- `--plot` — Generate telemetry plots after run
- `--camera` — Record FPV frames during flight
- `--course simple` — Use 4-gate simple course

### Run Backend API
```bash
uvicorn api.server:app --reload
```

On startup, the server automatically imports any `race_log_*.csv` files into the database. Open http://localhost:8000/docs for interactive Swagger documentation.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server status and version |
| POST | /api/runs | Create a new flight run |
| GET | /api/runs | List runs (filter by status) |
| GET | /api/runs/stats | Aggregate stats (best lap, completion rate) |
| GET | /api/runs/{id} | Get single run details |
| PATCH | /api/runs/{id} | Update run (status, lap time) |
| DELETE | /api/runs/{id} | Delete run and associated data |
| POST | /api/runs/{id}/telemetry | Ingest telemetry snapshot |
| GET | /api/runs/{id}/telemetry | Retrieve telemetry for a run |
| POST | /api/runs/{id}/gates | Log gate passage event |
| GET | /api/runs/{id}/gates | Get gate events for a run |

## Database Schema

Three tables with foreign key relationships:

- **runs** — Flight run metadata (status, speed, lap time, gate count, position error)
- **telemetry_snapshots** — Per-run time series (NED position, velocity, attitude, speed)
- **gate_events** — Per-run gate passages (gate name, split time, position error)

## Current Status

- Autonomous gate navigation working at up to 15 m/s
- Best lap: 15.93s at 8 m/s with 1.01m max position error
- 11 flight runs logged with full telemetry
- Backend API operational with CSV auto-import
- Security audit passed for cosysairsim package

## Next Steps

- Port controller to DCL competition simulator (May 2026)
- Add PencilNet camera-based gate detection for VQ1
- Optimize lap times for VQ2 speed competition
- Evaluate hybrid RL controller for aggressive maneuvers

## Competition

Anduril AI Grand Prix — $500K prize pool autonomous drone racing competition.
- VQ1: May 2026 (gate completion focus)
- VQ2: June-July 2026 (fastest lap wins)
- Physical Qualifier: September 2026
- Finals: November 2026

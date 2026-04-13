# AIGP Autonomy Stack — Khanate Industries

Autonomous drone racing controller for the Anduril AI Grand Prix.

**Architecture:** hybrid trajectory (spline navigation) + YOLO drift correction.
The drone flies through gates using `moveOnSplineVelConstraintsAsync` with gate
facing vectors as velocity constraints, while a background perception loop runs
YOLO detection, drift correction, and passage detection as monitoring layers.

## File Map

| File | Description |
|------|-------------|
| `race_loop.py` | Primary entry point — integrated spline flight + perception monitoring |
| `race_spline.py` | Golden reference — standalone spline flight, no subsystems |
| `sim_adapter.py` | Simulation abstraction layer (ADRL backend via `airsimdroneracinglab`) |
| `telemetry.py` | 10 Hz CSV telemetry logger + matplotlib plot generation |
| `gate_detector.py` | YOLOv8 gate detector wrapper for visual servoing |
| `drift_corrector.py` | Compares YOLO detections against expected trajectory, computes corrections |
| `passage_detector.py` | Detects gate fly-throughs based on bounding-box area behavior |
| `visual_servo.py` | Fallback controller — navigates purely from camera detections |
| `camera.py` | FPV camera capture and background recording (640x480) |
| `trajectory_planner.py` | Generates flyable trajectories through gate courses |
| `regenerate_trajectory.py` | Utility to regenerate `gate_poses.json` from live sim |
| `train_gate_detector.py` | Dataset split + YOLOv8-nano training script |
| `api/` | FastAPI backend — run ingestion, telemetry, gate events, stats |
| `archive/` | Superseded scripts from Cosys-AirSim era and debugging phase |
| `audits/` | Race audit outputs (flight logs, plots, annotated frames) |
| `gate_poses.json` | Extracted gate positions + quaternions for Soccer_Field_Easy |
| `runs/` | YOLO training runs and weights |
| `gate_dataset/` | Labelled gate images for YOLO training |

## How to Run

### Prerequisites

- Python 3.12+
- ADRL simulator (AirSim Drone Racing Lab) running
- Windows

### Setup

```bash
python -m venv aigp-env
aigp-env\Scripts\activate
pip install airsimdroneracinglab ultralytics opencv-python matplotlib numpy
pip install -r requirements-api.txt   # for the FastAPI backend
```

### Quick Test (~15s)

Start the ADRL simulator, then:

```bash
python race_loop.py
```

This connects, takes off, flies the spline through all gates, runs the full
perception stack for 15 seconds, then reports results.

### Full Course (~2 min)

```bash
python race_loop.py --duration 120
```

### Golden Reference (standalone spline, no subsystems)

```bash
python race_spline.py
```

### Skip YOLO (if weights not trained yet)

```bash
python race_loop.py --no-yolo
```

### Run the Backend API

```bash
uvicorn api.server:app --reload
```

On startup, the server auto-imports any `race_log_*.csv` files into the database.
Swagger docs at http://localhost:8000/docs.

## Key API Constraints

These are critical rules for the ADRL simulator that the codebase enforces:

- **No `client.reset()`** — resets the entire sim state, loses gate positions
- **No `landAsync()` / `armDisarm()`** — baselines never land or disarm
- **No `simStartRace()`** — tries to spawn `drone_2` which doesn't exist
- **Vehicle name:** always `"Drone1"` (defined as `ADRLAdapter.VEHICLE_NAME`)
- **`race_tier = 1`** — must be set before `simGetObjectPose` works
- **Gate sorting:** use `split("_")[0][4:]` (not regex) to match baseline convention
- **Facing vector sign:** `+ w*z` in the fx component (local Y-axis rotation)
- **Euler conversion:** manual `_quaternion_to_euler()` — `airsimdroneracinglab` lacks `quaternion_to_euler_angles()`
- **All sim imports:** `import airsimdroneracinglab as airsim` (never `cosysairsim`)

## Dependencies

| Package | Purpose |
|---------|---------|
| `airsimdroneracinglab` | ADRL simulator Python client |
| `ultralytics` | YOLOv8 gate detection |
| `opencv-python` | Image capture and annotation |
| `matplotlib` | Telemetry plot generation |
| `numpy` | Numerical computation |
| `fastapi` | Backend API framework |
| `uvicorn` | ASGI server |
| `sqlalchemy[asyncio]` | Database ORM |
| `aiosqlite` | Async SQLite driver |
| `pydantic` | Data validation |

## Competition

Anduril AI Grand Prix — $500K prize pool autonomous drone racing.

- VQ1: May 2026 (gate completion)
- VQ2: June-July 2026 (fastest lap)
- Physical Qualifier: September 2026
- Finals: November 2026

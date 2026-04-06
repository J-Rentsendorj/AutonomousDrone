# Backend Development — Technical Summary

## Backend Architecture Overview

The AIGP Flight Manager API is a FastAPI backend integrated into an autonomous drone racing project for the Anduril AI Grand Prix competition. Rather than existing as a standalone service, the backend sits alongside the autonomy stack and operates on the same data the flight controller generates.

The architecture follows a layered separation of concerns:

- **Routes layer** handles HTTP request/response, input validation via Pydantic, and error responses. Each domain (runs, telemetry, gates) has its own router module.
- **Services layer** contains business logic including CRUD operations, statistical aggregation, and the CSV import pipeline. Routes never touch the database directly.
- **Models layer** defines three SQLAlchemy ORM models mapping to SQLite tables with foreign key relationships and cascade deletes.
- **Config layer** loads all settings from environment variables with sensible defaults, ensuring no hardcoded secrets.

The server uses FastAPI's lifespan context manager to initialize the database and auto-import existing race log CSV files on startup. This means the 11 flight runs already captured during development are immediately available through the API without manual data entry.

## Implemented Endpoints

The API exposes 11 endpoints across four route groups:

**Health** — `GET /api/health` returns server status, app name, and version. Used for uptime monitoring.

**Runs** — Full CRUD for flight runs. `POST /api/runs` creates a new run with metadata (simulator, controller version, speed, gate count). `GET /api/runs` lists all runs with optional status filtering and pagination. `GET /api/runs/{id}` retrieves a single run. `PATCH /api/runs/{id}` updates run status, lap time, or gate completion count (automatically stamps `ended_at` when status becomes terminal). `DELETE /api/runs/{id}` removes a run and cascades to all associated telemetry and gate data. `GET /api/runs/stats` returns aggregate statistics: total runs, completion rate, best and average lap times, best speed, and total gates passed.

**Telemetry** — `POST /api/runs/{id}/telemetry` ingests a telemetry snapshot (NED position, velocity, attitude, speed) tied to a run. `GET /api/runs/{id}/telemetry` retrieves the time series ordered by elapsed time.

**Gates** — `POST /api/runs/{id}/gates` logs a gate passage event with gate name, split time, and position error. `GET /api/runs/{id}/gates` retrieves gate events in sequence order.

All endpoints return structured JSON. Error cases return appropriate HTTP status codes (404 for missing runs, 422 for validation failures).

## Database and Data Modeling

The database is SQLite accessed through SQLAlchemy's async engine with aiosqlite. Three tables with foreign key relationships:

**runs** — Primary table storing flight run metadata. Fields include status (in_progress, completed, crashed, timed_out), simulator environment, controller version, flight speed, gate count, gates completed, lap time, maximum position error, optional notes, source CSV filename, and start/end timestamps. The source_csv field enables idempotent CSV imports (files are only imported once).

**telemetry_snapshots** — Time series data linked to runs via foreign key. Each row captures a moment during flight: elapsed time, 3D position in NED frame (meters), 3D velocity (m/s), attitude angles (roll, pitch, yaw), and scalar speed. A single run can have hundreds of telemetry rows.

**gate_events** — Gate passage records linked to runs. Each row records which gate was passed, the split time from run start, and the position error (distance from ideal gate center in meters). A typical 8-gate course produces 8 gate events per run.

Cascade deletes ensure that removing a run automatically removes all associated telemetry and gate data. The database file (aigp_runs.db) is excluded from version control via .gitignore.

## Current Limitations

- **No authentication.** The API is designed for local development use. Adding auth would be necessary before any network exposure.
- **SQLite concurrency.** SQLite handles one writer at a time. This is fine for a single-user development tool but would need PostgreSQL for multi-user scenarios.
- **CSV importer assumes column format.** The auto-importer is mapped to the specific CSV schema produced by the telemetry logger. Different CSV formats would need adapter logic.
- **No WebSocket streaming.** Telemetry is ingested via POST requests. Real-time streaming during flight would require WebSocket support.
- **No frontend.** The Swagger UI at /docs serves as the interface. A dashboard showing flight paths and run comparisons would improve usability.

## Plan for Next Week

- **Connect live telemetry.** Modify the flight controller's telemetry logger to POST snapshots to the API in real time during flight, enabling live run tracking.
- **Add a run comparison endpoint.** `GET /api/runs/compare?ids=1,5,8` returning side-by-side stats for selected runs.
- **Gate detection integration.** As PencilNet camera-based gate detection comes online for VQ1 prep, the gate events endpoint will capture detection confidence and estimated distance alongside passage data.
- **Dashboard frontend.** A lightweight HTML page using the API to display flight path visualizations, lap time trends, and gate-by-gate split comparisons across runs.

"""Pydantic request/response schemas."""
from datetime import datetime
from pydantic import BaseModel, Field

class RunCreate(BaseModel):
    sim_environment: str = "cosys-airsim"
    controller_version: str = "classical-v0"
    speed_ms: float = Field(default=5.0, ge=0)
    gate_count: int = Field(default=0, ge=0, le=20)
    notes: str | None = None

class RunUpdate(BaseModel):
    status: str | None = Field(default=None, pattern="^(in_progress|completed|crashed|timed_out)$")
    gates_completed: int | None = Field(default=None, ge=0)
    lap_time_sec: float | None = Field(default=None, ge=0)
    max_position_error_m: float | None = Field(default=None, ge=0)
    notes: str | None = None

class RunOut(BaseModel):
    id: int
    status: str
    sim_environment: str
    controller_version: str
    speed_ms: float
    gate_count: int
    gates_completed: int
    lap_time_sec: float | None
    max_position_error_m: float | None
    notes: str | None
    source_csv: str | None
    started_at: datetime
    ended_at: datetime | None
    model_config = {"from_attributes": True}

class RunStats(BaseModel):
    total_runs: int
    completed_runs: int
    crashed_runs: int
    completion_rate: float
    best_lap_sec: float | None
    avg_lap_sec: float | None
    best_speed_ms: float | None
    total_gates_passed: int

class TelemetryCreate(BaseModel):
    elapsed_sec: float = 0.0
    pos_n: float = 0.0
    pos_e: float = 0.0
    pos_d: float = 0.0
    vel_n: float = 0.0
    vel_e: float = 0.0
    vel_d: float = 0.0
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0
    speed: float = 0.0

class TelemetryOut(TelemetryCreate):
    id: int
    run_id: int
    model_config = {"from_attributes": True}

class GateEventCreate(BaseModel):
    gate_index: int = Field(ge=0, le=19)
    gate_name: str = Field(default="gate", max_length=30)
    split_time_sec: float | None = Field(default=None, ge=0)
    position_error_m: float | None = Field(default=None, ge=0)

class GateEventOut(GateEventCreate):
    id: int
    run_id: int
    model_config = {"from_attributes": True}

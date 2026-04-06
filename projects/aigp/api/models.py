"""SQLAlchemy ORM models."""
from datetime import datetime, timezone
from sqlalchemy import Float, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base

class Run(Base):
    __tablename__ = "runs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    sim_environment: Mapped[str] = mapped_column(String(50), default="cosys-airsim")
    controller_version: Mapped[str] = mapped_column(String(50), default="classical-v0")
    speed_ms: Mapped[float] = mapped_column(Float, default=5.0)
    gate_count: Mapped[int] = mapped_column(Integer, default=0)
    gates_completed: Mapped[int] = mapped_column(Integer, default=0)
    lap_time_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_position_error_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_csv: Mapped[str | None] = mapped_column(String(200), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    telemetry_snapshots: Mapped[list["TelemetrySnapshot"]] = relationship(back_populates="run", cascade="all, delete-orphan")
    gate_events: Mapped[list["GateEvent"]] = relationship(back_populates="run", cascade="all, delete-orphan")

class TelemetrySnapshot(Base):
    __tablename__ = "telemetry_snapshots"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("runs.id"), index=True)
    elapsed_sec: Mapped[float] = mapped_column(Float, default=0.0)
    pos_n: Mapped[float] = mapped_column(Float, default=0.0)
    pos_e: Mapped[float] = mapped_column(Float, default=0.0)
    pos_d: Mapped[float] = mapped_column(Float, default=0.0)
    vel_n: Mapped[float] = mapped_column(Float, default=0.0)
    vel_e: Mapped[float] = mapped_column(Float, default=0.0)
    vel_d: Mapped[float] = mapped_column(Float, default=0.0)
    roll: Mapped[float] = mapped_column(Float, default=0.0)
    pitch: Mapped[float] = mapped_column(Float, default=0.0)
    yaw: Mapped[float] = mapped_column(Float, default=0.0)
    speed: Mapped[float] = mapped_column(Float, default=0.0)
    run: Mapped["Run"] = relationship(back_populates="telemetry_snapshots")

class GateEvent(Base):
    __tablename__ = "gate_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[int] = mapped_column(Integer, ForeignKey("runs.id"), index=True)
    gate_index: Mapped[int] = mapped_column(Integer)
    gate_name: Mapped[str] = mapped_column(String(30), default="gate")
    split_time_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_error_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    run: Mapped["Run"] = relationship(back_populates="gate_events")

from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

mock_drones = [
    {
        "drone_id": "DRONE-001",
        "latitude": 47.9184,
        "longitude": 106.9177,
        "altitude": 120.0,
        "battery": 85,
        "status": "airborne",
    },
    {
        "drone_id": "DRONE-002",
        "latitude": 47.9212,
        "longitude": 106.9055,
        "altitude": 0.0,
        "battery": 100,
        "status": "grounded",
    },
    {
        "drone_id": "DRONE-003",
        "latitude": 47.9150,
        "longitude": 106.9300,
        "altitude": 75.5,
        "battery": 42,
        "status": "airborne",
    },
]

drone_telemetry: list[dict] = list(mock_drones)


class DroneCoordinates(BaseModel):
    drone_id: str
    latitude: float
    longitude: float
    altitude: float
    battery: int = 100
    status: str = "airborne"


@app.get("/api/health")
def health():
    return {"status": "active"}


@app.post("/api/telemetry")
def receive_telemetry(data: DroneCoordinates):
    entry = data.model_dump()
    entry["timestamp"] = datetime.now(timezone.utc).isoformat()
    drone_telemetry.append(entry)
    return {"message": "Telemetry received", "drone_id": data.drone_id}


@app.get("/api/drones/status")
def drones_status():
    return {"count": len(drone_telemetry), "drones": drone_telemetry}

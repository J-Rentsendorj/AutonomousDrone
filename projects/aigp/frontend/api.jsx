/**
 * API Service Layer
 * Connects to the FastAPI backend at localhost:8000/api
 * Falls back to mock data when backend is unavailable
 */

const API_BASE = 'http://localhost:8000/api';

// Reusable fetch wrapper with error handling
async function apiFetch(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), error: null };
  } catch (err) {
    console.warn(`API fetch failed for ${endpoint}:`, err.message);
    return { data: null, error: err.message };
  }
}

// POST request wrapper
async function apiPost(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP ${res.status}`);
    }
    return { data: await res.json(), error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// ---- API Endpoints ----

window.ApiService = {
  // Fetch all runs
  getRuns: () => apiFetch('/runs'),

  // Fetch single run by ID
  getRun: (id) => apiFetch(`/runs/${id}`),

  // Fetch aggregate stats
  getStats: () => apiFetch('/runs/stats'),

  // Fetch telemetry for a run
  getTelemetry: (runId, limit = 500) => apiFetch(`/runs/${runId}/telemetry?limit=${limit}`),

  // Fetch gate events for a run
  getGateEvents: (runId) => apiFetch(`/runs/${runId}/gates`),

  // Create a new run
  createRun: (payload) => apiPost('/runs', payload),

  // Health check
  health: () => apiFetch('/health'),
};

// ---- Mock / Fallback Data ----
// Used when the FastAPI backend is not running
// Based on actual AIGP flight metrics from April 12, 2026

window.MockData = {
  stats: {
    total_runs: 6,
    completed: 4,
    best_lap: 70.2,
    avg_lap: 71.2,
    total_gates_passed: 58,
    completion_rate: 0.667,
  },

  runs: [
    { id: 1, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'moveToPositionAsync', status: 'completed', gates_passed: 8, total_gates: 12, lap_time_sec: 45.3, created_at: '2026-04-07T14:00:00', notes: 'Fly-over-gates bug — drone cleared gate altitude but missed openings' },
    { id: 2, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'race_spline.py', status: 'completed', gates_passed: 12, total_gates: 12, lap_time_sec: 72.1, created_at: '2026-04-08T16:30:00', notes: 'First full completion using spline API' },
    { id: 3, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'race_loop.py --simple', status: 'completed', gates_passed: 12, total_gates: 12, lap_time_sec: 71.8, created_at: '2026-04-09T11:00:00', notes: 'Full monitoring pipeline validated — matches race_spline.py' },
    { id: 4, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'race_loop.py --corrections', status: 'crashed', gates_passed: 10, total_gates: 12, lap_time_sec: null, created_at: '2026-04-10T09:15:00', notes: 'Altitude corrections too aggressive — ±2m clamp caused stuck on gates' },
    { id: 5, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'race_loop.py --simple', status: 'completed', gates_passed: 12, total_gates: 12, lap_time_sec: 70.5, created_at: '2026-04-11T14:45:00', notes: 'Passage detector fixed — exactly 12 passages for 12 gates' },
    { id: 6, sim_env: 'ADRL_Soccer_Field_Easy', controller: 'race_loop.py --simple', status: 'completed', gates_passed: 12, total_gates: 12, lap_time_sec: 70.2, created_at: '2026-04-12T10:30:00', notes: 'Flight quality instrumentation: avg 0.37m offset, 0 stuck events' },
  ],

  // Latest flight quality data (from April 12 run)
  flightQuality: {
    gatesPassed: 12,
    totalGates: 12,
    flightTime: 70.2,
    avgPassageOffset: 0.37,
    avgCrossTrack: 0.80,
    maxCrossTrack: 3.30,
    stuckEvents: 0,
    yoloMaP: 97.5,
    gates: [
      { id: 0, offset: 0.22, lateral: 0.10, vertical: 0.19, crossTrack: 0.45 },
      { id: 1, offset: 0.31, lateral: -0.15, vertical: 0.27, crossTrack: 0.62 },
      { id: 2, offset: 0.45, lateral: 0.32, vertical: -0.31, crossTrack: 1.20 },
      { id: 3, offset: 0.52, lateral: -0.28, vertical: 0.44, crossTrack: 3.30 },
      { id: 4, offset: 0.29, lateral: 0.12, vertical: -0.26, crossTrack: 0.88 },
      { id: 5, offset: 0.38, lateral: -0.21, vertical: 0.31, crossTrack: 0.72 },
      { id: 6, offset: 0.78, lateral: -0.57, vertical: -0.53, crossTrack: 1.15 },
      { id: 7, offset: 0.11, lateral: 0.05, vertical: 0.10, crossTrack: 0.35 },
      { id: 8, offset: 0.33, lateral: 0.18, vertical: -0.27, crossTrack: 0.55 },
      { id: 9, offset: 0.41, lateral: -0.30, vertical: 0.28, crossTrack: 0.90 },
      { id: 10, offset: 0.25, lateral: 0.14, vertical: -0.21, crossTrack: 0.48 },
      { id: 11, offset: 0.35, lateral: -0.08, vertical: 0.34, crossTrack: 0.65 },
    ],
  },

  // Gate positions from gate_poses.json (NED, approximate)
  trajectory: [
    { x: 0, y: 2 }, { x: 1.6, y: 10.8 }, { x: 8.8, y: 18.4 },
    { x: 19.2, y: 21.6 }, { x: 28.8, y: 18.0 }, { x: 33.6, y: 10.4 },
    { x: 31.2, y: 1.6 }, { x: 24.0, y: -4.0 }, { x: 14.4, y: -5.6 },
    { x: 6.4, y: -2.4 }, { x: 2.4, y: 4.0 }, { x: 0.8, y: 10.0 },
  ],
};

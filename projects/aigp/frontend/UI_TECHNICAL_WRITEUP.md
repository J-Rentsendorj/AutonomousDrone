# UI Implementation — Technical Write-Up

## AIGP Flight Operations Dashboard

**Baljinnyam (Jinn) Rentsendorj**
**Date:** April 12, 2026

---

## 1. Technology Stack

**Framework:** React 18 via CDN (no build step)
**Styling:** Custom CSS with CSS variables for theming
**Charts:** Chart.js 4.4 for data visualization
**Backend:** FastAPI (Python) with SQLite — built in a prior assignment
**Fonts:** DM Sans (display) + JetBrains Mono (data/monospace)

### Technology Justification

React was chosen because it is the industry standard for component-based UI development and maps directly to the reusable component requirement. Loading React via CDN rather than a full Node.js build pipeline was a deliberate decision: the frontend is a monitoring dashboard for an autonomous drone racing system, not a standalone web application. The no-build approach means the frontend can be opened directly in a browser without installing Node.js, npm, or any build tools — reducing friction for anyone reviewing the code.

Chart.js was selected for gate passage offset visualization because it handles responsive canvas charts with minimal configuration. The alternative (D3.js) would have required significantly more code for the same bar chart output.

The dark theme (industrial/utilitarian aesthetic) was chosen to match the operational context: a drone racing ops center where the user is monitoring autonomous flight telemetry, not browsing a consumer website.

---

## 2. Project Structure

```
frontend/
├── index.html                 # Entry point — loads React, Chart.js, Babel via CDN
├── styles.css                 # Global styles with CSS variables
├── App.jsx                    # Root component — routing + toast state management
│
├── services/
│   └── api.jsx                # API service layer with fetch wrapper + mock fallback
│
├── components/                # Reusable UI components
│   ├── MetricCard.jsx         # Labeled stat value display
│   ├── StatusBadge.jsx        # Color-coded status indicator
│   ├── GateChart.jsx          # Chart.js bar chart for gate offsets
│   ├── TrackMap.jsx           # SVG course map with gate markers
│   ├── Navbar.jsx             # Sidebar navigation with SVG icons
│   └── Toast.jsx              # Notification system with auto-dismiss
│
└── screens/                   # Full-page screen components
    ├── DashboardScreen.jsx    # Primary: metrics, charts, run history table
    ├── RunDetailScreen.jsx    # Individual run inspection with telemetry
    ├── PipelineScreen.jsx     # Autonomy stack architecture view
    └── NewRunScreen.jsx       # Form with input validation + API submission
```

### Separation of Concerns

- **Services** handle all API communication and data access. The `ApiService` object provides named methods (`getRuns`, `createRun`, etc.) that wrap fetch calls with error handling. When the backend is unavailable, the service falls back to `MockData` containing actual flight metrics from the AIGP autonomy stack.

- **Components** are stateless, reusable UI elements. `MetricCard` and `StatusBadge` are used across multiple screens (Dashboard, Run Detail, Pipeline). `GateChart` and `TrackMap` encapsulate Chart.js and SVG rendering logic respectively.

- **Screens** compose components into full pages with their own state management and data loading logic. Each screen handles its own API calls via `useEffect` and manages local UI state (selected gates, form inputs, loading indicators).

- **App.jsx** serves as the router, maintaining navigation state (`{ screen, params }`) and passing `navigate` callbacks to child screens. It also manages the toast notification system at the app level so any screen can trigger user feedback.

---

## 3. Screen Descriptions

### Dashboard (Primary Screen)

The main view showing flight quality overview. Displays four top-level metric cards (gates passed, flight time, average passage offset, stuck events), a Chart.js bar chart of per-gate passage offsets color-coded by quality, an SVG course map with numbered gate markers, an interactive gate selector showing lateral/vertical breakdown for each gate, and a run history table. Clicking a row in the run history navigates to the Run Detail screen.

Data loading: attempts to fetch from the FastAPI backend (`GET /api/runs`), shows a connection status indicator, and falls back to mock data if the API is unavailable.

### Run Detail

Inspection view for a single flight run. Shows run metadata (date, controller, status), gate count, lap time, and run notes. Includes a telemetry section that displays the API endpoint for retrieving 10 Hz telemetry snapshots. Navigated to by clicking a row in the Dashboard table, with a back button to return.

### Pipeline

Architecture view showing all 10 active components of the autonomy stack with their source files, descriptions, and status badges. Also displays 3 upcoming components (DCL adapter, PencilNet, minimum-snap trajectory) with their target timelines. Includes a text summary of the hybrid trajectory + YOLO drift correction architecture and a callout for the next milestone.

### New Run

Form screen for creating a new flight run. Demonstrates input validation (required fields, numeric range checking for gate count), form state management, select dropdowns for simulator environment and controller selection, a textarea for notes, and submission with toast feedback. Submits to `POST /api/runs` and navigates back to the dashboard on success, or displays an error toast if the API is unavailable.

---

## 4. State and Interaction

### Navigation State

The app uses a simple state-based router in `App.jsx`:

```javascript
const [nav, setNav] = useState({ screen: 'dashboard', params: {} });
```

Screen transitions are handled by a `navigate(screen, ...args)` function passed as a prop. The Run Detail screen receives `runId` via `params`.

### Form Validation

The New Run screen implements client-side validation:

- Required field checking (simulator environment, controller name)
- Numeric range validation (gate count must be 1–50)
- Error states clear on edit (errors disappear as the user corrects input)
- Toast notifications provide feedback on submission success or failure

### Interactive Elements

- Gate selector buttons on the Dashboard toggle a detail panel showing lateral/vertical offset breakdown
- Run history table rows are clickable, navigating to Run Detail
- Sidebar navigation highlights the active screen
- Toast notifications auto-dismiss after 3 seconds

### API Integration

The `ApiService` layer wraps all fetch calls in try/catch blocks. Every API call returns `{ data, error }` — screens check both before rendering. When the backend is offline, the Dashboard shows "Using cached data" in amber text and renders mock data based on actual AIGP flight metrics.

---

## 5. Implementation Challenges

### No Build Pipeline

Loading React via CDN means Babel transpiles JSX in the browser at runtime. This adds a brief load delay but eliminates the need for Node.js, webpack, or any build configuration. Components are loaded as separate `<script type="text/babel">` tags and communicate through `window.*` globals. In a production environment, a proper build pipeline (Vite or Next.js) would be preferred.

### Chart.js Canvas and Dark Theme

Chart.js does not support CSS variables for colors — all chart colors must be hardcoded hex values. This required manually selecting chart colors that work against the dark background rather than using the theme's CSS variable system.

### API Availability

The frontend must work both with and without the FastAPI backend running. This required a dual-path data loading strategy in every screen: attempt the API call first, then fall back to `MockData`. The connection status indicator on the Dashboard communicates which mode is active.

---

## 6. Lessons Learned

1. **Component reuse pays off immediately.** `MetricCard` and `StatusBadge` were written once and used across 3 screens each. Adding a new metric to any screen takes one line of code.

2. **Mock data prevents frontend development from blocking on backend availability.** By embedding actual flight metrics as fallback data, the UI is always demonstrable regardless of whether the API server is running.

3. **Dark themes require more design attention than light themes.** Every text element, border, and background needs explicit color assignment — "default" colors that work on white backgrounds become invisible on dark surfaces.

4. **Form validation UX matters.** Early versions showed all errors on load. Switching to show-on-submit with clear-on-edit created a much better user experience.

5. **Separation of services from components keeps API changes isolated.** When the FastAPI endpoint structure changed during development, only `api.jsx` needed updates — no screen components were modified.

/**
 * PipelineScreen — Autonomy stack architecture view
 * Shows all pipeline stages with status, files, and descriptions
 * Includes architecture summary and next milestone
 */
window.PipelineScreen = function PipelineScreen() {
  const h = React.createElement;

  // Pipeline stages matching the actual AIGP codebase
  const stages = [
    { label: 'Gate extraction', file: 'gate_extractor.py', desc: 'simGetObjectPose → gate_poses.json (12 gates)', status: 'done' },
    { label: 'Trajectory planning', file: 'trajectory_planner.py', desc: '34 waypoints, linear interpolation between gate centers', status: 'done' },
    { label: 'Spline flight', file: 'sim_adapter.py', desc: 'moveOnSplineVelConstraintsAsync — smooth traversal', status: 'done' },
    { label: 'YOLO gate detection', file: 'gate_detector.py', desc: 'YOLOv8-nano, 97.5% mAP@0.5, 10 Hz inference', status: 'done' },
    { label: 'Drift correction', file: 'drift_corrector.py', desc: 'FOV-based angular correction — monitoring only, not applied', status: 'monitoring' },
    { label: 'Passage detection', file: 'passage_detector.py', desc: 'Gate-plane crossing with per-gate lock and sequential enforcement', status: 'done' },
    { label: 'Visual servo', file: 'visual_servo.py', desc: '4-mode fallback: servo / approach / pass_through / search', status: 'done' },
    { label: 'Flight tracking', file: 'flight_tracker.py', desc: 'Per-gate offset (total/lateral/vertical), cross-track, stuck detection', status: 'done' },
    { label: 'Auto-label pipeline', file: 'collect_gate_data.py', desc: '103 frames, 461 annotations — retrain on any sim', status: 'done' },
    { label: 'Telemetry', file: 'telemetry.py', desc: '10 Hz CSV logging with matplotlib visualization', status: 'done' },
  ];

  // Deferred / upcoming components
  const upcoming = [
    { label: 'DCL adapter', file: 'dcl_adapter.py', desc: 'MAVSDK-Python + SET_ATTITUDE_TARGET for DCL simulator', status: 'blocked', when: 'May — when credentials arrive' },
    { label: 'PencilNet corners', file: 'gate_detector_v2.py', desc: 'Corner detection for PnP distance estimation', status: 'blocked', when: 'VQ1 prep' },
    { label: 'Minimum-snap trajectory', file: 'trajectory_planner.py', desc: 'Replace linear interpolation with smooth minimum-snap math', status: 'blocked', when: 'VQ1 prep' },
  ];

  return h('div', null,
    h('div', { className: 'page-header' },
      h('h1', { className: 'page-title' }, 'Autonomy pipeline'),
      h('p', { className: 'page-subtitle' }, 'Hybrid trajectory + YOLO drift correction architecture')
    ),

    // Active pipeline
    h('div', { className: 'section-card', style: { padding: 0, overflow: 'hidden' } },
      h('div', { style: { padding: '16px 24px 8px', borderBottom: '1px solid var(--border)' } },
        h('div', { className: 'section-title', style: { marginBottom: 0 } }, 'Active components')
      ),
      ...stages.map((s, i) =>
        h('div', { key: i, className: 'pipeline-row' },
          h('div', null,
            h('div', { className: 'pipeline-name' }, s.label),
            h('div', { className: 'pipeline-file' }, s.file)
          ),
          h('div', { className: 'pipeline-desc' }, s.desc),
          h('div', { style: { textAlign: 'right' } },
            h(window.StatusBadge, { status: s.status })
          )
        )
      )
    ),

    // Upcoming
    h('div', { className: 'section-card', style: { padding: 0, overflow: 'hidden' } },
      h('div', { style: { padding: '16px 24px 8px', borderBottom: '1px solid var(--border)' } },
        h('div', { className: 'section-title', style: { marginBottom: 0 } }, 'Upcoming')
      ),
      ...upcoming.map((s, i) =>
        h('div', { key: i, className: 'pipeline-row' },
          h('div', null,
            h('div', { className: 'pipeline-name' }, s.label),
            h('div', { className: 'pipeline-file' }, s.file)
          ),
          h('div', null,
            h('div', { className: 'pipeline-desc' }, s.desc),
            h('div', { className: 'pipeline-desc', style: { marginTop: 2, color: '#4a5a6e' } }, s.when)
          ),
          h('div', { style: { textAlign: 'right' } },
            h(window.StatusBadge, { status: s.status })
          )
        )
      )
    ),

    // Architecture summary
    h('div', { className: 'section-card' },
      h('div', { className: 'section-title' }, 'Architecture'),
      h('p', { className: 'arch-summary' },
        'Offline phase: extract gate positions from the simulator, then plan a smooth trajectory through all gates. ',
        'Real-time phase: follow the pre-planned spline path as primary navigation. ',
        'YOLO gate detection runs at 10 Hz for drift measurement — comparing where the trajectory expects each gate versus where the camera actually detects it. ',
        'Drift correction currently monitors only (not applied to flight path). ',
        'Passage detector confirms each gate flythrough via gate-plane crossing geometry with sequential enforcement. ',
        'Visual servo controller available as fallback if the trajectory is lost.'
      )
    ),

    // Next milestone
    h('div', { className: 'callout' },
      h('div', { className: 'callout-title' }, 'Next milestone: DCL simulator port'),
      h('div', { className: 'callout-text' },
        'Build DCLAdapter implementing SimAdapter ABC using MAVSDK-Python with SET_ATTITUDE_TARGET (raw TRPY). ',
        'Retrain YOLO on DCL gate appearance using existing auto-label pipeline. ',
        'Re-tune trajectory timing for DCL physics. ',
        'Target: May 2026 when VQ1 launches and simulator credentials arrive.'
      )
    )
  );
};

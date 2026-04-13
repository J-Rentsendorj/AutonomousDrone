/**
 * DashboardScreen — Primary screen
 * Shows flight quality overview, gate chart, course map, and run history
 * Attempts to fetch from API, falls back to MockData
 */
window.DashboardScreen = function DashboardScreen({ onNavigate, addToast }) {
  const h = React.createElement;
  const [runs, setRuns] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [apiConnected, setApiConnected] = React.useState(false);
  const [selectedGate, setSelectedGate] = React.useState(null);

  const fq = window.MockData.flightQuality;
  const traj = window.MockData.trajectory;

  // Attempt to load runs from API on mount
  React.useEffect(() => {
    async function load() {
      const { data, error } = await window.ApiService.getRuns();
      if (data && !error) {
        setRuns(data);
        setApiConnected(true);
      } else {
        // Fall back to mock data
        setRuns(window.MockData.runs);
        setApiConnected(false);
      }
      setLoading(false);
    }
    load();
  }, []);

  const selGate = selectedGate !== null ? fq.gates[selectedGate] : null;

  return h('div', null,
    // Page header
    h('div', { className: 'page-header' },
      h('h1', { className: 'page-title' }, 'Flight operations'),
      h('p', { className: 'page-subtitle' },
        'ADRL Soccer_Field_Easy · 12 gates · ',
        apiConnected
          ? h('span', { style: { color: '#22c55e' } }, 'API connected')
          : h('span', { style: { color: '#f59e0b' } }, 'Using cached data')
      )
    ),

    // Top-level metrics
    h('div', { className: 'metrics-grid metrics-grid-4' },
      h(window.MetricCard, { label: 'Gates passed', value: `${fq.gatesPassed}/${fq.totalGates}`, accent: '#22c55e' }),
      h(window.MetricCard, { label: 'Flight time', value: fq.flightTime.toFixed(1), unit: 'sec' }),
      h(window.MetricCard, { label: 'Avg passage offset', value: fq.avgPassageOffset.toFixed(2), unit: 'm' }),
      h(window.MetricCard, { label: 'Stuck events', value: fq.stuckEvents, accent: '#22c55e' })
    ),

    // Two-column: Gate chart + Course map
    h('div', { className: 'two-col' },
      h('div', { className: 'section-card' },
        h('div', { className: 'section-title' }, 'Gate passage offsets'),
        h(window.GateChart, { gates: fq.gates })
      ),
      h('div', { className: 'section-card' },
        h('div', { className: 'section-title' }, 'Course trajectory'),
        h(window.TrackMap, { gates: fq.gates, trajectory: traj })
      )
    ),

    // Per-gate detail selector
    h('div', { className: 'section-card' },
      h('div', { className: 'section-title' }, 'Per-gate detail'),
      h('div', { className: 'gate-selector' },
        ...fq.gates.map(g =>
          h('button', {
            key: g.id,
            className: `gate-btn ${selectedGate === g.id ? 'active' : ''}`,
            onClick: () => setSelectedGate(selectedGate === g.id ? null : g.id),
          }, `G${g.id}`)
        )
      ),
      selGate
        ? h('div', { className: 'gate-detail' },
            h('div', { className: 'gate-detail-grid' },
              h('div', null,
                h('div', { className: 'gate-detail-label' }, 'Total offset'),
                h('div', { className: 'gate-detail-value' }, selGate.offset.toFixed(2) + 'm')
              ),
              h('div', null,
                h('div', { className: 'gate-detail-label' }, 'Lateral'),
                h('div', {
                  className: 'gate-detail-value',
                  style: { color: selGate.lateral < 0 ? '#ef4444' : '#22c55e' },
                }, (selGate.lateral > 0 ? '+' : '') + selGate.lateral.toFixed(2) + 'm')
              ),
              h('div', null,
                h('div', { className: 'gate-detail-label' }, 'Vertical'),
                h('div', {
                  className: 'gate-detail-value',
                  style: { color: selGate.vertical < 0 ? '#ef4444' : '#22c55e' },
                }, (selGate.vertical > 0 ? '+' : '') + selGate.vertical.toFixed(2) + 'm')
              )
            ),
            h('div', {
              style: { marginTop: 8, fontSize: 12, color: '#7a8a9e', fontFamily: 'var(--font-mono)' },
            }, `Cross-track error: ${selGate.crossTrack.toFixed(2)}m`)
          )
        : h('div', { style: { fontSize: 13, color: '#4a5a6e', fontStyle: 'italic' } },
            'Select a gate above to inspect lateral and vertical passage offset'
          )
    ),

    // Secondary metrics
    h('div', { className: 'metrics-grid metrics-grid-3' },
      h(window.MetricCard, { label: 'YOLO mAP@0.5', value: fq.yoloMaP.toFixed(1), unit: '%', accent: '#3b82f6' }),
      h(window.MetricCard, { label: 'Avg cross-track', value: fq.avgCrossTrack.toFixed(2), unit: 'm' }),
      h(window.MetricCard, { label: 'Max cross-track', value: fq.maxCrossTrack.toFixed(2), unit: 'm' })
    ),

    // Run history table
    h('div', { className: 'section-card' },
      h('div', { className: 'section-title' }, 'Run history'),
      loading
        ? h('div', { className: 'empty-state loading-pulse' }, 'Loading runs...')
        : runs && runs.length > 0
          ? h('table', { className: 'data-table' },
              h('thead', null,
                h('tr', null,
                  h('th', null, 'Date'),
                  h('th', null, 'Controller'),
                  h('th', null, 'Gates'),
                  h('th', null, 'Time'),
                  h('th', null, 'Status'),
                  h('th', null, 'Notes')
                )
              ),
              h('tbody', null,
                ...runs.slice().reverse().map(run =>
                  h('tr', {
                    key: run.id,
                    onClick: () => onNavigate('detail', run.id),
                  },
                    h('td', { className: 'mono' },
                      new Date(run.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ),
                    h('td', { className: 'mono', style: { color: '#e0e6ed' } },
                      run.controller || run.sim_env || '—'
                    ),
                    h('td', { className: 'mono' },
                      `${run.gates_passed || '?'}/${run.total_gates || 12}`
                    ),
                    h('td', { className: 'mono' },
                      run.lap_time_sec ? run.lap_time_sec.toFixed(1) + 's' : 'DNF'
                    ),
                    h('td', null, h(window.StatusBadge, { status: run.status })),
                    h('td', {
                      style: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                    }, run.notes || '—')
                  )
                )
              )
            )
          : h('div', { className: 'empty-state' }, 'No runs recorded yet')
    )
  );
};

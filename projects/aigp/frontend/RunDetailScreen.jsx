/**
 * RunDetailScreen — Individual run inspection
 * Shows run metadata, gate passage results, and telemetry chart
 * Navigated to by clicking a row in the Dashboard run history table
 */
window.RunDetailScreen = function RunDetailScreen({ runId, onNavigate }) {
  const h = React.createElement;
  const [run, setRun] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      // Try API first
      const { data, error } = await window.ApiService.getRun(runId);
      if (data && !error) {
        setRun(data);
      } else {
        // Fall back to mock
        const mock = window.MockData.runs.find(r => r.id === runId);
        setRun(mock || null);
      }
      setLoading(false);
    }
    load();
  }, [runId]);

  if (loading) {
    return h('div', null,
      h('div', { className: 'page-header' },
        h('button', { className: 'back-link', onClick: () => onNavigate('dashboard') }, '\u2190 Back'),
        h('h1', { className: 'page-title loading-pulse' }, 'Loading run...')
      )
    );
  }

  if (!run) {
    return h('div', null,
      h('div', { className: 'page-header' },
        h('button', { className: 'back-link', onClick: () => onNavigate('dashboard') }, '\u2190 Back'),
        h('h1', { className: 'page-title' }, 'Run not found')
      ),
      h('div', { className: 'empty-state' }, `No data available for run #${runId}`)
    );
  }

  const dateStr = run.created_at
    ? new Date(run.created_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Unknown date';

  return h('div', null,
    // Header with back nav
    h('div', { className: 'page-header' },
      h('button', { className: 'back-link', onClick: () => onNavigate('dashboard') }, '\u2190 Back to dashboard'),
      h('h1', { className: 'page-title' }, `Run #${run.id}`),
      h('p', { className: 'page-subtitle' }, `${dateStr} · ${run.controller || run.sim_env || 'Unknown controller'}`)
    ),

    // Status + metrics
    h('div', { className: 'metrics-grid metrics-grid-4' },
      h(window.MetricCard, {
        label: 'Status',
        value: run.status,
        accent: run.status === 'completed' ? '#22c55e' : run.status === 'crashed' ? '#ef4444' : '#f59e0b',
      }),
      h(window.MetricCard, {
        label: 'Gates passed',
        value: `${run.gates_passed || '?'}/${run.total_gates || 12}`,
        accent: run.gates_passed >= 12 ? '#22c55e' : '#f59e0b',
      }),
      h(window.MetricCard, {
        label: 'Lap time',
        value: run.lap_time_sec ? run.lap_time_sec.toFixed(1) : 'DNF',
        unit: run.lap_time_sec ? 'sec' : '',
      }),
      h(window.MetricCard, {
        label: 'Sim environment',
        value: 'ADRL',
      })
    ),

    // Notes section
    run.notes ? h('div', { className: 'section-card' },
      h('div', { className: 'section-title' }, 'Run notes'),
      h('p', { style: { fontSize: 13, color: '#7a8a9e', lineHeight: 1.6 } }, run.notes)
    ) : null,

    // Telemetry placeholder
    h('div', { className: 'section-card' },
      h('div', { className: 'section-title' }, 'Telemetry'),
      h('div', { className: 'empty-state' },
        'Telemetry visualization available when API backend is running.',
        h('br'),
        h('span', { className: 'mono', style: { fontSize: 12 } }, 'GET /api/runs/' + runId + '/telemetry')
      )
    ),

    // Technical context
    h('div', { className: 'callout' },
      h('div', { className: 'callout-title' }, 'API endpoint'),
      h('div', { className: 'callout-text' },
        h('span', { className: 'mono' }, `GET /api/runs/${runId}`),
        ' — Returns full run metadata. ',
        h('span', { className: 'mono' }, `GET /api/runs/${runId}/telemetry`),
        ' — Returns up to 500 telemetry snapshots with position, velocity, and attitude data at 10 Hz.'
      )
    )
  );
};

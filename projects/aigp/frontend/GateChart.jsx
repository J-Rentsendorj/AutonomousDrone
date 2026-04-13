/**
 * GateChart — Per-gate passage offset bar chart
 * Renders using Chart.js canvas
 * Color-codes bars: green (best), blue (nominal), red (worst)
 */
window.GateChart = function GateChart({ gates }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !gates || gates.length === 0) return;

    // Destroy previous chart instance if it exists
    if (chartRef.current) chartRef.current.destroy();

    const colors = gates.map(g => {
      if (g.offset <= 0.15) return '#22c55e';
      if (g.offset >= 0.7)  return '#ef4444';
      return '#3b82f6';
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: gates.map(g => `G${g.id}`),
        datasets: [{
          label: 'Passage offset (m)',
          data: gates.map(g => Math.round(g.offset * 100) / 100),
          backgroundColor: colors,
          borderRadius: 3,
          barPercentage: 0.7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y.toFixed(2)}m offset`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#4a5a6e', font: { family: "'JetBrains Mono'", size: 11 } },
            grid: { display: false },
          },
          y: {
            min: 0,
            max: 1.0,
            ticks: {
              color: '#4a5a6e',
              font: { family: "'JetBrains Mono'", size: 11 },
              callback: (v) => v.toFixed(1) + 'm',
            },
            grid: { color: 'rgba(30,42,58,0.8)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [gates]);

  return React.createElement('div', null,
    React.createElement('div', { className: 'chart-container' },
      React.createElement('canvas', {
        ref: canvasRef,
        role: 'img',
        'aria-label': 'Bar chart showing passage offset distance for each gate',
      }, 'Gate passage offset chart')
    ),
    // Legend
    React.createElement('div', {
      style: { display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px' },
    },
      React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px', color: '#7a8a9e' } },
        React.createElement('span', { style: { width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' } }),
        'best (<0.15m)'
      ),
      React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px', color: '#7a8a9e' } },
        React.createElement('span', { style: { width: 10, height: 10, borderRadius: 2, background: '#3b82f6', display: 'inline-block' } }),
        'nominal'
      ),
      React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: '4px', color: '#7a8a9e' } },
        React.createElement('span', { style: { width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' } }),
        'worst (>0.7m)'
      )
    )
  );
};

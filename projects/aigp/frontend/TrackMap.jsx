/**
 * TrackMap — SVG visualization of the gate course
 * Renders gate positions as numbered markers connected by a path
 * Color-codes gates by passage quality
 */
window.TrackMap = function TrackMap({ gates, trajectory }) {
  if (!trajectory || trajectory.length === 0) return null;

  const pad = 4;
  const w = 380, h = 280;
  const xs = trajectory.map(p => p.x);
  const ys = trajectory.map(p => p.y);
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
  const sx = (v) => ((v - minX) / (maxX - minX)) * (w - 40) + 20;
  const sy = (v) => h - (((v - minY) / (maxY - minY)) * (h - 40) + 20);

  // Build closed path through all gates
  const pathD = trajectory.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`
  ).join(' ') + ' Z';

  // Gate color based on offset quality
  const gateColor = (i) => {
    if (!gates || !gates[i]) return '#3b82f6';
    if (gates[i].offset <= 0.15) return '#22c55e';
    if (gates[i].offset >= 0.7) return '#ef4444';
    return '#3b82f6';
  };

  return React.createElement('svg', {
    viewBox: `0 0 ${w} ${h}`,
    style: { width: '100%', height: 'auto' },
    role: 'img',
    'aria-label': 'Course map showing gate positions for Soccer Field Easy track',
  },
    // Track path
    React.createElement('path', {
      d: pathD,
      fill: 'none',
      stroke: '#3b82f6',
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
      opacity: 0.35,
    }),
    // Gate markers
    ...trajectory.map((p, i) =>
      React.createElement('g', { key: i },
        React.createElement('rect', {
          x: sx(p.x) - 9,
          y: sy(p.y) - 9,
          width: 18,
          height: 18,
          rx: 3,
          fill: gateColor(i),
          opacity: 0.9,
        }),
        React.createElement('text', {
          x: sx(p.x),
          y: sy(p.y) + 4,
          textAnchor: 'middle',
          fill: 'white',
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono'",
        }, i)
      )
    ),
    // Start indicator ring
    React.createElement('circle', {
      cx: sx(trajectory[0].x),
      cy: sy(trajectory[0].y),
      r: 14,
      fill: 'none',
      stroke: '#22c55e',
      strokeWidth: 1.5,
      strokeDasharray: '3,2',
    })
  );
};

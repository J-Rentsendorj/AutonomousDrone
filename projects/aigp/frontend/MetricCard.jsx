/**
 * MetricCard — Reusable metric display component
 * Shows a label, value, and optional unit with accent color
 * Used across Dashboard and RunDetail screens
 */
window.MetricCard = function MetricCard({ label, value, unit, accent }) {
  return React.createElement('div', { className: 'metric-card' },
    React.createElement('div', { className: 'metric-label' }, label),
    React.createElement('div', null,
      React.createElement('span', {
        className: 'metric-value',
        style: accent ? { color: accent } : undefined,
      }, value),
      unit ? React.createElement('span', { className: 'metric-unit' }, unit) : null
    )
  );
};

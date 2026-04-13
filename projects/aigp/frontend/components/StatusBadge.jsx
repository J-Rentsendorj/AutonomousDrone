/**
 * StatusBadge — Reusable status indicator component
 * Maps status strings to color-coded badges
 * Used in run tables and pipeline views
 */
window.StatusBadge = function StatusBadge({ status }) {
  const classMap = {
    completed: 'badge-success',
    done: 'badge-success',
    complete: 'badge-success',
    in_progress: 'badge-info',
    monitoring: 'badge-warning',
    partial: 'badge-warning',
    crashed: 'badge-danger',
    timed_out: 'badge-danger',
    blocked: 'badge-danger',
  };
  const cls = classMap[status] || 'badge-info';
  return React.createElement('span', { className: `badge ${cls}` }, status);
};

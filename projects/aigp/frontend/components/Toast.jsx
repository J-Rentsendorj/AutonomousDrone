/**
 * Toast — Notification component for user feedback
 * Supports success, error, and info types
 * Auto-dismisses after 3 seconds
 */
window.ToastContainer = function ToastContainer({ toasts, onDismiss }) {
  return React.createElement('div', { className: 'toast-container' },
    ...toasts.map(t =>
      React.createElement('div', {
        key: t.id,
        className: `toast toast-${t.type}`,
        onClick: () => onDismiss(t.id),
        role: 'alert',
      }, t.message)
    )
  );
};

// Hook for managing toasts
window.useToasts = function useToasts() {
  const [toasts, setToasts] = React.useState([]);
  let nextId = React.useRef(0);

  const addToast = (message, type = 'info') => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const dismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, dismiss };
};

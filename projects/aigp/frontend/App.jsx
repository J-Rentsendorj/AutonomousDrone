/**
 * App — Root component
 * Manages screen navigation, toast notifications, and overall layout
 * Renders sidebar + main content area with the active screen
 */
const App = () => {
  const h = React.createElement;

  // Navigation state: { screen, params }
  const [nav, setNav] = React.useState({ screen: 'dashboard', params: {} });

  // Toast notification system
  const { toasts, addToast, dismiss } = window.useToasts();

  // Navigate to a screen with optional params
  const navigate = (screen, ...args) => {
    if (screen === 'detail') {
      setNav({ screen: 'detail', params: { runId: args[0] } });
    } else {
      setNav({ screen, params: {} });
    }
  };

  // Render the active screen
  const renderScreen = () => {
    switch (nav.screen) {
      case 'dashboard':
        return h(window.DashboardScreen, { onNavigate: navigate, addToast });
      case 'detail':
        return h(window.RunDetailScreen, { runId: nav.params.runId, onNavigate: navigate });
      case 'pipeline':
        return h(window.PipelineScreen, {});
      case 'newrun':
        return h(window.NewRunScreen, { onNavigate: navigate, addToast });
      default:
        return h(window.DashboardScreen, { onNavigate: navigate, addToast });
    }
  };

  return h('div', { className: 'app-container' },
    // Sidebar navigation
    h(window.Navbar, { currentScreen: nav.screen, onNavigate: navigate }),
    // Main content area
    h('main', { className: 'main-content' }, renderScreen()),
    // Toast overlay
    h(window.ToastContainer, { toasts, onDismiss: dismiss })
  );
};

// Mount the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

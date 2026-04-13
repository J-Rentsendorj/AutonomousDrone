/**
 * Navbar — Sidebar navigation component
 * Handles screen routing via callback
 * SVG icons for each nav item
 */
window.Navbar = function Navbar({ currentScreen, onNavigate }) {
  const h = React.createElement;

  // Simple SVG icon paths
  const icons = {
    dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    detail: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z',
    pipeline: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
    newrun: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'pipeline', label: 'Pipeline', icon: icons.pipeline },
    { id: 'newrun', label: 'New run', icon: icons.newrun },
  ];

  return h('aside', { className: 'sidebar' },
    // Brand
    h('div', { className: 'sidebar-brand' },
      h('div', { className: 'sidebar-brand-label' }, 'Khanate Industries'),
      h('div', { className: 'sidebar-brand-name' }, 'AIGP Ops')
    ),

    // Navigation
    h('ul', { className: 'sidebar-nav' },
      ...navItems.map(item =>
        h('li', { key: item.id },
          h('button', {
            className: `nav-link ${currentScreen === item.id ? 'active' : ''}`,
            onClick: () => onNavigate(item.id),
          },
            h('svg', {
              className: 'nav-icon',
              viewBox: '0 0 24 24',
              fill: 'currentColor',
            }, h('path', { d: item.icon })),
            item.label
          )
        )
      )
    ),

    // Footer
    h('div', { className: 'sidebar-footer' },
      h('div', { className: 'sidebar-footer-text' }, 'ADRL · Soccer_Field_Easy'),
      h('div', { className: 'sidebar-footer-text', style: { marginTop: 4 } }, 'Python 3.12 · YOLOv8-nano')
    )
  );
};

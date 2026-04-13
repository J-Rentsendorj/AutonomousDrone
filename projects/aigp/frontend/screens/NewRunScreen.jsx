/**
 * NewRunScreen — Form to create a new flight run
 * Demonstrates input validation, form state handling, and user feedback
 * Submits to POST /api/runs when backend is available
 */
window.NewRunScreen = function NewRunScreen({ onNavigate, addToast }) {
  const h = React.createElement;

  // Form state
  const [formData, setFormData] = React.useState({
    sim_env: 'ADRL_Soccer_Field_Easy',
    controller: 'race_loop.py --simple',
    total_gates: '12',
    notes: '',
  });

  // Validation errors
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  // Update form field
  const setField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on edit
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  // Validate form
  const validate = () => {
    const errs = {};
    if (!formData.sim_env.trim()) errs.sim_env = 'Simulator environment is required';
    if (!formData.controller.trim()) errs.controller = 'Controller name is required';
    const gates = parseInt(formData.total_gates, 10);
    if (isNaN(gates) || gates < 1 || gates > 50) {
      errs.total_gates = 'Enter a number between 1 and 50';
    }
    return errs;
  };

  // Submit handler
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast('Please fix the errors below', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      sim_env: formData.sim_env.trim(),
      controller: formData.controller.trim(),
      total_gates: parseInt(formData.total_gates, 10),
      notes: formData.notes.trim() || null,
      status: 'in_progress',
    };

    const { data, error } = await window.ApiService.createRun(payload);

    if (data && !error) {
      addToast(`Run #${data.id} created successfully`, 'success');
      onNavigate('dashboard');
    } else {
      addToast(error || 'Failed to create run — is the API server running?', 'error');
    }
    setSubmitting(false);
  };

  return h('div', null,
    h('div', { className: 'page-header' },
      h('h1', { className: 'page-title' }, 'New flight run'),
      h('p', { className: 'page-subtitle' }, 'Configure and launch a new autonomous flight attempt')
    ),

    h('div', { className: 'section-card', style: { maxWidth: 600 } },
      // Simulator environment
      h('div', { className: 'form-group' },
        h('label', { className: 'form-label', htmlFor: 'sim_env' }, 'Simulator environment'),
        h('select', {
          id: 'sim_env',
          className: `form-select ${errors.sim_env ? 'error' : ''}`,
          value: formData.sim_env,
          onChange: (e) => setField('sim_env', e.target.value),
        },
          h('option', { value: 'ADRL_Soccer_Field_Easy' }, 'ADRL — Soccer Field Easy (12 gates)'),
          h('option', { value: 'ADRL_ZhangJiaJie_Medium' }, 'ADRL — ZhangJiaJie Medium'),
          h('option', { value: 'ADRL_Building99_Hard' }, 'ADRL — Building99 Hard'),
          h('option', { value: 'DCL_VQ1' }, 'DCL — VQ1 Course (May 2026)')
        ),
        errors.sim_env ? h('div', { className: 'form-error' }, errors.sim_env) : null
      ),

      // Controller
      h('div', { className: 'form-group' },
        h('label', { className: 'form-label', htmlFor: 'controller' }, 'Controller'),
        h('select', {
          id: 'controller',
          className: `form-select ${errors.controller ? 'error' : ''}`,
          value: formData.controller,
          onChange: (e) => setField('controller', e.target.value),
        },
          h('option', { value: 'race_loop.py --simple' }, 'race_loop.py --simple (spline, no corrections)'),
          h('option', { value: 'race_loop.py --corrections' }, 'race_loop.py --corrections (visual drift correction)'),
          h('option', { value: 'race_spline.py' }, 'race_spline.py (golden reference)'),
          h('option', { value: 'custom' }, 'Custom controller')
        ),
        errors.controller ? h('div', { className: 'form-error' }, errors.controller) : null,
        h('div', { className: 'form-help' }, 'race_loop.py --simple is the recommended baseline for VQ1')
      ),

      // Gate count row
      h('div', { className: 'form-row' },
        h('div', { className: 'form-group' },
          h('label', { className: 'form-label', htmlFor: 'total_gates' }, 'Total gates'),
          h('input', {
            id: 'total_gates',
            type: 'number',
            className: `form-input ${errors.total_gates ? 'error' : ''}`,
            value: formData.total_gates,
            min: 1,
            max: 50,
            onChange: (e) => setField('total_gates', e.target.value),
          }),
          errors.total_gates ? h('div', { className: 'form-error' }, errors.total_gates) : null
        ),
        h('div', { className: 'form-group' },
          h('label', { className: 'form-label' }, 'Max duration'),
          h('input', {
            type: 'text',
            className: 'form-input',
            value: '120 sec',
            disabled: true,
            style: { opacity: 0.5 },
          }),
          h('div', { className: 'form-help' }, 'Competition limit: 8 min')
        )
      ),

      // Notes
      h('div', { className: 'form-group' },
        h('label', { className: 'form-label', htmlFor: 'notes' }, 'Notes (optional)'),
        h('textarea', {
          id: 'notes',
          className: 'form-textarea',
          placeholder: 'What are you testing in this run?',
          value: formData.notes,
          onChange: (e) => setField('notes', e.target.value),
        })
      ),

      // Action buttons
      h('div', { style: { display: 'flex', gap: 12, marginTop: 8 } },
        h('button', {
          className: 'btn btn-primary',
          onClick: handleSubmit,
          disabled: submitting,
        }, submitting ? 'Creating...' : 'Create run'),
        h('button', {
          className: 'btn btn-secondary',
          onClick: () => onNavigate('dashboard'),
        }, 'Cancel')
      )
    ),

    // API info callout
    h('div', { className: 'callout', style: { maxWidth: 600, marginTop: 20 } },
      h('div', { className: 'callout-title' }, 'How it works'),
      h('div', { className: 'callout-text' },
        'Creating a run sends a POST request to the FastAPI backend at ',
        h('span', { className: 'mono' }, 'POST /api/runs'),
        '. The run is stored in SQLite with status "in_progress". ',
        'During flight, the autonomy stack posts telemetry snapshots to ',
        h('span', { className: 'mono' }, 'POST /api/runs/{id}/telemetry'),
        ' and gate passage events to ',
        h('span', { className: 'mono' }, 'POST /api/runs/{id}/gates'),
        '. After flight completes, the run status is updated via PATCH.'
      )
    )
  );
};

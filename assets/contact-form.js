(() => {
  'use strict';
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const fields = [form.elements.name, form.elements.email];
  function validate(input) {
    const invalid = !input.value.trim() || !input.validity.valid;
    const error = document.getElementById(input.name + '-error');
    input.setAttribute('aria-invalid', String(invalid));
    error.hidden = !invalid;
    error.textContent = invalid ? (input.name === 'email' ? 'Enter a valid email address.' : 'Enter your name.') : '';
    return !invalid;
  }
  fields.forEach(input => input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validate(input);
  }));
  let pending = false;
  const submit = form.querySelector('[type=submit]');
  form.addEventListener('submit', event => {
    if (pending) { event.preventDefault(); return; }
    const valid = fields.map(validate);
    if (valid.some(value => !value)) {
      event.preventDefault(); fields[valid.indexOf(false)].focus(); return;
    }
    pending = true;
    submit.disabled = true;
    form.querySelector('.form-status').textContent = 'Opening the secure submission page. Complete any spam check to send your enquiry.';
    // This is an attempt, not a confirmed delivery or a Lead.
    window.therlyTrackContact?.('form_attempt');
  });
  window.addEventListener('pageshow', () => {
    pending = false; submit.disabled = false;
    form.querySelector('.form-status').textContent = '';
  });
})();

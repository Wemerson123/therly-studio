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
  form.addEventListener('submit', event => {
    event.preventDefault();
    const valid = fields.map(validate);
    if (valid.some(value => !value)) { fields[valid.indexOf(false)].focus(); return; }
    const d = new FormData(form);
    const body = `Name: ${d.get('name').trim()}\nEmail: ${d.get('email').trim()}\nBusiness: ${d.get('business') || '-'}\nInterested in: ${d.getAll('need').join(', ') || '-'}\n\n${d.get('message') || ''}`;
    const url = `mailto:hello@therly.com.au?subject=${encodeURIComponent('New project enquiry')}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-status').textContent = 'Your email draft is ready. Press Send in your email app to send your enquiry. If no app opens, email hello@therly.com.au or call 0449 938 730.';
    window.therlyTrackContact?.('email_draft');
    window.location.href = url;
  });
})();

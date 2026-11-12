(() => {
  'use strict';
  const form = document.getElementById('quote-form');
  if (!form) return;
  const card = document.getElementById('quote-card');
  const done = document.getElementById('quote-done');
  const status = form.querySelector('.status');
  const submit = form.querySelector('[type=submit]');
  const label = submit.querySelector('.lbl');
  const endpoint = 'https://formsubmit.co/ajax/hello@therly.com.au';
  const track = (name, params) => window.therlyTrack?.(name, params);
  const openedAt = Date.now();

  // Where the visit came from (Instagram bio link carries utm_source=instagram).
  const qs = new URLSearchParams(location.search);
  let ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (_) {}
  const source = qs.get('utm_source') || (/instagram/.test(ref) ? 'instagram' : ref) || 'direct';
  const sourceText = [source, qs.get('utm_medium'), qs.get('utm_campaign')].filter(Boolean).join(' / ');
  form.elements.Source.value = sourceText;

  const fields = [...form.querySelectorAll('[required]')];
  const serviceGroup = form.querySelector('[data-required]');

  function errorEl(input) {
    return input.closest('.f, .consent')?.querySelector('.err');
  }
  function validate(input) {
    const value = input.type === 'checkbox' ? input.checked : input.value.trim();
    const ok = !!value && input.validity.valid;
    input.setAttribute('aria-invalid', String(!ok));
    const e = errorEl(input);
    if (e) e.textContent = ok ? '' : input.dataset.msg;
    return ok;
  }
  function validateServices() {
    const ok = !!serviceGroup.querySelector('input:checked');
    serviceGroup.setAttribute('aria-invalid', String(!ok));
    serviceGroup.parentElement.querySelector('.err').textContent = ok ? '' : serviceGroup.dataset.msg;
    return ok;
  }
  fields.forEach(input => {
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validate(input);
    });
    if (input.type !== 'checkbox') input.addEventListener('blur', () => { if (input.value) validate(input); });
  });
  serviceGroup.addEventListener('change', () => {
    if (serviceGroup.getAttribute('aria-invalid') === 'true') validateServices();
  });

  let started = false;
  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    track('quote_form_start', {source});
  });

  function setSending(on) {
    submit.disabled = on;
    submit.classList.toggle('is-sending', on);
    label.textContent = on ? 'Sending…' : 'Get My Free Quote';
  }
  function fail(reason) {
    setSending(false);
    status.className = 'status is-error';
    status.innerHTML = 'Sorry, your enquiry didn’t go through. Please try again, or email <a href="mailto:hello@therly.com.au">hello@therly.com.au</a> or call <a href="tel:+61449938730">0449 938 730</a>.';
    track('quote_submit_error', {reason, source});
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    status.textContent = ''; status.className = 'status';
    track('quote_submit_click', {source});

    const results = fields.map(validate);
    const servicesOk = validateServices();
    if (results.includes(false) || !servicesOk) {
      const firstBad = !results.every(Boolean) ? fields[results.indexOf(false)] : serviceGroup.querySelector('input');
      firstBad.focus({preventScroll: true});
      firstBad.closest('.f, .consent, [role=group]').scrollIntoView({behavior: 'smooth', block: 'center'});
      return;
    }
    // Spam guards: honeypot filled, or a form completed faster than a human can.
    if (form.elements._honey.value || Date.now() - openedAt < 2500) {
      card.classList.add('is-done');
      return;
    }

    const data = new FormData(form);
    const body = {};
    for (const [key, value] of data) {
      if (key === '_next') continue;
      body[key] = body[key] ? body[key] + ', ' + value : value;
    }
    body._replyto = body.email;

    setSending(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') return fail(json.message || 'http_' + res.status);
      card.classList.add('is-done');
      done.focus({preventScroll: true});
      card.scrollIntoView({behavior: 'smooth', block: 'start'});
      track('generate_lead', {source, service: body.Service || '', budget: body.Budget || ''});
    } catch (err) {
      fail(err.name === 'AbortError' ? 'timeout' : 'network');
    } finally {
      clearTimeout(timer);
    }
  });
})();

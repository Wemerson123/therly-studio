(() => {
  'use strict';
  // Configure only with this site's own verified GA4 web-stream ID.
  const measurementId = 'G-VES5ZD8LNC';
  // Meta Pixel (dataset 'wemerson 2021' in the Therly ad account). Loads only after consent, like GA4.
  const metaPixelId = '444403466650724';
  let metaLoaded = false;
  const key = 'therly-analytics-consent-v1';
  let choice = null, loaded = false;
  try { choice = localStorage.getItem(key); } catch (_) {}
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  window['ga-disable-' + measurementId] = choice !== 'accepted';
  const panel = document.createElement('section');
  panel.className = 'analytics-panel';
  panel.setAttribute('aria-label', 'Analytics preferences');
  panel.innerHTML = '<h2>Optional analytics</h2><p>May we use analytics (Google and Meta) to understand visits, contact-link clicks and how people find us from our ads? Your choice does not affect the website. <a href="/privacy/">Privacy policy</a></p><div class="analytics-actions"><button type="button" data-decline>Decline analytics</button><button type="button" data-accept>Accept analytics</button></div>';
  panel.hidden = !!choice;
  document.body.append(panel);
  function startMeta() {
    if (metaLoaded) { window.fbq('consent', 'grant'); return; }
    metaLoaded = true;
    const f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
    if (!window._fbq) window._fbq = f;
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    const s = document.createElement('script');
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.append(s);
    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }
  function start() {
    startMeta();
    window['ga-disable-' + measurementId] = false;
    if (loaded) {
      window.gtag('consent', 'update', {analytics_storage:'granted'});
      return;
    }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    window.gtag('event','page_view',{page_location:location.origin + location.pathname,page_title:document.title,page_referrer:document.referrer ? (() => { try { const u = new URL(document.referrer);return u.origin + u.pathname; } catch (_) { return ''; } })() : ''});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  }
  function clearCookies() {
    document.cookie.split(';').forEach(part => {
      const name = part.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_fbp$|_fbc$)/.test(name)) return;
      const domains = ['', location.hostname, '.' + location.hostname];
      domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }
  let opener = null;
  function setChoice(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    panel.hidden = true;
    if (value === 'accepted') start();
    else {
      window['ga-disable-' + measurementId] = true;
      if (loaded) window.gtag('consent','update',{analytics_storage:'denied'});
      if (metaLoaded) window.fbq('consent', 'revoke');
      clearCookies();
    }
    opener?.focus();
  }
  panel.querySelector('[data-accept]').addEventListener('click', () => setChoice('accepted'));
  panel.querySelector('[data-decline]').addEventListener('click', () => setChoice('declined'));
  document.querySelectorAll('[data-analytics-preferences]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => { opener = button;panel.hidden = false;panel.querySelector('[data-decline]').focus(); });
  });
  window.therlyTrackContact = method => {
    if (choice !== 'accepted' || !loaded) return;
    window.gtag('event','contact_intent',{contact_method:method,page_location:location.origin + location.pathname});
    if (metaLoaded) window.fbq('track', 'Contact', {method});
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.protocol === 'tel:') window.therlyTrackContact('phone');
    if (link.protocol === 'mailto:') window.therlyTrackContact('email');
  });
  if (choice === 'accepted') start();
})();

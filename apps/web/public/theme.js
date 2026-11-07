/* Blocking head script: set the theme before paint without inline JS or CSP exceptions. */
(() => {
  const key = 'velogroupsets-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark' ? value : null;
  let preference = null;
  try { preference = valid(window.localStorage.getItem(key)); } catch { /* Storage may be disabled. */ }

  function apply() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  apply();

  function setup() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.hidden = false;
    apply();
    toggle.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(key, preference); } catch { /* Keep the in-page choice. */ }
      apply();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();

  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });
})();

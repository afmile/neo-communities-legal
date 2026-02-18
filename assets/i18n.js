/**
 * Neo Communities Legal — i18n micro-library
 * Usage: add data-es="..." data-en="..." to any element.
 * Lang is persisted in localStorage.
 */
(function () {
  const KEY = 'nc_lang';
  let current = localStorage.getItem(KEY) || 'es';

  function applyLang(lang) {
    current = lang;
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang === 'es' ? 'es-419' : 'en';

    document.querySelectorAll('[data-es]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.innerHTML = val;
    });

    document.querySelectorAll('[data-es-placeholder]').forEach(el => {
      const key = lang === 'es' ? 'data-es-placeholder' : 'data-en-placeholder';
      const val = el.getAttribute(key);
      if (val !== null) el.placeholder = val;
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
    applyLang(current);

    // Active nav link
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path || (path.endsWith(href) && href !== '/')) {
        a.classList.add('active');
      }
    });
  });
})();

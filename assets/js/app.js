/* Lenny Kok · Admin-Bewerbung – Interaktionen
   Ohne JavaScript bleibt jede Seite vollständig lesbar. */
(() => {
  const root = document.documentElement;

  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* privater Modus */ } },
  };

  /* ---------- Hell / Dunkel ---------- */
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const isDark = () => root.dataset.theme === 'dark';
  const syncTheme = () => {
    themeButtons.forEach((b) => b.setAttribute('aria-label', isDark() ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'));
    themeColor?.setAttribute('content', isDark() ? '#0e1017' : '#11131b');
  };
  themeButtons.forEach((button) => button.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
    syncTheme();
  }));
  syncTheme();

  /* ---------- Mobiles Menü ---------- */
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  const setMenu = (open) => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    nav.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (nav?.classList.contains('is-open') && !e.target.closest('#site-nav, [data-menu-toggle]')) setMenu(false);
  });

  /* ---------- Toast ---------- */
  let toastEl;
  let toastTimer;
  const toast = (message) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.append(toastEl);
    }
    toastEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    toastEl.append(document.createTextNode(message));
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  /* ---------- Einzelwerte kopieren ---------- */
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await copy(button.dataset.copy);
        button.classList.add('is-copied');
        setTimeout(() => button.classList.remove('is-copied'), 1600);
        toast(`„${button.dataset.copy}“ kopiert`);
      } catch {
        toast('Kopieren nicht möglich');
      }
    });
  });

  /* ---------- Ganze Bewerbung als Text kopieren ---------- */
  const source = document.getElementById('bewerbung-text');
  document.querySelectorAll('[data-copy-all]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = (source?.content ?? source)?.textContent.trim() ?? '';
      try {
        await copy(text);
        toast('Bewerbung kopiert');
      } catch {
        const area = document.querySelector('.copy-text');
        if (area) {
          area.value = text;
          area.classList.add('is-shown');
          area.focus();
          area.select();
        }
      }
    });
  });

  /* ---------- Drucken ---------- */
  document.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  /* ---------- Inhaltsverzeichnis ---------- */
  const tocLinks = [...document.querySelectorAll('[data-toc] a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const targets = new Map();
    tocLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) targets.set(section, link);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((l) => l.removeAttribute('aria-current'));
        targets.get(entry.target)?.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach((_, section) => spy.observe(section));
  }
})();

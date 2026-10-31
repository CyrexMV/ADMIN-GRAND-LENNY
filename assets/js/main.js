/* GRAND RP · Admin-Bewerbung – Interaktionen
   Alles ist progressive enhancement: Ohne JavaScript bleibt jede Seite vollständig lesbar. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* privater Modus o. Ä. */ }
    },
  };

  /* ---------- Farbschema ---------- */
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const syncTheme = () => {
    const theme = currentTheme();
    themeButtons.forEach((button) => {
      button.setAttribute('aria-label', theme === 'light' ? 'Dunkles Design aktivieren' : 'Helles Design aktivieren');
    });
    themeColor?.setAttribute('content', theme === 'light' ? '#f6f3ec' : '#07070a');
  };

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = currentTheme() === 'light' ? 'dark' : 'light';
      const apply = () => {
        root.dataset.theme = next;
        store.set('theme', next);
        syncTheme();
      };
      if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(apply);
      else apply();
    });
  });
  syncTheme();

  /* ---------- Header beim Scrollen ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('is-open') && !event.target.closest('#site-nav, [data-menu-toggle]')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 881px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Zähler ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(target * (1 - (1 - progress) ** 4)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduceMotion.matches) counters.forEach((el) => { el.textContent = '0'; });

  /* ---------- Scroll-Reveal ---------- */
  const revealables = document.querySelectorAll('[data-reveal], [data-count]');
  const reveal = (el) => {
    el.classList.add('is-visible');
    if (el.dataset.count && !reduceMotion.matches) animateCount(el);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach(reveal);
  }

  window.addEventListener('beforeprint', () => revealables.forEach((el) => el.classList.add('is-visible')));

  /* ---------- Spotlight-Karten ---------- */
  if (finePointer.matches) {
    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest?.('.spotlight');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  /* ---------- 3D-Tilt (Medaillon) ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = 12;
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => {
        ['--rx', '--ry', '--gx', '--gy'].forEach((prop) => el.style.removeProperty(prop));
      });
    });
  }

  /* ---------- Toast ---------- */
  let toastEl;
  let toastTimer;
  const toast = (message) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.append(toastEl);
    }
    toastEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    toastEl.append(document.createTextNode(message));
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };

  /* ---------- Kopieren ---------- */
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        button.classList.add('is-copied');
        setTimeout(() => button.classList.remove('is-copied'), 1600);
        toast(`„${text}“ kopiert`);
      } catch {
        toast('Kopieren wird von diesem Browser nicht unterstützt');
      }
    });
  });

  /* ---------- Drucken / PDF ---------- */
  document.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  /* ---------- Inhaltsverzeichnis (Scrollspy) ---------- */
  const tocLinks = [...document.querySelectorAll('[data-toc] a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const targets = new Map();
    tocLinks.forEach((link) => {
      const section = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (section) targets.set(section, link);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => link.removeAttribute('aria-current'));
        targets.get(entry.target)?.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach((_, section) => spy.observe(section));
  }
})();

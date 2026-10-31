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
    themeColor?.setAttribute('content', isDark() ? '#060914' : '#070b1e');
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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll-Effekt: Karten erscheinen nacheinander ---------- */
  const revealables = [...document.querySelectorAll('[data-reveal]')];
  if (revealables.length && !reduceMotion) {
    root.classList.add('reveal-ready');
    let pending = revealables.slice();
    const show = (els) => {
      // Was gleichzeitig ins Bild kommt, erscheint in Leserichtung versetzt
      const pos = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top / 40), r.left]; };
      els.sort((a, b) => pos(a)[0] - pos(b)[0] || pos(a)[1] - pos(b)[1]);
      els.forEach((el, i) => {
        el.style.setProperty('--stagger', `${i * 130}ms`);
        el.classList.add('is-in');
        // Danach reagiert die Karte ohne Verzögerung auf Hover
        setTimeout(() => el.style.setProperty('--stagger', '0ms'), i * 130 + 1700);
      });
    };
    // Alles, was ins Bild gekommen ist (oder schon darüber liegt), wird angezeigt
    const scan = () => {
      const limit = window.innerHeight * 0.92;
      const due = pending.filter((el) => el.getBoundingClientRect().top < limit);
      if (!due.length) return;
      pending = pending.filter((el) => !due.includes(el));
      show(due);
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    let timer = 0;
    const onScroll = () => {
      if (!timer) timer = setTimeout(() => { timer = 0; scan(); }, 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    scan();
    window.addEventListener('beforeprint', () => revealables.forEach((el) => el.classList.add('is-in')));
  }

  /* ---------- Glasperlen: Tiefe beim Scrollen ---------- */
  const beads = document.querySelector('.beads');
  if (beads && !reduceMotion) {
    let ticking = false;
    const update = () => {
      beads.style.setProperty('--sy', String(Math.round(window.scrollY)));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

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

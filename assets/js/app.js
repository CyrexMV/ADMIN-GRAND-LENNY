/* Lenny Kok · Admin-Bewerbung – Interaktionen
   Alles ist progressive enhancement: Ohne JavaScript bleibt jede Seite vollständig lesbar. */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  window.__lk = true;

  /* ---------- Text zerlegen ---------- */
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c;
      el.append(s);
    });
  };
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  };
  if (!reduceMotion) {
    // Die Akzentzeile bleibt ganz, damit ihr Farbverlauf erhalten bleibt
    $$('.name-line:not(.name-line--accent)').forEach(splitChars);
    $$('.split').forEach(splitWords);
  }

  /* ---------- Skyline (Startseite) ---------- */
  const rng = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const buildSkyline = (svg, seed, minH, maxH, fill, lit) => {
    if (!svg) return;
    const r = rng(seed);
    const ns = 'http://www.w3.org/2000/svg';
    let x = 0;
    let markup = '';
    while (x < 1600) {
      const w = 28 + Math.round(r() * 70);
      const h = minH + Math.round(r() * (maxH - minH));
      markup += `<rect x="${x}" y="${320 - h}" width="${w}" height="${h}" fill="${fill}"/>`;
      if (r() > .65) markup += `<rect x="${x + w / 2 - 1}" y="${320 - h - 18}" width="2" height="18" fill="${fill}"/>`;
      if (lit) {
        for (let wy = 320 - h + 10; wy < 312; wy += 14) {
          for (let wx = x + 6; wx < x + w - 8; wx += 10) {
            if (r() > .9) {
              const c = r() > .35 ? '#ffb347' : '#e63946';
              markup += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="${c}" opacity="${(.35 + r() * .6).toFixed(2)}"/>`;
            }
          }
        }
      }
      x += w + Math.round(r() * 6);
    }
    svg.setAttribute('xmlns', ns);
    svg.innerHTML = markup;
  };
  buildSkyline($('.sky-far'), 7, 90, 220, '#140b10', false);
  buildSkyline($('.sky-near'), 23, 40, 150, '#09070b', true);

  /* ---------- Ladebildschirm & Intro ---------- */
  const startIntro = () => root.classList.add('intro');
  if (root.classList.contains('loading')) {
    const count = $('.preloader__count span');
    const bar = $('.preloader');
    let seen = false;
    try { seen = sessionStorage.getItem('lk-intro') === '1'; } catch { /* privat */ }
    const finish = () => {
      root.classList.remove('loading');
      root.classList.add('leaving');
      setTimeout(() => root.classList.remove('leaving'), 900);
      startIntro();
      try { sessionStorage.setItem('lk-intro', '1'); } catch { /* privat */ }
    };
    if (reduceMotion || seen) {
      finish();
    } else {
      const dur = 1300;
      const t0 = performance.now();
      const step = () => {
        const p = clamp((performance.now() - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        if (count) count.textContent = String(Math.round(e * 100)).padStart(3, '0');
        bar?.style.setProperty('--load', e.toFixed(3));
        if (p < 1) setTimeout(step, 16); else setTimeout(finish, 180);
      };
      step();
    }
  } else {
    startIntro();
  }

  /* ---------- Zahlen hochzählen ---------- */
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion || !Number.isFinite(target)) return;
    const t0 = performance.now();
    const step = () => {
      const p = clamp((performance.now() - t0) / 1400);
      el.textContent = String(Math.round(target * (1 - Math.pow(2, -10 * p))));
      if (p < 1) setTimeout(step, 16); else el.textContent = String(target);
    };
    el.textContent = '0';
    step();
  };

  /* ---------- Scroll-Erscheinen ---------- */
  const revealables = $$('.reveal, .split, [data-count], .sig, .ring');
  let pending = reduceMotion ? [] : revealables.slice();
  if (pending.length) root.classList.add('reveal-ready');
  const show = (els) => {
    const pos = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.top / 40), r.left]; };
    els.sort((a, b) => pos(a)[0] - pos(b)[0] || pos(a)[1] - pos(b)[1]);
    els.forEach((el, i) => {
      el.style.setProperty('--stagger', `${i * 90}ms`);
      el.classList.add('is-in');
      if (el.dataset.count) countUp(el);
    });
  };
  const scanReveal = () => {
    if (!pending.length) return;
    const limit = window.innerHeight * 0.9;
    const due = pending.filter((el) => el.getBoundingClientRect().top < limit);
    if (!due.length) return;
    pending = pending.filter((el) => !due.includes(el));
    show(due);
  };
  window.addEventListener('beforeprint', () => revealables.forEach((el) => el.classList.add('is-in')));

  /* ---------- Navigation ---------- */
  const nav = $('.nav');
  const progress = $('.progress');
  const navLinks = $$('.nav__links a[data-link]');
  const sections = navLinks.map((a) => document.getElementById(a.dataset.link)).filter(Boolean);
  let lastY = window.scrollY;
  const updateNav = () => {
    const y = window.scrollY;
    nav?.classList.toggle('is-scrolled', y > 20);
    if (!root.classList.contains('menu-open')) nav?.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
    if (sections.length) {
      let active = sections[0];
      sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) active = s; });
      navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.link === active.id));
    }
  };
  nav?.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  const menuButton = $('[data-menu-toggle]');
  const menu = $('#site-nav');
  const setMenu = (open) => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Parallaxe der Skyline ---------- */
  const skyFar = $('.sky-far');
  const skyNear = $('.sky-near');
  const updateSky = () => {
    if (reduceMotion || !skyFar) return;
    const y = Math.min(window.scrollY, window.innerHeight * 1.2);
    skyFar.style.setProperty('--py', `${(y * 0.12).toFixed(1)}px`);
    skyNear?.style.setProperty('--py', `${(y * 0.28).toFixed(1)}px`);
  };

  /* ---------- Zeitleiste ---------- */
  const timeline = $('.timeline');
  const fill = $('.timeline__fill');
  const stations = $$('.station');
  const updateTimeline = () => {
    if (!timeline) return;
    const mid = window.innerHeight * 0.6;
    const r = timeline.getBoundingClientRect();
    fill?.style.setProperty('--fill', clamp((mid - r.top) / r.height).toFixed(4));
    stations.forEach((s) => s.classList.toggle('is-lit', s.getBoundingClientRect().top + 30 < mid));
  };

  /* ---------- Gepinnter Abschnitt ---------- */
  const pin = $('.pin');
  const lines = pin ? $$('.ln', pin) : [];
  const updatePin = () => {
    if (!pin || reduceMotion) return;
    const r = pin.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / total);
    pin.style.setProperty('--pp', p.toFixed(3));
    pin.classList.toggle('is-active', r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5);
    const idx = Math.min(lines.length - 1, Math.floor(p * lines.length * 1.05));
    lines.forEach((l, i) => l.classList.toggle('is-on', i <= idx));
  };

  /* ---------- Scroll-Schleife ---------- */
  let scheduled = false;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      updateNav();
      updateSky();
      updateTimeline();
      updatePin();
      scanReveal();
    }, 16);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateNav(); updateSky(); updateTimeline(); updatePin(); scanReveal();
  // Nach dem Intro einmal neu prüfen, falls Schriften die Höhen verändert haben
  setTimeout(onScroll, 400);
  // Sicherung, falls ein Browser Scroll-Ereignisse verzögert meldet
  const safety = setInterval(() => {
    scanReveal();
    updateTimeline();
    if (!pending.length && !timeline) clearInterval(safety);
  }, 400);

  /* ---------- Wappen neigen ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach((el) => {
      const target = $('.medallion', el) || el;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        target.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`);
        target.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
        target.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
        target.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => ['--rx', '--ry', '--gx', '--gy'].forEach((p) => target.style.removeProperty(p)));
    });
  }

  /* ---------- Cursor ---------- */
  const cursor = $('.cursor');
  if (cursor && finePointer && !reduceMotion) {
    let tx = -100; let ty = -100; let gx = -100; let gy = -100;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.style.setProperty('--cx', `${tx}px`);
      cursor.style.setProperty('--cy', `${ty}px`);
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button'));
    }, { passive: true });
    const follow = () => {
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      cursor.style.setProperty('--gx', `${gx.toFixed(1)}px`);
      cursor.style.setProperty('--gy', `${gy.toFixed(1)}px`);
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  /* ---------- Kopieren ---------- */
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2000);
  };
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 1600);
        toast(`„${btn.dataset.copy}“ kopiert`);
      } catch {
        toast('Kopieren nicht möglich');
      }
    });
  });

  /* ---------- Inhaltsverzeichnis (Bewerbung) ---------- */
  const tocLinks = $$('[data-toc] a[href^="#"]');
  if (tocLinks.length) {
    const targets = tocLinks.map((a) => document.getElementById(a.hash.slice(1)));
    const spy = () => {
      let idx = 0;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i; });
      tocLinks.forEach((a, i) => a.classList.toggle('is-active', i === idx));
    };
    window.addEventListener('scroll', () => setTimeout(spy, 16), { passive: true });
    setInterval(spy, 500);
    spy();
  }
})();

// about.js — page-specific behavior for about.html (runs after script.js)
(() => {
  const body = document.body;
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ==========================================================
     CONFIG — certificate photos.
     The page looks for each file in these folders, in this order, and
     remembers the first one that works. Add your own folder if needed.
     A certificate without a photo yet uses TBA.png.
     ========================================================== */
  const BASES = ['images/certificates/', 'images/certifications/', 'images/leadership/', 'images/about/', 'images/awards/', 'images/'];
  const FALLBACK = 'TBA.png';

  const CERTS = {
    domini: { photo: 'domini-xode.PNG', title: 'SDCA - Domini Xode' },
    jpcs:   { photo: 'JPCS.jpg',        title: 'JPCS – SDCA Chapter' }
  };

  /* ---------- 1 · navbar button: hides on scroll down, returns on scroll up ---------- */
  let lastY = window.scrollY;
  const THRESHOLD = 6;                       // ignore tiny jitters

  const updateNav = () => {
    const y = Math.max(0, window.scrollY);
    if (y < 80 || body.classList.contains('menu-open')) {
      body.classList.remove('nav-hidden');
      lastY = y;
      return;
    }
    const dy = y - lastY;
    if (dy > THRESHOLD) { body.classList.add('nav-hidden'); lastY = y; }
    else if (dy < -THRESHOLD) { body.classList.remove('nav-hidden'); lastY = y; }
  };

  /* ---------- 2 · "Leadership Experiences" slides in from the right ---------- */
  const leadHead = document.getElementById('lead-head');
  const leadTitle = document.getElementById('lead-title');
  let target = 0, current = 0, raf = null;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const renderTitle = () => {
    if (!leadHead || !leadTitle) return;
    const max = Math.max(0, leadHead.clientWidth - leadTitle.offsetWidth);
    leadTitle.style.transform = `translate3d(${(1 - easeOut(current)) * max}px, 0, 0)`;
  };

  const tick = () => {
    current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.0005) current = target;
    renderTitle();
    raf = current !== target ? requestAnimationFrame(tick) : null;
  };

  const measureTitle = () => {
    if (!leadHead) return;
    const vh = window.innerHeight;
    const top = leadHead.getBoundingClientRect().top;
    // 0 while the heading is entering at the bottom of the screen,
    // 1 once it has travelled up near the top (and landed on the left)
    target = clamp((vh * 0.85 - top) / (vh * 0.85 - vh * 0.14), 0, 1);
    if (reduce) { current = target; renderTitle(); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  };

  /* ---------- 3 · butterfly: entrance + scroll-linked tilt ---------- */
  const section = document.getElementById('leadership');
  const bf = document.getElementById('lead-bf');

  const measureButterfly = () => {
    if (!section || !bf) return;
    const r = section.getBoundingClientRect();
    const range = Math.max(1, r.height - window.innerHeight);
    bf.style.setProperty('--bp', clamp(-r.top / range, 0, 1).toFixed(4));
  };

  if (section && bf) {
    new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) { bf.classList.add('in'); obs.disconnect(); }
    }, { threshold: 0.12 }).observe(section);
  }

  /* ---------- 4 · soft reveal for .rv elements ---------- */
  const rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(el => io.observe(el));
  } else {
    rv.forEach(el => el.classList.add('in'));
  }

  /* ---------- portrait blur: only at the very top ---------- */
  const updateBlur = () => body.classList.toggle('past-top', window.scrollY > 10);

  /* ---------- 5 · certificate window (same look as the awards page) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: just skip the cache */ } }
  };
  // the folder that worked last time is tried first, so a repeat visit doesn't search
  let knownBase = BASES.includes(store.get('about-cert-base')) ? store.get('about-cert-base') : null;
  const folders = () => (knownBase ? [knownBase, ...BASES.filter(b => b !== knownBase)] : BASES);
  const loadImg = (url) => new Promise(res => {
    const im = new Image();
    im.onload = () => res({ url, w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = () => res(null);
    im.src = url;
  });
  const findPhoto = async (file) => {
    for (const base of folders()) {
      const found = await loadImg(base + file);
      if (found) { knownBase = base; store.set('about-cert-base', base); return found; }
    }
    return null;
  };
  const photoCache = {};
  const getPhoto = (file) => {
    if (!photoCache[file]) {
      photoCache[file] = (async () => {
        const found = await findPhoto(file);
        if (found) return found;
        console.warn(`[about] couldn't find ${file} in: ${BASES.join('  ')}`);
        return file === FALLBACK ? null : findPhoto(FALLBACK);
      })();
    }
    return photoCache[file];
  };

  const modal = document.getElementById('aw-modal');
  const closeBtn = document.getElementById('aw-close');
  const scroller = document.getElementById('aw-scroll');
  const stage = document.getElementById('aw-stage');
  const imgEl = document.getElementById('aw-img');
  const nameEl = document.getElementById('aw-name');

  // computer: warm the cache so a click opens instantly; phone / data saver: only when a finger touches the name
  const phone = window.matchMedia('(max-width: 800px)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  if (!phone && !saveData) Object.values(CERTS).forEach(c => getPhoto(c.photo));
  document.querySelectorAll('.org-link[data-cert]').forEach(btn => {
    ['pointerdown', 'pointerenter', 'focus'].forEach(type => {
      btn.addEventListener(type, () => { const c = CERTS[btn.dataset.cert]; if (c) getPhoto(c.photo); }, { passive: true, once: true });
    });
  });

  let currentCert = null;
  let lastTrigger = null;
  let openToken = 0;
  let resetTimer = 0;

  // height of the title as it will look under the photo (a long title wraps to 2-3 lines)
  const measureName = () => {
    const c = nameEl.parentElement.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.style.cssText = 'visibility:hidden;pointer-events:none;';
    stage.appendChild(c);
    const h = c.offsetHeight;
    c.remove();
    return h;
  };

  // shrink the photo just enough that the title never runs into the bottom edge / close button (--k0 scales it)
  const layout = () => {
    if (!currentCert) return;
    const H = scroller.clientHeight;
    const W = scroller.clientWidth;
    stage.style.setProperty('--H', H + 'px');
    const mobile = window.matchMedia('(max-width: 800px)').matches;
    const ar = parseFloat(stage.style.getPropertyValue('--ar')) || 1.7778;
    const t0 = H * (mobile ? 0.387 : 0.21), gap = H * (mobile ? 0.04 : 0.034);
    const h0 = mobile ? Math.min(W * 0.80 / ar, H * 0.38) : Math.min(W * 0.53 / ar, H * 0.53);
    const limit = mobile ? closeBtn.offsetTop - 16 : H * 0.95;
    const k0 = clamp((limit - t0 - gap - measureName()) / h0, 0.5, 1);
    stage.style.setProperty('--k0', k0.toFixed(3));
  };
  window.addEventListener('resize', layout);
  // the title's height depends on the web font, so measure again once it has loaded
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  const setPhoto = (info) => {
    if (!info) { imgEl.removeAttribute('src'); return; }
    // wide range so a portrait or landscape certificate is never cropped
    stage.style.setProperty('--ar', clamp(info.w / info.h, 0.5, 2.4).toFixed(4));
    imgEl.src = info.url;
  };

  const openCert = async (id, trigger) => {
    const c = CERTS[id];
    if (!c) return;
    clearTimeout(resetTimer);
    currentCert = c;
    lastTrigger = trigger || null;
    const token = ++openToken;

    // get the photo first (usually already cached) so the layout is right when the window appears
    const info = await Promise.race([getPhoto(c.photo), new Promise(r => setTimeout(() => r(undefined), 900))]);
    if (token !== openToken) return;
    if (info !== undefined) setPhoto(info);
    else getPhoto(c.photo).then(i => { if (token === openToken) { setPhoto(i); layout(); } });

    nameEl.textContent = c.title;
    stage.dataset.len = c.title.length > 44 ? 'l' : c.title.length > 26 ? 'm' : 's';

    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', 'false');
    html.classList.add('modal-open');
    body.classList.add('modal-open');
    layout();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      modal.classList.add('open');
      layout();
      closeBtn.focus({ preventScroll: true });
    }));
  };

  const closeCert = () => {
    if (!modal.classList.contains('open')) return;
    openToken++;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    html.classList.remove('modal-open');
    body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    resetTimer = setTimeout(() => { currentCert = null; imgEl.removeAttribute('src'); }, 900);
  };

  document.querySelectorAll('.org-link[data-cert]').forEach(btn => {
    btn.addEventListener('click', () => openCert(btn.dataset.cert, btn));
  });
  closeBtn.addEventListener('click', closeCert);
  // clicking empty space closes the window (but not the photo or the name)
  scroller.addEventListener('click', (e) => {
    if (e.target.closest('.aw-photo, .aw-name')) return;
    closeCert();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCert(); return; }
    if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }   // the close button is the only control inside
  });

  /* ---------- wiring ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateNav();
      updateBlur();
      measureTitle();
      measureButterfly();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measureTitle(); measureButterfly(); });

  // fonts change the heading's width, so measure again once they're in
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureTitle(); measureButterfly(); });
  window.addEventListener('load', () => { measureTitle(); measureButterfly(); });

  measureTitle();
  measureButterfly();
  updateBlur();

  // footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
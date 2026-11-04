// awards.js — page-specific behavior for awards.html (runs after script.js)
(() => {
  const body = document.body;
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ==========================================================
     CONFIG — where the award photos live.
     The page looks for each file in these folders, in this order, and
     remembers the first one that works. Add your own folder if needed.
     Awards without a photo yet use TBA.png.
     ========================================================== */
  const BASES = ['images/awards/', 'images/Awards/', 'images/'];
  const FALLBACK = 'TBA.png';

  /* ---------- the awards ----------
     kind: 'detail'  → photo centered first; scrolling moves it to the top right and shows details
           'simple'  → photo centered, name below, nothing to scroll (certificates of participation) */
  const AWARDS = {
    dean: {
      kind: 'detail', photo: FALLBACK,
      title: 'Consistent Dean’s Lister',
      details: [
        { dl: [['Institution', 'St. Dominic College of Asia'], ['Program', 'Bachelor of Science in Information Technology']] },
        { sub: 'Semesters awarded', list: ['First Semester, A.Y. 2023-2024', 'Second Semester, A.Y. 2023-2024', 'Second Semester, A.Y. 2024-2025', 'First Semester, A.Y. 2025-2026'] }
      ]
    },
    stellar: {
      kind: 'detail', photo: FALLBACK,
      title: 'Stellar Dominican Champion Award',
      details: [
        { dl: [['Event name', 'Quills and Quantum: The SDCA Awards Convocation 2026'], ['Organizer', 'St. Dominic College of Asia'], ['Date', 'April 27, 2026'], ['Award / placement', 'Stellar Dominican Champion Award']] }
      ]
    },
    isite: {
      kind: 'detail', photo: 'iSITE.jpg',
      title: 'iSITE National IT Skills Competition 2025',
      details: [
        { dl: [['Organizer', 'Integrated Society of Information Technology Enthusiasts, Inc.'], ['Date', 'March 28, 2025'], ['Award / placement', 'Quiz Bee – 1st Runner-Up']] }
      ]
    },
    research: {
      kind: 'detail', photo: 'De-La-Salle.jpg',
      title: 'De La Salle University – Dasmariñas Senior High School 3rd Research Conference',
      details: [
        { dl: [['Organizer', 'De La Salle University – Dasmariñas Senior High School'], ['Date', 'May 19, 2023'], ['Award / placement', 'Participant']] }
      ]
    },
    dost: {
      kind: 'detail', photo: FALLBACK,
      title: '2023 DOST-SEI Undergraduate S&T Scholarship Program',
      details: [
        { p: 'One of my proudest achievements is being named one of the qualifiers for the 2023 DOST-SEI Undergraduate S&T Scholarship Program. Out of more than 70,000 aspiring scholars, I was fortunate to be among the 9,776 qualifiers in 2023. Being a DOST-SEI scholar has helped me pursue my college education and motivated me to strive for excellence in the field I have chosen.' },
        { p: 'Today, my goal is not only to excel in my future endeavors but also to give back to my country, which has helped me achieve my aspirations through this scholarship. I hope to use the knowledge, skills, and opportunities I gain throughout my academic journey to contribute to the growth of science and technology in the Philippines and, in my own way, make a meaningful difference in the lives of others. For me, being a scholar is more than a privilege; it is a responsibility to make the most of the opportunities I have been given and to use them to serve my fellow Filipinos.' }
      ]
    },
    ascend:    { kind: 'simple', photo: 'ASCEND.jpg',     title: 'ASCEND 2025: Empowering Leaders, Embracing Commitments, Raising the Future' },
    dsdap:     { kind: 'simple', photo: 'DSDAP.jpg',      title: 'Digital Startup Development and Acceleration Program (DSDAP)' },
    geek:      { kind: 'simple', photo: 'GeekSpeaks.jpg', title: 'JPCS National Geek Speaks 2026' },
    techtalks: { kind: 'simple', photo: 'TechTalks.jpg',  title: 'PCS MMM-TECHTALKS' }
  };

  /* ---------- 1 · navbar button: hides on scroll down, returns on scroll up ---------- */
  let lastY = window.scrollY;
  const THRESHOLD = 6;
  const updateNav = () => {
    const y = Math.max(0, window.scrollY);
    if (y < 80 || body.classList.contains('menu-open')) { body.classList.remove('nav-hidden'); lastY = y; return; }
    const dy = y - lastY;
    if (dy > THRESHOLD) { body.classList.add('nav-hidden'); lastY = y; }
    else if (dy < -THRESHOLD) { body.classList.remove('nav-hidden'); lastY = y; }
  };

  /* ---------- 2 · hero: the two lines drift apart, the butterfly floats away ---------- */
  const heroStage = document.getElementById('hero-stage');
  const updateHero = () => {
    if (!heroStage || reduce) return;
    const sp = clamp(window.scrollY / (window.innerHeight * 0.8), 0, 1);
    heroStage.style.setProperty('--sp', sp.toFixed(3));
  };

  /* ---------- 3 · soft reveal ---------- */
  const targets = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('in'));
  }

  /* ---------- 4 · photos (found in any of the folders, fallback TBA.png) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: just skip the cache */ } }
  };
  // the folder that worked last time is tried first, so a repeat visit doesn't search
  let knownBase = BASES.includes(store.get('awards-base')) ? store.get('awards-base') : null;
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
      if (found) { knownBase = base; store.set('awards-base', base); return found; }
    }
    return null;
  };
  const photoCache = {};
  const getPhoto = (file) => {
    if (!photoCache[file]) {
      photoCache[file] = (async () => {
        const found = await findPhoto(file);
        if (found) return found;
        console.warn(`[awards] couldn't find ${file} in: ${BASES.join('  ')}`);
        return file === FALLBACK ? null : findPhoto(FALLBACK);
      })();
    }
    return photoCache[file];
  };

  /* ---------- 5 · award window ---------- */
  const modal = document.getElementById('aw-modal');
  const closeBtn = document.getElementById('aw-close');
  const scroller = document.getElementById('aw-scroll');
  const stage = document.getElementById('aw-stage');
  const runway = document.getElementById('aw-runway');
  const imgEl = document.getElementById('aw-img');
  const nameEl = document.getElementById('aw-name');
  const detailsClip = document.getElementById('aw-details');
  const detailsIn = document.getElementById('aw-details-in');

  // photos: on a computer, warm the cache so a click opens instantly; on a phone (or with data saver on)
  // only fetch a photo when a finger / pointer touches its row, so the page doesn't download every photo up front
  const phone = window.matchMedia('(max-width: 800px)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  if (!phone && !saveData) Object.values(AWARDS).forEach(a => getPhoto(a.photo));
  document.querySelectorAll('.aw-item[data-award]').forEach(btn => {
    ['pointerdown', 'pointerenter', 'focus'].forEach(type => {
      btn.addEventListener(type, () => { const a = AWARDS[btn.dataset.award]; if (a) getPhoto(a.photo); }, { passive: true, once: true });
    });
  });

  let current = null;         // the open award
  let lastTrigger = null;
  let travel = 1;             // scroll distance for the photo to reach the top right
  let hold = 0;               // short pause once everything has settled, so the first lines can be read
  let openToken = 0;
  let resetTimer = 0;

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const renderDetails = (a) => {
    if (a.kind !== 'detail') { detailsIn.innerHTML = ''; return; }
    const out = [];
    a.details.forEach(b => {
      if (b.dl) out.push(`<dl class="aw-dl">${b.dl.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`);
      if (b.sub) out.push(`<h4 class="aw-d-sub">${esc(b.sub)}</h4>`);
      if (b.list) out.push(`<ul class="aw-d-list">${b.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`);
      if (b.p) out.push(`<p class="aw-d-p">${esc(b.p)}</p>`);
    });
    detailsIn.innerHTML = out.join('');
  };

  // height of the title as it will look once it has moved to the top-left,
  // so the details can start right below it (a long title wraps to 2-3 lines)
  const measureName = (p = 1) => {
    const c = nameEl.parentElement.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.style.cssText = `visibility:hidden;pointer-events:none;--p:${p};`;
    stage.appendChild(c);
    const h = c.offsetHeight;
    c.remove();
    return h;
  };

  // how far the window can scroll: the photo's move, plus the details if they are taller than the space
  const layout = () => {
    if (!current) return;
    const H = scroller.clientHeight;
    stage.style.setProperty('--H', H + 'px');
    const W = scroller.clientWidth;
    stage.style.setProperty('--nh', measureName(1) + 'px');

    // a long title (2-3 lines) under the centered photo must not reach the scroll hint / close button:
    // shrink the photo just enough to make room (--k0 scales its size)
    const mobile = window.matchMedia('(max-width: 800px)').matches;
    const ar = parseFloat(stage.style.getPropertyValue('--ar')) || 1.7778;
    const t0 = H * (mobile ? 0.387 : 0.21), gap = H * (mobile ? 0.04 : 0.034);
    const h0 = mobile ? Math.min(W * 0.80 / ar, H * 0.38) : Math.min(W * 0.53 / ar, H * 0.53);
    // phones: the close button is at the bottom center, and (for windows that scroll) the hint sits just above it
    const limit = mobile
      ? closeBtn.offsetTop - (current.kind === 'detail' ? 60 : 16)
      : (current.kind === 'detail' ? H - (H * 0.036 + 64) : H * 0.95);
    const k0 = clamp((limit - t0 - gap - measureName(0)) / h0, 0.5, 1);
    stage.style.setProperty('--k0', k0.toFixed(3));

    if (current.kind !== 'detail') { runway.style.height = '0px'; travel = 1; hold = 0; updateProgress(); return; }
    travel = Math.round(H * 0.55);
    hold = Math.round(H * 0.12);
    const extra = Math.max(0, detailsIn.scrollHeight - detailsClip.clientHeight + 24);
    runway.style.height = (travel + hold + extra) + 'px';
    updateProgress();
  };

  const updateProgress = () => {
    if (!current) return;
    const simple = current.kind !== 'detail';
    const st = simple ? 0 : scroller.scrollTop;
    const p = simple ? 0 : clamp(st / travel, 0, 1);
    const ds = simple ? 0 : Math.max(0, st - travel - hold);
    stage.style.setProperty('--p', p.toFixed(4));
    stage.style.setProperty('--ds', ds.toFixed(1));
    modal.classList.toggle('leftalign', p > 0.5);
  };
  scroller.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', layout);
  // the title's height depends on the web font, so measure again once it has loaded
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  const setPhoto = (info) => {
    if (!info) { imgEl.removeAttribute('src'); return; }
    const ar = clamp(info.w / info.h, 0.8, 2.2);
    stage.style.setProperty('--ar', ar.toFixed(4));
    imgEl.src = info.url;
  };

  const openAward = async (id, trigger) => {
    const a = AWARDS[id];
    if (!a) return;
    clearTimeout(resetTimer);
    current = a;
    lastTrigger = trigger || null;
    const token = ++openToken;

    // get the photo first (usually already cached) so the layout is right when the window appears
    const info = await Promise.race([getPhoto(a.photo), new Promise(r => setTimeout(() => r(undefined), 900))]);
    if (token !== openToken) return;
    if (info !== undefined) setPhoto(info);
    else getPhoto(a.photo).then(i => { if (token === openToken) { setPhoto(i); layout(); } });

    nameEl.textContent = a.title;
    stage.dataset.len = a.title.length > 44 ? 'l' : a.title.length > 26 ? 'm' : 's';
    modal.classList.toggle('simple', a.kind !== 'detail');
    modal.classList.remove('leftalign');
    renderDetails(a);
    scroller.scrollTop = 0;
    stage.style.setProperty('--p', '0');
    stage.style.setProperty('--ds', '0');

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

  const closeAward = () => {
    if (!modal.classList.contains('open')) return;
    openToken++;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    html.classList.remove('modal-open');
    body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    resetTimer = setTimeout(() => { current = null; imgEl.removeAttribute('src'); }, 900);
  };

  document.querySelectorAll('.aw-item[data-award]').forEach(btn => {
    btn.addEventListener('click', () => openAward(btn.dataset.award, btn));
  });
  closeBtn.addEventListener('click', closeAward);
  // clicking empty space closes the window (but not the photo, name or details)
  scroller.addEventListener('click', (e) => {
    if (e.target.closest('.aw-photo, .aw-name, .aw-details')) return;
    closeAward();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeAward(); return; }
    if (e.key === 'Tab') {                       // keep focus inside the window
      const f = current && current.kind === 'detail' ? [closeBtn, scroller] : [closeBtn];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* ---------- wiring ---------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateNav(); updateHero(); ticking = false; });
  }, { passive: true });
  updateHero();

  // footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
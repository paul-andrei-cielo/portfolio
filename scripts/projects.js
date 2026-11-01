// projects.js — page-specific behavior for projects.html (runs after script.js)
(() => {
  const body = document.body;
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ==========================================================
     CONFIG
     Covers (Capstone-Cover / IoT-Cover) are searched in BASES, extension detected.
     Gallery photos use the explicit lists in PROJECTS below, each path is tried
     with every prefix in GAL_BASES:  'images/' + 'projects/Capstone/6.png'  → then  'projects/Capstone/6.png'
     ========================================================== */
  const BASES = ['images/projects/', 'images/Projects/', 'images/project/', 'images/'];
  const GAL_BASES = ['images/', ''];
  const EXTS = ['png', 'jpg', 'jpeg', 'webp'];
  const ME = 'Paul Andrei Cielo';

  const ROLE = 'Responsible for designing and developing the user interface of the PadaLock web application. Created the overall layout, visual design, color scheme, navigation, and interactive elements to provide a user-friendly and responsive experience. Developed the frontend pages and features, including the dashboard, parcel activity logs, account management, notifications, and authentication pages. Ensured consistency in the design across different pages and screen sizes while integrating the interface with backend APIs to display system data and support user interactions.';
  const TECH = ['ESP32-CAM', 'Ultrasonic Sensor', 'Keypad and Solenoid Lock', 'Next.js', 'Node.js', 'MongoDB', 'Flutter', 'Cloudinary', 'PlatformIO and Arduino Framework'];

  const PROJECTS = {
    capstone: {
      folder: 'Capstone',
      photos: [6, 7, 8, 9, 10, 11, 12].map(n => `projects/Capstone/${n}.png`),
      kicker: 'Capstone Project',
      name: 'PadaLock',
      subtitle: 'An IoT-Based Intelligent Residential Delivery and Return Parcel Locker with Multi-Step Authentication and Surveillance',
      description: 'PadaLock is an IoT-based residential parcel locker designed to support unattended parcel delivery, retrieval, and return transactions in a single-household setting. It uses multi-step authentication, parcel presence detection, electronic locker access, transaction logging, and event-triggered surveillance to improve parcel security, traceability, and accountability. The system also provides web and mobile interfaces that allow residents to manage parcel information, monitor transaction history, receive notifications, and access recorded surveillance clips.',
      objectives: [
        'Develop an IoT-based parcel locker for parcel delivery, retrieval, and returns.',
        'Implement multi-step authentication using tracking numbers and resident PINs.',
        'Detect parcel presence using an ultrasonic sensor.',
        'Record parcel transactions, timestamps, and authentication status.',
        'Capture short surveillance clips during locker activities and link them to transaction logs.',
        'Improve parcel security, tracking, and accountability.',
        'Evaluate the system’s functionality, reliability, security, and usability.'
      ],
      team: ['Christine Joyce Belen', 'Paul Andrei Cielo', 'Jordan Chester Garcia', 'Jereeza Mae Mayuga'],
      techTitle: '',
      tech: TECH,
      role: 'Frontend Developer and UI/UX Designer',
      roleText: ROLE,
      status: 'The project has reached the functional prototype stage, with the core system and its main features already developed. It is currently undergoing final refinements, testing, and fine-tuning to improve its functionality, reliability, and overall user experience. The hardware remains in the prototype stage, with further adjustments being made to ensure that the hardware and software work properly together.'
    },
    iot: {
      folder: 'IoT',
      photos: [1, 2, 3, 4, 5].map(n => `projects/IoT/${n}.png`),
      kicker: 'IoT Project',
      name: '',
      subtitle: 'An IoT-Based Parcel Collection System for Secure Home Deliveries',
      description: 'An IoT-based parcel collection system designed to provide secure and convenient home deliveries, even when homeowners are unavailable. It uses an electronic locker, tracking number validation, parcel detection, and a web dashboard to manage parcel delivery, retrieval, and status monitoring.',
      objectives: [
        'Develop a physical parcel locker with an electronic lock and embedded controller.',
        'Create a web dashboard for registering tracking numbers and monitoring parcel status.',
        'Validate tracking numbers before allowing parcel deposits.',
        'Detect parcel presence using an ultrasonic sensor.',
        'Update parcel statuses to PENDING, DELIVERED, and RETRIEVED.',
        'Implement PIN authentication for secure parcel retrieval.'
      ],
      team: null,
      techTitle: '',
      tech: TECH,
      role: 'Frontend Developer and UI/UX Designer',
      roleText: ROLE,
      status: null
    }
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

  /* ---------- 2 · hero: "Projects" travels from the center to the top-left ---------- */
  const wrap = document.getElementById('hero-wrap');
  const stage = document.getElementById('hero-stage');
  const title = document.getElementById('hero-title');
  const hero = { cur: 0, target: 0, raf: 0, s0: null, s1: null, travel: 1 };

  const measureHero = () => {
    if (!wrap || !title) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const mobile = vw <= 700;
    const w = title.offsetWidth;
    const fs = parseFloat(getComputedStyle(title).fontSize);
    // phones: the title is much bigger, sits lower (matches the mockup) and shrinks to a small header
    const endS = mobile ? 0.38 : 0.57;
    // 0.12em ≈ the space between the top of the line box and the top of the capitals
    hero.s0 = { x: (vw - w) / 2, y: vh * (mobile ? 0.597 : 0.638) - 0.12 * fs, s: 1 };
    hero.s1 = { x: vw * (mobile ? 0.06 : 0.059), y: vh * (mobile ? 0.1 : 0.143) - 0.12 * fs * endS, s: endS };
    hero.travel = Math.max(1, wrap.offsetHeight - vh);
  };
  const readTarget = () => clamp(window.scrollY / hero.travel, 0, 1);

  const renderHero = () => {
    if (!hero.s0) return;
    const e = ease(hero.cur);
    title.style.setProperty('--tx', lerp(hero.s0.x, hero.s1.x, e).toFixed(1) + 'px');
    title.style.setProperty('--ty', lerp(hero.s0.y, hero.s1.y, e).toFixed(1) + 'px');
    title.style.setProperty('--ts', lerp(hero.s0.s, hero.s1.s, e).toFixed(4));
    stage.style.setProperty('--bp', e.toFixed(4));
  };
  const tickHero = () => {
    hero.cur += (hero.target - hero.cur) * (reduce ? 1 : 0.12);
    if (Math.abs(hero.target - hero.cur) < 0.0004) hero.cur = hero.target;
    renderHero();
    hero.raf = hero.cur !== hero.target ? requestAnimationFrame(tickHero) : 0;
  };
  const updateHero = () => {
    hero.target = readTarget();
    if (!hero.raf) hero.raf = requestAnimationFrame(tickHero);
  };
  const initHero = () => {
    measureHero();
    hero.target = hero.cur = readTarget();
    renderHero();
    if (title) title.classList.add('ready');
  };

  /* ---------- 3 · section headings drift in from the side ---------- */
  const drifters = [...document.querySelectorAll('[data-drift]')].map(el => ({
    el, span: el.querySelector('span'), dir: parseFloat(el.dataset.drift) || 1
  }));
  const updateDrift = () => {
    const vh = window.innerHeight;
    drifters.forEach(({ el, span, dir }) => {
      if (!span) return;
      const t = clamp((el.getBoundingClientRect().top / vh - 0.32) / 0.68, 0, 1);
      span.style.setProperty('--k', reduce ? '0' : (t * t * (3 - 2 * t)).toFixed(3));
      span.style.setProperty('--dir', dir);
    });
  };

  /* ---------- 4 · image helpers ---------- */
  const probe = (url) => new Promise(res => {
    const im = new Image();
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = url;
  });
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: just skip the cache */ } }
  };
  let knownBase = null;                       // first folder where a cover was found
  const folders = () => (knownBase ? [knownBase, ...BASES.filter(b => b !== knownBase)] : BASES);

  // find "<name>.<ext>" (any known extension) in any of the folders;
  // the extensions of one folder are checked at the same time, which is much faster on a phone connection
  const findWithExt = async (name, preferredExt) => {
    const exts = preferredExt ? [preferredExt, ...EXTS.filter(x => x !== preferredExt)] : EXTS;
    for (const base of folders()) {
      const results = await Promise.all(exts.map(ext => probe(`${base}${name}.${ext}`)));
      const i = results.indexOf(true);
      if (i !== -1) { knownBase = base; return { url: `${base}${name}.${exts[i]}`, ext: exts[i] }; }
    }
    return null;
  };
  // find an exact file name in any of the folders
  const findFile = async (file) => {
    for (const base of folders()) {
      const url = base + file;
      if (await probe(url)) { knownBase = base; return url; }
    }
    return null;
  };

  // featured covers: the address that worked is remembered, so the next visit skips the search entirely
  const probeCover = async (img, name, key) => {
    const found = await findWithExt(name);
    if (found) { img.src = found.url; store.set(key, found.url); }
    else console.warn(`[projects] couldn't find ${name}.(png|jpg|jpeg|webp) in: ${BASES.join('  ')}`);
  };
  document.querySelectorAll('img[data-cover]').forEach((img) => {
    const name = img.dataset.cover;
    const key = 'projects-cover:' + name;
    const cached = store.get(key);
    if (cached) {
      img.addEventListener('error', () => { store.set(key, ''); probeCover(img, name, key); }, { once: true });
      img.src = cached;
    } else {
      probeCover(img, name, key);
    }
  });
  // other projects' covers (exact file names)
  document.querySelectorAll('img[data-file]').forEach(async (img) => {
    const url = await findFile(img.dataset.file);
    if (url) img.src = url;
    else console.warn(`[projects] couldn't find ${img.dataset.file} in: ${BASES.join('  ')}`);
  });

  // gallery photos: explicit lists (order is kept), each tried with every GAL_BASES prefix
  const galleryCache = {};
  const getGallery = (key) => {
    if (galleryCache[key]) return galleryCache[key];
    galleryCache[key] = (async () => {
      const hits = await Promise.all(PROJECTS[key].photos.map(async (f) => {
        for (const b of GAL_BASES) { if (await probe(b + f)) return b + f; }
        console.warn(`[projects] missing photo: ${f} (tried prefixes: ${GAL_BASES.map(b => `"${b}"`).join(', ')})`);
        return null;
      }));
      return hits.filter(Boolean);
    })();
    return galleryCache[key];
  };

  /* ---------- 5 · project window ---------- */
  const modal = document.getElementById('modal');
  const panel = modal.querySelector('.modal-panel');
  const closeBtn = document.getElementById('modal-close');
  const textEl = document.getElementById('m-text');
  const galEl = modal.querySelector('.gal');
  const track = document.getElementById('gal-track');
  let lastTrigger = null;
  let openToken = 0;
  let closeTimer = 0;

  /* --- tile → window morph (clip-path) --- */
  const EASE = 'cubic-bezier(.22, 1, .36, 1)';
  let panelAnim = null;
  let srcTimer = 0;

  // clip-path that matches the tile's box exactly (relative to the panel's final box)
  const clipFromTile = (tile) => {
    const t = tile.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const r = parseFloat(getComputedStyle(tile).borderTopLeftRadius) || 0;
    return `inset(${t.top - p.top}px ${p.right - t.right}px ${p.bottom - t.bottom}px ${t.left - p.left}px round ${r}px)`;
  };
  const clipFull = () =>
    `inset(0px 0px 0px 0px round ${parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0}px)`;

  const renderText = (p) => {
    const parts = [];
    parts.push(
      `<header class="m-head"><h2 class="m-kicker" id="m-title">${p.kicker}</h2>` +
      (p.name ? `<p class="m-name">${p.name}</p>` : '') +
      `<p class="m-sub">${p.subtitle}</p></header>`
    );
    parts.push(`<p class="m-p">${p.description}</p>`);
    parts.push(`<section class="m-sec"><h3 class="m-h">Objectives</h3><ul class="m-list">${p.objectives.map(o => `<li>${o}</li>`).join('')}</ul></section>`);
    if (p.team) {
      parts.push(`<section class="m-sec"><h3 class="m-h">Team Members</h3><div class="m-team">${p.team.map(n => n === ME ? `<div class="me">${n}</div>` : `<div>${n}</div>`).join('')}</div></section>`);
    }
    parts.push(`<section class="m-sec"><h3 class="m-h">My Role</h3><p class="m-role">${p.role}</p><p class="m-p">${p.roleText}</p></section>`);
    if (p.status) {
      parts.push(`<section class="m-sec"><h3 class="m-h">Current Status</h3><p class="m-p">${p.status}</p></section>`);
    }
    parts.push(`<section class="m-sec"><h3 class="m-h">${p.techTitle}</h3><ul class="m-chips">${p.tech.map(t => `<li>${t}</li>`).join('')}</ul></section>`);
    textEl.innerHTML = parts.join('');
    [...textEl.children].forEach((el, i) => el.style.setProperty('--n', i));
    textEl.scrollTop = 0;
  };

  const resetTrack = () => {
    track.classList.remove('run');
    track.style.animation = 'none';
    track.innerHTML = '';
    void track.offsetWidth;
    track.style.animation = '';
    track.style.removeProperty('--dur');
  };

  const card = (src) => {
    const c = document.createElement('div');
    c.className = 'gal-card';
    const im = new Image();
    im.src = src; im.alt = ''; im.decoding = 'async'; im.draggable = false;
    c.appendChild(im);
    return c;
  };

  const buildGallery = async (key, token) => {
    // placeholders while the photos are found
    resetTrack();
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('div');
      s.className = 'gal-card skeleton';
      track.appendChild(s);
    }
    const urls = await getGallery(key);
    if (token !== openToken) return;

    resetTrack();
    if (!urls.length) { modal.classList.add('no-gal'); return; }
    urls.forEach(u => track.appendChild(card(u)));
    if (reduce) return;

    // repeat the set until it fills the window, then duplicate it once for a seamless loop
    const horiz = window.matchMedia('(max-width: 800px)').matches;
    const cs = getComputedStyle(track);
    const gap = parseFloat(horiz ? cs.columnGap : cs.rowGap) || 0;
    const setLen = horiz ? track.offsetWidth : track.offsetHeight;
    const viewLen = horiz ? galEl.clientWidth : galEl.clientHeight;
    const unit = setLen + gap;
    const reps = clamp(Math.ceil((viewLen * 1.1) / unit), 1, 8);

    resetTrack();
    const list = Array.from({ length: reps }, () => urls).flat();
    [...list, ...list].forEach(u => track.appendChild(card(u)));
    // slower on phones (the photos are read there), normal speed on the vertical desktop band
    const speed = horiz ? 24 : 36;   // px per second
    track.style.setProperty('--dur', Math.max(16, (unit * reps) / speed).toFixed(1) + 's');
    requestAnimationFrame(() => track.classList.add('run'));
  };

  const openProject = (key, trigger) => {
    const p = PROJECTS[key];
    if (!p) return;
    clearTimeout(closeTimer);
    clearTimeout(srcTimer);
    lastTrigger = trigger || null;
    const token = ++openToken;

    modal.classList.remove('no-gal');
    renderText(p);
    buildGallery(key, token);

    modal.removeAttribute('inert');
    modal.setAttribute('aria-hidden', 'false');
    html.classList.add('modal-open');
    body.classList.add('modal-open');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== openToken) return;
      if (panelAnim) panelAnim.cancel();
      const morph = !reduce && lastTrigger && panel.animate;
      const from = morph ? clipFromTile(lastTrigger) : null;
      const to = morph ? clipFull() : null;

      modal.classList.add('open');
      if (lastTrigger) lastTrigger.classList.add('is-source');
      closeBtn.focus({ preventScroll: true });

      if (morph) {
        panelAnim = panel.animate(
          [{ clipPath: from }, { clipPath: to }],
          { duration: 950, easing: EASE, fill: 'backwards' }
        );
      }
    }));
  };

  const closeProject = () => {
    if (!modal.classList.contains('open')) return;
    openToken++;

    const src = lastTrigger;
    if (!reduce && src && panel.animate) {
      if (panelAnim) panelAnim.cancel();
      panelAnim = panel.animate(
        [{ clipPath: clipFull() }, { clipPath: clipFromTile(src) }],
        { duration: 750, easing: EASE, fill: 'forwards' }
      );
      // the real tile fades back in underneath as the window lands on it
      srcTimer = setTimeout(() => src.classList.remove('is-source'), 450);
    } else if (src) {
      src.classList.remove('is-source');
    }

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    html.classList.remove('modal-open');
    body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    closeTimer = setTimeout(resetTrack, 900);
  };

  document.querySelectorAll('.tile[data-project]').forEach(btn => {
    btn.addEventListener('click', () => openProject(btn.dataset.project, btn));
    // start finding the photos as soon as a finger / pointer touches the tile, so the window opens with them ready
    ['pointerdown', 'pointerenter', 'focus'].forEach(type => {
      btn.addEventListener(type, () => getGallery(btn.dataset.project), { passive: true, once: true });
    });
  });
  closeBtn.addEventListener('click', closeProject);
  modal.addEventListener('click', (e) => {
    if (e.target.closest('.modal-panel') || e.target.closest('.modal-close')) return;
    closeProject();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeProject(); return; }
    if (e.key === 'Tab') {                       // keep focus inside the window
      const f = [closeBtn, textEl];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* ---------- 6 · other projects: expand in place ---------- */
  document.querySelectorAll('.o-head').forEach(head => {
    head.addEventListener('click', () => {
      const tile = head.closest('.o-tile');
      const open = !tile.classList.contains('open');
      tile.classList.toggle('open', open);
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 7 · soft reveal for tiles and footer ---------- */
  const targets = document.querySelectorAll('.rv, .rv-soft');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('in'));
  }

  /* ---------- wiring ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateNav(); updateHero(); updateDrift(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measureHero(); renderHero(); updateHero(); updateDrift(); });

  // the title's width depends on the web font, so measure once it has loaded
  let started = false;
  const start = () => { if (started) return; started = true; initHero(); updateDrift(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', () => { measureHero(); renderHero(); });
  // re-measure if a font finishes loading after the first measurement
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => { measureHero(); renderHero(); });

  updateDrift();

  // footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
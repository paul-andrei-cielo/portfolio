// about.js — page-specific behavior for about.html (runs after script.js)
(() => {
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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
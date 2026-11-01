// tech-stack.js — page-specific behavior for tech-stack.html (runs after script.js)
(() => {
    const body = document.body;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  
    /* ---------- 1 · navbar button: hides on scroll down, returns on scroll up ---------- */
    let lastY = window.scrollY;
    const THRESHOLD = 6;
  
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
  
    /* ---------- 2 · hero: "My" and "stack" drift apart, butterfly tilts away ---------- */
    const hero = document.getElementById('hero-title');
    const updateHero = () => {
      if (!hero || reduce) return;
      const sp = clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1);
      hero.style.setProperty('--sp', sp.toFixed(3));
    };
  
    /* ---------- 3 · measure each chip's name so it can expand to exactly fit ---------- */
    const chips = document.querySelectorAll('.chip');
    const measureChips = () => {
      chips.forEach(chip => {
        const label = chip.querySelector('.chip-name > span');
        if (label) chip.style.setProperty('--nw', label.offsetWidth + 'px');
      });
    };
  
    /* ---------- 4 · pointer-following light inside each chip ---------- */
    chips.forEach(chip => {
      chip.addEventListener('pointermove', (e) => {
        const r = chip.getBoundingClientRect();
        chip.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      });
    });
  
    /* ---------- 5 · touch: tap a chip to open it (one open at a time) ---------- */
    if (!canHover) {
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const wasOpen = chip.classList.contains('open');
          chips.forEach(c => c.classList.remove('open'));
          if (!wasOpen) chip.classList.add('open');
        });
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.chip')) chips.forEach(c => c.classList.remove('open'));
      });
    }
  
    /* ---------- 6 · reveal groups and footer as they scroll into view ---------- */
    const reveal = (selector, options) => {
      const els = document.querySelectorAll(selector);
      if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, options);
      els.forEach(el => io.observe(el));
    };
    reveal('.group', { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    reveal('.rv', { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
  
    /* ---------- wiring ---------- */
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateNav(); updateHero(); ticking = false; });
    }, { passive: true });
  
    window.addEventListener('resize', measureChips);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChips);
    window.addEventListener('load', measureChips);
  
    measureChips();
    updateHero();
  
    // footer year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  })();
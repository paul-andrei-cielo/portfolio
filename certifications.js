// certifications.js — page-specific behavior for certifications.html (runs after script.js)
(() => {
    const body = document.body;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  
    /* ---------- 2 · hero: title lifts and softens, butterfly sinks as you scroll ---------- */
    const stage = document.getElementById('hero-stage');
    const updateHero = () => {
      if (!stage || reduce) return;
      const sp = clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1);
      stage.style.setProperty('--sp', sp.toFixed(3));
    };
  
    /* ---------- 3 · soft reveal: panel, headings, every row, footer ---------- */
    const targets = document.querySelectorAll('.rv, .rv-soft');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      targets.forEach(el => io.observe(el));
    } else {
      targets.forEach(el => el.classList.add('in'));
    }
  
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
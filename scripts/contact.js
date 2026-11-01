// contact.js — page-specific behavior for contact.html (runs after script.js)
(() => {
    const body = document.body;
  
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
  
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateNav(); ticking = false; });
    }, { passive: true });
  
    /* ---------- 2 · soft reveal for .rv elements ---------- */
    const rv = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
      rv.forEach(el => io.observe(el));
    } else {
      rv.forEach(el => el.classList.add('in'));
    }
  
    /* ---------- 3 · form: send to Formspree without leaving the page ---------- */
    const form = document.getElementById('contact-form');
    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('form-status');
  
    if (form && btn && status) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
  
        btn.disabled = true;
        btn.textContent = 'sending…';
        status.textContent = '';
  
        try {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          status.textContent = 'Thank you! Your message has been sent.';
        } catch (err) {
          status.textContent = 'Something went wrong. Please try again in a moment.';
        } finally {
          btn.disabled = false;
          btn.textContent = 'submit';
        }
      });
    }
  
    /* ---------- 4 · footer year ---------- */
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  })();
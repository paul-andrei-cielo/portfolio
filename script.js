// Legacy mobile menu (kept for any pages that still use the old hamburger)
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  if (!menu) return;
  const isActive = menu.classList.contains("active");

  if (!isActive) {
    menu.classList.add("active");
    menu.style.opacity = 0;
    menu.style.transform = "translate(-50%, -20px)";

    anime({
      targets: menu,
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 400,
      easing: 'easeOutExpo'
    });
  } else {
    anime({
      targets: menu,
      opacity: [1, 0],
      translateY: [0, -20],
      duration: 300,
      easing: 'easeInExpo',
      complete: () => {
        menu.classList.remove("active");
        menu.style.opacity = "";
        menu.style.transform = "";
      }
    });
  }
}

// Main DOM logic
window.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade-in flag (used by other pages' CSS)
  body.classList.add('fade-in');

  /* ---------- Navbar, intro, butterfly, scroll reveal ---------- */
  const intro = document.getElementById('intro');
  const introLogo = document.getElementById('intro-logo');
  const toggle = document.getElementById('logo-toggle');
  const closeBtn = document.getElementById('nav-close');
  const homeBtn = document.getElementById('nav-home');
  const menu = document.getElementById('site-menu');
  const hero = document.getElementById('hero');
  const profile = document.getElementById('profile');
  const scrollBtn = document.getElementById('scroll-btn');
  const butterfly = document.getElementById('butterfly');
  const smooth = reduceMotion ? 'auto' : 'smooth';

    // dim the background once the page leaves the top
  // (desktop scrolls the window; on phones the <main> element scrolls sideways)
  const mainEl = document.querySelector('main');
  const onScroll = () => body.classList.toggle(
    'scrolled',
    Math.max(window.scrollY, mainEl ? mainEl.scrollLeft : 0) > 40
  );
  window.addEventListener('scroll', onScroll, { passive: true });
  if (mainEl) mainEl.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // split "Andrei" into letters for the staggered reveal
  const nameEl = document.querySelector('.name');
  if (nameEl) {
    const text = nameEl.textContent;
    nameEl.setAttribute('aria-label', text);
    nameEl.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'letter';
      s.textContent = ch;
      s.style.setProperty('--n', i);
      s.setAttribute('aria-hidden', 'true');
      nameEl.appendChild(s);
    });
  }

  // reveal the photo + name when the second screen scrolls into view
  if (profile) {
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    const label = (on) => scrollBtn && scrollBtn.setAttribute('aria-label', on ? 'Back to start' : (isMobile ? 'Next screen' : 'Scroll down'));
    new IntersectionObserver(([entry]) => {
      body.classList.toggle('on-profile', entry.isIntersecting);
      label(entry.isIntersecting);
      profile.classList.toggle('in', entry.isIntersecting);
      if (entry.isIntersecting) profile.classList.add('revealed');
    }, { threshold: 0.55 }).observe(profile);

    if (scrollBtn) scrollBtn.addEventListener('click', () => {
      (body.classList.contains('on-profile') ? hero : profile)
        .scrollIntoView({ behavior: smooth, block: 'start', inline: 'start' });
    });
  }

  if (toggle && menu) {
    const headerLogo = toggle.querySelector('img');

    const setMenu = (open) => {
      body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Paul Andrei Cielo, close menu' : 'Paul Andrei Cielo, open menu');
      [homeBtn, closeBtn].forEach(el => el && (el.tabIndex = open ? 0 : -1));
      menu.querySelectorAll('a').forEach(a => a.tabIndex = open ? 0 : -1);
    };
    setMenu(false);

    toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    if (closeBtn) closeBtn.addEventListener('click', () => { setMenu(false); toggle.focus(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (body.classList.contains('menu-open') && !e.target.closest('.topbar')) setMenu(false);
    });

    if (intro && introLogo) {
      const flyToHeader = () => {
        const from = introLogo.getBoundingClientRect();
        const to = toggle.getBoundingClientRect();   // the whole pill, not just the image inside it
        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
        const s = to.width / from.width;

        toggle.style.visibility = 'hidden';          // real button stays hidden until the logo lands
        if (butterfly && !reduceMotion) {
          butterfly.style.opacity = '0';
          butterfly.style.filter = 'blur(20px)';
        }
        intro.classList.add('reveal');               // backdrop dissolves while the logo travels

        // one continuous glide from the center to the button (Web Animations API)
        const startFrom = getComputedStyle(introLogo).transform;
        const flight = introLogo.animate([
          { transform: startFrom === 'none' ? 'translate(0px, 0px) scale(1)' : startFrom },
          { transform: `translate(${dx}px, ${dy}px) scale(${s})` }
        ], { duration: 1600, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });

        const land = () => {                         // same size + position, so the swap is invisible
          toggle.style.visibility = 'visible';
          intro.remove();
          if (!butterfly) body.classList.remove('is-loading');
        };
        flight.onfinish = land;

        if (butterfly) {
          setTimeout(() => {
            anime({
              targets: butterfly,
              opacity: [0, 1],
              scale: [0.85, 1],
              filter: ['blur(20px)', 'blur(0px)'],
              duration: 2200,
              easing: 'easeOutQuart',
              begin: () => body.classList.remove('is-loading'),
              complete: () => butterfly.removeAttribute('style')
            });
          }, 1100);
        }
      };

      const runIntro = async () => {
        try { await Promise.all([introLogo.decode(), headerLogo.decode()]); } catch (e) {}
        if (reduceMotion) { intro.remove(); body.classList.remove('is-loading'); return; }
        anime({
          targets: introLogo,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 1100,
          easing: 'easeOutQuart',
          complete: () => setTimeout(flyToHeader, 600)
        });
      };
      runIntro();
    }
  }

  /* ---------- Hover scale for old-style nav links ---------- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      anime({ targets: link, scale: 1.1, duration: 300, easing: 'easeOutExpo' });
    });
    link.addEventListener('mouseleave', () => {
      anime({ targets: link, scale: 1.0, duration: 300, easing: 'easeOutExpo' });
    });
  });

  /* ---------- Fade-out transition for internal links ---------- */
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const target = this.getAttribute('target');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript') ||
        target === '_blank'
      ) {
        return;
      }

      e.preventDefault();
      body.classList.remove('fade-in');
      body.classList.add('is-leaving');
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });

  // Coming back with the browser's back button
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      body.classList.remove('is-leaving');
      body.classList.add('fade-in');
    }
  });

  /* ---------- Card slideshow (each .container is independent) ---------- */
  document.querySelectorAll(".container").forEach((container) => {
    const cards = Array.from(container.querySelectorAll(".card"));
    let current = 0;

    function showCard(index) {
      cards.forEach((card, i) => {
        card.classList.remove("active", "out");
        if (i === index) {
          card.classList.add("active");
        }
      });
    }

    if (cards.length > 0) {
      showCard(current);

      container.addEventListener("click", () => {
        const prev = current;
        current = (current + 1) % cards.length;

        cards[prev].classList.remove("active");
        cards[prev].classList.add("out");

        showCard(current);
      });
    }
  });

  /* ---------- Granim background (only where a gradient canvas exists) ---------- */
  if (document.getElementById('gradient-canvas')) {
    const granimScript = document.createElement('script');
    granimScript.src = 'https://cdn.jsdelivr.net/npm/granim@2.0.0/dist/granim.min.js';
    granimScript.onload = () => {
      new Granim({
        element: '#gradient-canvas',
        direction: 'diagonal',
        isPausedWhenNotInView: true,
        states: {
          "default-state": {
            gradients: [
              ['#e6bbbb', '#fdecef'],
              ['#fffdfc', '#fdedf0'],
            ],
            transitionSpeed: 3000
          }
        }
      });
    };
    body.appendChild(granimScript);
  }
});
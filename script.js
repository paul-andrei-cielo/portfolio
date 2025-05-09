// Mobile menu
function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  const isActive = menu.classList.contains("active");

  if (!isActive) {
    // Show menu before animating
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
  // Fade-in animation
  document.body.classList.add('fade-in');

  // Profile + text reveal with Anime.js
  const profileImage = document.querySelector('.profile-image');
  const textBlock = document.querySelector('.intro-text');

  const animateIn = (element, properties) => {
    anime({
      targets: element,
      ...properties,
      duration: 1000,
      easing: 'easeOutExpo'
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        if (target.classList.contains('profile-image')) {
          animateIn(target, { opacity: [0, 1], translateY: [-40, 0] });
        } else if (target.classList.contains('intro-text')) {
          animateIn(target, { opacity: [0, 1], translateX: [-40, 0] });
        }
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  if (profileImage) observer.observe(profileImage);
  if (textBlock) observer.observe(textBlock);

  // Subtle bounce on hover
  const profileImg = document.querySelector('.profile-image img');

  if (profileImg) {
    profileImg.addEventListener('mouseenter', () => {
      anime({
        targets: profileImg,
        scale: [1, 1.05],
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    });

    profileImg.addEventListener('mouseleave', () => {
      anime({
        targets: profileImg,
        scale: 1,
        duration: 300,
        easing: 'easeOutExpo'
      });
    });
  }

  // Animate nav links on hover
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      anime({
        targets: link,
        scale: 1.1,
        duration: 300,
        easing: 'easeOutExpo'
      });
    });

    link.addEventListener('mouseleave', () => {
      anime({
        targets: link,
        scale: 1.0,
        duration: 300,
        easing: 'easeOutExpo'
      });
    });
  });

  // Fade-out transition
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
        e.preventDefault();
        document.body.classList.remove('fade-in');
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });

  // Card slideshow
  const cards = Array.from(document.querySelectorAll(".card"));
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
    const container = document.querySelector(".container");
    if (container) {
      container.addEventListener("click", () => {
        const prev = current;
        current = (current + 1) % cards.length;

        cards[prev].classList.remove("active");
        cards[prev].classList.add("out");

        showCard(current);
      });
    }
  }
});

// Granim background
document.addEventListener('DOMContentLoaded', () => {
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
  document.body.appendChild(granimScript);
});

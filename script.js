// Mobile menu
function toggleMenu() {
    document.getElementById("mobile-menu").classList.toggle("active");
  }
  
  // Main DOM logic
  window.addEventListener('DOMContentLoaded', () => {
    // Fade-in animation
    document.body.classList.add('fade-in');
  
    // Profile + text reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.5 });
  
    const profileImage = document.querySelector('.profile-image');
    const textBlock = document.querySelector('.intro-text');
  
    if (profileImage) observer.observe(profileImage);
    if (textBlock) observer.observe(textBlock);
  
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
  
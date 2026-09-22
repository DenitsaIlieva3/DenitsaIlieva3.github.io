(function () {
  'use strict';

  // Mobile navigation
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');

  function setActiveNavLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link && scrollY >= top && scrollY < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveNavLink, { passive: true });

  // Counter animation for hero stats
  function animateCounters() {
    document.querySelectorAll('.stat__value[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }

  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(heroStats);
  }

  // Scroll fade-in animations
  const fadeElements = document.querySelectorAll(
    '.card, .section__header, .project-slide, .hero__content, .hero__visual'
  );

  fadeElements.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // Projects carousels (supports multiple independent carousels)
  function initProjectsCarousel(root) {
    const track = root.querySelector('.projects__track');
    const carousel = root.querySelector('.projects__carousel');
    const prevBtn = root.querySelector('.projects__btn--prev');
    const nextBtn = root.querySelector('.projects__btn--next');
    const dotsContainer = root.querySelector('.projects__dots');

    if (!track || !carousel || !prevBtn || !nextBtn || !dotsContainer) return;

    const slides = track.querySelectorAll('.project-slide');
    if (!slides.length) return;

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let autoInterval = null;

    dotsContainer.innerHTML = '';

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'projects__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.projects__dot');

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function startAutoplay() {
      stopAutoplay();
      autoInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
    }

    function stopAutoplay() {
      if (autoInterval) clearInterval(autoInterval);
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }
    }, { passive: true });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    startAutoplay();
  }

  document.querySelectorAll('.projects').forEach(initProjectsCarousel);

  // Image lightbox for projects & certificates
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const expandableImages = document.querySelectorAll(
    '.project-slide__image img, .certificate-card__image img'
  );

  if (lightbox && lightboxImage && expandableImages.length) {
    let lastFocusedElement = null;

    function openLightbox(img) {
      lastFocusedElement = document.activeElement;
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt;

      if (img.alt) {
        lightboxCaption.textContent = img.alt;
        lightboxCaption.hidden = false;
      } else {
        lightboxCaption.textContent = '';
        lightboxCaption.hidden = true;
      }

      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxImage.src = '';

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    expandableImages.forEach(img => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View full image: ${img.alt || 'Project image'}`);

      img.addEventListener('click', e => {
        e.stopPropagation();
        openLightbox(img);
      });

      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          openLightbox(img);
        }
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', e => {
      if (!lightbox.hidden && e.key === 'Escape') {
        closeLightbox();
      }
    });
  }
})();

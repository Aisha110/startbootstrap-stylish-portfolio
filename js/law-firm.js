(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Sticky nav: solidify on scroll                                     */
  /* ------------------------------------------------------------------ */
  var nav = document.getElementById('lf-nav');
  var lastScrollState = false;

  function updateNav() {
    var scrolled = window.scrollY > 40;
    if (scrolled !== lastScrollState) {
      nav.classList.toggle('is-scrolled', scrolled);
      lastScrollState = scrolled;
    }
  }
  if (nav) {
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                   */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById('lf-nav-toggle');
  var navLinks = document.getElementById('lf-nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal (IntersectionObserver, respects reduced motion)       */
  /* ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll('.lf-reveal, .lf-reveal-group');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Animated stat counters                                              */
  /* ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('.lf-stat-num[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ------------------------------------------------------------------ */
  /* Testimonial slider                                                  */
  /* ------------------------------------------------------------------ */
  var track = document.getElementById('lf-testimonial-track');
  var dotsWrap = document.getElementById('lf-testimonial-dots');

  if (track && dotsWrap) {
    var slides = track.querySelectorAll('.lf-testimonial');
    var current = 0;
    var autoplayId = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function () { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll('button');

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      track.style.transition = reduceMotion ? 'none' : 'transform 500ms cubic-bezier(0.16,1,0.3,1)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
    }

    function resetAutoplay() {
      if (autoplayId) window.clearInterval(autoplayId);
      if (!reduceMotion) {
        autoplayId = window.setInterval(function () { goTo(current + 1); }, 6500);
      }
    }

    goTo(0);
    resetAutoplay();

    track.addEventListener('mouseenter', function () { if (autoplayId) window.clearInterval(autoplayId); });
    track.addEventListener('mouseleave', resetAutoplay);
  }

  /* ------------------------------------------------------------------ */
  /* Back to top button                                                  */
  /* ------------------------------------------------------------------ */
  var toTop = document.getElementById('lf-to-top');
  if (toTop) {
    var toggleToTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    toggleToTop();
    window.addEventListener('scroll', toggleToTop, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                         */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById('lf-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

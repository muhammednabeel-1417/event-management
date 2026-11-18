/**
 * main.js — Élite Events: Professional Event Management Website
 * Handles: navigation, smooth scrolling, scroll animations, mobile menu,
 *          back-to-top, notifications, stats counters, testimonial slider,
 *          FAQ accordion, modals, lazy loading, and general UI interactions.
 *
 * Vanilla ES6+ — no jQuery, no frameworks.
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Shorthand querySelector (single element)
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * Shorthand querySelectorAll (NodeList → Array)
 * @param {string} selector
 * @param {Element} [scope=document]
 */
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/**
 * Add an event listener and return a cleanup function.
 * @param {EventTarget} target
 * @param {string} event
 * @param {Function} handler
 * @param {object} [options]
 */
const on = (target, event, handler, options) => {
  if (!target) return () => {};
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
};

/* ============================================================
   1. NAVBAR SCROLL EFFECT
   ============================================================ */

const initNavbarScroll = () => {
  const navbar = $('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 50;

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  on(window, 'scroll', handleScroll, { passive: true });
  // Run once on init to set correct state if page reloaded mid-scroll
  handleScroll();
};

/* ============================================================
   2. MOBILE MENU
   ============================================================ */

const initMobileMenu = () => {
  const toggle = $('#nav-toggle') || $('.nav-toggle');
  const navMenu = $('.nav-menu');
  if (!toggle || !navMenu) return;

  const ICON_OPEN  = '☰';
  const ICON_CLOSE = '✕';

  /** Open / close the mobile nav */
  const toggleMenu = (force) => {
    const isOpen = force !== undefined ? force : !navMenu.classList.contains('active');
    navMenu.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? ICON_CLOSE : ICON_OPEN;
    document.body.classList.toggle('menu-open', isOpen);
  };

  // Hamburger click
  on(toggle, 'click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when any nav-link is clicked (mobile)
  $$('.nav-link').forEach(link => {
    on(link, 'click', () => toggleMenu(false));
  });

  // Close when clicking outside the menu
  on(document, 'click', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        e.target !== toggle) {
      toggleMenu(false);
    }
  });

  // Close on Escape key
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      toggleMenu(false);
    }
  });
};

/* ============================================================
   3. SMOOTH SCROLLING + ACTIVE NAV LINK
   ============================================================ */

const initSmoothScroll = () => {
  const NAV_OFFSET = 70; // px — navbar height

  // Smooth scroll for all anchor links pointing to in-page sections
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return; // Skip bare # links
      const target = $(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

/* ============================================================
   11. ACTIVE NAV LINK (IntersectionObserver)
   ============================================================ */

const initActiveNavLink = () => {
  const sections   = $$('section[id], div[id]').filter(el => el.id);
  const navLinks   = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-50% 0px -50% 0px', // trigger at mid-screen
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
};

/* ============================================================
   4. BACK-TO-TOP BUTTON
   ============================================================ */

const initBackToTop = () => {
  const btn = $('#back-to-top');
  if (!btn) return;

  const SHOW_THRESHOLD = 300;

  const handleScroll = () => {
    btn.classList.toggle('visible', window.scrollY > SHOW_THRESHOLD);
  };

  on(window, 'scroll', handleScroll, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  handleScroll();
};

/* ============================================================
   5. SCROLL ANIMATIONS (IntersectionObserver)
   ============================================================ */

const initScrollAnimations = () => {
  const animatables = $$('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale');
  if (!animatables.length) return;

  // Assign stagger --delay to children inside grid/flex parents
  animatables.forEach((el, globalIdx) => {
    // If element is a direct child of a grid/flex container, stagger it
    const siblings = $$(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale',
      el.parentElement
    );
    if (siblings.length > 1) {
      const idx = siblings.indexOf(el);
      el.style.setProperty('--delay', `${idx * 0.1}s`);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Respect the stagger delay stored in CSS var
          const delay = el.style.getPropertyValue('--delay') || '0s';
          el.style.transitionDelay = delay;
          el.classList.add('in-view');
          observer.unobserve(el); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  animatables.forEach(el => observer.observe(el));
};

/* ============================================================
   6. STATS COUNTER ANIMATION
   ============================================================ */

const initStatsCounter = () => {
  const statEls = $$('.stat-number');
  if (!statEls.length) return;

  let animated = false;

  /**
   * Animate a single counter element from 0 → target.
   * @param {Element} el
   */
  const animateCounter = (el) => {
    const raw    = el.getAttribute('data-target') || '0';
    const target = parseInt(raw.replace(/\D/g, ''), 10);
    const suffix = raw.replace(/[\d]/g, '');   // e.g. '+' or 'K'
    const duration = 2000; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some(e => e.isIntersecting);
      if (visible && !animated) {
        animated = true;
        statEls.forEach(animateCounter);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  // Observe the parent stats section or fall back to first element
  const statsSection = statEls[0].closest('section') || statEls[0].parentElement;
  observer.observe(statsSection);
};

/* ============================================================
   7. TESTIMONIAL SLIDER
   ============================================================ */

const initTestimonialSlider = () => {
  const slider    = $('#testimonials-slider') || $('#testimonialsSlider') || $('.testimonials-slider');
  const cards     = $$('.testimonial-card');
  const prevBtn   = $('.slider-prev');
  const nextBtn   = $('.slider-next');
  const dotsWrap  = $('.slider-dots');

  if (!slider || !cards.length) return;

  let currentIdx  = 0;
  let autoTimer   = null;
  const INTERVAL  = 5000; // ms
  const TOTAL     = cards.length;

  /* ---- Build dot navigation ---- */
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className   = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      on(dot, 'click', () => { goTo(i); startAuto(); });
      dotsWrap.appendChild(dot);
    });
  }

  /** Activate card at index i */
  const goTo = (i) => {
    currentIdx = ((i % TOTAL) + TOTAL) % TOTAL; // wrap around
    slider.style.transform = `translateX(-${currentIdx * 100}%)`;
    cards.forEach((card, idx) => {
      card.classList.toggle('active', idx === currentIdx);
    });
    if (dotsWrap) {
      const dots = $$('.slider-dot, .dot', dotsWrap);
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIdx);
      });
    }
  };

  const updateDot = (i, active) => {
    if (!dotsWrap) return;
    const dots = $$('.slider-dot', dotsWrap);
    if (dots[i]) dots[i].classList.toggle('active', active);
  };

  const next = () => goTo(currentIdx + 1);
  const prev = () => goTo(currentIdx - 1);

  /** Auto-advance */
  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(next, INTERVAL);
  };
  const stopAuto  = () => clearInterval(autoTimer);

  /* ---- Prev / Next buttons ---- */
  if (prevBtn) on(prevBtn, 'click', () => { prev(); startAuto(); });
  if (nextBtn) on(nextBtn, 'click', () => { next(); startAuto(); });

  /* ---- Pause on hover ---- */
  on(slider, 'mouseenter', stopAuto);
  on(slider, 'mouseleave', startAuto);

  /* ---- Touch / swipe support ---- */
  let touchStartX = 0;
  let touchStartY = 0;

  on(slider, 'touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  on(slider, 'touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Only treat as horizontal swipe if horizontal dominates
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) next();
      else             prev();
      startAuto();
    }
  }, { passive: true });

  /* ---- Init ---- */
  goTo(0);
  startAuto();
};

/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */

const initFaqAccordion = () => {
  const faqItems = $$('.faq-item');
  if (!faqItems.length) return;

  /**
   * Close a single faq-item.
   * @param {Element} item
   */
  const closeItem = (item) => {
    const answer = $('.faq-answer', item);
    item.classList.remove('active');
    if (answer) {
      answer.style.maxHeight = '0';
      answer.style.paddingTop    = '0';
      answer.style.paddingBottom = '0';
    }
  };

  /**
   * Open a single faq-item.
   * @param {Element} item
   */
  const openItem = (item) => {
    const answer = $('.faq-answer', item);
    item.classList.add('active');
    if (answer) {
      // Measure the natural height of the content
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.paddingTop    = '';
      answer.style.paddingBottom = '';
    }
  };

  faqItems.forEach(item => {
    const question = $('.faq-question', item);
    if (!question) return;

    // Set initial state: closed
    closeItem(item);

    on(question, 'click', () => {
      const isOpen = item.classList.contains('active');

      // Close all items
      faqItems.forEach(closeItem);

      // If the clicked item was not open, open it now
      if (!isOpen) openItem(item);
    });
  });
};

/* ============================================================
   9. NOTIFICATION SYSTEM
   ============================================================ */

let notificationTimer = null;

/**
 * Display a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 * @param {number} [duration=4000] - ms before auto-hide
 */
const showNotification = (message, type = 'info', duration = 4000) => {
  const notification = $('#notification');
  if (!notification) return;

  // Clear any running auto-hide timer
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }

  // Reset classes
  notification.className = 'notification';
  notification.classList.add(type);

  // Build inner HTML with close button
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <button class="notification-close" aria-label="Close notification">✕</button>
  `;

  // Wire up manual close
  const closeBtn = $('.notification-close', notification);
  if (closeBtn) {
    on(closeBtn, 'click', () => hideNotification());
  }

  // Show (triggers CSS slide-in animation)
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });

  // Auto-hide after duration
  notificationTimer = setTimeout(hideNotification, duration);
};

/** Hide the toast notification */
const hideNotification = () => {
  const notification = $('#notification');
  if (!notification) return;
  notification.classList.remove('show');
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
};

/* ============================================================
   10. MODAL SYSTEM
   ============================================================ */

/**
 * Open a modal by its element ID.
 * @param {string} modalId
 */
const openModal = (modalId) => {
  const modal = $(`#${modalId}`);
  if (!modal) return;

  modal.classList.add('active');
  document.body.classList.add('modal-open');
  modal.setAttribute('aria-hidden', 'false');

  // Focus first focusable element inside modal for accessibility
  const focusable = modal.querySelector(
    'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) {
    setTimeout(() => focusable.focus(), 100);
  }
};

/**
 * Close a modal by its element ID.
 * @param {string} modalId
 */
const closeModal = (modalId) => {
  const modal = $(`#${modalId}`);
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  // Remove body scroll lock only when no other modals are open
  if (!$$('.modal.active').length) {
    document.body.classList.remove('modal-open');
  }
};

const initModals = () => {
  /* ---- Open via "Get a Quote" buttons ---- */
  $$('.quote-btn, .service-quote-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      openModal('bookingModal');
    });
  });

  /* ---- Close via .modal-close buttons ---- */
  $$('.modal-close').forEach(btn => {
    on(btn, 'click', () => {
      const modal = btn.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });

  /* ---- Close on backdrop click ---- */
  $$('.modal').forEach(modal => {
    on(modal, 'click', (e) => {
      // Close only if the click is on the backdrop (not the content box)
      if (e.target === modal) closeModal(modal.id);
    });
  });

  /* ---- Close on Escape key ---- */
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal.active').forEach(modal => closeModal(modal.id));
    }
  });
};

/* ============================================================
   12. HERO SECTION ANIMATION + PARALLAX
   ============================================================ */

const initHeroAnimations = () => {
  const heroSection = $('#home');
  if (!heroSection) return;

  // Add loaded class to trigger CSS keyframe animations
  setTimeout(() => {
    heroSection.classList.add('hero-loaded');
  }, 100);

  /* ---- Subtle parallax on scroll ---- */
  const heroBg = heroSection.querySelector('.hero-bg, .hero-overlay, .hero-image');
  if (!heroBg) return;

  on(window, 'scroll', () => {
    const scrolled = window.scrollY;
    // Parallax: move bg at 40% of scroll speed
    heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
  }, { passive: true });
};

/* ============================================================
   13. SERVICES — VIEW DETAILS
   ============================================================ */

const initServiceDetails = () => {
  $$('.view-details-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      const card    = btn.closest('.service-card, [class*="service"]');
      const name    = card
        ? (card.querySelector('h3, h4')?.textContent?.trim() || 'this service')
        : 'this service';

      showNotification(
        `📋 For detailed information about <strong>${name}</strong>, please use the "Get a Quote" button or contact us directly.`,
        'info',
        5000
      );
    });
  });
};

/* ============================================================
   14. PRICING PACKAGE SELECTION
   ============================================================ */

const initPricingPackages = () => {
  $$('.choose-package-btn, .pricing-cta-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();

      // Try to detect package name from the card
      const card        = btn.closest('.pricing-card, [class*="pricing"]');
      const packageName = card
        ? (card.querySelector('h3, .plan-name, .package-name')?.textContent?.trim() || '')
        : '';

      openModal('bookingModal');

      // Pre-select package in the modal form if the field exists
      if (packageName) {
        const packageField = $('#bookingModal').querySelector(
          'select[name="package"], input[name="package"], #package, #preferredPackage'
        );
        if (packageField) {
          if (packageField.tagName === 'SELECT') {
            // Find the matching option (case-insensitive)
            const option = [...packageField.options].find(opt =>
              opt.textContent.toLowerCase().includes(packageName.toLowerCase())
            );
            if (option) packageField.value = option.value;
          } else {
            packageField.value = packageName;
          }
        }
        showNotification(`✅ "${packageName}" package pre-selected!`, 'success', 3000);
      }
    });
  });
};

/* ============================================================
   LAZY IMAGE LOADING
   ============================================================ */

const initLazyImages = () => {
  if (!('IntersectionObserver' in window)) return;

  const images = $$('img[data-src]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img  = entry.target;
          const src  = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          imgObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' } // start loading 200px before entering viewport
  );

  images.forEach(img => imgObserver.observe(img));
};

/* ============================================================
   WINDOW RESIZE HANDLER
   ============================================================ */

const initResizeHandler = () => {
  let resizeTimer;

  on(window, 'resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Close mobile menu if resized to desktop width
      const navMenu = $('.nav-menu');
      if (navMenu && window.innerWidth > 768) {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        const toggle = $('#nav-toggle') || $('.nav-toggle');
        if (toggle) {
          toggle.textContent = '☰';
          toggle.setAttribute('aria-expanded', 'false');
        }
      }

      // Re-compute any open FAQ max-heights (content may reflow)
      $$('.faq-item.active').forEach(item => {
        const answer = $('.faq-answer', item);
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      });
    }, 200);
  });
};

/* ============================================================
   KEYBOARD ACCESSIBILITY — FOCUS TRAP IN MODALS
   ============================================================ */

const initFocusTrap = () => {
  on(document, 'keydown', (e) => {
    if (e.key !== 'Tab') return;

    const activeModal = $('.modal.active');
    if (!activeModal) return;

    const focusables = [...activeModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];

    if (!focusables.length) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
};

/* ============================================================
   CONTACT FORM — BASIC CLIENT-SIDE VALIDATION
   ============================================================ */

const initContactForm = () => {
  // Let forms.js manage full client-side demo validation
  return;
  const form = $('form.contact-form, #contactForm, form[data-form="contact"]');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();

    const name  = form.querySelector('[name="name"], #name');
    const email = form.querySelector('[name="email"], #email');
    const msg   = form.querySelector('[name="message"], #message');

    if (!name?.value.trim()) {
      showNotification('Please enter your name.', 'error');
      name?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.value.trim() || !emailRegex.test(email.value)) {
      showNotification('Please enter a valid email address.', 'error');
      email?.focus();
      return;
    }

    if (!msg?.value.trim()) {
      showNotification('Please enter your message.', 'error');
      msg?.focus();
      return;
    }

    // Simulate form submission (replace with real API call)
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';
    }

    setTimeout(() => {
      showNotification('✅ Thank you! Your message has been sent. We\'ll get back to you soon.', 'success', 6000);
      form.reset();
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Message';
      }
    }, 1500);
  });
};

/* ============================================================
   BOOKING MODAL FORM VALIDATION
   ============================================================ */

const initBookingForm = () => {
  // Let forms.js manage full client-side demo validation
  return;
  const form = $('#bookingModal form, form.booking-form');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();

    const name  = form.querySelector('[name="name"], #clientName');
    const phone = form.querySelector('[name="phone"], #clientPhone');
    const email = form.querySelector('[name="email"], #clientEmail');
    const date  = form.querySelector('[name="eventDate"], #eventDate');

    if (!name?.value.trim()) {
      showNotification('Please enter your full name.', 'error');
      name?.focus();
      return;
    }
    if (!phone?.value.trim()) {
      showNotification('Please enter your phone number.', 'error');
      phone?.focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.value.trim() || !emailRegex.test(email.value)) {
      showNotification('Please enter a valid email address.', 'error');
      email?.focus();
      return;
    }
    if (!date?.value) {
      showNotification('Please select your event date.', 'error');
      date?.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting…';
    }

    // Simulate booking submission
    setTimeout(() => {
      showNotification('🎉 Booking request submitted! Our team will contact you within 24 hours.', 'success', 7000);
      form.reset();
      closeModal('bookingModal');
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit Enquiry';
      }
    }, 1500);
  });
};

/* ============================================================
   WHATSAPP QUICK LINK
   ============================================================ */

const initWhatsApp = () => {
  $$('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
    on(link, 'click', () => {
      showNotification('Opening WhatsApp… please wait.', 'info', 2500);
    });
  });
};

/* ============================================================
   SCROLL PROGRESS INDICATOR (optional visual enhancement)
   ============================================================ */

const initScrollProgress = () => {
  // Only create indicator if CSS doesn't already handle it
  const existing = $('#scroll-progress');
  if (existing) {
    on(window, 'scroll', () => {
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      existing.style.width = `${progress}%`;
    }, { passive: true });
  }
};

/* ============================================================
   PAGE LOADER
   ============================================================ */

const initPageLoader = () => {
  const loader = $('#page-loader, .page-loader');
  if (!loader) return;

  on(window, 'load', () => {
    loader.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => loader.remove(), 500);
  });
};

/* ============================================================
   GLOBAL EXPORTS (accessible from other scripts)
   ============================================================ */

window.EliteEvents = {
  showNotification,
  hideNotification,
  openModal,
  closeModal,
};

/* ============================================================
   MAIN INIT — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Core navigation & UI
  initNavbarScroll();
  initMobileMenu();
  initSmoothScroll();
  initActiveNavLink();
  initBackToTop();

  // Animations & interactivity
  initScrollAnimations();
  initStatsCounter();
  initTestimonialSlider();
  initFaqAccordion();
  initHeroAnimations();

  // Modal & notification systems
  initModals();
  initFocusTrap();

  // Forms
  initContactForm();
  initBookingForm();

  // Feature-specific
  initServiceDetails();
  initPricingPackages();
  initWhatsApp();

  // Performance
  initLazyImages();
  initScrollProgress();
  initPageLoader();

  // Responsive adjustments
  initResizeHandler();

  console.log('✦ Élite Events — main.js initialised successfully.');
});

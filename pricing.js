/**
 * pricing.js — Élite Events | Pricing Section Logic
 * Handles: pricing data, card interactions, comparison table,
 *          package selection, FAQ accordion, tooltips, price display.
 * Vanilla JS ES6+ — no jQuery.
 */

/* =========================================================
   1. PRICING DATA
   ========================================================= */
const pricingData = {
  basic: {
    name: 'Basic Package',
    price: 15000,
    badge: null,
    description: 'Perfect for intimate gatherings and simple celebrations',
    features: [
      'Simple themed decoration',
      'Basic stage setup',
      'Standard LED lighting',
      'Standard photography (4 hrs)',
      'Basic floral arrangements',
      'Setup & breakdown included',
      'Event coordinator assistance',
      'Up to 50 guests'
    ],
    notIncluded: [
      'Videography',
      'Catering services',
      'Guest management',
      'Custom stage design'
    ],
    color: 'standard',
    icon: 'fa-star'
  },
  premium: {
    name: 'Premium Package',
    price: 35000,
    badge: 'Most Popular',
    description: 'Our best-selling package for memorable celebrations',
    features: [
      'Premium themed decoration',
      'Beautiful custom stage design',
      'Professional LED & mood lighting',
      'Photography & videography (8 hrs)',
      'Premium floral arrangements',
      'Guest management (up to 150)',
      'Dedicated event coordinator',
      'Welcome drink station',
      'Backdrop & photo booth setup',
      'Setup & breakdown included'
    ],
    notIncluded: [
      'Catering services',
      'Live entertainment'
    ],
    color: 'premium',
    icon: 'fa-crown'
  },
  luxury: {
    name: 'Luxury Package',
    price: 75000,
    badge: 'Exclusive',
    description: 'An unparalleled luxury experience for your most special moments',
    features: [
      'Luxury bespoke decoration',
      'Customized stage & entrance design',
      'Premium cinematic lighting',
      'Professional photography & cinematography (full day)',
      'Exotic floral arrangements',
      'Complete guest management (up to 300)',
      'Senior dedicated event coordinator',
      'Welcome & farewell drinks',
      'Luxury photo booth & backdrop',
      'Live music / DJ arrangement',
      'Special entrance design & aisle',
      'Candle light dinner setup',
      'Setup & breakdown included'
    ],
    notIncluded: [],
    color: 'luxury',
    icon: 'fa-gem'
  }
};

/* =========================================================
   2. STATE
   ========================================================= */
let _selectedPackage = 'premium'; // default highlight
let _comparisonVisible = false;

/* =========================================================
   3. UTILITY — PRICE FORMATTING
   ========================================================= */
/**
 * Format a number as an Indian-style rupee price string.
 * e.g. formatPrice(75000) => "₹75,000"
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

/* =========================================================
   4. PACKAGE SELECTION (public API for main.js / forms.js)
   ========================================================= */
/**
 * Returns the currently selected/highlighted package key.
 * @returns {string} 'basic' | 'premium' | 'luxury'
 */
function getSelectedPackage() {
  return _selectedPackage;
}

/**
 * Highlights the specified pricing card and updates internal state.
 * @param {string} packageName  'basic' | 'premium' | 'luxury'
 */
function setPackageSelection(packageName) {
  if (!pricingData[packageName]) return;
  _selectedPackage = packageName;

  // Remove selection from all cards
  document.querySelectorAll('.pricing-card, .package-card').forEach(card => {
    card.classList.remove('selected', 'active-selection');
  });

  // Apply selection to matching card
  const targetCard = document.querySelector(
    `[data-package="${packageName}"], .pricing-card[data-package="${packageName}"]`
  );
  if (targetCard) {
    targetCard.classList.add('selected', 'active-selection');
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* =========================================================
   5. PRICE DISPLAY — sync DOM with pricingData
   ========================================================= */
/**
 * Updates every price element in the DOM whose ancestor card has
 * a data-package attribute, so the DOM always reflects pricingData.
 */
function updatePricesFromData() {
  Object.entries(pricingData).forEach(([key, pkg]) => {
    // Target cards by data-package attribute
    const cards = document.querySelectorAll(`[data-package="${key}"]`);
    cards.forEach(card => {
      // Update price amount spans
      const priceEl = card.querySelector('.price-amount, .price, [class*="price"]');
      if (priceEl) priceEl.textContent = formatPrice(pkg.price);

      // Update package name
      const nameEl = card.querySelector('.package-name, .plan-name, h3');
      if (nameEl && nameEl.textContent.trim() === '') nameEl.textContent = pkg.name;

      // Update description
      const descEl = card.querySelector('.package-description, .plan-description, .package-desc');
      if (descEl && descEl.textContent.trim() === '') descEl.textContent = pkg.description;
    });

    // Also handle standalone price displays with data-price-for attribute
    document.querySelectorAll(`[data-price-for="${key}"]`).forEach(el => {
      el.textContent = formatPrice(pkg.price);
    });
  });
}

/* =========================================================
   6. PACKAGE HIGHLIGHT — premium gets .highlighted on load
   ========================================================= */
/**
 * Adds .highlighted / .featured class to the premium card
 * and animates the "Most Popular" badge.
 */
function highlightFeaturedPackage() {
  const premiumCard = document.querySelector('[data-package="premium"]');
  if (!premiumCard) return;

  premiumCard.classList.add('highlighted', 'featured');

  // Animate the badge if present
  const badge = premiumCard.querySelector('.package-badge, .plan-badge, .badge');
  if (badge) {
    badge.classList.add('badge-pulse');
  }

  // Inject badge if the HTML doesn't have one but pricingData says it should
  Object.entries(pricingData).forEach(([key, pkg]) => {
    if (!pkg.badge) return;
    const card = document.querySelector(`[data-package="${key}"]`);
    if (!card) return;
    if (!card.querySelector('.package-badge, .plan-badge, .badge')) {
      const badgeEl = document.createElement('span');
      badgeEl.className = `package-badge badge-${key}`;
      badgeEl.textContent = pkg.badge;
      card.prepend(badgeEl);
    }
  });
}

/* =========================================================
   7. CHOOSE PACKAGE BUTTONS
   ========================================================= */
/**
 * Attaches click handlers to all "Choose Package" buttons.
 * On click: pre-fills the booking modal's package field and opens the modal.
 */
function addPackageButtonHandlers() {
  // Covers buttons inside pricing cards AND the packages-preview section
  const chooseButtons = document.querySelectorAll(
    '[data-package] .btn-choose, [data-package] .choose-package-btn, ' +
    '.pricing-card .btn-primary, .package-card .btn-primary, ' +
    '[data-action="choose-package"]'
  );

  chooseButtons.forEach(btn => {
    btn.addEventListener('click', handleChoosePackage);
  });

  // Also delegate from pricing section wrapper in case cards are dynamic
  const pricingSection = document.querySelector('#pricing, .pricing-section');
  if (pricingSection) {
    pricingSection.addEventListener('click', e => {
      const btn = e.target.closest(
        '.btn-choose, .choose-package-btn, [data-action="choose-package"]'
      );
      if (!btn) return;
      handleChoosePackage.call(btn, e);
    });
  }
}

/**
 * Handler for "Choose Package" button clicks.
 * @param {Event} e
 */
function handleChoosePackage(e) {
  e.preventDefault();
  // Walk up to find the card with data-package
  const card = e.currentTarget
    ? e.currentTarget.closest('[data-package]')
    : this.closest('[data-package]');

  const packageKey = card ? card.dataset.package : null;

  if (packageKey && pricingData[packageKey]) {
    // Update state
    setPackageSelection(packageKey);

    // Pre-fill the booking modal's preferred package field
    const packageSelect = document.querySelector(
      '#preferredPackage, [name="preferredPackage"], [name="package"]'
    );
    if (packageSelect) {
      // Try to set option by value
      const optionToSelect = [...packageSelect.options].find(
        opt =>
          opt.value.toLowerCase() === packageKey ||
          opt.text.toLowerCase().includes(pricingData[packageKey].name.toLowerCase())
      );
      if (optionToSelect) optionToSelect.selected = true;
      else packageSelect.value = pricingData[packageKey].name;
    }

    // Open the booking modal
    if (typeof openModal === 'function') {
      openModal('bookingModal');
    } else {
      const modal = document.getElementById('bookingModal');
      if (modal) {
        modal.classList.add('active', 'open');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
      }
    }

    // Show notification toast
    showPricingNotification('Great choice! Please fill in your event details.');
  }
}

/* =========================================================
   8. NOTIFICATION TOAST
   ========================================================= */
/**
 * Displays a notification toast. Falls back to the global showNotification
 * if available, otherwise creates a minimal in-page toast.
 * @param {string} message
 * @param {string} [type='success']
 */
function showPricingNotification(message, type = 'success') {
  if (typeof showNotification === 'function') {
    showNotification(message, type);
    return;
  }

  // Fallback: use #notification element if present
  const notif = document.getElementById('notification');
  if (notif) {
    notif.textContent = message;
    notif.className = `notification ${type} show`;
    clearTimeout(notif._hideTimer);
    notif._hideTimer = setTimeout(() => notif.classList.remove('show'), 4000);
    return;
  }

  // Last resort: temporary floating toast
  let toast = document.getElementById('pricing-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pricing-toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '30px', right: '30px', zIndex: '9999',
      background: '#c9a84c', color: '#0a0e1a', padding: '14px 24px',
      borderRadius: '8px', fontWeight: '600', fontSize: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'opacity 0.4s',
      opacity: '0', pointerEvents: 'none'
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

/* =========================================================
   9. PRICING COMPARISON TABLE
   ========================================================= */
/**
 * Builds a full comparison table from pricingData and injects it into
 * #pricing-comparison or creates a modal/overlay if the container is absent.
 * Wires up the "Compare All Packages" button to show/hide it.
 */
function initComparisonTable() {
  const compareBtn = document.querySelector(
    '#compare-packages-btn, [data-action="compare-packages"], .compare-packages-btn'
  );
  if (!compareBtn) return;

  // Build once
  const table = buildComparisonTable();

  // Find or create a container
  let container = document.getElementById('pricing-comparison');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pricing-comparison';
    container.className = 'pricing-comparison-wrapper';
    container.style.display = 'none';
    // Insert after the pricing cards grid
    const pricingGrid = document.querySelector('.pricing-grid, .packages-grid, #pricing .cards-wrapper');
    if (pricingGrid) {
      pricingGrid.parentNode.insertBefore(container, pricingGrid.nextSibling);
    } else {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) pricingSection.appendChild(container);
      else document.body.appendChild(container);
    }
  }

  container.innerHTML = '';
  container.appendChild(table);

  // Toggle handler
  compareBtn.addEventListener('click', () => {
    _comparisonVisible = !_comparisonVisible;
    container.style.display = _comparisonVisible ? 'block' : 'none';
    compareBtn.textContent = _comparisonVisible ? 'Hide Comparison' : 'Compare All Packages';
    if (_comparisonVisible) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/**
 * Dynamically builds the HTML comparison table from pricingData.
 * @returns {HTMLTableElement}
 */
function buildComparisonTable() {
  // Collect all unique features across packages
  const allFeatures = [...new Set(
    Object.values(pricingData).flatMap(p => [...p.features, ...p.notIncluded])
  )];

  const table = document.createElement('table');
  table.className = 'comparison-table';
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', 'Package Comparison');

  // ---- Header row ----
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const thFeature = document.createElement('th');
  thFeature.textContent = 'Feature';
  thFeature.className = 'col-feature';
  headerRow.appendChild(thFeature);

  Object.values(pricingData).forEach(pkg => {
    const th = document.createElement('th');
    th.className = `col-${pkg.color}`;
    th.innerHTML = `
      <span class="cmp-pkg-name">${pkg.name}</span>
      <span class="cmp-pkg-price">${formatPrice(pkg.price)}</span>
      ${pkg.badge ? `<span class="cmp-badge">${pkg.badge}</span>` : ''}
    `;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ---- Body rows ----
  const tbody = document.createElement('tbody');

  allFeatures.forEach(feature => {
    const row = document.createElement('tr');

    const tdFeature = document.createElement('td');
    tdFeature.className = 'feature-label';
    tdFeature.textContent = feature;
    row.appendChild(tdFeature);

    Object.values(pricingData).forEach(pkg => {
      const td = document.createElement('td');
      td.className = `col-${pkg.color}`;

      if (pkg.features.includes(feature)) {
        td.innerHTML = '<span class="cmp-check" aria-label="Included"><i class="fa-solid fa-check"></i></span>';
      } else {
        td.innerHTML = '<span class="cmp-cross" aria-label="Not included"><i class="fa-solid fa-xmark"></i></span>';
      }
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  // ---- Footer CTA row ----
  const tfoot = document.createElement('tfoot');
  const ctaRow = document.createElement('tr');
  const tdEmpty = document.createElement('td');
  ctaRow.appendChild(tdEmpty);

  Object.keys(pricingData).forEach(key => {
    const td = document.createElement('td');
    td.innerHTML = `
      <button class="btn btn-choose comparison-cta" data-package-cta="${key}">
        Choose ${pricingData[key].name.split(' ')[0]}
      </button>
    `;
    ctaRow.appendChild(td);
  });

  tfoot.appendChild(ctaRow);
  table.appendChild(tfoot);

  // Delegate clicks on comparison CTA buttons
  table.addEventListener('click', e => {
    const btn = e.target.closest('[data-package-cta]');
    if (!btn) return;
    const key = btn.dataset.packageCta;
    setPackageSelection(key);
    handleChoosePackageByKey(key);
  });

  return table;
}

/**
 * Convenience: open booking modal for a package key without a button event.
 * @param {string} key
 */
function handleChoosePackageByKey(key) {
  if (!pricingData[key]) return;
  setPackageSelection(key);

  const packageSelect = document.querySelector(
    '#preferredPackage, [name="preferredPackage"], [name="package"]'
  );
  if (packageSelect) {
    const opt = [...packageSelect.options].find(
      o => o.value.toLowerCase() === key || o.text.toLowerCase().includes(pricingData[key].name.toLowerCase())
    );
    if (opt) opt.selected = true;
    else packageSelect.value = pricingData[key].name;
  }

  if (typeof openModal === 'function') {
    openModal('bookingModal');
  } else {
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.classList.add('active', 'open');
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
    }
  }

  showPricingNotification('Great choice! Please fill in your event details.');
}

/* =========================================================
   10. PRICING TABS (event-category tabs)
   ========================================================= */
/**
 * If the pricing section has event-category tabs (Wedding / Birthday / Corporate),
 * switching tab updates displayed prices by applying a multiplier.
 * Uses data-tab or data-category attributes on tab buttons.
 */
function initPricingTabs() {
  const tabBtns = document.querySelectorAll(
    '.pricing-tabs .tab-btn, .pricing-tabs [data-tab], #pricing .tab-button'
  );
  if (!tabBtns.length) return;

  // Multipliers per event category (relative to base price)
  const categoryMultipliers = {
    wedding: 1.0,
    birthday: 0.8,
    corporate: 1.2,
    engagement: 0.9,
    anniversary: 0.95,
    default: 1.0
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = (btn.dataset.tab || btn.dataset.category || 'default').toLowerCase();
      const multiplier = categoryMultipliers[category] ?? categoryMultipliers.default;

      // Update all price displays
      Object.entries(pricingData).forEach(([key, pkg]) => {
        const adjustedPrice = Math.round(pkg.price * multiplier / 500) * 500; // round to nearest 500
        const cards = document.querySelectorAll(`[data-package="${key}"]`);
        cards.forEach(card => {
          const priceEl = card.querySelector('.price-amount, .price, [class*="price"]');
          if (priceEl) priceEl.textContent = formatPrice(adjustedPrice);
        });
      });
    });
  });
}

/* =========================================================
   11. FEATURE TOOLTIPS ("not included" items)
   ========================================================= */
/**
 * Adds a tooltip to every list item marked as "not included"
 * (.feature-unavailable, .not-included, [data-unavailable]).
 * The tooltip reads "Available in higher package".
 */
function initFeatureTooltips() {
  // Selector covers both HTML-rendered and JS-rendered not-included items
  const unavailableItems = document.querySelectorAll(
    '.feature-unavailable, .not-included, [data-unavailable], .feature-item.unavailable'
  );

  unavailableItems.forEach(item => {
    addTooltip(item, 'Available in higher package');
  });

  // Also hook dynamically via delegation from pricing cards
  const pricingSection = document.querySelector('#pricing, .pricing-section');
  if (pricingSection) {
    pricingSection.addEventListener('mouseover', e => {
      const target = e.target.closest(
        '.feature-unavailable, .not-included, [data-unavailable], .feature-item.unavailable'
      );
      if (target && !target._tooltipAttached) {
        addTooltip(target, 'Available in higher package');
        target._tooltipAttached = true;
      }
    });
  }
}

/**
 * Creates and positions a CSS-driven tooltip on an element.
 * @param {HTMLElement} el
 * @param {string} text
 */
function addTooltip(el, text) {
  if (el._tooltipAttached) return;
  el._tooltipAttached = true;

  el.setAttribute('data-tooltip', text);
  el.style.position = 'relative';
  el.style.cursor = 'help';

  // Create tooltip element
  const tip = document.createElement('span');
  tip.className = 'pricing-tooltip';
  tip.textContent = text;
  tip.setAttribute('role', 'tooltip');
  el.appendChild(tip);

  // Inject minimal tooltip styles once
  if (!document.getElementById('pricing-tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'pricing-tooltip-styles';
    style.textContent = `
      .pricing-tooltip {
        display: none;
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a2e;
        color: #e8c96d;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #c9a84c44;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        z-index: 1000;
        pointer-events: none;
        transition: opacity 0.2s;
      }
      .pricing-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: #1a1a2e;
      }
      [data-tooltip]:hover .pricing-tooltip,
      [data-tooltip]:focus-within .pricing-tooltip {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }
}

/* =========================================================
   12. FAQ ACCORDION
   ========================================================= */
/**
 * Initialises the FAQ accordion in the pricing section.
 * .faq-question click -> toggles .active on parent .faq-item
 * and smoothly animates max-height on the .faq-answer element.
 * Only one FAQ item is open at a time.
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  // Set initial max-height on all answers for animation
  faqItems.forEach(item => {
    const answer = item.querySelector('.faq-answer, .faq-body, .faq-content');
    if (answer) {
      answer.style.maxHeight = '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
      answer.style.opacity = '0';
    }
  });

  // Click handler on each question
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question, .faq-header, [class*="faq-q"]');
    const answer = item.querySelector('.faq-answer, .faq-body, .faq-content');

    if (!question || !answer) return;

    question.style.cursor = 'pointer';
    question.setAttribute('role', 'button');
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all items
      faqItems.forEach(fi => {
        fi.classList.remove('active');
        const a = fi.querySelector('.faq-answer, .faq-body, .faq-content');
        const q = fi.querySelector('.faq-question, .faq-header, [class*="faq-q"]');
        if (a) { a.style.maxHeight = '0'; a.style.opacity = '0'; }
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      // If it was closed, open it
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Keyboard accessibility: Enter / Space on focused question
  document.querySelectorAll('.faq-question, .faq-header').forEach(q => {
    q.setAttribute('tabindex', '0');
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        q.click();
      }
    });
  });
}

/* =========================================================
   13. PRICING SECTION SCROLL ANIMATION
   ========================================================= */
/**
 * Staggered entrance animation for pricing cards using IntersectionObserver.
 */
function initPricingAnimations() {
  const cards = document.querySelectorAll('.pricing-card, [data-package]');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach(card => observer.observe(card));
}

/* =========================================================
   14. ANNUAL / MONTHLY TOGGLE (optional)
   ========================================================= */
/**
 * If a billing-period toggle exists in the page, wire it up.
 * Monthly = base price | Annual = base price * 10 (2 months free effectively).
 */
function initBillingToggle() {
  const toggle = document.querySelector(
    '#billing-toggle, [data-toggle="billing"], .annual-toggle input[type="checkbox"]'
  );
  if (!toggle) return; // Not in HTML — skip gracefully

  toggle.addEventListener('change', () => {
    const isAnnual = toggle.checked;
    Object.entries(pricingData).forEach(([key, pkg]) => {
      const displayPrice = isAnnual ? pkg.price * 10 : pkg.price;
      const cards = document.querySelectorAll(`[data-package="${key}"]`);
      cards.forEach(card => {
        const priceEl = card.querySelector('.price-amount, .price, [class*="price"]');
        if (priceEl) priceEl.textContent = formatPrice(displayPrice);
      });
    });

    // Update period labels
    document.querySelectorAll('.price-period, .billing-period').forEach(el => {
      el.textContent = isAnnual ? '/ year' : '/ event';
    });
  });
}

/* =========================================================
   15. MAIN INIT
   ========================================================= */
/**
 * Master init — called on DOMContentLoaded.
 * Runs all sub-initialisers in dependency order.
 */
function initPricing() {
  updatePricesFromData();      // 1. Sync prices first
  highlightFeaturedPackage();  // 2. Highlight premium card
  addPackageButtonHandlers();  // 3. Wire up "Choose Package" buttons
  initPricingTabs();           // 4. Event-category tabs (if present)
  initComparisonTable();       // 5. Comparison table toggle (if button present)
  initFeatureTooltips();       // 6. "Not included" tooltips
  initFaqAccordion();          // 7. FAQ accordion
  initPricingAnimations();     // 8. Scroll entrance animations
  initBillingToggle();         // 9. Annual/monthly toggle (optional)
}

/* =========================================================
   16. BOOTSTRAP
   ========================================================= */
document.addEventListener('DOMContentLoaded', initPricing);

/* =========================================================
   17. PUBLIC EXPORTS
   Exposed on window so main.js and forms.js can call them.
   ========================================================= */
window.pricingData          = pricingData;
window.getSelectedPackage   = getSelectedPackage;
window.setPackageSelection  = setPackageSelection;
window.formatPrice          = formatPrice;
window.handleChoosePackageByKey = handleChoosePackageByKey;

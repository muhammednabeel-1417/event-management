/**
 * forms.js — Elite Events | Form Validation & Submission
 * =========================================================
 * Handles all form logic for the Event Management website.
 * No backend — all submissions show demo confirmation messages.
 * Vanilla JS (ES6+), no jQuery, no external dependencies.
 */

'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */

/** WhatsApp contact number — change here to update everywhere */
const WHATSAPP_NUMBER = '+919876543210';

/** Pre-filled WhatsApp message */
const WHATSAPP_MESSAGE = "Hello! I'm interested in your event management services.";

/** Character limits for textareas */
const CHAR_LIMITS = {
  'contact-message': 500,
  'booking-requirements': 1000,
};

/* ============================================================
   VALIDATORS
   ============================================================ */

/**
 * Core validator functions.
 * Each returns true if the value passes, false otherwise.
 */
const validators = {
  required:       (val)       => val.trim() !== '',
  minLength:      (val, min)  => val.trim().length >= min,
  email:          (val)       => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  phone:          (val)       => /^[6-9]\d{9}$/.test(val.replace(/[\s\-+()]/g, '').replace(/^91/, '')),
  futureDate:     (val)       => val && new Date(val) > new Date(),
  positiveNumber: (val)       => !isNaN(val) && parseInt(val, 10) > 0,
  maxNumber:      (val, max)  => !isNaN(val) && parseInt(val, 10) <= max,
};

/* ============================================================
   FIELD RULES
   ============================================================ */

/**
 * Validation rules for each field id.
 * Each entry is an array of { test, message } objects applied in order.
 */
const fieldRules = {
  /* --- Contact form --- */
  'contact-name': [
    { test: (v) => validators.required(v),          message: 'Name is required.' },
    { test: (v) => validators.minLength(v, 2),      message: 'Name must be at least 2 characters.' },
  ],
  'contact-email': [
    { test: (v) => validators.required(v),           message: 'Email is required.' },
    { test: (v) => validators.email(v),              message: 'Please enter a valid email address.' },
  ],
  'contact-phone': [
    { test: (v) => validators.required(v),           message: 'Phone number is required.' },
    { test: (v) => validators.phone(v),              message: 'Enter a valid 10-digit Indian mobile number (starting 6–9).' },
  ],
  'contact-event-type': [
    { test: (v) => validators.required(v),           message: 'Please select an event type.' },
  ],
  'contact-date': [
    { test: (v) => validators.required(v),           message: 'Please select an event date.' },
    { test: (v) => validators.futureDate(v),         message: 'Please choose a future date.' },
  ],
  'contact-message': [
    { test: (v) => validators.required(v),           message: 'Message is required.' },
    { test: (v) => validators.minLength(v, 20),      message: 'Message must be at least 20 characters.' },
  ],

  /* --- Booking / Quote modal form --- */
  'booking-name': [
    { test: (v) => validators.required(v),           message: 'Name is required.' },
    { test: (v) => validators.minLength(v, 2),       message: 'Name must be at least 2 characters.' },
  ],
  'booking-phone': [
    { test: (v) => validators.required(v),           message: 'Phone number is required.' },
    { test: (v) => validators.phone(v),              message: 'Enter a valid 10-digit Indian mobile number (starting 6–9).' },
  ],
  'booking-email': [
    { test: (v) => validators.required(v),           message: 'Email is required.' },
    { test: (v) => validators.email(v),              message: 'Please enter a valid email address.' },
  ],
  'booking-event-category': [
    { test: (v) => validators.required(v),           message: 'Please select an event category.' },
  ],
  'booking-date': [
    { test: (v) => validators.required(v),           message: 'Please select an event date.' },
    { test: (v) => validators.futureDate(v),         message: 'Please choose a future date.' },
  ],
  'booking-guests': [
    { test: (v) => validators.required(v),           message: 'Number of guests is required.' },
    { test: (v) => validators.positiveNumber(v),     message: 'Please enter a valid number (minimum 1).' },
    { test: (v) => validators.maxNumber(v, 5000),    message: 'Maximum guest count is 5000.' },
  ],
  'booking-package': [
    { test: (v) => validators.required(v),           message: 'Please select a package.' },
  ],
  /* booking-decoration and booking-requirements are optional — no rules needed */
};

/* ============================================================
   UTILITY — BUTTON STATES
   ============================================================ */

/**
 * Show a loading spinner on a button while form is submitting.
 * @param {HTMLButtonElement} btn
 */
function setButtonLoading(btn) {
  btn.dataset.originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
  btn.classList.add('loading');
}

/**
 * Restore a button to its original state after submission.
 * @param {HTMLButtonElement} btn
 * @param {string} [originalText] — falls back to btn.dataset.originalText
 */
function setButtonReset(btn, originalText) {
  btn.disabled = false;
  btn.innerHTML = originalText || btn.dataset.originalText || 'Submit';
  btn.classList.remove('loading');
}

/**
 * Smooth-scroll to the first field currently marked as .error.
 */
function scrollToFirstError() {
  const firstError = document.querySelector('.form-group .error, .form-group input.error, .form-group select.error, .form-group textarea.error');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError.focus({ preventScroll: true });
  }
}

/* ============================================================
   UTILITY — NOTIFICATION TOAST
   ============================================================ */

let _notificationTimer = null;

/**
 * Show a brief notification toast at the top/bottom of the page.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='success']
 * @param {number} [duration=4000] ms
 */
function showNotification(message, type = 'success', duration = 4000) {
  const el = document.getElementById('notification');
  if (!el) return;

  el.textContent = message;
  el.className = `notification notification--${type} notification--visible`;

  clearTimeout(_notificationTimer);
  _notificationTimer = setTimeout(() => {
    el.classList.remove('notification--visible');
  }, duration);
}

/* ============================================================
   UTILITY — SHAKE ANIMATION
   ============================================================ */

/**
 * Briefly shake a field to draw attention to a validation error.
 * @param {HTMLElement} field
 */
function shakeField(field) {
  field.classList.remove('shake');
  // Trigger reflow to restart animation
  void field.offsetWidth;
  field.classList.add('shake');
  field.addEventListener('animationend', () => field.classList.remove('shake'), { once: true });
}

/* ============================================================
   ERROR DISPLAY
   ============================================================ */

/**
 * Show an error message below a form field.
 * Creates a <span class="field-error"> if one doesn't exist yet.
 * @param {HTMLElement} field
 * @param {string} message
 */
function showFieldError(field, message) {
  const group = field.closest('.form-group') || field.parentElement;

  // Remove success state
  field.classList.remove('success');
  field.classList.add('error');
  group.classList.remove('focused', 'valid');
  group.classList.add('invalid');

  // Remove existing checkmark icon
  const existingCheck = group.querySelector('.field-icon');
  if (existingCheck) existingCheck.remove();

  // Create or update error span
  let errSpan = group.querySelector('.field-error');
  if (!errSpan) {
    errSpan = document.createElement('span');
    errSpan.className = 'field-error';
    // Insert after the field (or after a sibling like a toggle-password btn)
    const insertAfter = field.nextElementSibling || field;
    insertAfter.after
      ? insertAfter.after(errSpan)
      : group.appendChild(errSpan);
  }
  errSpan.textContent = message;
  errSpan.style.display = 'block';

  // Add red icon
  const icon = document.createElement('span');
  icon.className = 'field-icon field-icon--error';
  icon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
  group.appendChild(icon);
}

/**
 * Clear the error state from a form field and show success indicator.
 * @param {HTMLElement} field
 */
function clearFieldError(field) {
  const group = field.closest('.form-group') || field.parentElement;

  field.classList.remove('error');
  field.classList.add('success');
  group.classList.remove('invalid');
  group.classList.add('valid');

  const errSpan = group.querySelector('.field-error');
  if (errSpan) errSpan.style.display = 'none';

  // Remove any existing icon and add green checkmark
  const existingIcon = group.querySelector('.field-icon');
  if (existingIcon) existingIcon.remove();

  const icon = document.createElement('span');
  icon.className = 'field-icon field-icon--success';
  icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
  group.appendChild(icon);
}

/* ============================================================
   FIELD VALIDATION
   ============================================================ */

/**
 * Validate a single input / select / textarea field.
 * Applies rules from fieldRules[] in order, stops at first failure.
 * Updates the field's visual state via showFieldError / clearFieldError.
 *
 * @param {HTMLElement} field
 * @returns {{ valid: boolean, message: string }}
 */
function validateField(field) {
  const id    = field.id;
  const value = field.value;
  const rules = fieldRules[id];

  // Optional fields (no rules) always pass
  if (!rules || rules.length === 0) {
    clearFieldError(field);
    return { valid: true, message: '' };
  }

  for (const rule of rules) {
    if (!rule.test(value)) {
      showFieldError(field, rule.message);
      return { valid: false, message: rule.message };
    }
  }

  clearFieldError(field);
  return { valid: true, message: '' };
}

/**
 * Validate all required fields in a form.
 * @param {HTMLFormElement} form
 * @returns {boolean} true if all fields pass
 */
function validateForm(form) {
  const fields = form.querySelectorAll('input, select, textarea');
  let allValid = true;

  fields.forEach((field) => {
    if (!field.id || !fieldRules[field.id]) return; // skip optional / unnamed
    const result = validateField(field);
    if (!result.valid) allValid = false;
  });

  return allValid;
}

/* ============================================================
   REAL-TIME VALIDATION SETUP
   ============================================================ */

/**
 * Attach real-time validation listeners to all form fields.
 * - blur  → always validate (first touch)
 * - input → validate only after the field has been touched (blurred once)
 * @param {HTMLFormElement} form
 */
function setupRealtimeValidation(form) {
  const fields = form.querySelectorAll('input, select, textarea');

  fields.forEach((field) => {
    if (!field.id || !fieldRules[field.id]) return;

    // Track whether the user has interacted with this field
    field.dataset.touched = 'false';

    field.addEventListener('blur', () => {
      field.dataset.touched = 'true';
      validateField(field);
    });

    field.addEventListener('input', () => {
      if (field.dataset.touched === 'true') {
        validateField(field);
      }
      // Update .has-value for floating label
      updateHasValue(field);
    });

    field.addEventListener('change', () => {
      if (field.dataset.touched === 'true') {
        validateField(field);
      }
      updateHasValue(field);
    });
  });
}

/* ============================================================
   FLOATING LABEL / HAS-VALUE CLASS
   ============================================================ */

/**
 * Toggle .has-value class so CSS can float the label above the field.
 * @param {HTMLElement} field
 */
function updateHasValue(field) {
  if (field.value && field.value.trim() !== '') {
    field.classList.add('has-value');
  } else {
    field.classList.remove('has-value');
  }
}

/**
 * Initialise floating labels for every field in a form.
 * @param {HTMLFormElement} form
 */
function setupFloatingLabels(form) {
  const fields = form.querySelectorAll('input, select, textarea');

  fields.forEach((field) => {
    updateHasValue(field);

    field.addEventListener('focus', () => {
      const group = field.closest('.form-group');
      if (group) group.classList.add('focused');
    });

    field.addEventListener('blur', () => {
      const group = field.closest('.form-group');
      if (group) group.classList.remove('focused');
      updateHasValue(field);
    });
  });
}

/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

/**
 * Attach a live character counter below a textarea.
 * @param {HTMLTextAreaElement} textarea
 * @param {number} maxChars
 */
function setupCharCounter(textarea, maxChars) {
  if (!textarea) return;

  // Create counter element
  const counter = document.createElement('span');
  counter.className = 'char-counter';
  counter.setAttribute('aria-live', 'polite');

  const group = textarea.closest('.form-group') || textarea.parentElement;
  group.appendChild(counter);

  const update = () => {
    const len  = textarea.value.length;
    counter.textContent = `${len} / ${maxChars} characters`;
    counter.classList.toggle('char-counter--near', len >= maxChars * 0.85);
    counter.classList.toggle('char-counter--over',  len > maxChars);

    // Soft-enforce the limit
    if (len > maxChars) {
      textarea.value = textarea.value.substring(0, maxChars);
      counter.textContent = `${maxChars} / ${maxChars} characters`;
    }
  };

  textarea.addEventListener('input', update);
  update(); // initialise on load
}

/* ============================================================
   PHONE NUMBER FORMATTER
   ============================================================ */

/**
 * Auto-format a phone input as the user types: +91 XXXXX XXXXX
 * Raw digits (without country code) are stored in field.dataset.rawPhone.
 * @param {HTMLInputElement} phoneInput
 */
function setupPhoneFormatter(phoneInput) {
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    // Strip everything except digits
    let digits = phoneInput.value.replace(/\D/g, '');

    // Remove leading 91 if user typed country code
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    }

    // Limit to 10 digits
    digits = digits.substring(0, 10);

    // Store raw for validation
    phoneInput.dataset.rawPhone = digits;

    // Format display: XXXXX XXXXX
    if (digits.length === 0) {
      phoneInput.value = '';
    } else if (digits.length <= 5) {
      phoneInput.value = `+91 ${digits}`;
    } else {
      phoneInput.value = `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
    }

    // Keep cursor at end
    const len = phoneInput.value.length;
    phoneInput.setSelectionRange(len, len);
  });

  // On form submit we validate against rawPhone — patch value temporarily
  const form = phoneInput.closest('form');
  if (form) {
    form.addEventListener('submit', () => {
      if (phoneInput.dataset.rawPhone) {
        phoneInput.dataset.formattedValue = phoneInput.value;
        phoneInput.value = phoneInput.dataset.rawPhone;
      }
    }, true); // capture phase — runs before submit handler
  }
}

/* ============================================================
   DATE FIELD SETUP
   ============================================================ */

/**
 * Configure a date input:
 * - min  = tomorrow
 * - max  = today + 2 years
 * - Warn if selected date is < 7 days away
 * @param {HTMLInputElement} dateInput
 */
function setupDateField(dateInput) {
  if (!dateInput) return;

  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const maxDate  = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 2);

  dateInput.min = tomorrow.toISOString().split('T')[0];
  dateInput.max = maxDate.toISOString().split('T')[0];

  dateInput.addEventListener('change', () => {
    const selected = new Date(dateInput.value);
    const daysAway = Math.ceil((selected - today) / (1000 * 60 * 60 * 24));

    // Remove any existing warning
    const group = dateInput.closest('.form-group') || dateInput.parentElement;
    let warning = group.querySelector('.date-warning');

    if (daysAway > 0 && daysAway < 7) {
      if (!warning) {
        warning = document.createElement('span');
        warning.className = 'date-warning';
        group.appendChild(warning);
      }
      warning.textContent = "⚠️ Short notice! We'll check availability.";
      warning.style.display = 'block';
    } else if (warning) {
      warning.style.display = 'none';
    }
  });
}

/* ============================================================
   WHATSAPP LINKS
   ============================================================ */

/**
 * Inject WhatsApp href into every .whatsapp-link element on the page.
 */
function setupWhatsAppLinks() {
  const encoded  = encodeURIComponent(WHATSAPP_MESSAGE);
  const cleanNum = WHATSAPP_NUMBER.replace(/\D/g, ''); // digits only
  const href     = `https://wa.me/${cleanNum}?text=${encoded}`;

  document.querySelectorAll('.whatsapp-link').forEach((link) => {
    link.href   = href;
    link.target = '_blank';
    link.rel    = 'noopener noreferrer';
  });
}

/* ============================================================
   BOOKING MODAL — OPEN / CLOSE
   ============================================================ */

/**
 * Open the booking modal, optionally pre-filling event type and package.
 * Exposed on window so HTML onclick attributes can call it.
 *
 * @param {string} [eventType]   — value to pre-select in #booking-event-category
 * @param {string} [packageName] — value to pre-select in #booking-package
 */
window.openBookingModal = function openBookingModal(eventType, packageName) {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // Pre-fill event category
  if (eventType) {
    const catSelect = document.getElementById('booking-event-category');
    if (catSelect) {
      catSelect.value = eventType;
      updateHasValue(catSelect);
    }
  }

  // Pre-fill package
  if (packageName) {
    const pkgSelect = document.getElementById('booking-package');
    if (pkgSelect) {
      pkgSelect.value = packageName;
      updateHasValue(pkgSelect);
    }
  }

  // Focus first field
  const firstField = modal.querySelector('input, select, textarea');
  if (firstField) setTimeout(() => firstField.focus(), 150);
};

/**
 * Close the booking modal.
 * Exposed on window so HTML onclick attributes can call it.
 */
window.closeBookingModal = function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

/* ============================================================
   CONTACT FORM SUBMISSION
   ============================================================ */

/**
 * Wire up the contact form submit handler.
 * @param {HTMLFormElement} form
 */
function setupContactForm(form) {
  if (!form) return;

  const submitBtn    = form.querySelector('#contact-submit');
  const successDiv   = document.getElementById('contact-success') || createSuccessDiv(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Restore raw phone value if phone formatter swapped it
    restorePhoneValue(form);

    // --- Validate all fields ---
    const isValid = validateForm(form);

    if (!isValid) {
      scrollToFirstError();
      const firstErr = form.querySelector('.error');
      if (firstErr) shakeField(firstErr);
      showNotification('⚠️ Please fix the errors before submitting.', 'error');
      return;
    }

    // --- Collect values ---
    const name = form.querySelector('#contact-name')?.value.trim() || 'there';

    // --- Loading state ---
    setButtonLoading(submitBtn);

    // --- Simulate async submission ---
    setTimeout(() => {
      setButtonReset(submitBtn);
      form.reset();

      // Reset all floating label / touched states
      form.querySelectorAll('input, select, textarea').forEach((f) => {
        f.dataset.touched = 'false';
        f.classList.remove('success', 'error', 'has-value');
        const group = f.closest('.form-group');
        if (group) {
          group.classList.remove('valid', 'invalid', 'focused');
          const icon = group.querySelector('.field-icon');
          if (icon) icon.remove();
          const err = group.querySelector('.field-error');
          if (err) err.style.display = 'none';
        }
      });

      // Show success message
      successDiv.innerHTML = `
        <div class="form-success-box">
          <div class="form-success-box__icon"><i class="fa-solid fa-circle-check"></i></div>
          <h3>Thank You, ${escapeHtml(name)}!</h3>
          <p>✅ This is a demo contact form. In the live version, your message would be sent directly to our team.</p>
          <p>For immediate assistance, please <a href="tel:+919876543210">call us</a> or <a class="whatsapp-link" href="#">WhatsApp us</a>.</p>
        </div>
      `;
      successDiv.style.display = 'block';
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Refresh WhatsApp links in the new HTML
      setupWhatsAppLinks();

      showNotification('✅ Message received! We\'ll be in touch soon.', 'success');

      // Hide the success box after 10 s and restore the form
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 10000);
    }, 1500);
  });
}

/**
 * Create (or locate) a #contact-success div after the form.
 * @param {HTMLFormElement} form
 * @returns {HTMLElement}
 */
function createSuccessDiv(form) {
  let div = document.createElement('div');
  div.id = 'contact-success';
  div.style.display = 'none';
  form.after(div);
  return div;
}

/* ============================================================
   BOOKING FORM SUBMISSION
   ============================================================ */

/**
 * Wire up the booking (modal) form submit handler.
 * @param {HTMLFormElement} form
 */
function setupBookingForm(form) {
  if (!form) return;

  const submitBtn = form.querySelector('#booking-submit');
  const modalBody = form.closest('.modal__body') || form.parentElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Restore raw phone value if phone formatter swapped it
    restorePhoneValue(form);

    // --- Validate all required fields ---
    const isValid = validateForm(form);

    if (!isValid) {
      scrollToFirstError();
      const firstErr = form.querySelector('.error');
      if (firstErr) shakeField(firstErr);
      showNotification('⚠️ Please fill in all required fields correctly.', 'error');
      return;
    }

    // --- Collect values ---
    const name     = form.querySelector('#booking-name')?.value.trim()          || 'there';
    const phone    = form.querySelector('#booking-phone')?.dataset.rawPhone
                  || form.querySelector('#booking-phone')?.value.trim()          || '';
    const category = form.querySelector('#booking-event-category')?.value        || '';
    const rawDate  = form.querySelector('#booking-date')?.value                  || '';
    const dateStr  = rawDate ? formatDate(rawDate) : '';

    // --- Loading state ---
    setButtonLoading(submitBtn);

    // --- Simulate async submission ---
    setTimeout(() => {
      // Replace form content with confirmation
      const confirmHtml = `
        <div class="booking-confirmation">
          <div class="booking-confirmation__icon">
            <i class="fa-solid fa-champagne-glasses"></i>
          </div>
          <h2>🎉 Enquiry Received!</h2>
          <p class="booking-confirmation__lead">
            Thank you, <strong>${escapeHtml(name)}</strong>! We've noted your interest in
            <strong>${escapeHtml(category)}</strong> on <strong>${escapeHtml(dateStr)}</strong>.
          </p>
          <p>
            This is a <em>demo booking form</em>. Our team will contact you at
            <strong>${escapeHtml(phone)}</strong> within 24 hours to discuss details.
          </p>
          <p class="booking-confirmation__note">
            📌 Note: This enquiry does <strong>not</strong> confirm an actual booking.
          </p>
          <div id="booking-close-hint" style="display:none; margin-top:1.5rem;">
            <button type="button" class="btn btn--gold" onclick="closeBookingModal()">
              <i class="fa-solid fa-xmark"></i> Close
            </button>
          </div>
        </div>
      `;

      modalBody.innerHTML = confirmHtml;

      showNotification('🎉 Enquiry submitted! We\'ll call you within 24 hours.', 'success', 6000);

      // After 5 seconds, offer to close the modal
      setTimeout(() => {
        const closeHint = document.getElementById('booking-close-hint');
        if (closeHint) closeHint.style.display = 'block';
      }, 5000);
    }, 1500);
  });
}

/* ============================================================
   HELPER — RESTORE PHONE VALUE AFTER FORMATTER SWAP
   ============================================================ */

/**
 * The phone formatter temporarily swaps the displayed value for the raw 10-digit
 * value just before submit (capture phase). This restores the formatted display.
 * @param {HTMLFormElement} form
 */
function restorePhoneValue(form) {
  const phone = form.querySelector('input[type="tel"]');
  if (phone && phone.dataset.formattedValue) {
    phone.value = phone.dataset.formattedValue;
    delete phone.dataset.formattedValue;
  }
}

/* ============================================================
   HELPER — SAFE HTML ESCAPE
   ============================================================ */

/**
 * Escape a string for safe HTML interpolation.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/* ============================================================
   HELPER — FRIENDLY DATE FORMAT
   ============================================================ */

/**
 * Format an ISO date string (YYYY-MM-DD) to a human-readable format.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

/* ============================================================
   KEYBOARD — CLOSE MODAL ON ESC
   ============================================================ */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('bookingModal');
    if (modal && modal.classList.contains('modal--open')) {
      closeBookingModal();
    }
  }
});

/* ============================================================
   CLICK OUTSIDE MODAL TO CLOSE
   ============================================================ */

document.addEventListener('click', (e) => {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  if (modal.classList.contains('modal--open') && e.target === modal) {
    closeBookingModal();
  }
});

/* ============================================================
   GET A QUOTE BUTTONS — open modal with event type pre-fill
   ============================================================ */

/**
 * Wire up all "Get a Quote" / "Choose Package" / "View Details" buttons
 * that carry data-event-type or data-package attributes.
 */
function setupQuoteButtons() {
  // Generic "Get a Quote" buttons with optional pre-fill data
  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const eventType  = btn.dataset.eventType  || '';
      const pkgName    = btn.dataset.package     || '';
      openBookingModal(eventType, pkgName);
    });
  });

  // "Choose Package" buttons on pricing cards
  document.querySelectorAll('[data-package]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal('', btn.dataset.package);
    });
  });

  // Generic open-modal triggers that don't specify a type
  document.querySelectorAll('.open-booking-modal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });
}

/* ============================================================
   CLOSE MODAL BUTTONS
   ============================================================ */

function setupModalCloseButtons() {
  document.querySelectorAll('[data-close-modal], .modal__close').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeBookingModal();
    });
  });
}

/* ============================================================
   INLINE STYLE INJECTION
   ============================================================ */

/**
 * Inject minimal CSS needed for field-error, field-icon, char-counter,
 * date-warning, and shake animation — in case style.css is not loaded yet.
 */
function injectFormStyles() {
  const styleId = 'forms-js-styles';
  if (document.getElementById(styleId)) return;

  const css = `
    /* ---- Field error ---- */
    .field-error {
      display: block;
      color: #e53e3e;
      font-size: 0.78rem;
      margin-top: 0.25rem;
      line-height: 1.4;
    }

    /* ---- Field icons ---- */
    .field-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      pointer-events: none;
    }
    .form-group { position: relative; }
    .field-icon--success { color: #38a169; }
    .field-icon--error   { color: #e53e3e; }

    /* ---- Character counter ---- */
    .char-counter {
      display: block;
      text-align: right;
      font-size: 0.75rem;
      color: #718096;
      margin-top: 0.2rem;
    }
    .char-counter--near { color: #d69e2e; }
    .char-counter--over { color: #e53e3e; font-weight: 600; }

    /* ---- Date warning ---- */
    .date-warning {
      display: block;
      color: #c05621;
      font-size: 0.78rem;
      margin-top: 0.25rem;
    }

    /* ---- Shake animation ---- */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      15%       { transform: translateX(-8px); }
      30%       { transform: translateX(8px); }
      45%       { transform: translateX(-6px); }
      60%       { transform: translateX(6px); }
      75%       { transform: translateX(-4px); }
      90%       { transform: translateX(4px); }
    }
    .shake { animation: shake 0.45s ease; }

    /* ---- Spinner on button ---- */
    .btn.loading { opacity: 0.75; cursor: not-allowed; }

    /* ---- Notification toast ---- */
    .notification {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.85rem 1.4rem;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      max-width: 360px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      z-index: 9999;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .notification--visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .notification--success { background: #276749; color: #fff; }
    .notification--error   { background: #9b2c2c; color: #fff; }
    .notification--warning { background: #744210; color: #fff; }
    .notification--info    { background: #2b6cb0; color: #fff; }

    /* ---- Success box (contact) ---- */
    .form-success-box {
      text-align: center;
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #f0fff4, #e6fffa);
      border: 1px solid #9ae6b4;
      border-radius: 0.75rem;
    }
    .form-success-box__icon {
      font-size: 3rem;
      color: #38a169;
      margin-bottom: 0.75rem;
    }
    .form-success-box h3 {
      margin: 0 0 0.5rem;
      color: #276749;
    }
    .form-success-box p {
      color: #2d3748;
      margin: 0.4rem 0;
    }

    /* ---- Booking confirmation ---- */
    .booking-confirmation {
      text-align: center;
      padding: 2.5rem 1.5rem;
    }
    .booking-confirmation__icon {
      font-size: 3.5rem;
      color: #c9a84c;
      margin-bottom: 1rem;
    }
    .booking-confirmation h2 { margin: 0 0 1rem; }
    .booking-confirmation__lead { font-size: 1.05rem; }
    .booking-confirmation__note {
      font-size: 0.85rem;
      color: #718096;
      margin-top: 1.2rem;
    }

    /* ---- Input states ---- */
    input.success, select.success, textarea.success {
      border-color: #38a169 !important;
    }
    input.error, select.error, textarea.error {
      border-color: #e53e3e !important;
    }
  `;

  const style = document.createElement('style');
  style.id  = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

/* ============================================================
   INITIALISE EVERYTHING
   ============================================================ */

function init() {
  injectFormStyles();

  /* ---- WhatsApp links ---- */
  setupWhatsAppLinks();

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contact-form') || document.getElementById('contactForm');
  if (contactForm) {
    setupFloatingLabels(contactForm);
    setupRealtimeValidation(contactForm);
    setupPhoneFormatter(contactForm.querySelector('#contact-phone'));
    setupDateField(contactForm.querySelector('#contact-date'));
    setupCharCounter(contactForm.querySelector('#contact-message'), CHAR_LIMITS['contact-message']);
    setupContactForm(contactForm);
  }

  /* ---- Booking / Quote modal form ---- */
  const bookingForm = document.getElementById('booking-form') || document.getElementById('bookingForm');
  if (bookingForm) {
    setupFloatingLabels(bookingForm);
    setupRealtimeValidation(bookingForm);
    setupPhoneFormatter(bookingForm.querySelector('#booking-phone'));
    setupDateField(bookingForm.querySelector('#booking-date'));
    setupCharCounter(bookingForm.querySelector('#booking-requirements'), CHAR_LIMITS['booking-requirements']);
    setupBookingForm(bookingForm);
  }

  /* ---- Modal triggers & close buttons ---- */
  setupQuoteButtons();
  setupModalCloseButtons();
}

/* ============================================================
   BOOT — wait for DOM
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

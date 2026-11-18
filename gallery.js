/**
 * gallery.js
 * Handles gallery rendering, filtering, lightbox, keyboard/touch navigation
 * for the Event Management Website.
 */

'use strict';

// ─────────────────────────────────────────────
// 1. GALLERY DATA
// ─────────────────────────────────────────────
const galleryData = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', category: 'wedding',     caption: 'Royal Wedding Decoration' },
  { src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', category: 'wedding',     caption: 'Floral Wedding Arch & Mandap' },
  { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80', category: 'wedding',     caption: 'Grand Ballroom Wedding Reception' },
  { src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80', category: 'birthday',    caption: 'Birthday Balloon & Cake Setup' },
  { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80', category: 'birthday',    caption: 'Golden Jubilee Birthday Theme' },
  { src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80', category: 'birthday',    caption: 'Vibrant Fiesta Celebration' },
  { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', category: 'stage',       caption: 'Grand Stage & Lighting Design' },
  { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', category: 'stage',       caption: 'Dramatic Concert Stage Lighting' },
  { src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80', category: 'stage',       caption: 'LED Backdrop & Performance Stage' },
  { src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', category: 'engagement',  caption: 'Engagement Ring Ceremony Setup' },
  { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', category: 'engagement',  caption: 'Romantic Engagement Floral Canopy' },
  { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80', category: 'engagement',  caption: 'Blush Pink Rings & Roses Setup' },
  { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', category: 'corporate',   caption: 'Corporate Annual Gala Dinner' },
  { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', category: 'corporate',   caption: 'Executive Keynote Conference' },
  { src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80', category: 'corporate',   caption: 'Annual Excellence Awards Ceremony' },
  { src: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', category: 'lighting',    caption: 'Neon & Laser Atmosphere Design' },
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', category: 'lighting',    caption: 'Crystal Chandelier & Warm Ambiance' },
  { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', category: 'lighting',    caption: 'Fairy Light Starry Night Canopy' },
  { src: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80', category: 'flowers',     caption: 'Exotic White Rose Arrangements' },
  { src: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', category: 'flowers',     caption: 'Pastel Garden Floral Centerpieces' },
  { src: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80', category: 'flowers',     caption: 'Traditional Marigold & Jasmine Florals' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80', category: 'outdoor',     caption: 'Lush Garden Reception' },
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', category: 'outdoor',     caption: 'Luxury Canopy Tent Wedding' },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', category: 'outdoor',     caption: 'Sunset Beachfront Event' },
];

// ─────────────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────────────

/** Currently visible items (updated whenever a filter is applied). */
let filteredItems = [...galleryData];

/** Index inside filteredItems that the lightbox is showing. */
let currentLightboxIndex = 0;

// Touch swipe state
let touchStartX = 0;

// ─────────────────────────────────────────────
// 3. GALLERY RENDERING
// ─────────────────────────────────────────────

/**
 * renderGallery(items)
 * Clears .gallery-grid and rebuilds it from the supplied items array.
 * Each card: div.gallery-item[data-category][data-index] > img + div.gallery-overlay
 */
function renderGallery(items) {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  grid.innerHTML = '';

  items.forEach((item, index) => {
    // Wrapper
    const card = document.createElement('div');
    card.className = 'gallery-item scroll-animate';
    card.dataset.category = item.category;
    card.dataset.index    = index;           // index into galleryData (global)

    // Image
    const img = document.createElement('img');
    img.src   = item.src;
    img.alt   = item.caption;
    img.loading = 'lazy';

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay gallery-item-overlay';

    const icon = document.createElement('i');
    icon.className = 'fas fa-search-plus';

    const caption = document.createElement('p');
    caption.className = 'caption';
    caption.textContent = item.caption;

    overlay.appendChild(icon);
    overlay.appendChild(caption);
    card.appendChild(img);
    card.appendChild(overlay);
    grid.appendChild(card);
  });

  // Re-attach per-item listeners after each render
  attachGalleryItemListeners();
}

// ─────────────────────────────────────────────
// 4. FILTER FUNCTIONALITY
// ─────────────────────────────────────────────

/**
 * initGalleryFilters()
 * Wires up every .filter-btn so clicking it activates the button and
 * calls filterGallery() with the button's data-filter value.
 */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      filterGallery(btn.dataset.filter || 'all');
    });
  });
}

/**
 * filterGallery(category)
 * Shows / hides .gallery-item elements with a smooth opacity+scale transition.
 * Updates filteredItems for lightbox navigation.
 */
function filterGallery(category) {
  const allItems = document.querySelectorAll('.gallery-item');

  if (category === 'all') {
    filteredItems = [...galleryData];
  } else {
    filteredItems = galleryData.filter(item => item.category === category);
  }

  allItems.forEach(card => {
    const matches = category === 'all' || card.dataset.category === category;

    if (matches) {
      // Bring visible
      card.style.display       = '';
      // Small delay so display change is committed before transition fires
      requestAnimationFrame(() => {
        card.style.opacity   = '1';
        card.style.transform = 'scale(1)';
        card.style.pointerEvents = 'auto';
      });
    } else {
      // Hide with transition
      card.style.opacity       = '0';
      card.style.transform     = 'scale(0.85)';
      card.style.pointerEvents = 'none';

      // Remove from layout flow after transition ends (600 ms matches CSS)
      card.addEventListener('transitionend', function hideAfterFade() {
        if (card.style.opacity === '0') {
          card.style.display = 'none';
        }
        card.removeEventListener('transitionend', hideAfterFade);
      });
    }
  });
}

// ─────────────────────────────────────────────
// 5. LIGHTBOX
// ─────────────────────────────────────────────

/**
 * openLightbox(filteredIndex)
 * Opens the #lightbox overlay and shows the item at the given index
 * within the current filteredItems array.
 */
function openLightbox(filteredIndex) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  currentLightboxIndex = filteredIndex;
  updateLightboxContent(currentLightboxIndex);

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

/**
 * closeLightbox()
 * Hides the #lightbox overlay and restores page scrolling.
 */
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * nextImage()
 * Advances to the next item in filteredItems, wrapping around.
 */
function nextImage() {
  currentLightboxIndex = (currentLightboxIndex + 1) % filteredItems.length;
  updateLightboxContent(currentLightboxIndex);
}

/**
 * prevImage()
 * Goes to the previous item in filteredItems, wrapping around.
 */
function prevImage() {
  currentLightboxIndex =
    (currentLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
  updateLightboxContent(currentLightboxIndex);
}

/**
 * updateLightboxContent(index)
 * Updates the lightbox image src, caption, and counter.
 * Shows a loading spinner while the new image loads.
 */
function updateLightboxContent(index) {
  const imgEl     = document.getElementById('lightbox-img') || document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightbox-caption') || document.getElementById('lightboxCaption');
  const counterEl = document.querySelector('.lightbox-counter') || document.getElementById('lightbox-counter') || document.getElementById('lightboxCounter');
  const lightbox  = document.getElementById('lightbox');

  if (!imgEl || !captionEl) return;

  const item = filteredItems[index];
  if (!item) return;

  // Show loading state
  lightbox && lightbox.classList.add('loading');
  imgEl.style.opacity = '0';

  // Load new image
  const tempImg = new Image();
  tempImg.src = item.src;
  tempImg.onload = () => {
    imgEl.src           = item.src;
    imgEl.alt           = item.caption;
    imgEl.style.opacity = '1';
    lightbox && lightbox.classList.remove('loading');
  };
  tempImg.onerror = () => {
    // Fallback: still set source, remove spinner
    imgEl.src           = item.src;
    imgEl.alt           = item.caption;
    imgEl.style.opacity = '1';
    lightbox && lightbox.classList.remove('loading');
  };

  // Update caption
  captionEl.textContent = item.caption;

  // Update counter  e.g. "3 / 24"
  if (counterEl) {
    counterEl.textContent = `${index + 1} / ${filteredItems.length}`;
  }
}

// ─────────────────────────────────────────────
// 6. KEYBOARD NAVIGATION
// ─────────────────────────────────────────────

/**
 * handleKeyboard(e)
 * Arrow keys navigate the lightbox; Escape closes it.
 */
function handleKeyboard(e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !lightbox.classList.contains('active')) return;

  switch (e.key) {
    case 'ArrowRight': nextImage();     break;
    case 'ArrowLeft':  prevImage();     break;
    case 'Escape':     closeLightbox(); break;
  }
}

// ─────────────────────────────────────────────
// 7. TOUCH SWIPE
// ─────────────────────────────────────────────

/**
 * handleTouchStart(e)
 * Records the X position where the swipe begins.
 */
function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX;
}

/**
 * handleTouchEnd(e)
 * Calculates swipe delta and navigates if threshold is met.
 */
function handleTouchEnd(e) {
  const deltaX = e.changedTouches[0].clientX - touchStartX;

  if (deltaX > 50) {
    prevImage();          // Swiped right → previous
  } else if (deltaX < -50) {
    nextImage();          // Swiped left  → next
  }
}

// ─────────────────────────────────────────────
// 8. LIGHTBOX BACKDROP CLICK
// ─────────────────────────────────────────────

/**
 * handleLightboxBackdropClick(e)
 * Closes the lightbox when the user clicks the dark backdrop
 * (anywhere outside the actual image).
 */
function handleLightboxBackdropClick(e) {
  const lightboxImg = document.getElementById('lightbox-img');
  if (lightboxImg && !lightboxImg.contains(e.target)) {
    closeLightbox();
  }
}

// ─────────────────────────────────────────────
// 9. GALLERY HOVER EFFECT (JS reinforcement)
// ─────────────────────────────────────────────

/**
 * attachGalleryItemListeners()
 * Called after every renderGallery() call.
 * Wires:
 *   - mouseenter / mouseleave  → overlay visibility
 *   - click                    → openLightbox at correct filteredItems index
 */
function attachGalleryItemListeners() {
  const cards = document.querySelectorAll('.gallery-item');

  cards.forEach(card => {
    const overlay = card.querySelector('.gallery-overlay');

    // Hover reinforcement
    card.addEventListener('mouseenter', () => {
      if (overlay) overlay.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      if (overlay) overlay.style.opacity = '';
    });

    // Click → open lightbox at this item's position in filteredItems
    card.addEventListener('click', () => {
      const globalIndex = parseInt(card.dataset.index, 10);
      const item        = galleryData[globalIndex];
      if (!item) return;

      // Find where this item sits in the current filteredItems
      const filteredIndex = filteredItems.findIndex(fi => fi === item);
      if (filteredIndex !== -1) {
        openLightbox(filteredIndex);
      }
    });
  });
}

// ─────────────────────────────────────────────
// 10. LIGHTBOX BUTTON WIRING
// ─────────────────────────────────────────────

/**
 * initLightboxControls()
 * Attaches event listeners to the static lightbox control elements.
 */
function initLightboxControls() {
  const lightbox  = document.getElementById('lightbox');
  const closeBtn  = document.querySelector('.lightbox-close');
  const prevBtn   = document.querySelector('.lightbox-prev');
  const nextBtn   = document.querySelector('.lightbox-next');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click',  prevImage);
  if (nextBtn)  nextBtn.addEventListener('click',  nextImage);

  // Backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', handleLightboxBackdropClick);

    // Touch swipe inside lightbox
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend',   handleTouchEnd,   { passive: true });
  }

  // Global keyboard handler
  document.addEventListener('keydown', handleKeyboard);
}

// ─────────────────────────────────────────────
// 11. INIT ON DOM READY
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Build the gallery grid with all items
  renderGallery(galleryData);

  // Wire up filter buttons
  initGalleryFilters();

  // Wire up lightbox controls (close, prev, next, keyboard, touch, backdrop)
  initLightboxControls();

  // Ensure the "all" filter button starts active
  const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) allBtn.classList.add('active');
});

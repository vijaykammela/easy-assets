/* ==========================================================================
   EasyAssets — script.js
   Vanilla JS only. Three independent features, each safe to run on any
   page (they no-op if their markup isn't present):
     1. Mobile nav toggle
     2. Lazy-loading images (asset thumbnails)
     3. Client-side search/filter on category (gallery) pages
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  setYear();
  initNavToggle();
  initLazyLoad();
  initSearchFilter();
});

/* ---- Footer year -------------------------------------------------------- */
function setYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- 1. Mobile nav toggle ------------------------------------------------ */
function initNavToggle() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when a link is tapped (mobile)
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---- 2. Lazy-loading images ----------------------------------------------
   Thumbnails use <img data-src="..."> instead of src, plus loading="lazy"
   as a native fallback. IntersectionObserver swaps data-src -> src when
   the thumbnail nears the viewport. */
function initLazyLoad() {
  var images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: just load everything immediately
    images.forEach(loadImage);
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  images.forEach(function (img) { observer.observe(img); });

  function loadImage(img) {
    img.src = img.getAttribute('data-src');
    img.addEventListener('load', function () {
      img.classList.add('is-loaded');
    });
  }
}

/* ---- 3. Search / filter on gallery pages ---------------------------------
   Expects:
     <input id="assetSearch">
     <div class="asset-grid"> ... <div class="asset-card" data-title="..."> ...
     <p id="resultCount">
     <p class="no-results" id="noResults">
   Filters by the card's data-title attribute (falls back to the card's
   .asset-title text if data-title is missing). */
function initSearchFilter() {
  var input = document.getElementById('assetSearch');
  var grid = document.querySelector('.asset-grid');
  if (!input || !grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.asset-card'));
  var resultCount = document.getElementById('resultCount');
  var noResults = document.getElementById('noResults');

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') ||
                   (card.querySelector('.asset-title') || {}).textContent ||
                   '').toLowerCase();
      var matches = title.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matches);
      if (matches) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = visibleCount + (visibleCount === 1 ? ' asset' : ' assets');
    }
    if (noResults) {
      noResults.classList.toggle('is-visible', visibleCount === 0);
    }
  });
}

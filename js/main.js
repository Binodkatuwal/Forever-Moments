
// ─── SPA ROUTING ─────
let currentPage = 'home';
let slideIdx = 0;
let slideTimer;
let countersRun = false;
let galleryBuilt = false;

function showPage(pageId) {
  const homeOnlyRoutes = ['Book', 'elopement', 'classic', 'luxury', 'travel'];
  if (homeOnlyRoutes.includes(pageId)) pageId = 'home';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0 });
  }
  currentPage = pageId;
  document.body.dataset.page = pageId;

  // Update nav active state
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  // Close mobile menu
  document.getElementById('mobile-menu')?.classList.remove('open');

  // Re-init reveals for new page
  setTimeout(initReveal, 50);

  // Build gallery on first visit
  if (pageId === 'gallery' && !galleryBuilt) {
    buildGallery();
    galleryBuilt = true;
  }

  // Run counters on home
  if (pageId === 'home' && !countersRun) {
    setTimeout(initCounters, 800);
    countersRun = true;
  }
}

// Intercept all nav link clicks
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-nav]');
  if (!a) return;
  e.preventDefault();
  showPage(a.dataset.nav);
});

// ─── LOADER ─────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.remove();
    }, 900);
  }, 1100);
  // Set process photo
  const procImg = document.getElementById('process-img');
  if (procImg) procImg.src = IMG.process;
  // Set detail photos
  setDetailImages();
});

// ─── DETAIL PAGE IMAGES ──────────────────────────────────
function setDetailImages() {
  const setImg = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };
  setImg('img-elopement-hero', IMG.elopement);
  setImg('img-classic-hero',   IMG.classic);
  setImg('img-luxury-hero',    IMG.luxury);
  setImg('img-travel-hero',    IMG.travel);
  IMG.elopementDetail.forEach((src, i) => setImg('img-elop-' + i, src));
  IMG.classicDetail.forEach((src,   i) => setImg('img-cls-'  + i, src));
  IMG.luxuryDetail.forEach((src,    i) => setImg('img-lux-'  + i, src));
  IMG.travelDetail.forEach((src,    i) => setImg('img-trv-'  + i, src));
}

// ─── CURSOR ─────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animateCursor() {
  if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }
  if (ring) {
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ─── NAV SCROLL ─────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('main-nav')?.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── HAMBURGER ─────────────────────────────
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('open');
});

// ─── PETALS ──────────────────────────────
(function buildPetals() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const sz = 6 + Math.random() * 14;
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*40}%;animation-delay:${Math.random()*12}s;animation-duration:${10+Math.random()*14}s;`;
    p.innerHTML = `<div style="width:${sz}px;height:${sz*1.4}px"></div>`;
    hero.appendChild(p);
  }
})();

// ─── COUNTERS ────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = +el.dataset.count;
    let cur = 0;
    const step = target / 60;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur) + (target >= 100 ? '+' : target === 95 ? '%' : '+');
      if (cur >= target) clearInterval(t);
    }, 18);
  });
}

// ─── INTERSECTION REVEAL ────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

const processObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 140);
      processObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

function initReveal() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObs.observe(el));
    document.querySelectorAll('.reveal-left:not(.visible)').forEach(el => revealObs.observe(el));
    document.querySelectorAll('.process-step:not(.visible)').forEach(el => processObs.observe(el));
  });
}
initReveal();

// ─── TESTIMONIAL SLIDER ──────────────────
const testimonialTrack  = document.getElementById('test-track');
const testimonialSlides = testimonialTrack ? [...testimonialTrack.querySelectorAll('.testimonial')] : [];
const testimonialDots   = [...document.querySelectorAll('[data-slide]')];

function startSlideTimer() {
  if (!testimonialTrack || testimonialSlides.length <= 1) return;
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goSlide(slideIdx + 1, false), 5000);
}

function goSlide(n, shouldRestart = true) {
  if (!testimonialTrack || !testimonialSlides.length) return;
  slideIdx = (n + testimonialSlides.length) % testimonialSlides.length;
  testimonialTrack.style.transform = `translateX(-${slideIdx * 100}%)`;
  testimonialDots.forEach((d, i) => {
    d.classList.toggle('active', i === slideIdx);
    d.setAttribute('aria-current', i === slideIdx ? 'true' : 'false');
  });
  if (shouldRestart) startSlideTimer();
}

if (testimonialTrack) { goSlide(0, false); startSlideTimer(); }
testimonialDots.forEach(btn => btn.addEventListener('click', () => goSlide(Number(btn.dataset.slide))));

// ─── GALLERY BUILD ─────────────────────
const galleryLabels = [
  'Riverside Elegance','Urban Chic','Garden Romance','Vintage Glam','Château Dreams',
  'Forest Ceremony','Coastal Love','Boho Bliss','City Lights','Golden Hour Vows',
  'Reception Glow','Ceremony Details','Floral Poetry','Candlelit Dinner','First Dance',
  'Bridal Portrait','Champagne Toast','Garden Tablescape','Quiet Moments','Grand Entrance',
  'Family Celebration','Evening Romance','Signature Styling','Lasting Memories',
];

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid || grid.children.length) return;
  IMG.gallery.forEach((src, i) => {
    const cell = document.createElement('div');
    cell.className = 'g-cell';
    cell.innerHTML = `
      <img src="${src}" alt="${galleryLabels[i]}" loading="${i < 6 ? 'eager' : 'lazy'}">
      <div class="g-cell-overlay"><span class="g-cell-label">${galleryLabels[i]}</span></div>
    `;
    grid.appendChild(cell);
  });
}

// ─── CONTACT FORM ────────────────────────────
document.querySelector('[data-contact-form]')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('form-success').style.display = 'block';
});

// ─── Book FORM ─────────────────────────
document.querySelector('[data-Book-form]')?.addEventListener('submit', e => {
  e.preventDefault();

  const popup = document.getElementById('Book-popup');
  popup.classList.add('show');

  e.target.reset();
});

document.addEventListener('click', function(e){
  if(e.target && e.target.id === 'popup-close-btn'){
    const popup = document.getElementById('Book-popup');

    popup.classList.remove('show');

    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
});

document.getElementById('Book-popup')?.addEventListener('click', (e) => {
  if (e.target.id === 'Book-popup') {
    e.currentTarget.classList.remove('show');
  }
});

// ─── DEMO PANEL TOGGLE ──────────────────
document.querySelectorAll('.topic-banner[data-demo]').forEach(banner => {
  banner.addEventListener('click', () => {
    const targetId = banner.dataset.demo;
    const panel = document.getElementById(targetId);
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    // Close all panels first
    document.querySelectorAll('.demo-panel.open').forEach(p => p.classList.remove('open'));
    // Toggle the clicked one
    if (!isOpen) {
      panel.classList.add('open');
      setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  });
});

const yr = new Date().getFullYear();
document.querySelectorAll('.footer-year').forEach(el => el.textContent = yr);

// ─── INITIAL PAGE ───────────────────────────
showPage('home');

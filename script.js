// Fade-up on scroll
const faders = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); } });
}, { threshold: .15 });
faders.forEach(f => io.observe(f));

// Portfolio filter + "View More" pagination (8 shown at a time per filter)
const filterBtns = document.querySelectorAll('.filter-btn');
const portCards = document.querySelectorAll('.port-card');
const viewMoreBtn = document.getElementById('viewMoreBtn');
const PAGE_SIZE = 8;
let activeFilter = 'all';
let visibleCount = PAGE_SIZE;

function getMatching(filter) {
  return Array.from(portCards).filter(card => {
    const cats = (card.dataset.cat || '').split(' ');
    return filter === 'all' || cats.indexOf(filter) !== -1;
  });
}

function renderPortfolio() {
  const matching = getMatching(activeFilter);
  portCards.forEach(card => card.classList.add('hidden-cat'));
  matching.slice(0, visibleCount).forEach(card => card.classList.remove('hidden-cat'));
  if (viewMoreBtn) {
    viewMoreBtn.classList.toggle('hidden', matching.length <= visibleCount);
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => { b.classList.remove('active', 'bg-brandOrange-500'); b.classList.add('bg-purple-800/60', 'text-purple-100'); });
    btn.classList.add('active', 'bg-brandOrange-500'); btn.classList.remove('bg-purple-800/60', 'text-purple-100');
    activeFilter = btn.dataset.filter;
    visibleCount = PAGE_SIZE;
    renderPortfolio();
  });
});

if (viewMoreBtn) {
  viewMoreBtn.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderPortfolio();
  });
}

renderPortfolio();

// Lightbox
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
portCards.forEach(card => {
  card.addEventListener('click', () => {
    const src = card.querySelector('img').getAttribute('src');
    const alt = card.querySelector('img').getAttribute('alt');
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxImg').alt = alt;
    document.getElementById('lightbox').classList.add('open');
  });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Before/After slider (only runs if the section exists on this page)
const baWrap = document.querySelector('.ba-wrap');
if (baWrap) {
  const baAfter = document.getElementById('baAfter');
  const baHandle = document.getElementById('baHandle');
  let dragging = false;
  function setBA(x) {
    const rect = baWrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    baAfter.style.width = pct + '%';
    baHandle.style.left = pct + '%';
  }
  baHandle.addEventListener('mousedown', () => dragging = true);
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('mousemove', e => { if (dragging) setBA(e.clientX); });
  baHandle.addEventListener('touchstart', () => dragging = true);
  window.addEventListener('touchend', () => dragging = false);
  window.addEventListener('touchmove', e => { if (dragging && e.touches[0]) setBA(e.touches[0].clientX); });
}

// Quote form -> Netlify Forms (email notification) + WhatsApp (fast reply)
// Works unchanged on every niche page since it reads the WhatsApp number
// and page slug from the form's own data attributes.
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const waNumber = this.dataset.waNumber;
    const submitBtn = document.getElementById('quoteSubmitBtn');
    const status = document.getElementById('formStatus');
    const d = new FormData(this);

    // Build the WhatsApp message
    const msg = `Hi, I'd like a quote.%0A%0A` +
      `Name: ${d.get('name') || ''}%0ACompany/Org: ${d.get('company') || ''}%0APhone: ${d.get('phone') || ''}%0A` +
      `Email: ${d.get('email') || ''}%0ACountry: ${d.get('country') || ''}%0AService: ${d.get('service') || ''}%0A` +
      `Project: ${d.get('project') || ''}%0ANeeded By: ${d.get('date') || ''}%0ADetails: ${d.get('details') || ''}`;

    // Encode the form data the way Netlify Forms expects (application/x-www-form-urlencoded)
    const encode = (data) => {
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) params.append(key, value);
      return params.toString();
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(d)
    })
      .then(() => {
        if (status) {
          status.textContent = "Sent! Opening WhatsApp so we can reply fast...";
          status.classList.remove('hidden', 'text-red-600');
          status.classList.add('text-green-600');
        }
      })
      .catch(() => {
        // Even if the Netlify submission fails (e.g. running locally, not yet deployed),
        // still open WhatsApp so the person isn't blocked from reaching us.
        if (status) {
          status.textContent = "Opening WhatsApp with your details...";
          status.classList.remove('hidden');
        }
      })
      .finally(() => {
        window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit & Send to WhatsApp'; }
        this.reset();
      });
  });
}

// Exit intent
let exitShown = false;
document.addEventListener('mouseleave', e => {
  if (e.clientY < 0 && !exitShown) {
    exitShown = true;
    document.getElementById('exitModal').classList.remove('hidden');
    document.getElementById('exitModal').classList.add('flex');
  }
});
function closeExitModal() {
  document.getElementById('exitModal').classList.add('hidden');
  document.getElementById('exitModal').classList.remove('flex');
}

// Star rating input (used in the Client Reviews section)
const starBtns = document.querySelectorAll('#starRating .star-btn');
const ratingInput = document.getElementById('ratingInput');
if (starBtns.length && ratingInput) {
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value, 10);
      ratingInput.value = val;
      starBtns.forEach(b => {
        const active = parseInt(b.dataset.value, 10) <= val;
        b.style.color = active ? '#f15a22' : '';
      });
    });
  });
}

// Review submission -> Netlify Forms (moderated before publishing)
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('reviewSubmitBtn');
    const status = document.getElementById('reviewFormStatus');
    if (!ratingInput.value) {
      if (status) {
        status.textContent = 'Please select a star rating before submitting.';
        status.classList.remove('hidden');
        status.classList.add('text-red-600');
      }
      return;
    }
    const d = new FormData(this);
    const encode = (data) => {
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) params.append(key, value);
      return params.toString();
    };
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(d)
    })
      .then(() => {
        if (status) {
          status.textContent = 'Thank you! Your review has been sent for approval.';
          status.classList.remove('hidden', 'text-red-600');
          status.classList.add('text-green-600');
        }
        reviewForm.reset();
        starBtns.forEach(b => { b.style.color = ''; });
      })
      .catch(() => {
        if (status) {
          status.textContent = 'Something went wrong — please try again or message us on WhatsApp.';
          status.classList.remove('hidden');
          status.classList.add('text-red-600');
        }
      })
      .finally(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Review'; }
      });
  });
}

// Back to top button
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 500;
    backToTop.classList.toggle('opacity-0', !show);
    backToTop.classList.toggle('pointer-events-none', !show);
    backToTop.classList.toggle('translate-y-2', !show);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===================== GLOBAL CONFIG =====================
const RKV = {
  whatsapp: "https://wa.me/917837897701",
  phone: "+917837897701",
  email: "rakesh8972@gmail.com"
};

// ===================== ANALYTICS (safe stub) =====================
// Modular event utility. Never sends personal form data (email/phone/message).
function trackEvent(name, params) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', name, params || {});
    }
  } catch (e) {
    // analytics must never break the site
  }
}

// ===================== NAV TOGGLE =====================
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      trackEvent('navigation_click', { link: a.textContent.trim() });
    }));
  }

  // Logo click -> home, or scroll to top if already home
  document.querySelectorAll('.brand').forEach(logo => {
    logo.addEventListener('click', (e) => {
      const onHome = /(^|\/)index\.html$|\/$/.test(window.location.pathname) || window.location.pathname === '';
      if (onHome) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // WhatsApp CTA tracking (all wa.me links)
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('whatsapp_click', {}));
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('phone_click', {}));
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('email_click', {}));
  });
  document.querySelectorAll('.social-chip, .footer-social a').forEach(a => {
    a.addEventListener('click', () => trackEvent('social_click', { url: a.href }));
  });

  // Trial / Consultation CTA tracking + preselect + cross-page navigation
  document.querySelectorAll('[data-cta="trial"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('trial_cta_click', {}));
  });
  document.querySelectorAll('[data-cta="consultation"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('consultation_cta_click', {}));
  });

  // Package selection CTAs: store selection, then navigate to how-to-start.html#booking
  document.querySelectorAll('[data-package-cta]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = btn.getAttribute('data-service') || '';
      const pkg = btn.getAttribute('data-package') || '';
      try {
        sessionStorage.setItem('rkv_service', service);
        sessionStorage.setItem('rkv_package', pkg);
      } catch (err) {}
      trackEvent('package_selected', { service, package: pkg });
    });
  });

  // Hero image click -> consultation form
  document.querySelectorAll('.portrait-frame[data-cta="consultation"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('consultation_cta_click', { source: 'hero_image' });
    });
  });

  // ===================== FAQ ACCORDION =====================
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      // close all others (single-open accordion)
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.setAttribute('data-open', String(!isOpen));
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
      if (!isOpen) trackEvent('faq_open', { question: q.textContent.trim() });
    });
  });

  // ===================== CATEGORY NAV (services page) =====================
  const catLinks = document.querySelectorAll('.cat-nav a');
  if (catLinks.length) {
    const sections = Array.from(catLinks).map(l => document.querySelector(l.getAttribute('href')));
    const setActive = (id) => {
      catLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    };
    catLinks.forEach(l => l.addEventListener('click', () => setActive(l.getAttribute('href').slice(1))));
    if ('IntersectionObserver' in window) {
      const catIo = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-40% 0px -50% 0px' });
      sections.forEach(s => { if (s) catIo.observe(s); });
    }
  }

  // ===================== CONSULTATION FORM =====================
  const form = document.getElementById('leadForm');
  if (form) {
    const formSuccess = document.getElementById('formSuccess');
    const formErrorEl = document.getElementById('formError');
    const waFallback = document.getElementById('waFallback');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    let submitting = false;

    // Preselect from package CTA (sessionStorage)
    try {
      const svc = sessionStorage.getItem('rkv_service');
      const pkg = sessionStorage.getItem('rkv_package');
      const serviceSel = document.getElementById('serviceInterest');
      const pkgSel = document.getElementById('packageSelect');
      if (svc && serviceSel) serviceSel.value = svc;
      if (pkg && pkgSel) pkgSel.value = pkg;
    } catch (e) {}

    trackEvent('consultation_form_start', {});

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitting) return;
      if (formErrorEl) formErrorEl.classList.remove('show');

      const nameField = document.getElementById('f-name');
      const businessField = document.getElementById('f-business');
      const contactField = document.getElementById('f-contact');
      const serviceField = document.getElementById('f-service');

      const name = document.getElementById('fullName').value.trim();
      const business = document.getElementById('businessName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const service = document.getElementById('serviceInterest').value;

      let valid = true;
      nameField.classList.toggle('invalid', !name); if (!name) valid = false;
      businessField.classList.toggle('invalid', !business); if (!business) valid = false;

      const emailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneValid = phone === '' || /^[0-9+\-\s]{7,15}$/.test(phone);
      const hasContact = (email && emailValid) || (phone && phoneValid);
      contactField.classList.toggle('invalid', !hasContact); if (!hasContact) valid = false;

      serviceField.classList.toggle('invalid', !service); if (!service) valid = false;

      if (!valid) {
        const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitting = true;
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      const industry = document.getElementById('industry') ? document.getElementById('industry').value : '';
      const pkg = document.getElementById('packageSelect') ? document.getElementById('packageSelect').value : '';
      const stage = document.getElementById('businessStage') ? document.getElementById('businessStage').value : '';
      const objective = document.getElementById('objective') ? document.getElementById('objective').value.trim() : '';
      const budget = document.getElementById('budget') ? document.getElementById('budget').value : '';
      const contactMethod = document.getElementById('contactMethod') ? document.getElementById('contactMethod').value : '';
      const message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

      const lines = [
        `Hello Rakesh, I'd like to book a consultation.`,
        `Name: ${name}`,
        `Business: ${business}`,
        email ? `Email: ${email}` : null,
        phone ? `Phone/WhatsApp: ${phone}` : null,
        industry ? `Industry: ${industry}` : null,
        service ? `Service Interest: ${service}` : null,
        pkg ? `Package: ${pkg}` : null,
        stage ? `Business Stage: ${stage}` : null,
        objective ? `Objective: ${objective}` : null,
        budget ? `Budget Range: ${budget}` : null,
        contactMethod ? `Preferred Contact: ${contactMethod}` : null,
        message ? `Message: ${message}` : null
      ].filter(Boolean).join('\n');

      const waLink = `${RKV.whatsapp}?text=${encodeURIComponent(lines)}`;
      if (waFallback) waFallback.href = waLink;

      // No real backend is configured yet; this is integration-ready.
      // We hand off to WhatsApp as the working submission path and show success
      // only because the WhatsApp handoff itself is the actual "submission."
      setTimeout(() => {
        try {
          form.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('show');
          trackEvent('consultation_form_submit', { service });
          window.open(waLink, '_blank');
        } catch (err) {
          submitBtn.textContent = 'Book My Consultation';
          submitBtn.disabled = false;
          submitting = false;
          if (formErrorEl) formErrorEl.classList.add('show');
        }
      }, 500);
    });

    if (tryAgainBtn) {
      tryAgainBtn.addEventListener('click', () => {
        if (formErrorEl) formErrorEl.classList.remove('show');
        form.style.display = '';
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = 'Book My Consultation';
        submitBtn.disabled = false;
      });
    }
  }

  // Service -> Package dynamic filtering on how-to-start.html
  const serviceSelect = document.getElementById('serviceInterest');
  const packageSelect = document.getElementById('packageSelect');
  if (serviceSelect && packageSelect) {
    const packageMap = {
      "Ads Management": ["Not Sure — Recommend a Package", "Ads Management — Starter", "Ads Management — Full"],
      "Complete Growth Package": ["Not Sure — Recommend a Package", "Complete Growth", "AI-Powered Growth", "Custom Digital Marketing Package"],
      "YouTube Marketing": ["Not Sure — Recommend a Package", "YouTube Launch", "YouTube Grow", "YouTube Authority"],
      "LinkedIn Sales & Marketing": ["Not Sure — Recommend a Package", "LinkedIn Sales Funnel Starter", "LinkedIn Ads Starter", "LinkedIn Growth System"],
      "Other / Custom Requirement": ["Not Sure — Recommend a Package"]
    };
    function rebuildPackages(selectedPkg) {
      const svc = serviceSelect.value;
      const options = packageMap[svc] || ["Not Sure — Recommend a Package"];
      packageSelect.innerHTML = '';
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        packageSelect.appendChild(o);
      });
      if (selectedPkg && options.includes(selectedPkg)) {
        packageSelect.value = selectedPkg;
      }
    }
    serviceSelect.addEventListener('change', () => rebuildPackages());
    // initial build honoring any preselected package from sessionStorage
    let preselectedPkg = null;
    try { preselectedPkg = sessionStorage.getItem('rkv_package'); } catch (e) {}
    rebuildPackages(preselectedPkg);
  }

  // page_view
  trackEvent('page_view', { path: window.location.pathname });
});

document.addEventListener('DOMContentLoaded', () => {

  /* --- Header: solid background once you leave the hero ------------------ */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile navigation ------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');

  if (navToggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        navToggle.focus();
      }
    });
  }

  /* --- Reveal sections on scroll ----------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton.querySelector('.btn-label');
    const LABELS = { idle: 'Send message', sending: 'Sending…', sent: 'Message sent' };

    const setButtonState = (state) => {
      submitButton.disabled = state !== 'idle';
      submitButton.classList.toggle('is-loading', state === 'sending');
      submitButton.classList.toggle('is-sent', state === 'sent');
      submitButton.setAttribute('aria-busy', String(state === 'sending'));
      submitLabel.textContent = LABELS[state];
    };

    const setStatus = (text, { srOnly = false } = {}) => {
      status.textContent = text;
      status.classList.toggle('is-sr-only', srOnly);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const fields = ['name', 'email', 'message'].map((id) => form.elements[id]);
      let firstInvalid = null;

      fields.forEach((field) => {
        const invalid = !field.value.trim() || (field.type === 'email' && !field.checkValidity());
        field.classList.toggle('has-error', invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        setStatus('Please fill in your name, a valid email and a message.');
        firstInvalid.focus();
        return;
      }

      const captchaField = form.querySelector('[name="h-captcha-response"]');
      if (!captchaField || !captchaField.value) {
        setStatus('Please confirm you’re not a robot before sending.');
        return;
      }

      setButtonState('sending');
      setStatus('Sending…', { srOnly: true });

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.message || 'Submission rejected');

        form.reset();
        setButtonState('sent');
        setStatus('Message sent. I’ll reply soon.', { srOnly: true });
      } catch (error) {
        setButtonState('idle');
        setStatus('Something went wrong sending that. Please email pazmadeit@gmail.com directly.');
      } finally {
        if (window.hcaptcha) window.hcaptcha.reset();
      }
    });

    form.addEventListener('input', (event) => {
      event.target.classList.remove('has-error');
      setStatus('');
      if (submitButton.classList.contains('is-sent')) setButtonState('idle');
    });
  }

  /* --- Footer year -------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

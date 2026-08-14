/* --------------------------------------------------------------------------
   Paz — Atelier de couture, Genève
   Progressive enhancement only: nothing here is required to read the page.
   -------------------------------------------------------------------------- */

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

  /* --- Contact form ------------------------------------------------------
     Static site, so there is no backend. This opens the visitor's mail app
     pre-filled. To collect submissions properly instead, point the <form>
     at a service such as Formspree / Getform / Netlify Forms and delete
     this handler.
     ---------------------------------------------------------------------- */
  const CONTACT_EMAIL = 'hello@example.com';
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const fields = ['name', 'email', 'message'].map((id) => form.elements[id]);
      let firstInvalid = null;

      fields.forEach((field) => {
        const invalid = !field.value.trim() || (field.type === 'email' && !field.checkValidity());
        field.classList.toggle('has-error', invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.textContent = 'Please fill in your name, a valid email and a message.';
        firstInvalid.focus();
        return;
      }

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const subject = form.elements.subject ? form.elements.subject.value : 'Website enquiry';
      const message = form.elements.message.value.trim();

      const mailto = `mailto:${CONTACT_EMAIL}`
        + `?subject=${encodeURIComponent(`${subject} — ${name}`)}`
        + `&body=${encodeURIComponent(`${message}\n\n— ${name}\n${email}`)}`;

      window.location.href = mailto;
      status.textContent = 'Opening your email app… merci!';
      form.reset();
    });

    form.addEventListener('input', (event) => {
      event.target.classList.remove('has-error');
      status.textContent = '';
    });
  }

  /* --- Footer year -------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});

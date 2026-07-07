// js/main.js
import { calculateTimeLeft } from './countdown.js';
import { generateSeptemberCalendar } from './calendar.js';
import { validateRsvp } from './rsvp.js';

const WEDDING_DATE = new Date('2026-09-13T00:00:00');

const GOOGLE_FORM_CONFIG = {
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfVtXELpWWE0OntDWdi79mjKLW0eOqQ7ZG_FX_nS3EJVd-r-Q/formResponse',
  entryName: 'entry.788042615',      // Ім'я та прізвище
  entryAttending: 'entry.152858440', // Так / Ні
};

const ATTENDING_MAP = { yes: 'Так', no: 'Ні' };

const RSVP_RESUBMIT_GUARD_MS = 60_000;
const RSVP_LAST_SUBMIT_KEY = 'rsvpLastSubmitAt';
const RSVP_SUBMITTED_KEY = 'rsvpSubmitted';

function pad(n) {
  return String(n).padStart(2, '0');
}

function initCountdown() {
  const els = {
    days: document.getElementById('countdown-days'),
    hours: document.getElementById('countdown-hours'),
    minutes: document.getElementById('countdown-minutes'),
    seconds: document.getElementById('countdown-seconds'),
  };
  if (!els.days) return;

  function setDigit(el, value) {
    const text = pad(value);
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('countdown-tick');
    void el.offsetWidth; // restart the animation
    el.classList.add('countdown-tick');
  }

  function tick() {
    const t = calculateTimeLeft(WEDDING_DATE);
    setDigit(els.days, t.days);
    setDigit(els.hours, t.hours);
    setDigit(els.minutes, t.minutes);
    setDigit(els.seconds, t.seconds);
    if (t.ended) clearInterval(intervalId);
  }

  tick();
  const intervalId = setInterval(tick, 1000);
}

function initCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  for (const cell of generateSeptemberCalendar(2026)) {
    const el = document.createElement('div');
    el.className = 'calendar__day';
    if (cell === null) {
      el.classList.add('calendar__day--blank');
    } else if (cell.isWeddingDay) {
      el.innerHTML = `
        <div class="calendar__day--wedding-badge">
          <span class="font-heading text-sm text-cream">${cell.day}</span>
        </div>
      `;
      el.setAttribute('aria-label', '13 вересня — день весілля');
    } else {
      el.innerHTML = `<span class="text-[13.5px] text-ink">${cell.day}</span>`;
    }
    grid.appendChild(el);
  }
}

function initReveal() {
  const sections = document.querySelectorAll('[data-reveal]');
  if (!sections.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach((el) => el.classList.add('reveal--visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  sections.forEach((el) => observer.observe(el));
}

function initRsvpForm() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const nameInput = document.getElementById('rsvp-name');
  const errorsList = document.getElementById('rsvp-errors');
  const successCard = document.getElementById('rsvp-success');
  const submitBtn = document.getElementById('rsvp-submit');
  const honeypot = document.getElementById('rsvp-honeypot');
  const attendButtons = form.querySelectorAll('[data-attend]');

  let attending = null;

  function renderErrors(errors) {
    errorsList.innerHTML = '';
    const messages = Object.values(errors);
    errorsList.hidden = messages.length === 0;
    for (const message of messages) {
      const li = document.createElement('li');
      li.textContent = message;
      errorsList.appendChild(li);
    }
  }

  function showSuccess() {
    form.hidden = true;
    successCard.classList.remove('hidden');
    successCard.classList.add('flex');
    const card = successCard.querySelector(':scope > div');
    card.classList.remove('modal-pop');
    void card.offsetWidth; // restart the animation
    card.classList.add('modal-pop');
  }

  function hideSuccessModal() {
    successCard.classList.add('hidden');
    successCard.classList.remove('flex');
  }

  document.getElementById('rsvp-success-close').addEventListener('click', hideSuccessModal);
  successCard.addEventListener('click', (event) => {
    if (event.target === successCard) hideSuccessModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !successCard.classList.contains('hidden')) hideSuccessModal();
  });

  attendButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      attending = btn.dataset.attend;
      attendButtons.forEach((other) => {
        const active = other === btn;
        other.classList.toggle('attend-toggle--active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      renderErrors({});
    });
  });

  async function submitToGoogleForm(payload) {
    if (!GOOGLE_FORM_CONFIG.actionUrl) {
      console.warn('RSVP: Google Form not configured yet, submission logged locally only.', payload);
      return;
    }
    const body = new FormData();
    body.append(GOOGLE_FORM_CONFIG.entryName, payload.name);
    body.append(GOOGLE_FORM_CONFIG.entryAttending, ATTENDING_MAP[payload.attending] ?? payload.attending);
    await fetch(GOOGLE_FORM_CONFIG.actionUrl, { method: 'POST', mode: 'no-cors', body });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (honeypot.value.trim() !== '') {
      return; // silently drop bot submissions
    }

    const lastSubmitAt = Number(localStorage.getItem(RSVP_LAST_SUBMIT_KEY) || 0);
    if (Date.now() - lastSubmitAt < RSVP_RESUBMIT_GUARD_MS) {
      renderErrors({ rate: 'Відповідь уже надіслано нещодавно. Спробуйте пізніше.' });
      return;
    }

    const name = nameInput.value;
    const { valid, errors } = validateRsvp({ name, attending: attending || '' });
    renderErrors(errors);
    if (!valid) return;

    submitBtn.disabled = true;
    try {
      await submitToGoogleForm({ name, attending });
      localStorage.setItem(RSVP_LAST_SUBMIT_KEY, String(Date.now()));
      localStorage.setItem(RSVP_SUBMITTED_KEY, '1');
      showSuccess();
    } catch (e) {
      renderErrors({ net: 'Не вдалося надіслати. Перевірте інтернет і спробуйте ще раз.' });
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (localStorage.getItem(RSVP_SUBMITTED_KEY) === '1') {
    showSuccess();
  }
}

function initNav() {
  const titleLink = document.querySelector('[data-scroll-target]');
  if (!titleLink) return;
  titleLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initHeroParallax() {
  const hero = document.getElementById('hero');
  const cutout = hero?.querySelector('.hero-cutout');
  if (!hero || !cutout) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const PARALLAX_FACTOR = 0.25;
  let ticking = false;

  function update() {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    cutout.style.setProperty('--hero-parallax-y', `${(progress * rect.height * PARALLAX_FACTOR).toFixed(1)}px`);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

function initNavVisibility() {
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');
  if (!nav || !hero) return;

  if (!('IntersectionObserver' in window)) {
    nav.classList.add('nav--visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      nav.classList.toggle('nav--visible', !entry.isIntersecting);
    }
  }, { threshold: 0 });

  observer.observe(hero);
}

initCountdown();
initCalendar();
initReveal();
initRsvpForm();
initNav();
initNavVisibility();
initHeroParallax();

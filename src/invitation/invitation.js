/**
 * WEDDING INVITATION — COMPLETE JAVASCRIPT
 * Public invitation page for: Priya & Kasun
 * ─────────────────────────────────────────
 * • Loading screen → Envelope cover → Full invitation
 * • Store integration for all data
 * • RSVP form with validation
 * • Countdown timer
 * • Gallery lightbox
 * • Scroll-reveal (Intersection Observer)
 * • Background music
 * • Table finder
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
const State = {
  wedding:       null,
  guests:        [],
  rsvps:         [],
  agenda:        [],
  tables:        [],
  gallery:       [],
  settings:      null,

  // Current guest for RSVP
  currentGuest:  null,
  currentRsvp:   null,
  attendingVal:  null, // 'yes' | 'no'

  // Gallery lightbox
  lightboxImages: [],
  lightboxIndex:  0,

  // Audio
  audio:         null,
  musicPlaying:  false,
  musicMuted:    false,

  // Countdown
  countdownInterval: null,

  // URL params
  slug:          'priya-and-kasun',
  guestToken:    null,
};

/* ══════════════════════════════════════════════════════════════
   DOM HELPERS
══════════════════════════════════════════════════════════════ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showEl(el) { if (el) el.style.display = ''; }
function hideEl(el) { if (el) el.style.display = 'none'; }

/* ══════════════════════════════════════════════════════════════
   DATE FORMATTING
══════════════════════════════════════════════════════════════ */
function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const defaults = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', { ...defaults, ...opts });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* ══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error:   '❌',
    info:    '💌',
    warning: '⚠️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-text">${msg}</span>
    <button class="toast-close" aria-label="Dismiss notification">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  const close = toast.querySelector('.toast-close');
  close.addEventListener('click', () => dismissToast(toast));

  container.appendChild(toast);

  const timer = setTimeout(() => dismissToast(toast), duration);
  toast._timer = timer;
}

function dismissToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove());
}

/* ══════════════════════════════════════════════════════════════
   INITIALIZATION
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Parse URL
  parseURL();

  // Load data
  loadData();

  // Show loading screen then sequence through screens
  initLoadingScreen();
});

function parseURL() {
  const params = new URLSearchParams(window.location.search);
  State.guestToken = params.get('t') || null;

  // Slug from path or default
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // If URL has a slug segment use it, otherwise use default
  State.slug = 'priya-and-kasun';
}

function loadData() {
  // Wait for Store to be available
  if (!window.Store) {
    console.warn('Store not yet available, retrying...');
    setTimeout(loadData, 100);
    return;
  }

  State.wedding  = Store.Weddings.getBySlug(State.slug);

  if (!State.wedding) {
    // Fallback: try first wedding
    const all = Store.Weddings.getAll();
    State.wedding = all[0] || null;
  }

  if (!State.wedding) {
    console.error('No wedding data found');
    return;
  }

  const wid = State.wedding.id;
  State.guests  = Store.Guests.getAll(wid);
  State.rsvps   = Store.RSVPs.getAll(wid);
  State.agenda  = Store.Agenda.getAll(wid);
  State.tables  = Store.Tables.getAll(wid);
  State.gallery = Store.Gallery.getByType(wid, 'gallery');
  State.settings = State.wedding.siteSettings || {};

  // If token provided, look up guest
  if (State.guestToken) {
    State.currentGuest = Store.Guests.getByToken(State.guestToken);
    if (State.currentGuest) {
      State.currentRsvp = Store.RSVPs.getByGuest(State.currentGuest.id);
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════════════ */
function initLoadingScreen() {
  const loadingEl = document.getElementById('loading-screen');
  const settings = State.settings || {};

  // If loading screen is disabled, skip straight to envelope
  if (settings.showLoadingScreen === false) {
    if (loadingEl) loadingEl.style.display = 'none';
    initEnvelopeScreen();
    return;
  }

  // Show loading for 2.2 seconds then fade out
  setTimeout(() => {
    if (loadingEl) {
      loadingEl.classList.add('fade-out');
      loadingEl.addEventListener('animationend', () => {
        loadingEl.style.display = 'none';
        initEnvelopeScreen();
      }, { once: true });
    } else {
      initEnvelopeScreen();
    }
  }, 2200);
}

/* ══════════════════════════════════════════════════════════════
   ENVELOPE / COVER SCREEN
══════════════════════════════════════════════════════════════ */
function initEnvelopeScreen() {
  const envelopeScreen = document.getElementById('envelope-screen');
  const settings = State.settings || {};

  // Populate cover data
  populateCoverData();

  // Show envelope screen
  if (envelopeScreen) envelopeScreen.style.display = '';

  // If envelope is disabled, go straight to main
  if (settings.showEnvelope === false) {
    if (envelopeScreen) envelopeScreen.style.display = 'none';
    showMainContent();
    return;
  }

  // Set up music
  if (settings.musicEnabled !== false) {
    initMusic();
  }

  // Open invitation button
  const openBtn = document.getElementById('open-invitation-btn');
  if (openBtn) {
    openBtn.addEventListener('click', handleOpenInvitation);
  }

  // Music toggle
  const musicToggle = document.getElementById('music-toggle');
  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
    // Show only if music is enabled
    if (!settings.musicEnabled) {
      musicToggle.style.display = 'none';
    }
  }

  // Init Lucide for this screen
  lucide.createIcons();
}

function populateCoverData() {
  const w = State.wedding;
  if (!w) return;

  // Cover names
  const coverNames = document.getElementById('cover-names');
  if (coverNames) coverNames.innerHTML = `${w.brideName} &amp; ${w.groomName}`;

  // Cover date
  const coverDate = document.getElementById('cover-date');
  if (coverDate) coverDate.textContent = formatDate(w.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Cover venue
  const coverVenue = document.getElementById('cover-venue');
  if (coverVenue) coverVenue.textContent = w.venueName;
}

function handleOpenInvitation() {
  const envelopeContainer = document.getElementById('envelope-container');
  const envelopeScreen    = document.getElementById('envelope-screen');

  // Start music on user gesture
  if (State.audio && !State.musicMuted) {
    State.audio.play().catch(() => {});
    State.musicPlaying = true;
  }

  // Animate envelope flap open
  if (envelopeContainer) {
    envelopeContainer.classList.add('flap-open');
  }

  // Show scroll hint
  setTimeout(() => show('cover-scroll-hint'), 500);

  // After short delay, fade out cover and show main
  setTimeout(() => {
    if (envelopeScreen) {
      envelopeScreen.style.transition = 'opacity 0.8s ease';
      envelopeScreen.style.opacity    = '0';
      setTimeout(() => {
        envelopeScreen.style.display = 'none';
        envelopeScreen.style.opacity = '';
        showMainContent();
      }, 800);
    } else {
      showMainContent();
    }
  }, 1000);
}

/* ══════════════════════════════════════════════════════════════
   MUSIC
══════════════════════════════════════════════════════════════ */
function initMusic() {
  const settings = State.settings || {};
  // Use a royalty-free audio URL (public domain)
  // Since we can't embed actual audio files, we set up the element
  // but use a gentle ambient placeholder. The track key is from settings.
  // In production, this would be a real CDN audio URL.
  const MUSIC_URLS = {
    'canon-in-d':   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'default':      '',
  };

  const trackKey = settings.musicTrack || 'default';
  const trackUrl = MUSIC_URLS[trackKey] || MUSIC_URLS['default'];

  if (!trackUrl) return;

  State.audio = new Audio();
  State.audio.src = trackUrl;
  State.audio.loop   = true;
  State.audio.volume = 0.3;
  State.audio.preload = 'none';

  // Mute default if setting says so
  if (settings.musicMuteDefault) {
    State.musicMuted = true;
    updateMusicToggleUI(false);
  }
}

function toggleMusic() {
  if (!State.audio) return;

  if (State.musicPlaying && !State.musicMuted) {
    State.audio.pause();
    State.musicMuted = true;
    updateMusicToggleUI(false);
  } else {
    State.audio.play().catch(() => {});
    State.musicMuted  = false;
    State.musicPlaying = true;
    updateMusicToggleUI(true);
  }
}

function updateMusicToggleUI(playing) {
  const onIcon  = $('.music-icon-on');
  const offIcon = $('.music-icon-off');
  if (onIcon)  onIcon.style.display  = playing ? '' : 'none';
  if (offIcon) offIcon.style.display = playing ? 'none' : '';
}

/* ══════════════════════════════════════════════════════════════
   MAIN CONTENT — SHOW & POPULATE
══════════════════════════════════════════════════════════════ */
function showMainContent() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.style.display = '';

  // Populate all sections
  populateHero();
  populateMessage();
  populateDetails();
  populateFooter();

  // Init interactive sections
  initCountdown();
  initAgenda();
  initRsvp();
  initGallery();
  initTableFinder();
  populateSpecialMessage();

  // Apply siteSettings toggles
  applySettingsToggles();

  // Init scroll-reveal
  initScrollReveal();

  // Re-init Lucide icons for newly rendered content
  lucide.createIcons();

  // Smooth scroll to hero on entry
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Init hero parallax
  initParallax();
}

/* ══════════════════════════════════════════════════════════════
   SITE SETTINGS TOGGLES
══════════════════════════════════════════════════════════════ */
function applySettingsToggles() {
  const s = State.settings || {};

  const sectionMap = {
    showCountdown:    'countdown-section',
    showAgenda:       'agenda-section',
    showRsvp:         'rsvp-section',
    showGallery:      'gallery-section',
    showTableFinder:  'table-section',
    showSpecialMessage:'special-section',
  };

  Object.entries(sectionMap).forEach(([key, id]) => {
    if (s[key] === false) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }
  });

  // Music toggle visibility on main page
  const musicToggle = document.getElementById('music-toggle');
  if (musicToggle && !s.musicEnabled) {
    musicToggle.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: HERO
══════════════════════════════════════════════════════════════ */
function populateHero() {
  const w = State.wedding;
  if (!w) return;

  // Hero names
  const heroNames = document.getElementById('hero-names');
  if (heroNames) heroNames.innerHTML = `${w.brideName} <span class="hero-amp">&amp;</span> ${w.groomName}`;

  // Hero date
  const heroDate = document.getElementById('hero-date');
  if (heroDate) {
    const span = heroDate.querySelector('span');
    if (span) span.textContent = formatDate(w.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  // Hero venue
  const heroVenue = document.getElementById('hero-venue');
  if (heroVenue) {
    const span = heroVenue.querySelector('span');
    if (span) span.textContent = w.venueName;
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: INVITATION MESSAGE
══════════════════════════════════════════════════════════════ */
function populateMessage() {
  const w = State.wedding;
  const s = State.settings || {};
  if (!w) return;

  // Hero message
  const msgEl = document.getElementById('hero-message-text');
  if (msgEl && s.heroMessage) {
    msgEl.textContent = s.heroMessage;
  }

  // Story
  const storyEl = document.getElementById('story-text');
  if (storyEl && w.story) {
    storyEl.textContent = w.story;
  } else if (!w.story) {
    const storySection = document.getElementById('couple-story');
    if (storySection) storySection.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: WEDDING DETAILS
══════════════════════════════════════════════════════════════ */
function populateDetails() {
  const w = State.wedding;
  if (!w) return;

  setText('details-date',       formatDate(w.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  setText('details-time',       `${formatTime(w.time)} onwards`);
  setText('details-venue-name', w.venueName);
  setText('details-venue-addr', w.venueAddress);
  setText('details-rsvp-date',  formatDate(w.rsvpDeadline, { month: 'long', day: 'numeric', year: 'numeric' }));

  const mapLink = document.getElementById('details-map-link');
  if (mapLink && w.venueMapLink) {
    mapLink.href = w.venueMapLink;
    if (State.settings?.showVenueMap === false) {
      mapLink.style.display = 'none';
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: COUNTDOWN TIMER
══════════════════════════════════════════════════════════════ */
function initCountdown() {
  const w = State.wedding;
  if (!w || !w.date) return;

  // Target: wedding date + time
  const [hour, minute] = (w.time || '17:00').split(':').map(Number);
  const target = new Date(`${w.date}T${w.time || '17:00'}:00`);

  // Date label
  const labelEl = document.getElementById('countdown-date-label');
  if (labelEl) {
    labelEl.textContent = `Until ${formatDate(w.date, { month: 'long', day: 'numeric', year: 'numeric' })} at ${formatTime(w.time)}`;
  }

  // Track previous values for flip animation
  let prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };

  function tick() {
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0) {
      // Wedding day!
      setText('cd-days-val',    '00');
      setText('cd-hours-val',   '00');
      setText('cd-minutes-val', '00');
      setText('cd-seconds-val', '00');
      if (labelEl) labelEl.textContent = '🎉 Today is the big day!';
      clearInterval(State.countdownInterval);
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const units = { days, hours, minutes, seconds };
    const ids   = { days: 'cd-days-val', hours: 'cd-hours-val', minutes: 'cd-minutes-val', seconds: 'cd-seconds-val' };

    Object.entries(units).forEach(([unit, val]) => {
      const el = document.getElementById(ids[unit]);
      if (!el) return;

      if (val !== prevValues[unit]) {
        // Flip animation
        el.classList.remove('flip');
        void el.offsetWidth; // reflow
        el.classList.add('flip');
        el.textContent = pad(val);
        prevValues[unit] = val;
      }
    });
  }

  tick();
  State.countdownInterval = setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════════
   SECTION: AGENDA / TIMELINE
══════════════════════════════════════════════════════════════ */
function initAgenda() {
  const timeline = document.getElementById('timeline-list');
  if (!timeline || !State.agenda.length) {
    const agendaSection = document.getElementById('agenda-section');
    if (agendaSection) agendaSection.style.display = 'none';
    return;
  }

  const html = State.agenda.map((item, index) => {
    return `
      <div class="timeline-item" data-index="${index}" role="listitem">
        <div class="timeline-time">${formatTime(item.time)}</div>
        <div class="timeline-dot">
          <div class="timeline-dot-inner" aria-hidden="true">${item.icon || '💍'}</div>
        </div>
        <div class="timeline-content">
          <h3 class="timeline-event-title">${escapeHTML(item.title)}</h3>
          ${item.description ? `<p class="timeline-event-desc">${escapeHTML(item.description)}</p>` : ''}
          ${item.duration ? `<span class="timeline-event-duration">${item.duration} min</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  timeline.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   SECTION: RSVP
══════════════════════════════════════════════════════════════ */
function initRsvp() {
  const s = State.settings || {};

  // RSVP section title
  setText('rsvp-section-title', s.rsvpSectionTitle || 'Will You Join Us?');

  // If token provided and guest found → show personalized form
  if (State.currentGuest) {
    setupRsvpForGuest(State.currentGuest, State.currentRsvp);
  } else {
    // Show lookup form
    setupRsvpLookup();
  }

  // Wire up attending buttons
  const yesBtn = document.getElementById('rsvp-yes-btn');
  const noBtn  = document.getElementById('rsvp-no-btn');
  if (yesBtn) yesBtn.addEventListener('click', () => selectAttending('yes'));
  if (noBtn)  noBtn.addEventListener('click',  () => selectAttending('no'));

  // Wire up form submit
  const form = document.getElementById('rsvp-form');
  if (form) form.addEventListener('submit', handleRsvpSubmit);

  // Wire up update button
  const updateBtn = document.getElementById('rsvp-update-btn');
  if (updateBtn) updateBtn.addEventListener('click', handleRsvpUpdate);
}

function setupRsvpLookup() {
  show('rsvp-lookup');
  hide('rsvp-form');
  hide('rsvp-confirmation');
  hide('rsvp-greeting');

  const searchBtn = document.getElementById('rsvp-search-btn');
  const searchInput = document.getElementById('rsvp-name-search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', handleRsvpNameSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRsvpNameSearch();
      }
    });
  }
}

function handleRsvpNameSearch() {
  const input = document.getElementById('rsvp-name-search-input');
  const errEl = document.getElementById('rsvp-lookup-error');
  if (!input) return;

  const name = input.value.trim();

  if (!name) {
    if (errEl) {
      errEl.textContent = 'Please enter your name to search.';
      errEl.style.display = '';
    }
    return;
  }

  // Search guests by name
  const guests = State.guests;
  const match  = guests.find(g => g.name.toLowerCase().includes(name.toLowerCase()));

  if (!match) {
    if (errEl) {
      errEl.textContent = `We couldn't find a guest named "${escapeHTML(name)}". Please try a different spelling or contact us directly.`;
      errEl.style.display = '';
    }
    return;
  }

  // Found — hide error and show RSVP form
  if (errEl) errEl.style.display = 'none';
  const existingRsvp = Store.RSVPs.getByGuest(match.id);
  setupRsvpForGuest(match, existingRsvp);
}

function setupRsvpForGuest(guest, existingRsvp) {
  State.currentGuest = guest;
  State.currentRsvp  = existingRsvp;

  hide('rsvp-lookup');

  // Show greeting
  const greetingEl = document.getElementById('rsvp-greeting');
  const greetingText = document.getElementById('rsvp-greeting-text');
  if (greetingEl) greetingEl.style.display = '';
  if (greetingText) {
    greetingText.textContent = `Welcome, ${guest.name}! We're so glad you could join us.`;
  }

  // If already RSVP'd with confirmed/declined status → show confirmation
  if (existingRsvp && existingRsvp.status !== 'pending') {
    showRsvpConfirmation(existingRsvp);
    return;
  }

  // Show form
  showRsvpForm(guest, existingRsvp);
}

function showRsvpForm(guest, existingRsvp) {
  const form   = document.getElementById('rsvp-form');
  const nameEl = document.getElementById('rsvp-form-guest-name');
  if (!form) return;

  form.style.display = '';
  hide('rsvp-confirmation');

  if (nameEl) nameEl.textContent = guest.name;

  // Pre-fill if existing data
  if (existingRsvp && existingRsvp.status !== 'pending') {
    const attending = existingRsvp.status === 'confirmed' ? 'yes' : 'no';
    selectAttending(attending);

    if (attending === 'yes') {
      populateCountSelect(guest.maxMembers || 1, existingRsvp.attendingCount);
    }

    const mealInputs = document.querySelectorAll('[name="meal"]');
    mealInputs.forEach(inp => {
      if (inp.value === existingRsvp.mealPreference) inp.checked = true;
    });

    const liqInputs = document.querySelectorAll('[name="liquor"]');
    liqInputs.forEach(inp => {
      if (inp.value === existingRsvp.liquorPreference) inp.checked = true;
    });

    const notesEl = document.getElementById('rsvp-notes');
    if (notesEl && existingRsvp.notes) notesEl.value = existingRsvp.notes;
  } else {
    // Just populate count for yes
    populateCountSelect(guest.maxMembers || 1, 1);
  }
}

function populateCountSelect(max, selected = 1) {
  const sel = document.getElementById('rsvp-count');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select count</option>';
  for (let i = 1; i <= max; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i === 1 ? '1 guest' : `${i} guests`;
    if (i === selected) opt.selected = true;
    sel.appendChild(opt);
  }
}

function selectAttending(val) {
  State.attendingVal = val;

  const yesBtn    = document.getElementById('rsvp-yes-btn');
  const noBtn     = document.getElementById('rsvp-no-btn');
  const hiddenInp = document.getElementById('rsvp-attending');
  const extraFields = document.getElementById('rsvp-extra-fields');
  const errEl     = document.getElementById('rsvp-attending-error');

  if (yesBtn) {
    yesBtn.classList.toggle('selected', val === 'yes');
    yesBtn.setAttribute('aria-pressed', val === 'yes');
  }
  if (noBtn) {
    noBtn.classList.toggle('selected', val === 'no');
    noBtn.setAttribute('aria-pressed', val === 'no');
  }
  if (hiddenInp) hiddenInp.value = val;
  if (errEl) errEl.style.display = 'none';

  // Show/hide extra fields
  if (extraFields) {
    extraFields.style.display = val === 'yes' ? '' : 'none';
    if (val === 'yes' && State.currentGuest) {
      populateCountSelect(State.currentGuest.maxMembers || 1, 1);
    }
  }
}

function handleRsvpSubmit(e) {
  e.preventDefault();

  // Validate
  if (!validateRsvpForm()) return;

  const attending = State.attendingVal;
  const countEl   = document.getElementById('rsvp-count');
  const notesEl   = document.getElementById('rsvp-notes');
  const mealSelected  = document.querySelector('[name="meal"]:checked');
  const liquorSelected = document.querySelector('[name="liquor"]:checked');

  const rsvp = {
    guestId:          State.currentGuest.id,
    weddingId:        State.wedding.id,
    status:           attending === 'yes' ? 'confirmed' : 'declined',
    attendingCount:   attending === 'yes' ? parseInt(countEl?.value || '1') : 0,
    mealPreference:   mealSelected  ? mealSelected.value  : '',
    liquorPreference: liquorSelected ? liquorSelected.value : '',
    notes:            notesEl ? notesEl.value.trim() : '',
  };

  // Save to store
  try {
    Store.RSVPs.save(rsvp);
    State.currentRsvp = rsvp;
    showToast('Your RSVP has been saved! 💌', 'success');
    showRsvpConfirmation(rsvp);
  } catch (err) {
    console.error('RSVP save error:', err);
    showToast('Something went wrong. Please try again.', 'error');
  }
}

function validateRsvpForm() {
  let valid = true;

  // Attending
  const errAttending = document.getElementById('rsvp-attending-error');
  if (!State.attendingVal) {
    if (errAttending) errAttending.style.display = '';
    valid = false;
  } else {
    if (errAttending) errAttending.style.display = 'none';
  }

  // Count (only if attending yes)
  if (State.attendingVal === 'yes') {
    const countEl  = document.getElementById('rsvp-count');
    const errCount = document.getElementById('rsvp-count-error');
    if (countEl && !countEl.value) {
      if (errCount) errCount.style.display = '';
      valid = false;
    } else {
      if (errCount) errCount.style.display = 'none';
    }
  }

  return valid;
}

function showRsvpConfirmation(rsvp) {
  hide('rsvp-form');
  hide('rsvp-lookup');

  const confirmEl   = document.getElementById('rsvp-confirmation');
  const iconEl      = document.getElementById('rsvp-confirm-icon');
  const titleEl     = document.getElementById('rsvp-confirm-title');
  const textEl      = document.getElementById('rsvp-confirm-text');

  if (confirmEl) confirmEl.style.display = '';

  if (rsvp.status === 'confirmed') {
    if (iconEl)  iconEl.textContent   = '💌';
    if (titleEl) titleEl.textContent  = 'We Can\'t Wait to See You!';
    if (textEl)  textEl.textContent   = `Wonderful! We've noted that ${rsvp.attendingCount > 1 ? `you and ${rsvp.attendingCount - 1} other${rsvp.attendingCount - 1 > 1 ? 's' : ''}` : 'you'} will be joining us. We look forward to celebrating together!`;
  } else {
    if (iconEl)  iconEl.textContent   = '🌸';
    if (titleEl) titleEl.textContent  = 'We\'ll Miss You!';
    if (textEl)  textEl.textContent   = 'Thank you for letting us know. We\'ll be thinking of you on our special day. ' + (rsvp.notes ? `Your note: "${rsvp.notes}"` : '');
  }
}

function handleRsvpUpdate() {
  if (!State.currentGuest) return;
  // Reset attending selection
  State.attendingVal = null;
  const yesBtn = document.getElementById('rsvp-yes-btn');
  const noBtn  = document.getElementById('rsvp-no-btn');
  if (yesBtn) { yesBtn.classList.remove('selected'); yesBtn.setAttribute('aria-pressed', 'false'); }
  if (noBtn)  { noBtn.classList.remove('selected');  noBtn.setAttribute('aria-pressed', 'false'); }
  const hiddenInp = document.getElementById('rsvp-attending');
  if (hiddenInp) hiddenInp.value = '';
  const extraFields = document.getElementById('rsvp-extra-fields');
  if (extraFields) extraFields.style.display = 'none';

  showRsvpForm(State.currentGuest, State.currentRsvp);
  showToast('Update your RSVP response below.', 'info');
}

/* ══════════════════════════════════════════════════════════════
   SECTION: GALLERY
══════════════════════════════════════════════════════════════ */
function initGallery() {
  const grid   = document.getElementById('gallery-grid');
  const emptyEl = document.getElementById('gallery-empty');

  if (!State.gallery.length) {
    if (emptyEl) emptyEl.style.display = '';
    return;
  }

  State.lightboxImages = State.gallery;

  const html = State.gallery.map((img, i) => `
    <div class="gallery-item reveal-card" role="listitem" tabindex="0"
         data-index="${i}" aria-label="${escapeHTML(img.caption || 'Wedding photo')}">
      <img src="${escapeHTML(img.url)}" alt="${escapeHTML(img.caption || 'Wedding photo')}" loading="lazy" />
      <div class="gallery-item-overlay" aria-hidden="true">
        <span class="gallery-item-caption">${escapeHTML(img.caption || '')}</span>
      </div>
      <div class="gallery-expand-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>
    </div>
  `).join('');

  if (grid) {
    grid.innerHTML = html;

    // Click handlers
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(parseInt(item.dataset.index));
        }
      });
    });
  }

  // Init lightbox controls
  initLightboxControls();
}

function initLightboxControls() {
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-overlay')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.style.display === 'none') return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigateLightbox(-1);
    if (e.key === 'ArrowRight')  navigateLightbox(1);
  });
}

function openLightbox(index) {
  State.lightboxIndex = index;
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.style.display = '';
  document.body.style.overflow = 'hidden';
  updateLightboxImage();

  // Focus close button for accessibility
  document.getElementById('lightbox-close')?.focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  const len = State.lightboxImages.length;
  State.lightboxIndex = (State.lightboxIndex + dir + len) % len;
  updateLightboxImage();
}

function updateLightboxImage() {
  const img     = State.lightboxImages[State.lightboxIndex];
  const imgEl   = document.getElementById('lightbox-img');
  const capEl   = document.getElementById('lightbox-caption');
  const countEl = document.getElementById('lightbox-counter');

  if (imgEl) { imgEl.src = img.url; imgEl.alt = img.caption || 'Wedding photo'; }
  if (capEl) capEl.textContent = img.caption || '';
  if (countEl) countEl.textContent = `${State.lightboxIndex + 1} / ${State.lightboxImages.length}`;
}

/* ══════════════════════════════════════════════════════════════
   SECTION: TABLE FINDER
══════════════════════════════════════════════════════════════ */
function initTableFinder() {
  const searchBtn   = document.getElementById('table-search-btn');
  const searchInput = document.getElementById('table-search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', handleTableSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTableSearch();
      }
    });
  }
}

function handleTableSearch() {
  const input   = document.getElementById('table-search-input');
  const resultEl = document.getElementById('table-result');
  const foundEl  = document.getElementById('table-result-found');
  const notFoundEl = document.getElementById('table-result-notfound');
  const nameEl   = document.getElementById('table-result-name');
  const notesEl  = document.getElementById('table-result-notes');

  if (!input) return;
  const name = input.value.trim();

  if (!name) {
    input.focus();
    return;
  }

  const table = Store.Tables.findForGuest(State.wedding.id, name);

  if (resultEl) resultEl.style.display = '';

  if (table) {
    if (foundEl)    foundEl.style.display    = '';
    if (notFoundEl) notFoundEl.style.display = 'none';
    if (nameEl)     nameEl.textContent       = table.name;
    if (notesEl)    notesEl.textContent      = table.notes || '';
  } else {
    if (foundEl)    foundEl.style.display    = 'none';
    if (notFoundEl) notFoundEl.style.display = '';
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: SPECIAL MESSAGE
══════════════════════════════════════════════════════════════ */
function populateSpecialMessage() {
  const s = State.settings || {};
  const w = State.wedding;

  const msgEl = document.getElementById('special-message-text');
  if (msgEl && s.specialMessage) {
    msgEl.textContent = s.specialMessage;
  }

  const namesEl = document.getElementById('special-names');
  if (namesEl && w) {
    namesEl.textContent = `${w.brideName} & ${w.groomName}`;
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION: FOOTER
══════════════════════════════════════════════════════════════ */
function populateFooter() {
  const w = State.wedding;
  if (!w) return;

  const footerCouple = document.getElementById('footer-couple');
  if (footerCouple) footerCouple.innerHTML = `${w.brideName} &amp; ${w.groomName}`;

  setText('footer-date', formatDate(w.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  // Email
  const emailEl = document.getElementById('footer-email');
  if (emailEl && w.contactEmail) {
    emailEl.href = `mailto:${w.contactEmail}`;
    const span = emailEl.querySelector('span');
    if (span) span.textContent = w.contactEmail;
  } else if (emailEl) {
    emailEl.style.display = 'none';
  }

  // WhatsApp
  const waEl = document.getElementById('footer-whatsapp');
  if (waEl && w.contactWhatsApp) {
    waEl.href = `https://wa.me/${w.contactWhatsApp.replace(/\D/g, '')}`;
    const span = waEl.querySelector('span');
    if (span) span.textContent = w.contactWhatsApp;
  } else if (waEl) {
    waEl.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════════
   SCROLL-REVEAL (Intersection Observer)
══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  // Sections
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal-section').forEach(el => {
    sectionObserver.observe(el);
  });

  // Cards (staggered)
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal-card').forEach(el => {
    cardObserver.observe(el);
  });

  // Timeline items
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.timeline-item').forEach(el => {
    timelineObserver.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════════════════════ */
function initParallax() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  // Only on desktop (fixed attachment works there)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        const heroSection = document.getElementById('hero-section');
        if (!heroSection) { ticking = false; return; }
        const heroH = heroSection.offsetHeight;
        if (scrollY < heroH) {
          const offset = scrollY * 0.4;
          heroBg.style.transform = `scale(1.1) translateY(${offset}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   UTILITY: ESCAPE HTML
══════════════════════════════════════════════════════════════ */
function escapeHTML(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/* ══════════════════════════════════════════════════════════════
   LUCIDE ICON INITIALIZATION
   (Called after each major DOM update)
══════════════════════════════════════════════════════════════ */
// Initial call in case icons in static HTML need to be hydrated early
if (window.lucide) {
  lucide.createIcons();
}

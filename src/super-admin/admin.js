/**
 * SUPER ADMIN PANEL — admin.js
 * Wedding Platform | Complete admin logic
 */

'use strict';

// ═══════════════════════════════════════════════════════════
// WAIT FOR DOM + SCRIPTS
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Init Lucide icons
  if (window.lucide) lucide.createIcons();

  // Bootstrap app
  AdminApp.init();
});

// ═══════════════════════════════════════════════════════════
// ADMIN APP
// ═══════════════════════════════════════════════════════════
const AdminApp = (() => {

  // ── State ──────────────────────────────────────────────
  let currentModule = 'dashboard';
  let chartsRendered = {};
  let confirmCallback = null;
  let currentInquiryId = null;

  // ── LOCAL DATA (CMS, FAQs, Testimonials, Cleanup History)
  const localData = {
    templates: [
      { id: 'tpl-1', name: 'Ivory Rose', desc: 'Classic elegance with soft ivory and rose tones', color: '#C45A74', active: true, isDefault: true,  emoji: '🌸' },
      { id: 'tpl-2', name: 'Blush Gold',  desc: 'Warm blush tones with gold accents',             color: '#C9A574', active: true, isDefault: false, emoji: '✨' },
      { id: 'tpl-3', name: 'Lavender Bloom', desc: 'Romantic lavender with floral motifs',         color: '#8B5CF6', active: true, isDefault: false, emoji: '💜' },
      { id: 'tpl-4', name: 'Sage Elegance',  desc: 'Organic sage green with botanical elements',   color: '#8FA98F', active: true, isDefault: false, emoji: '🌿' },
      { id: 'tpl-5', name: 'Midnight Classic', desc: 'Sophisticated dark palette for evening weddings', color: '#1E293B', active: false, isDefault: false, emoji: '🌙' },
    ],
    faqs: [
      { id: 'faq-1', question: 'How does the free trial work?', answer: 'You get 7 days to explore all features with up to 50 guests. No credit card required.', active: true },
      { id: 'faq-2', question: 'Can I upgrade mid-trial?', answer: 'Yes! Upgrade at any time from your dashboard. Your data is preserved.', active: true },
      { id: 'faq-3', question: 'What happens after my trial ends?', answer: 'You have a 3-day grace period. After that, your invitation page is paused until you upgrade.', active: true },
      { id: 'faq-4', question: 'Can I change my wedding template?', answer: 'Yes, you can switch templates anytime. Your data will not be affected.', active: false },
    ],
    testimonials: [
      { id: 'test-1', name: 'Nimesha Perera', couple: 'Nimesha & Thilina', rating: 5, text: 'WedInvite made our digital invitations absolutely stunning. All our guests loved it!', active: true },
      { id: 'test-2', name: 'Kumari Jayawardena', couple: 'Kumari & Saman', rating: 5, text: 'The RSVP tracking saved us so much time. We always knew exactly who was coming.', active: true },
      { id: 'test-3', name: 'Dilshan Fernando', couple: 'Dilshan & Chamari', rating: 4, text: 'Beautiful design, super easy to use. Highly recommend to every couple!', active: true },
    ],
    cleanupHistory: [
      { date: '2026-04-01', deleted: 12, by: 'System (Auto)', status: 'success' },
      { date: '2026-03-01', deleted: 8,  by: 'admin@test.com', status: 'success' },
      { date: '2026-02-01', deleted: 5,  by: 'System (Auto)', status: 'success' },
    ],
    errorLogs: [
      { id: 'log-01', ts: '2026-05-20T20:15:33Z', level: 'ERROR', message: 'Stripe webhook signature verification failed', source: 'payments/webhook.js:142' },
      { id: 'log-02', ts: '2026-05-20T19:42:10Z', level: 'WARN',  message: 'High memory usage detected: 87%',             source: 'system/monitor.js:89' },
      { id: 'log-03', ts: '2026-05-20T18:30:05Z', level: 'INFO',  message: 'Scheduled cleanup task started',              source: 'cron/cleanup.js:12' },
      { id: 'log-04', ts: '2026-05-20T18:30:07Z', level: 'INFO',  message: 'Cleanup task completed. 0 records removed.',  source: 'cron/cleanup.js:45' },
      { id: 'log-05', ts: '2026-05-20T17:55:22Z', level: 'ERROR', message: 'Email delivery failed for guest tok_g003',    source: 'email/sender.js:78' },
      { id: 'log-06', ts: '2026-05-20T16:12:44Z', level: 'WARN',  message: 'Rate limit approaching for IP 192.168.1.10',  source: 'middleware/ratelimit.js:33' },
      { id: 'log-07', ts: '2026-05-20T14:05:01Z', level: 'INFO',  message: 'New vendor registration: SweetBites Bakery',  source: 'api/vendors.js:22' },
      { id: 'log-08', ts: '2026-05-20T11:33:15Z', level: 'ERROR', message: 'Database connection timeout (retry 3/3)',      source: 'db/connection.js:55' },
      { id: 'log-09', ts: '2026-05-20T10:20:00Z', level: 'INFO',  message: 'Admin login: admin@test.com from 203.94.1.5', source: 'auth/session.js:18' },
      { id: 'log-10', ts: '2026-05-20T09:00:00Z', level: 'WARN',  message: 'Unverified vendor profile viewed publicly',   source: 'api/vendors.js:101' },
    ],
    activityLog: [
      { ts: '2026-05-20T20:10:00Z', actor: 'admin@test.com',   action: 'Approved vendor',   target: 'Avishka Photography Studio', ip: '203.94.1.5' },
      { ts: '2026-05-20T19:30:00Z', actor: 'System',           action: 'Trial expired',      target: 'couple@expired.com',         ip: '—' },
      { ts: '2026-05-20T18:55:00Z', actor: 'couple@test.com',  action: 'RSVP link shared',   target: 'Wedding: priya-and-kasun',   ip: '115.98.2.44' },
      { ts: '2026-05-20T17:40:00Z', actor: 'admin@test.com',   action: 'Plan settings saved',target: 'System Settings',            ip: '203.94.1.5' },
      { ts: '2026-05-20T16:10:00Z', actor: 'vendor@test.com',  action: 'Profile updated',    target: 'Avishka Photography Studio', ip: '101.2.55.12' },
      { ts: '2026-05-20T15:00:00Z', actor: 'System',           action: 'Auto cleanup run',   target: 'Expired trials',             ip: '—' },
      { ts: '2026-05-20T14:30:00Z', actor: 'admin@test.com',   action: 'FAQ updated',        target: 'FAQ #3',                     ip: '203.94.1.5' },
      { ts: '2026-05-20T12:00:00Z', actor: 'new@couple.lk',    action: 'Account created',    target: 'Wedding: nisha-and-ranil',   ip: '112.77.3.2' },
      { ts: '2026-05-20T11:20:00Z', actor: 'admin@test.com',   action: 'Template created',   target: 'Midnight Classic',           ip: '203.94.1.5' },
      { ts: '2026-05-20T09:15:00Z', actor: 'admin@test.com',   action: 'Admin login',        target: 'Super Admin Portal',         ip: '203.94.1.5' },
    ],
    inquiries: [
      { id: 'inq-1', date: '2026-05-18', name: 'Sunali Dias',     email: 'sunali@gmail.com',   subject: 'Pricing query',              message: 'Hello, I want to know if the premium plan supports more than 500 guests for a very large wedding.', status: 'new' },
      { id: 'inq-2', date: '2026-05-16', name: 'Kamal Rathnayake',email: 'kamal@gmail.com',    subject: 'Payment issue',              message: 'I tried to upgrade but my card keeps getting declined. Please help!', status: 'replied' },
      { id: 'inq-3', date: '2026-05-14', name: 'Ishara Silva',    email: 'ishara@gmail.com',   subject: 'Template request',           message: 'Could you add a blue-themed template? Most of our wedding colors are navy blue.', status: 'new' },
      { id: 'inq-4', date: '2026-05-10', name: 'Pradeep Kumara',  email: 'pradeep@yahoo.com',  subject: 'Vendor listing question',    message: 'How long does it take to get my vendor profile approved?', status: 'closed' },
      { id: 'inq-5', date: '2026-05-05', name: 'Malsha Fernando', email: 'malsha@gmail.com',   subject: 'Data export',                message: 'Is there a way to export my guest list as a CSV file?', status: 'replied' },
    ],
  };

  // ── INIT ───────────────────────────────────────────────
  function init() {
    checkAuth();
  }

  function checkAuth() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'super_admin') {
      showLogin();
    } else {
      showApp(user);
    }
  }

  function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    setupLoginForm();
    lucide.createIcons();
  }

  function showApp(user) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Update sidebar user name
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = user.name || 'Admin';

    // Setup interactions
    setupSidebar();
    setupLogout();
    setupModals();
    setupConfirmDialog();

    // Load with shimmer
    showLoading(true);
    setTimeout(() => {
      showLoading(false);
      navigateTo('dashboard');
    }, 500);

    lucide.createIcons();
  }

  // ── LOGIN ───────────────────────────────────────────────
  function setupLoginForm() {
    const form = document.getElementById('login-form');
    const togglePw = document.getElementById('toggle-password');

    togglePw?.addEventListener('click', () => {
      const pwInput = document.getElementById('login-password');
      const icon = togglePw.querySelector('svg');
      if (pwInput.type === 'password') {
        pwInput.type = 'text';
        if (icon) icon.setAttribute('data-lucide', 'eye-off');
      } else {
        pwInput.type = 'password';
        if (icon) icon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const errorMsg = document.getElementById('login-error-msg');

      if (!email || !password) {
        errorMsg.textContent = 'Please enter both email and password.';
        errorEl.classList.remove('hidden');
        return;
      }

      const result = Auth.login(email, password);
      if (!result.success) {
        errorMsg.textContent = result.error || 'Invalid credentials.';
        errorEl.classList.remove('hidden');
        return;
      }

      if (result.user.role !== 'super_admin') {
        errorMsg.textContent = 'Access denied. Super Admin role required.';
        errorEl.classList.remove('hidden');
        Auth.logout();
        return;
      }

      errorEl.classList.add('hidden');
      showApp(result.user);
    });
  }

  // ── SIDEBAR ─────────────────────────────────────────────
  function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');

    toggle?.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const icon = toggle.querySelector('svg');
      if (sidebar.classList.contains('collapsed')) {
        icon?.setAttribute('data-lucide', 'panel-left-open');
      } else {
        icon?.setAttribute('data-lucide', 'panel-left-close');
      }
      lucide.createIcons();
    });

    mobileToggle?.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('hidden');
    });

    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.add('hidden');
    });

    // Nav items
    document.querySelectorAll('.nav-item[data-module]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const mod = item.dataset.module;
        navigateTo(mod);

        // Close mobile sidebar
        sidebar.classList.remove('mobile-open');
        overlay.classList.add('hidden');
      });
    });
  }

  function setActiveNav(moduleId) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`nav-${moduleId}`)?.classList.add('active');
  }

  // ── LOGOUT ─────────────────────────────────────────────
  function setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      showConfirm({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmText: 'Sign Out',
        dangerous: false,
        onConfirm: () => {
          sessionStorage.removeItem('wp_session');
          showLogin();
        }
      });
    });
  }

  // ── NAVIGATION ─────────────────────────────────────────
  function navigateTo(moduleId) {
    currentModule = moduleId;

    // Hide all modules
    document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));

    // Show target
    const target = document.getElementById(`module-${moduleId}`);
    if (target) target.classList.remove('hidden');

    // Update breadcrumb
    const labels = {
      dashboard: 'Dashboard', couples: 'Couples', vendors: 'Vendors',
      templates: 'Templates', plans: 'Plans', cleanup: 'Trial Cleanup',
      cms: 'Content CMS', reports: 'Reports', settings: 'Settings', logs: 'Logs'
    };
    document.getElementById('breadcrumb-current').textContent = labels[moduleId] || moduleId;

    setActiveNav(moduleId);
    loadModule(moduleId);

    // Update vendor badge
    updateVendorBadge();
  }

  function loadModule(moduleId) {
    switch(moduleId) {
      case 'dashboard': loadDashboard(); break;
      case 'couples':   loadCouples();   break;
      case 'vendors':   loadVendors();   break;
      case 'templates': loadTemplates(); break;
      case 'plans':     loadPlans();     break;
      case 'cleanup':   loadCleanup();   break;
      case 'cms':       loadCMS();       break;
      case 'reports':   loadReports();   break;
      case 'settings':  loadSettings();  break;
      case 'logs':      loadLogs();      break;
    }
  }

  // ── LOADING ─────────────────────────────────────────────
  function showLoading(show) {
    const shimmer = document.getElementById('loading-shimmer');
    if (shimmer) shimmer.classList.toggle('hidden', !show);
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: DASHBOARD
  // ══════════════════════════════════════════════════════════
  function loadDashboard() {
    const couples  = Store.Users.getCouples();
    const vendors  = Store.Vendors.getAll();
    const weddings = Store.Weddings.getAll();
    const guests   = Store.Guests ? getAllGuests() : 0;
    const today    = new Date();

    const activeTrials  = couples.filter(c => c.plan === 'trial' && c.trialEnds && new Date(c.trialEnds) >= today);
    const expiredTrials = couples.filter(c => c.plan === 'trial' && c.trialEnds && new Date(c.trialEnds) <  today);
    const pending       = Store.Vendors.getByStatus('pending');

    setText('kpi-couples',          formatNum(couples.length));
    setText('kpi-active-trials',    formatNum(activeTrials.length));
    setText('kpi-expired-trials',   formatNum(expiredTrials.length));
    setText('kpi-vendors',          formatNum(vendors.length));
    setText('kpi-pending-approvals',formatNum(pending.length));
    setText('kpi-guests',           formatNum(guests));
    setText('kpi-live',             formatNum(weddings.length));

    const ts = document.getElementById('dash-last-updated');
    if (ts) ts.textContent = 'Last updated: ' + new Date().toLocaleTimeString();

    renderActivityFeed();
    renderDashboardCharts();
  }

  function getAllGuests() {
    try {
      const raw = localStorage.getItem('wp_guests');
      return raw ? JSON.parse(raw).length : 0;
    } catch { return 0; }
  }

  function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    const activities = [
      { text: 'Vendor "SweetBites Bakery" submitted for approval',   time: '2 minutes ago', color: '#F59E0B' },
      { text: 'New couple registered: Nisha & Ranil',                 time: '14 minutes ago', color: '#10B981' },
      { text: 'Vendor "Avishka Photography" was approved',            time: '1 hour ago',     color: '#6366F1' },
      { text: 'Trial expired for couple@expired.com',                 time: '2 hours ago',    color: '#EF4444' },
      { text: 'Admin saved system settings',                          time: '3 hours ago',    color: '#3B82F6' },
    ];

    feed.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-dot" style="background:${a.color}"></div>
        <div class="activity-content">
          <div class="activity-text">${a.text}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `).join('');
  }

  function renderDashboardCharts() {
    // Growth Chart
    renderLineChart('chart-growth', {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [12, 19, 15, 28, 32, 45],
      label: 'New Users',
      color: '#6366F1',
    });

    // Distribution Doughnut
    renderDoughnutChart('chart-distribution', {
      labels: ['Couples', 'Vendors', 'Admins'],
      data: [Store.Users.getCouples().length, Store.Vendors.getAll().length, 1],
      colors: ['#6366F1', '#8B5CF6', '#10B981'],
    });

    // RSVP Bar
    renderBarChart('chart-rsvp', {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [42, 65, 38, 89, 74, 96],
      label: 'RSVPs',
      color: '#10B981',
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: COUPLES
  // ══════════════════════════════════════════════════════════
  let couplesFilter = 'all';
  let couplesSearch = '';

  function loadCouples() {
    updateCouplesTable();
    setupCouplesSearch();
    setupCouplesFilter();
    lucide.createIcons();
  }

  function setupCouplesSearch() {
    const input = document.getElementById('couples-search');
    if (!input) return;
    input.removeEventListener('input', onCouplesSearch);
    input.addEventListener('input', onCouplesSearch);
  }

  function onCouplesSearch(e) {
    couplesSearch = e.target.value.toLowerCase();
    updateCouplesTable();
  }

  function setupCouplesFilter() {
    document.querySelectorAll('#couples-filter-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#couples-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        couplesFilter = tab.dataset.filter;
        updateCouplesTable();
      });
    });
  }

  function updateCouplesTable() {
    const today = new Date();
    let couples = Store.Users.getCouples();

    // Filter by tab
    if (couplesFilter === 'trial') {
      couples = couples.filter(c => c.plan === 'trial' && c.trialEnds && new Date(c.trialEnds) >= today);
    } else if (couplesFilter === 'expired') {
      couples = couples.filter(c => c.plan === 'trial' && c.trialEnds && new Date(c.trialEnds) < today);
    } else if (couplesFilter === 'premium') {
      couples = couples.filter(c => c.plan === 'premium' || c.plan === 'basic');
    }

    // Search
    if (couplesSearch) {
      couples = couples.filter(c => {
        const wedding = Store.Weddings.getByUserId(c.id);
        return (
          (c.name || '').toLowerCase().includes(couplesSearch) ||
          (c.email || '').toLowerCase().includes(couplesSearch) ||
          (wedding?.slug || '').toLowerCase().includes(couplesSearch)
        );
      });
    }

    setText('couples-count', formatNum(couples.length));

    const tbody = document.getElementById('couples-tbody');
    const empty = document.getElementById('couples-empty');
    if (!tbody) return;

    if (couples.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    tbody.innerHTML = couples.map(couple => {
      const wedding = Store.Weddings.getByUserId(couple.id);
      const guestCount = wedding ? Store.Guests.getAll(wedding.id).length : 0;
      const planBadge = getPlanBadge(couple, today);

      return `
        <tr>
          <td>
            <div style="font-weight:600">${esc(couple.name || '—')}</div>
          </td>
          <td><span class="text-muted">${esc(couple.email)}</span></td>
          <td>
            ${wedding ? `<code style="font-size:11px;background:var(--adm-bg-alt);padding:2px 6px;border-radius:4px">${esc(wedding.slug)}</code>` : '<span class="text-muted">—</span>'}
          </td>
          <td>${planBadge}</td>
          <td>${formatNum(guestCount)}</td>
          <td>${wedding?.date ? formatDate(wedding.date) : '<span class="text-muted">—</span>'}</td>
          <td><span class="text-muted">${formatDate(couple.createdAt)}</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn" title="View Details" onclick="AdminApp.viewCouple('${couple.id}')">
                <i data-lucide="eye" width="14" height="14"></i>
              </button>
              <button class="action-btn" title="${couple.suspended ? 'Reactivate' : 'Suspend'}" onclick="AdminApp.toggleSuspend('${couple.id}')">
                <i data-lucide="${couple.suspended ? 'user-check' : 'user-x'}" width="14" height="14"></i>
              </button>
              <button class="action-btn" title="Reset Trial" onclick="AdminApp.resetTrial('${couple.id}')">
                <i data-lucide="rotate-ccw" width="14" height="14"></i>
              </button>
              <button class="action-btn action-danger" title="Delete" onclick="AdminApp.deleteCouple('${couple.id}')">
                <i data-lucide="trash-2" width="14" height="14"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  }

  function getPlanBadge(couple, today) {
    if (couple.plan === 'premium') return `<span class="badge badge-premium">Premium</span>`;
    if (couple.plan === 'basic')   return `<span class="badge badge-basic">Basic</span>`;
    if (couple.plan === 'trial') {
      const exp = couple.trialEnds ? new Date(couple.trialEnds) < today : false;
      return exp
        ? `<span class="badge badge-expired">Trial Expired</span>`
        : `<span class="badge badge-trial">Active Trial</span>`;
    }
    return `<span class="badge badge-inactive">${esc(couple.plan || 'Unknown')}</span>`;
  }

  // Couple Actions
  function viewCouple(id) {
    const couple = Store.Users.getById(id);
    if (!couple) return;
    const wedding = Store.Weddings.getByUserId(id);
    const guestCount = wedding ? Store.Guests.getAll(wedding.id).length : 0;
    const rsvpStats  = wedding ? Store.RSVPs.getStats(wedding.id) : null;
    const today = new Date();
    const planBadge = getPlanBadge(couple, today);

    document.getElementById('couple-modal-title').textContent = couple.name || 'Couple Details';
    document.getElementById('couple-modal-body').innerHTML = `
      <div class="couple-detail-grid">
        <div class="detail-card">
          <div class="detail-card-title">Account Info</div>
          <div class="detail-row"><span class="detail-key">Name</span><span class="detail-value">${esc(couple.name || '—')}</span></div>
          <div class="detail-row"><span class="detail-key">Email</span><span class="detail-value">${esc(couple.email)}</span></div>
          <div class="detail-row"><span class="detail-key">Plan</span><span class="detail-value">${planBadge}</span></div>
          <div class="detail-row"><span class="detail-key">Trial Ends</span><span class="detail-value">${couple.trialEnds ? formatDate(couple.trialEnds) : '—'}</span></div>
          <div class="detail-row"><span class="detail-key">Joined</span><span class="detail-value">${formatDate(couple.createdAt)}</span></div>
          <div class="detail-row"><span class="detail-key">Status</span><span class="detail-value">${couple.suspended ? '<span class="badge badge-rejected">Suspended</span>' : '<span class="badge badge-approved">Active</span>'}</span></div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">Wedding Info</div>
          ${wedding ? `
            <div class="detail-row"><span class="detail-key">Slug</span><span class="detail-value">${esc(wedding.slug)}</span></div>
            <div class="detail-row"><span class="detail-key">Date</span><span class="detail-value">${formatDate(wedding.date)}</span></div>
            <div class="detail-row"><span class="detail-key">Venue</span><span class="detail-value">${esc(wedding.venueName || '—')}</span></div>
            <div class="detail-row"><span class="detail-key">Total Guests</span><span class="detail-value">${formatNum(guestCount)}</span></div>
            <div class="detail-row"><span class="detail-key">Confirmed RSVPs</span><span class="detail-value">${rsvpStats ? formatNum(rsvpStats.confirmed) : '—'}</span></div>
            <div class="detail-row"><span class="detail-key">Pending RSVPs</span><span class="detail-value">${rsvpStats ? formatNum(rsvpStats.pending) : '—'}</span></div>
          ` : '<div class="detail-row"><span class="detail-key">Wedding</span><span class="detail-value text-muted">Not set up yet</span></div>'}
        </div>
      </div>
      <div class="detail-action-row">
        <button class="btn btn-ghost btn-sm" onclick="AdminApp.toggleSuspend('${id}'); AdminApp.closeModal('modal-couple-detail'); AdminApp.updateCouplesTable();">
          <i data-lucide="${couple.suspended ? 'user-check' : 'user-x'}" width="14" height="14"></i>
          ${couple.suspended ? 'Reactivate' : 'Suspend'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="AdminApp.resetTrial('${id}')">
          <i data-lucide="rotate-ccw" width="14" height="14"></i>
          Reset Trial
        </button>
        <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteCouple('${id}'); AdminApp.closeModal('modal-couple-detail');">
          <i data-lucide="trash-2" width="14" height="14"></i>
          Delete Account
        </button>
      </div>
    `;
    openModal('modal-couple-detail');
    lucide.createIcons();
  }

  function toggleSuspend(id) {
    const user = Store.Users.getById(id);
    if (!user) return;
    Store.Users.save({ ...user, suspended: !user.suspended });
    showToast(user.suspended ? 'Account reactivated' : 'Account suspended', 'success');
    updateCouplesTable();
  }

  function resetTrial(id) {
    showConfirm({
      title: 'Reset Trial',
      message: 'This will extend the trial by 7 days from today. Continue?',
      confirmText: 'Reset Trial',
      dangerous: false,
      onConfirm: () => {
        const user = Store.Users.getById(id);
        if (!user) return;
        const newEnd = new Date();
        newEnd.setDate(newEnd.getDate() + 7);
        Store.Users.save({ ...user, plan: 'trial', trialEnds: newEnd.toISOString().slice(0,10) });
        showToast('Trial reset successfully', 'success');
        updateCouplesTable();
      }
    });
  }

  function deleteCouple(id) {
    const user = Store.Users.getById(id);
    showConfirm({
      title: 'Delete Account',
      message: `This will permanently delete "${user?.name || 'this couple'}" and all their wedding data. This cannot be undone.`,
      confirmText: 'Delete Account',
      dangerous: true,
      onConfirm: () => {
        // Delete wedding, guests, rsvps, etc
        const wedding = Store.Weddings.getByUserId(id);
        if (wedding) Store.Weddings.delete(wedding.id);
        Store.Users.delete(id);
        showToast('Account deleted', 'success');
        updateCouplesTable();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: VENDORS
  // ══════════════════════════════════════════════════════════
  let vendorsFilter = 'all';
  let vendorsSearch = '';

  function loadVendors() {
    updateVendorsTable();
    setupVendorsSearch();
    setupVendorsFilter();
    lucide.createIcons();
  }

  function setupVendorsSearch() {
    const input = document.getElementById('vendors-search');
    if (!input) return;
    input.removeEventListener('input', onVendorsSearch);
    input.addEventListener('input', onVendorsSearch);
  }

  function onVendorsSearch(e) {
    vendorsSearch = e.target.value.toLowerCase();
    updateVendorsTable();
  }

  function setupVendorsFilter() {
    document.querySelectorAll('#vendors-filter-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#vendors-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        vendorsFilter = tab.dataset.filter;
        updateVendorsTable();
      });
    });
  }

  function updateVendorsTable() {
    let vendors = Store.Vendors.getAll();

    if (vendorsFilter === 'featured') {
      vendors = vendors.filter(v => v.featured);
    } else if (vendorsFilter !== 'all') {
      vendors = vendors.filter(v => v.status === vendorsFilter);
    }

    if (vendorsSearch) {
      vendors = vendors.filter(v =>
        (v.businessName || '').toLowerCase().includes(vendorsSearch) ||
        (v.contactName  || '').toLowerCase().includes(vendorsSearch) ||
        (v.email        || '').toLowerCase().includes(vendorsSearch) ||
        (v.category     || '').toLowerCase().includes(vendorsSearch)
      );
    }

    // Update pending count on tab
    const pending = Store.Vendors.getByStatus('pending');
    const pendingTab = document.getElementById('pending-count-tab');
    if (pendingTab) pendingTab.textContent = pending.length;

    setText('vendors-count', formatNum(vendors.length));

    const tbody = document.getElementById('vendors-tbody');
    const empty = document.getElementById('vendors-empty');
    if (!tbody) return;

    if (vendors.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    tbody.innerHTML = vendors.map(v => {
      const statusBadge = getVendorStatusBadge(v);
      const stars = renderStars(v.rating);
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <img src="${v.profileImage || ''}" alt="" style="width:32px;height:32px;border-radius:6px;object-fit:cover;background:var(--adm-border)" onerror="this.style.display='none'" />
              <div>
                <div style="font-weight:600">${esc(v.businessName)}</div>
                ${v.featured ? '<span class="badge badge-featured" style="font-size:9px">Featured</span>' : ''}
              </div>
            </div>
          </td>
          <td><span class="badge badge-info">${esc(v.category)}</span></td>
          <td>
            <div style="font-size:var(--text-sm)">${esc(v.contactName)}</div>
            <div class="text-muted" style="font-size:11px">${esc(v.email)}</div>
          </td>
          <td><span class="text-muted">${esc(v.location || '—')}</span></td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex;align-items:center;gap:0.25rem">
              ${stars}
              <span style="font-size:11px;color:var(--adm-text-muted)">${v.rating ? v.rating.toFixed(1) : '—'}</span>
            </div>
          </td>
          <td><span class="text-muted">${formatDate(v.createdAt)}</span></td>
          <td>
            <div class="action-btns">
              ${v.status === 'pending' ? `
                <button class="action-btn action-approve" title="Approve" onclick="AdminApp.approveVendor('${v.id}')"><i data-lucide="check" width="14" height="14"></i></button>
                <button class="action-btn action-reject"  title="Reject"  onclick="AdminApp.rejectVendor('${v.id}')"> <i data-lucide="x"     width="14" height="14"></i></button>
              ` : ''}
              <button class="action-btn action-star ${v.featured ? 'starred' : ''}" title="${v.featured ? 'Unfeature' : 'Feature'}" onclick="AdminApp.toggleFeature('${v.id}')">
                <i data-lucide="star" width="14" height="14"></i>
              </button>
              <button class="action-btn" title="View Profile" onclick="AdminApp.viewVendor('${v.id}')">
                <i data-lucide="eye" width="14" height="14"></i>
              </button>
              <button class="action-btn action-danger" title="Delete" onclick="AdminApp.deleteVendor('${v.id}')">
                <i data-lucide="trash-2" width="14" height="14"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  }

  function getVendorStatusBadge(v) {
    if (v.status === 'approved')  return `<span class="badge badge-approved">Approved</span>`;
    if (v.status === 'rejected')  return `<span class="badge badge-rejected">Rejected</span>`;
    if (v.status === 'pending')   return `<span class="badge badge-pending">Pending</span>`;
    return `<span class="badge badge-inactive">${esc(v.status)}</span>`;
  }

  function renderStars(rating) {
    if (!rating) return '<span class="text-muted" style="font-size:11px">Not rated</span>';
    const full = Math.round(rating);
    return Array.from({length:5}, (_,i) =>
      `<i data-lucide="star" width="12" height="12" style="color:${i<full?'#F59E0B':'#CBD5E1'};fill:${i<full?'#F59E0B':'none'}"></i>`
    ).join('');
  }

  function approveVendor(id) {
    Store.Vendors.approve(id);
    showToast('Vendor approved successfully', 'success');
    updateVendorsTable();
    updateVendorBadge();
  }

  function rejectVendor(id) {
    showConfirm({
      title: 'Reject Vendor',
      message: 'Are you sure you want to reject this vendor application?',
      confirmText: 'Reject',
      dangerous: true,
      onConfirm: () => {
        Store.Vendors.reject(id);
        showToast('Vendor rejected', 'warning');
        updateVendorsTable();
        updateVendorBadge();
      }
    });
  }

  function toggleFeature(id) {
    const v = Store.Vendors.getById(id);
    if (!v) return;
    Store.Vendors.save({ ...v, featured: !v.featured });
    showToast(v.featured ? 'Removed from featured' : 'Marked as featured', 'success');
    updateVendorsTable();
  }

  function viewVendor(id) {
    const v = Store.Vendors.getById(id);
    if (!v) return;
    document.getElementById('vendor-modal-title').textContent = v.businessName;
    document.getElementById('vendor-modal-body').innerHTML = `
      <div class="vendor-profile-hero">
        <img src="${v.profileImage || ''}" alt="" class="vendor-profile-img" onerror="this.style.background='var(--adm-border)';this.src=''" />
        <div class="vendor-profile-info">
          <div class="vendor-biz-name">${esc(v.businessName)}</div>
          <div class="vendor-category">${esc(v.category)} · ${esc(v.location || '—')}</div>
          <div style="margin-top:0.5rem">${getVendorStatusBadge(v)} ${v.featured ? '<span class="badge badge-featured">Featured</span>' : ''}</div>
        </div>
      </div>
      <div class="couple-detail-grid">
        <div class="detail-card">
          <div class="detail-card-title">Contact Details</div>
          <div class="detail-row"><span class="detail-key">Contact</span><span class="detail-value">${esc(v.contactName)}</span></div>
          <div class="detail-row"><span class="detail-key">Email</span><span class="detail-value">${esc(v.email)}</span></div>
          <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-value">${esc(v.phone || '—')}</span></div>
          <div class="detail-row"><span class="detail-key">Location</span><span class="detail-value">${esc(v.location || '—')}</span></div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">Platform Stats</div>
          <div class="detail-row"><span class="detail-key">Rating</span><span class="detail-value">${v.rating ? v.rating + ' / 5' : 'Not rated'}</span></div>
          <div class="detail-row"><span class="detail-key">Reviews</span><span class="detail-value">${formatNum(v.reviewCount || 0)}</span></div>
          <div class="detail-row"><span class="detail-key">Joined</span><span class="detail-value">${formatDate(v.createdAt)}</span></div>
        </div>
      </div>
      ${v.description ? `<div class="detail-card" style="margin-top:0"><div class="detail-card-title">Description</div><p style="font-size:var(--text-sm);color:var(--adm-text-secondary);line-height:1.6">${esc(v.description)}</p></div>` : ''}
      <div class="detail-action-row" style="margin-top:1rem">
        ${v.status === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="AdminApp.approveVendor('${id}'); AdminApp.closeModal('modal-vendor-detail'); AdminApp.updateVendorsTable();">
            <i data-lucide="check" width="14" height="14"></i> Approve
          </button>
          <button class="btn btn-danger btn-sm" onclick="AdminApp.rejectVendor('${id}')">
            <i data-lucide="x" width="14" height="14"></i> Reject
          </button>
        ` : ''}
        <button class="btn btn-ghost btn-sm" onclick="AdminApp.toggleFeature('${id}'); AdminApp.closeModal('modal-vendor-detail');">
          <i data-lucide="star" width="14" height="14"></i>
          ${v.featured ? 'Unfeature' : 'Feature'}
        </button>
      </div>
    `;
    openModal('modal-vendor-detail');
    lucide.createIcons();
  }

  function deleteVendor(id) {
    const v = Store.Vendors.getById(id);
    showConfirm({
      title: 'Delete Vendor',
      message: `Permanently delete "${v?.businessName}"? This cannot be undone.`,
      confirmText: 'Delete',
      dangerous: true,
      onConfirm: () => {
        Store.Vendors.delete(id);
        showToast('Vendor deleted', 'success');
        updateVendorsTable();
        updateVendorBadge();
      }
    });
  }

  function updateVendorBadge() {
    const pending = Store.Vendors.getByStatus('pending').length;
    const badge = document.getElementById('vendor-pending-badge');
    if (badge) {
      badge.textContent = pending;
      badge.style.display = pending > 0 ? '' : 'none';
    }
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: TEMPLATES
  // ══════════════════════════════════════════════════════════
  function loadTemplates() {
    renderTemplateGrid();
    setupTemplateModal();
  }

  function renderTemplateGrid() {
    const grid = document.getElementById('template-grid');
    if (!grid) return;

    grid.innerHTML = localData.templates.map(tpl => {
      const textColor = isLight(tpl.color) ? '#1E293B' : '#FFFFFF';
      return `
        <div class="template-card" id="tpl-card-${tpl.id}">
          <div class="template-preview" style="background: linear-gradient(135deg, ${tpl.color}cc, ${tpl.color});">
            <span style="font-size:3rem;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.2))">${tpl.emoji}</span>
            ${tpl.isDefault ? `<div class="template-default-badge"><i data-lucide="check-circle" width="10" height="10"></i> Default</div>` : ''}
          </div>
          <div class="template-body">
            <div class="template-name">${esc(tpl.name)}</div>
            <div class="template-desc">${esc(tpl.desc)}</div>
            <div class="template-footer">
              <span class="badge ${tpl.active ? 'badge-approved' : 'badge-inactive'}">${tpl.active ? 'Active' : 'Inactive'}</span>
              <div class="template-actions">
                ${!tpl.isDefault ? `<button class="btn btn-ghost btn-sm" onclick="AdminApp.setDefaultTemplate('${tpl.id}')">Set Default</button>` : ''}
                <button class="action-btn" title="Edit" onclick="AdminApp.editTemplate('${tpl.id}')"><i data-lucide="edit-2" width="14" height="14"></i></button>
                <button class="action-btn action-danger" title="Delete" onclick="AdminApp.deleteTemplate('${tpl.id}')"><i data-lucide="trash-2" width="14" height="14"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  }

  function isLight(hex) {
    const c = hex.replace('#','');
    const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
    return (r*299 + g*587 + b*114) / 1000 > 128;
  }

  function setupTemplateModal() {
    const addBtn = document.getElementById('add-template-btn');
    const saveBtn = document.getElementById('save-template-btn');
    const colorPicker = document.getElementById('tpl-color');

    addBtn?.addEventListener('click', () => {
      document.getElementById('template-modal-title').textContent = 'New Template';
      document.getElementById('template-edit-id').value = '';
      document.getElementById('tpl-name').value = '';
      document.getElementById('tpl-desc').value = '';
      document.getElementById('tpl-color').value = '#C45A74';
      document.getElementById('tpl-color-preview').textContent = '#C45A74';
      document.getElementById('tpl-active').checked = true;
      openModal('modal-template');
    });

    colorPicker?.addEventListener('input', (e) => {
      document.getElementById('tpl-color-preview').textContent = e.target.value;
    });

    saveBtn?.addEventListener('click', () => {
      const name = document.getElementById('tpl-name').value.trim();
      if (!name) { showToast('Template name is required', 'error'); return; }
      const editId = document.getElementById('template-edit-id').value;
      const tplData = {
        id: editId || `tpl-${Date.now()}`,
        name,
        desc: document.getElementById('tpl-desc').value.trim(),
        color: document.getElementById('tpl-color').value,
        active: document.getElementById('tpl-active').checked,
        isDefault: false,
        emoji: '🌸',
      };

      if (editId) {
        const idx = localData.templates.findIndex(t => t.id === editId);
        if (idx >= 0) {
          tplData.isDefault = localData.templates[idx].isDefault;
          localData.templates[idx] = { ...localData.templates[idx], ...tplData };
        }
      } else {
        localData.templates.push(tplData);
      }

      closeModal('modal-template');
      renderTemplateGrid();
      showToast(editId ? 'Template updated' : 'Template created', 'success');
    });
  }

  function editTemplate(id) {
    const tpl = localData.templates.find(t => t.id === id);
    if (!tpl) return;
    document.getElementById('template-modal-title').textContent = 'Edit Template';
    document.getElementById('template-edit-id').value = tpl.id;
    document.getElementById('tpl-name').value = tpl.name;
    document.getElementById('tpl-desc').value = tpl.desc;
    document.getElementById('tpl-color').value = tpl.color;
    document.getElementById('tpl-color-preview').textContent = tpl.color;
    document.getElementById('tpl-active').checked = tpl.active;
    openModal('modal-template');
  }

  function deleteTemplate(id) {
    showConfirm({
      title: 'Delete Template',
      message: 'Delete this template? Couples using it won\'t be affected, but it will be removed from the picker.',
      confirmText: 'Delete',
      dangerous: true,
      onConfirm: () => {
        localData.templates = localData.templates.filter(t => t.id !== id);
        renderTemplateGrid();
        showToast('Template deleted', 'success');
      }
    });
  }

  function setDefaultTemplate(id) {
    localData.templates.forEach(t => { t.isDefault = t.id === id; });
    renderTemplateGrid();
    showToast('Default template updated', 'success');
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: PLANS
  // ══════════════════════════════════════════════════════════
  function loadPlans() {
    const settings = Store.Settings.get();
    renderPlanCards(settings.plans);
    loadTrialSettings(settings);
    setupPlanModal();
    setupTrialSettings();
  }

  function renderPlanCards(plans) {
    const grid = document.getElementById('plan-cards-grid');
    if (!grid || !plans) return;

    const icons = { trial: '🎁', basic: '⭐', premium: '👑' };
    const featureMap = {
      trial:   ['7-day access', 'Up to 50 guests', '10 gallery photos', 'Basic RSVP'],
      basic:   ['1 year access', 'Up to 100 guests', '30 gallery photos', 'Full RSVP + Table Finder', 'Vendor Marketplace'],
      premium: ['1 year access', 'Up to 500 guests', '100 gallery photos', 'All features', 'Priority support', 'Music + Gallery'],
    };

    grid.innerHTML = plans.map((plan, idx) => `
      <div class="plan-card" ${idx === 2 ? 'style="border-color:var(--adm-primary)"' : ''}>
        ${idx === 2 ? '<div class="plan-card-badge">Most Popular</div>' : ''}
        <div style="font-size:2rem;margin-bottom:0.5rem">${icons[plan.id] || '📦'}</div>
        <div class="plan-card-name">${esc(plan.name)}</div>
        <div class="plan-card-price">
          ${plan.price === 0 ? 'Free' : 'LKR ' + formatNum(plan.price)}
          <span>${plan.price === 0 ? '/ 7 days' : '/ year'}</span>
        </div>
        <ul class="plan-features">
          ${(featureMap[plan.id] || []).map(f => `
            <li><i data-lucide="check" width="14" height="14"></i> ${esc(f)}</li>
          `).join('')}
        </ul>
        <div style="display:flex;gap:0.5rem;font-size:var(--text-xs);color:var(--adm-text-muted);margin-bottom:1rem">
          <span>${formatNum(plan.guestLimit)} guests max</span> · <span>${plan.galleryLimit} photos</span>
        </div>
        <button class="btn btn-ghost" style="width:100%" onclick="AdminApp.openEditPlan('${plan.id}')">
          <i data-lucide="edit-2" width="14" height="14"></i> Edit Plan
        </button>
      </div>
    `).join('');

    lucide.createIcons();
  }

  function setupPlanModal() {
    document.getElementById('save-plan-btn')?.addEventListener('click', () => {
      const id = document.getElementById('plan-edit-id').value;
      const name = document.getElementById('plan-name').value.trim();
      if (!name) { showToast('Plan name required', 'error'); return; }

      const settings = Store.Settings.get();
      const plans = settings.plans || [];
      const idx = plans.findIndex(p => p.id === id);
      if (idx >= 0) {
        plans[idx] = {
          ...plans[idx],
          name,
          price:        parseInt(document.getElementById('plan-price').value) || 0,
          duration:     parseInt(document.getElementById('plan-duration').value) || 7,
          guestLimit:   parseInt(document.getElementById('plan-guests').value) || 50,
          galleryLimit: parseInt(document.getElementById('plan-gallery').value) || 10,
        };
        Store.Settings.save({ ...settings, plans });
        renderPlanCards(plans);
        closeModal('modal-plan-edit');
        showToast('Plan updated', 'success');
      }
    });
  }

  function openEditPlan(id) {
    const settings = Store.Settings.get();
    const plan = (settings.plans || []).find(p => p.id === id);
    if (!plan) return;

    document.getElementById('plan-modal-title').textContent = 'Edit ' + plan.name;
    document.getElementById('plan-edit-id').value = plan.id;
    document.getElementById('plan-name').value = plan.name;
    document.getElementById('plan-price').value = plan.price;
    document.getElementById('plan-duration').value = plan.duration;
    document.getElementById('plan-guests').value = plan.guestLimit;
    document.getElementById('plan-gallery').value = plan.galleryLimit;
    openModal('modal-plan-edit');
  }

  function loadTrialSettings(settings) {
    setValue('trial-duration', settings.trialDays || 7);
    setValue('trial-grace', settings.trialGracePeriod || 3);
    const toggle = document.getElementById('auto-delete-toggle');
    if (toggle) {
      toggle.checked = settings.autoDeleteExpired || false;
      document.getElementById('auto-delete-label').textContent = toggle.checked ? 'Enabled' : 'Disabled';
    }
  }

  function setupTrialSettings() {
    const toggle = document.getElementById('auto-delete-toggle');
    toggle?.addEventListener('change', () => {
      document.getElementById('auto-delete-label').textContent = toggle.checked ? 'Enabled' : 'Disabled';
    });

    document.getElementById('save-trial-settings')?.addEventListener('click', () => {
      Store.Settings.save({
        trialDays:         parseInt(document.getElementById('trial-duration').value) || 7,
        trialGracePeriod:  parseInt(document.getElementById('trial-grace').value)    || 3,
        autoDeleteExpired: document.getElementById('auto-delete-toggle').checked,
      });
      showToast('Trial settings saved', 'success');
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: CLEANUP
  // ══════════════════════════════════════════════════════════
  function loadCleanup() {
    renderCleanupTable();
    renderCleanupHistory();
    setupCleanupActions();
  }

  function getExpiredCouples() {
    const today = new Date();
    return Store.Users.getCouples().filter(c =>
      c.plan === 'trial' && c.trialEnds && new Date(c.trialEnds) < today
    );
  }

  function renderCleanupTable() {
    const expired = getExpiredCouples();
    setText('expired-count', formatNum(expired.length));
    const tbody = document.getElementById('cleanup-tbody');
    const empty = document.getElementById('cleanup-empty');
    if (!tbody) return;

    if (expired.length === 0) {
      tbody.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    const today = new Date();
    tbody.innerHTML = expired.map(c => {
      const wedding = Store.Weddings.getByUserId(c.id);
      const guestCount = wedding ? Store.Guests.getAll(wedding.id).length : 0;
      const trialEnd = new Date(c.trialEnds);
      const daysSince = Math.floor((today - trialEnd) / (1000*60*60*24));
      return `
        <tr>
          <td style="font-weight:600">${esc(c.name || '—')}</td>
          <td><span class="text-muted">${esc(c.email)}</span></td>
          <td>${formatDate(c.trialEnds)}</td>
          <td><span class="badge badge-expired">${daysSince} day${daysSince !== 1 ? 's' : ''}</span></td>
          <td>${formatNum(guestCount)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteCouple('${c.id}')">
              <i data-lucide="trash-2" width="12" height="12"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  }

  function renderCleanupHistory() {
    const tbody = document.getElementById('cleanup-history-tbody');
    if (!tbody) return;
    tbody.innerHTML = localData.cleanupHistory.map(h => `
      <tr>
        <td>${formatDate(h.date)}</td>
        <td><strong>${formatNum(h.deleted)}</strong> accounts</td>
        <td>${esc(h.by)}</td>
        <td><span class="badge badge-approved">${esc(h.status)}</span></td>
      </tr>
    `).join('');
  }

  function setupCleanupActions() {
    document.getElementById('run-cleanup-btn')?.addEventListener('click', () => {
      const count = getExpiredCouples().length;
      showConfirm({
        title: 'Run Auto Cleanup',
        message: `This will permanently delete all ${count} expired trial account(s) and their wedding data. This cannot be undone.`,
        confirmText: 'Run Cleanup',
        dangerous: true,
        onConfirm: () => {
          const expired = getExpiredCouples();
          expired.forEach(c => {
            const wedding = Store.Weddings.getByUserId(c.id);
            if (wedding) Store.Weddings.delete(wedding.id);
            Store.Users.delete(c.id);
          });
          localData.cleanupHistory.unshift({
            date: new Date().toISOString().slice(0,10),
            deleted: expired.length,
            by: Auth.getCurrentUser()?.email || 'Admin',
            status: 'success'
          });
          renderCleanupTable();
          renderCleanupHistory();
          showToast(`Cleaned up ${expired.length} expired trial account(s)`, 'success');
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: CMS
  // ══════════════════════════════════════════════════════════
  let cmsCurrent = 'faqs';
  let logLevelFilter = 'all';

  function loadCMS() {
    setupCMSTabs();
    renderFAQs();
    renderTestimonials();
    setupFAQModal();
    setupTestimonialModal();

    document.getElementById('save-pricing-content')?.addEventListener('click', () => {
      showToast('Pricing page content saved', 'success');
    });
  }

  function setupCMSTabs() {
    document.querySelectorAll('[data-cms-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-cms-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        cmsCurrent = tab.dataset.cmsTab;

        document.querySelectorAll('.cms-tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`cms-tab-${cmsCurrent}`)?.classList.remove('hidden');
      });
    });
  }

  function renderFAQs() {
    const list = document.getElementById('faq-list');
    const empty = document.getElementById('faq-empty');
    if (!list) return;

    if (localData.faqs.length === 0) {
      list.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    list.innerHTML = localData.faqs.map((faq, i) => `
      <div class="faq-item">
        <span class="faq-drag"><i data-lucide="grip-vertical" width="14" height="14"></i></span>
        <div class="faq-content">
          <div class="faq-question">${esc(faq.question)}</div>
          <div class="faq-answer">${esc(faq.answer)}</div>
        </div>
        <div class="faq-actions">
          <span class="badge ${faq.active ? 'badge-approved' : 'badge-inactive'}">${faq.active ? 'Active' : 'Hidden'}</span>
          <button class="action-btn" title="Toggle Active" onclick="AdminApp.toggleFAQ(${i})"><i data-lucide="toggle-left" width="14" height="14"></i></button>
          <button class="action-btn" title="Edit" onclick="AdminApp.editFAQ(${i})"><i data-lucide="edit-2" width="14" height="14"></i></button>
          <button class="action-btn action-danger" title="Delete" onclick="AdminApp.deleteFAQ(${i})"><i data-lucide="trash-2" width="14" height="14"></i></button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  }

  function setupFAQModal() {
    document.getElementById('add-faq-btn')?.addEventListener('click', () => {
      document.getElementById('faq-modal-title').textContent = 'Add FAQ';
      document.getElementById('faq-edit-id').value = '';
      document.getElementById('faq-question').value = '';
      document.getElementById('faq-answer').value = '';
      document.getElementById('faq-active').checked = true;
      openModal('modal-faq');
    });

    document.getElementById('save-faq-btn')?.addEventListener('click', () => {
      const question = document.getElementById('faq-question').value.trim();
      const answer   = document.getElementById('faq-answer').value.trim();
      if (!question || !answer) { showToast('Question and answer are required', 'error'); return; }

      const editIdx = document.getElementById('faq-edit-id').value;
      const faqData = {
        id: editIdx !== '' ? localData.faqs[parseInt(editIdx)].id : `faq-${Date.now()}`,
        question, answer,
        active: document.getElementById('faq-active').checked
      };

      if (editIdx !== '') {
        localData.faqs[parseInt(editIdx)] = faqData;
      } else {
        localData.faqs.push(faqData);
      }

      closeModal('modal-faq');
      renderFAQs();
      showToast(editIdx !== '' ? 'FAQ updated' : 'FAQ added', 'success');
    });
  }

  function toggleFAQ(idx) {
    localData.faqs[idx].active = !localData.faqs[idx].active;
    renderFAQs();
    showToast('FAQ visibility updated', 'success');
  }

  function editFAQ(idx) {
    const faq = localData.faqs[idx];
    document.getElementById('faq-modal-title').textContent = 'Edit FAQ';
    document.getElementById('faq-edit-id').value = idx;
    document.getElementById('faq-question').value = faq.question;
    document.getElementById('faq-answer').value = faq.answer;
    document.getElementById('faq-active').checked = faq.active;
    openModal('modal-faq');
  }

  function deleteFAQ(idx) {
    showConfirm({
      title: 'Delete FAQ',
      message: 'Delete this FAQ permanently?',
      confirmText: 'Delete',
      dangerous: true,
      onConfirm: () => {
        localData.faqs.splice(idx, 1);
        renderFAQs();
        showToast('FAQ deleted', 'success');
      }
    });
  }

  function renderTestimonials() {
    const list = document.getElementById('testimonials-list');
    if (!list) return;

    list.innerHTML = localData.testimonials.map((t, i) => `
      <div class="testimonial-card">
        <div class="testimonial-stars">
          ${Array.from({length:5}, (_,s) => `<span style="color:${s < t.rating ? '#F59E0B' : '#CBD5E1'}">★</span>`).join('')}
        </div>
        <div class="testimonial-text">"${esc(t.text)}"</div>
        <div class="testimonial-author">${esc(t.name)}</div>
        <div class="testimonial-couple">${esc(t.couple || '')}</div>
        <div class="testimonial-footer">
          <span class="badge ${t.active ? 'badge-approved' : 'badge-inactive'}">${t.active ? 'Active' : 'Hidden'}</span>
          <div class="action-btns">
            <button class="action-btn" title="Edit" onclick="AdminApp.editTestimonial(${i})"><i data-lucide="edit-2" width="14" height="14"></i></button>
            <button class="action-btn action-danger" title="Delete" onclick="AdminApp.deleteTestimonial(${i})"><i data-lucide="trash-2" width="14" height="14"></i></button>
          </div>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  }

  function setupTestimonialModal() {
    document.getElementById('add-testimonial-btn')?.addEventListener('click', () => {
      document.getElementById('testimonial-edit-id').value = '';
      document.getElementById('test-name').value = '';
      document.getElementById('test-couple').value = '';
      document.getElementById('test-text').value = '';
      document.getElementById('test-rating').value = 5;
      openModal('modal-testimonial');
    });

    document.getElementById('save-testimonial-btn')?.addEventListener('click', () => {
      const name = document.getElementById('test-name').value.trim();
      const text = document.getElementById('test-text').value.trim();
      if (!name || !text) { showToast('Name and text are required', 'error'); return; }

      const editIdx = document.getElementById('testimonial-edit-id').value;
      const data = {
        id: editIdx !== '' ? localData.testimonials[parseInt(editIdx)].id : `test-${Date.now()}`,
        name, text,
        couple: document.getElementById('test-couple').value.trim(),
        rating: parseInt(document.getElementById('test-rating').value) || 5,
        active: true,
      };

      if (editIdx !== '') {
        localData.testimonials[parseInt(editIdx)] = data;
      } else {
        localData.testimonials.push(data);
      }

      closeModal('modal-testimonial');
      renderTestimonials();
      showToast(editIdx !== '' ? 'Testimonial updated' : 'Testimonial added', 'success');
    });
  }

  function editTestimonial(idx) {
    const t = localData.testimonials[idx];
    document.getElementById('testimonial-edit-id').value = idx;
    document.getElementById('test-name').value = t.name;
    document.getElementById('test-couple').value = t.couple || '';
    document.getElementById('test-text').value = t.text;
    document.getElementById('test-rating').value = t.rating;
    openModal('modal-testimonial');
  }

  function deleteTestimonial(idx) {
    showConfirm({
      title: 'Delete Testimonial',
      message: 'Delete this testimonial?',
      confirmText: 'Delete',
      dangerous: true,
      onConfirm: () => {
        localData.testimonials.splice(idx, 1);
        renderTestimonials();
        showToast('Testimonial deleted', 'success');
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: REPORTS
  // ══════════════════════════════════════════════════════════
  function loadReports() {
    setTimeout(() => {
      renderLineChart('chart-monthly-signups', {
        labels: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'],
        data: [8, 11, 14, 10, 18, 22, 17, 28, 31, 24, 38, 45],
        label: 'Signups',
        color: '#6366F1',
      });

      renderBarChart('chart-feature-usage', {
        labels: ['RSVP', 'Gallery', 'Table Finder', 'Music', 'Budget'],
        data: [92, 78, 65, 54, 41],
        label: 'Usage %',
        color: '#8B5CF6',
      });

      renderLineChart('chart-rsvp-activity', {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        data: [34, 58, 72, 88, 94, 110],
        label: 'RSVPs',
        color: '#10B981',
      });

      const couples = Store.Users.getCouples();
      const today = new Date();
      const premium = couples.filter(c => c.plan === 'premium').length;
      const basic   = couples.filter(c => c.plan === 'basic').length;
      const trial   = couples.filter(c => c.plan === 'trial').length;
      renderDoughnutChart('chart-plan-dist', {
        labels: ['Trial', 'Basic', 'Premium'],
        data: [Math.max(trial,1), Math.max(basic,1), Math.max(premium,1)],
        colors: ['#F59E0B', '#3B82F6', '#6366F1'],
      });
    }, 50);
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: SETTINGS
  // ══════════════════════════════════════════════════════════
  function loadSettings() {
    const settings = Store.Settings.get();
    setValue('platform-name',    settings.platformName    || '');
    setValue('support-email',    settings.supportEmail    || '');
    setValue('default-trial-days', settings.trialDays     || 7);
    setValue('default-grace',    settings.trialGracePeriod || 3);
    setValue('max-guests-free',  settings.maxGuestsFree   || 50);
    setValue('max-guests-premium', settings.maxGuestsPremium || 500);

    document.getElementById('save-settings-btn')?.addEventListener('click', saveSettings);
  }

  function saveSettings() {
    Store.Settings.save({
      platformName:    document.getElementById('platform-name').value.trim(),
      supportEmail:    document.getElementById('support-email').value.trim(),
      trialDays:       parseInt(document.getElementById('default-trial-days').value) || 7,
      trialGracePeriod:parseInt(document.getElementById('default-grace').value) || 3,
      maxGuestsFree:   parseInt(document.getElementById('max-guests-free').value) || 50,
      maxGuestsPremium:parseInt(document.getElementById('max-guests-premium').value) || 500,
    });
    showToast('Settings saved successfully', 'success');
  }

  // ══════════════════════════════════════════════════════════
  // MODULE: LOGS
  // ══════════════════════════════════════════════════════════
  function loadLogs() {
    setupLogTabs();
    renderErrorLogs();
    renderActivityLog();
    renderInquiries();
    setupLogActions();
  }

  function setupLogTabs() {
    document.querySelectorAll('[data-log-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-log-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.logTab;
        document.querySelectorAll('#module-logs .cms-tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`log-tab-${tabId}`)?.classList.remove('hidden');
      });
    });
  }

  function renderErrorLogs(levelFilter = 'all') {
    const tbody = document.getElementById('error-logs-tbody');
    if (!tbody) return;

    let logs = localData.errorLogs;
    if (levelFilter !== 'all') logs = logs.filter(l => l.level === levelFilter);

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><span class="text-muted" style="font-size:11px">${formatDateTime(l.ts)}</span></td>
        <td><span class="badge badge-${l.level.toLowerCase()}">${l.level}</span></td>
        <td style="max-width:400px;word-break:break-word">${esc(l.message)}</td>
        <td><code style="font-size:10px;color:var(--adm-text-muted)">${esc(l.source)}</code></td>
      </tr>
    `).join('');
  }

  function renderActivityLog() {
    const tbody = document.getElementById('activity-log-tbody');
    if (!tbody) return;
    tbody.innerHTML = localData.activityLog.map(a => `
      <tr>
        <td><span class="text-muted" style="font-size:11px">${formatDateTime(a.ts)}</span></td>
        <td style="font-weight:500">${esc(a.actor)}</td>
        <td>${esc(a.action)}</td>
        <td><span class="text-muted">${esc(a.target)}</span></td>
        <td><code style="font-size:11px">${esc(a.ip)}</code></td>
      </tr>
    `).join('');
  }

  function renderInquiries() {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;
    tbody.innerHTML = localData.inquiries.map(inq => `
      <tr style="cursor:pointer" onclick="AdminApp.viewInquiry('${inq.id}')">
        <td><span class="text-muted">${formatDate(inq.date)}</span></td>
        <td style="font-weight:500">${esc(inq.name)}</td>
        <td><span class="text-muted">${esc(inq.email)}</span></td>
        <td>${esc(inq.subject)}</td>
        <td><span class="badge badge-${inq.status}">${capitalize(inq.status)}</span></td>
        <td>
          <button class="action-btn" title="View" onclick="event.stopPropagation(); AdminApp.viewInquiry('${inq.id}')">
            <i data-lucide="eye" width="14" height="14"></i>
          </button>
        </td>
      </tr>
    `).join('');
    lucide.createIcons();
  }

  function setupLogActions() {
    // Log level filter chips
    document.querySelectorAll('#log-level-filter .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#log-level-filter .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        logLevelFilter = chip.dataset.level;
        renderErrorLogs(logLevelFilter);
      });
    });

    document.getElementById('clear-logs-btn')?.addEventListener('click', () => {
      showConfirm({
        title: 'Clear Error Logs',
        message: 'This will clear all error log entries. This cannot be undone.',
        confirmText: 'Clear Logs',
        dangerous: true,
        onConfirm: () => {
          localData.errorLogs = [];
          renderErrorLogs();
          showToast('Error logs cleared', 'success');
        }
      });
    });
  }

  function viewInquiry(id) {
    const inq = localData.inquiries.find(i => i.id === id);
    if (!inq) return;
    currentInquiryId = id;

    document.getElementById('inquiry-modal-body').innerHTML = `
      <div style="margin-bottom:1rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
          <div>
            <div style="font-weight:600;font-size:var(--text-base)">${esc(inq.name)}</div>
            <div style="font-size:var(--text-sm);color:var(--adm-text-muted)">${esc(inq.email)} · ${formatDate(inq.date)}</div>
          </div>
          <span class="badge badge-${inq.status}">${capitalize(inq.status)}</span>
        </div>
        <div style="font-weight:600;font-size:var(--text-sm);color:var(--adm-text-secondary);margin-bottom:0.5rem">Subject: ${esc(inq.subject)}</div>
        <div style="background:var(--adm-bg-alt);border-radius:var(--radius-lg);padding:1rem;font-size:var(--text-sm);color:var(--adm-text-secondary);line-height:1.7">${esc(inq.message)}</div>
      </div>
    `;

    const markBtn = document.getElementById('mark-replied-btn');
    if (markBtn) {
      markBtn.style.display = inq.status === 'replied' ? 'none' : '';
    }

    openModal('modal-inquiry');
    lucide.createIcons();
  }

  // ═══════════════════════════════════════════════════════════
  // CHART HELPERS
  // ═══════════════════════════════════════════════════════════
  function renderLineChart(canvasId, { labels, data, label, color }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (chartsRendered[canvasId]) {
      chartsRendered[canvasId].destroy();
      delete chartsRendered[canvasId];
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 200);
    gradient.addColorStop(0, color + '33');
    gradient.addColorStop(1, color + '00');

    chartsRendered[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: color,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
          y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8' }, beginAtZero: true }
        }
      }
    });
  }

  function renderBarChart(canvasId, { labels, data, label, color }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (chartsRendered[canvasId]) {
      chartsRendered[canvasId].destroy();
      delete chartsRendered[canvasId];
    }

    chartsRendered[canvasId] = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color + 'CC',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
          y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8' }, beginAtZero: true }
        }
      }
    });
  }

  function renderDoughnutChart(canvasId, { labels, data, colors }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (chartsRendered[canvasId]) {
      chartsRendered[canvasId].destroy();
      delete chartsRendered[canvasId];
    }

    chartsRendered[canvasId] = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { size: 12 }, color: '#475569', usePointStyle: true }
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MODAL SYSTEM
  // ═══════════════════════════════════════════════════════════
  function setupModals() {
    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    // Click outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    // Mark replied
    document.getElementById('mark-replied-btn')?.addEventListener('click', () => {
      if (!currentInquiryId) return;
      const inq = localData.inquiries.find(i => i.id === currentInquiryId);
      if (inq) {
        inq.status = 'replied';
        renderInquiries();
        closeModal('modal-inquiry');
        showToast('Marked as replied', 'success');
      }
    });
  }

  function openModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════════════════
  // CONFIRM DIALOG
  // ═══════════════════════════════════════════════════════════
  function setupConfirmDialog() {
    document.getElementById('confirm-cancel')?.addEventListener('click', () => {
      closeModal('confirm-dialog');
      confirmCallback = null;
    });

    document.getElementById('confirm-ok')?.addEventListener('click', () => {
      closeModal('confirm-dialog');
      if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
      }
    });
  }

  function showConfirm({ title, message, confirmText = 'Confirm', dangerous = true, onConfirm }) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = confirmText;
    okBtn.className = `btn ${dangerous ? 'btn-danger' : 'btn-primary'}`;
    confirmCallback = onConfirm;
    openModal('confirm-dialog');
  }

  // ═══════════════════════════════════════════════════════════
  // TOAST SYSTEM
  // ═══════════════════════════════════════════════════════════
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" width="16" height="16"></i>
      <span>${esc(message)}</span>
      <button class="toast-dismiss" onclick="this.parentElement.remove()">
        <i data-lucide="x" width="14" height="14"></i>
      </button>
    `;
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.animation = 'none';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ═══════════════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════════════
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function formatNum(n) {
    if (n === undefined || n === null) return '0';
    return parseInt(n).toLocaleString();
  }

  function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(d) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function esc(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API (called from inline onclick)
  // ═══════════════════════════════════════════════════════════
  return {
    init,
    // Couples
    viewCouple, toggleSuspend, resetTrial, deleteCouple, updateCouplesTable,
    // Vendors
    viewVendor, approveVendor, rejectVendor, toggleFeature, deleteVendor, updateVendorsTable,
    // Templates
    editTemplate, deleteTemplate, setDefaultTemplate,
    // Plans
    openEditPlan,
    // CMS
    toggleFAQ, editFAQ, deleteFAQ, editTestimonial, deleteTestimonial,
    // Logs
    viewInquiry,
    // Modal
    closeModal,
    // Toast
    showToast,
  };

})();

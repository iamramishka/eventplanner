/**
 * WEDDING PLATFORM — COUPLE DASHBOARD
 * Complete module controller
 */

/* ══════════════════════════════════════════════════════ STATE ══ */
let currentUser = null;
let currentWedding = null;
let currentModule = 'overview';
let countdownInterval = null;
let guestFilterSide = 'all';
let guestFilterStatus = 'all';
let guestSearchQuery = '';
let rsvpFilterStatus = 'all';
let budgetFilterCategory = 'all';
let vendorActiveTab = 'my';
let selectedTheme = null;
let selectedEmoji = '🌸';
let confirmCallback = null;

/* ══════════════════════════════════════════════════════ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
  // Init Lucide icons
  lucide.createIcons();

  // Auth check
  currentUser = Auth.getCurrentUser();
  if (!currentUser || currentUser.role !== 'couple') {
    showLoginModal();
    return;
  }
  initDashboard();
});

function showLoginModal() {
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('app').classList.add('hidden');
  setupLoginForm();
  lucide.createIcons();
}

function hiddenLoginModal() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  const toggleBtn = document.getElementById('togglePassword');
  const pwInput = document.getElementById('loginPassword');

  toggleBtn.addEventListener('click', () => {
    const isText = pwInput.type === 'text';
    pwInput.type = isText ? 'password' : 'text';
    toggleBtn.innerHTML = isText
      ? '<i data-lucide="eye"></i>'
      : '<i data-lucide="eye-off"></i>';
    lucide.createIcons();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
      showLoginError('Please fill in all fields.');
      return;
    }

    const result = Auth.login(email, password);
    if (!result.success) {
      showLoginError(result.error || 'Invalid credentials.');
      return;
    }

    if (result.user.role !== 'couple') {
      Auth.logout();
      showLoginError('This portal is for couples only.');
      return;
    }

    errorEl.classList.add('hidden');
    currentUser = result.user;
    hiddenLoginModal();
    initDashboard();
  });
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function initDashboard() {
  currentWedding = Store.Weddings.getByUserId(currentUser.id);
  if (!currentWedding) {
    showToast('No wedding data found. Please contact support.', 'error');
    return;
  }

  setupTopBar();
  setupSidebar();
  setupUserDropdown();
  setupLogout();
  navigateTo('overview');
}

/* ══════════════════════════════════════════════ TOP BAR SETUP ══ */
function setupTopBar() {
  const w = currentWedding;
  const title = w.title || `${w.brideName} & ${w.groomName}'s Wedding`;
  document.getElementById('topBarTitle').textContent = title;

  const days = Auth.getTrialDaysLeft();
  const trialBadge = document.getElementById('trialBadge');
  trialBadge.textContent = currentUser.plan === 'trial'
    ? `Trial · ${days} day${days !== 1 ? 's' : ''} left`
    : 'Premium';
  trialBadge.style.background = currentUser.plan !== 'trial'
    ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
    : '';

  const initials = getInitials(currentUser.name || 'P K');
  document.getElementById('userAvatarInitials').textContent = initials;
  document.getElementById('dropdownUserName').textContent = currentUser.name;
  document.getElementById('dropdownUserEmail').textContent = currentUser.email;

  // Preview btn
  const slug = w.slug || '';
  document.getElementById('previewInvitationBtn').href = `../invitation/index.html?slug=${slug}`;

  // Sidebar info
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarWeddingNames').textContent = `${w.brideName} & ${w.groomName}`;
  document.getElementById('sidebarWeddingDate').textContent = formatDate(w.date);

  const sidebarTrialText = document.getElementById('sidebarTrialText');
  if (currentUser.plan === 'trial') {
    sidebarTrialText.textContent = `Trial: ${days} days left`;
  } else {
    document.getElementById('sidebarTrial').style.display = 'none';
  }
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

/* ════════════════════════════════════════════════ SIDEBAR ══ */
function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const close = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
  });

  close.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const module = item.dataset.module;
      if (module) {
        navigateTo(module);
        closeSidebar();
      }
    });
  });
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
}

/* ══════════════════════════════════════════════ USER DROPDOWN ══ */
function setupUserDropdown() {
  const btn = document.getElementById('userAvatarBtn');
  const dropdown = document.getElementById('userDropdown');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !dropdown.classList.contains('hidden');
    dropdown.classList.toggle('hidden', isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!document.getElementById('userDropdownWrap').contains(e.target)) {
      dropdown.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    confirmAction('Are you sure you want to sign out?', () => Auth.logout());
  });
  document.getElementById('accountLogoutBtn').addEventListener('click', () => {
    confirmAction('Are you sure you want to sign out?', () => Auth.logout());
  });
}

/* ══════════════════════════════════════════════ NAVIGATION ══ */
function navigateTo(moduleName) {
  // Hide all modules
  document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));

  // Show target
  const target = document.getElementById(`module-${moduleName}`);
  if (!target) return;
  target.classList.remove('hidden');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.module === moduleName);
  });

  currentModule = moduleName;

  // Load module data
  switch (moduleName) {
    case 'overview':    loadOverview(); break;
    case 'settings':    loadWeddingSettings(); break;
    case 'guests':      loadGuests(); break;
    case 'rsvps':       loadRsvps(); break;
    case 'invitation':  loadInvitation(); break;
    case 'visibility':  loadVisibility(); break;
    case 'theme':       loadTheme(); break;
    case 'gallery':     loadGallery(); break;
    case 'music':       loadMusic(); break;
    case 'agenda':      loadAgenda(); break;
    case 'tables':      loadTables(); break;
    case 'budget':      loadBudget(); break;
    case 'checklist':   loadChecklist(); break;
    case 'vendors':     loadVendors(); break;
    case 'account':     loadAccount(); break;
  }
}

/* ════════════════════════════════════════ MODULE 1: OVERVIEW ══ */
function loadOverview() {
  const weddingId = currentWedding.id;
  const stats = Store.RSVPs.getStats(weddingId);
  const budget = Store.Budget.getSummary(weddingId);
  const checklistPct = Store.Checklist.getProgress(weddingId);
  const tables = Store.Tables.getAll(weddingId);

  // KPIs
  setText('kpi-totalGuests', stats.total);
  setText('kpi-confirmed', stats.confirmed);
  setText('kpi-pending', stats.pending);
  setText('kpi-declined', stats.declined);
  setText('kpi-attending', stats.totalAttending);

  const budgetPct = budget.totalEstimated > 0
    ? Math.round((budget.totalActual / budget.totalEstimated) * 100)
    : 0;
  setText('kpi-budgetPct', budgetPct + '%');
  setText('kpi-checklistPct', checklistPct + '%');
  document.getElementById('kpi-checklistBar').style.width = checklistPct + '%';
  setText('kpi-tables', tables.length);

  // Countdown
  startCountdown(currentWedding.date);
  const countdownDateEl = document.getElementById('countdownWeddingDate');
  if (countdownDateEl) countdownDateEl.textContent = formatDate(currentWedding.date);

  // Recent activity
  renderRecentActivity(weddingId);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function startCountdown(dateStr) {
  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      setText('cd-days', '00'); setText('cd-hours', '00');
      setText('cd-mins', '00'); setText('cd-secs', '00');
      clearInterval(countdownInterval);
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    setText('cd-days',  pad(days));
    setText('cd-hours', pad(hours));
    setText('cd-mins',  pad(mins));
    setText('cd-secs',  pad(secs));
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

function pad(n) { return String(n).padStart(2, '0'); }

function renderRecentActivity(weddingId) {
  const container = document.getElementById('recentActivity');
  const guests = Store.Guests.getAll(weddingId);
  const rsvps = Store.RSVPs.getAll(weddingId)
    .filter(r => r.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  if (!rsvps.length) {
    container.innerHTML = '<div class="empty-state-sm"><i data-lucide="inbox"></i> No RSVP activity yet</div>';
    lucide.createIcons();
    return;
  }

  container.innerHTML = rsvps.map(r => {
    const guest = guests.find(g => g.id === r.guestId);
    const name = guest ? guest.name : 'Unknown Guest';
    const statusColor = r.status === 'confirmed' ? 'activity-icon' : r.status === 'declined' ? 'activity-icon' : 'activity-icon';
    const iconBg = r.status === 'confirmed' ? 'background:#D1FAE5;color:#10B981' : r.status === 'declined' ? 'background:#FEE2E2;color:#EF4444' : 'background:#FEF3C7;color:#F59E0B';
    const icon = r.status === 'confirmed' ? 'check-circle' : r.status === 'declined' ? 'x-circle' : 'clock';
    const time = r.updatedAt ? timeAgo(r.updatedAt) : '';
    const detail = r.status === 'confirmed'
      ? `Confirmed · ${r.attendingCount} attending`
      : r.status === 'declined'
      ? 'Declined the invitation'
      : 'Pending response';

    return `
      <div class="activity-item">
        <div class="activity-icon" style="${iconBg};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i data-lucide="${icon}" style="width:16px;height:16px;"></i>
        </div>
        <div class="activity-text">
          <div class="activity-name">${escHtml(name)}</div>
          <div class="activity-detail">${detail} · ${time}</div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

/* ═══════════════════════════════ MODULE 2: WEDDING SETTINGS ══ */
function loadWeddingSettings() {
  const w = currentWedding;
  const fields = ['groomName', 'brideName', 'date', 'time', 'timezone', 'venueName', 'venueAddress', 'venueMapLink', 'rsvpDeadline', 'contactEmail', 'contactWhatsApp', 'slug', 'story'];

  fields.forEach(f => {
    const el = document.getElementById(`ws-${f}`);
    if (el) el.value = w[f] || '';
  });

  document.getElementById('ws-title').value = w.title || '';

  updatePublicUrl();

  // Char counter for story
  const storyEl = document.getElementById('ws-story');
  const storyCount = document.getElementById('ws-storyCount');
  if (storyEl && storyCount) {
    storyCount.textContent = storyEl.value.length;
    storyEl.addEventListener('input', () => {
      storyCount.textContent = storyEl.value.length;
    });
  }

  // Update public URL on slug change
  const slugEl = document.getElementById('ws-slug');
  if (slugEl) {
    slugEl.addEventListener('input', updatePublicUrl);
  }
}

function updatePublicUrl() {
  const slugEl = document.getElementById('ws-slug');
  const urlText = document.getElementById('ws-publicUrlText');
  if (slugEl && urlText) {
    const slug = slugEl.value.trim() || 'your-wedding-slug';
    urlText.textContent = `${window.location.origin}/../invitation/index.html?slug=${slug}`;
  }
}

function copyPublicUrl() {
  const urlText = document.getElementById('ws-publicUrlText');
  if (urlText) {
    navigator.clipboard.writeText(urlText.textContent).then(() => {
      showToast('Public URL copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Could not copy URL.', 'error');
    });
  }
}

function saveWeddingSettings() {
  const groomName = document.getElementById('ws-groomName').value.trim();
  const brideName = document.getElementById('ws-brideName').value.trim();
  const date = document.getElementById('ws-date').value;

  if (!groomName || !brideName) {
    showToast('Please fill in the groom and bride names.', 'error');
    return;
  }

  const updated = {
    ...currentWedding,
    groomName,
    brideName,
    title: document.getElementById('ws-title').value.trim() || `The Wedding of ${brideName} & ${groomName}`,
    date,
    time: document.getElementById('ws-time').value,
    timezone: document.getElementById('ws-timezone').value,
    venueName: document.getElementById('ws-venueName').value.trim(),
    venueAddress: document.getElementById('ws-venueAddress').value.trim(),
    venueMapLink: document.getElementById('ws-venueMapLink').value.trim(),
    rsvpDeadline: document.getElementById('ws-rsvpDeadline').value,
    contactEmail: document.getElementById('ws-contactEmail').value.trim(),
    contactWhatsApp: document.getElementById('ws-contactWhatsApp').value.trim(),
    slug: document.getElementById('ws-slug').value.trim(),
    story: document.getElementById('ws-story').value.trim(),
  };

  currentWedding = Store.Weddings.save(updated);
  setupTopBar();
  showToast('Wedding settings saved successfully!', 'success');
}

/* ══════════════════════════════ MODULE 3: GUEST MANAGEMENT ══ */
function loadGuests() {
  setupGuestFilters();
  renderGuestTable();
}

function setupGuestFilters() {
  // Side tabs
  document.querySelectorAll('#guestSideTabs .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#guestSideTabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      guestFilterSide = tab.dataset.side;
      renderGuestTable();
    });
  });

  // Status chips
  document.querySelectorAll('#guestStatusChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#guestStatusChips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      guestFilterStatus = chip.dataset.status;
      renderGuestTable();
    });
  });

  // Search
  const searchEl = document.getElementById('guestSearch');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      guestSearchQuery = e.target.value.toLowerCase();
      renderGuestTable();
    });
  }
}

function renderGuestTable() {
  const guests = Store.Guests.getAll(currentWedding.id);
  const rsvps = Store.RSVPs.getAll(currentWedding.id);

  let filtered = guests;

  if (guestFilterSide !== 'all') {
    filtered = filtered.filter(g => g.side === guestFilterSide);
  }

  if (guestFilterStatus !== 'all') {
    filtered = filtered.filter(g => {
      const rsvp = rsvps.find(r => r.guestId === g.id);
      const status = rsvp ? rsvp.status : 'pending';
      return status === guestFilterStatus;
    });
  }

  if (guestSearchQuery) {
    filtered = filtered.filter(g =>
      g.name.toLowerCase().includes(guestSearchQuery) ||
      (g.whatsapp && g.whatsapp.includes(guestSearchQuery))
    );
  }

  // Update count badge
  const countEl = document.getElementById('guestCountAll');
  if (countEl) countEl.textContent = guests.length;

  const tbody = document.getElementById('guestTableBody');
  const emptyState = document.getElementById('guestEmptyState');

  if (!filtered.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = filtered.map(g => {
    const rsvp = rsvps.find(r => r.guestId === g.id);
    const status = rsvp ? rsvp.status : 'pending';
    const statusBadge = getRsvpStatusBadge(status);
    const sideBadge = g.side === 'bride'
      ? '<span class="badge badge-rose">Bride</span>'
      : '<span class="badge badge-indigo">Groom</span>';
    const typeBadge = g.invitationType === 'family'
      ? '<span class="badge badge-purple">Family</span>'
      : '<span class="badge badge-slate">Individual</span>';

    const inviteLink = getInviteLink(g);

    return `
      <tr>
        <td><span class="fw-semi">${escHtml(g.name)}</span></td>
        <td>${sideBadge}</td>
        <td><a href="tel:${g.whatsapp}" style="color:var(--adm-info)">${escHtml(g.whatsapp || '—')}</a></td>
        <td>${typeBadge}</td>
        <td style="text-align:center;">${g.maxMembers || 1}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button class="action-btn success" title="Copy invite link" onclick="copyInviteLink('${g.token}')">
              <i data-lucide="link"></i>
            </button>
            <button class="action-btn" title="WhatsApp" onclick="openWhatsApp('${g.whatsapp}', '${escHtml(g.name)}')">
              <i data-lucide="message-circle"></i>
            </button>
            <button class="action-btn" title="Edit guest" onclick="openGuestModal('${g.id}')">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="action-btn danger" title="Delete guest" onclick="deleteGuest('${g.id}', '${escHtml(g.name)}')">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function getRsvpStatusBadge(status) {
  const map = {
    confirmed: '<span class="badge badge-green"><i data-lucide="check" style="width:10px;height:10px;"></i> Confirmed</span>',
    pending:   '<span class="badge badge-amber"><i data-lucide="clock" style="width:10px;height:10px;"></i> Pending</span>',
    declined:  '<span class="badge badge-red"><i data-lucide="x" style="width:10px;height:10px;"></i> Declined</span>',
  };
  return map[status] || map.pending;
}

function getInviteLink(guest) {
  const slug = currentWedding.slug || '';
  return `${window.location.origin}/../invitation/index.html?slug=${slug}&t=${guest.token}`;
}

function copyInviteLink(token) {
  const guest = Store.Guests.getAll(currentWedding.id).find(g => g.token === token);
  if (!guest) return;
  const link = getInviteLink(guest);
  navigator.clipboard.writeText(link).then(() => {
    showToast('Invite link copied to clipboard!', 'success');
  }).catch(() => showToast('Could not copy link.', 'error'));
}

function openWhatsApp(phone, name) {
  if (!phone) { showToast('No WhatsApp number available.', 'warning'); return; }
  const msg = encodeURIComponent(`Hi ${name}, we'd love to invite you to our wedding! Please find your personal invitation link attached.`);
  const cleanPhone = phone.replace(/\D/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
}

function openGuestModal(guestId) {
  const modal = document.getElementById('guestModal');
  const titleEl = document.getElementById('guestModalTitle');
  const idEl = document.getElementById('guestModalId');

  if (guestId) {
    const guest = Store.Guests.getById(guestId);
    if (!guest) return;
    titleEl.textContent = 'Edit Guest';
    idEl.value = guestId;
    document.getElementById('gm-name').value = guest.name || '';
    document.getElementById('gm-side').value = guest.side || 'bride';
    document.getElementById('gm-type').value = guest.invitationType || 'individual';
    document.getElementById('gm-whatsapp').value = guest.whatsapp || '';
    document.getElementById('gm-email').value = guest.email || '';
    document.getElementById('gm-maxMembers').value = guest.maxMembers || 1;
    document.getElementById('gm-notes').value = guest.notes || '';
  } else {
    titleEl.textContent = 'Add Guest';
    idEl.value = '';
    document.getElementById('gm-name').value = '';
    document.getElementById('gm-side').value = 'bride';
    document.getElementById('gm-type').value = 'individual';
    document.getElementById('gm-whatsapp').value = '+94';
    document.getElementById('gm-email').value = '';
    document.getElementById('gm-maxMembers').value = '1';
    document.getElementById('gm-notes').value = '';
  }

  openModal('guestModal');
}

function saveGuest() {
  const name = document.getElementById('gm-name').value.trim();
  const whatsapp = document.getElementById('gm-whatsapp').value.trim();

  if (!name) { showToast('Guest name is required.', 'error'); return; }
  if (!whatsapp || whatsapp === '+94') { showToast('WhatsApp number is required.', 'error'); return; }

  const guestId = document.getElementById('guestModalId').value;
  const existing = guestId ? Store.Guests.getById(guestId) : null;

  const guest = {
    ...(existing || {}),
    id: guestId || undefined,
    weddingId: currentWedding.id,
    name,
    side: document.getElementById('gm-side').value,
    invitationType: document.getElementById('gm-type').value,
    whatsapp,
    email: document.getElementById('gm-email').value.trim(),
    maxMembers: parseInt(document.getElementById('gm-maxMembers').value) || 1,
    notes: document.getElementById('gm-notes').value.trim(),
  };

  Store.Guests.save(guest);

  // Auto-create pending RSVP if new guest
  if (!guestId) {
    const newGuest = Store.Guests.getAll(currentWedding.id).find(g => g.name === name && g.whatsapp === whatsapp);
    if (newGuest && !Store.RSVPs.getByGuest(newGuest.id)) {
      Store.RSVPs.save({
        guestId: newGuest.id,
        weddingId: currentWedding.id,
        status: 'pending',
        attendingCount: 0,
        liquorPreference: '',
        mealPreference: '',
        notes: '',
      });
    }
  }

  closeModal('guestModal');
  showToast(guestId ? 'Guest updated successfully!' : 'Guest added successfully!', 'success');
  renderGuestTable();
}

function deleteGuest(guestId, name) {
  confirmAction(`Delete "${name}" from your guest list?`, () => {
    Store.Guests.delete(guestId);
    showToast('Guest deleted.', 'success');
    renderGuestTable();
    if (currentModule === 'rsvps') loadRsvps();
  });
}

/* ══════════════════════════════ MODULE 4: RSVP MANAGEMENT ══ */
function loadRsvps() {
  setupRsvpFilters();
  renderRsvpSummary();
  renderRsvpTable();
}

function setupRsvpFilters() {
  document.querySelectorAll('#rsvpStatusTabs .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#rsvpStatusTabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      rsvpFilterStatus = tab.dataset.status;
      renderRsvpTable();
    });
  });
}

function renderRsvpSummary() {
  const stats = Store.RSVPs.getStats(currentWedding.id);
  setText('rs-attending', stats.confirmed);
  setText('rs-people', stats.totalAttending);
  setText('rs-pending', stats.pending);
  setText('rs-declined', stats.declined);
  setText('rs-liquor', stats.liquorYes);

  const rate = stats.total > 0 ? Math.round(((stats.confirmed + stats.declined) / stats.total) * 100) : 0;
  setText('rsvpRateText', rate + '%');
  document.getElementById('rsvpRateBar').style.width = rate + '%';
}

function renderRsvpTable() {
  const guests = Store.Guests.getAll(currentWedding.id);
  const rsvps = Store.RSVPs.getAll(currentWedding.id);

  const rows = guests.map(g => {
    const rsvp = rsvps.find(r => r.guestId === g.id) || { status: 'pending', attendingCount: 0, mealPreference: '', liquorPreference: '', notes: '', updatedAt: '' };
    return { guest: g, rsvp };
  }).filter(({ rsvp }) => rsvpFilterStatus === 'all' || rsvp.status === rsvpFilterStatus);

  const tbody = document.getElementById('rsvpTableBody');
  const emptyState = document.getElementById('rsvpEmptyState');

  if (!rows.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = rows.map(({ guest: g, rsvp: r }) => {
    const sideBadge = g.side === 'bride'
      ? '<span class="badge badge-rose">Bride</span>'
      : '<span class="badge badge-indigo">Groom</span>';
    const statusBadge = getRsvpStatusBadge(r.status);
    const meal = r.mealPreference ? r.mealPreference.replace('-', ' ') : '—';
    const liquor = r.liquorPreference ? r.liquorPreference : '—';
    const updated = r.updatedAt ? timeAgo(r.updatedAt) : '—';

    return `
      <tr>
        <td><span class="fw-semi">${escHtml(g.name)}</span></td>
        <td>${sideBadge}</td>
        <td>${statusBadge}</td>
        <td style="text-align:center;">${r.status === 'confirmed' ? r.attendingCount : '—'}</td>
        <td>${meal}</td>
        <td>${liquor}</td>
        <td style="max-width:180px;" title="${escHtml(r.notes || '')}"><span class="truncate">${escHtml(r.notes || '—')}</span></td>
        <td style="white-space:nowrap;">${updated}</td>
        <td>
          <div class="row-actions">
            <button class="action-btn success" title="Copy invite link" onclick="copyInviteLink('${g.token}')">
              <i data-lucide="link"></i>
            </button>
            <button class="action-btn" title="WhatsApp" onclick="openWhatsApp('${g.whatsapp}', '${escHtml(g.name)}')">
              <i data-lucide="message-circle"></i>
            </button>
            <button class="action-btn" title="Mark RSVP manually" onclick="openRsvpModal('${g.id}')">
              <i data-lucide="edit-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openRsvpModal(guestId) {
  const rsvp = Store.RSVPs.getByGuest(guestId);
  document.getElementById('rsvpModalGuestId').value = guestId;
  document.getElementById('rm-status').value = rsvp ? rsvp.status : 'pending';
  document.getElementById('rm-count').value = rsvp ? rsvp.attendingCount : 1;
  document.getElementById('rm-meal').value = rsvp ? rsvp.mealPreference : '';
  document.getElementById('rm-liquor').value = rsvp ? rsvp.liquorPreference : '';
  document.getElementById('rm-notes').value = rsvp ? rsvp.notes : '';
  openModal('rsvpModal');
}

function saveRsvpManual() {
  const guestId = document.getElementById('rsvpModalGuestId').value;
  Store.RSVPs.save({
    guestId,
    weddingId: currentWedding.id,
    status: document.getElementById('rm-status').value,
    attendingCount: parseInt(document.getElementById('rm-count').value) || 0,
    mealPreference: document.getElementById('rm-meal').value,
    liquorPreference: document.getElementById('rm-liquor').value,
    notes: document.getElementById('rm-notes').value.trim(),
  });

  closeModal('rsvpModal');
  showToast('RSVP updated successfully!', 'success');
  renderRsvpSummary();
  renderRsvpTable();
}

/* ══════════════════════════ MODULE 5: INVITATION EDITOR ══ */
function loadInvitation() {
  const settings = currentWedding.siteSettings || {};
  const w = currentWedding;

  document.getElementById('inv-coupleNames').value = `${w.brideName} & ${w.groomName}`;
  document.getElementById('inv-heroMessage').value = settings.heroMessage || '';
  document.getElementById('inv-rsvpTitle').value = settings.rsvpSectionTitle || 'Will You Join Us?';
  document.getElementById('inv-specialMessage').value = settings.specialMessage || '';
  document.getElementById('inv-heroTitle').value = settings.heroTitle || '';

  // Setup char counters
  setupCharCounter('inv-heroTitle', 'inv-heroTitleCount', 120);
  setupCharCounter('inv-heroMessage', 'inv-heroMessageCount', 500);
  setupCharCounter('inv-rsvpTitle', 'inv-rsvpTitleCount', 80);
  setupCharCounter('inv-specialMessage', 'inv-specialMessageCount', 300);

  // Load preview
  loadInvitationPreview();
}

function setupCharCounter(inputId, counterId, maxLen) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (input && counter) {
    counter.textContent = input.value.length;
    if (maxLen) counter.parentElement.querySelector('.char-counter') && (counter.nextSibling ? '' : '');
    input.addEventListener('input', () => {
      counter.textContent = input.value.length;
    });
  }
}

function loadInvitationPreview() {
  const iframe = document.getElementById('invitationPreviewIframe');
  if (iframe && currentWedding.slug) {
    iframe.src = `../invitation/index.html?slug=${currentWedding.slug}`;
  }
}

function saveInvitationContent() {
  Store.Weddings.updateSettings(currentWedding.id, {
    heroTitle: document.getElementById('inv-heroTitle').value.trim(),
    heroMessage: document.getElementById('inv-heroMessage').value.trim(),
    rsvpSectionTitle: document.getElementById('inv-rsvpTitle').value.trim(),
    specialMessage: document.getElementById('inv-specialMessage').value.trim(),
  });

  currentWedding = Store.Weddings.getByUserId(currentUser.id);
  showToast('Invitation content saved!', 'success');
  reloadPreviewIframe();
}

function reloadPreviewIframe() {
  const iframe = document.getElementById('invitationPreviewIframe');
  if (iframe) {
    iframe.src = iframe.src;
  }
}

/* ═══════════════════════════ MODULE 6: SECTION VISIBILITY ══ */
const VISIBILITY_ITEMS = [
  { key: 'showLoadingScreen', icon: 'loader', label: 'Loading Screen', desc: 'Show animated loading screen' },
  { key: 'showEnvelope',      icon: 'mail',   label: 'Envelope / Cover', desc: 'Display the envelope opening animation' },
  { key: 'showCountdown',     icon: 'clock',  label: 'Countdown Timer', desc: 'Show live countdown to your wedding' },
  { key: 'showAgenda',        icon: 'calendar', label: 'Agenda / Timeline', desc: 'Display the event schedule' },
  { key: 'showRsvp',          icon: 'check-square', label: 'RSVP Section', desc: 'Let guests submit their responses' },
  { key: 'showGallery',       icon: 'image',  label: 'Gallery', desc: 'Show your photo gallery' },
  { key: 'showTableFinder',   icon: 'table-2', label: 'Table Finder', desc: 'Help guests find their assigned table' },
  { key: 'showGuestPreview',  icon: 'users',  label: 'Guest Preview', desc: 'Show list of confirmed guests' },
  { key: 'showStory',         icon: 'book-open', label: 'Our Story', desc: 'Display your love story section' },
  { key: 'showMusic',         icon: 'music',  label: 'Background Music', desc: 'Enable ambient music' },
  { key: 'showSpecialMessage',icon: 'message-square', label: 'Special Message', desc: 'Show a special note to guests' },
  { key: 'showVenueMap',      icon: 'map-pin', label: 'Venue Map', desc: 'Display venue map link' },
];

function loadVisibility() {
  const settings = currentWedding.siteSettings || {};
  const container = document.getElementById('visibilityList');

  container.innerHTML = VISIBILITY_ITEMS.map(item => `
    <div class="visibility-item">
      <div class="visibility-info">
        <div class="visibility-icon">
          <i data-lucide="${item.icon}"></i>
        </div>
        <div>
          <div class="visibility-label">${item.label}</div>
          <div class="visibility-desc">${item.desc}</div>
        </div>
      </div>
      <label class="toggle-switch" aria-label="Toggle ${item.label}">
        <input type="checkbox" id="vis-${item.key}" ${settings[item.key] !== false ? 'checked' : ''}
          onchange="toggleVisibility('${item.key}', this.checked)" />
        <span class="toggle-thumb"></span>
      </label>
    </div>
  `).join('');

  lucide.createIcons();
}

function toggleVisibility(key, value) {
  Store.Weddings.updateSettings(currentWedding.id, { [key]: value });
  currentWedding = Store.Weddings.getByUserId(currentUser.id);
  showToast(`${value ? 'Enabled' : 'Hidden'} successfully!`, 'success');
}

/* ══════════════════════════════ MODULE 7: THEME & DESIGN ══ */
const THEME_COLORS = {
  'ivory-rose':     { primaryColor: '#C45A74', secondaryColor: '#C9A574', accentColor: '#8FA98F', surfaceColor: '#FCF8F6' },
  'blush-gold':     { primaryColor: '#E8A4A4', secondaryColor: '#D4AF37', accentColor: '#F0D0C0', surfaceColor: '#FFF5F5' },
  'lavender-bloom': { primaryColor: '#9B7EC8', secondaryColor: '#C0C0C0', accentColor: '#D4B8E0', surfaceColor: '#F8F6FF' },
  'sage-elegance':  { primaryColor: '#8FA98F', secondaryColor: '#C9B99A', accentColor: '#A9C5A0', surfaceColor: '#F5F2EE' },
  'midnight-classic':{ primaryColor: '#C9A574', secondaryColor: '#1E293B', accentColor: '#E8D5B0', surfaceColor: '#F8FAFC' },
};

function loadTheme() {
  const settings = currentWedding.siteSettings || {};

  // Select current theme
  selectedTheme = settings.theme || 'ivory-rose';
  document.querySelectorAll('.theme-preset').forEach(card => {
    card.classList.toggle('selected', card.dataset.theme === selectedTheme);
  });

  // Color pickers
  const colors = ['primaryColor', 'secondaryColor', 'accentColor', 'surfaceColor'];
  colors.forEach(c => {
    const input = document.getElementById(`theme-${c}`);
    const hex   = document.getElementById(`theme-${c.replace('Color', 'Hex')}`);
    if (input && settings[c]) {
      input.value = settings[c];
      if (hex) hex.textContent = settings[c];
    }
    if (input) {
      input.addEventListener('input', () => {
        if (hex) hex.textContent = input.value;
      });
    }
  });

  const fontEl = document.getElementById('theme-fontStyle');
  if (fontEl && settings.fontStyle) fontEl.value = settings.fontStyle;
}

function selectTheme(card) {
  document.querySelectorAll('.theme-preset').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedTheme = card.dataset.theme;

  // Update color pickers to match
  const colors = THEME_COLORS[selectedTheme];
  if (colors) {
    Object.entries(colors).forEach(([key, val]) => {
      const input = document.getElementById(`theme-${key}`);
      const hex   = document.getElementById(`theme-${key.replace('Color', 'Hex')}`);
      if (input) input.value = val;
      if (hex) hex.textContent = val;
    });
  }
}

function applyTheme() {
  const settings = {
    theme: selectedTheme,
    primaryColor: document.getElementById('theme-primaryColor').value,
    secondaryColor: document.getElementById('theme-secondaryColor').value,
    accentColor: document.getElementById('theme-accentColor').value,
    surfaceColor: document.getElementById('theme-surfaceColor').value,
    fontStyle: document.getElementById('theme-fontStyle').value,
  };

  Store.Weddings.updateSettings(currentWedding.id, settings);
  currentWedding = Store.Weddings.getByUserId(currentUser.id);
  showToast('Theme applied and saved!', 'success');
}

/* ══════════════════════════════ MODULE 8: GALLERY MANAGER ══ */
let galleryActiveType = 'hero';

function loadGallery() {
  setupGalleryTabs();
  renderGalleryTabContent(galleryActiveType);
}

function setupGalleryTabs() {
  document.querySelectorAll('#galleryTypeTabs .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#galleryTypeTabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      galleryActiveType = tab.dataset.type;
      renderGalleryTabContent(galleryActiveType);
    });
  });
}

function renderGalleryTabContent(type) {
  const container = document.getElementById('galleryTabContent');
  const images = Store.Gallery.getByType(currentWedding.id, type);
  const maxImages = type === 'hero' || type === 'banner' ? 1 : 20;

  container.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem;">
      <div class="upload-area" id="uploadArea-${type}" onclick="triggerFileInput('${type}')">
        <input type="file" id="fileInput-${type}" accept="image/*" style="display:none;"
          ${type === 'gallery' ? 'multiple' : ''}
          onchange="handleFileUpload(this, '${type}')" />
        <div class="upload-icon"><i data-lucide="upload-cloud"></i></div>
        <div class="upload-title">Click to upload ${type === 'gallery' ? 'photos' : 'image'}</div>
        <div class="upload-subtitle">PNG, JPG up to 5MB${type === 'hero' || type === 'banner' ? ' · Only 1 image' : ''}</div>
      </div>

      ${images.length > 0 ? `
        <div class="gallery-grid">
          ${images.map(img => `
            <div class="gallery-img-card">
              <img src="${img.url}" alt="${escHtml(img.caption || 'Image')}" loading="lazy"
                onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'80\\'><rect fill=\\'%23f1f5f9\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%2394a3b8\\' font-size=\\'12\\'>No Image</text></svg>'" />
              <div class="gallery-img-actions">
                <button class="action-btn danger" style="background:rgba(255,255,255,0.9);box-shadow:var(--shadow-sm);" title="Delete image"
                  onclick="deleteGalleryImage('${img.id}')">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
              <div class="gallery-img-label">${escHtml(img.caption || type)}</div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state-sm" style="padding:1.5rem 0 0;"><i data-lucide="image"></i> No images uploaded yet</div>'}
    </div>
  `;

  lucide.createIcons();

  // Drag-and-drop
  const uploadArea = document.getElementById(`uploadArea-${type}`);
  if (uploadArea) {
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      files.forEach(file => processImageFile(file, type));
    });
  }
}

function triggerFileInput(type) {
  document.getElementById(`fileInput-${type}`)?.click();
}

function handleFileUpload(input, type) {
  const files = Array.from(input.files);
  files.forEach(file => processImageFile(file, type));
  input.value = '';
}

function processImageFile(file, type) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB.', 'error'); return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    Store.Gallery.save({
      weddingId: currentWedding.id,
      type,
      url: e.target.result,
      caption: file.name.replace(/\.[^.]+$/, ''),
      order: Date.now(),
    });
    renderGalleryTabContent(type);
    showToast('Image uploaded successfully!', 'success');
  };
  reader.readAsDataURL(file);
}

function deleteGalleryImage(imgId) {
  confirmAction('Delete this image?', () => {
    Store.Gallery.delete(imgId);
    renderGalleryTabContent(galleryActiveType);
    showToast('Image deleted.', 'success');
  });
}

/* ══════════════════════════════ MODULE 9: MUSIC SETTINGS ══ */
function loadMusic() {
  const settings = currentWedding.siteSettings || {};
  const enabledEl = document.getElementById('music-enabled');
  const trackEl = document.getElementById('music-track');
  const muteEl = document.getElementById('music-muteDefault');

  if (enabledEl) enabledEl.checked = !!settings.musicEnabled;
  if (trackEl) trackEl.value = settings.musicTrack || 'canon-in-d';
  if (muteEl) muteEl.checked = !!settings.musicMuteDefault;

  toggleMusicSettings();
}

function toggleMusicSettings() {
  const enabled = document.getElementById('music-enabled')?.checked;
  const musicSettings = document.getElementById('musicSettings');
  if (musicSettings) {
    musicSettings.classList.toggle('hidden', !enabled);
  }
}

function saveMusicSettings() {
  Store.Weddings.updateSettings(currentWedding.id, {
    musicEnabled: document.getElementById('music-enabled').checked,
    musicTrack: document.getElementById('music-track').value,
    musicMuteDefault: document.getElementById('music-muteDefault').checked,
  });
  currentWedding = Store.Weddings.getByUserId(currentUser.id);
  showToast('Music settings saved!', 'success');
}

/* ════════════════════════════ MODULE 10: AGENDA / TIMELINE ══ */
function loadAgenda() {
  renderAgendaList();
  setupEmojiPicker();
}

function renderAgendaList() {
  const items = Store.Agenda.getAll(currentWedding.id);
  const container = document.getElementById('agendaList');
  const emptyState = document.getElementById('agendaEmptyState');

  if (!items.length) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = items.map(item => `
    <div class="agenda-event-card">
      <div class="agenda-event-icon">${item.icon || '🎊'}</div>
      <div class="agenda-event-info">
        <div class="agenda-event-title">${escHtml(item.title)}</div>
        <div class="agenda-event-meta">
          ${item.time ? `<div class="agenda-meta-item"><i data-lucide="clock"></i>${item.time}</div>` : ''}
          ${item.duration ? `<div class="agenda-meta-item"><i data-lucide="timer"></i>${item.duration} min</div>` : ''}
        </div>
        ${item.description ? `<div class="agenda-event-desc">${escHtml(item.description)}</div>` : ''}
      </div>
      <div class="row-actions">
        <button class="action-btn" title="Edit event" onclick="openAgendaModal('${item.id}')">
          <i data-lucide="edit-2"></i>
        </button>
        <button class="action-btn danger" title="Delete event" onclick="deleteAgendaEvent('${item.id}', '${escHtml(item.title)}')">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function setupEmojiPicker() {
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.dataset.emoji;
    });
  });
}

function openAgendaModal(itemId) {
  const titleEl = document.getElementById('agendaModalTitle');
  const idEl = document.getElementById('agendaModalId');

  if (itemId) {
    const item = Store.Agenda.getAll(currentWedding.id).find(a => a.id === itemId);
    if (!item) return;
    titleEl.textContent = 'Edit Event';
    idEl.value = itemId;
    document.getElementById('ag-title').value = item.title || '';
    document.getElementById('ag-time').value = item.time || '';
    document.getElementById('ag-duration').value = item.duration || 30;
    document.getElementById('ag-description').value = item.description || '';
    selectedEmoji = item.icon || '🌸';

    // Reset emoji buttons
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.emoji === selectedEmoji);
    });
  } else {
    titleEl.textContent = 'Add Agenda Event';
    idEl.value = '';
    document.getElementById('ag-title').value = '';
    document.getElementById('ag-time').value = '';
    document.getElementById('ag-duration').value = '30';
    document.getElementById('ag-description').value = '';
    selectedEmoji = '🌸';
    document.querySelectorAll('.emoji-btn').forEach((btn, i) => btn.classList.toggle('active', i === 0));
  }

  openModal('agendaModal');
}

function openAgendaModalDirect() {
  navigateTo('agenda');
  setTimeout(() => openAgendaModal(), 100);
}

function saveAgendaEvent() {
  const title = document.getElementById('ag-title').value.trim();
  if (!title) { showToast('Event title is required.', 'error'); return; }

  const itemId = document.getElementById('agendaModalId').value;
  const existing = itemId ? Store.Agenda.getAll(currentWedding.id).find(a => a.id === itemId) : null;

  Store.Agenda.save({
    ...(existing || {}),
    id: itemId || undefined,
    weddingId: currentWedding.id,
    title,
    icon: selectedEmoji,
    time: document.getElementById('ag-time').value,
    duration: parseInt(document.getElementById('ag-duration').value) || 30,
    description: document.getElementById('ag-description').value.trim(),
    order: existing ? existing.order : Date.now(),
  });

  closeModal('agendaModal');
  showToast(itemId ? 'Event updated!' : 'Event added!', 'success');
  renderAgendaList();
}

function deleteAgendaEvent(itemId, title) {
  confirmAction(`Delete "${title}" from the agenda?`, () => {
    Store.Agenda.delete(itemId);
    showToast('Event deleted.', 'success');
    renderAgendaList();
  });
}

/* ═══════════════════════════ MODULE 11: TABLE ASSIGNMENT ══ */
function loadTables() {
  renderTablesView();
}

function renderTablesView() {
  const tables = Store.Tables.getAll(currentWedding.id);
  const guests = Store.Guests.getAll(currentWedding.id);
  const rsvps = Store.RSVPs.getAll(currentWedding.id);

  const confirmedGuests = guests.filter(g => {
    const rsvp = rsvps.find(r => r.guestId === g.id);
    return rsvp && rsvp.status === 'confirmed';
  });

  const assignedGuestIds = new Set(tables.flatMap(t => t.guestIds || []));
  const unassigned = confirmedGuests.filter(g => !assignedGuestIds.has(g.id));
  const totalAssigned = assignedGuestIds.size;

  // Update subtitle
  setText('tableSubtitle', `${tables.length} tables · ${totalAssigned} assigned · ${unassigned.length} unassigned`);

  // Tables list
  const tablesList = document.getElementById('tablesList');
  const tablesEmpty = document.getElementById('tablesEmptyState');

  if (!tables.length) {
    tablesList.innerHTML = '';
    tablesEmpty.classList.remove('hidden');
  } else {
    tablesEmpty.classList.add('hidden');
    tablesList.innerHTML = tables.map(table => {
      const tableGuests = (table.guestIds || []).map(gid => guests.find(g => g.id === gid)).filter(Boolean);
      const isOver = tableGuests.length > table.capacity;

      return `
        <div class="table-seating-card ${isOver ? 'table-over-capacity' : ''}">
          <div class="table-seating-header">
            <div>
              <div class="table-seating-name">${escHtml(table.name)}</div>
              <div class="table-seating-capacity">
                ${tableGuests.length}/${table.capacity} seats
                ${isOver ? '<span class="badge badge-red" style="margin-left:.5rem;">Over Capacity!</span>' : ''}
              </div>
            </div>
            <div class="row-actions">
              <button class="action-btn" title="Edit table" onclick="openTableModal('${table.id}')">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="action-btn danger" title="Delete table" onclick="deleteTable('${table.id}', '${escHtml(table.name)}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
          ${tableGuests.length > 0 ? `
            <div class="table-guests-list">
              ${tableGuests.map(g => `
                <div class="table-guest-chip">
                  <i data-lucide="user" style="width:11px;height:11px;"></i>
                  ${escHtml(g.name)}
                </div>
              `).join('')}
            </div>
          ` : '<div class="empty-state-sm" style="padding:.5rem 0;"><i data-lucide="users"></i> No guests assigned</div>'}
        </div>
      `;
    }).join('');
  }

  // Unassigned guests
  const unassignedList = document.getElementById('unassignedList');
  const unassignedEmpty = document.getElementById('unassignedEmptyState');

  if (!unassigned.length) {
    unassignedList.innerHTML = '';
    unassignedEmpty.classList.remove('hidden');
  } else {
    unassignedEmpty.classList.add('hidden');
    unassignedList.innerHTML = unassigned.map(g => `
      <div class="unassigned-guest-item">
        <div class="unassigned-name">${escHtml(g.name)}</div>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <select class="assign-select" id="assign-${g.id}" onchange="assignGuestToTable('${g.id}', this.value)">
            <option value="">Assign to...</option>
            ${tables.map(t => `<option value="${t.id}">${escHtml(t.name)} (${(t.guestIds||[]).length}/${t.capacity})</option>`).join('')}
          </select>
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

function openTableModal(tableId) {
  const titleEl = document.getElementById('tableModalTitle');
  const idEl = document.getElementById('tableModalId');

  if (tableId) {
    const table = Store.Tables.getById(tableId);
    if (!table) return;
    titleEl.textContent = 'Edit Table';
    idEl.value = tableId;
    document.getElementById('tm-name').value = table.name;
    document.getElementById('tm-capacity').value = table.capacity;
  } else {
    titleEl.textContent = 'Create Table';
    idEl.value = '';
    document.getElementById('tm-name').value = '';
    document.getElementById('tm-capacity').value = '8';
  }

  openModal('tableModal');
}

function saveTable() {
  const name = document.getElementById('tm-name').value.trim();
  if (!name) { showToast('Table name is required.', 'error'); return; }

  const tableId = document.getElementById('tableModalId').value;
  const existing = tableId ? Store.Tables.getById(tableId) : null;

  Store.Tables.save({
    ...(existing || {}),
    id: tableId || undefined,
    weddingId: currentWedding.id,
    name,
    capacity: parseInt(document.getElementById('tm-capacity').value) || 8,
    guestIds: existing ? existing.guestIds : [],
  });

  closeModal('tableModal');
  showToast(tableId ? 'Table updated!' : 'Table created!', 'success');
  renderTablesView();
}

function deleteTable(tableId, name) {
  confirmAction(`Delete "${name}"? Assigned guests will become unassigned.`, () => {
    Store.Tables.delete(tableId);
    showToast('Table deleted.', 'success');
    renderTablesView();
  });
}

function assignGuestToTable(guestId, tableId) {
  if (!tableId) return;
  Store.Tables.assignGuest(tableId, guestId);
  showToast('Guest assigned to table!', 'success');
  renderTablesView();
}

/* ═════════════════════════════ MODULE 12: BUDGET PLANNER ══ */
function loadBudget() {
  renderBudgetSummary();
  renderBudgetTable();
}

function renderBudgetSummary() {
  const summary = Store.Budget.getSummary(currentWedding.id);
  setText('bsc-estimated', formatLKR(summary.totalEstimated));
  setText('bsc-actual', formatLKR(summary.totalActual));
  setText('bsc-paid', formatLKR(summary.totalPaid));
  setText('bsc-remaining', formatLKR(summary.remaining));

  const alertEl = document.getElementById('budgetOverBudgetAlert');
  const msgEl = document.getElementById('budgetOverBudgetMsg');
  if (summary.totalActual > summary.totalEstimated) {
    const over = summary.totalActual - summary.totalEstimated;
    msgEl.textContent = `You are ${formatLKR(over)} over your estimated budget!`;
    alertEl.classList.remove('hidden');
  } else {
    alertEl.classList.add('hidden');
  }
}

function renderBudgetTable() {
  const items = Store.Budget.getAll(currentWedding.id)
    .filter(b => budgetFilterCategory === 'all' || b.category === budgetFilterCategory);

  const tbody = document.getElementById('budgetTableBody');
  const emptyState = document.getElementById('budgetEmptyState');

  if (!items.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = items.map(item => {
    const remaining = (item.actual || 0) - (item.paid || 0);
    const catColor = getCategoryColor(item.category);

    return `
      <tr>
        <td><span class="badge" style="${catColor}">${escHtml(item.category)}</span></td>
        <td>${escHtml(item.item)}</td>
        <td>${formatLKR(item.estimated)}</td>
        <td>${formatLKR(item.actual)}</td>
        <td style="color:var(--adm-success);font-weight:600;">${formatLKR(item.paid)}</td>
        <td style="color:${remaining > 0 ? 'var(--adm-warning)' : 'var(--adm-success)'};font-weight:600;">${formatLKR(remaining)}</td>
        <td title="${escHtml(item.notes || '')}"><span class="truncate" style="max-width:120px;display:block;">${escHtml(item.notes || '—')}</span></td>
        <td>
          <div class="row-actions">
            <button class="action-btn" title="Edit expense" onclick="openBudgetModal('${item.id}')">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="action-btn danger" title="Delete expense" onclick="deleteBudgetItem('${item.id}', '${escHtml(item.item)}')">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function filterBudget(chip) {
  document.querySelectorAll('[data-cat]').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  budgetFilterCategory = chip.dataset.cat;
  renderBudgetTable();
}

function getCategoryColor(cat) {
  const colors = {
    Venue: 'background:#DBEAFE;color:#1D4ED8',
    Catering: 'background:#D1FAE5;color:#065F46',
    Photography: 'background:#EDE9FE;color:#5B21B6',
    Decor: 'background:#FEF3C7;color:#92400E',
    Dress: 'background:#FFF1F2;color:#9F1239',
    Music: 'background:#CCFBF1;color:#0F766E',
    Makeup: 'background:#FCE7F3;color:#831843',
    Cake: 'background:#FEF9C3;color:#713F12',
    Other: 'background:#F1F5F9;color:#475569',
  };
  return colors[cat] || colors.Other;
}

function openBudgetModal(itemId) {
  const titleEl = document.getElementById('budgetModalTitle');
  const idEl = document.getElementById('budgetModalId');

  if (itemId) {
    const item = Store.Budget.getAll(currentWedding.id).find(b => b.id === itemId);
    if (!item) return;
    titleEl.textContent = 'Edit Expense';
    idEl.value = itemId;
    document.getElementById('bm-category').value = item.category;
    document.getElementById('bm-item').value = item.item;
    document.getElementById('bm-estimated').value = item.estimated || 0;
    document.getElementById('bm-actual').value = item.actual || 0;
    document.getElementById('bm-paid').value = item.paid || 0;
    document.getElementById('bm-notes').value = item.notes || '';
  } else {
    titleEl.textContent = 'Add Expense';
    idEl.value = '';
    document.getElementById('bm-category').value = 'Venue';
    document.getElementById('bm-item').value = '';
    document.getElementById('bm-estimated').value = '0';
    document.getElementById('bm-actual').value = '0';
    document.getElementById('bm-paid').value = '0';
    document.getElementById('bm-notes').value = '';
  }

  openModal('budgetModal');
}

function openBudgetModalDirect() {
  navigateTo('budget');
  setTimeout(() => openBudgetModal(), 100);
}

function saveBudgetItem() {
  const item = document.getElementById('bm-item').value.trim();
  if (!item) { showToast('Item name is required.', 'error'); return; }

  const itemId = document.getElementById('budgetModalId').value;
  const existing = itemId ? Store.Budget.getAll(currentWedding.id).find(b => b.id === itemId) : null;

  Store.Budget.save({
    ...(existing || {}),
    id: itemId || undefined,
    weddingId: currentWedding.id,
    category: document.getElementById('bm-category').value,
    item,
    estimated: parseFloat(document.getElementById('bm-estimated').value) || 0,
    actual: parseFloat(document.getElementById('bm-actual').value) || 0,
    paid: parseFloat(document.getElementById('bm-paid').value) || 0,
    notes: document.getElementById('bm-notes').value.trim(),
  });

  closeModal('budgetModal');
  showToast(itemId ? 'Expense updated!' : 'Expense added!', 'success');
  renderBudgetSummary();
  renderBudgetTable();
}

function deleteBudgetItem(itemId, name) {
  confirmAction(`Delete "${name}" from your budget?`, () => {
    Store.Budget.delete(itemId);
    showToast('Expense deleted.', 'success');
    renderBudgetSummary();
    renderBudgetTable();
  });
}

/* ══════════════════════════════════ MODULE 13: CHECKLIST ══ */
const CHECKLIST_GROUPS = [
  '4 months before', '3 months before', '2 months before',
  '1 month before', '1 week before', 'Wedding Day', 'After Wedding'
];

function loadChecklist() {
  renderChecklist();
}

function renderChecklist() {
  const items = Store.Checklist.getAll(currentWedding.id);
  const completed = items.filter(c => c.completed).length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  setText('checklistSubtitle', `${completed} of ${items.length} tasks completed`);
  setText('checklistProgressLabel', `Overall Progress`);
  setText('checklistProgressPct', pct + '%');
  document.getElementById('checklistProgressBar').style.width = pct + '%';

  const container = document.getElementById('checklistGroups');
  const emptyState = document.getElementById('checklistEmptyState');

  if (!items.length) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = CHECKLIST_GROUPS.map(group => {
    const groupItems = items.filter(c => c.group === group);
    if (!groupItems.length) return '';

    return `
      <div class="checklist-group">
        <div class="checklist-group-header">
          <i data-lucide="calendar" style="width:14px;height:14px;"></i>
          ${group} <span class="badge badge-slate" style="margin-left:.5rem;">${groupItems.filter(c => c.completed).length}/${groupItems.length}</span>
        </div>
        ${groupItems.map(task => `
          <div class="checklist-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="checklist-checkbox" ${task.completed ? 'checked' : ''}
              onchange="toggleChecklistItem('${task.id}', this.checked)" />
            <div class="checklist-info">
              <div class="checklist-title">${escHtml(task.title)}</div>
              <div class="checklist-meta">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                ${task.dueDate ? `<span class="checklist-date"><i data-lucide="calendar"></i>${formatDate(task.dueDate)}</span>` : ''}
              </div>
            </div>
            <div class="row-actions">
              ${task.custom ? `
                <button class="action-btn" title="Edit task" onclick="openChecklistModal('${task.id}')">
                  <i data-lucide="edit-2"></i>
                </button>
              ` : ''}
              <button class="action-btn danger" title="Delete task" onclick="deleteChecklistTask('${task.id}', '${escHtml(task.title)}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleChecklistItem(id, checked) {
  Store.Checklist.toggle(id);
  renderChecklist();
}

function openChecklistModal(taskId) {
  const titleEl = document.getElementById('checklistModalTitle');
  const idEl = document.getElementById('checklistModalId');

  if (taskId) {
    const task = Store.Checklist.getAll(currentWedding.id).find(c => c.id === taskId);
    if (!task) return;
    titleEl.textContent = 'Edit Task';
    idEl.value = taskId;
    document.getElementById('cl-title').value = task.title;
    document.getElementById('cl-group').value = task.group;
    document.getElementById('cl-priority').value = task.priority;
    document.getElementById('cl-dueDate').value = task.dueDate || '';
  } else {
    titleEl.textContent = 'Add Custom Task';
    idEl.value = '';
    document.getElementById('cl-title').value = '';
    document.getElementById('cl-group').value = '3 months before';
    document.getElementById('cl-priority').value = 'medium';
    document.getElementById('cl-dueDate').value = '';
  }

  openModal('checklistModal');
}

function saveChecklistTask() {
  const title = document.getElementById('cl-title').value.trim();
  if (!title) { showToast('Task title is required.', 'error'); return; }

  const taskId = document.getElementById('checklistModalId').value;
  const existing = taskId ? Store.Checklist.getAll(currentWedding.id).find(c => c.id === taskId) : null;

  Store.Checklist.save({
    ...(existing || {}),
    id: taskId || undefined,
    weddingId: currentWedding.id,
    title,
    group: document.getElementById('cl-group').value,
    priority: document.getElementById('cl-priority').value,
    dueDate: document.getElementById('cl-dueDate').value,
    custom: true,
  });

  closeModal('checklistModal');
  showToast(taskId ? 'Task updated!' : 'Task added!', 'success');
  renderChecklist();
}

function deleteChecklistTask(taskId, title) {
  confirmAction(`Delete "${title}"?`, () => {
    Store.Checklist.delete(taskId);
    showToast('Task deleted.', 'success');
    renderChecklist();
  });
}

/* ════════════════════════════ MODULE 14: VENDOR MANAGEMENT ══ */
function loadVendors() {
  setupVendorTabs();
  renderMyVendors();
}

function setupVendorTabs() {
  document.querySelectorAll('#vendorTabs .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#vendorTabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      vendorActiveTab = tab.dataset.tab;

      document.getElementById('myVendorsPanel').classList.toggle('hidden', vendorActiveTab !== 'my');
      document.getElementById('marketplacePanel').classList.toggle('hidden', vendorActiveTab !== 'marketplace');
    });
  });
}

function renderMyVendors() {
  const vendors = Store.MyVendors.getAll(currentWedding.id);
  const container = document.getElementById('myVendorsList');
  const emptyState = document.getElementById('myVendorsEmpty');

  if (!vendors.length) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = vendors.map(v => {
    const statusBadge = v.status === 'booked'
      ? '<span class="badge badge-green">Booked</span>'
      : v.status === 'quoted'
      ? '<span class="badge badge-amber">Quoted</span>'
      : '<span class="badge badge-slate">Contacted</span>';

    return `
      <div class="vendor-card">
        <div class="vendor-card-header">
          <div style="display:flex;align-items:center;gap:.75rem;">
            <div class="vendor-icon"><i data-lucide="briefcase"></i></div>
            <div>
              <div class="vendor-name">${escHtml(v.vendorName || v.businessName || 'Unknown')}</div>
              <div class="vendor-category">${escHtml(v.category)}</div>
            </div>
          </div>
          ${statusBadge}
        </div>
        <div class="vendor-details">
          ${v.quoteAmount ? `<div class="vendor-detail-item"><i data-lucide="wallet"></i>${formatLKR(v.quoteAmount)}</div>` : ''}
          ${v.contactPhone ? `<div class="vendor-detail-item"><i data-lucide="phone"></i>${escHtml(v.contactPhone)}</div>` : ''}
          ${v.notes ? `<div class="vendor-detail-item"><i data-lucide="file-text"></i>${escHtml(v.notes)}</div>` : ''}
        </div>
        <div class="vendor-actions">
          ${v.status !== 'booked' ? `
            <button class="btn btn-sm btn-outline" onclick="markVendorBooked('${v.id}')">
              <i data-lucide="check"></i> Mark Booked
            </button>
          ` : ''}
          ${v.contactPhone ? `
            <button class="btn btn-sm btn-outline" onclick="openWhatsApp('${v.contactPhone}', '${escHtml(v.vendorName || '')}')">
              <i data-lucide="message-circle"></i>
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline" onclick="openVendorModal('${v.id}')">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn btn-sm btn-outline" style="color:var(--adm-danger);border-color:var(--adm-danger-bg);" onclick="deleteMyVendor('${v.id}', '${escHtml(v.vendorName || '')}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function markVendorBooked(vendorId) {
  const vendors = Store.MyVendors.getAll(currentWedding.id);
  const v = vendors.find(v => v.id === vendorId);
  if (!v) return;
  Store.MyVendors.save({ ...v, status: 'booked' });
  showToast('Vendor marked as booked!', 'success');
  renderMyVendors();
}

function openVendorModal(vendorId) {
  const titleEl = document.getElementById('vendorModalTitle');
  const idEl = document.getElementById('vendorModalId');

  if (vendorId) {
    const v = Store.MyVendors.getAll(currentWedding.id).find(v => v.id === vendorId);
    if (!v) return;
    titleEl.textContent = 'Edit Vendor';
    idEl.value = vendorId;
    document.getElementById('vm-name').value = v.vendorName || v.businessName || '';
    document.getElementById('vm-category').value = v.category || 'Photography';
    document.getElementById('vm-phone').value = v.contactPhone || '';
    document.getElementById('vm-quote').value = v.quoteAmount || 0;
    document.getElementById('vm-status').value = v.status || 'contacted';
    document.getElementById('vm-notes').value = v.notes || '';
  } else {
    titleEl.textContent = 'Add Vendor';
    idEl.value = '';
    document.getElementById('vm-name').value = '';
    document.getElementById('vm-category').value = 'Photography';
    document.getElementById('vm-phone').value = '';
    document.getElementById('vm-quote').value = '0';
    document.getElementById('vm-status').value = 'contacted';
    document.getElementById('vm-notes').value = '';
  }

  openModal('vendorModal');
}

function saveVendor() {
  const name = document.getElementById('vm-name').value.trim();
  if (!name) { showToast('Business name is required.', 'error'); return; }

  const vendorId = document.getElementById('vendorModalId').value;
  const existing = vendorId ? Store.MyVendors.getAll(currentWedding.id).find(v => v.id === vendorId) : null;

  Store.MyVendors.save({
    ...(existing || {}),
    id: vendorId || undefined,
    weddingId: currentWedding.id,
    vendorName: name,
    category: document.getElementById('vm-category').value,
    contactPhone: document.getElementById('vm-phone').value.trim(),
    quoteAmount: parseFloat(document.getElementById('vm-quote').value) || 0,
    status: document.getElementById('vm-status').value,
    notes: document.getElementById('vm-notes').value.trim(),
  });

  closeModal('vendorModal');
  showToast(vendorId ? 'Vendor updated!' : 'Vendor added!', 'success');
  renderMyVendors();
}

function deleteMyVendor(vendorId, name) {
  confirmAction(`Remove "${name}" from your vendors?`, () => {
    Store.MyVendors.delete(vendorId);
    showToast('Vendor removed.', 'success');
    renderMyVendors();
  });
}

/* ════════════════════════════ MODULE 15: ACCOUNT SETTINGS ══ */
function loadAccount() {
  document.getElementById('acc-name').value = currentUser.name || '';
  document.getElementById('acc-email').value = currentUser.email || '';

  const days = Auth.getTrialDaysLeft();
  const plan = currentUser.plan === 'trial' ? 'Free Trial' : 'Premium';
  document.getElementById('acc-planBadge').textContent = plan;
  document.getElementById('acc-planDetail').textContent = currentUser.plan === 'trial'
    ? `${days} day${days !== 1 ? 's' : ''} remaining in your trial`
    : 'Active Premium subscription';
}

function changePassword() {
  const current = document.getElementById('acc-currentPw').value;
  const newPw = document.getElementById('acc-newPw').value;
  const confirm = document.getElementById('acc-confirmPw').value;

  if (!current || !newPw || !confirm) { showToast('Please fill all password fields.', 'error'); return; }
  if (newPw !== confirm) { showToast('New passwords do not match.', 'error'); return; }
  if (newPw.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }

  // Verify current password
  const user = Store.Users.authenticate(currentUser.email, current);
  if (!user) { showToast('Current password is incorrect.', 'error'); return; }

  Store.Users.save({ ...user, password: newPw });
  document.getElementById('acc-currentPw').value = '';
  document.getElementById('acc-newPw').value = '';
  document.getElementById('acc-confirmPw').value = '';
  showToast('Password updated successfully!', 'success');
}

function confirmDeleteWedding() {
  confirmAction(
    'This will permanently delete ALL your wedding data including guests, RSVPs, budget, and more. This cannot be undone!',
    () => {
      Store.Weddings.delete(currentWedding.id);
      // Clear related data
      Store.Guests.getAll(currentWedding.id).forEach(g => Store.Guests.delete(g.id));
      Store.RSVPs.getAll(currentWedding.id).forEach(r => Store.RSVPs.getAll(currentWedding.id));
      showToast('Wedding data deleted. Signing out...', 'warning');
      setTimeout(() => Auth.logout(), 2000);
    },
    'Delete Forever'
  );
}

/* ══════════════════════════════════════════════════ PREVIEW ══ */
function previewInvitation() {
  const slug = currentWedding.slug || '';
  window.open(`../invitation/index.html?slug=${slug}`, '_blank');
}

/* ══════════════════════════════════════════ MODAL SYSTEM ══ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element
    setTimeout(() => {
      const focusable = modal.querySelector('input:not([readonly]), select, textarea, button');
      if (focusable) focusable.focus();
    }, 100);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    const id = e.target.id;
    if (id && id !== 'confirmModal') closeModal(id);
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => {
      if (m.id !== 'confirmModal') closeModal(m.id);
    });
  }
});

/* ═══════════════════════════════════ CONFIRM DIALOG ══ */
function confirmAction(message, callback, confirmLabel = 'Delete') {
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmOk').textContent = confirmLabel;
  confirmCallback = callback;
  openModal('confirmModal');
}

document.getElementById('confirmOk').addEventListener('click', () => {
  closeModal('confirmModal');
  if (typeof confirmCallback === 'function') confirmCallback();
  confirmCallback = null;
});

document.getElementById('confirmCancel').addEventListener('click', () => {
  closeModal('confirmModal');
  confirmCallback = null;
});

/* ═══════════════════════════════════════ TOAST SYSTEM ══ */
function showToast(message, type = 'success') {
  const area = document.getElementById('toastArea');
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${iconMap[type] || 'info'}"></i></div>
    <div class="toast-text">${escHtml(message)}</div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)" aria-label="Dismiss">
      <i data-lucide="x"></i>
    </button>
  `;

  area.appendChild(toast);
  lucide.createIcons();

  // Auto dismiss
  setTimeout(() => dismissToast(toast), 3500);
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('toast-out');
  setTimeout(() => toast.remove(), 300);
}

/* ══════════════════════════════════════════════ HELPERS ══ */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function formatLKR(amount) {
  const n = Number(amount) || 0;
  return 'LKR ' + n.toLocaleString('en-US');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════ CHAR COUNTER SETUP ══ */
// Additional setup for all textareas in settings modal
document.addEventListener('input', (e) => {
  const id = e.target.id;
  if (id === 'ws-story') {
    const el = document.getElementById('ws-storyCount');
    if (el) el.textContent = e.target.value.length;
  }
});

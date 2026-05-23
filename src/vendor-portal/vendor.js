/**
 * VENDOR PORTAL — vendor.js
 * Complete vendor portal logic: Auth flow, Registration, Dashboard modules
 */

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const MOCK_LISTINGS = [
  { id: 'l001', vendorId: 'v001', name: 'Full Day Wedding Photography Package', description: 'Complete coverage from preparation to reception. Includes 2 photographers, drone shots, sneak peek within 48 hours, and full gallery delivery.', price: 150000, priceType: 'per event', inclusions: 'Full day coverage (10-12 hrs)\n2 Professional photographers\nDrone aerial shots\nEdited digital gallery (500+ photos)\nPre-shoot consultation\nOnline gallery delivery', active: true },
  { id: 'l002', vendorId: 'v001', name: 'Pre-Wedding Shoot', description: 'Romantic pre-wedding session at a location of your choice. 2-3 hour shoot with premium editing.', price: 35000, priceType: 'per session', inclusions: 'Location shoot (2-3 hrs)\n1 Professional photographer\n100+ edited photos\nPrint release included', active: true },
  { id: 'l003', vendorId: 'v001', name: 'Engagement Photography', description: 'Capture the magic of your engagement with a professional photo session.', price: 25000, priceType: 'per session', inclusions: '1.5 hour session\n50+ edited photos\nDigital delivery', active: false },
];

const MOCK_BOOKINGS = [
  { id: 'bk001', vendorId: 'v001', listingId: 'l001', coupleName: 'Priya & Kasun', weddingDate: '2026-08-15', serviceName: 'Full Day Wedding Photography Package', message: 'Hi! We absolutely love your portfolio. We are planning a garden wedding and would love to discuss availability and package details.', requestedDate: '2026-05-10', amount: 150000, status: 'pending', email: 'priya.kasun@gmail.com', phone: '+94771234567' },
  { id: 'bk002', vendorId: 'v001', listingId: 'l002', coupleName: 'Nadeesha & Tharaka', weddingDate: '2026-09-20', serviceName: 'Pre-Wedding Shoot', message: 'We would like to book a pre-wedding shoot at Sigiriya. Can you accommodate an outdoor location session?', requestedDate: '2026-05-12', amount: 35000, status: 'pending', email: 'nadeeshka@gmail.com', phone: '+94772345678' },
  { id: 'bk003', vendorId: 'v001', listingId: 'l001', coupleName: 'Dilrukshi & Chamara', weddingDate: '2026-07-10', serviceName: 'Full Day Wedding Photography Package', message: 'Hello, we are getting married in Kandy and need a full day photographer. Please confirm your availability.', requestedDate: '2026-05-14', amount: 150000, status: 'pending', email: 'dilrukshi@gmail.com', phone: '+94773456789' },
  { id: 'bk004', vendorId: 'v001', listingId: 'l003', coupleName: 'Sandali & Ruwan', weddingDate: '2026-06-05', serviceName: 'Engagement Photography', message: 'Booked for engagement shoot at Galle Face.', requestedDate: '2026-04-20', amount: 25000, status: 'confirmed', email: 'sandali@gmail.com', phone: '+94774567890' },
  { id: 'bk005', vendorId: 'v001', listingId: 'l002', coupleName: 'Hiruni & Saman', weddingDate: '2026-10-15', serviceName: 'Pre-Wedding Shoot', message: 'We are interested in a beach pre-wedding shoot.', requestedDate: '2026-04-25', amount: 35000, status: 'declined', email: 'hiruni@gmail.com', phone: '+94775678901' },
];

const MOCK_MESSAGES = [
  { id: 'cv001', vendorId: 'v001', senderName: 'Priya & Kasun', senderEmail: 'priya.kasun@gmail.com', lastMessage: 'That sounds wonderful! Can we schedule a call?', time: '10:30 AM', unread: 2, messages: [
    { sender: 'Priya & Kasun', text: 'Hi! We absolutely love your portfolio. We are planning a garden wedding at Cinnamon Grand.', time: '10:15 AM', outgoing: false },
    { sender: 'You', text: 'Thank you so much! I would love to be part of your special day. What date are you looking at?', time: '10:25 AM', outgoing: true },
    { sender: 'Priya & Kasun', text: 'That sounds wonderful! Can we schedule a call?', time: '10:30 AM', outgoing: false },
  ]},
  { id: 'cv002', vendorId: 'v001', senderName: 'Nadeesha & Tharaka', senderEmail: 'nadeeshka@gmail.com', lastMessage: 'Would you be available for an outdoor shoot in Sigiriya?', time: 'Yesterday', unread: 0, messages: [
    { sender: 'Nadeesha & Tharaka', text: 'Hello! We would like to book a pre-wedding shoot at Sigiriya. Would you be available for an outdoor shoot in Sigiriya?', time: 'Yesterday 2:00 PM', outgoing: false },
  ]},
  { id: 'cv003', vendorId: 'v001', senderName: 'General Inquiry', senderEmail: 'inquiry@gmail.com', lastMessage: 'What packages do you offer for indoor weddings?', time: 'Mon', unread: 1, messages: [
    { sender: 'General Inquiry', text: 'What packages do you offer for indoor weddings?', time: 'Mon 3:00 PM', outgoing: false },
  ]},
  { id: 'cv004', vendorId: 'v001', senderName: 'Hiruni & Saman', senderEmail: 'hiruni@gmail.com', lastMessage: 'Thank you for your time. We will reach out if we need anything.', time: '2 weeks ago', unread: 0, messages: [
    { sender: 'Hiruni & Saman', text: 'Hi, we were interested in a beach shoot but unfortunately we had to cancel our plans. Thank you for your time. We will reach out if we need anything.', time: '2 weeks ago', outgoing: false },
    { sender: 'You', text: 'No worries at all! Feel free to contact us whenever you are ready.', time: '2 weeks ago', outgoing: true },
  ]},
];

const MOCK_PAYOUTS = [
  { date: '2026-05-01', period: 'April 2026', amount: 185000, status: 'paid', ref: 'PAY-2026-001' },
  { date: '2026-04-01', period: 'March 2026', amount: 150000, status: 'paid', ref: 'PAY-2026-002' },
  { date: '2026-03-01', period: 'February 2026', amount: 75000, status: 'paid', ref: 'PAY-2026-003' },
  { date: '2026-02-01', period: 'January 2026', amount: 50000, status: 'paid', ref: 'PAY-2026-004' },
  { date: '2026-01-01', period: 'December 2025', amount: 25000, status: 'paid', ref: 'PAY-2025-005' },
];

const MOCK_EARNINGS_TABLE = [
  { date: '2026-05-18', description: 'Sandali & Ruwan - Engagement Photography', amount: 25000, status: 'paid' },
  { date: '2026-05-15', description: 'Booking deposit - Dilrukshi & Chamara', amount: 75000, status: 'pending' },
  { date: '2026-04-30', description: 'Full Day Package - Previous Client', amount: 150000, status: 'paid' },
  { date: '2026-04-20', description: 'Pre-Wedding Shoot - Ravindu & Chamali', amount: 35000, status: 'paid' },
  { date: '2026-04-10', description: 'Engagement Photography - Asanka & Nirosha', amount: 25000, status: 'paid' },
];

/* ═══════════════════════════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════════════════════════ */
const App = {
  currentModule: 'dashboard',
  sidebarCollapsed: false,
  currentUser: null,
  currentVendor: null,
  editingListing: null,
  currentConversation: null,
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  availabilityData: {},
  charts: {},
  regData: { step1: {}, step2: {}, step3: {} },
  regStep: 1,

  init() {
    Store.init && Store.init();
    this.loadAvailability();
    this.checkAuth();
  },

  loadAvailability() {
    try {
      this.availabilityData = JSON.parse(localStorage.getItem('wp_vendor_availability') || '{}');
    } catch { this.availabilityData = {}; }
  },

  saveAvailability() {
    localStorage.setItem('wp_vendor_availability', JSON.stringify(this.availabilityData));
  },

  getListings() {
    try {
      const stored = JSON.parse(localStorage.getItem('wp_listings') || 'null');
      if (stored && Array.isArray(stored)) return stored;
    } catch {}
    return [...MOCK_LISTINGS];
  },

  saveListings(listings) {
    localStorage.setItem('wp_listings', JSON.stringify(listings));
  },

  getMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem('wp_vendor_messages') || 'null');
      if (stored && Array.isArray(stored)) return stored;
    } catch {}
    return [...MOCK_MESSAGES];
  },

  saveMessages(msgs) {
    localStorage.setItem('wp_vendor_messages', JSON.stringify(msgs));
  },

  checkAuth() {
    const user = Auth.getCurrentUser();
    if (!user) {
      this.showScreen('auth');
      return;
    }
    if (user.role !== 'vendor') {
      Auth.logout();
      return;
    }
    this.currentUser = user;
    const vendor = Store.Vendors.getById(user.vendorId);
    if (!vendor) {
      this.showScreen('auth');
      return;
    }
    this.currentVendor = vendor;
    if (vendor.status === 'pending') {
      this.showScreen('pending');
      this.populatePendingScreen();
    } else if (vendor.status === 'approved') {
      this.showScreen('dashboard');
      this.initDashboard();
    } else {
      this.showScreen('auth');
    }
  },

  showScreen(screen) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('pending-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'none';
    if (screen === 'auth') document.getElementById('auth-screen').style.display = 'flex';
    if (screen === 'pending') document.getElementById('pending-screen').style.display = 'flex';
    if (screen === 'dashboard') document.getElementById('dashboard-screen').style.display = 'flex';
  },

  initDashboard() {
    this.renderHeader();
    this.renderSidebar();
    this.navigateTo('dashboard');
  },

  navigateTo(module) {
    this.currentModule = module;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === module);
    });
    document.querySelectorAll('.module-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `module-${module}`);
    });
    // Render module
    const renderMap = {
      dashboard: () => this.renderDashboard(),
      profile: () => this.renderProfile(),
      listings: () => this.renderListings(),
      bookings: () => this.renderBookings(),
      availability: () => this.renderAvailability(),
      messages: () => this.renderMessages(),
      analytics: () => this.renderAnalytics(),
      payouts: () => this.renderPayouts(),
      settings: () => this.renderSettings(),
    };
    if (renderMap[module]) renderMap[module]();
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
      document.querySelector('.vnd-sidebar').classList.remove('mobile-open');
      document.querySelector('.sidebar-overlay').classList.remove('open');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/* ═══════════════════════════════════════════════════════════════
   AUTH: REGISTRATION FLOW
═══════════════════════════════════════════════════════════════ */
function initAuthScreen() {
  renderAuthTabs();
  renderRegStep(1);
  bindLoginForm();
}

function renderAuthTabs() {
  document.getElementById('auth-tab-register').addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('auth-tab-login').addEventListener('click', () => switchAuthTab('login'));
}

function switchAuthTab(tab) {
  document.getElementById('auth-tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('register-panel').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('login-panel').style.display = tab === 'login' ? 'block' : 'none';
}

function renderRegStep(step) {
  App.regStep = step;
  const panel = document.getElementById('register-panel');
  const steps = ['Account', 'Business', 'Profile', 'Review'];

  let stepperHTML = '<div class="stepper">';
  steps.forEach((label, i) => {
    const num = i + 1;
    const cls = num < step ? 'completed' : num === step ? 'active' : '';
    stepperHTML += `<div class="step-item ${cls}">
      <div class="step-circle">${num < step ? checkSVG() : num}</div>
      <span class="step-label">${label}</span>
    </div>`;
  });
  stepperHTML += '</div>';

  let formHTML = '';
  if (step === 1) {
    formHTML = `
      <h3 style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:var(--space-5);color:var(--adm-text-primary)">Create Your Account</h3>
      <div class="form-group">
        <label class="form-label" for="reg-name">Full Name <span class="required">*</span></label>
        <input type="text" id="reg-name" class="form-input" placeholder="Your full name" value="${App.regData.step1.name || ''}">
        <span class="form-error" id="err-name">Please enter your full name.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-email">Email Address <span class="required">*</span></label>
        <input type="email" id="reg-email" class="form-input" placeholder="you@example.com" value="${App.regData.step1.email || ''}">
        <span class="form-error" id="err-email">Please enter a valid email.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-password">Password <span class="required">*</span></label>
        <input type="password" id="reg-password" class="form-input" placeholder="Min 6 characters" value="${App.regData.step1.password || ''}">
        <span class="form-error" id="err-password">Password must be at least 6 characters.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-confirm">Confirm Password <span class="required">*</span></label>
        <input type="password" id="reg-confirm" class="form-input" placeholder="Repeat password">
        <span class="form-error" id="err-confirm">Passwords do not match.</span>
      </div>
      <div class="step-nav">
        <span></span>
        <button class="btn btn-primary" onclick="regNextStep(1)">Next: Business Info <i data-lucide="arrow-right" style="width:16px;height:16px"></i></button>
      </div>`;
  } else if (step === 2) {
    const cats = ['Photography','Videography','Decor','Catering','Music','Venue','Makeup','Cake','Jewelry','Transport','Planning','Other'];
    formHTML = `
      <h3 style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:var(--space-5);color:var(--adm-text-primary)">Your Business</h3>
      <div class="form-group">
        <label class="form-label" for="reg-biz">Business Name <span class="required">*</span></label>
        <input type="text" id="reg-biz" class="form-input" placeholder="Your studio / business name" value="${App.regData.step2.businessName || ''}">
        <span class="form-error" id="err-biz">Business name is required.</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="reg-cat">Category <span class="required">*</span></label>
          <select id="reg-cat" class="form-select">
            <option value="">Select category</option>
            ${cats.map(c => `<option value="${c}" ${App.regData.step2.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <span class="form-error" id="err-cat">Please select a category.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-location">Location <span class="required">*</span></label>
          <input type="text" id="reg-location" class="form-input" placeholder="City, Province" value="${App.regData.step2.location || ''}">
          <span class="form-error" id="err-location">Location is required.</span>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="reg-phone">Phone Number <span class="required">*</span></label>
          <input type="tel" id="reg-phone" class="form-input" placeholder="+94 77 123 4567" value="${App.regData.step2.phone || ''}">
          <span class="form-error" id="err-phone">Valid phone number required.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-website">Website URL <span style="color:var(--adm-text-muted)">(optional)</span></label>
          <input type="url" id="reg-website" class="form-input" placeholder="https://yourstudio.lk" value="${App.regData.step2.website || ''}">
        </div>
      </div>
      <div class="step-nav">
        <button class="btn btn-secondary" onclick="renderRegStep(1)"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button>
        <button class="btn btn-primary" onclick="regNextStep(2)">Next: Profile <i data-lucide="arrow-right" style="width:16px;height:16px"></i></button>
      </div>`;
  } else if (step === 3) {
    formHTML = `
      <h3 style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:var(--space-5);color:var(--adm-text-primary)">Your Profile</h3>
      <div class="form-group">
        <label class="form-label">Profile Image</label>
        <div class="profile-upload">
          <div class="upload-preview" onclick="document.getElementById('reg-photo-input').click()" id="reg-photo-preview">
            ${App.regData.step3.profileImage ? `<img src="${App.regData.step3.profileImage}" id="reg-photo-img">` : `<i data-lucide="camera" style="width:24px;height:24px;color:var(--adm-text-muted)"></i>`}
          </div>
          <div class="upload-info">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('reg-photo-input').click()">Upload Photo</button>
            <p class="form-hint" style="margin-top:var(--space-2)">JPG or PNG. Recommended: 400×400px</p>
          </div>
        </div>
        <input type="file" id="reg-photo-input" accept="image/*" style="display:none" onchange="handleProfileImagePreview(this,'reg-photo-preview')">
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-desc">Business Description <span class="required">*</span></label>
        <textarea id="reg-desc" class="form-textarea" maxlength="500" placeholder="Tell couples about your business, style, and experience..." style="min-height:120px">${App.regData.step3.description || ''}</textarea>
        <div class="char-count"><span id="desc-count">${(App.regData.step3.description || '').length}</span>/500</div>
        <span class="form-error" id="err-desc">Please add a business description.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="reg-years">Years in Business</label>
        <input type="number" id="reg-years" class="form-input" placeholder="e.g. 5" min="0" max="50" value="${App.regData.step3.yearsInBusiness || ''}">
      </div>
      <div class="step-nav">
        <button class="btn btn-secondary" onclick="renderRegStep(2)"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button>
        <button class="btn btn-primary" onclick="regNextStep(3)">Review Application <i data-lucide="arrow-right" style="width:16px;height:16px"></i></button>
      </div>`;
  } else if (step === 4) {
    const d = App.regData;
    formHTML = `
      <h3 style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:var(--space-5);color:var(--adm-text-primary)">Review Your Application</h3>
      <div class="review-section">
        <h4>Account Details</h4>
        <div class="review-row"><span class="label">Name</span><span class="value">${d.step1.name}</span></div>
        <div class="review-row"><span class="label">Email</span><span class="value">${d.step1.email}</span></div>
      </div>
      <div class="review-section">
        <h4>Business Information</h4>
        <div class="review-row"><span class="label">Business Name</span><span class="value">${d.step2.businessName}</span></div>
        <div class="review-row"><span class="label">Category</span><span class="value">${d.step2.category}</span></div>
        <div class="review-row"><span class="label">Location</span><span class="value">${d.step2.location}</span></div>
        <div class="review-row"><span class="label">Phone</span><span class="value">${d.step2.phone}</span></div>
        ${d.step2.website ? `<div class="review-row"><span class="label">Website</span><span class="value">${d.step2.website}</span></div>` : ''}
      </div>
      <div class="review-section">
        <h4>Profile</h4>
        <div class="review-row"><span class="label">Description</span><span class="value" style="max-width:200px;text-align:right">${d.step3.description}</span></div>
        ${d.step3.yearsInBusiness ? `<div class="review-row"><span class="label">Years in Business</span><span class="value">${d.step3.yearsInBusiness}</span></div>` : ''}
      </div>
      <p style="font-size:var(--text-xs);color:var(--adm-text-muted);text-align:center;margin-bottom:var(--space-4)">
        By submitting, you agree to the WedInvite Vendor Terms of Service. Your application will be reviewed within 1-2 business days.
      </p>
      <div class="step-nav">
        <button class="btn btn-secondary" onclick="renderRegStep(3)"><i data-lucide="arrow-left" style="width:16px;height:16px"></i> Back</button>
        <button class="btn btn-primary" id="submit-app-btn" onclick="submitApplication()">
          <i data-lucide="send" style="width:16px;height:16px"></i> Submit Application
        </button>
      </div>`;
  }

  panel.querySelector('#reg-form-content').innerHTML = stepperHTML + formHTML;
  lucide.createIcons();

  if (step === 3) {
    const descEl = document.getElementById('reg-desc');
    if (descEl) {
      descEl.addEventListener('input', () => {
        document.getElementById('desc-count').textContent = descEl.value.length;
      });
    }
  }
}

function regNextStep(currentStep) {
  if (currentStep === 1) {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    let valid = true;
    if (!name) { showFieldError('reg-name', 'err-name'); valid = false; } else clearFieldError('reg-name', 'err-name');
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showFieldError('reg-email', 'err-email'); valid = false; } else clearFieldError('reg-email', 'err-email');
    if (!password || password.length < 6) { showFieldError('reg-password', 'err-password'); valid = false; } else clearFieldError('reg-password', 'err-password');
    if (password !== confirm) { showFieldError('reg-confirm', 'err-confirm'); valid = false; } else clearFieldError('reg-confirm', 'err-confirm');
    if (!valid) return;
    App.regData.step1 = { name, email, password };
    renderRegStep(2);
  } else if (currentStep === 2) {
    const businessName = document.getElementById('reg-biz').value.trim();
    const category = document.getElementById('reg-cat').value;
    const location = document.getElementById('reg-location').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const website = document.getElementById('reg-website').value.trim();
    let valid = true;
    if (!businessName) { showFieldError('reg-biz', 'err-biz'); valid = false; } else clearFieldError('reg-biz', 'err-biz');
    if (!category) { showFieldError('reg-cat', 'err-cat'); valid = false; } else clearFieldError('reg-cat', 'err-cat');
    if (!location) { showFieldError('reg-location', 'err-location'); valid = false; } else clearFieldError('reg-location', 'err-location');
    if (!phone) { showFieldError('reg-phone', 'err-phone'); valid = false; } else clearFieldError('reg-phone', 'err-phone');
    if (!valid) return;
    App.regData.step2 = { businessName, category, location, phone, website };
    renderRegStep(3);
  } else if (currentStep === 3) {
    const description = document.getElementById('reg-desc').value.trim();
    const yearsInBusiness = document.getElementById('reg-years').value;
    let valid = true;
    if (!description) { showFieldError('reg-desc', 'err-desc'); valid = false; } else clearFieldError('reg-desc', 'err-desc');
    if (!valid) return;
    App.regData.step3.description = description;
    App.regData.step3.yearsInBusiness = yearsInBusiness;
    renderRegStep(4);
  }
}

function submitApplication() {
  const btn = document.getElementById('submit-app-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:18px;height:18px;border-width:2px;margin:0 auto"></div>';

  setTimeout(() => {
    const d = App.regData;
    const existingUser = Store.Users.findByEmail(d.step1.email);
    if (existingUser) {
      showToast('error', 'Email Already Registered', 'This email is already in use. Please login instead.');
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="send" style="width:16px;height:16px"></i> Submit Application';
      lucide.createIcons();
      return;
    }

    const vendorData = {
      businessName: d.step2.businessName,
      category: d.step2.category,
      contactName: d.step1.name,
      email: d.step1.email,
      phone: d.step2.phone,
      location: d.step2.location,
      website: d.step2.website,
      description: d.step3.description,
      yearsInBusiness: d.step3.yearsInBusiness,
      profileImage: d.step3.profileImage || '',
      status: 'pending',
      featured: false,
      portfolio: [],
      rating: 0,
      reviewCount: 0,
    };
    const savedVendor = Store.Vendors.save(vendorData);
    const vendorId = savedVendor ? savedVendor.id : vendorData.id;

    const userData = {
      email: d.step1.email,
      password: d.step1.password,
      role: 'vendor',
      name: d.step1.name,
      vendorId: vendorId,
    };
    Store.Users.save(userData);

    const result = Auth.login(d.step1.email, d.step1.password);
    if (result.success) {
      App.currentUser = result.user;
      App.currentVendor = Store.Vendors.getById(result.user.vendorId);
      showToast('success', 'Application Submitted!', 'We will review your application within 1-2 business days.');
      setTimeout(() => {
        App.showScreen('pending');
        App.populatePendingScreen();
      }, 800);
    }
  }, 1500);
}

function handleProfileImagePreview(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById(previewId);
    preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    App.regData.step3.profileImage = e.target.result;
  };
  reader.readAsDataURL(file);
}

function bindLoginForm() {
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    let valid = true;
    if (!email) { showFieldError('login-email', 'err-login-email'); valid = false; } else clearFieldError('login-email', 'err-login-email');
    if (!password) { showFieldError('login-password', 'err-login-password'); valid = false; } else clearFieldError('login-password', 'err-login-password');
    if (!valid) return;

    const result = Auth.login(email, password);
    if (!result.success) {
      document.getElementById('login-error').textContent = result.error;
      document.getElementById('login-error').style.display = 'block';
      return;
    }
    if (result.user.role !== 'vendor') {
      document.getElementById('login-error').textContent = 'This account does not have vendor access.';
      document.getElementById('login-error').style.display = 'block';
      return;
    }
    document.getElementById('login-error').style.display = 'none';
    App.currentUser = result.user;
    App.currentVendor = Store.Vendors.getById(result.user.vendorId);
    if (!App.currentVendor) {
      document.getElementById('login-error').textContent = 'Vendor profile not found. Please contact support.';
      document.getElementById('login-error').style.display = 'block';
      return;
    }
    if (App.currentVendor.status === 'pending') {
      App.showScreen('pending');
      App.populatePendingScreen();
    } else if (App.currentVendor.status === 'approved') {
      App.showScreen('dashboard');
      App.initDashboard();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   PENDING SCREEN
═══════════════════════════════════════════════════════════════ */
App.populatePendingScreen = function() {
  const v = this.currentVendor;
  if (!v) return;
  document.getElementById('pending-biz-name').textContent = v.businessName;
  document.getElementById('pending-category').textContent = v.category;
  document.getElementById('pending-location').textContent = v.location;
  document.getElementById('pending-email').textContent = v.email;
  document.getElementById('pending-submitted').textContent = formatDate(v.createdAt);
};

function pendingRefresh() {
  const btn = document.getElementById('pending-refresh-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block"></div> Checking...';
  setTimeout(() => {
    const vendor = Store.Vendors.getById(App.currentVendor.id);
    App.currentVendor = vendor;
    if (vendor && vendor.status === 'approved') {
      showToast('success', 'Application Approved!', 'Welcome to WedInvite Vendor Portal!');
      setTimeout(() => {
        App.showScreen('dashboard');
        App.initDashboard();
      }, 1000);
    } else {
      showToast('info', 'Still Under Review', 'Your application is still being reviewed. Please check back soon.');
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="refresh-cw" style="width:16px;height:16px"></i> Check Again';
      lucide.createIcons();
    }
  }, 1500);
}

function pendingLogout() {
  sessionStorage.removeItem('wp_session');
  App.currentUser = null;
  App.currentVendor = null;
  App.showScreen('auth');
  switchAuthTab('login');
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD LAYOUT
═══════════════════════════════════════════════════════════════ */
App.renderHeader = function() {
  const v = this.currentVendor;
  const initials = (v.businessName || 'V').charAt(0).toUpperCase();
  document.getElementById('header-biz-name').textContent = v.businessName;
  document.getElementById('header-category').textContent = v.category;
  const avatarBtn = document.getElementById('avatar-btn');
  if (v.profileImage) {
    avatarBtn.innerHTML = `<img src="${v.profileImage}" alt="${initials}">`;
  } else {
    avatarBtn.textContent = initials;
  }
  document.getElementById('dd-vendor-name').textContent = v.businessName;
  document.getElementById('dd-vendor-email').textContent = v.email;
};

App.renderSidebar = function() {
  updateSidebarCompletion();
};

function toggleSidebar() {
  const sidebar = document.querySelector('.vnd-sidebar');
  const body = document.querySelector('#dashboard-screen');
  App.sidebarCollapsed = !App.sidebarCollapsed;
  sidebar.classList.toggle('collapsed', App.sidebarCollapsed);
  body.classList.toggle('sidebar-collapsed', App.sidebarCollapsed);
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector('.vnd-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  sidebar.classList.toggle('mobile-open');
  overlay.classList.toggle('open');
}

function toggleAvatarDropdown() {
  document.getElementById('avatar-dropdown').classList.toggle('open');
}

function vendorLogout() {
  showConfirm('Log Out', 'Are you sure you want to log out?', () => {
    sessionStorage.removeItem('wp_session');
    location.reload();
  });
}

function updateSidebarCompletion() {
  const v = App.currentVendor;
  const listings = App.getListings();
  const checks = [
    !!v.contactName,
    !!v.description,
    !!v.phone,
    !!v.website,
    !!v.category,
    !!v.profileImage,
    listings.length > 0,
  ];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  document.getElementById('sidebar-completion-pct').textContent = pct + '%';
  document.getElementById('sidebar-completion-bar').style.width = pct + '%';
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 1: DASHBOARD
═══════════════════════════════════════════════════════════════ */
App.renderDashboard = function() {
  const v = this.currentVendor;
  const listings = this.getListings();
  const activeListings = listings.filter(l => l.active).length;
  const pendingBookings = MOCK_BOOKINGS.filter(b => b.status === 'pending').length;
  const confirmedBookings = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length;

  // KPIs
  document.getElementById('kpi-views').textContent = '234';
  document.getElementById('kpi-listings').textContent = activeListings;
  document.getElementById('kpi-pending').textContent = pendingBookings;
  document.getElementById('kpi-confirmed').textContent = confirmedBookings;
  document.getElementById('kpi-earned').textContent = formatLKR(485000);
  document.getElementById('kpi-rating').textContent = v.rating || '—';

  // Recent bookings
  const recent = MOCK_BOOKINGS.slice(0, 3);
  document.getElementById('recent-bookings-list').innerHTML = recent.map(b => `
    <div class="recent-booking-item">
      <div>
        <div class="rb-couple">${b.coupleName}</div>
        <div class="rb-service">${b.serviceName}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:var(--text-xs);color:var(--adm-text-muted)">${formatDate(b.weddingDate)}</div>
      </div>
      <div class="rb-amount">${formatLKR(b.amount)}</div>
      <span class="badge badge-${b.status}">${capitalize(b.status)}</span>
    </div>
  `).join('');

  // Profile completion card
  renderCompletionCard();

  // Chart
  setTimeout(() => renderDashboardChart(), 100);
};

function renderCompletionCard() {
  const v = App.currentVendor;
  const listings = App.getListings();
  const items = [
    { label: 'Business name', done: !!v.businessName },
    { label: 'Description added', done: !!v.description },
    { label: 'Phone number', done: !!v.phone },
    { label: 'Website URL', done: !!v.website },
    { label: 'Category set', done: !!v.category },
    { label: 'Profile image', done: !!v.profileImage },
    { label: 'At least 1 listing', done: listings.length > 0 },
  ];
  const pct = Math.round((items.filter(i => i.done).length / items.length) * 100);
  const card = document.getElementById('completion-card');
  if (pct >= 100) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  document.getElementById('completion-pct').textContent = pct + '%';
  document.getElementById('completion-bar').style.width = pct + '%';
  document.getElementById('completion-items').innerHTML = items.map(item => `
    <div class="completion-item ${item.done ? 'done' : 'todo'}">
      <i data-lucide="${item.done ? 'check-circle' : 'circle'}" style="width:14px;height:14px;flex-shrink:0"></i>
      <span>${item.label}</span>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderDashboardChart() {
  const ctx = document.getElementById('bookings-chart');
  if (!ctx) return;
  if (App.charts.bookings) App.charts.bookings.destroy();
  App.charts.bookings = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Bookings',
        data: [2, 5, 3, 7],
        backgroundColor: 'rgba(139,92,246,0.7)',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 2: PROFILE & PORTFOLIO
═══════════════════════════════════════════════════════════════ */
App.renderProfile = function() {
  const v = this.currentVendor;
  if (!v) return;
  const cats = ['Photography','Videography','Decor','Catering','Music','Venue','Makeup','Cake','Jewelry','Transport','Planning','Other'];
  document.getElementById('prof-name').value = v.businessName || '';
  document.getElementById('prof-cat').value = v.category || '';
  document.getElementById('prof-location').value = v.location || '';
  document.getElementById('prof-phone').value = v.phone || '';
  document.getElementById('prof-website').value = v.website || '';
  document.getElementById('prof-years').value = v.yearsInBusiness || '';
  document.getElementById('prof-desc').value = v.description || '';
  document.getElementById('prof-desc-count').textContent = (v.description || '').length;
  document.getElementById('prof-featured-status').textContent = v.featured ? 'Yes — Featured' : 'Not featured';

  // Profile image
  if (v.profileImage) {
    document.getElementById('prof-image-preview').innerHTML = `<img src="${v.profileImage}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  }

  renderPortfolioGrid();
};

function saveProfile() {
  const v = App.currentVendor;
  v.businessName = document.getElementById('prof-name').value.trim();
  v.category = document.getElementById('prof-cat').value;
  v.location = document.getElementById('prof-location').value.trim();
  v.phone = document.getElementById('prof-phone').value.trim();
  v.website = document.getElementById('prof-website').value.trim();
  v.yearsInBusiness = document.getElementById('prof-years').value;
  v.description = document.getElementById('prof-desc').value.trim();
  Store.Vendors.save(v);
  App.currentVendor = Store.Vendors.getById(v.id);
  updateSidebarCompletion();
  showToast('success', 'Profile Saved', 'Your business profile has been updated.');
}

function handleProfilePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('prof-image-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    App.currentVendor.profileImage = e.target.result;
    Store.Vendors.save(App.currentVendor);
    updateSidebarCompletion();
    showToast('success', 'Photo Updated', 'Your profile photo has been updated.');
  };
  reader.readAsDataURL(file);
}

function renderPortfolioGrid() {
  const v = App.currentVendor;
  const portfolio = v.portfolio || [];
  const grid = document.getElementById('portfolio-grid');
  if (portfolio.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:var(--space-8)">
      <div class="empty-icon"><i data-lucide="image" style="width:32px;height:32px"></i></div>
      <p class="empty-title">No portfolio images yet</p>
      <p class="empty-message">Upload images to showcase your work to potential clients.</p>
    </div>`;
    lucide.createIcons();
    return;
  }
  grid.innerHTML = portfolio.map((img, idx) => `
    <div class="portfolio-item">
      <img src="${img}" alt="Portfolio ${idx+1}">
      <div class="portfolio-item-overlay">
        <button class="btn btn-danger btn-sm" onclick="deletePortfolioImage(${idx})">
          <i data-lucide="trash-2" style="width:14px;height:14px"></i>
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function handlePortfolioUpload(input) {
  const files = Array.from(input.files);
  const v = App.currentVendor;
  if (!v.portfolio) v.portfolio = [];
  if (v.portfolio.length + files.length > 10) {
    showToast('warning', 'Maximum Images', 'You can upload a maximum of 10 portfolio images.');
    return;
  }
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      v.portfolio.push(e.target.result);
      loaded++;
      if (loaded === files.length) {
        Store.Vendors.save(v);
        renderPortfolioGrid();
        showToast('success', 'Images Uploaded', `${files.length} image(s) added to your portfolio.`);
      }
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function deletePortfolioImage(idx) {
  showConfirm('Delete Image', 'Remove this image from your portfolio?', () => {
    const v = App.currentVendor;
    v.portfolio.splice(idx, 1);
    Store.Vendors.save(v);
    renderPortfolioGrid();
    showToast('success', 'Image Removed', 'Portfolio image deleted.');
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 3: MY LISTINGS
═══════════════════════════════════════════════════════════════ */
App.renderListings = function() {
  const listings = this.getListings();
  const grid = document.getElementById('listings-grid');
  if (listings.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon"><i data-lucide="package" style="width:32px;height:32px"></i></div>
      <p class="empty-title">No listings yet</p>
      <p class="empty-message">Create your first service listing to start receiving booking requests from couples.</p>
      <button class="btn btn-primary" onclick="openListingModal()"><i data-lucide="plus" style="width:16px;height:16px"></i> Create First Listing</button>
    </div>`;
    lucide.createIcons();
    return;
  }
  grid.innerHTML = listings.map(l => `
    <div class="listing-card">
      <div class="listing-card-header">
        <div class="listing-name">${l.name}</div>
        <div>
          <span class="listing-price">${formatLKR(l.price)}</span>
          <span class="listing-price-type"> / ${l.priceType}</span>
        </div>
      </div>
      <div class="listing-card-body">
        <p class="listing-desc">${l.description}</p>
      </div>
      <div class="listing-card-footer">
        <span class="badge badge-${l.active ? 'active' : 'inactive'}">${l.active ? 'Active' : 'Inactive'}</span>
        <div style="display:flex;gap:var(--space-2)">
          <button class="btn btn-secondary btn-sm" onclick="openListingModal('${l.id}')"><i data-lucide="edit" style="width:14px;height:14px"></i> Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteListing('${l.id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
};

function openListingModal(listingId) {
  const listings = App.getListings();
  const listing = listingId ? listings.find(l => l.id === listingId) : null;
  App.editingListing = listing;
  const priceTypes = ['per event', 'per day', 'per hour', 'per session'];
  document.getElementById('listing-modal-title').textContent = listing ? 'Edit Listing' : 'Create New Listing';
  document.getElementById('listing-name').value = listing ? listing.name : '';
  document.getElementById('listing-desc-input').value = listing ? listing.description : '';
  document.getElementById('listing-price').value = listing ? listing.price : '';
  document.getElementById('listing-price-type').value = listing ? listing.priceType : 'per event';
  document.getElementById('listing-inclusions').value = listing ? (listing.inclusions || '') : '';
  document.getElementById('listing-active').checked = listing ? listing.active : true;
  openModal('listing-modal');
}

function saveListing() {
  const name = document.getElementById('listing-name').value.trim();
  const desc = document.getElementById('listing-desc-input').value.trim();
  const price = parseFloat(document.getElementById('listing-price').value);
  const priceType = document.getElementById('listing-price-type').value;
  const inclusions = document.getElementById('listing-inclusions').value.trim();
  const active = document.getElementById('listing-active').checked;
  let valid = true;
  if (!name) { showFieldError('listing-name', 'err-listing-name'); valid = false; } else clearFieldError('listing-name', 'err-listing-name');
  if (!price || isNaN(price)) { showFieldError('listing-price', 'err-listing-price'); valid = false; } else clearFieldError('listing-price', 'err-listing-price');
  if (!valid) return;

  const listings = App.getListings();
  if (App.editingListing) {
    const idx = listings.findIndex(l => l.id === App.editingListing.id);
    if (idx >= 0) listings[idx] = { ...listings[idx], name, description: desc, price, priceType, inclusions, active };
  } else {
    listings.push({ id: `l${Date.now()}`, vendorId: App.currentVendor.id, name, description: desc, price, priceType, inclusions, active });
  }
  App.saveListings(listings);
  closeModal('listing-modal');
  App.renderListings();
  updateSidebarCompletion();
  showToast('success', App.editingListing ? 'Listing Updated' : 'Listing Created', `"${name}" has been saved.`);
}

function deleteListing(id) {
  const listings = App.getListings();
  const l = listings.find(l => l.id === id);
  showConfirm('Delete Listing', `Delete "${l ? l.name : 'this listing'}"? This cannot be undone.`, () => {
    App.saveListings(listings.filter(l => l.id !== id));
    App.renderListings();
    updateSidebarCompletion();
    showToast('success', 'Listing Deleted', 'The listing has been removed.');
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 4: BOOKINGS
═══════════════════════════════════════════════════════════════ */
App.renderBookings = function() {
  const tabs = ['pending', 'confirmed', 'declined', 'all'];
  tabs.forEach(tab => {
    const bookings = tab === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === tab);
    const container = document.getElementById(`bookings-${tab}`);
    if (!container) return;
    const count = bookings.length;
    const tabBtn = document.querySelector(`[data-booking-tab="${tab}"]`);
    if (tabBtn) {
      tabBtn.querySelector('.tab-count').textContent = count;
    }
    if (count === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i data-lucide="calendar-check" style="width:32px;height:32px"></i></div>
        <p class="empty-title">No ${tab} bookings</p>
        <p class="empty-message">Booking requests will appear here once couples reach out.</p>
      </div>`;
      lucide.createIcons();
      return;
    }
    container.innerHTML = `<div class="booking-cards">${bookings.map(b => renderBookingCard(b)).join('')}</div>`;
    lucide.createIcons();
  });
};

function renderBookingCard(b) {
  const isPending = b.status === 'pending';
  return `
    <div class="booking-card">
      <div class="booking-card-header">
        <div>
          <div class="booking-couple">${b.coupleName}</div>
          <div class="booking-service">${b.serviceName}</div>
        </div>
        <span class="badge badge-${b.status}">${capitalize(b.status)}</span>
      </div>
      <div class="booking-message">"${b.message}"</div>
      <div class="booking-meta">
        <div class="booking-meta-item"><i data-lucide="calendar" style="width:14px;height:14px"></i> Wedding: ${formatDate(b.weddingDate)}</div>
        <div class="booking-meta-item"><i data-lucide="clock" style="width:14px;height:14px"></i> Requested: ${formatDate(b.requestedDate)}</div>
        <div class="booking-meta-item"><i data-lucide="banknote" style="width:14px;height:14px"></i> ${formatLKR(b.amount)}</div>
        <div class="booking-meta-item"><i data-lucide="mail" style="width:14px;height:14px"></i> ${b.email}</div>
      </div>
      ${isPending ? `
      <div class="booking-actions">
        <button class="btn btn-success btn-sm" onclick="updateBookingStatus('${b.id}','confirmed')"><i data-lucide="check" style="width:14px;height:14px"></i> Accept</button>
        <button class="btn btn-danger btn-sm" onclick="updateBookingStatus('${b.id}','declined')"><i data-lucide="x" style="width:14px;height:14px"></i> Decline</button>
        <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('messages')"><i data-lucide="message-square" style="width:14px;height:14px"></i> Message</button>
      </div>` : ''}
    </div>`;
}

function updateBookingStatus(bookingId, newStatus) {
  const b = MOCK_BOOKINGS.find(b => b.id === bookingId);
  if (!b) return;
  const action = newStatus === 'confirmed' ? 'Accept' : 'Decline';
  showConfirm(`${action} Booking`, `${action} the booking request from ${b.coupleName}?`, () => {
    b.status = newStatus;
    App.renderBookings();
    showToast(newStatus === 'confirmed' ? 'success' : 'info', `Booking ${capitalize(newStatus)}`, `${b.coupleName}'s booking has been ${newStatus}.`);
  });
}

function switchBookingTab(tab) {
  document.querySelectorAll('[data-booking-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.bookingTab === tab));
  document.querySelectorAll('[data-booking-content]').forEach(el => el.classList.toggle('active', el.dataset.bookingContent === tab));
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 5: AVAILABILITY CALENDAR
═══════════════════════════════════════════════════════════════ */
App.renderAvailability = function() {
  renderCalendar();
};

function renderCalendar() {
  const year = App.calendarYear;
  const month = App.calendarMonth;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Booked dates from mock bookings
  const bookedDates = new Set();
  MOCK_BOOKINGS.filter(b => b.status === 'confirmed').forEach(b => {
    const d = new Date(b.weddingDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      bookedDates.add(d.getDate());
    }
  });

  const avKey = `${year}-${month}`;
  const avData = App.availabilityData[avKey] || {};

  let html = '';
  // Empty cells for first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-date empty"></div>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isBooked = bookedDates.has(d);
    const state = avData[d]; // 'blocked' | 'available' | undefined
    let cls = 'calendar-date';
    if (isToday) cls += ' today';
    if (isBooked) cls += ' booked';
    else if (state === 'blocked') cls += ' blocked';
    else if (state === 'available') cls += ' available';
    const clickable = isBooked ? '' : `onclick="toggleCalendarDate(${d})"`;
    html += `<div class="${cls}" ${clickable}>${d}</div>`;
  }
  document.getElementById('calendar-dates').innerHTML = html;
}

function calendarPrev() {
  App.calendarMonth--;
  if (App.calendarMonth < 0) { App.calendarMonth = 11; App.calendarYear--; }
  renderCalendar();
}

function calendarNext() {
  App.calendarMonth++;
  if (App.calendarMonth > 11) { App.calendarMonth = 0; App.calendarYear++; }
  renderCalendar();
}

function toggleCalendarDate(day) {
  const avKey = `${App.calendarYear}-${App.calendarMonth}`;
  if (!App.availabilityData[avKey]) App.availabilityData[avKey] = {};
  const current = App.availabilityData[avKey][day];
  if (!current) App.availabilityData[avKey][day] = 'available';
  else if (current === 'available') App.availabilityData[avKey][day] = 'blocked';
  else delete App.availabilityData[avKey][day];
  renderCalendar();
}

function saveAvailability() {
  App.saveAvailability();
  showToast('success', 'Availability Saved', 'Your availability calendar has been updated.');
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 6: MESSAGES
═══════════════════════════════════════════════════════════════ */
App.renderMessages = function() {
  const msgs = this.getMessages();
  const list = document.getElementById('conversations-list-items');
  list.innerHTML = msgs.map(cv => `
    <div class="conversation-item ${cv.id === App.currentConversation ? 'active' : ''}" onclick="selectConversation('${cv.id}')">
      <div class="conv-name">
        <span>${cv.senderName}</span>
        ${cv.unread > 0 ? `<span class="unread-badge">${cv.unread}</span>` : `<span class="conv-time">${cv.time}</span>`}
      </div>
      <div class="conv-preview">${cv.lastMessage}</div>
    </div>
  `).join('');

  if (!App.currentConversation && msgs.length > 0) {
    selectConversation(msgs[0].id);
  } else if (App.currentConversation) {
    renderThread(App.currentConversation);
  }
};

function selectConversation(id) {
  App.currentConversation = id;
  const msgs = App.getMessages();
  // Mark as read
  const cv = msgs.find(c => c.id === id);
  if (cv) { cv.unread = 0; App.saveMessages(msgs); }
  // Re-render list to update unread badge
  document.querySelectorAll('.conversation-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick').includes(`'${id}'`));
  });
  renderThread(id);
}

function renderThread(id) {
  const msgs = App.getMessages();
  const cv = msgs.find(c => c.id === id);
  if (!cv) return;
  document.getElementById('thread-name').textContent = cv.senderName;
  document.getElementById('thread-sub').textContent = cv.senderEmail;
  document.getElementById('thread-messages').innerHTML = cv.messages.map(m => `
    <div class="message-bubble ${m.outgoing ? 'outgoing' : 'incoming'}">
      ${!m.outgoing ? `<div class="bubble-sender">${m.sender}</div>` : ''}
      <div class="bubble-text">${m.text}</div>
      <div class="bubble-time">${m.time}</div>
    </div>
  `).join('');
  // Scroll to bottom
  const threadEl = document.getElementById('thread-messages');
  threadEl.scrollTop = threadEl.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text || !App.currentConversation) return;
  const msgs = App.getMessages();
  const cv = msgs.find(c => c.id === App.currentConversation);
  if (!cv) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const newMsg = { sender: 'You', text, time: timeStr, outgoing: true };
  cv.messages.push(newMsg);
  cv.lastMessage = text;
  cv.time = timeStr;
  App.saveMessages(msgs);
  input.value = '';
  renderThread(App.currentConversation);
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 7: ANALYTICS
═══════════════════════════════════════════════════════════════ */
App.renderAnalytics = function() {
  setTimeout(() => {
    renderRevenueChart();
    renderServiceChart();
    renderStatusChart();
  }, 100);
};

function renderRevenueChart() {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;
  if (App.charts.revenue) App.charts.revenue.destroy();
  App.charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'],
      datasets: [{
        label: 'Revenue (LKR)',
        data: [20000,35000,45000,30000,55000,40000,60000,75000,50000,80000,65000,75000],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8B5CF6',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => 'LKR ' + (v/1000) + 'K' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderServiceChart() {
  const ctx = document.getElementById('service-chart');
  if (!ctx) return;
  if (App.charts.service) App.charts.service.destroy();
  App.charts.service = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Full Day Package', 'Pre-Wedding Shoot', 'Engagement'],
      datasets: [{
        label: 'Bookings',
        data: [8, 5, 3],
        backgroundColor: ['rgba(139,92,246,0.7)', 'rgba(13,148,136,0.7)', 'rgba(99,102,241,0.7)'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderStatusChart() {
  const ctx = document.getElementById('status-chart');
  if (!ctx) return;
  if (App.charts.status) App.charts.status.destroy();
  App.charts.status = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Confirmed', 'Pending', 'Declined'],
      datasets: [{
        data: [8, 3, 2],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
        borderWidth: 0,
        hoverOffset: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
      },
      cutout: '65%',
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 8: PAYOUTS
═══════════════════════════════════════════════════════════════ */
App.renderPayouts = function() {
  const tbody = document.getElementById('payouts-table-body');
  tbody.innerHTML = MOCK_PAYOUTS.map(p => `
    <tr>
      <td>${formatDate(p.date)}</td>
      <td>${p.period}</td>
      <td class="lkr-value fw-semi text-purple">${formatLKR(p.amount)}</td>
      <td><span class="badge badge-${p.status}">${capitalize(p.status)}</span></td>
      <td style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--adm-text-muted)">${p.ref}</td>
    </tr>
  `).join('');

  const earnings = document.getElementById('earnings-table-body');
  earnings.innerHTML = MOCK_EARNINGS_TABLE.map(e => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.description}</td>
      <td class="lkr-value fw-semi">${formatLKR(e.amount)}</td>
      <td><span class="badge badge-${e.status}">${capitalize(e.status)}</span></td>
    </tr>
  `).join('');
};

function saveBankDetails() {
  const holder = document.getElementById('bank-holder').value.trim();
  const bank = document.getElementById('bank-name').value.trim();
  const account = document.getElementById('bank-account').value.trim();
  const branch = document.getElementById('bank-branch').value.trim();
  if (!holder || !bank || !account) {
    showToast('error', 'Required Fields', 'Please fill in all required bank details.');
    return;
  }
  localStorage.setItem('wp_bank_details', JSON.stringify({ holder, bank, account, branch }));
  showToast('success', 'Bank Details Saved', 'Your payout bank details have been updated.');
}

/* ═══════════════════════════════════════════════════════════════
   MODULE 9: SETTINGS
═══════════════════════════════════════════════════════════════ */
App.renderSettings = function() {
  const v = this.currentVendor;
  const u = this.currentUser;
  document.getElementById('settings-name').value = v.contactName || u.name || '';
  document.getElementById('settings-email').value = u.email || '';
  document.getElementById('settings-profile-url').textContent = `https://wedinvite.lk/vendors/${v.id}`;

  // Load notification prefs
  try {
    const prefs = JSON.parse(localStorage.getItem('wp_notif_prefs') || '{}');
    ['new-booking', 'new-message', 'payment-received'].forEach(key => {
      const el = document.getElementById(`notif-${key}`);
      if (el) el.checked = prefs[key] !== false;
    });
  } catch {}

  // Load bank details
  try {
    const bank = JSON.parse(localStorage.getItem('wp_bank_details') || '{}');
    if (bank.holder) document.getElementById('bank-holder').value = bank.holder;
    if (bank.bank) document.getElementById('bank-name').value = bank.bank;
    if (bank.account) document.getElementById('bank-account').value = bank.account;
    if (bank.branch) document.getElementById('bank-branch').value = bank.branch;
  } catch {}
};

function saveAccountInfo() {
  const name = document.getElementById('settings-name').value.trim();
  const email = document.getElementById('settings-email').value.trim();
  if (!name || !email) {
    showToast('error', 'Required Fields', 'Name and email are required.');
    return;
  }
  App.currentVendor.contactName = name;
  Store.Vendors.save(App.currentVendor);
  showToast('success', 'Account Updated', 'Your account info has been saved.');
}

function changePassword() {
  const current = document.getElementById('current-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-new-password').value;
  if (!current || !newPass) {
    showToast('error', 'Required Fields', 'Please fill in all password fields.');
    return;
  }
  if (newPass.length < 6) {
    showToast('error', 'Password Too Short', 'New password must be at least 6 characters.');
    return;
  }
  if (newPass !== confirm) {
    showToast('error', 'Passwords Do Not Match', 'Please make sure both passwords are the same.');
    return;
  }
  const u = Store.Users.getById(App.currentUser.id);
  if (u.password !== current) {
    showToast('error', 'Wrong Password', 'Current password is incorrect.');
    return;
  }
  Store.Users.save({ ...u, password: newPass });
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-new-password').value = '';
  showToast('success', 'Password Changed', 'Your password has been updated successfully.');
}

function saveNotifPrefs() {
  const prefs = {};
  ['new-booking', 'new-message', 'payment-received'].forEach(key => {
    const el = document.getElementById(`notif-${key}`);
    if (el) prefs[key] = el.checked;
  });
  localStorage.setItem('wp_notif_prefs', JSON.stringify(prefs));
  showToast('success', 'Preferences Saved', 'Notification settings updated.');
}

function copyProfileUrl() {
  const url = document.getElementById('settings-profile-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    showToast('success', 'Copied!', 'Profile URL copied to clipboard.');
  }).catch(() => {
    showToast('info', 'Profile URL', url);
  });
}

function deactivateAccount() {
  showConfirm('Deactivate Account', 'This will hide your profile and listings from couples. You can reactivate later by contacting support. Proceed?', () => {
    App.currentVendor.status = 'inactive';
    Store.Vendors.save(App.currentVendor);
    showToast('warning', 'Account Deactivated', 'Your account has been deactivated.');
    setTimeout(() => {
      sessionStorage.removeItem('wp_session');
      location.reload();
    }, 2000);
  });
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: TOAST
═══════════════════════════════════════════════════════════════ */
function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  const iconMap = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${iconMap[type] || 'info'}" style="width:20px;height:20px"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button onclick="this.parentElement.remove()" style="border:none;background:none;cursor:pointer;color:var(--adm-text-muted);padding:4px;border-radius:4px;line-height:1;font-size:16px">&times;</button>
  `;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: CONFIRM
═══════════════════════════════════════════════════════════════ */
let confirmCallback = null;

function showConfirm(title, message, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-overlay').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
  confirmCallback = null;
}

function doConfirm() {
  if (confirmCallback) confirmCallback();
  closeConfirm();
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: MODAL
═══════════════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: FIELD ERRORS
═══════════════════════════════════════════════════════════════ */
function showFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (err) err.classList.add('show');
}

function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (err) err.classList.remove('show');
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: FORMATTING
═══════════════════════════════════════════════════════════════ */
function formatLKR(amount) {
  return 'LKR ' + Number(amount).toLocaleString('en-LK');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function checkSVG() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>';
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL EVENT BINDINGS
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.avatar-dropdown')) {
      document.getElementById('avatar-dropdown')?.classList.remove('open');
    }
  });

  // Modal close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Confirm overlay click
  document.getElementById('confirm-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'confirm-overlay') closeConfirm();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
      if (document.getElementById('confirm-overlay').classList.contains('open')) closeConfirm();
    }
  });

  // Message input Enter key
  document.getElementById('msg-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Drag-drop portfolio zone
  const dropZone = document.getElementById('portfolio-drop-zone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(ev => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over'));
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length) handlePortfolioUpload({ files, value: '' });
    });
  }

  // Init app
  App.init();
  initAuthScreen();
  lucide.createIcons();
});

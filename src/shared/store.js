/**
 * WEDDING PLATFORM — SHARED DATA STORE
 * localStorage-backed mock data layer
 * Simulates full backend CRUD for all portals
 */

const Store = (() => {

  // ── SEED DATA ──────────────────────────────────────────────────────────────
  const SEED = {
    weddings: [{
      id: 'w001',
      userId: 'u001',
      slug: 'priya-and-kasun',
      groomName: 'Kasun',
      brideName: 'Priya',
      title: 'The Wedding of Priya & Kasun',
      date: '2026-08-15',
      time: '17:00',
      timezone: 'Asia/Colombo',
      venueName: 'Cinnamon Grand Colombo',
      venueAddress: '77 Galle Rd, Colombo 03',
      venueMapLink: 'https://maps.google.com/?q=Cinnamon+Grand+Colombo',
      story: 'We met at a mutual friend\'s gathering in 2021 and knew from the very first moment that this was something special. Three years later, surrounded by the people we love most, we are ready to begin forever.',
      rsvpDeadline: '2026-07-30',
      contactEmail: 'priya.kasun.wedding@gmail.com',
      contactWhatsApp: '+94771234567',
      createdAt: '2026-01-10T08:00:00Z',
      siteSettings: {
        showLoadingScreen: true,
        showEnvelope: true,
        showCountdown: true,
        showAgenda: true,
        showRsvp: true,
        showGallery: true,
        showTableFinder: true,
        showGuestPreview: false,
        showStory: true,
        showMusic: true,
        showSpecialMessage: true,
        showVenueMap: true,
        primaryColor: '#C45A74',
        secondaryColor: '#C9A574',
        accentColor: '#8FA98F',
        surfaceColor: '#FCF8F6',
        theme: 'ivory-rose',
        musicEnabled: true,
        musicTrack: 'canon-in-d',
        musicMuteDefault: false,
        heroMessage: 'Together with our families, we joyfully invite you to celebrate our wedding.',
        specialMessage: 'Your presence is the greatest gift we could ask for. Thank you for being part of our special day.',
        rsvpSectionTitle: 'Will You Join Us?'
      }
    }],

    guests: [
      { id: 'g001', weddingId: 'w001', name: 'Anura Perera', side: 'groom', whatsapp: '+94771110001', email: 'anura@email.com', invitationType: 'family', maxMembers: 4, notes: 'Close family', token: 'tok_g001', createdAt: '2026-02-01T09:00:00Z' },
      { id: 'g002', weddingId: 'w001', name: 'Samanthi Fernando', side: 'bride', whatsapp: '+94772220002', email: 'samanthi@email.com', invitationType: 'individual', maxMembers: 1, notes: 'College friend', token: 'tok_g002', createdAt: '2026-02-02T09:00:00Z' },
      { id: 'g003', weddingId: 'w001', name: 'Dinesh Jayawardena', side: 'groom', whatsapp: '+94773330003', email: '', invitationType: 'family', maxMembers: 3, notes: '', token: 'tok_g003', createdAt: '2026-02-03T09:00:00Z' },
      { id: 'g004', weddingId: 'w001', name: 'Nirmala Seneviratne', side: 'bride', whatsapp: '+94774440004', email: 'nirmala@email.com', invitationType: 'individual', maxMembers: 1, notes: 'Office colleague', token: 'tok_g004', createdAt: '2026-02-04T09:00:00Z' },
      { id: 'g005', weddingId: 'w001', name: 'Roshan Silva', side: 'groom', whatsapp: '+94775550005', email: '', invitationType: 'family', maxMembers: 5, notes: 'Uncle — large family', token: 'tok_g005', createdAt: '2026-02-05T09:00:00Z' },
      { id: 'g006', weddingId: 'w001', name: 'Chathuri Wijesinghe', side: 'bride', whatsapp: '+94776660006', email: 'chathuri@email.com', invitationType: 'individual', maxMembers: 1, notes: 'School bestie', token: 'tok_g006', createdAt: '2026-02-06T09:00:00Z' },
    ],

    rsvps: [
      { id: 'r001', guestId: 'g001', weddingId: 'w001', status: 'confirmed', attendingCount: 3, liquorPreference: 'yes', mealPreference: 'non-veg', notes: 'Looking forward to it!', updatedAt: '2026-03-15T10:00:00Z' },
      { id: 'r002', guestId: 'g002', weddingId: 'w001', status: 'confirmed', attendingCount: 1, liquorPreference: 'no', mealPreference: 'veg', notes: '', updatedAt: '2026-03-16T11:00:00Z' },
      { id: 'r003', guestId: 'g003', weddingId: 'w001', status: 'pending', attendingCount: 0, liquorPreference: '', mealPreference: '', notes: '', updatedAt: '' },
      { id: 'r004', guestId: 'g004', weddingId: 'w001', status: 'declined', attendingCount: 0, liquorPreference: '', mealPreference: '', notes: 'Sorry, travelling that week', updatedAt: '2026-03-17T09:00:00Z' },
      { id: 'r005', guestId: 'g005', weddingId: 'w001', status: 'pending', attendingCount: 0, liquorPreference: '', mealPreference: '', notes: '', updatedAt: '' },
      { id: 'r006', guestId: 'g006', weddingId: 'w001', status: 'confirmed', attendingCount: 1, liquorPreference: 'yes', mealPreference: 'non-veg', notes: 'Cannot wait!', updatedAt: '2026-03-18T14:00:00Z' },
    ],

    agenda: [
      { id: 'a001', weddingId: 'w001', title: 'Guest Arrival & Registration', time: '16:30', duration: 30, description: 'Welcome guests and light refreshments', icon: '🌸', order: 1 },
      { id: 'a002', weddingId: 'w001', title: 'Wedding Ceremony', time: '17:00', duration: 45, description: 'The sacred union of Priya & Kasun', icon: '💍', order: 2 },
      { id: 'a003', weddingId: 'w001', title: 'Photography Session', time: '17:45', duration: 30, description: 'Family and couple portraits', icon: '📸', order: 3 },
      { id: 'a004', weddingId: 'w001', title: 'Reception & Dinner', time: '18:30', duration: 120, description: 'Celebration dinner with live music', icon: '🍽️', order: 4 },
      { id: 'a005', weddingId: 'w001', title: 'First Dance', time: '19:30', duration: 15, description: 'The couple\'s first dance together', icon: '💃', order: 5 },
      { id: 'a006', weddingId: 'w001', title: 'Cake Cutting', time: '20:00', duration: 15, description: 'A sweet moment to share', icon: '🎂', order: 6 },
    ],

    tables: [
      { id: 't001', weddingId: 'w001', name: 'Table 1 — Jasmine', capacity: 8, guestIds: ['g001', 'g002'], notes: 'Near stage' },
      { id: 't002', weddingId: 'w001', name: 'Table 2 — Rose', capacity: 6, guestIds: ['g006'], notes: '' },
      { id: 't003', weddingId: 'w001', name: 'Table 3 — Orchid', capacity: 8, guestIds: [], notes: 'Reserved for bride family' },
    ],

    gallery: [
      { id: 'img001', weddingId: 'w001', type: 'hero', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80', caption: 'Hero image', order: 1 },
      { id: 'img002', weddingId: 'w001', type: 'gallery', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', caption: 'Couple photo 1', order: 1 },
      { id: 'img003', weddingId: 'w001', type: 'gallery', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80', caption: 'Couple photo 2', order: 2 },
      { id: 'img004', weddingId: 'w001', type: 'gallery', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', caption: 'Couple photo 3', order: 3 },
      { id: 'img005', weddingId: 'w001', type: 'gallery', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', caption: 'Couple photo 4', order: 4 },
      { id: 'img006', weddingId: 'w001', type: 'story', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', caption: 'Our story', order: 1 },
    ],

    budget: [
      { id: 'b001', weddingId: 'w001', category: 'Venue', item: 'Cinnamon Grand — Ballroom', estimated: 800000, actual: 850000, paid: 425000, notes: '50% paid deposit', createdAt: '2026-02-01' },
      { id: 'b002', weddingId: 'w001', category: 'Catering', item: 'Buffet dinner — 250 pax', estimated: 500000, actual: 500000, paid: 500000, notes: 'Paid in full', createdAt: '2026-02-05' },
      { id: 'b003', weddingId: 'w001', category: 'Photography', item: 'Avishka Photography Studio', estimated: 150000, actual: 150000, paid: 75000, notes: 'Balance on day', createdAt: '2026-02-10' },
      { id: 'b004', weddingId: 'w001', category: 'Decor', item: 'Floral arrangements & stage', estimated: 200000, actual: 180000, paid: 90000, notes: '', createdAt: '2026-02-15' },
      { id: 'b005', weddingId: 'w001', category: 'Dress', item: 'Bridal gown + alterations', estimated: 120000, actual: 135000, paid: 135000, notes: 'Fully paid', createdAt: '2026-03-01' },
      { id: 'b006', weddingId: 'w001', category: 'Music', item: 'Live band — evening', estimated: 80000, actual: 80000, paid: 0, notes: 'Pay on day', createdAt: '2026-03-05' },
    ],

    checklist: [
      { id: 'c001', weddingId: 'w001', title: 'Book ceremony venue', group: '4 months before', completed: true, dueDate: '2026-04-15', priority: 'high', custom: false },
      { id: 'c002', weddingId: 'w001', title: 'Confirm guest list', group: '4 months before', completed: true, dueDate: '2026-04-20', priority: 'high', custom: false },
      { id: 'c003', weddingId: 'w001', title: 'Book photographer', group: '3 months before', completed: true, dueDate: '2026-05-15', priority: 'high', custom: false },
      { id: 'c004', weddingId: 'w001', title: 'Send digital invitations', group: '3 months before', completed: false, dueDate: '2026-05-30', priority: 'high', custom: false },
      { id: 'c005', weddingId: 'w001', title: 'Book florist', group: '2 months before', completed: false, dueDate: '2026-06-15', priority: 'medium', custom: false },
      { id: 'c006', weddingId: 'w001', title: 'Order wedding cake', group: '2 months before', completed: false, dueDate: '2026-06-20', priority: 'medium', custom: false },
      { id: 'c007', weddingId: 'w001', title: 'Arrange wedding transport', group: '1 month before', completed: false, dueDate: '2026-07-15', priority: 'medium', custom: false },
      { id: 'c008', weddingId: 'w001', title: 'Confirm table assignments', group: '1 week before', completed: false, dueDate: '2026-08-08', priority: 'high', custom: false },
    ],

    vendorsList: [
      { id: 'v001', userId: 'u010', businessName: 'Avishka Photography Studio', category: 'Photography', contactName: 'Avishka Dias', email: 'avishka@photos.lk', phone: '+94771234500', location: 'Colombo', description: 'Award-winning wedding photography since 2015', status: 'approved', featured: true, profileImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=80', portfolio: [], rating: 4.9, reviewCount: 87, createdAt: '2025-12-01' },
      { id: 'v002', userId: 'u011', businessName: 'Blooms & Petals Decor', category: 'Decor', contactName: 'Madhavi Ranawaka', email: 'madhavi@blooms.lk', phone: '+94772345600', location: 'Colombo', description: 'Luxury floral and event decor specialists', status: 'approved', featured: false, profileImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80', portfolio: [], rating: 4.7, reviewCount: 52, createdAt: '2025-12-15' },
      { id: 'v003', userId: 'u012', businessName: 'SweetBites Bakery', category: 'Cake', contactName: 'Kasuni Alwis', email: 'kasuni@sweetbites.lk', phone: '+94773456700', location: 'Kandy', description: 'Custom wedding cakes and dessert tables', status: 'pending', featured: false, profileImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', portfolio: [], rating: 0, reviewCount: 0, createdAt: '2026-01-10' },
      { id: 'v004', userId: 'u013', businessName: 'Melody Events Band', category: 'Music', contactName: 'Lahiru Bandara', email: 'lahiru@melody.lk', phone: '+94774567800', location: 'Colombo', description: 'Live music for all wedding occasions', status: 'approved', featured: true, profileImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', portfolio: [], rating: 4.8, reviewCount: 64, createdAt: '2025-11-20' },
    ],

    myVendors: [
      { id: 'mv001', weddingId: 'w001', vendorId: 'v001', vendorName: 'Avishka Photography Studio', category: 'Photography', status: 'booked', quoteAmount: 150000, notes: 'Pre-shoot on 1st Aug', contactPhone: '+94771234500' },
      { id: 'mv002', weddingId: 'w001', vendorId: 'v002', vendorName: 'Blooms & Petals Decor', category: 'Decor', status: 'quoted', quoteAmount: 180000, notes: 'Pending final design approval', contactPhone: '+94772345600' },
    ],

    users: [
      { id: 'u001', email: 'couple@test.com', password: 'couple123', role: 'couple', weddingId: 'w001', name: 'Priya & Kasun', plan: 'trial', trialEnds: '2026-06-01', createdAt: '2026-01-10' },
      { id: 'u002', email: 'admin@test.com', password: 'admin123', role: 'super_admin', name: 'Platform Admin', createdAt: '2025-01-01' },
      { id: 'u010', email: 'vendor@test.com', password: 'vendor123', role: 'vendor', vendorId: 'v001', name: 'Avishka Dias', createdAt: '2025-12-01' },
    ],

    systemSettings: {
      platformName: 'WedInvite',
      supportEmail: 'support@wedinvite.lk',
      trialDays: 7,
      trialGracePeriod: 3,
      maxGuestsFree: 50,
      maxGuestsPremium: 500,
      maxGalleryFree: 10,
      maxGalleryPremium: 100,
      plans: [
        { id: 'trial', name: 'Free Trial', price: 0, duration: 7, guestLimit: 50, galleryLimit: 10 },
        { id: 'basic', name: 'Basic', price: 4900, duration: 365, guestLimit: 100, galleryLimit: 30 },
        { id: 'premium', name: 'Premium', price: 9900, duration: 365, guestLimit: 500, galleryLimit: 100 },
      ]
    }
  };

  // ── INIT ───────────────────────────────────────────────────────────────────
  function init() {
    if (!localStorage.getItem('wp_seeded')) {
      Object.entries(SEED).forEach(([key, value]) => {
        if (!localStorage.getItem(`wp_${key}`)) {
          localStorage.setItem(`wp_${key}`, JSON.stringify(value));
        }
      });
      localStorage.setItem('wp_seeded', '1');
    }
  }

  // ── GENERIC HELPERS ────────────────────────────────────────────────────────
  function get(key) {
    try { return JSON.parse(localStorage.getItem(`wp_${key}`)) || []; }
    catch { return []; }
  }

  function set(key, value) {
    localStorage.setItem(`wp_${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('wp:store:change', { detail: { key } }));
  }

  function getObj(key) {
    try { return JSON.parse(localStorage.getItem(`wp_${key}`)) || {}; }
    catch { return {}; }
  }

  function setObj(key, value) {
    localStorage.setItem(`wp_${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('wp:store:change', { detail: { key } }));
  }

  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  }

  // ── WEDDINGS ───────────────────────────────────────────────────────────────
  const Weddings = {
    getAll: () => get('weddings'),
    getById: (id) => get('weddings').find(w => w.id === id),
    getBySlug: (slug) => get('weddings').find(w => w.slug === slug),
    getByUserId: (uid) => get('weddings').find(w => w.userId === uid),
    save: (wedding) => {
      const list = get('weddings');
      const idx = list.findIndex(w => w.id === wedding.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...wedding };
      else list.push({ ...wedding, id: generateId('w'), createdAt: new Date().toISOString() });
      set('weddings', list);
      return list.find(w => w.id === wedding.id) || list[list.length - 1];
    },
    updateSettings: (weddingId, settings) => {
      const list = get('weddings');
      const idx = list.findIndex(w => w.id === weddingId);
      if (idx >= 0) {
        list[idx].siteSettings = { ...list[idx].siteSettings, ...settings };
        set('weddings', list);
      }
    },
    delete: (id) => set('weddings', get('weddings').filter(w => w.id !== id)),
  };

  // ── GUESTS ─────────────────────────────────────────────────────────────────
  const Guests = {
    getAll: (weddingId) => get('guests').filter(g => g.weddingId === weddingId),
    getById: (id) => get('guests').find(g => g.id === id),
    getByToken: (token) => get('guests').find(g => g.token === token),
    save: (guest) => {
      const list = get('guests');
      const idx = list.findIndex(g => g.id === guest.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...guest };
      else {
        const newGuest = { ...guest, id: generateId('g'), token: `tok_${generateId('g')}`, createdAt: new Date().toISOString() };
        list.push(newGuest);
      }
      set('guests', list);
    },
    delete: (id) => set('guests', get('guests').filter(g => g.id !== id)),
  };

  // ── RSVPs ──────────────────────────────────────────────────────────────────
  const RSVPs = {
    getAll: (weddingId) => get('rsvps').filter(r => r.weddingId === weddingId),
    getByGuest: (guestId) => get('rsvps').find(r => r.guestId === guestId),
    save: (rsvp) => {
      const list = get('rsvps');
      const idx = list.findIndex(r => r.guestId === rsvp.guestId && r.weddingId === rsvp.weddingId);
      if (idx >= 0) list[idx] = { ...list[idx], ...rsvp, updatedAt: new Date().toISOString() };
      else list.push({ ...rsvp, id: generateId('r'), updatedAt: new Date().toISOString() });
      set('rsvps', list);
    },
    getStats: (weddingId) => {
      const guests = Guests.getAll(weddingId);
      const rsvps = RSVPs.getAll(weddingId);
      const confirmed = rsvps.filter(r => r.status === 'confirmed');
      return {
        total: guests.length,
        confirmed: confirmed.length,
        declined: rsvps.filter(r => r.status === 'declined').length,
        pending: guests.length - rsvps.filter(r => r.status !== 'pending').length,
        totalAttending: confirmed.reduce((s, r) => s + (r.attendingCount || 0), 0),
        liquorYes: confirmed.filter(r => r.liquorPreference === 'yes').length,
        liquorNo: confirmed.filter(r => r.liquorPreference === 'no').length,
      };
    }
  };

  // ── AGENDA ─────────────────────────────────────────────────────────────────
  const Agenda = {
    getAll: (weddingId) => get('agenda').filter(a => a.weddingId === weddingId).sort((a,b) => a.order - b.order),
    save: (item) => {
      const list = get('agenda');
      const idx = list.findIndex(a => a.id === item.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...item };
      else list.push({ ...item, id: generateId('a') });
      set('agenda', list);
    },
    delete: (id) => set('agenda', get('agenda').filter(a => a.id !== id)),
  };

  // ── TABLES ─────────────────────────────────────────────────────────────────
  const Tables = {
    getAll: (weddingId) => get('tables').filter(t => t.weddingId === weddingId),
    getById: (id) => get('tables').find(t => t.id === id),
    findForGuest: (weddingId, guestName) => {
      const tables = Tables.getAll(weddingId);
      const guests = Guests.getAll(weddingId);
      const match = guests.find(g => g.name.toLowerCase().includes(guestName.toLowerCase()));
      if (!match) return null;
      return tables.find(t => t.guestIds && t.guestIds.includes(match.id));
    },
    save: (table) => {
      const list = get('tables');
      const idx = list.findIndex(t => t.id === table.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...table };
      else list.push({ ...table, id: generateId('t'), guestIds: [] });
      set('tables', list);
    },
    delete: (id) => set('tables', get('tables').filter(t => t.id !== id)),
    assignGuest: (tableId, guestId) => {
      const list = get('tables');
      // Remove from all tables first
      list.forEach(t => { t.guestIds = (t.guestIds || []).filter(id => id !== guestId); });
      const table = list.find(t => t.id === tableId);
      if (table) { table.guestIds = [...(table.guestIds || []), guestId]; }
      set('tables', list);
    },
  };

  // ── GALLERY ────────────────────────────────────────────────────────────────
  const Gallery = {
    getAll: (weddingId) => get('gallery').filter(img => img.weddingId === weddingId),
    getByType: (weddingId, type) => Gallery.getAll(weddingId).filter(img => img.type === type),
    save: (img) => {
      const list = get('gallery');
      const idx = list.findIndex(i => i.id === img.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...img };
      else list.push({ ...img, id: generateId('img') });
      set('gallery', list);
    },
    delete: (id) => set('gallery', get('gallery').filter(img => img.id !== id)),
  };

  // ── BUDGET ─────────────────────────────────────────────────────────────────
  const Budget = {
    getAll: (weddingId) => get('budget').filter(b => b.weddingId === weddingId),
    getSummary: (weddingId) => {
      const items = Budget.getAll(weddingId);
      return {
        totalEstimated: items.reduce((s, b) => s + (b.estimated || 0), 0),
        totalActual: items.reduce((s, b) => s + (b.actual || 0), 0),
        totalPaid: items.reduce((s, b) => s + (b.paid || 0), 0),
        remaining: items.reduce((s, b) => s + ((b.actual || 0) - (b.paid || 0)), 0),
      };
    },
    save: (item) => {
      const list = get('budget');
      const idx = list.findIndex(b => b.id === item.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...item };
      else list.push({ ...item, id: generateId('b'), createdAt: new Date().toISOString().slice(0,10) });
      set('budget', list);
    },
    delete: (id) => set('budget', get('budget').filter(b => b.id !== id)),
  };

  // ── CHECKLIST ──────────────────────────────────────────────────────────────
  const Checklist = {
    getAll: (weddingId) => get('checklist').filter(c => c.weddingId === weddingId),
    getProgress: (weddingId) => {
      const items = Checklist.getAll(weddingId);
      if (!items.length) return 0;
      return Math.round((items.filter(c => c.completed).length / items.length) * 100);
    },
    toggle: (id) => {
      const list = get('checklist');
      const idx = list.findIndex(c => c.id === id);
      if (idx >= 0) list[idx].completed = !list[idx].completed;
      set('checklist', list);
    },
    save: (item) => {
      const list = get('checklist');
      const idx = list.findIndex(c => c.id === item.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...item };
      else list.push({ ...item, id: generateId('c'), completed: false, custom: true });
      set('checklist', list);
    },
    delete: (id) => set('checklist', get('checklist').filter(c => c.id !== id)),
  };

  // ── VENDORS ────────────────────────────────────────────────────────────────
  const Vendors = {
    getAll: () => get('vendorsList'),
    getById: (id) => get('vendorsList').find(v => v.id === id),
    getByStatus: (status) => get('vendorsList').filter(v => v.status === status),
    save: (vendor) => {
      const list = get('vendorsList');
      const idx = list.findIndex(v => v.id === vendor.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...vendor };
      else list.push({ ...vendor, id: generateId('v'), status: 'pending', createdAt: new Date().toISOString().slice(0,10) });
      set('vendorsList', list);
    },
    approve: (id) => {
      const list = get('vendorsList');
      const idx = list.findIndex(v => v.id === id);
      if (idx >= 0) list[idx].status = 'approved';
      set('vendorsList', list);
    },
    reject: (id) => {
      const list = get('vendorsList');
      const idx = list.findIndex(v => v.id === id);
      if (idx >= 0) list[idx].status = 'rejected';
      set('vendorsList', list);
    },
    delete: (id) => set('vendorsList', get('vendorsList').filter(v => v.id !== id)),
  };

  // ── MY VENDORS (couple's saved vendors) ───────────────────────────────────
  const MyVendors = {
    getAll: (weddingId) => get('myVendors').filter(v => v.weddingId === weddingId),
    save: (item) => {
      const list = get('myVendors');
      const idx = list.findIndex(v => v.id === item.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...item };
      else list.push({ ...item, id: generateId('mv') });
      set('myVendors', list);
    },
    delete: (id) => set('myVendors', get('myVendors').filter(v => v.id !== id)),
  };

  // ── USERS ──────────────────────────────────────────────────────────────────
  const Users = {
    getAll: () => get('users'),
    getById: (id) => get('users').find(u => u.id === id),
    findByEmail: (email) => get('users').find(u => u.email === email),
    authenticate: (email, password) => get('users').find(u => u.email === email && u.password === password),
    save: (user) => {
      const list = get('users');
      const idx = list.findIndex(u => u.id === user.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...user };
      else list.push({ ...user, id: generateId('u'), createdAt: new Date().toISOString().slice(0,10) });
      set('users', list);
    },
    delete: (id) => set('users', get('users').filter(u => u.id !== id)),
    getCouples: () => get('users').filter(u => u.role === 'couple'),
    getVendorUsers: () => get('users').filter(u => u.role === 'vendor'),
  };

  // ── SYSTEM SETTINGS ────────────────────────────────────────────────────────
  const Settings = {
    get: () => getObj('systemSettings'),
    save: (settings) => setObj('systemSettings', { ...Settings.get(), ...settings }),
  };

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  init();

  return { Weddings, Guests, RSVPs, Agenda, Tables, Gallery, Budget, Checklist, Vendors, MyVendors, Users, Settings, generateId };

})();

// Make globally available
window.Store = Store;

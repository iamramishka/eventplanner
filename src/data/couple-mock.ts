import {
  AgendaItemRecord,
  BudgetItemRecord,
  ChecklistItemRecord,
  CoupleMusicTrack,
  CoupleSubscriptionSnapshot,
  GuestRecord,
  GuestRsvpHistoryRecord,
  InvitationWorkspaceState,
  WeddingSettingsRecord,
  WeddingTableAssignmentRecord,
  WeddingTableRecord,
  WeddingVendorRecord,
} from "@/types/couple";

export const coupleSupportEmail = "support@vinyup.com";

export const musicTracks: CoupleMusicTrack[] = [
  { id: "strings-at-dawn", label: "Strings At Dawn", mood: "Soft orchestral" },
  { id: "garden-vows", label: "Garden Vows", mood: "Light piano" },
  { id: "midnight-toast", label: "Midnight Toast", mood: "Elegant lounge" },
];

export const defaultWeddingSettings = (weddingSlug: string): WeddingSettingsRecord => ({
  weddingSlug,
  partnerOneName: "",
  partnerTwoName: "",
  weddingTitle: "Our Wedding Celebration",
  eventDate: "",
  dateTbd: false,
  venueName: "",
  venueTbd: false,
  venueMapLink: "",
  introMessage:
    "We’re so happy to celebrate with the people who matter most to us.",
  timezone: "Asia/Colombo",
  contactPhone: "",
  rsvpDeadline: "",
  estimatedGuests: "",
  estimatedBudget: "",
});

export const defaultInvitationWorkspace = (): InvitationWorkspaceState => ({
  sections: [
    {
      key: "hero",
      label: "Hero",
      title: "Together with our families",
      body: "Join us as we celebrate our wedding day.",
    },
    {
      key: "story",
      label: "Story",
      title: "Our Story",
      body: "A few words about your journey together.",
    },
    {
      key: "event-details",
      label: "Event details",
      title: "Wedding Day Details",
      body: "Share ceremony time, reception notes, and venue details.",
    },
    {
      key: "rsvp",
      label: "RSVP",
      title: "Please RSVP",
      body: "Let us know whether you can celebrate with us.",
    },
    {
      key: "special-note",
      label: "Special note",
      title: "A Note To Our Guests",
      body: "Share dress code, family notes, or anything meaningful.",
    },
  ],
  visibility: [
    {
      key: "loading",
      label: "Loading Screen",
      description: "Show a soft loading intro before the invitation opens.",
      enabled: true,
    },
    {
      key: "envelope",
      label: "Envelope Cover",
      description: "Display an opening envelope animation for the invitation.",
      enabled: true,
    },
    {
      key: "countdown",
      label: "Countdown",
      description: "Display the countdown to your wedding day.",
      enabled: true,
    },
    {
      key: "agenda",
      label: "Agenda",
      description: "Show your event timeline on the invitation.",
      enabled: true,
    },
    {
      key: "rsvp",
      label: "RSVP",
      description: "Allow guests to update their RSVP from the invitation.",
      enabled: true,
    },
    {
      key: "gallery",
      label: "Gallery",
      description: "Display your wedding gallery and story images.",
      enabled: true,
    },
    {
      key: "table-finder",
      label: "Table Finder",
      description: "Help guests find their table once assignments are ready.",
      enabled: false,
    },
    {
      key: "guest-preview",
      label: "Guest Preview",
      description: "Show a guest-specific greeting on the invitation.",
      enabled: true,
    },
    {
      key: "story",
      label: "Story Section",
      description: "Display your story section on the invitation.",
      enabled: true,
    },
    {
      key: "music",
      label: "Music",
      description: "Play optional background music after the invitation opens.",
      enabled: false,
    },
    {
      key: "special-message",
      label: "Special Message",
      description: "Show your custom note to guests.",
      enabled: true,
    },
    {
      key: "venue-map",
      label: "Venue Map",
      description: "Display a quick venue map shortcut.",
      enabled: true,
    },
  ],
  theme: {
    preset: "blush-bloom",
    primaryColor: "#C45A74",
    secondaryColor: "#D8B48A",
    accentColor: "#8FA98F",
    surfaceColor: "#FFFDFC",
  },
  gallery: [],
  music: {
    enabled: false,
    mutedByDefault: true,
    trackId: musicTracks[0]?.id ?? "strings-at-dawn",
  },
  publishState: {
    hasUnpublishedChanges: false,
  },
});

export const defaultChecklistItems = (
  weddingSlug: string,
): ChecklistItemRecord[] => [
  {
    id: `${weddingSlug}-task-1`,
    weddingSlug,
    group: "3 months before",
    title: "Finalize wedding guest list",
    description: "Create the first working guest list with bride and groom side tags.",
    dueDate: "",
    priority: "High",
    isCompleted: false,
  },
  {
    id: `${weddingSlug}-task-2`,
    weddingSlug,
    group: "2 months before",
    title: "Review invitation content",
    description: "Set your invitation message, venue details, and RSVP notes.",
    dueDate: "",
    priority: "Medium",
    isCompleted: false,
  },
  {
    id: `${weddingSlug}-task-3`,
    weddingSlug,
    group: "1 month before",
    title: "Confirm vendor bookings",
    description: "Track which vendors are booked and what is still pending.",
    dueDate: "",
    priority: "Medium",
    isCompleted: false,
  },
];

export const defaultSubscriptionSnapshot = (
  status: CoupleSubscriptionSnapshot["status"] = "trial",
): CoupleSubscriptionSnapshot => ({
  planName: status === "active" ? "Premium" : "Free Trial",
  status,
  renewalLabel:
    status === "active"
      ? "Premium wedding plan active"
      : status === "expired"
        ? "Trial expired"
        : "3 days left in trial",
  remainingDays: status === "active" ? 999 : status === "expired" ? 0 : 3,
  imageLimit: status === "active" ? 24 : 8,
  features:
    status === "active"
      ? ["Unlimited editing", "Expanded gallery", "Table finder", "Premium themes"]
      : ["Guest management", "RSVP tracking", "Basic invitation editing"],
});

export const seededAmayaSettings: WeddingSettingsRecord = {
  weddingSlug: "amaya-kavin",
  partnerOneName: "Amaya",
  partnerTwoName: "Kavin",
  weddingTitle: "Amaya & Kavin",
  eventDate: "2026-12-12",
  dateTbd: false,
  venueName: "The Kingsbury, Colombo",
  venueTbd: false,
  venueMapLink: "https://maps.google.com/?q=The+Kingsbury+Colombo",
  introMessage:
    "We would be honored to celebrate our wedding day with the people we love most.",
  timezone: "Asia/Colombo",
  contactPhone: "+94 77 555 1010",
  rsvpDeadline: "2026-11-25",
  estimatedGuests: "220",
  estimatedBudget: "950000",
};

export const seededAmayaGuests: GuestRecord[] = [
  {
    id: "guest-1",
    weddingSlug: "amaya-kavin",
    name: "Rivini Perera",
    side: "Bride",
    whatsappCountryCode: "+94",
    whatsappNumber: "771112233",
    email: "rivini@example.com",
    invitationType: "Individual",
    maxAllowedMembers: 1,
    notes: "Close family friend",
    inviteToken: "INV-RIV-001",
    lastInviteSentAt: "2026-01-05T10:00:00.000Z",
    createdAt: "2026-01-02T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "guest-2",
    weddingSlug: "amaya-kavin",
    name: "Nadeesha Family",
    side: "Groom",
    whatsappCountryCode: "+94",
    whatsappNumber: "772224455",
    email: "",
    invitationType: "Family",
    maxAllowedMembers: 4,
    notes: "Family invitation",
    inviteToken: "INV-NAD-002",
    lastInviteSentAt: "2026-01-06T08:30:00.000Z",
    createdAt: "2026-01-02T09:20:00.000Z",
    updatedAt: "2026-01-09T11:10:00.000Z",
  },
  {
    id: "guest-3",
    weddingSlug: "amaya-kavin",
    name: "Pasindu Silva",
    side: "Bride",
    whatsappCountryCode: "+94",
    whatsappNumber: "773337788",
    email: "pasindu@example.com",
    invitationType: "Individual",
    maxAllowedMembers: 1,
    notes: "",
    inviteToken: "INV-PAS-003",
    lastInviteSentAt: "2026-01-05T11:20:00.000Z",
    createdAt: "2026-01-03T07:40:00.000Z",
    updatedAt: "2026-01-12T13:00:00.000Z",
  },
];

export const seededAmayaRsvpHistory: GuestRsvpHistoryRecord[] = [
  {
    id: "rsvp-1",
    weddingSlug: "amaya-kavin",
    guestId: "guest-1",
    status: "confirmed",
    attendingCount: 1,
    mealPreference: "Vegetarian",
    liquorPreference: "No",
    specialNote: "Please reserve a quiet table seat.",
    submittedAt: "2026-01-10T12:00:00.000Z",
    source: "guest",
  },
  {
    id: "rsvp-2",
    weddingSlug: "amaya-kavin",
    guestId: "guest-2",
    status: "confirmed",
    attendingCount: 3,
    mealPreference: "Standard",
    liquorPreference: "Yes",
    specialNote: "",
    submittedAt: "2026-01-12T08:45:00.000Z",
    source: "guest",
  },
  {
    id: "rsvp-3",
    weddingSlug: "amaya-kavin",
    guestId: "guest-2",
    status: "confirmed",
    attendingCount: 4,
    mealPreference: "Standard",
    liquorPreference: "Yes",
    specialNote: "One child needs a high chair.",
    submittedAt: "2026-01-15T06:15:00.000Z",
    source: "guest",
  },
  {
    id: "rsvp-4",
    weddingSlug: "amaya-kavin",
    guestId: "guest-3",
    status: "pending",
    attendingCount: 0,
    mealPreference: "Standard",
    liquorPreference: "Undecided",
    specialNote: "",
    submittedAt: "2026-01-08T06:15:00.000Z",
    source: "guest",
  },
];

export const seededAmayaInvitation: InvitationWorkspaceState = {
  ...defaultInvitationWorkspace(),
  gallery: [
    {
      id: "gallery-1",
      weddingSlug: "amaya-kavin",
      name: "Engagement portrait",
      imageType: "hero",
      imageUrl: "/templates/blush-bloom.svg",
      isCover: true,
      sortOrder: 0,
      createdAt: "2026-01-02T10:00:00.000Z",
    },
    {
      id: "gallery-2",
      weddingSlug: "amaya-kavin",
      name: "Garden moment",
      imageType: "gallery",
      imageUrl: "/templates/sage-garden.svg",
      isCover: false,
      sortOrder: 1,
      createdAt: "2026-01-02T10:05:00.000Z",
    },
  ],
  music: {
    enabled: true,
    mutedByDefault: true,
    trackId: "garden-vows",
  },
  publishState: {
    hasUnpublishedChanges: false,
    lastDraftSavedAt: "2026-01-18T11:20:00.000Z",
    lastPublishedAt: "2026-01-19T08:10:00.000Z",
  },
};

export const seededAmayaAgenda: AgendaItemRecord[] = [
  {
    id: "agenda-1",
    weddingSlug: "amaya-kavin",
    title: "Registration",
    eventTime: "10:00",
    durationMinutes: 30,
    description: "Guest arrival and registration",
    iconKey: "sparkles",
    sortOrder: 0,
  },
  {
    id: "agenda-2",
    weddingSlug: "amaya-kavin",
    title: "Ceremony",
    eventTime: "10:30",
    durationMinutes: 60,
    description: "Main ceremony",
    iconKey: "rings",
    sortOrder: 1,
  },
  {
    id: "agenda-3",
    weddingSlug: "amaya-kavin",
    title: "Reception Lunch",
    eventTime: "12:00",
    durationMinutes: 120,
    description: "Lunch and celebrations",
    iconKey: "glass",
    sortOrder: 2,
  },
];

export const seededAmayaTables: WeddingTableRecord[] = [
  {
    id: "table-1",
    weddingSlug: "amaya-kavin",
    tableName: "Table 1",
    capacity: 8,
    sortOrder: 0,
  },
  {
    id: "table-2",
    weddingSlug: "amaya-kavin",
    tableName: "Table 2",
    capacity: 6,
    sortOrder: 1,
  },
];

export const seededAmayaTableAssignments: WeddingTableAssignmentRecord[] = [
  {
    id: "assign-1",
    weddingSlug: "amaya-kavin",
    tableId: "table-1",
    guestId: "guest-1",
    assignedCount: 1,
  },
  {
    id: "assign-2",
    weddingSlug: "amaya-kavin",
    tableId: "table-2",
    guestId: "guest-2",
    assignedCount: 4,
  },
];

export const seededAmayaBudget: BudgetItemRecord[] = [
  {
    id: "budget-1",
    weddingSlug: "amaya-kavin",
    category: "Venue",
    title: "Reception ballroom",
    estimatedAmount: 300000,
    actualAmount: 320000,
    paidAmount: 150000,
    note: "Deposit already paid",
    dueDate: "2026-01-30",
    status: "booked",
  },
  {
    id: "budget-2",
    weddingSlug: "amaya-kavin",
    category: "Photography",
    title: "Photo + video package",
    estimatedAmount: 160000,
    actualAmount: 150000,
    paidAmount: 150000,
    note: "Paid in full",
    dueDate: "2026-01-12",
    status: "paid",
  },
];

export const seededAmayaChecklist: ChecklistItemRecord[] = [
  ...defaultChecklistItems("amaya-kavin"),
  {
    id: "amaya-kavin-task-4",
    weddingSlug: "amaya-kavin",
    group: "1 week before",
    title: "Finalize seating table print",
    description: "Confirm guest assignments before sharing table finder.",
    dueDate: "2026-02-07",
    priority: "High",
    isCompleted: false,
  },
];

export const seededAmayaVendors: WeddingVendorRecord[] = [
  {
    id: "vendor-link-1",
    weddingSlug: "amaya-kavin",
    name: "Sena Studio",
    category: "Photography",
    phone: "011 222 1111",
    whatsapp: "+94 77 123 1212",
    email: "hello@senastudio.lk",
    note: "Booked for full day coverage.",
    status: "Booked",
    linkedBudgetItemId: "budget-2",
  },
  {
    id: "vendor-link-2",
    weddingSlug: "amaya-kavin",
    name: "Royal Banquets",
    category: "Venue",
    phone: "031 456 7788",
    whatsapp: "+94 76 455 7788",
    email: "events@royalbanquets.lk",
    note: "Need final guest count by RSVP deadline.",
    status: "Booked",
    linkedBudgetItemId: "budget-1",
  },
];

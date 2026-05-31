export type CoupleWorkspaceContext = {
  userId: string;
  fullName: string;
  weddingSlug: string;
};

export type WeddingSettingsRecord = {
  weddingSlug: string;
  partnerOneName: string;
  partnerTwoName: string;
  weddingTitle: string;
  eventDate: string;
  dateTbd: boolean;
  venueName: string;
  venueTbd: boolean;
  venueMapLink: string;
  introMessage: string;
  timezone: string;
  contactPhone: string;
  rsvpDeadline: string;
  estimatedGuests: string;
  estimatedBudget: string;
};

export type CoupleSubscriptionSnapshot = {
  planName: string;
  status: "trial" | "active" | "expired";
  renewalLabel: string;
  remainingDays: number;
  imageLimit: number;
  features: string[];
};

export type GuestSide = "Bride" | "Groom";
export type InvitationType = "Individual" | "Family";

export type GuestRecord = {
  id: string;
  weddingSlug: string;
  name: string;
  side: GuestSide;
  whatsappCountryCode: string;
  whatsappNumber: string;
  email: string;
  invitationType: InvitationType;
  maxAllowedMembers: number;
  notes: string;
  inviteToken: string;
  lastInviteSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type GuestRsvpStatus = "pending" | "confirmed" | "declined";
export type MealPreference = "Standard" | "Vegetarian" | "Vegan" | "Halal";
export type LiquorPreference = "Yes" | "No" | "Undecided";

export type GuestRsvpHistoryRecord = {
  id: string;
  weddingSlug: string;
  guestId: string;
  status: GuestRsvpStatus;
  attendingCount: number;
  mealPreference: MealPreference;
  liquorPreference: LiquorPreference;
  specialNote: string;
  submittedAt: string;
  source: "guest" | "couple";
};

export type GuestRsvpCurrent = {
  guestId: string;
  guestName: string;
  side: GuestSide;
  status: GuestRsvpStatus;
  attendingCount: number;
  mealPreference: MealPreference;
  liquorPreference: LiquorPreference;
  specialNote: string;
  submittedAt?: string;
  maxAllowedMembers: number;
  inviteSentAt?: string;
};

export type InvitationContentSection = {
  key:
    | "hero"
    | "story"
    | "event-details"
    | "rsvp"
    | "special-note";
  label: string;
  title: string;
  body: string;
};

export type InvitationSectionSetting = {
  key:
    | "loading"
    | "envelope"
    | "countdown"
    | "agenda"
    | "rsvp"
    | "gallery"
    | "table-finder"
    | "guest-preview"
    | "story"
    | "music"
    | "special-message"
    | "venue-map";
  label: string;
  description: string;
  enabled: boolean;
};

export type InvitationThemeSettings = {
  preset: "classic-gold" | "blush-bloom" | "sage-garden" | "lavender-evening";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
};

export type GalleryAsset = {
  id: string;
  weddingSlug: string;
  name: string;
  imageType: "hero" | "story" | "gallery";
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
};

export type MusicSettingsRecord = {
  enabled: boolean;
  mutedByDefault: boolean;
  trackId: string;
};

export type InvitationPublishState = {
  hasUnpublishedChanges: boolean;
  lastDraftSavedAt?: string;
  lastPublishedAt?: string;
};

export type InvitationWorkspaceState = {
  sections: InvitationContentSection[];
  visibility: InvitationSectionSetting[];
  theme: InvitationThemeSettings;
  gallery: GalleryAsset[];
  music: MusicSettingsRecord;
  publishState: InvitationPublishState;
};

export type AgendaItemRecord = {
  id: string;
  weddingSlug: string;
  title: string;
  eventTime: string;
  durationMinutes: number;
  description: string;
  iconKey: string;
  sortOrder: number;
};

export type WeddingTableRecord = {
  id: string;
  weddingSlug: string;
  tableName: string;
  capacity: number;
  sortOrder: number;
};

export type WeddingTableAssignmentRecord = {
  id: string;
  weddingSlug: string;
  tableId: string;
  guestId: string;
  assignedCount: number;
};

export type BudgetCategory =
  | "Venue"
  | "Catering"
  | "Photography"
  | "Videography"
  | "Decor"
  | "Dress"
  | "Makeup"
  | "Cake"
  | "Jewelry"
  | "Music"
  | "Transport"
  | "Liquor"
  | "Gifts"
  | "Other";

export type BudgetItemRecord = {
  id: string;
  weddingSlug: string;
  category: BudgetCategory;
  title: string;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  note: string;
  dueDate?: string;
  status: "planned" | "booked" | "paid";
};

export type ChecklistItemRecord = {
  id: string;
  weddingSlug: string;
  group: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: "Low" | "Medium" | "High";
  isCompleted: boolean;
};

export type WeddingVendorRecord = {
  id: string;
  weddingSlug: string;
  name: string;
  category: string;
  phone: string;
  whatsapp: string;
  email: string;
  note: string;
  status: "Shortlisted" | "Contacted" | "Booked";
  linkedBudgetItemId?: string;
};

export type CoupleOverviewData = {
  guestCount: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  attendingHeadcount: number;
  budgetEstimated: number;
  budgetActual: number;
  budgetPaid: number;
  checklistCompleted: number;
  checklistTotal: number;
  tableCount: number;
  countdownLabel: string;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
};

export type CoupleAccountSettings = {
  fullName: string;
  email: string;
  plan: CoupleSubscriptionSnapshot;
  supportEmail: string;
};

export type CoupleMusicTrack = {
  id: string;
  label: string;
  mood: string;
};

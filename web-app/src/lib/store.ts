/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/store.ts
// Server-side in-memory mock database

import { randomBytes } from 'crypto';

type Wedding = any;
type Guest = any;
type RSVP = any;
type Vendor = any;
type ChecklistItem = any;
type BudgetItem = any;
type Table = any;
type AgendaEvent = any;
type GalleryImage = any;

export const BUDGET_CATEGORIES = ['Venue', 'Catering', 'Photography', 'Decor', 'Attire', 'Entertainment', 'Other'] as const;
export const BUDGET_STATUSES = ['planned', 'reserved', 'paid'] as const;

type BudgetStatus = typeof BUDGET_STATUSES[number];

const CHECKLIST_GROUPS = ['4 months before', '3 months before', '2 months before', '1 month before', '2 weeks before', '1 week before', 'Day before', 'Wedding Day', 'After Wedding'];

export const CHECKLIST_STARTER_TEMPLATES = [
  {
    id: 'four-months-before',
    name: '4 Months Before',
    description: 'Lock the big decisions, book the main vendors, and start choosing outfits.',
    tasks: [
      // Main Planning
      { group: '4 months before', title: 'Main Planning · Decide the wedding / engagement date', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Decide the budget', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Decide the guest count', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Choose the type of function', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: 'Example: home function, hotel, hall, outdoor, church / temple / kovil / mosque.' },
      { group: '4 months before', title: 'Main Planning · Book the venue', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Book the photographer / videographer', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Book the bridal dresser / makeup artist', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Book the decorator / florist', priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Book the catering service', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Book the DJ / band / music group', priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Main Planning · Decide the wedding theme and colors', priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      // Legal / Religious
      { group: '4 months before', title: 'Legal & Religious · Check marriage registration requirements', priority: 'high', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Legal & Religious · Meet the religious leader if needed', priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: 'Example: priest, monk, kovil priest, moulavi.' },
      { group: '4 months before', title: 'Legal & Religious · Decide the time for religious / customary activities', priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      // Clothes
      { group: '4 months before', title: "Clothes · Select Bride's saree / gown", priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: "Clothes · Select Groom's suit / national dress", priority: 'medium', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: "Clothes · Select Bridesmaids' dresses", priority: 'low', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: "Clothes · Select Groomsmen's outfits", priority: 'low', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
      { group: '4 months before', title: 'Clothes · Select Flower girl / page boy outfits', priority: 'low', dueOffsetDays: -120, reminderOffsetDays: -125, description: '' },
    ],
  },
  {
    id: 'three-months-before',
    name: '3 Months Before',
    description: 'Guest list, invitations, vendor packages, jewelry, and day-of roles.',
    tasks: [
      // Guest & Invitation
      { group: '3 months before', title: 'Guest & Invitation · Prepare final guest list', priority: 'high', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Guest & Invitation · Collect guest names and phone numbers', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Guest & Invitation · Design invitation card', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Guest & Invitation · Decide printed card or digital invitation', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Guest & Invitation · Start printing invitation cards', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      // Vendors
      { group: '3 months before', title: 'Vendors · Confirm photographer package', priority: 'high', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Confirm bridal dressing package', priority: 'high', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Confirm decoration design', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Confirm menu with caterer', priority: 'high', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Confirm music / DJ playlist style', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Book wedding car / vehicle', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Vendors · Book hotel rooms if needed for family or couple', priority: 'low', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      // Jewelry & Gifts
      { group: '3 months before', title: 'Jewelry & Gifts · Buy or order wedding rings', priority: 'high', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Jewelry & Gifts · Buy or order engagement rings', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: "Jewelry & Gifts · Buy or order bride's jewelry", priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Jewelry & Gifts · Buy gifts for parents or relatives if needed', priority: 'low', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      // Planning
      { group: '3 months before', title: 'Planning · Make the full event schedule', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Planning · Decide who will welcome guests', priority: 'low', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Planning · Decide who will handle gifts, money envelopes, and guest book', priority: 'low', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
      { group: '3 months before', title: 'Planning · Decide who will coordinate vendors on the day', priority: 'medium', dueOffsetDays: -90, reminderOffsetDays: -95, description: '' },
    ],
  },
  {
    id: 'two-months-before',
    name: '2 Months Before',
    description: 'Fittings and beauty prep, function details, song picks, and documents.',
    tasks: [
      // Clothes & Beauty
      { group: '2 months before', title: 'Clothes & Beauty · Do first fitting for bride and groom outfits', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Clothes & Beauty · Finalize bridesmaids and groomsmen outfits', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Clothes & Beauty · Choose shoes and accessories', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Clothes & Beauty · Start skin care / hair care routine', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Clothes & Beauty · Book salon appointments', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      // Function Details
      { group: '2 months before', title: 'Function Details · Finalize stage design / poruwa design', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Function Details · Finalize entrance design', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Function Details · Finalize table decorations', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Function Details · Finalize cake structure', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Function Details · Finalize lighting', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Function Details · Finalize sound system', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      // Songs
      { group: '2 months before', title: 'Songs · Select song for couple entrance', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Songs · Select song for poruwa / ceremony', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Songs · Select song for first dance', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Songs · Select song for cake cutting', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Songs · Select song for going away', priority: 'low', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      // Documents
      { group: '2 months before', title: 'Documents · Prepare documents for marriage registration', priority: 'high', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Documents · Confirm marriage registrar', priority: 'high', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Documents · Confirm witnesses', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      // Invitation
      { group: '2 months before', title: 'Invitation · Start giving invitation cards', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
      { group: '2 months before', title: 'Invitation · Send digital invitations to distant guests', priority: 'medium', dueOffsetDays: -60, reminderOffsetDays: -65, description: '' },
    ],
  },
  {
    id: 'one-month-before',
    name: '1 Month Before',
    description: 'Re-confirm everything, finalize bride & groom prep, and ceremony items.',
    tasks: [
      // Final Confirmations
      { group: '1 month before', title: 'Final Confirmations · Confirm venue booking again', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm photographer', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm videographer', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm bridal dresser', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm decorator', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm caterer', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm music / DJ', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm cake supplier', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm vehicle provider', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm guest count roughly', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm food menu and drinks', priority: 'high', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Final Confirmations · Confirm seating arrangement plan', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      // Bride & Groom
      { group: '1 month before', title: 'Bride & Groom · Final outfit fitting', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Bride & Groom · Finalize jewelry and accessories', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Bride & Groom · Buy perfume, shoes, hair accessories, etc.', priority: 'low', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Bride & Groom · Groom haircut plan', priority: 'low', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Bride & Groom · Bride makeup trial if needed', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      // Ceremony
      { group: '1 month before', title: 'Ceremony · Finalize poruwa / religious ceremony items', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Ceremony · Prepare oil lamp, betel leaves, flowers, trays, candles, etc.', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Ceremony · Confirm master of ceremony / announcer', priority: 'medium', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
      { group: '1 month before', title: 'Ceremony · Prepare speeches if needed', priority: 'low', dueOffsetDays: -30, reminderOffsetDays: -35, description: '' },
    ],
  },
  {
    id: 'two-weeks-before',
    name: '2 Weeks Before',
    description: 'Final guest count, payments, collect items, emergency kit, and rehearsal.',
    tasks: [
      // Guest Count
      { group: '2 weeks before', title: 'Guest Count · Confirm attendance from guests', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Guest Count · Give final guest count to hotel / caterer', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Guest Count · Finalize seating chart', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Guest Count · Prepare table numbers or name tags if needed', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      // Payments
      { group: '2 weeks before', title: 'Payments · Pay vendor advances or balances if required', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Payments · Keep receipts and contact numbers together', priority: 'medium', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Payments · Prepare emergency cash', priority: 'medium', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      // Final Items
      { group: '2 weeks before', title: 'Final Items · Collect rings', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Final Items · Collect outfits', priority: 'high', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Final Items · Check shoes and accessories', priority: 'medium', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Safety pins', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Hair pins', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Tissue', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Makeup touch-up items', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Medicine', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Plasters', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Needle and thread', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Phone charger', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Emergency Kit · Water bottle', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      // Rehearsal
      { group: '2 weeks before', title: 'Rehearsal · Practice walking entrance', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Rehearsal · Practice poruwa steps', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Rehearsal · Practice ring exchange', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Rehearsal · Practice first dance', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
      { group: '2 weeks before', title: 'Rehearsal · Practice cake cutting', priority: 'low', dueOffsetDays: -14, reminderOffsetDays: -18, description: '' },
    ],
  },
  {
    id: 'one-week-before',
    name: '1 Week Before',
    description: 'Final vendor calls, schedules, and personal preparation.',
    tasks: [
      // Final Check
      { group: '1 week before', title: 'Final Check · Call all vendors and confirm arrival times', priority: 'high', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Final Check · Share location pins with vendors', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Final Check · Give full schedule to photographer, decorator, and MC', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Final Check · Confirm vehicle timing', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Final Check · Confirm bride and groom dressing time', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Final Check · Confirm hotel check-in if needed', priority: 'low', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      // Personal Preparation
      { group: '1 week before', title: 'Personal Prep · Bride: final facial / waxing / nails / hair treatment', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Personal Prep · Groom: haircut, shave, grooming', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Personal Prep · Sleep well and avoid last-minute stress', priority: 'low', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
      { group: '1 week before', title: 'Personal Prep · Pack bags if going to hotel or honeymoon', priority: 'medium', dueOffsetDays: -7, reminderOffsetDays: -9, description: '' },
    ],
  },
  {
    id: 'day-before',
    name: 'Day Before',
    description: 'Get everything ready the night before so the morning is calm.',
    tasks: [
      { group: 'Day before', title: 'Keep all outfits ready', priority: 'high', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
      { group: 'Day before', title: 'Keep jewelry and rings safely', priority: 'high', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
      { group: 'Day before', title: 'Keep documents ready', priority: 'high', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
      { group: 'Day before', title: 'Keep payment envelopes ready', priority: 'high', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
      { group: 'Day before', title: 'Charge phones and power banks', priority: 'medium', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
      { group: 'Day before', title: 'Assign one trusted person to manage calls and problems on the day', priority: 'medium', dueOffsetDays: -1, reminderOffsetDays: -2, description: '' },
    ],
  },
  {
    id: 'final-day-checklist',
    name: 'Final Day Checklist',
    description: 'The simple list of everything to have in hand on the wedding day.',
    tasks: [
      { group: 'Wedding Day', title: 'Bring · Rings', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Bride and groom outfits', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Jewelry', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Shoes', priority: 'medium', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Marriage documents', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · ID cards', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Payment envelopes', priority: 'high', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Phone chargers', priority: 'low', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Emergency kit', priority: 'medium', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Flower bouquet', priority: 'medium', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Vehicle keys', priority: 'medium', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Contact list of vendors', priority: 'medium', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
      { group: 'Wedding Day', title: 'Bring · Food and water for bride and groom', priority: 'low', dueOffsetDays: 0, reminderOffsetDays: -1, description: '' },
    ],
  },
];

function generateGuestToken() {
  return `rsvp_${randomBytes(18).toString('base64url')}`;
}

function addDays(dateStr: string, days: number) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function normalizeChecklistState(item: ChecklistItem) {
  if (item.isCompleted) return 'completed';
  if (!item.dueDate) return item.state || 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${item.dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due-soon';
  return item.state || 'pending';
}

function sortChecklist(a: ChecklistItem, b: ChecklistItem) {
  const groupA = CHECKLIST_GROUPS.indexOf(a.group);
  const groupB = CHECKLIST_GROUPS.indexOf(b.group);
  if (groupA !== groupB) return (groupA === -1 ? 999 : groupA) - (groupB === -1 ? 999 : groupB);
  if ((a.dueDate || '') !== (b.dueDate || '')) return String(a.dueDate || '').localeCompare(String(b.dueDate || ''));
  return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
}

const defaultInvitationContent = {
  intro: 'You are warmly invited to celebrate with us.',
  messageMarkdown: `### A joyful day\n\nWe are thrilled to share our wedding day with the people we love most.\n\nPlease join us for an evening of family, music, and celebration.`,
  detailsMarkdown: `### Event details\n\n- **Date:** {date}\n- **Time:** {time}\n- **Venue:** {venue}\n\nPlease arrive a little early so you can settle in before the ceremony begins.`,
  closingMarkdown: `### With gratitude\n\nThank you for being part of our story. Your presence means the world to us.`,
};

type StoreShape = {
  weddings: Wedding[];
  guests: Guest[];
  rsvps: RSVP[];
  vendors: Vendor[];
  checklist: ChecklistItem[];
  budget: BudgetItem[];
  tables: Table[];
  agenda: AgendaEvent[];
  galleryImages: GalleryImage[];
};

const globalStore = globalThis as typeof globalThis & { __wedInviteStore?: StoreShape };

const store = globalStore.__wedInviteStore ||= {
  weddings: [],
  guests: [],
  rsvps: [],
  vendors: [],
  checklist: [],
  budget: [],
  tables: [],
  agenda: [],
  galleryImages: [],
};

// Seed initial data
export function initStore() {
  if (store.weddings.length > 0) return;

  // Same seed data as previous Vanilla version
  store.weddings.push({
    id: 'w_1',
    userId: 'u_couple_1',
    groomName: 'Kasun',
    brideName: 'Priya',
    weddingTitle: 'Priya & Kasun',
    date: '2026-08-15',
    time: '16:00',
    timezone: 'Asia/Colombo',
    venueName: 'Galle Face Hotel, Colombo',
    venueAddress: '2 Galle Rd, Colombo 00300, Sri Lanka',
    venueMapLink: 'https://maps.google.com/?q=Galle+Face+Hotel',
    rsvpDeadline: '2026-07-15',
    contactEmail: 'hello@priyakasun.com',
    contactWhatsApp: '+94771234567',
    slug: 'priya-and-kasun',
    story: 'We met at a coffee shop in Colombo...',
    theme: {
      primaryColor: '#C45A74',
      secondaryColor: '#C9A574',
      accentColor: '#8FA98F',
      surfaceColor: '#FCF8F6',
      fontStyle: 'Elegant Serif'
    },
    sections: {
      loadingScreen: true,
      envelope: true,
      countdown: true,
      agenda: true,
      rsvp: true,
      gallery: true,
      tableFinder: true,
      guestPreview: false,
      story: true,
      music: true,
      specialMessage: true,
      venueMap: true
    },
    music: {
      enabled: true,
      track: 'A Thousand Years',
      muteDefault: true
    },
    invitationContent: { ...defaultInvitationContent },
    createdAt: new Date().toISOString()
  });

  store.guests.push(
    { id: 'g_1', weddingId: 'w_1', name: 'Nimal Perera', side: 'Groom', whatsapp: '+94770000001', type: 'Individual', maxMembers: 1, rsvpStatus: 'Pending', token: 'token_g1' },
    { id: 'g_2', weddingId: 'w_1', name: 'Fernando Family', side: 'Bride', whatsapp: '+94770000002', type: 'Family', maxMembers: 4, rsvpStatus: 'Confirmed', token: 'token_g2' }
  );

  store.rsvps.push(
    { id: 'r_1', weddingId: 'w_1', guestId: 'g_2', attending: true, memberCount: 3, mealPreference: 'Non-Veg', liquorPreference: 'Yes', notes: 'No seafood please', updatedAt: new Date().toISOString() }
  );

  store.agenda.push(
    { id: 'a_1', weddingId: 'w_1', icon: 'Ring', title: 'Poruwa Ceremony', startTime: '16:00', endTime: '17:00', time: '16:00', duration: 60, timezone: 'Asia/Colombo', location: 'Main garden', description: 'Traditional Sri Lankan Poruwa ceremony.', sortOrder: 0 },
    { id: 'a_2', weddingId: 'w_1', icon: 'GlassWater', title: 'Reception & Toasts', startTime: '18:30', endTime: '20:00', time: '18:30', duration: 90, timezone: 'Asia/Colombo', location: 'Ballroom', description: 'Join us for drinks and dinner.', sortOrder: 1 }
  );

  store.budget.push(
    { id: 'b_1', weddingId: 'w_1', category: 'Venue', name: 'Galle Face Hotel ballroom deposit', estimated: 150000, actual: 125000, status: 'paid', notes: 'Initial venue deposit paid.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b_2', weddingId: 'w_1', category: 'Catering', name: 'Dinner service reservation', estimated: 75000, actual: 25000, status: 'reserved', notes: 'Advance reserved for menu tasting.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b_3', weddingId: 'w_1', category: 'Decor', name: 'Floral and stage styling', estimated: 25000, actual: 0, status: 'planned', notes: 'Finalize after theme approval.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  );

  store.checklist.push(
    { id: 'cl_1', weddingId: 'w_1', group: '4 months before', title: 'Book wedding photographer', description: 'Confirm coverage hours, deposit, and delivery timeline.', state: 'completed', isCompleted: true, priority: 'high', dueDate: '2026-04-20', reminderAt: '2026-04-15T09:00', templateId: 'seed', createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-04-20T08:00:00.000Z' },
    { id: 'cl_2', weddingId: 'w_1', group: '3 months before', title: 'Finalize wedding invitations', description: 'Review invitation copy, design, and RSVP settings.', state: 'completed', isCompleted: true, priority: 'high', dueDate: '2026-05-10', reminderAt: '2026-05-05T09:00', templateId: 'seed', createdAt: '2026-04-05T08:00:00.000Z', updatedAt: '2026-05-10T08:00:00.000Z' },
    { id: 'cl_3', weddingId: 'w_1', group: '2 months before', title: 'Confirm menu with caterer', description: 'Collect dietary notes and approve the final menu.', state: 'pending', isCompleted: false, priority: 'high', dueDate: '2026-06-15', reminderAt: '2026-06-08T09:00', templateId: 'seed', createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
    { id: 'cl_4', weddingId: 'w_1', group: '1 month before', title: 'Send invitations to guests', description: 'Share RSVP links with all invited guests.', state: 'pending', isCompleted: false, priority: 'medium', dueDate: '2026-07-01', reminderAt: '2026-06-25T09:00', templateId: 'seed', createdAt: '2026-05-01T08:05:00.000Z', updatedAt: '2026-05-01T08:05:00.000Z' }
  );
}

// Ensure store is initialized when imported
initStore();

export const db = {
  weddings: {
    // Accept an optional predicate to filter weddings; if omitted return all
    findMany: (predicate?: (w: Wedding) => boolean) => predicate ? store.weddings.filter(predicate) : store.weddings.slice(),
    findUnique: (predicate: (w: Wedding) => boolean) => store.weddings.find(predicate) || null,
  },
  guests: {
    findMany: (predicate: (g: Guest) => boolean) => store.guests.filter(predicate),
  },
  rsvps: {
    findMany: (predicate: (r: RSVP) => boolean) => store.rsvps.filter(predicate),
  },
  agenda: {
    findMany: (predicate: (a: AgendaEvent) => boolean) => store.agenda.filter(predicate),
  },
  galleryImages: {
    findMany: (predicate: (image: GalleryImage) => boolean) => store.galleryImages.filter(predicate),
    findUnique: (predicate: (image: GalleryImage) => boolean) => store.galleryImages.find(predicate) || null,
  },
  budget: {
    findMany: (predicate: (item: BudgetItem) => boolean) => store.budget.filter(predicate),
    findUnique: (predicate: (item: BudgetItem) => boolean) => store.budget.find(predicate) || null,
  },
  checklist: {
    findMany: (predicate: (item: ChecklistItem) => boolean) => store.checklist.filter(predicate).map(item => ({ ...item, state: normalizeChecklistState(item) })).sort(sortChecklist),
    findUnique: (predicate: (item: ChecklistItem) => boolean) => store.checklist.find(predicate) || null,
  }
};

// Simple helper to add a wedding into the in-memory store for demo/onboarding
export function addWedding(data: Partial<Wedding> & Record<string, any>) {
  const id = `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  const groom = data?.groomName || '';
  const bride = data?.brideName || '';
  const newWedding: Wedding = {
    id,
    userId: data?.userId || `u_${id}`,
    groomName: groom,
    brideName: bride,
    weddingTitle: data?.weddingTitle || `${bride} & ${groom}`.trim(),
    date: data?.date || '',
    time: data?.time || '',
    timezone: data?.timezone || 'UTC',
    venueName: data?.venueName || '',
    venueAddress: data?.venueAddress || '',
    venueMapLink: data?.venueMapLink || '',
    rsvpDeadline: data?.rsvpDeadline || '',
    contactEmail: data?.contactEmail || '',
    contactWhatsApp: data?.contactWhatsApp || '',
    slug: data?.slug || `${(bride || 'bride').toLowerCase().replace(/\s+/g,'-')}-and-${(groom || 'groom').toLowerCase().replace(/\s+/g,'-')}`,
    story: data?.story || '',
    theme: data?.theme || {},
    sections: data?.sections || {},
    music: data?.music || {},
    invitationContent: data?.invitationContent || { ...defaultInvitationContent },
    profileImage: data?.profileImage || null,
    createdAt: new Date().toISOString(),
    ...data,
  } as Wedding;

  store.weddings.push(newWedding);
  return newWedding;
}

export function updateWedding(id: string, data: Partial<Wedding> & Record<string, any>) {
  const idx = store.weddings.findIndex((w: Wedding) => w.id === id);
  if (idx === -1) return null;
  const updated = { ...store.weddings[idx], ...data } as Wedding;
  store.weddings[idx] = updated;
  return updated;
}

// Guest helpers for CRUD and import/export
export function addGuest(data: Partial<Guest> & Record<string, any>) {
  const id = `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  const newGuest: Guest = {
    id,
    weddingId: data?.weddingId || '',
    name: data?.name || '',
    side: data?.side || 'Guest',
    whatsapp: data?.whatsapp || '',
    type: data?.type || 'Individual',
    maxMembers: typeof data?.maxMembers === 'number' ? data.maxMembers : (data?.type === 'Family' ? 4 : 1),
    rsvpStatus: data?.rsvpStatus || 'Pending',
    token: data?.token || generateGuestToken(),
    notes: data?.notes || '',
    ...data,
  } as Guest;

  // basic capacity validation
  if (newGuest.maxMembers < 1 || newGuest.maxMembers > 20) {
    throw new Error('maxMembers must be between 1 and 20');
  }

  store.guests.push(newGuest);
  return newGuest;
}

export function updateGuest(id: string, data: Partial<Guest> & Record<string, any>) {
  const idx = store.guests.findIndex((g: Guest) => g.id === id);
  if (idx === -1) return null;
  const updated = { ...store.guests[idx], ...data } as Guest;
  if (typeof updated.maxMembers === 'number' && (updated.maxMembers < 1 || updated.maxMembers > 20)) {
    throw new Error('maxMembers must be between 1 and 20');
  }
  store.guests[idx] = updated;
  return updated;
}

export function deleteGuest(id: string) {
  const idx = store.guests.findIndex((g: Guest) => g.id === id);
  if (idx === -1) return null;
  const [removed] = store.guests.splice(idx, 1);
  // CLEANUP SAFEGUARD: Delete any RSVPs associated with this guest
  store.rsvps = store.rsvps.filter((r: RSVP) => r.guestId !== id);
  return removed;
}

export function importGuests(rows: Array<Record<string, any>>) {
  const created: Guest[] = [];
  for (const r of rows) {
    const g = addGuest({
      weddingId: r.weddingId || r.weddingid || r.wedding || '',
      name: r.name || r.Name || '',
      side: r.side || r.Side || 'Guest',
      whatsapp: r.whatsapp || r.Whatsapp || '',
      type: r.type || r.Type || 'Individual',
      maxMembers: r.maxMembers ? Number(r.maxMembers) : (r.type === 'Family' ? 4 : 1),
      notes: r.notes || r.Notes || ''
    });
    created.push(g);
  }
  return created;
}

export function exportGuests(weddingId?: string) {
  const rows = weddingId ? store.guests.filter(g => g.weddingId === weddingId) : store.guests.slice();
  return rows;
}

export function getGuestByToken(token: string) {
  return store.guests.find((g: Guest) => g.token === token) || null;
}

export function findGuestForTableLookup(weddingId: string, name: string, phoneLast4: string) {
  const normalizedName = normalizeLookupName(name);
  const normalizedDigits = String(phoneLast4 || '').replace(/\D/g, '');
  if (!weddingId || !normalizedName || normalizedDigits.length !== 4) return null;

  const matches = store.guests.filter((guest: Guest) => {
    if (guest.weddingId !== weddingId) return false;
    const guestDigits = String(guest.whatsapp || '').replace(/\D/g, '');
    return normalizeLookupName(guest.name) === normalizedName && guestDigits.endsWith(normalizedDigits);
  });

  return matches.length === 1 ? matches[0] : null;
}

function normalizeLookupName(value: string) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function getWeddingForGuest(guest: Guest) {
  return store.weddings.find((w: Wedding) => w.id === guest.weddingId) || null;
}

export function getRsvpByGuestId(guestId: string) {
  return store.rsvps.find((r: RSVP) => r.guestId === guestId) || null;
}

// RSVP helpers
export function addRsvp(data: Partial<RSVP> & Record<string, any>) {
  const id = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  const guest = store.guests.find((g: Guest) => g.id === data.guestId);
  if (!guest) throw new Error('guest not found');
  const memberCount = typeof data?.memberCount === 'number' ? data.memberCount : 1;
  if (memberCount < 0 || memberCount > (guest.maxMembers || 20)) throw new Error('memberCount exceeds guest maxMembers');
  const attending = !!data?.attending;
  const newRsvp: RSVP = {
    id,
    weddingId: data?.weddingId || guest.weddingId,
    guestId: guest.id,
    attending,
    memberCount,
    mealPreference: data?.mealPreference || '',
    liquorPreference: data?.liquorPreference || '',
    notes: data?.notes || '',
    updatedAt: new Date().toISOString(),
    ...data,
  } as RSVP;

  store.rsvps.push(newRsvp);
  guest.rsvpStatus = attending ? 'Confirmed' : 'Declined';
  return newRsvp;
}

export function upsertRsvpForGuest(guest: Guest, data: Partial<RSVP> & Record<string, any>) {
  const existing = getRsvpByGuestId(guest.id);
  const payload = {
    ...data,
    weddingId: guest.weddingId,
    guestId: guest.id,
  };

  if (existing) {
    return updateRsvp(existing.id, payload);
  }

  return addRsvp(payload);
}

export function updateRsvp(id: string, data: Partial<RSVP> & Record<string, any>) {
  const idx = store.rsvps.findIndex((r: RSVP) => r.id === id);
  if (idx === -1) return null;
  const existing = store.rsvps[idx];
  const guest = store.guests.find((g: Guest) => g.id === existing.guestId);
  const updated: RSVP = { ...existing, ...data, updatedAt: new Date().toISOString() } as RSVP;
  if (typeof updated.memberCount === 'number' && guest && updated.memberCount > (guest.maxMembers || 20)) {
    throw new Error('memberCount exceeds guest maxMembers');
  }
  store.rsvps[idx] = updated;
  if (guest) guest.rsvpStatus = updated.attending ? 'Confirmed' : 'Declined';
  return updated;
}

export function deleteRsvp(id: string) {
  const idx = store.rsvps.findIndex((r: RSVP) => r.id === id);
  if (idx === -1) return null;
  const [removed] = store.rsvps.splice(idx, 1);
  const guest = store.guests.find((g: Guest) => g.id === removed.guestId);
  if (guest) guest.rsvpStatus = 'Pending';
  return removed;
}

export function getRsvpsByWedding(weddingId: string) {
  return store.rsvps.filter((r: RSVP) => r.weddingId === weddingId);
}

export function getRsvpById(id: string) {
  return store.rsvps.find((r: RSVP) => r.id === id) || null;
}

export function getRsvpCounts(weddingId: string) {
  const rows = store.rsvps.filter((r: RSVP) => r.weddingId === weddingId);
  const attendingGuests = rows.filter(r => r.attending).reduce((s, r) => s + (Number(r.memberCount) || 1), 0);
  const declinedGuests = rows.filter(r => r.attending === false).reduce((s, r) => s + (Number(r.memberCount) || 0), 0);
  const rsvpCount = rows.length;
  const totalGuestsInvited = store.guests.filter(g => g.weddingId === weddingId).reduce((s, g) => s + (Number(g.maxMembers) || 1), 0);
  return {
    rsvpCount,
    attendingGuests,
    declinedGuests,
    pendingGuests: Math.max(0, totalGuestsInvited - attendingGuests - declinedGuests),
    totalGuestsInvited,
  };
}

export function exportRsvps(weddingId?: string) {
  const rows = weddingId ? store.rsvps.filter(r => r.weddingId === weddingId) : store.rsvps.slice();
  return rows;
}

export function getAgendaEventsByWedding(weddingId: string) {
  return store.agenda
    .filter((event: AgendaEvent) => event.weddingId === weddingId)
    .map((event: AgendaEvent, index: number) => normalizeAgendaEvent(event, index))
    .sort((a: AgendaEvent, b: AgendaEvent) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function addAgendaEvent(data: Partial<AgendaEvent> & Record<string, any>) {
  if (!data?.weddingId) throw new Error('weddingId required');
  const nextOrder = getAgendaEventsByWedding(data.weddingId).length;
  const event = normalizeAgendaEvent({
    id: `ag_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    weddingId: data.weddingId,
    icon: data.icon || 'CalendarDays',
    title: data.title || 'Timeline item',
    startTime: data.startTime || data.time || '09:00',
    endTime: data.endTime || '',
    duration: data.duration,
    timezone: data.timezone || '',
    location: data.location || '',
    description: data.description || '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : nextOrder,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  }, nextOrder);

  store.agenda.push(event);
  return event;
}

export function updateAgendaEvent(id: string, data: Partial<AgendaEvent> & Record<string, any>) {
  const idx = store.agenda.findIndex((event: AgendaEvent) => event.id === id);
  if (idx === -1) return null;
  const updated = normalizeAgendaEvent({ ...store.agenda[idx], ...data, updatedAt: new Date().toISOString() }, store.agenda[idx].sortOrder || 0);
  store.agenda[idx] = updated;
  return updated;
}

export function reorderAgendaEvents(weddingId: string, orderedIds: string[]) {
  const events = getAgendaEventsByWedding(weddingId);
  const existingIds = new Set(events.map((event: AgendaEvent) => event.id));
  const validOrderedIds = orderedIds.filter(id => existingIds.has(id));
  const remainingIds = events.map((event: AgendaEvent) => event.id).filter((id: string) => !validOrderedIds.includes(id));
  const finalIds = [...validOrderedIds, ...remainingIds];

  finalIds.forEach((id, index) => {
    updateAgendaEvent(id, { sortOrder: index });
  });

  return getAgendaEventsByWedding(weddingId);
}

export function deleteAgendaEvent(id: string) {
  const idx = store.agenda.findIndex((event: AgendaEvent) => event.id === id);
  if (idx === -1) return null;
  const [removed] = store.agenda.splice(idx, 1);
  reorderAgendaEvents(removed.weddingId, getAgendaEventsByWedding(removed.weddingId).map((event: AgendaEvent) => event.id));
  return removed;
}

function normalizeAgendaEvent(event: AgendaEvent, fallbackOrder: number) {
  const startTime = String(event.startTime || event.time || '09:00').slice(0, 5);
  const endTime = String(event.endTime || addMinutesToTime(startTime, Number(event.duration || 30))).slice(0, 5);
  const duration = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
  return {
    ...event,
    startTime,
    endTime,
    time: startTime,
    duration,
    timezone: event.timezone || '',
    sortOrder: typeof event.sortOrder === 'number' ? event.sortOrder : fallbackOrder,
  };
}

function timeToMinutes(value: string) {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
}

function addMinutesToTime(value: string, minutesToAdd: number) {
  const total = Math.min(1439, Math.max(0, timeToMinutes(value) + minutesToAdd));
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getGalleryImagesByWedding(weddingId: string) {
  return store.galleryImages
    .filter((image: GalleryImage) => image.weddingId === weddingId)
    .sort((a: GalleryImage, b: GalleryImage) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function addGalleryImage(data: Partial<GalleryImage> & Record<string, any>) {
  if (!data?.weddingId) throw new Error('weddingId required');
  if (!data?.imageUrl) throw new Error('imageUrl required');

  const nextOrder = getGalleryImagesByWedding(data.weddingId).length;
  const image: GalleryImage = {
    id: `gal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    weddingId: data.weddingId,
    imageType: data.imageType || 'gallery',
    imageUrl: data.imageUrl,
    altText: data.altText || '',
    fileName: data.fileName || '',
    mimeType: data.mimeType || '',
    sizeBytes: Number(data.sizeBytes || 0),
    width: Number(data.width || 0),
    height: Number(data.height || 0),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : nextOrder,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  store.galleryImages.push(image);
  return image;
}

export function updateGalleryImage(id: string, data: Partial<GalleryImage> & Record<string, any>) {
  const idx = store.galleryImages.findIndex((image: GalleryImage) => image.id === id);
  if (idx === -1) return null;
  const updated = { ...store.galleryImages[idx], ...data };
  store.galleryImages[idx] = updated;
  return updated;
}

export function reorderGalleryImages(weddingId: string, orderedIds: string[]) {
  const images = getGalleryImagesByWedding(weddingId);
  const existingIds = new Set(images.map((image: GalleryImage) => image.id));
  const validOrderedIds = orderedIds.filter(id => existingIds.has(id));
  const remainingIds = images.map((image: GalleryImage) => image.id).filter((id: string) => !validOrderedIds.includes(id));
  const finalIds = [...validOrderedIds, ...remainingIds];

  finalIds.forEach((id, index) => {
    updateGalleryImage(id, { sortOrder: index });
  });

  return getGalleryImagesByWedding(weddingId);
}

export function deleteGalleryImage(id: string) {
  const idx = store.galleryImages.findIndex((image: GalleryImage) => image.id === id);
  if (idx === -1) return null;
  const [removed] = store.galleryImages.splice(idx, 1);
  reorderGalleryImages(removed.weddingId, getGalleryImagesByWedding(removed.weddingId).map((image: GalleryImage) => image.id));
  return removed;
}

// --- Tables & Seating Helpers ---
export function getTablesByWedding(weddingId: string) {
  return store.tables
    .filter((t: Table) => t.weddingId === weddingId)
    .sort((a: Table, b: Table) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function getTableById(id: string) {
  return store.tables.find((t: Table) => t.id === id) || null;
}

export function addTable(data: Partial<Table> & Record<string, any>) {
  if (!data?.weddingId) throw new Error('weddingId required');
  const capacity = typeof data.capacity === 'number' ? Math.floor(data.capacity) : 8;
  if (capacity < 1 || capacity > 100) throw new Error('capacity must be between 1 and 100');

  const id = `tbl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const nextOrder = getTablesByWedding(data.weddingId).length;
  const table: Table = {
    id,
    weddingId: data.weddingId,
    name: data.name || `Table ${nextOrder + 1}`,
    capacity,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : nextOrder,
    assignedGuestIds: Array.isArray(data.assignedGuestIds) ? data.assignedGuestIds.slice() : [],
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Table;

  store.tables.push(table);
  return { ...table };
}

export function updateTable(id: string, data: Partial<Table> & Record<string, any>) {
  const idx = store.tables.findIndex((t: Table) => t.id === id);
  if (idx === -1) return null;
  const existing = store.tables[idx];
  const capacity = typeof data.capacity === 'number' ? Math.floor(data.capacity) : existing.capacity;
  if (capacity < 1 || capacity > 100) throw new Error('capacity must be between 1 and 100');

  const updated: Table = {
    ...existing,
    ...data,
    capacity,
    name: data.name !== undefined ? String(data.name || '') : existing.name,
    notes: data.notes !== undefined ? String(data.notes || '') : existing.notes,
    updatedAt: new Date().toISOString(),
  } as Table;

  // If reducing capacity, ensure assignments do not exceed capacity
  if (Array.isArray(updated.assignedGuestIds) && updated.assignedGuestIds.length > updated.capacity) {
    throw new Error('cannot reduce capacity below current assigned guest count');
  }

  store.tables[idx] = updated;
  return { ...updated };
}

export function deleteTable(id: string) {
  const idx = store.tables.findIndex((t: Table) => t.id === id);
  if (idx === -1) return null;
  const [removed] = store.tables.splice(idx, 1);
  return removed;
}

export function getTableAssignmentSnapshot(weddingId: string) {
  return getTablesByWedding(weddingId).map((table: Table) => ({
    tableId: table.id,
    assignedGuestIds: Array.isArray(table.assignedGuestIds) ? table.assignedGuestIds.slice() : [],
  }));
}

function tableSummary(table: Table | null) {
  if (!table) return null;
  const assignedGuestIds = Array.isArray(table.assignedGuestIds) ? table.assignedGuestIds.slice() : [];
  return {
    id: table.id,
    name: table.name,
    assigned: assignedGuestIds.length,
    capacity: Number(table.capacity || 0),
  };
}

function findAssignedTable(weddingId: string, guestId: string) {
  return store.tables.find((t: Table) => (
    t.weddingId === weddingId
    && Array.isArray(t.assignedGuestIds)
    && t.assignedGuestIds.includes(guestId)
  )) || null;
}

export function assignGuestToTable(weddingId: string, tableId: string, guestId: string) {
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  if (!wedding) throw new Error('wedding not found');
  const table = store.tables.find((t: Table) => t.id === tableId && t.weddingId === weddingId);
  if (!table) throw new Error('table not found');
  const guest = store.guests.find((g: Guest) => g.id === guestId && g.weddingId === weddingId);
  if (!guest) throw new Error('guest not found');

  if (!Array.isArray(table.assignedGuestIds)) table.assignedGuestIds = [];
  const sourceTable = findAssignedTable(weddingId, guestId);

  if (sourceTable?.id === tableId) {
    return {
      guestId,
      guestName: guest.name,
      sourceTable: tableSummary(sourceTable),
      targetTable: tableSummary(table),
      table: { ...table, assignedGuestIds: table.assignedGuestIds.slice() },
      capacity: { assigned: table.assignedGuestIds.length, capacity: table.capacity },
      noOp: true,
      conflict: null,
    };
  }

  if (table.assignedGuestIds.length >= (table.capacity || 0)) {
    throw new Error('table is full');
  }

  if (sourceTable && Array.isArray(sourceTable.assignedGuestIds)) {
    sourceTable.assignedGuestIds = sourceTable.assignedGuestIds.filter((id: string) => id !== guestId);
    sourceTable.updatedAt = new Date().toISOString();
  }

  table.assignedGuestIds.push(guestId);
  table.updatedAt = new Date().toISOString();
  return {
    guestId,
    guestName: guest.name,
    sourceTable: tableSummary(sourceTable),
    targetTable: tableSummary(table),
    table: { ...table, assignedGuestIds: table.assignedGuestIds.slice() },
    capacity: { assigned: table.assignedGuestIds.length, capacity: table.capacity },
    noOp: false,
    conflict: null,
  };
}

export function unassignGuestFromTable(weddingId: string, guestId: string) {
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  if (!wedding) throw new Error('wedding not found');
  const guest = store.guests.find((g: Guest) => g.id === guestId && g.weddingId === weddingId);
  if (!guest) throw new Error('guest not found');

  let removedFrom: Table | null = null;
  for (const t of store.tables.filter((x: Table) => x.weddingId === weddingId)) {
    if (Array.isArray(t.assignedGuestIds) && t.assignedGuestIds.includes(guestId)) {
      t.assignedGuestIds = t.assignedGuestIds.filter((id: string) => id !== guestId);
      t.updatedAt = new Date().toISOString();
      removedFrom = t;
      break;
    }
  }
  return {
    guestId,
    guestName: guest.name,
    sourceTable: tableSummary(removedFrom),
    targetTable: null,
    table: removedFrom ? { ...removedFrom, assignedGuestIds: removedFrom.assignedGuestIds.slice() } : null,
    capacity: removedFrom ? { assigned: removedFrom.assignedGuestIds.length, capacity: removedFrom.capacity } : null,
    noOp: !removedFrom,
    conflict: null,
  };
}

export function findTableForGuest(weddingId: string, guestId: string) {
  return store.tables.find((t: Table) => t.weddingId === weddingId && Array.isArray(t.assignedGuestIds) && t.assignedGuestIds.includes(guestId)) || null;
}

export function restoreTableAssignmentSnapshot(weddingId: string, snapshot: Array<{ tableId: string; assignedGuestIds: string[] }>) {
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  if (!wedding) throw new Error('wedding not found');
  if (!Array.isArray(snapshot)) throw new Error('valid snapshot required');

  const weddingTables = getTablesByWedding(weddingId);
  const tableIds = new Set(weddingTables.map((table: Table) => table.id));
  const seenGuests = new Set<string>();

  for (const entry of snapshot) {
    if (!tableIds.has(entry.tableId)) throw new Error('snapshot table not found');
    const table = weddingTables.find((t: Table) => t.id === entry.tableId);
    const assignedGuestIds = Array.isArray(entry.assignedGuestIds) ? entry.assignedGuestIds.map(String) : [];
    if (assignedGuestIds.length > Number(table?.capacity || 0)) throw new Error('snapshot exceeds table capacity');

    for (const guestId of assignedGuestIds) {
      const guest = store.guests.find((g: Guest) => g.id === guestId && g.weddingId === weddingId);
      if (!guest) throw new Error('snapshot guest not found');
      if (seenGuests.has(guestId)) throw new Error('snapshot contains duplicate guest assignments');
      seenGuests.add(guestId);
    }
  }

  for (const table of weddingTables) {
    const entry = snapshot.find(item => item.tableId === table.id);
    table.assignedGuestIds = entry ? entry.assignedGuestIds.map(String) : [];
    table.updatedAt = new Date().toISOString();
  }

  return getTablesByWedding(weddingId);
}


export function getChecklistByWedding(weddingId: string) {
  return store.checklist
    .filter((item: ChecklistItem) => item.weddingId === weddingId)
    .map((item: ChecklistItem) => ({ ...item, state: normalizeChecklistState(item) }))
    .sort(sortChecklist);
}

export function getChecklistTemplates() {
  return CHECKLIST_STARTER_TEMPLATES.map(({ id, name, description, tasks }) => ({
    id,
    name,
    description,
    taskCount: tasks.length,
  }));
}

export function addChecklistItem(data: Partial<ChecklistItem> & Record<string, any>) {
  if (!data?.weddingId) throw new Error('weddingId required');
  if (!String(data?.title || '').trim()) throw new Error('title required');

  const now = new Date().toISOString();
  const item: ChecklistItem = {
    id: data.id || `cl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    weddingId: data.weddingId,
    group: data.group || '3 months before',
    title: String(data.title).trim(),
    description: data.description || '',
    state: data.isCompleted ? 'completed' : (data.state || 'pending'),
    isCompleted: Boolean(data.isCompleted),
    priority: data.priority || 'medium',
    dueDate: data.dueDate || '',
    reminderAt: data.reminderAt || '',
    templateId: data.templateId || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };

  item.state = normalizeChecklistState(item);
  store.checklist.push(item);
  return { ...item };
}

export function updateChecklistItem(id: string, data: Partial<ChecklistItem> & Record<string, any>) {
  const idx = store.checklist.findIndex((item: ChecklistItem) => item.id === id);
  if (idx === -1) return null;
  const updated = {
    ...store.checklist[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (typeof updated.title === 'string') updated.title = updated.title.trim();
  if (!updated.title) throw new Error('title required');
  if (data.isCompleted === true) updated.state = 'completed';
  if (data.isCompleted === false && updated.state === 'completed') updated.state = 'pending';
  updated.state = normalizeChecklistState(updated);
  store.checklist[idx] = updated;
  return { ...updated };
}

export function toggleChecklistItem(id: string, isCompleted?: boolean) {
  const existing = store.checklist.find((item: ChecklistItem) => item.id === id);
  if (!existing) return null;
  const nextCompleted = typeof isCompleted === 'boolean' ? isCompleted : !existing.isCompleted;
  return updateChecklistItem(id, {
    isCompleted: nextCompleted,
    state: nextCompleted ? 'completed' : 'pending',
  });
}

export function deleteChecklistItem(id: string) {
  const idx = store.checklist.findIndex((item: ChecklistItem) => item.id === id);
  if (idx === -1) return null;
  const [removed] = store.checklist.splice(idx, 1);
  return removed;
}

export function applyChecklistTemplate(weddingId: string, templateId: string) {
  if (!weddingId) throw new Error('weddingId required');
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  const template = CHECKLIST_STARTER_TEMPLATES.find(item => item.id === templateId);
  if (!template) throw new Error('template not found');

  const existingKeys = new Set(
    store.checklist
      .filter((item: ChecklistItem) => item.weddingId === weddingId)
      .map((item: ChecklistItem) => `${item.templateId}:${String(item.title || '').toLowerCase()}`)
  );

  const created: ChecklistItem[] = [];
  for (const task of template.tasks) {
    const key = `${template.id}:${task.title.toLowerCase()}`;
    if (existingKeys.has(key)) continue;
    created.push(addChecklistItem({
      weddingId,
      group: task.group,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: addDays(wedding?.date || '', task.dueOffsetDays),
      reminderAt: `${addDays(wedding?.date || '', task.reminderOffsetDays)}T09:00`,
      templateId,
    }));
  }

  return {
    template: getChecklistTemplates().find(item => item.id === templateId),
    created,
    items: getChecklistByWedding(weddingId),
  };
}

function normalizeBudgetAmount(value: any) {
  if (value === '' || value === null || value === undefined) return 0;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Budget amounts must be non-negative numbers');
  }
  return Math.round(amount);
}

function assertBudgetCategory(category: any) {
  const normalized = String(category || '').trim();
  if (!BUDGET_CATEGORIES.includes(normalized as any)) {
    throw new Error('Invalid budget category');
  }
  return normalized;
}

function assertBudgetStatus(status: any): BudgetStatus {
  const normalized = String(status || '').trim().toLowerCase();
  if (!BUDGET_STATUSES.includes(normalized as BudgetStatus)) {
    throw new Error('Invalid budget status');
  }
  return normalized as BudgetStatus;
}

function sanitizeBudgetPayload(data: Partial<BudgetItem> & Record<string, any>, existing?: BudgetItem) {
  const name = data.name !== undefined ? String(data.name || '').trim() : existing?.name;
  if (!name) throw new Error('Budget item name required');

  return {
    category: data.category !== undefined ? assertBudgetCategory(data.category) : existing?.category,
    name,
    estimated: data.estimated !== undefined ? normalizeBudgetAmount(data.estimated) : Number(existing?.estimated || 0),
    actual: data.actual !== undefined ? normalizeBudgetAmount(data.actual) : Number(existing?.actual || 0),
    status: data.status !== undefined ? assertBudgetStatus(data.status) : (existing?.status || 'planned'),
    notes: data.notes !== undefined ? String(data.notes || '').trim() : (existing?.notes || ''),
  };
}

export function getBudgetItemsByWedding(weddingId: string) {
  return store.budget
    .filter((item: BudgetItem) => item.weddingId === weddingId)
    .sort((a: BudgetItem, b: BudgetItem) => BUDGET_CATEGORIES.indexOf(a.category) - BUDGET_CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name));
}

export function calculateBudgetSummary(items: BudgetItem[]) {
  const categoryTotals = BUDGET_CATEGORIES.map(category => {
    const rows = items.filter((item: BudgetItem) => item.category === category);
    const estimated = rows.reduce((sum: number, item: BudgetItem) => sum + Number(item.estimated || 0), 0);
    const actual = rows.reduce((sum: number, item: BudgetItem) => sum + Number(item.actual || 0), 0);
    return {
      category,
      estimated,
      actual,
      remaining: estimated - actual,
      plannedCount: rows.filter((item: BudgetItem) => item.status === 'planned').length,
      reservedCount: rows.filter((item: BudgetItem) => item.status === 'reserved').length,
      paidCount: rows.filter((item: BudgetItem) => item.status === 'paid').length,
      itemCount: rows.length,
    };
  });

  const estimatedTotal = items.reduce((sum: number, item: BudgetItem) => sum + Number(item.estimated || 0), 0);
  const actualTotal = items.reduce((sum: number, item: BudgetItem) => sum + Number(item.actual || 0), 0);
  const reservedTotal = items.filter((item: BudgetItem) => item.status === 'reserved').reduce((sum: number, item: BudgetItem) => sum + Number(item.actual || 0), 0);
  const paidTotal = items.filter((item: BudgetItem) => item.status === 'paid').reduce((sum: number, item: BudgetItem) => sum + Number(item.actual || 0), 0);
  const plannedTotal = items.filter((item: BudgetItem) => item.status === 'planned').reduce((sum: number, item: BudgetItem) => sum + Number(item.estimated || 0), 0);

  return {
    categories: BUDGET_CATEGORIES,
    statuses: BUDGET_STATUSES,
    categoryTotals,
    totals: {
      estimatedTotal,
      actualTotal,
      reservedTotal,
      paidTotal,
      plannedTotal,
      remaining: estimatedTotal - actualTotal,
    },
  };
}

export function getBudgetResponse(weddingId: string) {
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  if (!wedding) return null;
  const items = getBudgetItemsByWedding(weddingId);
  return {
    weddingId,
    scenarioNote: wedding.budgetScenarioNote || '',
    items,
    ...calculateBudgetSummary(items),
  };
}

export function addBudgetItem(data: Partial<BudgetItem> & Record<string, any>) {
  if (!store.weddings.some((w: Wedding) => w.id === data.weddingId)) {
    throw new Error('Wedding not found');
  }

  const now = new Date().toISOString();
  const payload = sanitizeBudgetPayload({
    category: data.category || 'Other',
    name: data.name,
    estimated: data.estimated,
    actual: data.actual,
    status: data.status || 'planned',
    notes: data.notes,
  });

  const item: BudgetItem = {
    id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    weddingId: data.weddingId,
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  store.budget.push(item);
  return item;
}

export function updateBudgetItem(id: string, data: Partial<BudgetItem> & Record<string, any>) {
  const idx = store.budget.findIndex((item: BudgetItem) => item.id === id);
  if (idx === -1) return null;
  const existing = store.budget[idx];
  const updated = {
    ...existing,
    ...sanitizeBudgetPayload(data, existing),
    updatedAt: new Date().toISOString(),
  };
  store.budget[idx] = updated;
  return updated;
}

export function deleteBudgetItem(id: string) {
  const idx = store.budget.findIndex((item: BudgetItem) => item.id === id);
  if (idx === -1) return null;
  const [removed] = store.budget.splice(idx, 1);
  return removed;
}

export function updateBudgetScenarioNote(weddingId: string, note: string) {
  const wedding = store.weddings.find((w: Wedding) => w.id === weddingId);
  if (!wedding) return null;
  wedding.budgetScenarioNote = String(note || '').trim();
  return wedding.budgetScenarioNote;
}

export function exportBudgetRows(weddingId: string) {
  return getBudgetItemsByWedding(weddingId);
}

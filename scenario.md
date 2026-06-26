# WedPlan — Complete System Scenarios

A reference document covering every user flow and feature in the WedPlan platform.
Designed for client presentations and stakeholder walkthroughs.

---

## System Overview

**WedPlan** is a full-stack wedding planning SaaS platform. It connects three groups of people:

| Role | Who | What they do |
|------|-----|--------------|
| **Couple** | The bride & groom | Plan their wedding, manage guests, publish their invitation |
| **Vendor** | Photographers, caterers, decorators | List services, receive bookings, manage their business |
| **Super Admin** | Platform owner | Manage all couples, vendors, plans, and system settings |

**Live URL:** https://invitemyguestplanner.vercel.app  
**Database:** Supabase PostgreSQL (cloud)  
**Framework:** Next.js App Router + TypeScript

---

## The Four Portals

```
/              → Public landing page
/couple        → Couple Dashboard (private)
/vendor        → Vendor Portal (private)
/super         → Super Admin Panel (private)
/invitation/[slug]  → Public Invitation Page (visible to guests)
```

---

## Scenario 1 — Couple Registration & Login

**Who:** A newly engaged couple  
**Goal:** Get access to their wedding planning dashboard

### Flow

1. Couple visits the WedPlan landing page
2. They click **Get Started** or **Register**
3. They fill in:
   - Email address
   - Password
   - Bride first name / Groom first name
4. The system creates:
   - A `User` record in the database (role = `COUPLE`)
   - A `Wedding` record linked to their user account
   - A unique **slug** for their public invitation (e.g., `priya-and-kasun`)
5. They are redirected to `/couple` — their private dashboard
6. On future visits, they log in at `/login` and land back on the dashboard

### What the couple sees immediately
- Empty dashboard with their names as the title (e.g., *"Priya & Kasun"*)
- All modules available: Settings, Gallery, Guests, Tables, Budget, Checklist, Agenda, Invitation, Analytics
- A **live preview link** to their public invitation page

---

## Scenario 2 — Wedding Settings Setup

**Who:** The couple  
**Goal:** Enter all the core wedding details that appear on their invitation

### Flow

1. Couple opens the **Settings** module in the dashboard
2. They fill in:
   - **Bride name / Groom name** — appears in the invitation header
   - **Wedding date** — e.g., August 15, 2026
   - **Ceremony time** — e.g., 4:00 PM
   - **Venue name** — e.g., Galle Face Hotel, Colombo
   - **Venue address** — displayed on the invitation
   - **Google Maps link** — guests can tap to get directions
   - **RSVP deadline** — last date guests can respond
   - **Special Note** — a personal message from the couple to guests
3. They click **Save**
4. All of these fields immediately update the **public invitation page**

### What flows to the invitation
Every field in Settings is live-synced to the public page — no separate publishing step needed.

---

## Scenario 3 — Photo Gallery Management

**Who:** The couple  
**Goal:** Personalise their invitation with their own photos

### Sub-scenario A: Default gallery (no photos uploaded yet)

When the couple first logs in, the Gallery module shows **12 sample engagement photos** (romantic stock images from Unsplash). These are labelled "Sample preview" so the couple knows they are placeholders. The same 12 photos also appear on the live invitation page so guests never see a blank gallery.

### Sub-scenario B: Uploading a hero photo

1. Couple opens the **Gallery** module
2. They click the **Hero Image** upload slot (the large banner at the top)
3. They select a photo from their pre-wedding shoot
4. The system uploads it to Supabase Storage (`wedding-media` bucket, type = `hero`)
5. The invitation page header immediately shows their real photo

### Sub-scenario C: Uploading gallery photos

1. Couple clicks **Add Photo** in the gallery grid
2. They upload multiple photos (pre-wedding shoot, engagement, etc.)
3. Each photo is saved in Supabase Storage (`imageType = gallery`)
4. The sample placeholders disappear and only real photos are shown
5. The invitation gallery now shows their personal **Moments of Love** section

### Sub-scenario D: Couple photo for Special Note

1. Couple uploads a personal couple photo to appear next to their Special Note message
2. Saved as `imageType = couple` in storage
3. Appears in the **Special Note** section of the invitation

---

## Scenario 4 — Guest List Management

**Who:** The couple  
**Goal:** Build and manage the complete guest list

### Sub-scenario A: Add a guest manually

1. Couple opens the **Guests** module
2. Clicks **Add Guest**
3. Fills in: Name, Email, Phone, Category (Family / Friend / Colleague / VIP), Notes
4. Clicks Save
5. Guest appears in the list with status **"Not Invited"** until an RSVP link is sent

### Sub-scenario B: Import guests from CSV

1. Couple clicks **Import CSV**
2. Uploads a spreadsheet with columns: name, email, phone, category
3. System validates each row and creates guest records in bulk
4. Duplicate emails are skipped automatically

### Sub-scenario C: Edit or delete a guest

1. Couple clicks the edit (pencil) icon next to any guest
2. Updates details and saves
3. Or clicks the trash icon to delete (with confirmation prompt)

### Sub-scenario D: Export guest list

1. Couple clicks **Export CSV**
2. System downloads a CSV file with all guest details + RSVP status
3. Useful for sharing with caterers or venue coordinators

### What the couple sees
- Guest count summary at the top (Total, Attending, Declined, Pending)
- Search and filter by name, category, or RSVP status
- Colour-coded RSVP status badges

---

## Scenario 5 — RSVP Tracking

**Who:** The couple (monitoring) + Guests (responding)  
**Goal:** Know who is coming to the wedding

### Guest side (how RSVPs arrive)

1. Couple shares the invitation URL with guests (WhatsApp, email, etc.)
2. Guest opens: `https://invitemyguestplanner.vercel.app/invitation/priya-and-kasun`
3. Guest sees the full invitation page
4. Guest clicks the **RSVP** button
5. Guest submits: Attending (Yes / No) + dietary notes
6. RSVP is saved in the database linked to the guest record

### Couple side (monitoring)

1. Couple opens the **RSVP** view in the dashboard
2. They see a live list of responses with:
   - Guest name
   - RSVP status: Attending / Not Attending / Pending
   - Response date
   - Dietary notes
3. Dashboard shows summary stats:
   - Total invited / Responded / Attending / Declined
4. Responses update in real time as guests submit their RSVPs

---

## Scenario 6 — Seating & Table Management

**Who:** The couple  
**Goal:** Assign every guest to a seat at a specific table

### Flow

1. Couple opens the **Tables** module
2. Clicks **Add Table** → enters table name and capacity (e.g., "Table 1", 8 seats)
3. Repeat for all tables at the venue
4. For each table, they drag guests from the guest list into the table
5. System checks capacity — warns if a table is over its limit
6. Once assigned, guests can look up their table on the invitation page

### Guest-facing: Find My Table

On the public invitation page there is a **"Find Your Table"** section:
1. Guest types their name
2. System searches the guest list and table assignments
3. Guest sees: **"You are at Table 3 — Lotus Table"**
4. No login required — the search is public for invited guests

---

## Scenario 7 — Budget Tracker

**Who:** The couple  
**Goal:** Track all wedding expenses against a total budget

### Flow

1. Couple opens the **Budget** module
2. They set their total estimated budget (stored in Wedding settings)
3. They add budget items:
   - Category (Venue / Catering / Flowers / Photography / etc.)
   - Item name
   - Estimated cost
   - Actual cost (once paid)
   - Paid / Unpaid status
4. Dashboard shows:
   - Total budget vs. spent
   - Remaining balance
   - Per-category breakdown
   - Progress bar showing % used

---

## Scenario 8 — Wedding Checklist

**Who:** The couple  
**Goal:** Track every task that needs to be done before the wedding

### Flow

1. Couple opens the **Checklist** module
2. They can:
   - **Load a template** — the system offers a pre-built list of common wedding tasks organised by timeline (12 months out, 6 months, 1 month, week before, day of)
   - **Add custom tasks** — any task specific to their wedding
3. Each task has:
   - Task name
   - Due date
   - Assignee (bride, groom, or coordinator)
   - Done / Not done toggle
4. Completed tasks are crossed off and shown separately
5. Tasks past their due date are highlighted as overdue

---

## Scenario 9 — Event Agenda

**Who:** The couple  
**Goal:** Plan the timeline of events on the wedding day

### Flow

1. Couple opens the **Agenda** module
2. They add timeline entries:
   - Event name (e.g., "Bride Arrival", "Ceremony", "First Dance", "Dinner")
   - Start time
   - Duration in minutes
   - Description / notes
   - Icon (cake, ring, music, camera, etc.)
3. Entries are sorted by time automatically
4. The agenda is displayed on the **public invitation page** so guests know what to expect
5. Each agenda item shows start time → end time (calculated automatically from duration)

### What guests see on the invitation
A beautiful **Schedule of Events** section with icons and times for each moment.

---

## Scenario 10 — Invitation Editor & Preview

**Who:** The couple  
**Goal:** See exactly what their guests will see before sharing the link

### Flow

1. Couple opens the **Invitation** module in the dashboard
2. They see a live preview of their public invitation page
3. They can test:
   - How their hero photo looks
   - How the wedding details card reads
   - How the gallery appears
   - How the agenda looks
4. They copy the shareable link: `https://invitemyguestplanner.vercel.app/invitation/[their-slug]`
5. They share it via WhatsApp, email, or social media

### Invitation sections visible to guests
See **Scenario 12** for the full guest-facing walkthrough.

---

## Scenario 11 — Dashboard Analytics

**Who:** The couple  
**Goal:** Get an overview of where things stand with the wedding

### What the analytics panel shows

- **Guest summary** — Total / Attending / Declined / No Response
- **RSVP progress** — % responded, days until RSVP deadline
- **Budget snapshot** — spent vs. remaining
- **Checklist progress** — tasks done vs. pending
- **Countdown timer** — days until the wedding

All numbers update live as guests respond and the couple adds data.

---

## Scenario 12 — Public Invitation Page (What Guests See)

**Who:** Any invited guest  
**Goal:** View the wedding invitation and get all event information  
**URL:** `https://invitemyguestplanner.vercel.app/invitation/[slug]`  
**No login required**

### Sections on the page (in order)

#### 1. Hero Section
- Full-bleed photo (the couple's own photo, or a beautiful default)
- Couple names in elegant typography
- Wedding date
- Live countdown timer ("42 days to go")

#### 2. Wedding Details Card
- Date and time (formatted: "Saturday, August 15, 2026 · 4:00 PM")
- Venue name and address
- **"Get Directions"** button (opens Google Maps link)
- RSVP deadline reminder

#### 3. Special Note from the Couple
- Couple's personal message to guests
- Optional couple photo alongside the message

#### 4. Moments of Love (Photo Gallery)
- Masonry-style photo grid (multiple column sizes, varying heights)
- Shows the couple's uploaded photos
- If no photos have been uploaded, shows 12 beautiful sample engagement photos automatically
- Once the couple uploads real photos, the samples disappear

#### 5. Schedule of Events (Agenda)
- Timeline of the wedding day with icons, times, and descriptions
- Only shown if the couple has added agenda items

#### 6. Find Your Table
- Inline search box — guest types their name
- Instantly shows their assigned table (no login, no page reload)
- If not yet assigned, shows a friendly "check back closer to the day" message

#### 7. RSVP Button
- Guests click to submit their attendance
- Couple sees the response in their dashboard instantly

---

## Scenario 13 — Vendor Portal

**Who:** A wedding vendor (photographer, florist, caterer, etc.)  
**Goal:** List their services and manage bookings through WedPlan

### Registration flow

1. Vendor signs up at `/register` with role = Vendor
2. They submit their business for review
3. Super Admin approves or rejects the listing

### Once approved

1. Vendor logs in at `/login` → lands on `/vendor`
2. They set up their **Profile & Portfolio**:
   - Business name, description, contact info
   - Portfolio photos
   - Service categories
3. They create **Listings** — individual service packages:
   - Package name (e.g., "Full Day Photography — 10 hrs")
   - Price
   - Description
   - Photos
   - Active / Inactive toggle
4. Couples can browse and contact vendors through the platform

### Operations dashboard

| Module | What it shows |
|--------|--------------|
| **Dashboard** | Summary — active listings, pending bookings, recent messages |
| **Bookings** | Pending / confirmed / completed bookings from couples |
| **Availability** | Calendar to block out unavailable dates |
| **Messages** | Chat threads with couples |
| **Analytics** | Profile views, booking conversion rate, revenue |
| **Payouts** | Payment history from the platform |
| **Settings** | Notification preferences, bank details |

---

## Scenario 14 — Super Admin Platform Management

**Who:** The platform owner / WedPlan admin  
**Goal:** Manage all couples, vendors, plans, and system health  
**URL:** `/super`

### Modules

#### Dashboard Overview
- Total active couples
- Total vendors (pending review / approved / rejected)
- Platform-wide RSVP stats
- Revenue summary (subscriptions)
- Recent activity log

#### Couples Management
- List of all registered couples with their wedding details
- Search by name or email
- View any couple's details (read-only)
- Suspend or delete an account
- Reset a couple's plan tier

#### Vendor Management
- List of all vendors with status badges: Pending / Approved / Rejected
- **Badge counter** shows how many vendors are waiting for review
- Admin can approve or reject vendor applications with notes
- View vendor profile and listings before deciding

#### Templates
- Manage invitation page templates that couples can choose
- Add / edit / remove design themes

#### Analytics
- Platform-wide metrics
- Signups over time, active weddings, churn rate
- Revenue charts by plan tier

#### Plans (Pricing Tiers)
- Define plan tiers (Free, Starter, Pro, Premium)
- Set entitlements per tier: max guests, gallery photos, features
- View which couples are on which plan

#### Trial Cleanup
- Find trials that expired and were not converted
- Clean up inactive/abandoned accounts in bulk

#### Settings
- Platform-wide configuration
- Feature flags (enable/disable features globally)
- Email notification settings

#### Audit Logs
- Full tamper-evident log of every action taken in the system
- Who did what and when
- Cannot be deleted (protected file: `logs/audit.log`)

---

## Scenario 15 — Payment & Subscription Plans

**Who:** Couple upgrading from free to paid  
**Goal:** Unlock more guests, more gallery photos, advanced features

### Flow

1. Couple hits a plan limit (e.g., "Free plan allows 50 guests, you have 51")
2. They click **Upgrade Plan**
3. They are taken to `/account/checkout`
4. Stripe payment form loads (sandbox in development, live in production)
5. Couple enters card details and confirms
6. On success, their plan tier is updated instantly
7. The new limits apply to their dashboard immediately

### Plan tiers (example)

| Plan | Max Guests | Gallery Photos | Custom Domain | Price |
|------|-----------|----------------|---------------|-------|
| Free | 50 | 10 | No | Free |
| Starter | 150 | 30 | No | $9/mo |
| Pro | 300 | 100 | Yes | $19/mo |
| Premium | Unlimited | Unlimited | Yes | $39/mo |

---

## Scenario 16 — Password Reset

**Who:** Any user (couple, vendor, admin) who forgot their password  
**Goal:** Regain access to their account

### Flow

1. User visits `/login` and clicks **Forgot Password**
2. They enter their email address
3. The system sends a password reset email with a secure token link
4. User clicks the link → lands on `/reset-password`
5. They enter a new password (confirmed twice)
6. Password is updated; they are redirected to login

---

## Scenario 17 — End-to-End Wedding Journey (All Scenarios Combined)

This is how the full WedPlan experience looks for a real couple:

```
Week 1 — Register & Setup
  └─ Create account → Enter wedding details → Set venue + date

Week 2 — Personalise
  └─ Upload hero photo → Upload gallery photos → Write special note

Week 3-8 — Plan
  └─ Add guests (manually or CSV import)
  └─ Add budget items, track deposits paid
  └─ Add checklist tasks, assign to bride/groom
  └─ Build wedding day agenda (ceremony → dinner → dancing)

Week 9 — Invite Guests
  └─ Preview invitation page → Copy link
  └─ Share via WhatsApp, email, social media
  └─ Guests open the link, see the invitation, RSVP

Week 10-11 — Manage RSVPs
  └─ Monitor responses on dashboard
  └─ Follow up with non-responders
  └─ Finalise guest count

Week 12 — Seating
  └─ Create tables (Table 1–20, with capacity)
  └─ Assign guests to tables
  └─ Guests can Find My Table on the invitation page

Week of Wedding
  └─ Export final guest list CSV for venue
  └─ Check analytics — 100% RSVPs received
  └─ Couple arrives at venue, everything is planned
```

---

## Technical Notes (for developer or tech-savvy clients)

| Aspect | Detail |
|--------|--------|
| **Hosting** | Vercel (serverless, auto-deploys from GitHub) |
| **Database** | Supabase PostgreSQL (cloud, replicated) |
| **Storage** | Supabase Storage (photos, hero images, gallery) |
| **Auth** | NextAuth.js with JWT sessions (email + password) |
| **Payments** | Stripe (PCI-compliant, sandbox + live modes) |
| **Security** | Role-based access control — couples can only see their own data |
| **API** | REST API routes in Next.js, all require session + ownership check |
| **Gallery defaults** | 12 Unsplash couple photos auto-fill until real photos are uploaded |
| **Data isolation** | Each couple's wedding data is scoped by their `weddingId` — no cross-couple data access |

---

## Live Demo Accounts

| Role | Email | Password | Slug |
|------|-------|----------|------|
| Couple | hello@priyakasun.com | (ask admin) | priya-and-kasun |
| Vendor | (sandbox vendor) | — | — |
| Admin | (internal) | — | — |

**Public invitation (no login needed):**  
https://invitemyguestplanner.vercel.app/invitation/priya-and-kasun

---

*Last updated: June 2026 — WedPlan v1.0*

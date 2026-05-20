# Couple Admin Dashboard — Full Product, UX, and Technical Plan

## Perspective
This document is written from the viewpoint of:
- Senior Software Engineer
- Software Architect
- Senior UI/UX Designer

It defines the **Couple Admin Dashboard** for a wedding planning + guest management + digital invitation SaaS platform.

---

# 1. Purpose of the Couple Admin Dashboard

The **Couple Admin Dashboard** is the main private workspace for the couple.

It is where they manage everything related to their wedding:
- wedding basics
- guest list
- RSVPs
- invitation website
- colors and branding
- sections hide/show
- agenda
- seating and tables
- budget
- checklist and tasks
- vendors
- gallery
- music settings

This dashboard is the **core operational system** of the product.

---

# 2. Main Goals

## Product goals
- replace spreadsheets and scattered notes
- centralize planning into one place
- make wedding management simple and visual
- let couples control both planning and guest experience
- reduce stress
- provide real-time visibility

## User goals
- quickly understand wedding progress
- manage guests easily
- track RSVP status live
- customize invitation website
- stay organized with checklist and budget
- assign tables and monitor counts

---

# 3. Primary User Type

## Couple
The main authenticated user of this dashboard.

This account can represent:
- one partner using the dashboard
- both partners sharing access through one account in MVP
- later, collaborative access can be expanded

---

# 4. Dashboard Design Principles

## Engineering principles
- modular
- scalable
- secure
- responsive
- role-restricted
- data-driven
- state-consistent

## UX principles
- minimal learning curve
- friendly but professional
- beautiful but practical
- mobile-first
- high readability
- action-oriented
- low friction

---

# 5. Main Information Architecture

The Couple Admin Dashboard should be organized into the following main modules:

1. Overview Dashboard
2. Wedding Settings
3. Guest Management
4. RSVP Management
5. Invitation Website Editor
6. Section Visibility Controls
7. Theme & Design
8. Gallery Manager
9. Music Settings
10. Agenda / Timeline
11. Table Assignment
12. Budget Planner
13. Checklist / Task List
14. Vendor Management
15. Account / Subscription Settings

---

# 6. Recommended Dashboard Navigation Structure

## Left sidebar navigation

- Overview
- Wedding Settings
- Guests
- RSVPs
- Invitation Editor
- Theme & Design
- Gallery
- Agenda
- Tables
- Budget
- Checklist
- Vendors
- Settings

## Top header
- wedding name / couple names
- trial or subscription badge
- notifications
- quick preview invitation button
- account menu

---

# 7. Module-by-Module Full Breakdown

---

## 7.1 Overview Dashboard

### Purpose
The main landing page after login.

This page should answer:
- where am I in the planning process?
- how many guests are confirmed?
- what is pending?
- what needs attention now?

### Must include
- bride and groom names
- wedding date
- venue
- countdown
- total guests
- confirmed attendees
- pending RSVPs
- declined RSVPs
- total expected headcount
- budget summary
- checklist progress
- recent guest activity
- quick actions

### Suggested cards
- Total Guests
- Confirmed
- Pending
- Declined
- Guest Headcount
- Budget Used
- Checklist Progress
- Tables Created

### Quick actions
- Add Guest
- Edit Invitation
- Create Agenda Event
- Add Budget Item
- Preview Invitation
- Send Invite Link

### UX notes
This page must be glanceable. It should feel like a command center, not a cluttered admin page.

---

## 7.2 Wedding Settings

### Purpose
Manage core wedding details.

### Fields
- groom first name
- bride first name
- wedding title
- wedding date
- venue name
- venue map link
- short story / intro
- wedding slug
- event timezone
- contact details
- RSVP deadline

### Optional flags
- date TBD
- venue TBD

### Actions
- edit wedding basics
- update public slug
- save changes
- preview public invitation

### UX notes
Use grouped cards:
- Basic Info
- Event Details
- Contact / Slug

---

## 7.3 Guest Management

### Purpose
Manage guest records.

### Features
- add guest
- edit guest
- delete guest
- filter guests
- bulk add guests later
- bride side / groom side tag
- WhatsApp number with default +94
- email optional
- invitation type
- max allowed family members
- notes

### Required fields
- guest name
- side: Bride / Groom
- WhatsApp number
- invitation type: Individual / Family
- max allowed count

### Suggested views
- table view
- card view (optional later)

### Filters
- all
- bride side
- groom side
- RSVP pending
- confirmed
- declined
- family invitation
- individual invitation

### Actions
- copy invite link
- send WhatsApp invite
- resend invite
- edit guest

### UX notes
This page must be fast to scan and search. Prioritize table usability, filtering, and bulk-friendly patterns.

---

## 7.4 RSVP Management

### Purpose
Track all guest responses and preferences.

### Features
- live RSVP status
- confirmed / declined / pending
- actual attending member count
- liquor preference
- meal preference
- special notes
- last updated time

### Dashboard summaries
- attending guests
- actual people attending
- total pending
- total declines
- liquor yes/no totals
- special requests count

### Actions
- view response details
- contact guest
- mark manually if needed
- resend invite link

### Important business rule
Guests can update RSVP multiple times.  
The system should always keep the **latest response**.

### UX notes
Provide a summary bar at the top, then filters, then detailed table.

---

## 7.5 Invitation Website Editor

### Purpose
Allow couples to control invitation content.

### Content areas
- hero title
- couple names
- intro message
- event details
- venue info
- story section
- RSVP section text
- special note section

### Features
- edit text blocks
- preview changes
- save draft
- publish updates

### UX notes
Show content editing on left and preview on right for desktop.  
On mobile, use stacked editor and preview tabs.

---

## 7.6 Section Visibility Controls

### Purpose
Let couples decide which public sections appear.

### Toggles
- Loading Screen
- Envelope / Cover Screen
- Countdown
- Agenda
- RSVP
- Gallery
- Table Finder
- Guest Preview
- Story Section
- Music
- Special Message
- Venue Map

### UX notes
Use switch toggles with short descriptions.
Example:

- Show Gallery  
  _Display your image gallery on the invitation website_

---

## 7.7 Theme & Design

### Purpose
Customize invitation appearance.

### Design controls
- primary color
- secondary color
- accent color
- surface color
- template/theme preset
- font style preset later

### Suggested theme presets
- Blush Gold
- Ivory Rose
- Lavender Bloom
- Sage Elegance
- Midnight Classic

### UX notes
Use palette swatches with preview cards.  
Live preview is important.

---

## 7.8 Gallery Manager

### Purpose
Manage invitation imagery.

### Types of images
- hero image
- side banner image
- RSVP section image
- gallery images
- couple story images

### Features
- upload
- reorder
- replace
- remove
- choose cover
- compress images automatically

### Rules
- trial plans may have image limits
- premium may unlock more images

### UX notes
Use drag-and-drop grid layout with upload cards.

## Assets & Mockups

The `Couple Dashboard/` folder contains exported UI mockups for the Couple Admin Dashboard. Use these when implementing or reviewing UI:

- Overview and dashboard screens: Couple Dashboard/200.png
- Guests and RSVP views: Couple Dashboard/201.png, Couple Dashboard/202.png
- Invitation editor and preview: Couple Dashboard/203.png, Couple Dashboard/204.png
- Theme & design controls: Couple Dashboard/205.png
- Tables & seating: Couple Dashboard/206.png
- Budget and checklist: Couple Dashboard/207.png, Couple Dashboard/208.png
- Gallery manager and media uploads: Couple Dashboard/209.png
- Additional screens: Couple Dashboard/210.png, Couple Dashboard/211.png, Couple Dashboard/212.png, Couple Dashboard/213.png, Couple Dashboard/214.png
 - Overview and dashboard screens: Couple Dashboard/couple-overview.png
 - Guests and RSVP views: Couple Dashboard/couple-guests-list.png, Couple Dashboard/couple-guest-card.png
 - Invitation editor and preview: Couple Dashboard/couple-invitation-editor.png, Couple Dashboard/couple-invitation-preview.png
 - Theme & design controls: Couple Dashboard/couple-theme-controls.png
 - Tables & seating: Couple Dashboard/couple-tables-seating.png
 - Budget and checklist: Couple Dashboard/couple-budget.png, Couple Dashboard/couple-checklist.png
 - Gallery manager and media uploads: Couple Dashboard/couple-gallery-manager.png
 - Additional screens: Couple Dashboard/couple-notifications.png, Couple Dashboard/couple-settings.png, Couple Dashboard/couple-agenda.png, Couple Dashboard/couple-seating-assistant.png, Couple Dashboard/couple-advanced-views.png

Add these image files as visual references in implementation tickets and link them from UI tasks.
---

## 7.9 Music Settings

### Purpose
Control invitation website background music.

### Features
- enable / disable music
- select calm MP3 track
- upload track later if premium
- preview music
- mute by default option
- start after guest clicks “Open Invitation”

### UX notes
Never autoplay before interaction.  
Show short helper text to explain browser limitation.

---

## 7.10 Agenda / Timeline

### Purpose
Manage wedding schedule shown on invitation page.

### Features
- add agenda event
- title
- time
- duration
- description
- icon
- event order
- edit / delete / reorder

### Example events
- Registration
- Ceremony
- Lunch
- Reception
- First Dance
- Departure

### UX notes
Use timeline builder with cards and drag handle for ordering.

---

## 7.11 Table Assignment

### Purpose
Plan seating and help guests find tables.

### Features
- create table
- set table name or number
- set capacity
- assign guests
- move guests between tables
- search guests
- detect over-capacity
- public “Find My Table” support

### Views
- table list view
- simple allocation board
- future drag-and-drop seating map

### UX notes
Start simple. Do not overbuild a visual floor plan in MVP.

---

## 7.12 Budget Planner

### Purpose
Track wedding spending.

### Features
- estimated budget
- actual spending
- paid amount
- due amount
- category-based expenses
- add custom items
- predefined suggested expense categories
- notes
- totals and warnings

### Suggested categories
- Venue
- Catering
- Photography
- Videography
- Decor
- Dress
- Makeup
- Cake
- Jewelry
- Music
- Transport
- Liquor
- Gifts
- Other

### Dashboard stats
- total estimated
- total actual
- total paid
- remaining amount
- over-budget alert

### UX notes
Show category list + summary panel. Use visual charts lightly.

---

## 7.13 Checklist / Task List

### Purpose
Help couples stay organized.

### Features
- default wedding planning tasks
- grouped by timeline
- add custom task
- mark complete
- edit and delete tasks
- progress tracking
- due dates
- priority tags

### Suggested timeline groups
- 4 months before
- 3 months before
- 2 months before
- 1 month before
- 1 week before
- wedding day
- after wedding

### UX notes
This should feel motivating, not overwhelming. Progress bars help.

---

## 7.14 Vendor Management

### Purpose
Organize and discover wedding vendors.

### Features
- view saved vendors
- add custom vendor
- browse marketplace later
- vendor category
- contact info
- quote notes
- booking status
- budget link

### Categories
- Venue
- Catering
- Photography
- Decor
- Makeup
- Music
- Cake
- Jewelry
- Transport

### Actions
- add vendor
- mark booked
- update notes
- contact vendor
- remove vendor

---

## 7.15 Account / Subscription Settings

### Purpose
Manage account-level preferences.

### Features
- account details
- change password
- plan/trial status
- trial remaining days
- feature limits
- delete wedding request
- support links

---

# 8. Key Page Structure Recommendations

---

## 8.1 Dashboard Overview Page Layout

### Top area
- welcome title
- wedding date badge
- trial badge
- preview invitation button

### Main content
- KPI grid
- recent activity section
- quick actions section
- countdown and progress panel

---

## 8.2 Guest Page Layout

### Top area
- title
- add guest button
- import button later

### Middle area
- filters
- search
- tabs for Bride Side / Groom Side / All

### Main content
- guest table

---

## 8.3 RSVP Page Layout

### Top area
- summary chips
- RSVP rate progress bar

### Main content
- detailed response table
- preference columns
- resend actions

---

## 8.4 Invitation Editor Layout

### Desktop
- left: controls
- right: live preview

### Mobile
- top tabs: Edit / Preview

---

## 8.5 Budget Page Layout

### Top area
- budget summary cards

### Main content
- category breakdown
- item list
- add expense modal

---

# 9. Core Flow Scenarios

---

## Scenario 1 — Couple First Login After Setup

1. Couple signs in
2. Lands on dashboard overview
3. Sees empty state cards and quick actions
4. Clicks “Add Guest”
5. Starts building guest list

---

## Scenario 2 — Couple Adds Guest and Sends Invite

1. Couple opens Guests
2. Clicks Add Guest
3. Enters:
   - name
   - side
   - WhatsApp
   - family limit
4. System creates guest record
5. Unique invite link generated
6. Couple clicks WhatsApp send
7. Guest receives invitation link

---

## Scenario 3 — Couple Tracks RSVP Changes

1. Guest updates RSVP
2. Couple opens RSVP page
3. Sees updated counts
4. Opens response detail
5. Uses information for headcount and planning

---

## Scenario 4 — Couple Edits Invitation Website

1. Couple opens Invitation Editor
2. Updates intro message and event details
3. Goes to Theme & Design
4. Changes palette
5. Hides Gallery section
6. Clicks Preview Invitation
7. Public page reflects latest changes

---

## Scenario 5 — Couple Plans Tables

1. Couple opens Tables
2. Creates tables with capacities
3. Assigns confirmed guests
4. System warns if over capacity
5. Public invitation “Find My Table” becomes useful

---

## Scenario 6 — Couple Manages Budget

1. Couple opens Budget page
2. Adds estimated items
3. Updates actual payments over time
4. Checks remaining total
5. Sees over-budget warnings

---

## Scenario 7 — Couple Uses Checklist

1. Couple opens Checklist
2. Sees default planning tasks
3. Marks completed tasks
4. Adds custom reminder
5. Progress increases on overview dashboard

---

## Scenario 8 — Couple Adds Vendor

1. Couple opens Vendors
2. Adds vendor manually or from marketplace later
3. Adds contact and notes
4. Marks vendor as booked
5. Links cost to budget if needed

---

# 10. Database Design Overview (Couple Dashboard Scope)

This section describes the main database areas the Couple Admin Dashboard relies on.

---

## Core tables

### users
- id
- full_name
- email
- password_hash
- role
- status
- created_at
- updated_at

### weddings
- id
- user_id
- groom_first_name
- bride_first_name
- event_date
- venue_name
- slug
- setup_completed
- estimated_guests
- estimated_budget
- created_at
- updated_at

### wedding_site_settings
- id
- wedding_id
- site_title
- section toggles
- colors
- music settings
- created_at
- updated_at

---

## Guest and RSVP tables

### guests
- id
- wedding_id
- name
- side
- whatsapp_country_code
- whatsapp_number
- email
- invitation_type
- max_allowed_members
- note
- invite_token
- created_at
- updated_at

### guest_rsvps
- id
- guest_id
- status
- attending_count
- special_note
- liquor_preference
- meal_preference
- updated_at

### guest_rsvp_members
- id
- guest_rsvp_id
- member_name
- type_optional

---

## Invitation content tables

### wedding_content_blocks
- id
- wedding_id
- block_key
- title
- content
- visible
- sort_order

### wedding_gallery_images
- id
- wedding_id
- image_type
- image_url
- sort_order

### wedding_agenda_items
- id
- wedding_id
- title
- event_time
- duration_minutes
- description
- icon_key
- sort_order

---

## Seating tables

### wedding_tables
- id
- wedding_id
- table_name
- capacity
- sort_order

### wedding_table_assignments
- id
- wedding_table_id
- guest_id
- assigned_count

---

## Budget tables

### budget_categories
- id
- wedding_id nullable for defaults
- name
- is_default

### budget_items
- id
- wedding_id
- category_id
- title
- estimated_amount
- actual_amount
- paid_amount
- note
- due_date
- status

---

## Checklist tables

### checklist_groups
- id
- wedding_id
- title
- sort_order

### checklist_items
- id
- wedding_id
- group_id
- title
- description
- is_completed
- due_date
- priority

---

## Vendor tables

### wedding_vendors
- id
- wedding_id
- vendor_profile_id nullable
- custom_name
- category
- phone
- whatsapp
- email
- note
- status

---

# 11. API Requirements (Couple Dashboard Scope)

---

## Wedding
- GET /api/v1/weddings/current
- PUT /api/v1/weddings/current

## Guests
- GET /api/v1/guests
- POST /api/v1/guests
- PUT /api/v1/guests/:id
- DELETE /api/v1/guests/:id

## RSVP
- GET /api/v1/rsvps
- GET /api/v1/rsvps/:guestId

## Invitation settings
- GET /api/v1/site-settings
- PUT /api/v1/site-settings

## Content blocks
- GET /api/v1/wedding-content
- PUT /api/v1/wedding-content/:blockKey

## Gallery
- GET /api/v1/gallery
- POST /api/v1/gallery
- DELETE /api/v1/gallery/:id
- PUT /api/v1/gallery/reorder

## Agenda
- GET /api/v1/agenda
- POST /api/v1/agenda
- PUT /api/v1/agenda/:id
- DELETE /api/v1/agenda/:id

## Tables
- GET /api/v1/tables
- POST /api/v1/tables
- PUT /api/v1/tables/:id
- DELETE /api/v1/tables/:id
- POST /api/v1/tables/assign

## Budget
- GET /api/v1/budget/items
- POST /api/v1/budget/items
- PUT /api/v1/budget/items/:id
- DELETE /api/v1/budget/items/:id

## Checklist
- GET /api/v1/checklist
- POST /api/v1/checklist/items
- PUT /api/v1/checklist/items/:id
- DELETE /api/v1/checklist/items/:id

## Vendors
- GET /api/v1/wedding-vendors
- POST /api/v1/wedding-vendors
- PUT /api/v1/wedding-vendors/:id
- DELETE /api/v1/wedding-vendors/:id

---

# 12. UI/UX Design System for Couple Dashboard

## Desired feeling
The Couple Dashboard should feel:
- elegant
- modern
- soft premium
- highly usable
- not cold like enterprise software
- not overly decorative

This is a planning workspace, so beauty and clarity must coexist.

---

# 13. Color System Recommendation

The dashboard should be softer than a typical SaaS admin panel.

## Suggested palette direction

### Base background
- `#FAF7F5`
- `#F8F3F0`

### Surface cards
- `#FFFFFF`

### Primary accent
- `#C45A74` (rose)
or
- `#B86A7A` (dusty rose)

### Secondary accent
- `#D8B48A` (champagne gold)

### Support accent
- `#8FA98F` (sage green)

### Text primary
- `#201A18`

### Text secondary
- `#7D6F6A`

### Borders
- `#E8DDD7`

### Success
- `#4F8A5B`

### Warning
- `#E6A23C`

### Danger
- `#D95C5C`

## Usage guidance
- use rose/champagne for primary identity
- use sage for positive states
- keep backgrounds very light
- avoid oversaturated colors

---

# 14. Typography Recommendation

## Headings
Elegant serif or premium display serif for top-level page titles only.

## Body and interface text
Use a clean sans-serif.

## Best combination
- Page titles: refined serif
- Cards, tables, forms: modern sans-serif

This gives emotional warmth while keeping usability high.

---

# 15. Layout and Visual Style

## Layout style
- left sidebar
- top header
- card-based content
- generous spacing
- rounded corners
- soft shadows
- subtle layered depth

## UI elements
- pill badges
- soft border inputs
- segmented tabs
- progress bars
- stat cards
- sticky page action bars where useful

---

# 16. Modern Transitions and Motion Design

Motion should feel:
- calm
- premium
- purposeful
- lightweight

---

## Recommended interaction transitions
- hover lift on cards
- fade/slide in panels
- tab switch transitions
- modal open scale + fade
- sidebar hover and active state motion
- button press feedback

## Timing
- micro interactions: 150–200ms
- panel/modal transitions: 220–320ms
- page transition: 250–400ms

---

# 17. Scroll Effects Recommendation

The Couple Dashboard should use **minimal scroll effects** compared with the Public Web.

## Good uses
- sticky subheaders
- subtle section reveal on first load
- lazy loading for long tables
- smooth internal scrolling
- sticky summary bars in budget/checklist pages

## Avoid
- decorative parallax
- dramatic scroll animations
- excessive motion in tables/forms

---

# 18. Animation Suggestions by Module

## Overview
- KPI counters animate on first load
- recent activity fades in

## Invitation Editor
- live preview updates softly
- section toggles animate collapse/expand

## Gallery
- upload success animation
- reorder feedback

## Checklist
- task check complete animation
- progress bar smooth update

## Tables
- assignment chips animate movement lightly

---

# 19. Responsive Design Rules

The Couple Dashboard must work on:
- desktop
- tablet
- mobile

## Desktop
Full sidebar + multi-column layout

## Tablet
Condensed sidebar + 2-column pages where possible

## Mobile
Bottom or drawer navigation + stacked cards + sticky quick actions

## Priority on mobile
- guest add
- RSVP review
- checklist progress
- budget quick edits
- preview invite

---

# 20. Empty States

The dashboard will often start empty.

You must design clear empty states for:
- no guests
- no agenda
- no budget items
- no tasks completed
- no vendors
- no gallery uploaded

Each empty state should have:
- simple illustration or icon
- one sentence explanation
- one main CTA

---

# 21. Notifications and Feedback

## Use for
- guest added successfully
- invitation updated
- settings saved
- budget item added
- task completed
- image upload failed
- table over capacity warning

## Style
Use toast notifications with soft colors and short language.

---

# 22. Performance Considerations

As a Senior Software Engineer, I would prioritize:

- fast dashboard load
- SSR or optimized client fetching where needed
- pagination for large guest lists
- image optimization
- optimistic UI for simple edits
- caching for stable settings
- batched updates where useful

---

# 23. Security Considerations

- couple role only
- strict wedding ownership checks
- signed invite token generation
- input validation
- rate limiting on mutation endpoints
- audit trail later for key changes
- secure upload validation

---

# 24. Deployment and Technical Boundary

The Couple Dashboard should be its own protected app surface.

## Suggested domain strategy
- `app.domain.com` → Couple Dashboard
- `domain.com/w/:slug` → Public invitation
- `admin.domain.com` → Super Admin
- `vendor.domain.com` → Vendor Dashboard

This gives clean separation.

---

# 25. MVP Scope for Couple Dashboard

Build first:

1. Overview
2. Wedding Settings
3. Guest Management
4. RSVP Management
5. Invitation Editor basic
6. Section Visibility Toggles
7. Theme colors
8. Agenda
9. Budget basic
10. Checklist basic

Build later:
- advanced table assignment
- advanced vendor workflows
- analytics deep dive
- exports
- collaboration access

---

# 26. Future Enhancements

- collaborative couple accounts
- activity timeline
- AI guest insights
- automatic liquor estimation
- budget forecasting
- vendor quote comparison
- WhatsApp send tracking
- template version history
- reusable wedding presets

---

# 27. Final Summary

The Couple Admin Dashboard is the **operational heart** of the platform.

It must combine:
- planning tools
- guest management
- design customization
- operational tracking
- wedding experience control

It should feel:
- beautiful
- structured
- premium
- calm
- easy to use
- trustworthy

From a software perspective, it should be:
- modular
- API-first
- secure
- scalable
- state-consistent

From a UI/UX perspective, it should be:
- emotionally warm
- task-efficient
- easy to learn
- highly visual
- mobile-friendly

This is the correct direction for a modern, production-ready Couple Admin Dashboard.
# Couple Invitation Website — Full Product, UX, and Technical Plan

## Perspective
This document is written as:
- Senior Software Engineer
- Software Architect
- Senior UI/UX Designer

It defines the **Couple Invitation Website** — the public-facing digital wedding experience automatically generated for each couple.

---

# 1. Purpose of the Invitation Website

The **Invitation Website** is a **public, shareable, and emotional experience**.

It is not a dashboard.  
It is not an admin panel.

It is a **digital wedding invitation + guest interaction layer**.

## Main Goals
- replace traditional paper invitations
- provide a beautiful digital experience
- allow guests to RSVP easily
- present wedding details clearly
- support emotional storytelling
- provide interactive features (table finder, gallery, etc.)

---

# 2. Core Experience Philosophy

## Emotional Goals
- warm
- romantic
- elegant
- memorable
- immersive

## Functional Goals
- fast loading
- mobile-first
- simple interaction
- no login required
- clear call-to-actions

---

# 3. Entry Flow (Guest Experience)

## Scenario: Guest Opens Invitation

1. Guest clicks link (WhatsApp / SMS / Email)
2. Opens URL: `/w/:slug` or `/invite/:slug`
3. Sees **Loading Screen**
4. Transitions to **Envelope / Cover Screen**
5. Clicks **Open Invitation**
6. Enters full invitation website
7. Scrolls through sections
8. Submits RSVP
9. Optionally finds table, views gallery, etc.

---

# 4. Invitation Website Architecture

## Route Structure
/w/:slug
/rsvp/:token


- `/w/:slug` → main invitation
- `/rsvp/:token` → optional direct RSVP entry

---

# 5. Main Sections of Invitation Website

---

## 5.1 Loading Screen

### Purpose
Create anticipation and premium feel.

### Content
- couple initials or icon
- subtle animation
- loading indicator

### UX Notes
- keep under 2 seconds
- smooth fade transition

---

## 5.2 Envelope / Cover Screen

### Purpose
Simulate real invitation opening experience.

### Content
- “You are invited”
- couple names
- event date (optional)
- open button

### Interaction
- click “Open Invitation”
- triggers:
  - page animation
  - music start (if enabled)

---

## 5.3 Hero Section

### Purpose
Immediate emotional impact.

### Content
- couple names (large)
- date
- short tagline
- background image/video

### Optional
- animated text
- parallax background

---

## 5.4 Invitation Message

### Purpose
Formal or emotional message.

### Content
- invitation text
- family message (optional)

---

## 5.5 Wedding Details

### Content
- date
- time
- venue name
- map link
- dress code (optional)

---

## 5.6 Countdown Timer

### Purpose
Create excitement.

### Content
- days
- hours
- minutes

### Behavior
- auto-updating

---

## 5.7 Agenda / Timeline

### Purpose
Show event flow.

### Content
- event title
- time
- description
- icons

---

## 5.8 RSVP Section

### Purpose
Collect guest response.

### Flow
1. identify guest (token or name)
2. select attending/not attending
3. choose number of attendees
4. add family members
5. submit

### Additional fields
- liquor preference
- meal preference
- notes

---

## 5.9 Find My Table

### Purpose
Help guests locate seating.

### Flow
- enter name
- system shows table

---

## 5.10 Gallery Section

### Purpose
Show couple memories.

### Content
- images grid
- slideshow optional

---

## 5.11 Guest Preview / Attendees

### Purpose
Show community aspect.

### Content
- list of confirmed guests
- optional avatars

---

## 5.12 Special Message / Notes

Optional:
- thank you message
- instructions

---

## 5.13 Footer

### Content
- contact info
- thank you
- credits (optional)

---

# 6. Section Visibility Control

Each section should be toggleable from dashboard.

## Toggles
- cover screen
- countdown
- agenda
- RSVP
- gallery
- table finder
- guest preview
- music

---

# 7. User Flow Scenarios

---

## Scenario 1 — Guest Opens Invite

1. open link
2. sees loading
3. opens envelope
4. enters site
5. scrolls content

---

## Scenario 2 — Guest Submits RSVP

1. clicks RSVP
2. selects status
3. chooses attendee count
4. submits
5. sees confirmation

---

## Scenario 3 — Guest Updates RSVP

1. reopens link
2. edits response
3. submits updated info

---

## Scenario 4 — Guest Finds Table

1. scrolls to table finder
2. enters name
3. sees assigned table

---

# 8. Database Design (Invitation Scope)

---

## weddings
- id
- slug
- names
- date
- venue

---

## wedding_site_settings
- section toggles
- colors
- music

---

## guests
- name
- side
- max members

---

## rsvps
- status
- attending count
- preferences

---

## gallery_images
- image_url
- type

---

## agenda_items
- title
- time
- description

---

## tables
- table name
- capacity

---

# 9. API Requirements

---

## Public APIs

- GET /weddings/:slug
- GET /weddings/:slug/content
- GET /weddings/:slug/settings

---

## RSVP APIs

- POST /rsvp
- GET /rsvp/:token
- PUT /rsvp/:token

---

## Table Finder

- POST /tables/find

---

# 10. UI/UX Design System

---

## Design Style

The invitation must feel:

- romantic
- elegant
- luxurious
- emotional
- minimal

## Assets & Mockups

The `invitation Page/` folder contains the exported invitation mockups used for the public-facing flows:

- Loading & cover screens: invitation Page/Invitation 1st Loading.png
- Sample invitation layout: invitation Page/40.png
 - Loading & cover screens: invitation Page/invitation-loading-cover.png
 - Sample invitation layout: invitation Page/invitation-sample-layout.png

Reference these images when implementing the guest entry flow and cover animations.

---

## Color System

### Base
- Ivory (#FCF8F6)
- White (#FFFFFF)

### Primary
- Rose (#C45A74)

### Accent
- Gold (#C9A574)

### Secondary
- Sage (#8FA98F)

### Text
- Dark (#201A18)
- Soft (#7D6F6A)

---

## Typography

### Headings
- elegant serif

### Body
- clean sans-serif

---

# 11. Motion and Animation

---

## Principles
- smooth
- subtle
- emotional

---

## Use Cases

- fade-in sections
- slide-up content
- envelope opening animation
- countdown tick
- hover effects
- button press feedback

---

## Timing
- 150–300ms interactions
- 300–500ms transitions

---

# 12. Scroll Effects

---

## Use

- section reveal
- parallax hero
- timeline animation
- gallery fade-in

---

## Avoid

- heavy motion
- performance-heavy effects

---

# 13. Performance Considerations

- image compression
- lazy loading images
- minimal JS
- mobile-first optimization
- CDN delivery

---

# 14. Security Considerations

- token-based RSVP access
- rate limiting
- input validation
- spam protection

---

# 15. Responsive Design

---

## Mobile First

### Mobile
- stacked sections
- large buttons
- simple interactions

### Tablet
- balanced layout

### Desktop
- richer visuals
- larger hero

---

# 16. MVP Scope

---

## Build First

- loading screen
- envelope screen
- hero section
- wedding details
- RSVP basic
- countdown
- simple gallery

---

## Build Later

- table finder
- guest preview
- advanced animations
- video backgrounds

---

# 17. Future Enhancements

- AI RSVP insights
- custom animations
- multi-event invitations
- guest messaging
- interactive maps

---

# 18. Final Summary

The Invitation Website is:

- the emotional front of the platform
- the guest interaction layer
- the visual identity of the wedding

It must balance:
- beauty
- clarity
- performance
- usability

This ensures:
- high engagement
- smooth RSVP experience
- memorable digital invitation



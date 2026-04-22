# Vendor Admin Dashboard — Full Product, UX, and Technical Plan

## Perspective
This document is designed from:
- Senior Software Engineer
- Software Architect
- Senior UI/UX Designer

It defines the **Vendor Admin Dashboard**, the platform where vendors manage and promote their wedding-related services.

---

# 1. Purpose of Vendor Admin Dashboard

The **Vendor Dashboard** is a **business management + promotion tool** for vendors.

It allows vendors to:
- create and manage their business profile
- showcase services and portfolio
- receive visibility from couples
- manage inquiries (future)
- improve discoverability

---

# 2. Core Goals

## Business Goals
- attract vendors to the platform
- create a marketplace ecosystem
- enable vendor promotion
- support monetization (future premium listings)

## Vendor Goals
- showcase services professionally
- reach potential couples
- manage profile easily
- build credibility

---

# 3. Primary User Type

## Vendor
A business or individual offering wedding services such as:
- photography
- catering
- decoration
- makeup
- music
- transport
- cake
- venue
- etc.

---

# 4. Design Principles

## Engineering
- modular
- scalable vendor system
- secure access
- optimized for profile data

## UX
- simple profile management
- visually appealing showcase
- low friction editing
- mobile-friendly
- minimal complexity

---

# 5. Main Information Architecture

The Vendor Dashboard should include:

1. Overview Dashboard
2. Vendor Profile
3. Gallery / Portfolio
4. Services & Packages
5. Contact & Social Info
6. Visibility & Status
7. Subscription / Plan (future)
8. Account Settings

---

# 6. Navigation Structure

## Sidebar

- Overview
- Profile
- Gallery
- Services
- Contact Info
- Visibility
- Settings

## Header

- vendor name
- profile completion %
- status badge (approved / pending)
- account menu

---

# 7. Module Breakdown

---

## 7.1 Overview Dashboard

### Purpose
Quick summary of vendor presence.

### Includes
- profile completion %
- approval status
- number of services
- number of gallery images
- visibility status

### Future
- inquiry count
- views
- engagement metrics

---

## 7.2 Vendor Profile

### Purpose
Core business identity.

### Fields
- business name
- category (photography, catering, etc.)
- description
- location
- coverage area
- years of experience
- price range indicator

### UX
- structured form
- character limits
- preview card

---

## 7.3 Gallery / Portfolio

### Purpose
Showcase work visually.

### Features
- upload images
- reorder images
- delete images
- mark featured images

### Types
- portfolio images
- highlight images

### UX
- grid layout
- drag-and-drop upload
- preview modal

---

## 7.4 Services & Packages

### Purpose
Explain offerings clearly.

### Features
- add service
- add package details
- include pricing notes
- descriptions

### Fields
- service title
- description
- optional pricing
- package breakdown

---

## 7.5 Contact & Social Info

### Purpose
Allow couples to contact vendors.

### Fields
- phone number
- WhatsApp
- email
- website
- Instagram
- Facebook
- map location

---

## 7.6 Visibility & Status

### Purpose
Control public visibility.

### Features
- public / private toggle
- approval status
- featured status (admin-controlled)

### Status types
- pending
- approved
- rejected
- blocked

---

## 7.7 Account Settings

### Features
- update account details
- change password
- notification preferences (future)
- delete account

---

# 8. User Flow Scenarios

---

## Scenario 1 — Vendor Signup

1. vendor registers
2. selects vendor role
3. logs in
4. redirected to dashboard
5. starts profile setup

---

## Scenario 2 — Profile Setup

1. vendor fills business info
2. uploads images
3. adds services
4. adds contact details
5. submits profile
6. waits for approval

---

## Scenario 3 — Vendor Updates Profile

1. logs in
2. edits services or gallery
3. saves changes
4. updates reflect immediately (if approved)

---

## Scenario 4 — Vendor Visibility

1. vendor toggles profile visibility
2. system reflects public visibility
3. admin may override

---

## Scenario 5 — Vendor Adds Portfolio

1. vendor uploads images
2. arranges order
3. marks highlights
4. saves changes

---

# 9. Database Design

---

## vendors
- id
- user_id
- business_name
- category
- description
- location
- coverage_area
- experience_years
- price_range
- status
- is_visible
- created_at

---

## vendor_gallery
- id
- vendor_id
- image_url
- is_featured
- sort_order

---

## vendor_services
- id
- vendor_id
- title
- description
- price_note

---

## vendor_contacts
- id
- vendor_id
- phone
- whatsapp
- email
- website
- instagram
- facebook
- location_link

---

# 10. API Requirements

---

## Vendor APIs

- GET /vendor/profile
- POST /vendor/profile
- PUT /vendor/profile

- GET /vendor/gallery
- POST /vendor/gallery
- DELETE /vendor/gallery/:id

- GET /vendor/services
- POST /vendor/services
- PUT /vendor/services/:id
- DELETE /vendor/services/:id

- GET /vendor/contact
- PUT /vendor/contact

- PUT /vendor/visibility

---

# 11. UI/UX Design System

---

## Design Direction

Vendor dashboard should feel:
- professional
- clean
- business-focused
- slightly creative (portfolio-driven)

---

## Color System

### Background
- #F8FAFC

### Primary
- #6366F1 (indigo)

### Secondary
- #8B5CF6 (violet)

### Accent
- #10B981 (green)

### Text
- #1F2937

---

## Typography

- clean sans-serif
- bold headings for clarity

---

## Layout

- sidebar + header
- card-based sections
- form-driven pages
- gallery grid

---

# 12. Transitions & Animations

---

## Use

- image upload animation
- hover effects on cards
- button feedback
- modal transitions

---

## Duration
- 150–250ms

---

## Avoid
- heavy motion
- decorative animations

---

# 13. Scroll Effects

---

## Use
- smooth scrolling
- lazy load images
- sticky headers

---

## Avoid
- parallax
- heavy animations

---

# 14. Responsive Design

---

## Mobile
- stacked layout
- simplified forms
- large buttons

## Desktop
- grid layouts
- side-by-side editing

---

# 15. Performance Considerations

- optimize images
- limit gallery size
- lazy load images
- compress uploads

---

# 16. Security Considerations

- vendor-only access
- role-based permissions
- input validation
- secure file uploads

---

# 17. MVP Scope

---

## Build first
- vendor signup/login
- profile creation
- gallery upload
- services list
- contact info
- visibility toggle

---

## Later
- inquiries
- analytics
- premium listings
- messaging system

---

# 18. Future Enhancements

- booking system
- review system
- ratings
- analytics dashboard
- featured vendor ranking
- AI recommendations

---

# 19. Final Summary

The Vendor Dashboard is:

- a business profile management system
- a marketing tool for vendors
- a future marketplace component

It must be:
- simple
- visually appealing
- easy to manage
- scalable for marketplace expansion
# Super Admin System — Full Product & Technical Plan

## Perspective
This document is written from:
- Senior Software Engineer
- Software Architect
- Senior UI/UX Designer

---

# 1. Purpose of Super Admin System

The **Super Admin Panel** is the **central control system** of the entire platform.

It is used by:
- Platform owner
- Internal team (optional future)

## Main Goals

- Manage the entire platform
- Control users (couples, vendors)
- Control system behavior
- Manage subscription plans
- Monitor system health and growth
- Manage templates and content
- Handle support and issues

---

# 2. Core Design Principles

## Engineering Principles
- Secure (strict access control)
- Scalable (handle large user base)
- Modular (separate features cleanly)
- Observable (logs, metrics, insights)
- Maintainable (clear structure)

## UX Principles
- Clean and minimal (not cluttered)
- Fast decision-making UI
- Data-first layout (dashboards)
- Clear hierarchy
- No confusion (admin should act quickly)

---

# 3. Access Rules

## Only one Super Admin (initially)
- Single account with full access
- Later: role-based internal admin system possible

## Authentication
- Strong password required
- Optional:
  - 2FA (recommended later)
  - IP restriction (optional)

---

# 4. Super Admin Main Modules

---

## 4.1 Dashboard Overview

### Purpose
Quick system health and insights.

### Metrics to show

- Total Couples
- Active Weddings
- Active Trials
- Expired Trials
- Vendors Registered
- Active Vendors
- Total Invitations Created
- Daily Signups
- RSVP activity (optional)

### Visual components

- KPI cards
- Line charts (growth)
- Bar charts (usage)
- Pie charts (user distribution)

### UX Notes
- Clean grid layout
- Quick glance insights
- No unnecessary details

---

## 4.2 Couple Management

### Purpose
Manage all couple accounts.

### Features

- View all couples
- Search by:
  - name
  - email
  - wedding slug
- Filter:
  - active
  - trial
  - expired
- View wedding details
- View guest count
- View RSVP stats (basic)
- Activate / Deactivate account
- Delete account

### Actions

- Suspend user
- Reactivate user
- Force delete
- Reset trial (optional)

---

## 4.3 Vendor Management

### Purpose
Control vendor ecosystem.

### Features

- View all vendors
- Approve / Reject vendors
- Activate / Deactivate vendor
- Feature vendors (highlight on public site)
- View vendor profiles

### Filters

- category
- status
- location

### Actions

- block vendor
- remove vendor
- promote vendor

---

## 4.4 Template Management

### Purpose
Control invitation designs.

### Features

- Create template
- Edit template
- Upload preview images
- Activate / deactivate template
- Set default template

### Template includes

- layout
- section structure
- style presets
- animation presets

---

## 4.5 Plan & Subscription Management

### Purpose
Control business model.

### Features

- Define plans:
  - Free Trial
  - Basic
  - Premium
- Set limits:
  - guest count
  - gallery size
  - features enabled
- Modify pricing
- Enable/disable features

### Trial rules

- 7 days trial
- 3-day grace period
- auto-delete logic

---

## 4.6 Trial & Data Cleanup System

### Purpose
Maintain system health.

### Features

- View expired trials
- Auto-delete inactive accounts
- Manual delete option
- Logs of deletions

---

## 4.7 Content Management (Public Web CMS)

### Purpose
Control marketing content.

### Manage:

- Home page content
- Features page
- Pricing content
- FAQ
- Testimonials
- Templates preview

---

## 4.8 Reports & Analytics

### Purpose
Understand platform usage.

### Reports

- user growth
- active weddings
- RSVP usage
- feature usage
- conversion rates

---

## 4.9 System Settings

### Purpose
Global platform control.

### Settings

- branding
- default colors
- system emails
- support contacts
- global feature toggles

---

## 4.10 Support & Logs

### Purpose
Debug and assist users.

### Features

- view errors/logs
- search logs
- user activity tracking
- contact inquiries

---

# 5. Super Admin User Flow Scenarios

---

## Scenario 1 — Monitor System Health

1. Admin logs in
2. Views dashboard
3. Checks:
   - new users
   - trial usage
   - growth metrics
4. Takes no action or proceeds to specific modules

---

## Scenario 2 — Manage a Couple

1. Admin opens Couple Management
2. Searches user
3. Views wedding data
4. Takes action:
   - suspend
   - delete
   - review

---

## Scenario 3 — Approve Vendor

1. Admin opens Vendor Management
2. Views pending vendor
3. Reviews profile
4. Approves or rejects

---

## Scenario 4 — Update Pricing Plan

1. Admin opens Plan Management
2. Edits limits/prices
3. Saves changes
4. System updates behavior

---

## Scenario 5 — Cleanup Expired Trials

1. Admin opens Trial Management
2. Views expired users
3. Deletes or runs auto cleanup

---

# 6. Super Admin Database Design

---

## Tables Needed

### users
- role = super_admin, couple, vendor

---

### weddings
- linked to users

---

### subscription_trials
- trial tracking

---

### vendors
- vendor profiles

---

### invitation_templates
- template storage

---

### system_settings
- global configs

---

### logs
- system logs

---

### contact_inquiries
- user messages

---

### faqs
- public FAQs

---

### testimonials
- public reviews

---

# 7. API Requirements

---

## Admin APIs

- GET /admin/dashboard
- GET /admin/users
- PUT /admin/users/:id
- DELETE /admin/users/:id

- GET /admin/vendors
- PUT /admin/vendors/:id

- GET /admin/templates
- POST /admin/templates
- PUT /admin/templates/:id

- GET /admin/plans
- PUT /admin/plans

- GET /admin/trials
- DELETE /admin/trials/:id

---

# 8. UI/UX Design System

---

## Design Direction

Admin panel should feel:

- modern
- clean
- efficient
- professional
- not emotional (unlike public web)

---

## Color System

### Background
- #F8FAFC (light neutral)

### Sidebar
- #0F172A (dark navy)

### Primary
- #6366F1 (indigo)

### Success
- #10B981

### Warning
- #F59E0B

### Danger
- #EF4444

---

## Typography

- Headings: strong sans-serif
- Body: clean readable font
- No decorative fonts

---

## Layout

- Left sidebar navigation
- Top header bar
- Content area
- Cards and tables

---

# 9. Transitions & Animations

---

## Principles

- fast
- minimal
- functional

---

## Use for

- table row hover
- button hover
- modal open/close
- sidebar collapse
- page transitions

---

## Avoid

- heavy animations
- emotional effects
- slow transitions

---

## Duration

- 150ms–250ms for UI interactions

---

# 10. Scroll Behavior

---

## Use

- sticky headers
- lazy loading tables
- infinite scroll (optional)

---

## Avoid

- parallax
- decorative scroll effects

---

# 11. Component Structure

---

## Components

- Sidebar
- Header
- KPI Card
- Table
- Filters
- Modal
- Form
- Tabs
- Charts

---

# 12. Security Requirements

---

## Must include

- role-based access control
- JWT validation
- secure routes
- input validation
- rate limiting
- audit logs

---

# 13. Deployment Strategy

---

## Suggested domains

- admin.domain.com → Super Admin
- app.domain.com → Couple Dashboard
- domain.com → Public Web
- domain.com/w/:slug → Invitations

---

# 14. MVP Scope for Super Admin

---

## Build first

- login system
- dashboard overview
- couple management
- vendor management
- trial monitoring
- basic settings

---

## Build later

- analytics
- CMS
- template builder
- advanced logs

---

# 15. Future Enhancements

---

- multi-admin roles
- audit trails
- advanced analytics
- AI insights
- notification system
- billing integration

---

# 16. Final Summary

The Super Admin system is:

- the control center of the platform
- responsible for operations, business logic, and monitoring
- designed for speed, clarity, and control
- minimal in design but powerful in functionality

It must prioritize:
- clarity
- performance
- control
- security

This ensures the platform is scalable and maintainable long-term.
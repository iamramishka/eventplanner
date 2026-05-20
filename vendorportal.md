# Vendor Portal — Product & Implementation Notes

## Purpose

The Vendor Portal is the vendor-facing workspace for businesses offering services to couples (venues, photographers, caterers, planners, etc.). It supports vendor onboarding, profile management, service listings, booking interactions, and analytics.

## Scope
- Vendor registration & verification
- Vendor profile & portfolio management
- Service listings and pricing
- Booking and payment integration
- Messaging and notifications
- Vendor dashboard & analytics

## Core Features & Flows

- Registration & onboarding: vendor signs up, submits documents, and awaits Super Admin approval.
- Profile & portfolio: add business details, categories, images, pricing, and contact info.
- Listings: create/edit services, availability, and package options.
- Booking / payments: guests or couples can request quotes or book via payment flows (integrate Stripe/PayPal).
- Dashboard: vendor sees leads, bookings, calendar, earnings, and messages.
- Support & disputes: vendor can contact support; Super Admin can intervene.

## API & Integration Notes

- Public: `GET /vendors`, `GET /vendors/:id`, `GET /vendors/:id/listings`
- Vendor actions: `POST /vendors`, `PUT /vendors/:id`, `DELETE /vendors/:id`
- Approval: `POST /admin/vendors/:id/approve`, `POST /admin/vendors/:id/reject`
- Listings: `POST /vendors/:id/listings`, `PUT /vendors/:id/listings/:lid`, `DELETE /vendors/:id/listings/:lid`
- Bookings/payments: `POST /bookings`, webhooks for payment status, idempotency keys
- File uploads: use signed uploads (S3) for images; validate sizes and types
- Permissions: vendor role scoped tokens; Super Admin privileges separate

## Assets (mockups)

The `Vendor Portal/` folder contains exported UI mockups. Reference these images when implementing screens:

- Vendor overview / listing: Vendor Portal/300.png
- Vendor profile & gallery: Vendor Portal/301.png
- Listing editor: Vendor Portal/302.png
- Booking requests: Vendor Portal/303.png
- Calendar / availability: Vendor Portal/304.png
- Messages / leads: Vendor Portal/305.png
- Analytics / earnings: Vendor Portal/306.png
- Additional screens: Vendor Portal/307.png, Vendor Portal/308.png, Vendor Portal/309.png, Vendor Portal/310.png, Vendor Portal/311.png, Vendor Portal/312.png, Vendor Portal/313.png, Vendor Portal/314.png, Vendor Portal/315.png

## Implementation notes

- Map each mockup to an endpoint and CRUD flow before development.
- Keep uploads outside app server (signed URLs) and validate on upload.
- Super Admin needs moderation UI to approve/reject vendors.

## Embedded Mockup Gallery

Below are inline previews of the Vendor Portal mockups to help with visual review. Click or open the images from the `Vendor Portal/` folder if they don't render in your editor.

![Vendor overview — 300](Vendor Portal/vendor-overview.png)

![Vendor profile & gallery — 301](Vendor Portal/vendor-profile.png)

![Listing editor — 302](Vendor Portal/vendor-listing-editor.png)

![Booking requests — 303](Vendor Portal/vendor-booking-requests.png)

![Calendar / availability — 304](Vendor Portal/vendor-calendar.png)

![Messages / leads — 305](Vendor Portal/vendor-messages.png)

![Analytics / earnings — 306](Vendor Portal/vendor-analytics.png)

![Additional screens — 307](Vendor Portal/vendor-settings.png)

![Additional screens — 308](Vendor Portal/vendor-pricing.png)

![Additional screens — 309](Vendor Portal/vendor-photos-manager.png)

![Additional screens — 310](Vendor Portal/vendor-availability-rules.png)

![Additional screens — 311](Vendor Portal/vendor-inbox-detail.png)

![Additional screens — 312](Vendor Portal/vendor-booking-detail.png)

![Additional screens — 313](Vendor Portal/vendor-payouts.png)

![Additional screens — 314](Vendor Portal/vendor-onboarding-steps.png)

![Additional screens — 315](Vendor Portal/vendor-additional.png)


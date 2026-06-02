# Security Audit — WedPlan v1.0

Date: 2026-05-30
Agent: Security/Ethics Reviewer (Lane 11)
Scope: `web-app/` production Next.js app — API auth, ownership, guest privacy, uploads

---

## Summary

**Overall rating: GOOD** — No critical vulnerabilities in `main`. RBAC is well-implemented. Guest privacy is protected. Upload handling has proper MIME type + size limits.

---

## ✅ Passing Security Controls

### Authentication & RBAC (`src/lib/rbac.ts`)
- `requireRole(roles)` — checks `getServerSession()`, validates role before access
- `requireSuperAdmin()` — gates all `/api/admin/*` routes
- `requireWeddingAccess(weddingId)` — session + role + ownership check for couple resources
- `requireVendorAccess(vendorId)` — session + email ownership check for vendor routes
- Resource helpers: `requireGuestAccess`, `requireRsvpAccess`, `requireBudgetItemAccess`, `requireChecklistItemAccess`, `requireAgendaAccess`, `requireGalleryAccess`, `requireVendorListingAccess`
- All admin routes verified: ✅ `requireSuperAdmin()` on logs, cleanup, couples, vendors, plans, settings

### Guest Privacy (`/api/find-table/[slug]`)
- Returns ONLY: guest first name, table name, wedding public info
- Strips: `assignedGuestIds`, `whatsapp`, `token`, `email`, `rsvpStatus`
- Generic error message for all verification failures (prevents user enumeration)
- Token and name+phone4 verification — no brute force shortcut

### RSVP Token Flow (`/api/rsvp/[token]`)
- Token-scoped access — guests can only see/update their own RSVP
- Honeypot field + too-fast-submit protection
- Bounded guest count validation

### Gallery Upload (`/api/weddings/[weddingId]/gallery`)
- Auth: `requireWeddingAccess` ✅
- MIME type whitelist: jpeg, png, webp, gif only ✅
- File size limit: 5 MB max ✅
- Filename sanitization: strips special chars, limits to 60 chars ✅
- No path traversal possible ✅

### Vendor Registration (`/api/vendors/register`)
- Email format validation, duplicate check (store + Prisma) ✅
- Password hashed with bcrypt (10 rounds) ✅
- Sensitive data not returned in response ✅
- `toPublicVendor()` strips: passwordHash, businessRegDocBase64, businessRegNumber, taxIdNumber ✅

### Vendor Profile Update (`/api/vendors/[id]`)
- Auth: `requireVendorAccess` — session + email ownership ✅
- Field allowlist prevents mass-assignment attacks ✅
- portfolioImages limited to 10, packages limited to 5 ✅
- logoBase64 capped at 1 MB (FIXED this audit) ✅
- coverImageBase64 capped at 5 MB (FIXED this audit) ✅

### Audit Logging
- Admin cleanup, Stripe webhooks, admin CRUD all logged ✅

---

## 🔧 Fixed During This Audit

### Vendor Logo/Cover Base64 — No Size Limit (MEDIUM → FIXED)
- **File**: `web-app/src/app/api/vendors/[id]/route.ts`
- **Issue**: `logoBase64` and `coverImageBase64` in PUT/PATCH had no size validation.
- **Fix**: 1 MB limit for logo, 5 MB limit for cover — returns HTTP 400 if exceeded.

---

## ⚠️ Known Issues (Require Infrastructure — Not Fixed)

### No Rate Limiting on Public Endpoints (MEDIUM)
- `POST /api/vendors/register`, `POST /api/find-table/[slug]`, `POST /api/rsvp/[token]`, `POST /api/auth/[...nextauth]`
- **Risk**: Spam registrations, guest enumeration via brute force, RSVP flooding
- **Fix**: Upstash Redis rate limiter or Next.js middleware with IP-based limits

### In-Memory Stores (HIGH — Production Risk)
- `store.ts`, `vendorStore.ts`, `billingStore.ts` use in-memory storage
- Data resets on server restart — no persistence, no multi-instance safety
- **Fix**: Migrate to Prisma/Postgres before launch

### No Content Security Policy Headers (LOW)
- **Fix**: Add to `next.config.ts` headers config

---

## 🚨 Critical Finding — Billing Branch (NOT in main)

### `guests/route.ts` Missing Auth in `codex/billing-pricing-entitlements`
- GET endpoint returns all guests across ALL weddings without session check
- POST endpoint creates guests without auth
- **Status**: NOT in main — main uses `requireWeddingAccess()` correctly
- **Action**: Billing branch MUST restore auth guard before merging

---

## Production Security Checklist

- [x] RBAC guards on all protected routes
- [x] Guest privacy protected in find-table and RSVP flows
- [x] Gallery upload MIME type + size validated
- [x] Vendor data sanitized before public response
- [ ] Rate limiting on register/auth/find-table/rsvp endpoints
- [ ] Migrate in-memory stores to Postgres
- [ ] Add Content Security Policy headers
- [ ] Set `NEXTAUTH_SECRET` to cryptographically random value in production
- [ ] Rotate all API keys to production credentials
- [ ] Review remaining 18 Dependabot alerts (9 high, 9 moderate — uuid + sentry fixed)

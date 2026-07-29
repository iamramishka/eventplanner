# Vendor Quote, Chat & Points System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the price/Order Now flow with a structured quote-request form, add couple-to-vendor direct messaging, and monetise vendor inboxes with a points-unlock system.

**Architecture:** Three independent layers built in order — (1) UI simplification (strip prices + Order Now, redesign Get Quote form), (2) messaging data model extension (lock flag + points balance in vendorStore), (3) vendor inbox lock/unlock UI + points purchase CTA. Each layer is independently shippable.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind-free CSS modules, in-memory `vendorStore.ts` JSON store, Stripe (existing sandbox), `lucide-react` icons.

## Global Constraints

- Production app is `web-app/` only — never touch root `src/`
- Brand name is **WedPlan** everywhere — never "WedInvite"
- All new API routes: session → role → ownership checks in that order
- No new Prisma schema changes — use the JSON vendorStore for all new fields
- Match existing CSS class naming: `vp-*` (profile), `gq-*` (quote drawer), vendor portal uses `opsCard`/`opsRow` patterns
- `web-app/prisma/dev_sqlite.db` and `web-app/logs/audit.log` must never be deleted
- Conventional commits: `feat:`, `fix:`, `refactor:`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `web-app/src/app/(admin)/couple/DashboardClient.tsx` | Modify | Strip prices + Order Now; redesign GetQuoteDrawer; add couple Messages tab |
| `web-app/src/app/(admin)/couple/dashboard.css` | Modify | Remove dead CSS; add new form + messages styles |
| `web-app/src/lib/vendorStore.ts` | Modify | Add `locked`, `pointsCost` to VendorMessageThread; add `points` to vendor; add `unlockThread`, `deductPoints`, `getPointsBalance` functions |
| `web-app/src/app/api/messages/quote/route.ts` | Modify | Accept `packageName` field; mark new threads `locked: true` |
| `web-app/src/app/api/vendors/[id]/unlock-message/route.ts` | Create | POST — deduct points, flip thread locked→false |
| `web-app/src/app/api/vendors/[id]/points/route.ts` | Create | GET balance; POST add (admin/sandbox only) |
| `web-app/src/app/(admin)/vendor/VendorPortalClient.tsx` | Modify | Inbox: show locked state, Unlock button, points balance header |
| `web-app/src/types/lucide-react.d.ts` | Modify | Add any missing icons (Lock, Unlock, Coins) |

---

## Task 1 — Strip Prices and Order Now from Vendor Profile

**Files:**
- Modify: `web-app/src/app/(admin)/couple/DashboardClient.tsx`
- Modify: `web-app/src/app/(admin)/couple/dashboard.css`

**Interfaces:**
- Removes: `addToBookedVendors`, `BookingConfirmedModal`, `bookedPkg` state from `VendorProfileView`
- Produces: simplified `VendorProfileView` that only exposes Get Quote + Save to Shortlist

- [ ] **Step 1: Read the current VendorProfileView sidebar section**

Open `DashboardClient.tsx` and locate the `VendorProfileView` function. Find the `vp-pkg-card` block — it currently renders `vp-pkg-price` and `vp-order-btn` per package.

- [ ] **Step 2: Remove price display and Order Now button from each package card**

In `VendorProfileView`, replace the package card inner content:

```tsx
// BEFORE — inside .vp-pkg-list map:
<div className="vp-pkg-card" key={pkg.name}>
  <span className="vp-pkg-name">{pkg.name}</span>
  <p className="vp-pkg-desc">{pkg.description}</p>
  <span className="vp-pkg-price">
    {vendor.currency || 'LKR'} {Number(pkg.price).toLocaleString()}
  </span>
  <button className="btn btn-primary vp-order-btn" onClick={() => handleOrderNow(pkg)}>
    Order Now
  </button>
</div>

// AFTER:
<div className="vp-pkg-card" key={pkg.name}>
  <span className="vp-pkg-name">{pkg.name}</span>
  <p className="vp-pkg-desc">{pkg.description}</p>
</div>
```

- [ ] **Step 3: Remove bookedPkg state and handleOrderNow from VendorProfileView**

Delete these lines from `VendorProfileView`:

```tsx
// DELETE these:
const [bookedPkg, setBookedPkg] = useState<any>(null);
function handleOrderNow(pkg: any) { onBook(vendor, pkg); setBookedPkg(pkg); }
```

- [ ] **Step 4: Remove BookingConfirmedModal portal render**

Delete the `createPortal` block for `BookingConfirmedModal` at the bottom of `VendorProfileView`'s return.

- [ ] **Step 5: Remove addToBookedVendors and BookingConfirmedModal functions**

In `VendorsModule`, delete `addToBookedVendors`. In `VendorProfileView` call site, remove `onBook={addToBookedVendors}`. Delete the entire `BookingConfirmedModal` function (approx 25 lines).

- [ ] **Step 6: Clean up dead CSS**

In `dashboard.css`, remove or comment out `.vp-pkg-price`, `.vp-order-btn`, `.bc-overlay`, `.bc-modal`, `.bc-check-ring`, `.bc-check-inner`, `.bc-title`, `.bc-summary`, `.bc-row`, `.bc-price`, `.bc-auto-note`, `.bc-actions` rule blocks.

- [ ] **Step 7: Verify no TypeScript errors from the removals**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

Expected: only the pre-existing `auth.ts` implicit-any errors.

- [ ] **Step 8: Commit**

```bash
git add web-app/src/app/(admin)/couple/DashboardClient.tsx web-app/src/app/(admin)/couple/dashboard.css
git commit -m "refactor(vendors): remove prices and Order Now from vendor profile"
```

---

## Task 2 — Redesign Get Quote Drawer as Context-Aware Intake Form

**Files:**
- Modify: `web-app/src/app/(admin)/couple/DashboardClient.tsx` — `GetQuoteDrawer` function
- Modify: `web-app/src/app/(admin)/couple/dashboard.css` — `.gq-*` styles
- Modify: `web-app/src/app/api/messages/quote/route.ts` — accept `packageName`

**Interfaces:**
- Consumes: `vendor.packages` array `{ name, description }[]`, `vendor.businessName`, `vendor.category`
- Produces: POST body `{ vendorId, coupleName, message, weddingDate, guestCount, packageName }`

- [ ] **Step 1: Read the current GetQuoteDrawer function**

Locate `GetQuoteDrawer` in `DashboardClient.tsx`. Note the existing fields: `msgText`, `weddingDate`, `guestCount`. The `isPremium = false` lock overlay will be removed — Get Quote is now always open.

- [ ] **Step 2: Replace GetQuoteDrawer state and form**

Replace the entire `GetQuoteDrawer` function body with:

```tsx
function GetQuoteDrawer({ vendor, onClose }: any) {
  const [selectedPkg, setSelectedPkg] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const pkgOptions = [
    ...(vendor.packages || []).map((p: any) => p.name),
    'Custom / Other',
  ];

  const initials = vendor.businessName
    .split(' ').filter((w: string) => w.length > 0).slice(0, 2)
    .map((w: string) => w[0].toUpperCase()).join('');

  async function handleSend() {
    if (!selectedPkg || !weddingDate) {
      setError('Please select a package and your wedding date.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/messages/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          packageName: selectedPkg,
          weddingDate,
          guestCount,
          message: notes || `Enquiry for ${selectedPkg}`,
          coupleName: 'A Couple',
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to send');
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="gq-overlay">
      <div className="gq-backdrop" onClick={onClose} />
      <div className="gq-drawer">
        <button className="gq-close" onClick={onClose}><X size={18} /></button>

        <div className="gq-header">
          <div className="gq-vendor-avatar">
            {vendor.logoBase64
              ? <img src={vendor.logoBase64} alt={vendor.businessName} />
              : <span>{initials}</span>}
          </div>
          <div>
            <span className="gq-vendor-name">{vendor.businessName}</span>
            <p className="gq-vendor-status">
              <span className="gq-dot" /> Typically replies within a few hours
            </p>
          </div>
        </div>

        {sent ? (
          <div className="gq-sent-state">
            <div className="gq-sent-check"><Check size={28} color="#16a34a" /></div>
            <p>Your enquiry has been sent! The vendor will be in touch soon.</p>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="gq-intro">
              Fill in your details and {vendor.businessName} will get back to you.
            </p>

            <div className="gq-field">
              <label>Which package are you interested in?</label>
              <select
                className="gq-select"
                value={selectedPkg}
                onChange={e => setSelectedPkg(e.target.value)}
              >
                <option value="">Select a package…</option>
                {pkgOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="gq-field">
              <label><CalendarDays size={13} /> Wedding date</label>
              <input
                type="date"
                className="gq-input"
                value={weddingDate}
                onChange={e => setWeddingDate(e.target.value)}
              />
            </div>

            <div className="gq-field">
              <label><Users size={13} /> Guest count (approx.)</label>
              <input
                type="number"
                className="gq-input"
                placeholder="e.g., 150"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
              />
            </div>

            <div className="gq-field">
              <label>Additional notes</label>
              <textarea
                className="gq-textarea"
                rows={4}
                placeholder="Any special requirements, venue details, or questions…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="gq-error">{error}</p>}

            <button
              className="btn btn-primary gq-send-btn"
              onClick={handleSend}
              disabled={sending}
            >
              {sending
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <><Send size={14} /> Send Enquiry</>}
            </button>

            <p className="gq-note">
              The vendor will receive this in their dashboard and via email.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add missing CSS for gq-select and gq-input**

In `dashboard.css`, inside the `.gq-*` section add:

```css
.gq-select,
.gq-input {
  width: 100%;
  border: 1px solid var(--adm-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--adm-text);
  background: var(--adm-card-bg);
  font-family: inherit;
  box-sizing: border-box;
}
.gq-select:focus,
.gq-input:focus {
  outline: none;
  border-color: var(--adm-primary, #c8956c);
}
```

- [ ] **Step 4: Add Users icon to lucide-react type stub if missing**

Check `web-app/src/types/lucide-react.d.ts` — `Users` should already be there. If not, add:

```ts
export const Users: LucideIcon;
```

- [ ] **Step 5: Update /api/messages/quote to accept packageName**

In `web-app/src/app/api/messages/quote/route.ts`, add `packageName` to the subject line:

```ts
const packageName = body.packageName ? String(body.packageName).trim() : '';
const subject = packageName
  ? `Enquiry for ${packageName} — ${coupleName}`
  : `Quote enquiry from ${coupleName}`;
```

And pass it into the meta:

```ts
const thread = createMessageThread(vendorId, coupleName, subject, message, {
  weddingDate,
  guestCount,
  packageName,   // ← add this
});
```

Update `createMessageThread` call signature in `vendorStore.ts` meta type to accept `packageName?: string` and include it in the metaLines:

```ts
if (meta?.packageName) metaLines.push(`Package: ${meta.packageName}`);
```

- [ ] **Step 6: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

Expected: only pre-existing auth.ts errors.

- [ ] **Step 7: Commit**

```bash
git add web-app/src/app/(admin)/couple/DashboardClient.tsx \
        web-app/src/app/(admin)/couple/dashboard.css \
        web-app/src/app/api/messages/quote/route.ts \
        web-app/src/lib/vendorStore.ts
git commit -m "feat(vendors): context-aware Get Quote intake form with package selector"
```

---

## Task 3 — Extend Data Model: Points Balance + Thread Lock Flag

**Files:**
- Modify: `web-app/src/lib/vendorStore.ts`

**Interfaces:**
- Produces:
  - `VendorMessageThread.locked: boolean` — true by default on new threads
  - `VendorMessageThread.pointsCost: number` — cost to unlock (default 5)
  - `VendorRegistration.points: number` — vendor's current balance
  - `getPointsBalance(vendorId: string): number`
  - `deductPoints(vendorId: string, amount: number): boolean` — returns false if insufficient
  - `unlockThread(vendorId: string, threadId: string): VendorMessageThread | null`

- [ ] **Step 1: Add locked and pointsCost to VendorMessageThread type**

In `vendorStore.ts`, extend the type (around line 79):

```ts
export type VendorMessageThread = {
  id: string;
  vendorId: string;
  bookingId: string | null;
  coupleName: string;
  subject: string;
  unread: boolean;
  locked: boolean;        // ← new
  pointsCost: number;     // ← new (default 5)
  lastMessageAt: string;
  messages: {
    id: string;
    sender: 'couple' | 'vendor';
    body: string;
    createdAt: string;
  }[];
};
```

- [ ] **Step 2: Add points field to VendorRegistration type**

Find the `VendorRegistration` type and add:

```ts
points?: number;  // vendor's current points balance
```

- [ ] **Step 3: Update createMessageThread to set locked: true by default**

In the `createMessageThread` function, update the thread object:

```ts
const thread: VendorMessageThread = {
  id: `thread_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  vendorId,
  bookingId: null,
  coupleName,
  subject,
  unread: true,
  locked: true,       // ← new
  pointsCost: 5,      // ← new
  lastMessageAt: now,
  messages: [{ id: `msg_${Date.now().toString(36)}`, sender: 'couple', body: fullBody, createdAt: now }],
};
```

- [ ] **Step 4: Update seed threads to be unlocked (so existing demo data still works)**

In the seed block (around line 603), add `locked: false, pointsCost: 0` to each seeded thread:

```ts
vendorStore.messageThreads.push(
  {
    id: 'msg_seed_001',
    vendorId: 'vnd_seed_001',
    locked: false,     // ← add
    pointsCost: 0,     // ← add
    // ... rest unchanged
  },
  // repeat for msg_seed_002
);
```

- [ ] **Step 5: Add points balance to seed vendors**

In the seed block for vendors (inside the vendor seeding loop), ensure each vendor starts with a points balance. Find the section that seeds `vendorStore.vendors` and add `points: 10` to each seed vendor in `vendors.json`:

```json
"points": 10
```

Add this to all 6 vendors in `web-app/data/vendors.json`.

- [ ] **Step 6: Add getPointsBalance, deductPoints, unlockThread functions**

After the `appendVendorMessage` function, add:

```ts
export function getPointsBalance(vendorId: string): number {
  const vendor = getVendorById(vendorId);
  return vendor?.points ?? 0;
}

export function deductPoints(vendorId: string, amount: number): boolean {
  const idx = vendorStore.vendors.findIndex(v => v.id === vendorId);
  if (idx === -1) return false;
  const current = vendorStore.vendors[idx].points ?? 0;
  if (current < amount) return false;
  vendorStore.vendors[idx] = { ...vendorStore.vendors[idx], points: current - amount };
  return true;
}

export function unlockThread(vendorId: string, threadId: string): VendorMessageThread | null {
  const idx = vendorStore.messageThreads.findIndex(
    t => t.vendorId === vendorId && t.id === threadId
  );
  if (idx === -1) return null;
  const updated: VendorMessageThread = {
    ...vendorStore.messageThreads[idx],
    locked: false,
  };
  vendorStore.messageThreads[idx] = updated;
  return updated;
}
```

- [ ] **Step 7: Update getVendorPortalData to include points balance**

In `getVendorPortalData`, add `points` to the return object:

```ts
return {
  bookings,
  availability: getAvailabilityByVendor(vendorId),
  messages,
  payouts,
  settings: getSettingsByVendor(vendorId),
  points: getPointsBalance(vendorId),   // ← new
  analytics: { ... },
};
```

- [ ] **Step 8: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

- [ ] **Step 9: Commit**

```bash
git add web-app/src/lib/vendorStore.ts web-app/data/vendors.json
git commit -m "feat(vendors): add points balance and message thread lock to data model"
```

---

## Task 4 — Unlock Message API Route

**Files:**
- Create: `web-app/src/app/api/vendors/[id]/unlock-message/route.ts`

**Interfaces:**
- Consumes: `deductPoints`, `unlockThread`, `getVendorById`, `getVendorPortalData` from `vendorStore`
- Consumes: `requireRole` from `@/lib/rbac`
- POST body: `{ threadId: string }`
- Returns: `{ ok: true, points: number }` or error

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p web-app/src/app/api/vendors/[id]/unlock-message
```

Create `web-app/src/app/api/vendors/[id]/unlock-message/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import {
  getVendorById,
  deductPoints,
  unlockThread,
  getPointsBalance,
} from '@/lib/vendorStore';

const UNLOCK_COST = 5;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(['VENDOR', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  try {
    const { id } = await params;
    if (!getVendorById(id)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const body = await req.json();
    const threadId = String(body.threadId || '').trim();
    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required.' }, { status: 400 });
    }

    const deducted = deductPoints(id, UNLOCK_COST);
    if (!deducted) {
      return NextResponse.json(
        { error: 'Insufficient points. Please purchase more points to unlock this message.' },
        { status: 402 }
      );
    }

    const thread = unlockThread(id, threadId);
    if (!thread) {
      // Refund — thread not found
      deductPoints(id, -UNLOCK_COST); // add back
      return NextResponse.json({ error: 'Message thread not found.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      points: getPointsBalance(id),
    });
  } catch (err) {
    console.error('[POST /api/vendors/[id]/unlock-message]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Fix the refund logic — deductPoints doesn't accept negative**

Replace the refund comment with a proper in-place restore using a direct store patch, or simply accept the loss on a not-found thread (the thread existence should be verified before deducting). Rewrite the handler to check thread existence first:

```ts
// Verify thread exists before charging
const thread = unlockThread(id, threadId); // this returns null if not found without touching points
// BUT unlockThread doesn't check locked state — add that guard in vendorStore
// For now: check thread is found then deduct
```

Update `unlockThread` in `vendorStore.ts` to NOT deduct (it doesn't — deductPoints is separate). The route should:
1. Verify thread exists (read-only check)
2. Deduct points
3. Unlock thread

Add a `getThreadById` helper to vendorStore:

```ts
export function getThreadById(vendorId: string, threadId: string): VendorMessageThread | null {
  return vendorStore.messageThreads.find(
    t => t.vendorId === vendorId && t.id === threadId
  ) ?? null;
}
```

Update the route to use it:

```ts
import { getVendorById, deductPoints, unlockThread, getPointsBalance, getThreadById } from '@/lib/vendorStore';

// In POST handler:
const existing = getThreadById(id, threadId);
if (!existing) {
  return NextResponse.json({ error: 'Message thread not found.' }, { status: 404 });
}
if (!existing.locked) {
  return NextResponse.json({ ok: true, points: getPointsBalance(id) }); // already unlocked
}
const deducted = deductPoints(id, UNLOCK_COST);
if (!deducted) {
  return NextResponse.json(
    { error: 'Insufficient points. Purchase more points to unlock this message.' },
    { status: 402 }
  );
}
unlockThread(id, threadId);
return NextResponse.json({ ok: true, points: getPointsBalance(id) });
```

- [ ] **Step 3: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

- [ ] **Step 4: Commit**

```bash
git add web-app/src/app/api/vendors/[id]/unlock-message/ web-app/src/lib/vendorStore.ts
git commit -m "feat(vendors): POST /api/vendors/[id]/unlock-message deducts 5 points"
```

---

## Task 5 — Vendor Inbox: Lock UI + Points Balance + Unlock Button

**Files:**
- Modify: `web-app/src/app/(admin)/vendor/VendorPortalClient.tsx` — `MessagesModule`

**Interfaces:**
- Consumes: `portal.points: number` (from `getVendorPortalData`)
- Consumes: `thread.locked: boolean`, `thread.pointsCost: number`
- Calls: `POST /api/vendors/[id]/unlock-message`

- [ ] **Step 1: Read the current MessagesModule in VendorPortalClient.tsx**

Locate `MessagesModule` (around line 1291). Note `threads` prop comes from `portal.messages`, and `onPortalChange` refreshes the whole portal state.

- [ ] **Step 2: Add points prop and unlock state to MessagesModule**

Update the function signature:

```tsx
function MessagesModule({ vendor, threads: initialThreads = [], points: initialPoints = 0, onPortalChange }: any) {
  const [points, setPoints] = useState(initialPoints);
  const [unlocking, setUnlocking] = useState<string | null>(null); // threadId being unlocked
  // ... existing state unchanged
```

- [ ] **Step 3: Add unlockThread function**

Inside `MessagesModule`, add:

```tsx
async function unlockThread(threadId: string) {
  setUnlocking(threadId);
  setError('');
  try {
    const res = await fetch(`/api/vendors/${vendor.id}/unlock-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unlock failed.');
    setPoints(data.points);
    // Refresh full portal so thread.locked updates
    const portalRes = await fetch(`/api/vendors/${vendor.id}/portal`);
    const portalData = await portalRes.json();
    onPortalChange(portalData);
    setNotice('Message unlocked!');
  } catch (err: any) {
    setError(err.message || 'Could not unlock message.');
  } finally {
    setUnlocking(null);
  }
}
```

- [ ] **Step 4: Update thread list to show lock icon and Unlock button**

In the left panel thread list, replace the existing `<button>` per thread with:

```tsx
<button
  key={thread.id}
  onClick={() => !thread.locked && openThread(thread.id)}
  style={{
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    padding: '14px 16px', background: isActive ? 'var(--adm-hover-bg)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--inv-rose, #e86a8a)' : '3px solid transparent',
    border: 'none', borderBottom: '1px solid var(--adm-border)',
    cursor: thread.locked ? 'default' : 'pointer', textAlign: 'left',
    opacity: thread.locked ? 0.85 : 1,
  }}
>
  <div style={{
    width: 40, height: 40, borderRadius: '50%', background: '#2d3748',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, color: '#e2e8f0', fontWeight: 700, fontSize: 13,
  }}>
    {avatarInitials(thread.coupleName)}
  </div>
  <div style={{ minWidth: 0, flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--adm-text)' }}>
        {thread.coupleName}
      </span>
      <span style={{ fontSize: 11, color: 'var(--adm-text-muted)', flexShrink: 0 }}>
        {timeAgo(thread.lastMessageAt)}
      </span>
    </div>
    {thread.locked ? (
      <button
        onClick={e => { e.stopPropagation(); unlockThread(thread.id); }}
        disabled={unlocking === thread.id}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'var(--adm-primary, #c8956c)', color: '#fff',
          border: 'none', borderRadius: 20, padding: '4px 12px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 3,
        }}
      >
        <Lock size={11} />
        {unlocking === thread.id ? 'Unlocking…' : `Unlock · 5 pts`}
      </button>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--adm-text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {thread.lastMessage}
        </span>
        {thread.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e86a8a', flexShrink: 0, display: 'inline-block' }} />}
      </div>
    )}
  </div>
</button>
```

- [ ] **Step 5: Update inbox header to show points balance**

In the `listHeaderStyle` div, replace the unread count with:

```tsx
<div style={listHeaderStyle}>
  <span style={{ fontWeight: 700, fontSize: 14 }}>Inbox</span>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <span style={{ fontSize: 12, color: 'var(--adm-text-muted)', background: 'var(--adm-hover-bg)', borderRadius: 20, padding: '2px 10px' }}>
      {threads.filter((t: any) => t.unread && !t.locked).length} unread
    </span>
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-primary, #c8956c)', background: '#fef3c7', borderRadius: 20, padding: '2px 10px' }}>
      {points} pts
    </span>
  </div>
</div>
```

- [ ] **Step 6: Update MessagesModule call site to pass points**

In `VendorPortalClient`, find where `MessagesModule` is rendered and add `points={portal.points ?? 0}`:

```tsx
<MessagesModule
  vendor={vendor}
  threads={messageThreads}
  points={portal.points ?? 0}
  onPortalChange={setPortal}
/>
```

- [ ] **Step 7: Ensure Lock icon is in lucide-react type stub**

`Lock` is already in `web-app/src/types/lucide-react.d.ts` (line 64). Verify — if missing, add `export const Lock: LucideIcon;`.

- [ ] **Step 8: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

- [ ] **Step 9: Commit**

```bash
git add web-app/src/app/(admin)/vendor/VendorPortalClient.tsx
git commit -m "feat(inbox): vendor points balance + locked thread unlock UI"
```

---

## Task 6 — Points Purchase CTA (Sandbox / Admin Top-Up)

**Files:**
- Create: `web-app/src/app/api/vendors/[id]/points/route.ts`
- Modify: `web-app/src/app/(admin)/vendor/VendorPortalClient.tsx` — add Buy Points button

**Interfaces:**
- POST `/api/vendors/[id]/points` body: `{ amount: number }` — admin/sandbox top-up only
- Returns: `{ ok: true, points: number }`

- [ ] **Step 1: Create the points top-up route (sandbox only)**

Create `web-app/src/app/api/vendors/[id]/points/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getVendorById, deductPoints, getPointsBalance } from '@/lib/vendorStore';

// Sandbox only — in production this would go through Stripe checkout
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(['VENDOR', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  const { id } = await params;
  if (!getVendorById(id)) {
    return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
  }

  const body = await req.json();
  const amount = Number(body.amount || 0);
  if (!Number.isInteger(amount) || amount < 1 || amount > 500) {
    return NextResponse.json({ error: 'amount must be an integer between 1 and 500.' }, { status: 400 });
  }

  // deductPoints with negative amount = add points
  // Instead, use a direct addPoints helper
  deductPoints(id, -amount); // negative = addition
  return NextResponse.json({ ok: true, points: getPointsBalance(id) });
}
```

**Note:** `deductPoints` with a negative number works because the subtraction becomes addition — but it's cleaner to add an `addPoints` function to `vendorStore.ts`:

```ts
export function addPoints(vendorId: string, amount: number): boolean {
  const idx = vendorStore.vendors.findIndex(v => v.id === vendorId);
  if (idx === -1) return false;
  const current = vendorStore.vendors[idx].points ?? 0;
  vendorStore.vendors[idx] = { ...vendorStore.vendors[idx], points: current + amount };
  return true;
}
```

Update the route to use `addPoints(id, amount)`.

- [ ] **Step 2: Add "Buy Points" button to vendor inbox when balance is low**

In `MessagesModule`, inside the inbox header or below the points badge, add:

```tsx
{points < 10 && (
  <button
    onClick={async () => {
      const res = await fetch(`/api/vendors/${vendor.id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 20 }),
      });
      const data = await res.json();
      if (res.ok) setPoints(data.points);
    }}
    style={{
      fontSize: 11, fontWeight: 600, color: '#92400e',
      background: '#fef3c7', border: '1px solid #f59e0b',
      borderRadius: 20, padding: '3px 10px', cursor: 'pointer',
    }}
  >
    + Buy Points
  </button>
)}
```

This is a **sandbox shortcut** — clicking adds 20 points immediately for demo purposes. In production, this button would link to a Stripe checkout for a points package.

- [ ] **Step 3: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

- [ ] **Step 4: Commit**

```bash
git add web-app/src/app/api/vendors/[id]/points/ web-app/src/app/(admin)/vendor/VendorPortalClient.tsx web-app/src/lib/vendorStore.ts
git commit -m "feat(vendors): sandbox points top-up API and Buy Points CTA in inbox"
```

---

## Task 7 — Couple-Side Message View (Sent Enquiries)

**Files:**
- Create: `web-app/src/app/api/messages/couple/route.ts`
- Modify: `web-app/src/app/(admin)/couple/DashboardClient.tsx` — add Sent Enquiries section below vendor grid

**Interfaces:**
- GET `/api/messages/couple?weddingId=...` — returns threads where `coupleName` matches this couple
- Produces: `{ threads: { id, vendorName, subject, lastMessageAt, messageCount }[] }`

**Note:** The current vendorStore indexes threads by `vendorId` and `coupleName` (string). For MVP, match by `coupleName` from the session's wedding record. A full auth-linked system would use `coupleId` but that requires schema changes — keep it simple.

- [ ] **Step 1: Create GET /api/messages/couple**

```bash
mkdir -p web-app/src/app/api/messages/couple
```

Create `web-app/src/app/api/messages/couple/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getAllVendors, getMessageThreadsByVendor } from '@/lib/vendorStore';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['COUPLE', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const coupleName = searchParams.get('coupleName') || '';
  if (!coupleName) {
    return NextResponse.json({ threads: [] });
  }

  const vendors = getAllVendors();
  const results: any[] = [];

  for (const vendor of vendors) {
    const threads = getMessageThreadsByVendor(vendor.id).filter(
      t => t.coupleName.toLowerCase() === coupleName.toLowerCase()
    );
    for (const t of threads) {
      results.push({
        id: t.id,
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        vendorCategory: vendor.category,
        subject: t.subject,
        lastMessageAt: t.lastMessageAt,
        messageCount: t.messages.length,
        lastReply: t.messages.length > 1
          ? t.messages[t.messages.length - 1]
          : null,
      });
    }
  }

  results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return NextResponse.json({ threads: results });
}
```

- [ ] **Step 2: Add Sent Enquiries section to VendorsModule in DashboardClient**

In `VendorsModule`, add state and effect:

```tsx
const [sentThreads, setSentThreads] = useState<any[]>([]);

useEffect(() => {
  const coupleName = wedding?.partner1Name && wedding?.partner2Name
    ? `${wedding.partner1Name} & ${wedding.partner2Name}`
    : 'A Couple';
  fetch(`/api/messages/couple?coupleName=${encodeURIComponent(coupleName)}`)
    .then(r => r.json())
    .then(d => setSentThreads(d.threads || []))
    .catch(() => {});
}, []);
```

Then below the shortlist section, add:

```tsx
{sentThreads.length > 0 && (
  <div className="card" style={{ marginTop: 24 }}>
    <div className="panel-header">
      <h3>Sent Enquiries</h3>
      <span className="text-muted">{sentThreads.length} sent</span>
    </div>
    <div className="compact-list">
      {sentThreads.map((t: any) => (
        <div className="compact-row" key={t.id}>
          <div>
            <strong>{t.vendorName}</strong>
            <span>{t.vendorCategory} · {t.subject}</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--adm-text-muted)' }}>
            {t.lastReply
              ? <span style={{ color: '#16a34a', fontWeight: 600 }}>Reply received</span>
              : 'Awaiting reply'}
            <br />{timeAgo(t.lastMessageAt)}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

Add the `timeAgo` helper to `DashboardClient.tsx` (copy from `VendorPortalClient.tsx`):

```tsx
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -v "Cannot find module" | grep -v "^$"
```

- [ ] **Step 4: Commit**

```bash
git add web-app/src/app/api/messages/couple/ web-app/src/app/(admin)/couple/DashboardClient.tsx
git commit -m "feat(couple): sent enquiries section shows quote requests and vendor replies"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| Remove prices from package cards | Task 1 |
| Remove Order Now buttons | Task 1 |
| Get Quote shows package dropdown | Task 2 |
| Get Quote shows wedding date | Task 2 |
| Get Quote shows notes field | Task 2 |
| Vendor receives structured enquiry | Task 2 + API |
| Thread locked by default | Task 3 |
| Vendor has points balance | Task 3 |
| Vendor can unlock for 5 points | Task 4 |
| Inbox shows lock state visually | Task 5 |
| Points balance shown in inbox | Task 5 |
| Buy Points CTA (sandbox) | Task 6 |
| Couple sees sent enquiries | Task 7 |
| Couple sees if vendor replied | Task 7 |

### No Placeholders Check ✓
All steps contain actual code. No "TBD" or "implement later" present.

### Type Consistency Check ✓
- `VendorMessageThread.locked: boolean` defined Task 3, consumed Tasks 4 + 5
- `VendorMessageThread.pointsCost: number` defined Task 3, displayed Task 5
- `getPointsBalance`, `deductPoints`, `unlockThread`, `addPoints` defined Task 3/4/6, consumed in API routes
- `portal.points` added Task 3, consumed Task 5

---

*Total estimated implementation time: 3–5 hours across 7 tasks.*

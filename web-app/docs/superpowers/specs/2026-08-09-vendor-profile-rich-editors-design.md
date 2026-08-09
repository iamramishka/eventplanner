# Vendor Profile Rich Editors — Design Spec

**Date:** 2026-08-09
**Status:** Approved
**Scope:** Replace the two raw Markdown textareas on the vendor profile tab ("About Your Business" + "FAQ Section") with rich editors; expose both fields publicly.

---

## Problem

The vendor profile tab has two Markdown textareas:
- `aboutMarkdown` — brand story / about section
- `faqMarkdown` — FAQ pairs written as raw Markdown bold text

Non-technical vendors cannot use Markdown. The FAQ field is especially fragile: vendors must maintain `**Question?**` / answer pairs by hand with no structure.

---

## Solution

### 1. About Your Business → RichTextEditor

Replace the `aboutMarkdown` textarea with the existing `<RichTextEditor>` component (already built). Stores HTML in `aboutMarkdown`. One line change in VendorPortalClient.

### 2. FAQ Section → FaqEditor (new component)

A structured FAQ builder — `src/components/FaqEditor.tsx`:

- Each FAQ is a row: drag handle + Question input + Answer textarea + Delete button
- "Add FAQ" button appends a blank row
- Drag-to-reorder using HTML5 drag-and-drop (no new packages)
- Serializes to/from JSON string: `[{"id":"…","q":"…","a":"…"}]`
- Stored in existing `faqMarkdown` field (already a `string?`, 10 000-char limit)
- Legacy Markdown content → starts empty (no auto-conversion, out of scope)

**Props:**
```tsx
interface FaqEditorProps {
  value: string;       // JSON string: FaqItem[] or ""
  onChange: (json: string) => void;
}
type FaqItem = { id: string; q: string; a: string };
```

### 3. Expose fields publicly

`toPublicVendor` currently omits `aboutMarkdown` and `faqMarkdown`. Add both.

### 4. Render on public vendor detail page

`src/app/vendors/[id]/page.tsx` already exists. Add:

- **About section**: `vendor.aboutMarkdown` rendered via `dangerouslySetInnerHTML` + existing `sanitizeHtml` + `.richContent` CSS.
- **FAQ section**: parse `vendor.faqMarkdown` as JSON → render as `<details>/<summary>` accordion. If parse fails, render nothing.

---

## Architecture

### Files changed

| File | Action |
|---|---|
| `src/components/FaqEditor.tsx` | Create — structured FAQ builder |
| `src/app/(admin)/vendor/VendorPortalClient.tsx` | Modify — swap 2 textareas |
| `src/lib/vendorStore.ts` | Modify — expose 2 fields in `toPublicVendor` |
| `src/app/vendors/[id]/page.tsx` | Modify — render About + FAQ sections |

### No schema/API changes needed

- `aboutMarkdown` and `faqMarkdown` exist as `string?` in `VendorRegistration`
- Both are already in the PATCH `/api/vendors/[id]` allowed-fields list
- `cleanString(..., 10000)` limit already applies to both

---

## FaqEditor UX

```
┌──────────────────────────────────────────┐
│ ⠿  Question: [________________________]  🗑 │
│     Answer:  [________________________]     │
│              [________________________]     │
├──────────────────────────────────────────┤
│ ⠿  Question: [________________________]  🗑 │
│     Answer:  [________________________]     │
└──────────────────────────────────────────┘
             [+ Add FAQ]
```

- Drag handle (GripVertical icon) — drag entire row to reorder
- Question: single-line `<input>`
- Answer: `<textarea rows={3}>`
- Delete: Trash2 icon (removes row, updates JSON)
- "Add FAQ" appends `{ id: crypto.randomUUID(), q: '', a: '' }`

---

## Public FAQ render

Native `<details>/<summary>` accordion — no JS needed:

```html
<details class="faqItem">
  <summary class="faqQ">How far in advance should we book?</summary>
  <p class="faqA">We recommend booking 6–12 months…</p>
</details>
```

---

## Out of scope

- Converting existing Markdown FAQ content to JSON
- Rich text in FAQ answers (plain textarea only)
- Saving FAQ item order to a separate DB field

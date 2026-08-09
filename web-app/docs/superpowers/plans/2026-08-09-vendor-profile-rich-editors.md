# Vendor Profile Rich Editors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "About Your Business" and "FAQ Section" Markdown textareas on the vendor profile tab with a RichTextEditor and a structured FaqEditor; expose both fields on the public vendor detail page.

**Architecture:** Reuse the existing `RichTextEditor` component for `aboutMarkdown`. Create a new `FaqEditor` component that manages an array of `{id, q, a}` items serialized to JSON, stored in the existing `faqMarkdown` string field. Expose both fields via `toPublicVendor` and render them on the existing public vendor detail page.

**Tech Stack:** Next.js 16 App Router, TypeScript, Lucide React (installed), HTML5 drag-and-drop (no new packages), inline `<style>` blocks.

## Global Constraints

- No new npm packages
- All component styles in a `<style>` block — no new `.css` or `.module.css` files
- Use Lucide React icons (already installed): `GripVertical`, `Trash2`, `Plus`
- TypeScript strict — no `any` unless the target file already uses it
- Field keys `aboutMarkdown` and `faqMarkdown` must stay unchanged in all API calls and state
- `FaqItem` type: `{ id: string; q: string; a: string }`
- JSON storage format: `FaqItem[]` serialized with `JSON.stringify`
- Legacy Markdown content in `faqMarkdown` → parse attempt fails silently → start with empty list
- FAQ answers are plain text only (no rich text in answers)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/FaqEditor.tsx` | Create | Structured FAQ builder with drag-to-reorder |
| `src/app/(admin)/vendor/VendorPortalClient.tsx` | Modify (~line 603–611) | Swap 2 textareas with RichTextEditor + FaqEditor |
| `src/lib/vendorStore.ts` | Modify (~line 801) | Add `aboutMarkdown` + `faqMarkdown` to `toPublicVendor` |
| `src/app/vendors/[id]/page.tsx` | Modify | Add About + FAQ sections to public vendor detail page |

---

## Task 1: Create FaqEditor Component

**Files:**
- Create: `src/components/FaqEditor.tsx`

**Interfaces:**
- Produces: `export default function FaqEditor({ value, onChange }: FaqEditorProps)`
  - `value: string` — JSON string (FaqItem[] or empty/invalid → treat as [])
  - `onChange: (json: string) => void` — called on every change with `JSON.stringify(items)`

- [ ] **Step 1: Create the file**

Create `src/components/FaqEditor.tsx` with this exact content:

```tsx
'use client';

import { useState, useCallback, useRef } from 'react';
// @ts-ignore -- lucide-react v1.30 uses "typings" not "exports.types"; bundler moduleResolution skips it; all icons exist at runtime
import { GripVertical, Trash2, Plus } from 'lucide-react';

type FaqItem = { id: string; q: string; a: string };

interface FaqEditorProps {
  value: string;
  onChange: (json: string) => void;
}

function parse(value: string): FaqItem[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(
      (i): i is FaqItem => i && typeof i.id === 'string' && typeof i.q === 'string' && typeof i.a === 'string'
    );
  } catch { /* legacy Markdown or empty — start fresh */ }
  return [];
}

export default function FaqEditor({ value, onChange }: FaqEditorProps) {
  const [items, setItems] = useState<FaqItem[]>(() => parse(value));
  const dragIdx = useRef<number | null>(null);

  const emit = useCallback((next: FaqItem[]) => {
    setItems(next);
    onChange(JSON.stringify(next));
  }, [onChange]);

  const add = () => emit([...items, { id: crypto.randomUUID(), q: '', a: '' }]);

  const remove = (id: string) => emit(items.filter(i => i.id !== id));

  const update = (id: string, field: 'q' | 'a', val: string) =>
    emit(items.map(i => i.id === id ? { ...i, [field]: val } : i));

  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(idx, 0, moved);
    dragIdx.current = idx;
    emit(next);
  };
  const onDragEnd = () => { dragIdx.current = null; };

  return (
    <>
      <style>{`
        .faqEditor { display: flex; flex-direction: column; gap: 8px; }
        .faqRow { display: flex; align-items: flex-start; gap: 8px; background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; }
        .faqRow[data-dragging] { opacity: .5; }
        .faqHandle { cursor: grab; color: #9CA3AF; padding-top: 2px; flex-shrink: 0; }
        .faqHandle:active { cursor: grabbing; }
        .faqFields { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .faqInput { width: 100%; padding: 7px 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: .875rem; outline: none; font-family: inherit; box-sizing: border-box; }
        .faqInput:focus { border-color: #6B7280; }
        .faqTextarea { width: 100%; padding: 7px 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: .875rem; outline: none; resize: vertical; font-family: inherit; box-sizing: border-box; }
        .faqTextarea:focus { border-color: #6B7280; }
        .faqLabel { font-size: .75rem; color: #6B7280; font-weight: 500; margin-bottom: 2px; }
        .faqDelete { flex-shrink: 0; padding-top: 2px; background: none; border: none; cursor: pointer; color: #9CA3AF; }
        .faqDelete:hover { color: #EF4444; }
        .faqAdd { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 8px; cursor: pointer; font-size: .875rem; color: #374151; font-weight: 500; width: 100%; justify-content: center; }
        .faqAdd:hover { background: #F3F4F6; border-color: #9CA3AF; }
        .faqEmpty { text-align: center; padding: 1.5rem; border: 1px dashed #E5E7EB; border-radius: 8px; color: #9CA3AF; font-size: .875rem; }
      `}</style>

      <div className="faqEditor">
        {items.length === 0 && (
          <div className="faqEmpty">No FAQs yet. Click "Add FAQ" to get started.</div>
        )}
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="faqRow"
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={e => onDragOver(e, idx)}
            onDragEnd={onDragEnd}
          >
            <span className="faqHandle" title="Drag to reorder">
              <GripVertical size={16} />
            </span>
            <div className="faqFields">
              <div>
                <div className="faqLabel">Question</div>
                <input
                  className="faqInput"
                  type="text"
                  value={item.q}
                  placeholder="e.g. How far in advance should we book?"
                  onChange={e => update(item.id, 'q', e.target.value)}
                />
              </div>
              <div>
                <div className="faqLabel">Answer</div>
                <textarea
                  className="faqTextarea"
                  rows={3}
                  value={item.a}
                  placeholder="Your answer here…"
                  onChange={e => update(item.id, 'a', e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="faqDelete"
              title="Remove FAQ"
              onClick={() => remove(item.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button type="button" className="faqAdd" onClick={add}>
          <Plus size={16} />
          Add FAQ
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```powershell
cd "C:\Users\ramis\Downloads\wed plan\.claude\worktrees\feat+vendor-rich-text-editor\web-app"; npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "FaqEditor" | Select-Object -First 10
```

Expected: no output. If errors appear, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/components/FaqEditor.tsx
git commit -m "feat(ui): add FaqEditor component with drag-to-reorder and JSON serialization"
```

---

## Task 2: Wire Editors into Vendor Profile Form

**Files:**
- Modify: `src/app/(admin)/vendor/VendorPortalClient.tsx` (~line 603–611)

**Interfaces:**
- Consumes: `RichTextEditor` default export from `@/components/RichTextEditor` (already imported at line 16)
- Consumes: `FaqEditor` default export from `@/components/FaqEditor`
- Consumes: `vendor.aboutMarkdown: string | undefined` and `vendor.faqMarkdown: string | undefined` in scope
- Consumes: `change(field, value)` helper already in scope (used for all profile field updates)

- [ ] **Step 1: Add FaqEditor import**

At the top of `VendorPortalClient.tsx`, after the existing `RichTextEditor` import (line 16), add:

```tsx
import FaqEditor from '@/components/FaqEditor';
```

- [ ] **Step 2: Replace the aboutMarkdown textarea**

Find this exact block (~line 602–606):

```tsx
            <div className="profField">
              <label className="profLabel">About Your Business</label>
              <textarea id="prof-aboutMarkdown" className={`profTextarea profTextareaCode`} rows={10} value={vendor.aboutMarkdown || ''} onChange={e => change('aboutMarkdown', e.target.value)} placeholder={`## Our Story\n\nTell your brand story here...\n\n## Our Approach\n\nWhat makes you different?\n\n## Awards & Recognition\n\n- Award name — Year`} />
              <span className="profHint">{(vendor.aboutMarkdown || '').length} characters</span>
            </div>
```

Replace with:

```tsx
            <div className="profField">
              <label className="profLabel">About Your Business</label>
              <RichTextEditor
                value={vendor.aboutMarkdown || ''}
                onChange={(html) => change('aboutMarkdown', html)}
                placeholder="Tell your brand story, your approach, and any awards…"
              />
            </div>
```

- [ ] **Step 3: Replace the faqMarkdown textarea**

Find this exact block (~line 607–611):

```tsx
            <div className="profField">
              <label className="profLabel">FAQ Section</label>
              <textarea id="prof-faqMarkdown" className={`profTextarea profTextareaCode`} rows={8} value={vendor.faqMarkdown || ''} onChange={e => change('faqMarkdown', e.target.value)} placeholder={`## Frequently Asked Questions\n\n**How far in advance should we book?**\nWe recommend booking 6–12 months in advance for peak season dates.\n\n**Do you travel outside Colombo?**\nYes, island-wide. Travel costs may apply for distant venues.`} />
              <span className="profHint">{(vendor.faqMarkdown || '').length} characters</span>
            </div>
```

Replace with:

```tsx
            <div className="profField">
              <label className="profLabel">FAQ Section</label>
              <FaqEditor
                value={vendor.faqMarkdown || ''}
                onChange={(json) => change('faqMarkdown', json)}
              />
            </div>
```

- [ ] **Step 4: Type-check**

```powershell
cd "C:\Users\ramis\Downloads\wed plan\.claude\worktrees\feat+vendor-rich-text-editor\web-app"; npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "VendorPortalClient" | Select-Object -First 10
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(admin)/vendor/VendorPortalClient.tsx"
git commit -m "feat(vendor): replace about/faq textareas with RichTextEditor and FaqEditor"
```

---

## Task 3: Expose Fields + Render Publicly

**Files:**
- Modify: `src/lib/vendorStore.ts` (~line 801, inside `toPublicVendor`)
- Modify: `src/app/vendors/[id]/page.tsx`

**Interfaces:**
- `toPublicVendor` return type gains `aboutMarkdown: string` and `faqMarkdown: string`
- Public page reads `vendor.aboutMarkdown` and `vendor.faqMarkdown` from the result

- [ ] **Step 1: Add fields to toPublicVendor**

In `src/lib/vendorStore.ts`, find the `toPublicVendor` function return object. It ends with:

```ts
    featured: Boolean(v.featured),
    createdAt: v.createdAt,
  };
```

Replace with:

```ts
    featured: Boolean(v.featured),
    createdAt: v.createdAt,
    aboutMarkdown: v.aboutMarkdown || '',
    faqMarkdown: v.faqMarkdown || '',
  };
```

- [ ] **Step 2: Add About + FAQ sections to the public vendor detail page**

In `src/app/vendors/[id]/page.tsx`, add these CSS rules to the existing `richContentCss` constant (append inside the template literal before the closing backtick):

```css
  .faqAccordion { display: flex; flex-direction: column; gap: .5rem; margin-top: .5rem; }
  .faqItem { border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
  .faqItem summary.faqQ { padding: .75rem 1rem; cursor: pointer; font-weight: 600; font-size: .95rem; list-style: none; display: flex; justify-content: space-between; align-items: center; }
  .faqItem summary.faqQ::-webkit-details-marker { display: none; }
  .faqItem summary.faqQ::after { content: '+'; font-size: 1.1rem; color: #9CA3AF; }
  .faqItem[open] summary.faqQ::after { content: '−'; }
  .faqItem .faqA { padding: .75rem 1rem; font-size: .9rem; color: #374151; line-height: 1.6; border-top: 1px solid #F3F4F6; white-space: pre-wrap; }
  .sectionHeading { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 .75rem; }
```

- [ ] **Step 3: Add the About and FAQ rendering blocks**

In `src/app/vendors/[id]/page.tsx`, after the closing `</header>` tag and before `<main>`, the current structure is:

```tsx
      {/* Listings */}
      <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
```

Replace with:

```tsx
      {/* About + FAQ */}
      {(vendor.aboutMarkdown || vendor.faqMarkdown) && (
        <section style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {vendor.aboutMarkdown && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem' }}>
              <h2 className="sectionHeading">About</h2>
              <div
                className="richContent"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(vendor.aboutMarkdown) }}
              />
            </div>
          )}
          {vendor.faqMarkdown && (() => {
            let faqs: { id: string; q: string; a: string }[] = [];
            try { faqs = JSON.parse(vendor.faqMarkdown).filter((i: any) => i.q); } catch { /* skip */ }
            if (faqs.length === 0) return null;
            return (
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem' }}>
                <h2 className="sectionHeading">Frequently Asked Questions</h2>
                <div className="faqAccordion">
                  {faqs.map((faq) => (
                    <details key={faq.id} className="faqItem">
                      <summary className="faqQ">{faq.q}</summary>
                      <p className="faqA">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Listings */}
      <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
```

- [ ] **Step 4: Type-check**

```powershell
cd "C:\Users\ramis\Downloads\wed plan\.claude\worktrees\feat+vendor-rich-text-editor\web-app"; npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "error" | Select-Object -First 10
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/vendorStore.ts "src/app/vendors/[id]/page.tsx"
git commit -m "feat(public): render vendor about and FAQ sections on public detail page"
```

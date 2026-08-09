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

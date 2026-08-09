// @ts-nocheck
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Highlighter, Link as LinkIcon,
  RemoveFormatting, Palette,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Orange', value: '#EA580C' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Gray', value: '#6B7280' },
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rte-content',
        'data-placeholder': placeholder || 'Write your listing details here…',
      },
    },
    onUpdate({ editor }) {
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value changes (e.g. when form resets to a different listing)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `rte-btn${active ? ' rte-btn-active' : ''}`;

  return (
    <>
      <style>{`
        .rte-wrap { border: 1px solid #D1D5DB; border-radius: .5rem; overflow: hidden; background: #fff; }
        .rte-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; padding: 6px 8px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; }
        .rte-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: 4px; background: transparent; cursor: pointer; color: #374151; transition: background .15s; flex-shrink: 0; }
        .rte-btn:hover { background: #E5E7EB; }
        .rte-btn-active { background: #E5E7EB; color: #111827; }
        .rte-divider { width: 1px; height: 20px; background: #E5E7EB; margin: 0 4px; flex-shrink: 0; }
        .rte-color-wrap { position: relative; display: inline-flex; }
        .rte-color-picker { display: none; position: absolute; top: calc(100% + 4px); left: 0; z-index: 100; background: #fff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.1); flex-wrap: wrap; gap: 6px; width: 140px; }
        .rte-color-wrap:focus-within .rte-color-picker { display: flex; }
        .rte-swatch { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; outline: none; }
        .rte-swatch:hover, .rte-swatch:focus { border-color: #6B7280; }
        .rte-content { padding: 12px 14px; min-height: 160px; outline: none; font-size: .9rem; line-height: 1.65; color: #111827; }
        .rte-content:empty:before { content: attr(data-placeholder); color: #9CA3AF; pointer-events: none; }
        .rte-content h2 { font-size: 1.15rem; font-weight: 700; margin: 1rem 0 .4rem; }
        .rte-content h3 { font-size: 1rem; font-weight: 600; margin: .9rem 0 .35rem; }
        .rte-content ul, .rte-content ol { padding-left: 1.4rem; margin: .4rem 0; }
        .rte-content li { margin: .2rem 0; }
        .rte-content a { color: #2563EB; text-decoration: underline; }
        .rte-content mark { background: #FEF08A; border-radius: 2px; padding: 0 2px; }
        .rte-content p { margin: .3rem 0; }
      `}</style>

      <div className="rte-wrap">
        <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">

          <button type="button" title="Bold" className={btn(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={15} />
          </button>

          <button type="button" title="Italic" className={btn(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={15} />
          </button>

          <button type="button" title="Underline" className={btn(editor.isActive('underline'))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={15} />
          </button>

          <div className="rte-divider" />

          <button type="button" title="Heading 2" className={btn(editor.isActive('heading', { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={15} />
          </button>

          <button type="button" title="Heading 3" className={btn(editor.isActive('heading', { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={15} />
          </button>

          <div className="rte-divider" />

          <button type="button" title="Bullet list" className={btn(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={15} />
          </button>

          <button type="button" title="Numbered list" className={btn(editor.isActive('orderedList'))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={15} />
          </button>

          <div className="rte-divider" />

          <button type="button" title="Highlight" className={btn(editor.isActive('highlight'))}
            onClick={() => editor.chain().focus().toggleHighlight().run()}>
            <Highlighter size={15} />
          </button>

          {/* Text color with swatch picker */}
          <div className="rte-color-wrap">
            <button type="button" title="Text color" className={btn(false)}
              tabIndex={0}>
              <Palette size={15} />
            </button>
            <div className="rte-color-picker" role="listbox" aria-label="Text color">
              {TEXT_COLORS.map(({ label, value: color }) => (
                <button
                  key={label}
                  type="button"
                  role="option"
                  aria-label={label}
                  title={label}
                  className="rte-swatch"
                  style={{ background: color || '#111827', outline: editor.isActive('textStyle', { color }) ? '2px solid #6B7280' : undefined }}
                  onClick={() => {
                    if (color === '') {
                      editor.chain().focus().unsetColor().run();
                    } else {
                      editor.chain().focus().setColor(color).run();
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <button type="button" title="Link" className={btn(editor.isActive('link'))}
            onClick={setLink}>
            <LinkIcon size={15} />
          </button>

          <div className="rte-divider" />

          <button type="button" title="Clear formatting" className={btn(false)}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <RemoveFormatting size={15} />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </>
  );
}

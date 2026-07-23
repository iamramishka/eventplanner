/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  createInvitationDraft,
  DEFAULT_INVITATION_SECTIONS,
  getInvitationThemeCssVars,
  normalizeInvitationTheme,
  renderMarkdownBlocks,
} from '@/lib/invitation-content';

type Props = {
  wedding: any;
  setWedding: (wedding: any) => void;
};


export default function InvitationEditorModule({ wedding, setWedding }: Props) {
  const [draft, setDraft] = useState(() => createInvitationDraft(wedding));
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(createInvitationDraft(wedding));
    setError('');
    setDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      // eslint-disable-next-line react-hooks/immutability
      void saveDraft();
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty]);

  const updateDraft = (patch: Partial<typeof draft>) => {
    setDraft(prev => ({ ...prev, ...patch }));
    setDirty(true);
    setSavedAt(null);
  };

  const updateContent = (key: keyof typeof draft.content, value: string) => {
    setDraft(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));
    setDirty(true);
    setSavedAt(null);
  };

  const saveDraft = async () => {
    if (!draft.weddingTitle.trim()) {
      setError('Wedding title is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = {
        weddingTitle: draft.weddingTitle.trim(),
        profileImage: draft.profileImage.trim() || null,
        invitationContent: draft.content,
        theme: draft.theme,
        sections: {
          ...DEFAULT_INVITATION_SECTIONS,
          ...draft.sections,
        },
        story: draft.content.intro,
      };
      const res = await fetch(`/api/weddings/${wedding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save invitation');
      }
      const updated = await res.json();
      setWedding(updated);
      setSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setDirty(false);
    } catch (saveError: any) {
      setError(saveError?.message || 'Unable to save invitation changes.');
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => {
    setDraft(createInvitationDraft(wedding));
    setError('');
    setDirty(false);
    setSavedAt(null);
  };

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Public Invitation</p>
          <h1 className="module-title">Invitation Editor</h1>
          <p className="module-subtitle">Edit the content couples see on the public invitation, toggle sections, and preview changes live.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="button" variant={mode === 'edit' ? 'primary' : 'outline'} onClick={() => setMode('edit')}>
            Edit
          </Button>
          <Button type="button" variant={mode === 'preview' ? 'primary' : 'outline'} onClick={() => setMode('preview')}>
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={resetDraft}>
            Reset
          </Button>
          <Button type="button" onClick={() => void saveDraft()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {(dirty || savedAt || error) && (
        <div className="success-banner" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span>{error || (dirty ? 'Autosave pending…' : `Saved at ${savedAt}`)}</span>
          {!dirty && savedAt && <span>Preview updates instantly after each save.</span>}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.05fr) minmax(320px, 0.95fr)', minHeight: 720 }}>
          <div style={{ padding: 24, borderRight: '1px solid var(--adm-border-light)' }}>
            {mode === 'edit' ? (
              <div style={{ display: 'grid', gap: 20 }}>
                <section>
                  <div className="settings-section-header">
                    <span style={{ color: 'var(--adm-primary)', fontWeight: 700 }}>Content</span>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <Input label="Invitation title" value={draft.weddingTitle} onChange={e => updateDraft({ weddingTitle: e.target.value })} placeholder="Priya & Kasun" error={error && !draft.weddingTitle.trim() ? error : null} />
                    <Input label="Hero image URL" value={draft.profileImage} onChange={e => updateDraft({ profileImage: e.target.value })} placeholder="/images/wedding-hero.jpg" />
                    <label className="form-label">Intro copy</label>
                    <textarea className="form-input" rows={3} value={draft.content.intro} onChange={e => updateContent('intro', e.target.value)} />
                    <label className="form-label">Message copy</label>
                    <textarea className="form-input" rows={7} value={draft.content.messageMarkdown} onChange={e => updateContent('messageMarkdown', e.target.value)} />
                    <label className="form-label">Details copy</label>
                    <textarea className="form-input" rows={7} value={draft.content.detailsMarkdown} onChange={e => updateContent('detailsMarkdown', e.target.value)} />
                    <label className="form-label">Closing copy</label>
                    <textarea className="form-input" rows={5} value={draft.content.closingMarkdown} onChange={e => updateContent('closingMarkdown', e.target.value)} />
                  </div>
                </section>

              </div>
            ) : (
              <InvitationPreview wedding={{ ...wedding, ...draft, invitationContent: draft.content, theme: draft.theme }} />
            )}
          </div>

          <div style={{ padding: 24, background: `linear-gradient(180deg, ${draft.theme.surfaceColor} 0%, rgba(255,255,255,0.72) 100%)` }}>
            <div className="settings-section-header" style={{ marginBottom: 16 }}>
              <span style={{ color: 'var(--adm-primary)', fontWeight: 700 }}>Live Preview</span>
            </div>
            <InvitationPreview wedding={{ ...wedding, ...draft, invitationContent: draft.content, theme: draft.theme }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="settings-section-header">
          <span style={{ color: 'var(--adm-primary)', fontWeight: 700 }}>Editor Notes</span>
        </div>
        <p className="module-subtitle" style={{ marginBottom: 0 }}>
          Changes are saved to the wedding record used by the public invitation page, so preview and public output stay in sync.
        </p>
      </div>
    </section>
  );
}

export function InvitationPreview({ wedding }: { wedding: any }) {
  const show = (key: string) => wedding.sections?.[key] !== false;
  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;
  const content = wedding.invitationContent || {};
  const theme = normalizeInvitationTheme(wedding.theme);
  const messageBlocks = renderMarkdownBlocks(content.messageMarkdown || '');
  const closingBlocks = renderMarkdownBlocks(content.closingMarkdown || '');

  return (
    <div style={{ display: 'grid', gap: 16, ...getInvitationThemeCssVars(theme), fontFamily: 'var(--theme-body-font)', color: 'var(--theme-text)' }}>
      {show('hero') && (
        <section style={previewHeroCard}>
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 300px)', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'space-between' }}>
              <div>
                <div style={eyebrowPreview}>You are invited</div>
                <h2 style={{ margin: '10px 0 0', fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(2rem, 5vw, 3.8rem)', lineHeight: 1.05, color: 'var(--theme-text)' }}>{title}</h2>
                <p style={{ margin: '12px 0 0', color: 'var(--theme-muted)', lineHeight: 1.7 }}>{content.intro || 'You are warmly invited to celebrate with us.'}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={pillStyle}>{wedding.date || 'Date TBA'}</span>
                <span style={pillStyle}>{wedding.time || 'Time TBA'}</span>
                <span style={pillStyle}>{wedding.venueName || 'Venue TBA'}</span>
              </div>
            </div>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: 'var(--theme-surface)', minHeight: 260, position: 'relative' }}>
              {wedding.profileImage ? (
                <Image src={wedding.profileImage} alt={title} fill sizes="(max-width: 900px) 100vw, 280px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={previewImagePlaceholder}>Hero image preview</div>
              )}
            </div>
          </div>
        </section>
      )}

      {show('details') && (
        <section style={previewSection}>
          <div style={previewLabel}>Wedding Details</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={previewLine}>{wedding.date} • {wedding.time}</div>
            <div style={previewLine}>{wedding.venueName}</div>
            <div style={previewMuted}>{wedding.venueAddress}</div>
          </div>
        </section>
      )}

      {show('message') && (
        <section style={previewSection}>
          {messageBlocks.map((block, index) => renderPreviewBlock(block, index))}
        </section>
      )}

      {show('agenda') && (
        <section style={previewSection}>
          <div style={previewLabel}>Agenda</div>
          <p style={previewMuted}>Agenda items remain connected to the public invitation and can be expanded in the next sprint.</p>
        </section>
      )}

      {show('countdown') && (
        <section style={previewBanner}>
          <div>
            <div style={previewLabel}>Countdown</div>
            <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--theme-text)' }}>Save the date</h3>
          </div>
          <div style={{ fontSize: 18, color: 'var(--theme-muted)' }}>RSVP by {wedding.rsvpDeadline || 'TBA'}</div>
        </section>
      )}

      {show('rsvp') && (
        <section style={previewBanner}>
          <div>
            <div style={previewLabel}>RSVP</div>
            <h3 style={{ margin: '8px 0 0', fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--theme-text)' }}>We’d love to know you’re coming.</h3>
          </div>
          <a href={`/rsvp/${wedding.slug}`} style={previewButton}>Respond now</a>
        </section>
      )}

      {show('specialMessage') && (
        <section style={previewSection}>
          {closingBlocks.map((block, index) => renderPreviewBlock(block, index))}
        </section>
      )}

      {show('venueMap') && wedding.venueName && (
        <section style={previewSection}>
          <div style={previewLabel}>Venue Map</div>
          <a href={wedding.venueMapLink || `https://maps.google.com/?q=${encodeURIComponent(wedding.venueName)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Open directions
          </a>
        </section>
      )}
    </div>
  );
}

function renderPreviewBlock(block: { type: 'heading' | 'paragraph' | 'list'; text?: string; items?: string[] }, index: number) {
  if (block.type === 'heading') {
    return (
      <h3 key={`${block.type}-${index}`} style={{ margin: index === 0 ? 0 : '0 0 10px', fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text)' }}>
        {block.text}
      </h3>
    );
  }

  if (block.type === 'list') {
    return (
      <ul key={`${block.type}-${index}`} style={{ margin: '10px 0 0', paddingLeft: 20 }}>
        {block.items?.map((item, itemIndex) => <li key={itemIndex} style={{ marginTop: itemIndex === 0 ? 0 : 6 }}>{item}</li>)}
      </ul>
    );
  }

  return <p key={`${block.type}-${index}`} style={{ margin: index === 0 ? 0 : '10px 0 0', lineHeight: 1.7 }}>{block.text}</p>;
}

const previewHeroCard: React.CSSProperties = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
  boxShadow: '0 20px 50px color-mix(in srgb, var(--theme-primary) 12%, transparent)',
};

const previewSection: React.CSSProperties = {
  borderRadius: 24,
  padding: 22,
  background: 'rgba(255,255,255,0.82)',
  border: '1px solid color-mix(in srgb, var(--theme-primary) 16%, transparent)',
};

const previewBanner: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: '20px 22px',
  borderRadius: 24,
  background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 14%, transparent), color-mix(in srgb, var(--theme-secondary) 14%, transparent))',
  border: '1px solid color-mix(in srgb, var(--theme-primary) 16%, transparent)',
};

const previewLabel: React.CSSProperties = {
  letterSpacing: 4,
  textTransform: 'uppercase',
  color: 'var(--theme-primary)',
  fontSize: 12,
};

const previewLine: React.CSSProperties = {
  fontSize: 18,
  color: 'var(--theme-text)',
};

const previewMuted: React.CSSProperties = {
  color: 'var(--theme-muted)',
  lineHeight: 1.7,
};

const previewButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 18px',
  borderRadius: 999,
  background: 'var(--theme-primary)',
  color: '#fff',
  textDecoration: 'none',
  boxShadow: '0 14px 30px color-mix(in srgb, var(--theme-primary) 24%, transparent)',
};

const previewImagePlaceholder: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--theme-muted)',
  fontWeight: 600,
};

const eyebrowPreview: React.CSSProperties = {
  letterSpacing: 4,
  textTransform: 'uppercase',
  color: 'var(--theme-primary)',
  fontSize: 12,
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
  color: 'var(--theme-text)',
  fontSize: 13,
};

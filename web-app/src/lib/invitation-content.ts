import type React from 'react';

export type InvitationContent = {
  intro: string;
  messageMarkdown: string;
  detailsMarkdown: string;
  closingMarkdown: string;
};

export type InvitationSectionFlags = {
  loadingScreen: boolean;
  envelope: boolean;
  hero: boolean;
  message: boolean;
  details: boolean;
  countdown: boolean;
  agenda: boolean;
  gallery: boolean;
  rsvp: boolean;
  findTable: boolean;
  specialMessage: boolean;
};

export type InvitationTheme = {
  palettePreset: string;
  fontPreset: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFont: string;
  bodyFont: string;
};

export type InvitationDraft = {
  weddingTitle: string;
  profileImage: string;
  content: InvitationContent;
  sections: InvitationSectionFlags;
  theme: InvitationTheme;
};

export const PALETTE_PRESETS = [
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    description: 'Blush rose, champagne gold, and soft ivory for a classic wedding feel.',
    colors: {
      primaryColor: '#C45A74',
      secondaryColor: '#C9A574',
      accentColor: '#8FA98F',
      surfaceColor: '#FCF8F6',
      textColor: '#2D1520',
      mutedTextColor: '#7D6F6A',
    },
  },
  {
    id: 'champagne-garden',
    name: 'Champagne Garden',
    description: 'Warm champagne, sage, and deep olive for outdoor and garden receptions.',
    colors: {
      primaryColor: '#8FA98F',
      secondaryColor: '#C9A574',
      accentColor: '#D88C6A',
      surfaceColor: '#FBF8EF',
      textColor: '#273627',
      mutedTextColor: '#6E735F',
    },
  },
  {
    id: 'classic-ivory',
    name: 'Classic Ivory',
    description: 'Black tie ivory, charcoal, and antique gold for formal invitations.',
    colors: {
      primaryColor: '#2F2A28',
      secondaryColor: '#B08D57',
      accentColor: '#7B6D8D',
      surfaceColor: '#FFFDF8',
      textColor: '#201A18',
      mutedTextColor: '#7C716A',
    },
  },
] as const;

export const FONT_PRESETS = [
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    headingFont: 'var(--font-serif)',
    bodyFont: 'var(--font-sans)',
    description: 'Editorial serif headings with clean modern body text.',
  },
  {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    headingFont: 'var(--font-sans)',
    bodyFont: 'var(--font-sans)',
    description: 'Crisp, contemporary, and easy to scan on mobile.',
  },
  {
    id: 'soft-classic',
    name: 'Soft Classic',
    headingFont: 'Georgia, serif',
    bodyFont: 'Georgia, serif',
    description: 'A gentle classic serif pairing for romantic long-form copy.',
  },
] as const;

export const DEFAULT_INVITATION_THEME: InvitationTheme = {
  palettePreset: PALETTE_PRESETS[0].id,
  fontPreset: FONT_PRESETS[0].id,
  ...PALETTE_PRESETS[0].colors,
  headingFont: FONT_PRESETS[0].headingFont,
  bodyFont: FONT_PRESETS[0].bodyFont,
};

const DEFAULT_CONTENT: InvitationContent = {
  intro: 'You are warmly invited to celebrate with us.',
  messageMarkdown: `### A joyful day

We are thrilled to share our wedding day with the people we love most.

Please join us for an evening of family, music, and celebration.`,
  detailsMarkdown: `### Event details

- **Date:** {date}
- **Time:** {time}
- **Venue:** {venue}

Please arrive a little early so you can settle in before the ceremony begins.`,
  closingMarkdown: `### With gratitude

Thank you for being part of our story. Your presence means the world to us.`,
};

export const DEFAULT_INVITATION_SECTIONS: InvitationSectionFlags = {
  loadingScreen: true,
  envelope: true,
  hero: true,
  message: true,
  details: true,
  countdown: true,
  agenda: true,
  gallery: true,
  rsvp: true,
  findTable: true,
  specialMessage: true,
};

export function createInvitationDraft(wedding: {
  weddingTitle?: string;
  profileImage?: string | null;
  invitationContent?: Partial<InvitationContent>;
  sections?: Partial<InvitationSectionFlags>;
  theme?: Partial<InvitationTheme> & Record<string, unknown>;
  date?: string;
  time?: string;
  venueName?: string;
}) {
  const content = getInvitationContent(wedding);
  return {
    weddingTitle: wedding.weddingTitle || '',
    profileImage: wedding.profileImage || '',
    content,
    sections: {
      ...DEFAULT_INVITATION_SECTIONS,
      ...(wedding.sections || {}),
    },
    theme: normalizeInvitationTheme(wedding.theme),
  } satisfies InvitationDraft;
}

export function normalizeInvitationTheme(theme?: Partial<InvitationTheme> & Record<string, unknown>): InvitationTheme {
  const source = theme || {};
  const palette =
    PALETTE_PRESETS.find(preset => preset.id === source.palettePreset || preset.name === source.palettePreset) ||
    PALETTE_PRESETS.find(preset => preset.name === source.paletteName) ||
    PALETTE_PRESETS[0];
  const font =
    FONT_PRESETS.find(preset => preset.id === source.fontPreset || preset.name === source.fontPreset || preset.name === source.fontStyle) ||
    FONT_PRESETS[0];

  return {
    palettePreset: palette.id,
    fontPreset: font.id,
    primaryColor: typeof source.primaryColor === 'string' ? source.primaryColor : palette.colors.primaryColor,
    secondaryColor: typeof source.secondaryColor === 'string' ? source.secondaryColor : palette.colors.secondaryColor,
    accentColor: typeof source.accentColor === 'string' ? source.accentColor : palette.colors.accentColor,
    surfaceColor: typeof source.surfaceColor === 'string' ? source.surfaceColor : palette.colors.surfaceColor,
    textColor: typeof source.textColor === 'string' ? source.textColor : palette.colors.textColor,
    mutedTextColor: typeof source.mutedTextColor === 'string' ? source.mutedTextColor : palette.colors.mutedTextColor,
    headingFont: typeof source.headingFont === 'string' ? source.headingFont : font.headingFont,
    bodyFont: typeof source.bodyFont === 'string' ? source.bodyFont : font.bodyFont,
  };
}

export function getInvitationThemeCssVars(theme?: Partial<InvitationTheme> & Record<string, unknown>): React.CSSProperties {
  const normalized = normalizeInvitationTheme(theme);
  return {
    '--theme-primary': normalized.primaryColor,
    '--theme-secondary': normalized.secondaryColor,
    '--theme-accent': normalized.accentColor,
    '--theme-surface': normalized.surfaceColor,
    '--theme-text': normalized.textColor,
    '--theme-muted': normalized.mutedTextColor,
    '--theme-heading-font': normalized.headingFont,
    '--theme-body-font': normalized.bodyFont,
  } as React.CSSProperties;
}

export function getInvitationContent(wedding: {
  date?: string;
  time?: string;
  venueName?: string;
  invitationContent?: Partial<InvitationContent>;
}): InvitationContent {
  const source = wedding.invitationContent || {};
  return {
    intro: source.intro || DEFAULT_CONTENT.intro,
    messageMarkdown: source.messageMarkdown || DEFAULT_CONTENT.messageMarkdown,
    detailsMarkdown: (source.detailsMarkdown || DEFAULT_CONTENT.detailsMarkdown)
      .replace('{date}', wedding.date || 'TBA')
      .replace('{time}', wedding.time || 'TBA')
      .replace('{venue}', wedding.venueName || 'TBA'),
    closingMarkdown: source.closingMarkdown || DEFAULT_CONTENT.closingMarkdown,
  };
}

export function renderMarkdownBlocks(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const blocks: Array<{ type: 'heading' | 'paragraph' | 'list'; text?: string; items?: string[] }> = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: currentList });
      currentList = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', text: line.slice(4) });
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      currentList.push(line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1'));
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

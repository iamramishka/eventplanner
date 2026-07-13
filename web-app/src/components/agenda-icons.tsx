import React from 'react';

/**
 * Custom wedding-agenda line icons (original SVGs, stroke = currentColor).
 * Shared by the couple dashboard (picker + timeline) and the public invitation.
 * Set the color via the parent's `color` / CSS `color`.
 */

export type AgendaIconProps = { size?: number; className?: string; style?: React.CSSProperties };

function Svg({ size = 24, className, style, children }: AgendaIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const DrinksIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M6 4h4l-.6 6.5a1.4 1.4 0 0 1-2.8 0z" />
    <path d="M8 11v7" /><path d="M5.5 18h5" />
    <path d="M14 4h4l-.6 6.5a1.4 1.4 0 0 1-2.8 0z" />
    <path d="M16 11v7" /><path d="M13.5 18h5" />
    <path d="M11 3.2l1.3-1M12.5 4.4l1.4-.5" />
  </Svg>
);

const BellIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M12 3.2a1 1 0 0 1 1 1v.9a5.6 5.6 0 0 1 4.5 5.5c0 3 .8 4 1.5 5.4h-14c.7-1.4 1.5-2.4 1.5-5.4A5.6 5.6 0 0 1 11 5.1v-.9a1 1 0 0 1 1-1z" />
    <path d="M10 16a2 2 0 0 0 4 0" />
  </Svg>
);

const RingIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="15.5" r="4.4" />
    <path d="M8.9 9.6 12 5l3.1 4.6" />
    <path d="M8.9 9.6h6.2" />
    <path d="M12 5l-1.6 4.6M12 5l1.6 4.6" />
  </Svg>
);

const PoruwaIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M4.5 8.5 6 6h12l1.5 2.5z" />
    <path d="M6 8.5v11M18 8.5v11" />
    <path d="M5 19.5h14" />
    <path d="M8.3 19.5v-3h3.4v3M12.3 19.5v-3h3.4v3" />
  </Svg>
);

const RegisterIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M6 3h6l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M12 3v4h4" />
    <path d="M7.5 9.5h4M7.5 12h4.5" />
    <path d="M7.5 15.5c1-1 1.8 1 3 0" />
    <path d="M14.4 18.6l4.2-4.2 1.8 1.8-4.2 4.2-2.4.6z" />
  </Svg>
);

const OilLampIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M5.5 15.3h13c-.7 2-3 3.3-6.5 3.3s-5.8-1.3-6.5-3.3z" />
    <path d="M12 18.6v1.9M8.5 20.5h7" />
    <path d="M18.5 15.3c1.1-.3 1.3-1.3.4-1.7" />
    <path d="M12 11c1.2 1 1.2 2.7 0 3.4-1.2-.7-1.2-2.4 0-3.4z" />
  </Svg>
);

const CakeIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M5 19.5h11v-4.5H5z" />
    <path d="M6.5 15v-3.5h8V15" />
    <path d="M5 17.3h11M6.5 13h8" />
    <path d="M10.5 11.5v-1.2" />
    <path d="M10.5 10.3c-.6-.7-1.7-.1-1.2.8.3.5 1.2.9 1.2.9s.9-.4 1.2-.9c.5-.9-.6-1.5-1.2-.8z" />
    <path d="M13.8 11.2l4.8-4.8 1.7 1.7-4.8 4.8M18.6 6.4l1.4-1.4" />
  </Svg>
);

const MicIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <rect x="9.2" y="3" width="5.6" height="9" rx="2.8" />
    <path d="M6.8 10a5.2 5.2 0 0 0 10.4 0" />
    <path d="M12 15.2v4.3M8.5 20.5h7" />
  </Svg>
);

const CameraIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M4 8.5h3l1.4-2h7.2L17 8.5h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.3" />
    <path d="M17.6 11h1.2" />
  </Svg>
);

const DiningIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M3.2 4v4M4 4v4M4.8 4v4M3.2 8h1.6M4 8v12" />
    <path d="M20 20v-9" />
    <path d="M20 4c-1.5 0-2.3 1.5-2.3 3.2S18.5 11 20 11z" />
  </Svg>
);

const MusicIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M9 18V6.6l9-2.1V15.5" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="16" cy="15.5" r="2" />
    <path d="M9 9.6l9-2.1" />
  </Svg>
);

const DanceIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="5.2" r="1.7" />
    <path d="M9 6.9v5.6" />
    <path d="M9 12.5l-1.4 6.8M9 12.5l1.8 4.2" />
    <path d="M9 9l3.2 1.6" />
    <circle cx="15.6" cy="5.2" r="1.7" />
    <path d="M15.6 6.9c-.4 3 .6 5-1.1 7.2" />
    <path d="M13 19.3h4l-1.4-6.2" />
    <path d="M15.6 9l-3.4 1.6" />
  </Svg>
);

const HeartIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M12 20S4.5 15.5 4.5 9.8A3.6 3.6 0 0 1 12 7.2a3.6 3.6 0 0 1 7.5 2.6C19.5 15.5 12 20 12 20z" />
  </Svg>
);

const DepartureIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <path d="M21 3 3 10.6l6.2 2.2 2.2 6.2 3.7-4.6z" />
    <path d="M9.2 12.8 21 3" />
    <path d="M3.4 20.6c-.7-.8.4-1.8 1.1-1.1.7-.7 1.8.3 1.1 1.1-.4.4-1.1 1-1.1 1s-.7-.6-1.1-1z" strokeDasharray="0.1 2" />
  </Svg>
);

const CalendarIcon = (p: AgendaIconProps) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4" />
  </Svg>
);

/** The selectable icon library shown in the dashboard picker. */
export const AGENDA_ICON_SET: { value: string; label: string; Icon: React.FC<AgendaIconProps> }[] = [
  { value: 'drinks', label: 'Drinks', Icon: DrinksIcon },
  { value: 'bell', label: 'Bell', Icon: BellIcon },
  { value: 'ring', label: 'Ring', Icon: RingIcon },
  { value: 'poruwa', label: 'Poruwa', Icon: PoruwaIcon },
  { value: 'register', label: 'Register', Icon: RegisterIcon },
  { value: 'oillamp', label: 'Oil Lamp', Icon: OilLampIcon },
  { value: 'cake', label: 'Cake', Icon: CakeIcon },
  { value: 'mic', label: 'Speech', Icon: MicIcon },
  { value: 'camera', label: 'Photos', Icon: CameraIcon },
  { value: 'dining', label: 'Dining', Icon: DiningIcon },
  { value: 'music', label: 'Music', Icon: MusicIcon },
  { value: 'dance', label: 'Dance', Icon: DanceIcon },
  { value: 'heart', label: 'Love', Icon: HeartIcon },
  { value: 'departure', label: 'Departure', Icon: DepartureIcon },
  { value: 'calendar', label: 'General', Icon: CalendarIcon },
];

const ICON_MAP: Record<string, React.FC<AgendaIconProps>> = Object.fromEntries(
  AGENDA_ICON_SET.map(i => [i.value, i.Icon]),
);

// Back-compat: map older stored icon keys (lucide names) onto the new set.
const ALIASES: Record<string, string> = {
  GlassWater: 'drinks', Bell: 'bell', Diamond: 'ring', Ring: 'ring', Gem: 'ring',
  Heart: 'heart', FileText: 'register', FileSignature: 'register',
  Sparkles: 'oillamp', Flame: 'oillamp', Gift: 'cake', Cake: 'cake',
  Mic2: 'mic', Mic: 'mic', Camera: 'camera', Utensils: 'dining', Music: 'music',
  Navigation: 'departure', Car: 'departure', Users: 'dance', PartyPopper: 'cake',
  Star: 'heart', MapPin: 'calendar', CalendarDays: 'calendar', Calendar: 'calendar',
};

export function resolveAgendaIconKey(key?: string | null): string {
  const k = String(key || '').trim();
  if (ICON_MAP[k]) return k;
  if (ALIASES[k]) return ALIASES[k];
  return 'calendar';
}

/** Render an agenda icon by key (new key or legacy lucide name). */
export function AgendaIcon({ icon, size = 24, style, className }: { icon?: string | null } & AgendaIconProps) {
  const Icon = ICON_MAP[resolveAgendaIconKey(icon)] || CalendarIcon;
  return <Icon size={size} style={style} className={className} />;
}

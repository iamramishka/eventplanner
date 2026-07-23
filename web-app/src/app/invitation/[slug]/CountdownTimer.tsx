'use client';

import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { formatEventDateTime, getZonedDateTimeMs } from './invitation-date';

type CountdownTimerProps = {
  date?: string;
  time?: string;
  timezone?: string;
};

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: 'missing' | 'upcoming' | 'past';
};

const EMPTY_COUNTDOWN: CountdownValue = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  status: 'missing',
};

function getCountdown(targetMs: number): CountdownValue {
  if (!Number.isFinite(targetMs)) return EMPTY_COUNTDOWN;

  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { ...EMPTY_COUNTDOWN, status: 'past' };
  }

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    status: 'upcoming',
  };
}

export default function CountdownTimer({ date, time, timezone = 'UTC' }: CountdownTimerProps) {
  const targetMs = useMemo(() => (date ? getZonedDateTimeMs(date, time || '00:00', timezone) : Number.NaN), [date, time, timezone]);
  const eventLabel = useMemo(() => formatEventDateTime(date, time, timezone), [date, time, timezone]);
  // Start with zeros but correct status — avoids SSR/client Date.now() mismatch.
  const [countdown, setCountdown] = useState<CountdownValue>(() =>
    Number.isFinite(targetMs) && targetMs > Date.now()
      ? { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'upcoming' }
      : EMPTY_COUNTDOWN
  );

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return undefined;

    setCountdown(getCountdown(targetMs));
    const interval = window.setInterval(() => {
      setCountdown(getCountdown(targetMs));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [targetMs]);

  if (countdown.status === 'missing') {
    return (
      <div data-testid="public-countdown" data-countdown-status="missing" data-event-timezone={timezone}>
        <div style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#4b2230', marginTop: 8 }}>Date to be announced</div>
        <div style={countdownMutedStyle}>We will share the exact celebration time soon.</div>
      </div>
    );
  }

  return (
    <div
      data-testid="public-countdown"
      data-countdown-status={countdown.status}
      data-event-timezone={timezone}
      data-event-label={eventLabel}
      data-target-ms={Number.isFinite(targetMs) ? String(targetMs) : ''}
      role="timer"
      aria-label={`Countdown to ${eventLabel}`}
    >
      <div style={countdownGridStyle}>
        <CountdownUnit value={countdown.days} label="Days" />
        <CountdownUnit value={countdown.hours} label="Hours" />
        <CountdownUnit value={countdown.minutes} label="Minutes" />
        <CountdownUnit value={countdown.seconds} label="Seconds" />
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span style={countdownUnitStyle}>
      <strong style={countdownNumberStyle}>{String(value).padStart(2, '0')}</strong>
      <span style={countdownLabelStyle}>{label}</span>
    </span>
  );
}

const countdownGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(58px, 1fr))',
  gap: 10,
  marginTop: 14,
};

const countdownUnitStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  justifyItems: 'center',
  padding: '12px 8px',
  borderRadius: 16,
  background: 'rgba(196,90,116,0.08)',
  border: '1px solid rgba(153, 90, 109, 0.12)',
};

const countdownNumberStyle: React.CSSProperties = {
  color: '#4b2230',
  fontSize: 'clamp(1.4rem, 4vw, 2.1rem)',
  lineHeight: 1,
};

const countdownLabelStyle: React.CSSProperties = {
  color: '#9a5a6d',
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
};

const countdownMutedStyle: React.CSSProperties = {
  marginTop: 12,
  color: '#6b4a56',
  lineHeight: 1.5,
};

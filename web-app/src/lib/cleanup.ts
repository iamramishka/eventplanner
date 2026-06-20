/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, deleteGuest, deleteRsvp } from './store';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

type CleanupOptions = {
  retentionDays?: number;
  dryRun?: boolean;
  force?: boolean;
};

const DEFAULT_RETENTION = 30;
const LOG_PATH = path.join(process.cwd(), 'logs', 'cleanup.log');

function appendLog(line: string) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${line}\n`);
  } catch {
    // ignore logging failures in dev
  }
}

export function findCleanupCandidates(retentionDays = DEFAULT_RETENTION) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const weddings = db.weddings.findMany().filter((w: any) => {
    const created = w?.createdAt ? new Date(w.createdAt).getTime() : 0;
    return (w?.isTrial === true || w?.trialExpiry) && created && created < cutoff;
  });

  const weddingIds = new Set(weddings.map((w: any) => w.id));

  const guests = db.guests.findMany(() => true).filter((g: any) => {
    return weddingIds.has(g.weddingId);
  });

  const rsvps = db.rsvps.findMany(() => true).filter((r: any) => {
    return weddingIds.has(r.weddingId);
  });

  return { weddings, guests, rsvps };
}

export function performCleanup(opts: CleanupOptions = {}) {
  const retentionDays = opts.retentionDays ?? DEFAULT_RETENTION;
  const dryRun = opts.dryRun !== false ? true : false; // default true
  const force = !!opts.force;

  const candidates = findCleanupCandidates(retentionDays);
  const report: any = {
    retentionDays,
    dryRun,
    force,
    weddingCount: candidates.weddings.length,
    guestCount: candidates.guests.length,
    rsvpCount: candidates.rsvps.length,
    deleted: { guests: [], rsvps: [] },
    errors: []
  };

  if (dryRun) {
    appendLog(`DRY-RUN summary: weddings=${report.weddingCount} guests=${report.guestCount} rsvps=${report.rsvpCount}`);
    return report;
  }

  if (!force) {
    report.errors.push('force flag required to perform destructive cleanup');
    appendLog('Attempted destructive cleanup without force flag');
    return report;
  }

  // Delete RSVPs first
  for (const r of candidates.rsvps) {
    try {
      const removed = deleteRsvp(r.id);
      if (removed) report.deleted.rsvps.push(removed.id);
    } catch (e: any) {
      report.errors.push(String(e?.message || e));
    }
  }

  // Delete Guests
  for (const g of candidates.guests) {
    try {
      const removed = deleteGuest(g.id);
      if (removed) report.deleted.guests.push(removed.id);
    } catch (e: any) {
      report.errors.push(String(e?.message || e));
    }
  }

  // Mark weddings as trialExpired instead of deleting
  for (const w of candidates.weddings) {
    try {
      const existing = db.weddings.findUnique((x: any) => x.id === w.id);
      if (existing) existing.trialExpired = true;
    } catch (e: any) {
      report.errors.push(String(e?.message || e));
    }
  }

  appendLog(`EXECUTED cleanup: deletedGuests=${report.deleted.guests.length} deletedRsvps=${report.deleted.rsvps.length} weddingsMarked=${report.weddingCount}`);
  return report;
}

export function generateConfirmationToken() {
  return crypto.randomBytes(12).toString('hex');
}

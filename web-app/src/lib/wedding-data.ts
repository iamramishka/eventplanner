// Supabase-backed data access for couple planning modules (guests, RSVPs, agenda,
// budget, checklist, tables). Translates between the dashboard's legacy field shapes
// and the Supabase column names so the existing UI keeps working unchanged.

import { randomBytes } from 'crypto';
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase-db';
import { CHECKLIST_STARTER_TEMPLATES, calculateBudgetSummary, BUDGET_CATEGORIES, BUDGET_STATUSES } from '@/lib/store';

function nowIso() {
  return new Date().toISOString();
}

function genGuestToken() {
  return `rsvp_${randomBytes(18).toString('base64url')}`;
}

/* ════════════════ GUESTS ════════════════ */

export interface GuestRow {
  id: string;
  weddingId: string;
  name: string;
  side: string | null;
  whatsappCountryCode: string | null;
  whatsappNumber: string | null;
  email: string | null;
  invitationType: string | null;
  maxAllowedMembers: number | null;
  note: string | null;
  inviteToken: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DashboardGuest {
  id: string;
  weddingId: string;
  name: string;
  side: string;
  whatsapp: string;
  email: string;
  type: string;
  maxMembers: number;
  notes: string;
  token: string;
  rsvpStatus: string;
}

function toDashboardGuest(row: GuestRow, rsvpStatus = 'Pending'): DashboardGuest {
  const code = row.whatsappCountryCode || '';
  const num = row.whatsappNumber || '';
  return {
    id: row.id,
    weddingId: row.weddingId,
    name: row.name || '',
    side: row.side || 'Guest',
    whatsapp: code && num ? `${code}${num}` : num,
    email: row.email || '',
    type: row.invitationType || 'Individual',
    maxMembers: row.maxAllowedMembers ?? 1,
    notes: row.note || '',
    token: row.inviteToken || '',
    rsvpStatus,
  };
}

/** Map an incoming dashboard-shaped guest payload to Supabase columns. */
function toGuestColumns(data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (data.name !== undefined) out.name = String(data.name || '');
  if (data.side !== undefined) out.side = String(data.side || 'Guest');
  if (data.whatsapp !== undefined) out.whatsappNumber = String(data.whatsapp || '');
  if (data.email !== undefined) out.email = String(data.email || '');
  if (data.type !== undefined) out.invitationType = String(data.type || 'Individual');
  if (data.maxMembers !== undefined) out.maxAllowedMembers = Number(data.maxMembers) || 1;
  if (data.notes !== undefined) out.note = String(data.notes || '');
  return out;
}

export async function listGuests(weddingId: string): Promise<DashboardGuest[]> {
  const guests = await dbSelect<GuestRow>('Guest', { weddingId: `eq.${weddingId}`, order: 'createdAt.asc' }, '*', 1000);
  if (guests.length === 0) return [];
  const ids = guests.map((g) => g.id).join(',');
  const rsvps = await dbSelect<{ guestId: string; status: string }>(
    'GuestRsvp', { guestId: `in.(${ids})` }, 'guestId,status', guests.length,
  );
  const statusByGuest = new Map(rsvps.map((r) => [r.guestId, r.status]));
  return guests.map((g) => toDashboardGuest(g, mapRsvpStatusLabel(statusByGuest.get(g.id))));
}

export async function getGuestRow(id: string): Promise<GuestRow | null> {
  const rows = await dbSelect<GuestRow>('Guest', { id: `eq.${id}` }, '*', 1);
  return rows[0] || null;
}

export async function createGuest(weddingId: string, data: Record<string, unknown>): Promise<DashboardGuest> {
  const cols = toGuestColumns(data);
  const maxMembers = Number(cols.maxAllowedMembers ?? (data.type === 'Family' ? 4 : 1));
  if (maxMembers < 1 || maxMembers > 20) throw new Error('maxMembers must be between 1 and 20');

  const row = await dbInsert<GuestRow>('Guest', {
    id: crypto.randomUUID(),
    weddingId,
    name: cols.name ?? '',
    side: cols.side ?? 'Guest',
    whatsappNumber: cols.whatsappNumber ?? '',
    whatsappCountryCode: '',
    email: cols.email ?? '',
    invitationType: cols.invitationType ?? 'Individual',
    maxAllowedMembers: maxMembers,
    note: cols.note ?? '',
    inviteToken: genGuestToken(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  return toDashboardGuest(row);
}

export async function updateGuestById(id: string, data: Record<string, unknown>): Promise<DashboardGuest | null> {
  const cols = toGuestColumns(data);
  if (cols.maxAllowedMembers !== undefined) {
    const m = Number(cols.maxAllowedMembers);
    if (m < 1 || m > 20) throw new Error('maxMembers must be between 1 and 20');
  }
  cols.updatedAt = nowIso();
  await dbUpdate('Guest', { id: `eq.${id}` }, cols);
  const row = await getGuestRow(id);
  return row ? toDashboardGuest(row) : null;
}

export async function deleteGuestById(id: string): Promise<boolean> {
  const row = await getGuestRow(id);
  if (!row) return false;
  // Cascade: remove RSVPs (+ members) and table assignments for this guest.
  const rsvps = await dbSelect<{ id: string }>('GuestRsvp', { guestId: `eq.${id}` }, 'id', 100);
  for (const r of rsvps) {
    await dbDelete('GuestRsvpMember', { guestRsvpId: `eq.${r.id}` }).catch(() => {});
  }
  await dbDelete('GuestRsvp', { guestId: `eq.${id}` }).catch(() => {});
  await dbDelete('TableAssignment', { guestId: `eq.${id}` }).catch(() => {});
  await dbDelete('Guest', { id: `eq.${id}` });
  return true;
}

export function guestSumMembers(guests: DashboardGuest[]): number {
  return guests.reduce((t, g) => t + (Number(g.maxMembers) || 1), 0);
}

export async function importGuestRows(rows: Array<Record<string, unknown>>): Promise<DashboardGuest[]> {
  const created: DashboardGuest[] = [];
  for (const row of rows) {
    const weddingId = String(row.weddingId || row.weddingid || row.wedding || '');
    const name = String(row.name || '').trim();
    if (!weddingId || !name) continue;
    const guest = await createGuest(weddingId, {
      name,
      side: row.side,
      whatsapp: row.whatsapp,
      email: row.email,
      type: row.type,
      maxMembers: row.maxMembers ? Number(row.maxMembers) : undefined,
      notes: row.notes,
    });
    // Pre-seed RSVP preferences if meal or liquor data was provided in the import
    const mealPref = String(row.mealPreference || '').trim();
    const liquorPref = String(row.liquorPreference || '').trim();
    if (mealPref || liquorPref) {
      const guestRow = await getGuestRow(guest.id);
      if (guestRow) {
        await upsertRsvpForGuest(guestRow, {
          attending: true,
          memberCount: guest.maxMembers,
          mealPreference: mealPref,
          liquorPreference: liquorPref,
        });
      }
    }
    created.push(guest);
  }
  return created;
}

/* ════════════════ AGENDA ════════════════ */

interface AgendaRow {
  id: string;
  weddingId: string;
  title: string;
  eventTime: string | null;
  durationMinutes: number | null;
  description: string | null;
  iconKey: string | null;
  sortOrder: number | null;
}

export interface DashboardAgenda {
  id: string;
  weddingId: string;
  title: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  description: string;
  icon: string;
  sortOrder: number;
}

// Agenda times are stored as a timestamp on a fixed base date; only HH:mm matters.
const AGENDA_BASE_DATE = '2000-01-01';

function hhmmFromTs(ts?: string | null): string {
  if (!ts) return '';
  const norm = ts.includes('T') ? ts : ts.replace(' ', 'T');
  const d = new Date(norm.endsWith('Z') ? norm : `${norm}Z`);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60) + (m || 0);
}

function addMinutesHHMM(hhmm: string, mins: number): string {
  const total = minutesOf(hhmm) + (mins || 0);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function toDashboardAgenda(row: AgendaRow): DashboardAgenda {
  const start = hhmmFromTs(row.eventTime);
  const end = start ? addMinutesHHMM(start, row.durationMinutes || 0) : '';
  return {
    id: row.id,
    weddingId: row.weddingId,
    title: row.title || '',
    startTime: start,
    endTime: end,
    timezone: 'UTC',
    location: '',
    description: row.description || '',
    icon: row.iconKey || 'CalendarDays',
    sortOrder: row.sortOrder ?? 0,
  };
}

export async function listAgenda(weddingId: string): Promise<DashboardAgenda[]> {
  const rows = await dbSelect<AgendaRow>('AgendaItem', { weddingId: `eq.${weddingId}`, order: 'sortOrder.asc' }, '*', 200);
  return rows.map(toDashboardAgenda);
}

export async function createAgenda(weddingId: string, data: {
  title: string; startTime: string; endTime?: string; description?: string; icon?: string;
}): Promise<DashboardAgenda> {
  const existing = await dbSelect<AgendaRow>('AgendaItem', { weddingId: `eq.${weddingId}` }, 'sortOrder', 200);
  const nextOrder = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0) + 1;
  const duration = data.endTime ? minutesOf(data.endTime) - minutesOf(data.startTime) : null;
  const row = await dbInsert<AgendaRow>('AgendaItem', {
    id: crypto.randomUUID(),
    weddingId,
    title: data.title,
    eventTime: `${AGENDA_BASE_DATE}T${data.startTime}:00`,
    durationMinutes: duration,
    description: data.description || '',
    iconKey: data.icon || 'CalendarDays',
    sortOrder: nextOrder,
  });
  return toDashboardAgenda(row);
}

export async function updateAgendaById(id: string, data: Record<string, unknown>): Promise<DashboardAgenda | null> {
  const cols: Record<string, unknown> = {};
  if (data.title !== undefined) cols.title = String(data.title).trim();
  if (data.description !== undefined) cols.description = String(data.description || '').trim();
  if (data.icon !== undefined) cols.iconKey = String(data.icon || 'CalendarDays').trim();
  if (data.startTime !== undefined) {
    cols.eventTime = `${AGENDA_BASE_DATE}T${String(data.startTime)}:00`;
    cols.durationMinutes = data.endTime ? minutesOf(String(data.endTime)) - minutesOf(String(data.startTime)) : null;
  }
  await dbUpdate('AgendaItem', { id: `eq.${id}` }, cols);
  const rows = await dbSelect<AgendaRow>('AgendaItem', { id: `eq.${id}` }, '*', 1);
  return rows[0] ? toDashboardAgenda(rows[0]) : null;
}

export async function reorderAgenda(weddingId: string, orderedIds: string[]): Promise<DashboardAgenda[]> {
  await Promise.all(orderedIds.map((id, i) => dbUpdate('AgendaItem', { id: `eq.${id}` }, { sortOrder: i + 1 })));
  return listAgenda(weddingId);
}

export async function deleteAgendaById(id: string): Promise<boolean> {
  const rows = await dbSelect<AgendaRow>('AgendaItem', { id: `eq.${id}` }, 'id', 1);
  if (!rows[0]) return false;
  await dbDelete('AgendaItem', { id: `eq.${id}` });
  return true;
}

/* ════════════════ CHECKLIST ════════════════ */

interface ChecklistGroupRow { id: string; weddingId: string; title: string; sortOrder: number | null }
interface ChecklistItemRow {
  id: string; weddingId: string; groupId: string | null; title: string; description: string | null;
  isCompleted: boolean | null; dueDate: string | null; priority: string | null; reminderAt: string | null;
  state: string | null; templateId: string | null;
}

export interface DashboardChecklistItem {
  id: string; weddingId: string; group: string; title: string; description: string;
  state: string; isCompleted: boolean; priority: string; dueDate: string; reminderAt: string;
  templateId: string; createdAt: string; updatedAt: string;
}

function dateOnlyVal(ts?: string | null): string {
  return ts ? ts.slice(0, 10) : '';
}

function normalizeChecklistState(item: { isCompleted: boolean; dueDate: string; state: string }): string {
  if (item.isCompleted) return 'completed';
  if (!item.dueDate) return item.state || 'pending';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${item.dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due-soon';
  return item.state || 'pending';
}

async function getOrCreateChecklistGroup(weddingId: string, title: string): Promise<string> {
  const name = title || '3 months before';
  const existing = await dbSelect<ChecklistGroupRow>(
    'ChecklistGroup',
    { weddingId: `eq.${weddingId}`, title: `eq.${name}` }, 'id', 1,
  );
  if (existing[0]) return existing[0].id;
  const all = await dbSelect<ChecklistGroupRow>('ChecklistGroup', { weddingId: `eq.${weddingId}` }, 'sortOrder', 100);
  const nextOrder = all.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0) + 1;
  const row = await dbInsert<ChecklistGroupRow>('ChecklistGroup', {
    id: crypto.randomUUID(), weddingId, title: name, sortOrder: nextOrder,
  });
  return row.id;
}

function toDashboardChecklist(row: ChecklistItemRow, groupName: string): DashboardChecklistItem {
  const base = {
    isCompleted: !!row.isCompleted,
    dueDate: dateOnlyVal(row.dueDate),
    state: row.state || 'pending',
  };
  return {
    id: row.id,
    weddingId: row.weddingId,
    group: groupName || '3 months before',
    title: row.title || '',
    description: row.description || '',
    state: normalizeChecklistState(base),
    isCompleted: base.isCompleted,
    priority: row.priority || 'medium',
    dueDate: base.dueDate,
    reminderAt: row.reminderAt || '',
    templateId: row.templateId || '',
    createdAt: '',
    updatedAt: '',
  };
}

export async function listChecklist(weddingId: string): Promise<DashboardChecklistItem[]> {
  const [items, groups] = await Promise.all([
    dbSelect<ChecklistItemRow>('ChecklistItem', { weddingId: `eq.${weddingId}` }, '*', 1000),
    dbSelect<ChecklistGroupRow>('ChecklistGroup', { weddingId: `eq.${weddingId}` }, '*', 200),
  ]);
  const groupName = new Map(groups.map((g) => [g.id, g.title]));
  return items.map((it) => toDashboardChecklist(it, groupName.get(it.groupId || '') || ''));
}

export async function createChecklistItem(weddingId: string, data: Record<string, unknown>): Promise<DashboardChecklistItem> {
  const title = String(data.title || '').trim();
  if (!title) throw new Error('title required');
  const groupName = String(data.group || '3 months before');
  const groupId = await getOrCreateChecklistGroup(weddingId, groupName);
  const isCompleted = Boolean(data.isCompleted);
  const row = await dbInsert<ChecklistItemRow>('ChecklistItem', {
    id: crypto.randomUUID(),
    weddingId,
    groupId,
    title,
    description: String(data.description || ''),
    isCompleted,
    dueDate: data.dueDate ? new Date(`${String(data.dueDate).slice(0, 10)}T00:00:00.000Z`) : null,
    priority: String(data.priority || 'medium'),
    reminderAt: data.reminderAt ? new Date(String(data.reminderAt)) : null,
    state: isCompleted ? 'completed' : String(data.state || 'pending'),
    templateId: String(data.templateId || ''),
  });
  return toDashboardChecklist(row, groupName);
}

export async function updateChecklistItemById(id: string, data: Record<string, unknown>): Promise<DashboardChecklistItem | null> {
  const rows = await dbSelect<ChecklistItemRow>('ChecklistItem', { id: `eq.${id}` }, '*', 1);
  const existing = rows[0];
  if (!existing) return null;

  const cols: Record<string, unknown> = {};
  if (data.title !== undefined) {
    const t = String(data.title).trim();
    if (!t) throw new Error('title required');
    cols.title = t;
  }
  if (data.description !== undefined) cols.description = String(data.description || '');
  if (data.priority !== undefined) cols.priority = String(data.priority || 'medium');
  if (data.dueDate !== undefined) cols.dueDate = data.dueDate ? new Date(`${String(data.dueDate).slice(0, 10)}T00:00:00.000Z`) : null;
  if (data.reminderAt !== undefined) cols.reminderAt = data.reminderAt ? new Date(String(data.reminderAt)) : null;
  if (data.templateId !== undefined) cols.templateId = String(data.templateId || '');

  let groupName = '';
  let groupId = existing.groupId;
  if (data.group !== undefined) {
    groupName = String(data.group);
    groupId = await getOrCreateChecklistGroup(existing.weddingId, groupName);
    cols.groupId = groupId;
  }

  if (data.isCompleted === true) { cols.isCompleted = true; cols.state = 'completed'; }
  else if (data.isCompleted === false) { cols.isCompleted = false; cols.state = String(data.state || 'pending'); }
  else if (data.state !== undefined) { cols.state = String(data.state); }

  await dbUpdate('ChecklistItem', { id: `eq.${id}` }, cols);

  if (!groupName && groupId) {
    const g = await dbSelect<ChecklistGroupRow>('ChecklistGroup', { id: `eq.${groupId}` }, 'title', 1);
    groupName = g[0]?.title || '';
  }
  const updated = await dbSelect<ChecklistItemRow>('ChecklistItem', { id: `eq.${id}` }, '*', 1);
  return updated[0] ? toDashboardChecklist(updated[0], groupName) : null;
}

export async function toggleChecklistItemById(id: string, isCompleted?: boolean): Promise<DashboardChecklistItem | null> {
  const rows = await dbSelect<ChecklistItemRow>('ChecklistItem', { id: `eq.${id}` }, 'isCompleted', 1);
  if (!rows[0]) return null;
  const next = typeof isCompleted === 'boolean' ? isCompleted : !rows[0].isCompleted;
  return updateChecklistItemById(id, { isCompleted: next, state: next ? 'completed' : 'pending' });
}

export async function deleteChecklistItemById(id: string): Promise<boolean> {
  const rows = await dbSelect<ChecklistItemRow>('ChecklistItem', { id: `eq.${id}` }, 'id', 1);
  if (!rows[0]) return false;
  await dbDelete('ChecklistItem', { id: `eq.${id}` });
  return true;
}

export function getChecklistTemplates() {
  return CHECKLIST_STARTER_TEMPLATES.map(({ id, name, description, tasks }) => ({
    id, name, description, taskCount: tasks.length,
  }));
}

function addDaysIso(dateStr: string, days: number): string {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export async function applyChecklistTemplateById(weddingId: string, templateId: string) {
  const template = CHECKLIST_STARTER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error('template not found');

  const wedRows = await dbSelect<{ eventDate: string | null }>('Wedding', { id: `eq.${weddingId}` }, 'eventDate', 1);
  const weddingDate = wedRows[0]?.eventDate ? wedRows[0].eventDate.slice(0, 10) : '';

  const current = await listChecklist(weddingId);
  const existingKeys = new Set(current.map((i) => `${i.templateId}:${i.title.toLowerCase()}`));

  const created: DashboardChecklistItem[] = [];
  for (const task of template.tasks) {
    const key = `${template.id}:${task.title.toLowerCase()}`;
    if (existingKeys.has(key)) continue;
    created.push(await createChecklistItem(weddingId, {
      group: task.group,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: addDaysIso(weddingDate, task.dueOffsetDays),
      reminderAt: `${addDaysIso(weddingDate, task.reminderOffsetDays)}T09:00`,
      templateId,
    }));
  }

  return {
    template: getChecklistTemplates().find((t) => t.id === templateId),
    created,
    items: await listChecklist(weddingId),
  };
}

/* ════════════════ BUDGET ════════════════ */

interface BudgetCategoryRow { id: string; weddingId: string; name: string; isDefault: boolean | null }
interface BudgetItemRow {
  id: string; weddingId: string; categoryId: string | null; title: string;
  estimatedAmount: number | null; actualAmount: number | null; paidAmount: number | null;
  note: string | null; dueDate: string | null; status: string | null;
}

export interface DashboardBudgetItem {
  id: string; weddingId: string; category: string; name: string;
  estimated: number; actual: number; status: string; notes: string;
  createdAt: string; updatedAt: string;
}

function assertBudgetCategory(category: unknown): string {
  const normalized = String(category || '').trim();
  if (!(BUDGET_CATEGORIES as readonly string[]).includes(normalized)) throw new Error('Invalid budget category');
  return normalized;
}

function assertBudgetStatus(status: unknown): string {
  const normalized = String(status || '').trim().toLowerCase();
  if (!(BUDGET_STATUSES as readonly string[]).includes(normalized)) throw new Error('Invalid budget status');
  return normalized;
}

function normalizeAmount(value: unknown): number {
  if (value === '' || value === null || value === undefined) return 0;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Budget amounts must be non-negative numbers');
  return Math.round(amount);
}

async function getOrCreateBudgetCategory(weddingId: string, name: string): Promise<string> {
  const existing = await dbSelect<BudgetCategoryRow>(
    'BudgetCategory', { weddingId: `eq.${weddingId}`, name: `eq.${name}` }, 'id', 1,
  );
  if (existing[0]) return existing[0].id;
  const row = await dbInsert<BudgetCategoryRow>('BudgetCategory', {
    id: crypto.randomUUID(), weddingId, name, isDefault: false,
  });
  return row.id;
}

function toDashboardBudgetItem(row: BudgetItemRow, categoryName: string): DashboardBudgetItem {
  return {
    id: row.id,
    weddingId: row.weddingId,
    category: categoryName || 'Other',
    name: row.title || '',
    estimated: Number(row.estimatedAmount || 0),
    actual: Number(row.actualAmount || 0),
    status: row.status || 'planned',
    notes: row.note || '',
    createdAt: '',
    updatedAt: '',
  };
}

export async function listBudgetItems(weddingId: string): Promise<DashboardBudgetItem[]> {
  const [items, cats] = await Promise.all([
    dbSelect<BudgetItemRow>('BudgetItem', { weddingId: `eq.${weddingId}` }, '*', 1000),
    dbSelect<BudgetCategoryRow>('BudgetCategory', { weddingId: `eq.${weddingId}` }, '*', 200),
  ]);
  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const mapped = items.map((it) => toDashboardBudgetItem(it, catName.get(it.categoryId || '') || 'Other'));
  // Sort by category order, then name (mirrors the file store).
  return mapped.sort((a, b) =>
    BUDGET_CATEGORIES.indexOf(a.category as never) - BUDGET_CATEGORIES.indexOf(b.category as never)
    || a.name.localeCompare(b.name));
}

export async function getBudgetResponse(weddingId: string) {
  const items = await listBudgetItems(weddingId);
  return {
    weddingId,
    scenarioNote: '',
    items,
    ...calculateBudgetSummary(items as never),
  };
}

export async function addBudgetItemRow(weddingId: string, data: Record<string, unknown>): Promise<DashboardBudgetItem> {
  const category = assertBudgetCategory(data.category || 'Other');
  const name = String(data.name || '').trim();
  if (!name) throw new Error('Budget item name required');
  const categoryId = await getOrCreateBudgetCategory(weddingId, category);
  const row = await dbInsert<BudgetItemRow>('BudgetItem', {
    id: crypto.randomUUID(),
    weddingId,
    categoryId,
    title: name,
    estimatedAmount: normalizeAmount(data.estimated),
    actualAmount: normalizeAmount(data.actual),
    paidAmount: 0,
    note: String(data.notes || '').trim(),
    dueDate: null,
    status: assertBudgetStatus(data.status || 'planned'),
  });
  return toDashboardBudgetItem(row, category);
}

export async function updateBudgetItemRow(id: string, data: Record<string, unknown>): Promise<DashboardBudgetItem | null> {
  const rows = await dbSelect<BudgetItemRow>('BudgetItem', { id: `eq.${id}` }, '*', 1);
  const existing = rows[0];
  if (!existing) return null;

  const cols: Record<string, unknown> = {};
  let categoryName = '';
  if (data.category !== undefined) {
    categoryName = assertBudgetCategory(data.category);
    cols.categoryId = await getOrCreateBudgetCategory(existing.weddingId, categoryName);
  }
  if (data.name !== undefined) {
    const n = String(data.name || '').trim();
    if (!n) throw new Error('Budget item name required');
    cols.title = n;
  }
  if (data.estimated !== undefined) cols.estimatedAmount = normalizeAmount(data.estimated);
  if (data.actual !== undefined) cols.actualAmount = normalizeAmount(data.actual);
  if (data.status !== undefined) cols.status = assertBudgetStatus(data.status);
  if (data.notes !== undefined) cols.note = String(data.notes || '').trim();

  await dbUpdate('BudgetItem', { id: `eq.${id}` }, cols);

  if (!categoryName) {
    const c = await dbSelect<BudgetCategoryRow>('BudgetCategory', { id: `eq.${existing.categoryId}` }, 'name', 1);
    categoryName = c[0]?.name || 'Other';
  }
  const updated = await dbSelect<BudgetItemRow>('BudgetItem', { id: `eq.${id}` }, '*', 1);
  return updated[0] ? toDashboardBudgetItem(updated[0], categoryName) : null;
}

export async function deleteBudgetItemRow(id: string): Promise<boolean> {
  const rows = await dbSelect<BudgetItemRow>('BudgetItem', { id: `eq.${id}` }, 'id', 1);
  if (!rows[0]) return false;
  await dbDelete('BudgetItem', { id: `eq.${id}` });
  return true;
}

/* ════════════════ RSVP ════════════════ */

interface RsvpRow {
  id: string; guestId: string; status: string | null; attendingCount: number | null;
  specialNote: string | null; liquorPreference: string | null; mealPreference: string | null; updatedAt: string | null;
}

export interface DashboardRsvp {
  id: string; weddingId: string; guestId: string; attending: boolean; memberCount: number;
  mealPreference: string; liquorPreference: string; notes: string; updatedAt: string;
}

function toDashboardRsvp(row: RsvpRow, weddingId: string): DashboardRsvp {
  return {
    id: row.id,
    weddingId,
    guestId: row.guestId,
    attending: isAttendingStatus(row.status),
    memberCount: Number(row.attendingCount || 0),
    mealPreference: row.mealPreference || '',
    liquorPreference: row.liquorPreference || '',
    notes: row.specialNote || '',
    updatedAt: row.updatedAt || '',
  };
}

function isAttendingStatus(status?: string | null): boolean {
  return ['attending', 'accepted', 'confirmed', 'yes'].includes((status || '').toLowerCase());
}

/** GuestRsvp.status (e.g. 'attending'/'declined') → dashboard label. */
export function mapRsvpStatusLabel(status?: string): string {
  switch ((status || '').toLowerCase()) {
    case 'attending':
    case 'accepted':
    case 'confirmed':
      return 'Confirmed';
    case 'declined':
    case 'not_attending':
      return 'Declined';
    case 'pending':
      return 'Pending';
    default:
      return status ? status : 'Pending';
  }
}

export async function getGuestByToken(token: string): Promise<GuestRow | null> {
  const rows = await dbSelect<GuestRow>('Guest', { inviteToken: `eq.${token}` }, '*', 1);
  return rows[0] || null;
}

export async function getRsvpByGuestId(guestId: string): Promise<RsvpRow | null> {
  const rows = await dbSelect<RsvpRow>('GuestRsvp', { guestId: `eq.${guestId}` }, '*', 1);
  return rows[0] || null;
}

export async function upsertRsvpForGuest(guest: GuestRow, data: {
  attending: boolean; memberCount: number; mealPreference?: string; liquorPreference?: string; notes?: string;
}): Promise<DashboardRsvp> {
  const cols = {
    status: data.attending ? 'attending' : 'declined',
    attendingCount: Number(data.memberCount) || 0,
    mealPreference: data.mealPreference || '',
    liquorPreference: data.liquorPreference || '',
    specialNote: data.notes || '',
    updatedAt: nowIso(),
  };
  const existing = await getRsvpByGuestId(guest.id);
  let row: RsvpRow;
  if (existing) {
    await dbUpdate('GuestRsvp', { id: `eq.${existing.id}` }, cols);
    row = { ...existing, ...cols };
  } else {
    row = await dbInsert<RsvpRow>('GuestRsvp', { id: crypto.randomUUID(), guestId: guest.id, ...cols });
  }
  return toDashboardRsvp(row, guest.weddingId);
}

export async function listRsvpsByWedding(weddingId: string): Promise<DashboardRsvp[]> {
  const guests = await dbSelect<GuestRow>('Guest', { weddingId: `eq.${weddingId}` }, 'id', 1000);
  if (guests.length === 0) return [];
  const ids = guests.map((g) => g.id).join(',');
  const rsvps = await dbSelect<RsvpRow>('GuestRsvp', { guestId: `in.(${ids})` }, '*', guests.length);
  return rsvps.map((r) => toDashboardRsvp(r, weddingId));
}

export async function getRsvpCounts(weddingId: string) {
  const [guests, rsvps] = await Promise.all([
    listGuests(weddingId),
    listRsvpsByWedding(weddingId),
  ]);
  const attendingGuests = rsvps.filter((r) => r.attending).reduce((s, r) => s + (Number(r.memberCount) || 1), 0);
  const declinedGuests = rsvps.filter((r) => !r.attending).reduce((s, r) => s + (Number(r.memberCount) || 0), 0);
  const totalGuestsInvited = guestSumMembers(guests);
  return {
    rsvpCount: rsvps.length,
    attendingGuests,
    declinedGuests,
    pendingGuests: Math.max(0, totalGuestsInvited - attendingGuests - declinedGuests),
    totalGuestsInvited,
  };
}

export async function getRsvpRowById(id: string): Promise<RsvpRow | null> {
  const rows = await dbSelect<RsvpRow>('GuestRsvp', { id: `eq.${id}` }, '*', 1);
  return rows[0] || null;
}

export async function updateRsvpById(id: string, data: Record<string, unknown>): Promise<DashboardRsvp | null> {
  const existing = await getRsvpRowById(id);
  if (!existing) return null;
  const guest = await getGuestRow(existing.guestId);
  const cols: Record<string, unknown> = { updatedAt: nowIso() };
  if (data.attending !== undefined) cols.status = data.attending ? 'attending' : 'declined';
  if (data.status !== undefined && data.attending === undefined) {
    const status = String(data.status).toLowerCase();
    cols.status = isAttendingStatus(status) ? 'attending' : (status === 'declined' ? 'declined' : status);
  }
  if (data.memberCount !== undefined) cols.attendingCount = Number(data.memberCount) || 0;
  if (data.attendingCount !== undefined) cols.attendingCount = Number(data.attendingCount) || 0;
  if (data.mealPreference !== undefined) cols.mealPreference = String(data.mealPreference || '');
  if (data.liquorPreference !== undefined) cols.liquorPreference = String(data.liquorPreference || '');
  if (data.notes !== undefined) cols.specialNote = String(data.notes || '');
  await dbUpdate('GuestRsvp', { id: `eq.${id}` }, cols);
  const updated = await getRsvpRowById(id);
  return updated ? toDashboardRsvp(updated, guest?.weddingId || '') : null;
}

export async function deleteRsvpById(id: string): Promise<boolean> {
  const existing = await getRsvpRowById(id);
  if (!existing) return false;
  await dbDelete('GuestRsvpMember', { guestRsvpId: `eq.${id}` }).catch(() => {});
  await dbDelete('GuestRsvp', { id: `eq.${id}` });
  return true;
}

export async function addRsvpForGuestId(guestId: string, data: Record<string, unknown>): Promise<DashboardRsvp> {
  const guest = await getGuestRow(guestId);
  if (!guest) throw new Error('guest not found');
  const attending = data.attending !== undefined ? !!data.attending : isAttendingStatus(String(data.status || ''));
  return upsertRsvpForGuest(guest, {
    attending,
    memberCount: typeof data.memberCount === 'number' ? data.memberCount : (attending ? 1 : 0),
    mealPreference: String(data.mealPreference || ''),
    liquorPreference: String(data.liquorPreference || ''),
    notes: String(data.notes || ''),
  });
}

export interface WeddingRow {
  id: string; slug: string; groomFirstName: string; brideFirstName: string;
  eventDate: string | null; venueName: string | null;
}

export async function getWeddingRow(weddingId: string): Promise<WeddingRow | null> {
  const rows = await dbSelect<WeddingRow>('Wedding', { id: `eq.${weddingId}` }, '*', 1);
  return rows[0] || null;
}

export async function getWeddingBySlug(slug: string): Promise<WeddingRow | null> {
  const rows = await dbSelect<WeddingRow>('Wedding', { slug: `eq.${slug}` }, '*', 1);
  return rows[0] || null;
}

/* ════════════════ TABLES / SEATING ════════════════ */

interface TableRow { id: string; weddingId: string; tableName: string; capacity: number | null; sortOrder: number | null }
interface AssignmentRow { id: string; tableId: string; guestId: string; assignedCount: number | null }

export interface DashboardTable {
  id: string; weddingId: string; name: string; capacity: number; sortOrder: number;
  assignedGuestIds: string[]; notes: string;
}

function toDashboardTable(row: TableRow, assignedGuestIds: string[]): DashboardTable {
  return {
    id: row.id,
    weddingId: row.weddingId,
    name: row.tableName || '',
    capacity: Number(row.capacity || 0),
    sortOrder: row.sortOrder ?? 0,
    assignedGuestIds,
    notes: '',
  };
}

/** Build a guestId list keyed by tableId from TableAssignment rows. */
async function assignmentsByTable(tableIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (tableIds.length === 0) return map;
  const ids = tableIds.join(',');
  const assignments = await dbSelect<AssignmentRow>(
    'TableAssignment', { tableId: `in.(${ids})` }, '*', tableIds.length * 20,
  );
  for (const a of assignments) {
    if (!map.has(a.tableId)) map.set(a.tableId, []);
    const arr = map.get(a.tableId)!;
    if (!arr.includes(a.guestId)) arr.push(a.guestId); // dedupe: one guest counts once per table
  }
  return map;
}

/**
 * Seats each guest occupies at a table: confirmed RSVP attending count once they've
 * replied, otherwise their max allowed members (reserve space). Minimum 1.
 */
async function seatCountsForGuests(guestIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const ids = Array.from(new Set(guestIds)).filter(Boolean);
  if (ids.length === 0) return map;
  const list = ids.join(',');
  const guests = await dbSelect<GuestRow>('Guest', { id: `in.(${list})` }, '*', ids.length);
  const rsvps = await dbSelect<RsvpRow>('GuestRsvp', { guestId: `in.(${list})` }, '*', ids.length);
  const rsvpByGuest = new Map(rsvps.map((r) => [r.guestId, r]));
  for (const g of guests) {
    const rsvp = rsvpByGuest.get(g.id);
    const seats = rsvp && (rsvp.status || '').toLowerCase() === 'attending'
      ? Math.max(1, Number(rsvp.attendingCount) || 1)
      : Math.max(1, Number(g.maxAllowedMembers) || 1);
    map.set(g.id, seats);
  }
  return map;
}

export async function listTables(weddingId: string): Promise<DashboardTable[]> {
  const tables = await dbSelect<TableRow>('Table', { weddingId: `eq.${weddingId}`, order: 'sortOrder.asc' }, '*', 500);
  const byTable = await assignmentsByTable(tables.map((t) => t.id));
  return tables.map((t) => toDashboardTable(t, byTable.get(t.id) || []));
}

export async function createTable(weddingId: string, data: Record<string, unknown>): Promise<DashboardTable> {
  const capacity = typeof data.capacity === 'number' ? Math.floor(data.capacity) : 8;
  if (capacity < 1 || capacity > 100) throw new Error('capacity must be between 1 and 100');
  const existing = await dbSelect<TableRow>('Table', { weddingId: `eq.${weddingId}` }, 'sortOrder', 500);
  const nextOrder = existing.length;
  const row = await dbInsert<TableRow>('Table', {
    id: crypto.randomUUID(),
    weddingId,
    tableName: String(data.name || `Table ${nextOrder + 1}`),
    capacity,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : nextOrder,
  });
  return toDashboardTable(row, []);
}

export async function updateTableById(id: string, data: Record<string, unknown>): Promise<DashboardTable | null> {
  const rows = await dbSelect<TableRow>('Table', { id: `eq.${id}` }, '*', 1);
  const existing = rows[0];
  if (!existing) return null;
  const cols: Record<string, unknown> = {};
  if (data.name !== undefined) cols.tableName = String(data.name || '');
  if (data.capacity !== undefined) {
    const cap = Math.floor(Number(data.capacity));
    if (cap < 1 || cap > 100) throw new Error('capacity must be between 1 and 100');
    const assigned = (await assignmentsByTable([id])).get(id) || [];
    if (assigned.length > cap) throw new Error('cannot reduce capacity below current assigned guest count');
    cols.capacity = cap;
  }
  if (data.sortOrder !== undefined) cols.sortOrder = Number(data.sortOrder);
  await dbUpdate('Table', { id: `eq.${id}` }, cols);
  const updated = await dbSelect<TableRow>('Table', { id: `eq.${id}` }, '*', 1);
  const assigned = (await assignmentsByTable([id])).get(id) || [];
  return updated[0] ? toDashboardTable(updated[0], assigned) : null;
}

export async function deleteTableById(id: string): Promise<DashboardTable | null> {
  const rows = await dbSelect<TableRow>('Table', { id: `eq.${id}` }, '*', 1);
  if (!rows[0]) return null;
  const assigned = (await assignmentsByTable([id])).get(id) || [];
  await dbDelete('TableAssignment', { tableId: `eq.${id}` }).catch(() => {});
  await dbDelete('Table', { id: `eq.${id}` });
  return toDashboardTable(rows[0], assigned);
}

function tableSummary(table: DashboardTable | null) {
  if (!table) return null;
  return { id: table.id, name: table.name, assigned: table.assignedGuestIds.length, capacity: table.capacity };
}

export async function assignGuestToTable(weddingId: string, tableId: string, guestId: string) {
  const tables = await listTables(weddingId);
  const target = tables.find((t) => t.id === tableId);
  if (!target) throw new Error('table not found');
  const guest = await getGuestRow(guestId);
  if (!guest || guest.weddingId !== weddingId) throw new Error('guest not found');

  const source = tables.find((t) => t.assignedGuestIds.includes(guestId)) || null;

  // Seat-based capacity: a family occupies as many chairs as its members.
  const othersAtTarget = target.assignedGuestIds.filter((id) => id !== guestId);
  const seatMap = await seatCountsForGuests([...othersAtTarget, guestId]);
  const guestSeats = seatMap.get(guestId) || 1;
  const usedSeats = othersAtTarget.reduce((sum, id) => sum + (seatMap.get(id) || 1), 0);
  // Skip the capacity check when the guest is merely being re-saved onto the same table.
  if (source?.id !== tableId && usedSeats + guestSeats > (target.capacity || 0)) {
    throw new Error('table is full');
  }

  // Dedupe: a guest holds exactly one assignment. Clear any existing rows, then insert one.
  await dbDelete('TableAssignment', { guestId: `eq.${guestId}` }).catch(() => {});
  await dbInsert('TableAssignment', { id: crypto.randomUUID(), tableId, guestId, assignedCount: guestSeats });

  const refreshed = await listTables(weddingId);
  const newTarget = refreshed.find((t) => t.id === tableId)!;
  const newSource = source && source.id !== tableId ? refreshed.find((t) => t.id === source.id) || null : null;
  return { guestId, guestName: guest.name, sourceTable: tableSummary(newSource), targetTable: tableSummary(newTarget),
    table: newTarget, capacity: { assigned: newTarget.assignedGuestIds.length, capacity: newTarget.capacity }, noOp: false, conflict: null };
}

export async function unassignGuestFromTable(weddingId: string, guestId: string) {
  const guest = await getGuestRow(guestId);
  if (!guest || guest.weddingId !== weddingId) throw new Error('guest not found');
  const tables = await listTables(weddingId);
  const source = tables.find((t) => t.assignedGuestIds.includes(guestId)) || null;
  if (source) await dbDelete('TableAssignment', { tableId: `eq.${source.id}`, guestId: `eq.${guestId}` }).catch(() => {});
  const refreshed = source ? await listTables(weddingId) : tables;
  const newSource = source ? refreshed.find((t) => t.id === source.id) || null : null;
  return { guestId, guestName: guest.name, sourceTable: tableSummary(newSource), targetTable: null,
    table: newSource, capacity: newSource ? { assigned: newSource.assignedGuestIds.length, capacity: newSource.capacity } : null,
    noOp: !source, conflict: null };
}

export async function getTableAssignmentSnapshot(weddingId: string) {
  const tables = await listTables(weddingId);
  return tables.map((t) => ({ tableId: t.id, assignedGuestIds: t.assignedGuestIds.slice() }));
}

export async function restoreTableAssignmentSnapshot(weddingId: string, snapshot: Array<{ tableId: string; assignedGuestIds: string[] }>) {
  if (!Array.isArray(snapshot)) throw new Error('valid snapshot required');
  const tables = await listTables(weddingId);
  const tableIds = new Set(tables.map((t) => t.id));
  // Clear existing assignments for this wedding's tables, then re-insert from snapshot.
  for (const t of tables) {
    await dbDelete('TableAssignment', { tableId: `eq.${t.id}` }).catch(() => {});
  }
  for (const entry of snapshot) {
    if (!tableIds.has(entry.tableId)) continue;
    for (const guestId of entry.assignedGuestIds || []) {
      await dbInsert('TableAssignment', { id: crypto.randomUUID(), tableId: entry.tableId, guestId, assignedCount: 1 });
    }
  }
  return listTables(weddingId);
}

export async function findTableForGuest(weddingId: string, guestId: string): Promise<DashboardTable | null> {
  const tables = await listTables(weddingId);
  return tables.find((t) => t.assignedGuestIds.includes(guestId)) || null;
}

export async function findGuestForTableLookup(weddingId: string, name: string, phoneLast4: string): Promise<GuestRow | null> {
  const guests = await dbSelect<GuestRow>('Guest', { weddingId: `eq.${weddingId}` }, '*', 1000);
  const normName = name.trim().toLowerCase();
  return guests.find((g) => {
    const num = (g.whatsappNumber || '').replace(/\D/g, '');
    return (g.name || '').trim().toLowerCase() === normName && num.slice(-4) === phoneLast4;
  }) || null;
}

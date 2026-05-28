"use client";

import React, { useEffect, useMemo, useState } from 'react';

type TableRecord = {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  assignedGuestIds: string[];
  notes?: string;
};

type GuestRecord = {
  id: string;
  name: string;
  side?: string;
  type?: string;
  maxMembers?: number;
  rsvpStatus?: string;
};

type AssignmentSnapshot = Array<{ tableId: string; assignedGuestIds: string[] }>;

type AssignResponse = {
  ok: boolean;
  data?: {
    tables?: TableRecord[];
    snapshot?: AssignmentSnapshot;
    results?: Array<{ ok: boolean; guestId: string; guestName?: string; error?: string }>;
    guestName?: string;
    sourceTable?: { name: string } | null;
    targetTable?: { name: string } | null;
  };
  error?: string;
};

export default function TablesModule({ wedding, guests }: { wedding: any; guests: GuestRecord[] }) {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [editingTable, setEditingTable] = useState<TableRecord | null>(null);
  const [printView, setPrintView] = useState(false);
  const [draggedGuestId, setDraggedGuestId] = useState('');
  const [dragOverTableId, setDragOverTableId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastSnapshot, setLastSnapshot] = useState<AssignmentSnapshot | null>(null);
  const [guestTargets, setGuestTargets] = useState<Record<string, string>>({});
  const [tableSelects, setTableSelects] = useState<Record<string, string>>({});
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [bulkSelection, setBulkSelection] = useState<Record<string, boolean>>({});
  const [bulkTargetTable, setBulkTargetTable] = useState('');

  const weddingId = wedding?.id;

  useEffect(() => { void fetchTables(); }, [weddingId]);

  const assignmentByGuest = useMemo(() => {
    const map: Record<string, TableRecord> = {};
    tables.forEach(table => (table.assignedGuestIds || []).forEach(guestId => { map[guestId] = table; }));
    return map;
  }, [tables]);

  const unassignedGuests = useMemo(() => (guests || []).filter(guest => !assignmentByGuest[guest.id]), [guests, assignmentByGuest]);
  const selectedBulkIds = Object.entries(bulkSelection).filter(([, selected]) => selected).map(([id]) => id);

  async function fetchTables() {
    if (!weddingId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/weddings/${weddingId}/tables`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Unable to load tables');
      setTables(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load tables.');
    } finally {
      setLoading(false);
    }
  }

  function applyAssignmentResponse(json: AssignResponse, fallback: string) {
    if (json.data?.tables) setTables(json.data.tables);
    if (json.data?.snapshot) setLastSnapshot(json.data.snapshot);
    const failed = json.data?.results?.filter(item => !item.ok) || [];
    if (failed.length) {
      setError(failed.map(item => `${item.guestName || item.guestId}: ${item.error}`).join(' | '));
    } else if (!json.ok && json.error) {
      setError(json.error);
    } else {
      setError('');
    }
    setMessage(fallback);
  }

  async function postAssignment(body: Record<string, any>, successMessage: string) {
    setError('');
    setMessage('');
    const res = await fetch(`/api/weddings/${weddingId}/tables/assign`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json: AssignResponse = await res.json();
    if (!res.ok) {
      setError(json?.error || 'Assignment failed');
      return null;
    }
    applyAssignmentResponse(json, successMessage);
    return json;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Table name is required.');
      return;
    }
    try {
      const res = await fetch(`/api/weddings/${weddingId}/tables`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), capacity }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Unable to create table');
      setTables(prev => [...prev, json.data]);
      setName('');
      setCapacity(8);
      setMessage('Table created.');
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Unable to create table.');
    }
  }

  async function assignGuest(guestId: string, tableId: string) {
    if (!guestId || !tableId) {
      setError('Choose both a guest and a target table.');
      return;
    }
    await postAssignment({ action: 'assign', tableId, guestId }, `${guestName(guestId)} assigned.`);
    setGuestTargets(prev => ({ ...prev, [guestId]: '' }));
    setTableSelects(prev => ({ ...prev, [tableId]: '' }));
    setMoveTargets(prev => ({ ...prev, [guestId]: '' }));
  }

  async function unassignGuest(guestId: string) {
    await postAssignment({ action: 'unassign', guestId }, `${guestName(guestId)} unassigned.`);
  }

  async function bulkAssign() {
    if (!bulkTargetTable || selectedBulkIds.length === 0) {
      setError('Select unassigned guests and a target table for bulk assignment.');
      return;
    }
    const target = tables.find(table => table.id === bulkTargetTable);
    const openSeats = Math.max(0, Number(target?.capacity || 0) - Number(target?.assignedGuestIds?.length || 0));
    if (selectedBulkIds.length > openSeats) {
      setMessage(`Only ${openSeats} seat${openSeats === 1 ? '' : 's'} available at ${target?.name || 'that table'}; extra guests will be reported as conflicts.`);
    }
    const json = await postAssignment({ action: 'bulkAssign', tableId: bulkTargetTable, guestIds: selectedBulkIds }, 'Bulk assignment completed.');
    if (json?.data?.results?.some(item => item.ok)) {
      setBulkSelection({});
      setBulkTargetTable('');
    }
  }

  async function undoLastAction() {
    if (!lastSnapshot) return;
    setError('');
    const res = await fetch(`/api/weddings/${weddingId}/tables/assign`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'undo', snapshot: lastSnapshot }),
    });
    const json: AssignResponse = await res.json();
    if (!res.ok || !json.ok) {
      setError(json?.error || 'Undo failed.');
      return;
    }
    setTables(json.data?.tables || []);
    setLastSnapshot(null);
    setMessage('Last seating change undone.');
  }

  async function handleDrop(tableId: string) {
    if (!draggedGuestId) return;
    await assignGuest(draggedGuestId, tableId);
    setDraggedGuestId('');
    setDragOverTableId('');
  }

  async function handleDelete(tableId: string) {
    if (!confirm('Delete this table?')) return;
    try {
      const res = await fetch(`/api/weddings/${weddingId}/tables/${tableId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Delete failed');
      setTables(prev => prev.filter(table => table.id !== tableId));
      setMessage('Table deleted.');
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    }
  }

  function guestName(guestId: string) {
    return (guests || []).find(guest => guest.id === guestId)?.name || guestId;
  }

  if (!weddingId) return <div>Please select a wedding</div>;

  return (
    <section className="module tables-module" aria-label="Tables and seating assignments">
      <div className="module-header">
        <div>
          <p className="eyebrow">Seating Chart</p>
          <h1 className="module-title">Tables & Seating</h1>
          <p className="module-subtitle">Assign guests, reassign seats, resolve capacity conflicts, and undo recent seating changes.</p>
        </div>
        <div className="agenda-actions">
          <button className="btn btn-secondary" type="button" onClick={undoLastAction} disabled={!lastSnapshot}>
            Undo Last Change
          </button>
          <button className="btn btn-primary" type="button" onClick={() => setPrintView(prev => !prev)}>
            {printView ? 'Hide Printable View' : 'Printable View'}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className="success-banner" aria-live="polite" style={error ? { color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' } : undefined}>
          {error || message}
        </div>
      )}

      <div className="seating-admin-grid">
        <form onSubmit={handleCreate} className="card seating-create-card">
          <div className="settings-section-header">
            <h3>Create Table</h3>
          </div>
          <label className="form-label" htmlFor="table-name">Table name</label>
          <input id="table-name" className="form-input" placeholder="Family Table" value={name} onChange={event => setName(event.target.value)} />
          <label className="form-label" htmlFor="table-capacity">Capacity</label>
          <input id="table-capacity" className="form-input" type="number" min="1" max="100" value={capacity} onChange={event => setCapacity(Number(event.target.value || 1))} />
          <button className="btn btn-primary" type="submit">Create</button>
        </form>

        <div className="card seating-bulk-card">
          <div className="settings-section-header">
            <h3>Bulk Assign</h3>
          </div>
          <div className="seating-bulk-controls">
            <select className="form-input" aria-label="Bulk assignment target table" value={bulkTargetTable} onChange={event => setBulkTargetTable(event.target.value)}>
              <option value="">Target table</option>
              {tables.map(table => <option key={table.id} value={table.id}>{table.name} ({table.assignedGuestIds?.length || 0}/{table.capacity})</option>)}
            </select>
            <button className="btn btn-secondary" type="button" onClick={() => setBulkSelection({})}>Clear Selected</button>
            <button className="btn btn-primary" type="button" onClick={bulkAssign}>Assign {selectedBulkIds.length || ''}</button>
          </div>
          <p className="module-subtitle" style={{ margin: 0 }}>{selectedBulkIds.length} selected from unassigned guests.</p>
        </div>
      </div>

      <div className="seating-map">
        <div className="seating-map-panel">
          <div className="panel-subtitle">Guest List</div>
          <div className="seating-chip-list seating-chip-list-stacked">
            {(guests || []).map(guest => {
              const assignedTable = assignmentByGuest[guest.id];
              return (
                <div key={guest.id} className={`guest-assignment-row ${assignedTable ? 'is-assigned' : ''}`}>
                  <label className="guest-select-row">
                    <input
                      type="checkbox"
                      checked={Boolean(bulkSelection[guest.id])}
                      disabled={Boolean(assignedTable)}
                      onChange={event => setBulkSelection(prev => ({ ...prev, [guest.id]: event.target.checked }))}
                    />
                    <span className="guest-row-name">{guest.name}</span>
                  </label>
                  <span className="guest-row-meta">{assignedTable ? assignedTable.name : 'Unassigned'}</span>
                  <div className="guest-row-actions">
                    <select
                      className="form-input"
                      aria-label={`Assign ${guest.name} to table`}
                      value={guestTargets[guest.id] || ''}
                      onChange={event => setGuestTargets(prev => ({ ...prev, [guest.id]: event.target.value }))}
                    >
                      <option value="">Choose table</option>
                      {tables.map(table => <option key={table.id} value={table.id}>{table.name} ({table.assignedGuestIds?.length || 0}/{table.capacity})</option>)}
                    </select>
                    <button className="table-action-btn" type="button" onClick={() => assignGuest(guest.id, guestTargets[guest.id])}>Assign</button>
                    {assignedTable && <button className="table-action-btn" type="button" onClick={() => unassignGuest(guest.id)}>Unassign</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="seating-map-panel seating-map-grid">
          <div className="panel-subtitle">Table View</div>
          {loading && <div className="empty-hint">Loading tables...</div>}
          {!loading && tables.length === 0 && <div className="empty-hint">Create a table to start seating guests.</div>}
          {tables.map(table => {
            const assignedGuests = table.assignedGuestIds || [];
            const isDropTarget = dragOverTableId === table.id;
            return (
              <article
                key={table.id}
                className={`table-card seating-table-card ${isDropTarget ? 'drag-over' : ''}`}
                tabIndex={0}
                aria-label={`${table.name}, ${assignedGuests.length} of ${table.capacity} assigned`}
                onDragOver={event => { event.preventDefault(); setDragOverTableId(table.id); }}
                onDragEnter={event => { event.preventDefault(); setDragOverTableId(table.id); }}
                onDragLeave={event => {
                  if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                  setDragOverTableId(prev => prev === table.id ? '' : prev);
                }}
                onDrop={event => { event.preventDefault(); void handleDrop(table.id); }}
              >
                <div className="seating-table-head">
                  <div>
                    <strong>{table.name}</strong>
                    <span>{assignedGuests.length} / {table.capacity} assigned</span>
                  </div>
                  <div className="table-actions">
                    <button className="table-action-btn" type="button" onClick={() => setEditingTable({ ...table })}>Edit</button>
                    <button className="table-action-btn" type="button" onClick={() => handleDelete(table.id)}>Delete</button>
                  </div>
                </div>

                <div className="seating-chip-list">
                  {assignedGuests.length === 0 && <div className="empty-hint">Drop a guest here or use the controls below.</div>}
                  {assignedGuests.map(guestId => (
                    <div
                      key={guestId}
                      className="guest-chip guest-chip-assigned"
                      draggable
                      tabIndex={0}
                      onDragStart={event => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', guestId);
                        setDraggedGuestId(guestId);
                      }}
                      onDragEnd={() => {
                        setDraggedGuestId('');
                        setDragOverTableId('');
                      }}
                    >
                      <span>{guestName(guestId)}</span>
                      <select
                        aria-label={`Move ${guestName(guestId)} to another table`}
                        value={moveTargets[guestId] || ''}
                        onChange={event => setMoveTargets(prev => ({ ...prev, [guestId]: event.target.value }))}
                      >
                        <option value="">Move</option>
                        {tables.filter(target => target.id !== table.id).map(target => <option key={target.id} value={target.id}>{target.name}</option>)}
                      </select>
                      <button type="button" className="guest-chip-remove" onClick={() => moveTargets[guestId] ? assignGuest(guestId, moveTargets[guestId]) : unassignGuest(guestId)}>
                        {moveTargets[guestId] ? 'Move' : 'Unassign'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="seating-inline-assign">
                  <select
                    className="form-input"
                    aria-label={`Select unassigned guest for ${table.name}`}
                    value={tableSelects[table.id] || ''}
                    onChange={event => setTableSelects(prev => ({ ...prev, [table.id]: event.target.value }))}
                  >
                    <option value="">Select unassigned guest</option>
                    {unassignedGuests.map(guest => <option key={guest.id} value={guest.id}>{guest.name}</option>)}
                  </select>
                  <button className="btn btn-secondary" type="button" onClick={() => assignGuest(tableSelects[table.id], table.id)}>Assign Here</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {printView && (
        <div className="card seating-print-card">
          <h3>Printable Layout</h3>
          <div className="seating-print-grid">
            {tables.map(table => (
              <div key={table.id} className="seating-print-table">
                <strong>{table.name} ({(table.assignedGuestIds || []).length}/{table.capacity})</strong>
                <ol>
                  {(table.assignedGuestIds || []).map(guestId => <li key={guestId}>{guestName(guestId)}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingTable && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit table">
          <div className="modal-card">
            <h4>Edit Table</h4>
            <label className="form-label" htmlFor="edit-table-name">Name</label>
            <input id="edit-table-name" className="form-input" value={editingTable.name} onChange={event => setEditingTable({ ...editingTable, name: event.target.value })} />
            <label className="form-label" htmlFor="edit-table-capacity">Capacity</label>
            <input id="edit-table-capacity" className="form-input" type="number" min="1" max="100" value={editingTable.capacity} onChange={event => setEditingTable({ ...editingTable, capacity: Number(event.target.value || 1) })} />
            <div className="table-actions" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="button" onClick={async () => {
                try {
                  const res = await fetch(`/api/weddings/${weddingId}/tables/${editingTable.id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ name: editingTable.name, capacity: editingTable.capacity }),
                  });
                  const json = await res.json();
                  if (!res.ok || !json?.ok) throw new Error(json?.error || 'Update failed');
                  setEditingTable(null);
                  await fetchTables();
                  setMessage('Table updated.');
                } catch (err: any) {
                  setError(err?.message || 'Update failed.');
                }
              }}>Save</button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditingTable(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

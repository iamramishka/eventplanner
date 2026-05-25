import fs from 'fs';
import path from 'path';

export async function auditLog(entry: Record<string, unknown>) {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const file = path.join(logsDir, 'audit.log');
    const record = { ts: new Date().toISOString(), ...entry };
    fs.appendFileSync(file, JSON.stringify(record) + '\n');
    return { ok: true };
  } catch (e) {
    console.error('auditLog error', e);
    return { ok: false, error: String(e) };
  }
}

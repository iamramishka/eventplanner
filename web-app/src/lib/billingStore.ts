import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'billing.json');

function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8');
}

export function saveSubscription(email: string, record: Record<string, any>) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');
  data[email] = { ...(data[email] || {}), ...record, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return data[email];
}

export function getSubscriptionByEmail(email: string) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');
  return data[email] || null;
}

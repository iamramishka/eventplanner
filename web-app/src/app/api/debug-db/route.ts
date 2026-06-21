import { NextResponse } from 'next/server';
import net from 'net';

export const dynamic = 'force-dynamic';

function tcpCheck(host: string, port: number, timeout = 6000): Promise<string> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    const timer = setTimeout(() => { sock.destroy(); resolve('TIMEOUT'); }, timeout);
    sock.connect(port, host, () => { clearTimeout(timer); sock.destroy(); resolve('CONNECTED'); });
    sock.on('error', (e) => { clearTimeout(timer); resolve('ERR: ' + e.message); });
  });
}

export async function GET() {
  const ref = 'rfkxrtovvukikxqsyvyl';
  const [r1, r2, r3, r4] = await Promise.all([
    tcpCheck(`db.${ref}.supabase.co`, 5432),       // direct DB
    tcpCheck(`aws-0-ap-northeast-1.pooler.supabase.com`, 5432),  // Supavisor session
    tcpCheck(`aws-0-ap-northeast-1.pooler.supabase.com`, 6543),  // Supavisor transaction
    tcpCheck(`db.${ref}.supabase.co`, 6543),        // old pgBouncer port
  ]);

  return NextResponse.json({
    'direct:5432': r1,
    'supavisor-session:5432': r2,
    'supavisor-txn:6543': r3,
    'db-pgbouncer:6543': r4,
  });
}

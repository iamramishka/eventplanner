import { NextResponse } from 'next/server';
import net from 'net';
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';

function tcpCheck(host: string, port: number, timeout = 8000): Promise<string> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    const timer = setTimeout(() => { sock.destroy(); resolve('TIMEOUT'); }, timeout);
    sock.connect(port, host, () => { clearTimeout(timer); sock.destroy(); resolve('CONNECTED'); });
    sock.on('error', (e) => { clearTimeout(timer); resolve('ERR: ' + e.message); });
  });
}

export async function GET() {
  const ref = 'rfkxrtovvukikxqsyvyl';
  const directHost = `db.${ref}.supabase.co`;

  const [dnsV4, dnsV6, tcpDirect, tcpPool5432, tcpPool6543] = await Promise.all([
    dns.resolve4(directHost).then(a => 'A:' + a.join(',')).catch(e => 'A_ERR:' + (e as Error).message),
    dns.resolve6(directHost).then(a => 'AAAA:' + a.join(',')).catch(e => 'AAAA_ERR:' + (e as Error).message),
    tcpCheck(directHost, 5432),
    tcpCheck(`aws-0-ap-northeast-1.pooler.supabase.com`, 5432),
    tcpCheck(`aws-0-ap-northeast-1.pooler.supabase.com`, 6543),
  ]);

  const dbUrl = process.env.DATABASE_URL || '';
  let urlHost = '';
  try { urlHost = new URL(dbUrl).hostname; } catch { urlHost = 'parse-err'; }

  return NextResponse.json({ dnsV4, dnsV6, tcpDirect, tcpPool5432, tcpPool6543, urlHost });
}

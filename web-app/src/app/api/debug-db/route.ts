import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import net from 'net';

export const dynamic = 'force-dynamic';

function tcpCheck(host: string, port: number, timeout = 6000): Promise<string> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    const timer = setTimeout(() => { sock.destroy(); resolve('TIMEOUT'); }, timeout);
    sock.connect(port, host, () => { clearTimeout(timer); sock.destroy(); resolve('CONNECTED'); });
    sock.on('error', (e) => { clearTimeout(timer); resolve('ERROR: ' + e.message); });
  });
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  let urlInfo = { host: '', user: '', port: '' };
  try {
    const u = new URL(dbUrl);
    urlInfo = { host: u.hostname, user: u.username.slice(0, 14) + '...', port: u.port };
  } catch {
    urlInfo.host = 'parse-error';
  }

  const [dnsResult, tcpResult] = await Promise.all([
    dns.lookup(urlInfo.host).then(a => JSON.stringify(a)).catch(e => 'DNS_ERR: ' + (e as Error).message),
    tcpCheck(urlInfo.host, Number(urlInfo.port) || 5432),
  ]);

  return NextResponse.json({ urlInfo, dnsResult, tcpResult });
}

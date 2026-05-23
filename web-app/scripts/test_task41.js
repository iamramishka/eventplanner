const fetch = globalThis.fetch || (async () => { throw new Error('No fetch available') })();
const base = 'http://localhost:3000';

async function check(path) {
  try {
    const res = await fetch(base + path);
    const text = await res.text();
    console.log(path, '=>', res.status);
    const snippet = text.slice(0,200).replace(/\n/g,' ');
    console.log('  snippet:', snippet);
  } catch (e) {
    console.error(path, 'error', e.message);
  }
}

async function run() {
  console.log('1. Valid slug (/invitation/priya-and-kasun)');
  await check('/invitation/priya-and-kasun');

  console.log('2. Invalid slug (/invitation/not-a-real-slug)');
  await check('/invitation/not-a-real-slug');

  console.log('\nInvitation route test complete.');
}

run().catch(e=>{ console.error(e); process.exit(1) });

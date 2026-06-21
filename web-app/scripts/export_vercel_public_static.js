const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'vercel-public');
const nextAppDir = path.join(root, '.next', 'server', 'app');
const nextStaticDir = path.join(root, '.next', 'static');
const publicDir = path.join(root, 'public');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(path.dirname(to));
  fs.cpSync(from, to, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function copyHtmlRoute(sourceName, routePath) {
  const source = path.join(nextAppDir, sourceName);
  const target = routePath === '/'
    ? path.join(outDir, 'index.html')
    : path.join(outDir, routePath, 'index.html');
  copyIfExists(source, target);
}

function htmlShell(title, body, extraHead = '') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  ${extraHead}
</head>
<body>
${body}
</body>
</html>`;
}

function buildFindEventPage() {
  const css = fs.readFileSync(path.join(root, 'src', 'app', 'find-event', 'find-event.module.css'), 'utf8');
  const body = `
<main class="container">
  <div class="searchCard">
    <div class="brandLockup" aria-label="WedPlan">
      <div class="logoW">&hearts;</div>
      <span>WedPlan</span>
    </div>
    <h1 class="title">Find an Event</h1>
    <p class="subtitle">Enter the couple's names, event code, or paste the invitation link to find their wedding details and RSVP.</p>
    <form id="search-form">
      <div class="searchBox">
        <span class="searchIcon" aria-hidden="true">Search</span>
        <input id="query" type="text" placeholder="e.g. Kasun & Priya, or event code" class="searchInput" autofocus>
      </div>
      <button id="search-button" type="submit" class="searchBtn" disabled>Search Events</button>
    </form>
    <div id="results" class="resultsArea" hidden></div>
  </div>
</main>
<script>
const seededEvents = [{
  id: 'priya-and-kasun',
  brideName: 'Priya',
  groomName: 'Kasun',
  weddingTitle: 'Priya & Kasun',
  date: '2026-08-15',
  venueName: 'Grand Ballroom, Colombo',
  slug: 'priya-and-kasun'
}];

function getSearchTerm(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.at(-1) || trimmed;
  } catch {
    return trimmed.replace(/^\\/?(invitation\\/)?/, '').replace(/\\/$/, '');
  }
}

function formatDate(value) {
  if (!value) return 'Date TBA';
  return new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function renderResults(matches, query) {
  const host = document.getElementById('results');
  host.hidden = false;
  if (!matches.length) {
    host.innerHTML = '<h2 class="resultsTitle">No events found</h2><div class="noResults"><p>We couldn\\'t find any events matching "' + query.replace(/</g, '&lt;') + '".</p><p class="resultHint">Please check the spelling or ask the couple for their exact event link.</p></div>';
    return;
  }
  host.innerHTML = '<h2 class="resultsTitle">Found ' + matches.length + ' event' + (matches.length === 1 ? '' : 's') + '</h2><div class="resultsList">' + matches.map((event) => (
    '<div class="eventCard"><div class="eventAvatar">' + event.brideName[0] + event.groomName[0] + '</div><div class="eventInfo"><div class="eventTitle">' + event.weddingTitle + '</div><div class="eventDetails"><div class="detailRow">Date: ' + formatDate(event.date) + '</div><div class="detailRow">Venue: ' + event.venueName + '</div></div></div><a class="viewBtn" href="/' + event.slug + '/">View Invitation</a></div>'
  )).join('') + '</div>';
}

function handleSearch(event) {
  event.preventDefault();
  const input = document.getElementById('query');
  const query = input.value.trim();
  const term = getSearchTerm(query).toLowerCase();
  const matches = seededEvents.filter((item) => [
    item.slug,
    item.brideName,
    item.groomName,
    item.weddingTitle
  ].some((value) => value.toLowerCase().includes(term)));
  renderResults(matches, query);
}

const input = document.getElementById('query');
const button = document.getElementById('search-button');
input.addEventListener('input', () => {
  button.disabled = input.value.trim().length < 2;
});
document.getElementById('search-form').addEventListener('submit', handleSearch);
</script>`;

  writeFile(
    path.join(outDir, 'find-event', 'index.html'),
    htmlShell('WedPlan - Find an Event', body, `<style>${css}</style>`)
  );
}

function buildInvitationPage() {
  const body = `
<main style="min-height:100vh;display:grid;place-items:center;padding:32px;background:#fffaf7;color:#18181b;font-family:Inter,system-ui,sans-serif;">
  <section style="width:min(100%,680px);text-align:center;border:1px solid #f4d5d9;border-radius:18px;background:white;padding:42px;box-shadow:0 24px 60px rgba(136,19,55,.11);">
    <div style="font-size:42px;color:#be123c;">&hearts;</div>
    <h1 style="font-family:Georgia,serif;font-size:44px;margin:12px 0;">Priya & Kasun</h1>
    <p style="font-size:18px;color:#52525b;">15 August 2026 - Grand Ballroom, Colombo</p>
    <p style="line-height:1.7;color:#52525b;">This public preview keeps the Vercel public website deployable while the full invitation experience remains in the Next app.</p>
    <p><a href="/find-event/" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:8px;background:#be123c;color:white;text-decoration:none;font-weight:800;">Back to event search</a></p>
  </section>
</main>`;
  const html = htmlShell('Priya & Kasun - WedPlan', body);
  writeFile(path.join(outDir, 'priya-and-kasun', 'index.html'), html);
  writeFile(path.join(outDir, 'invitation', 'priya-and-kasun', 'index.html'), html);
}

fs.rmSync(outDir, { recursive: true, force: true });
ensureDir(outDir);

copyIfExists(publicDir, outDir);
copyIfExists(nextStaticDir, path.join(outDir, '_next', 'static'));

copyHtmlRoute('index.html', '/');
copyHtmlRoute('vendors.html', 'vendors');
copyHtmlRoute('login.html', 'login');
copyHtmlRoute('register.html', 'register');
copyHtmlRoute('forgot-password.html', 'forgot-password');
copyHtmlRoute('reset.html', 'reset');
copyHtmlRoute('shortlist.html', 'shortlist');
copyHtmlRoute('sign-in.html', 'sign-in');
copyHtmlRoute('vendor-register.html', 'vendor-register');

writeFile(
  path.join(outDir, 'public-landing', 'index.html'),
  htmlShell('Redirecting to WedPlan', '<p>Redirecting to <a href="/">WedPlan</a>.</p>', '<meta http-equiv="refresh" content="0; url=/">')
);

buildFindEventPage();
buildInvitationPage();

console.log(`Exported Vercel public static site to ${path.relative(root, outDir)}`);

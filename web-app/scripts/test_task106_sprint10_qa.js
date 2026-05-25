const fs = require('fs');
const path = require('path');

async function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return true;
}

async function checkFileContent(filePath, keywords) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const keyword of keywords) {
    if (!content.includes(keyword)) {
      throw new Error(`File ${filePath} is missing expected keyword: "${keyword}"`);
    }
  }
  return true;
}

async function runQaChecks() {
  console.log('Running Sprint 10 QA Checks...\n');

  try {
    // 1. Check Login Page
    console.log('Checking Login Page...');
    await checkFileExists('src/app/login/page.tsx');
    await checkFileExists('src/app/login/login.module.css');
    await checkFileContent('src/app/login/page.tsx', ['signIn', 'email', 'password', 'Welcome back']);
    console.log('✅ Login Page smoke check passed.\n');

    // 2. Check Sign Up Steps 1 & 2
    console.log('Checking Register Page...');
    await checkFileExists('src/app/register/page.tsx');
    await checkFileExists('src/app/register/register.module.css');
    await checkFileContent('src/app/register/page.tsx', ['step === 1', 'step === 2', 'groomName', 'brideName', 'budgetAmount', 'guestCount']);
    console.log('✅ Register Page smoke check passed.\n');

    // 3. Check Find Event Page
    console.log('Checking Find Event Page...');
    await checkFileExists('src/app/find-event/page.tsx');
    await checkFileExists('src/app/find-event/find-event.module.css');
    await checkFileContent('src/app/find-event/page.tsx', ['handleSearch', 'api/events/search', 'Search Events', 'View Invitation']);
    console.log('✅ Find Event Page smoke check passed.\n');

    // 4. Check Find Event API
    console.log('Checking Find Event API...');
    await checkFileExists('src/app/api/events/search/route.ts');
    await checkFileContent('src/app/api/events/search/route.ts', ['db.weddings.findMany', 'NextResponse']);
    console.log('✅ Find Event API smoke check passed.\n');

    console.log('All Sprint 10 smoke checks passed successfully! 🎉');
  } catch (error) {
    console.error(`\n❌ QA Check Failed: ${error.message}`);
    process.exit(1);
  }
}

runQaChecks();

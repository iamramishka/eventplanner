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

async function checkFileExcludes(filePath, bannedKeywords) {
  const fullPath = path.join(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const keyword of bannedKeywords) {
    if (content.includes(keyword)) {
      throw new Error(`File ${filePath} still contains banned content: "${keyword}"`);
    }
  }
  return true;
}

async function runQaChecks() {
  console.log('Running Sprint 10 QA Checks...\n');

  try {
    // 1. Check Public Landing Page
    console.log('Checking Public Landing Page...');
    await checkFileExists('src/app/page.tsx');
    await checkFileExists('src/app/public-landing/styles.css');
    await checkFileContent('src/app/page.tsx', [
      'Wedding Planning That Actually Works',
      'One calm place to plan the wedding and guide every guest',
      'What works today',
      'From setup to celebration in three steady steps',
      'href="/find-event"',
      'href="/invitation/priya-and-kasun"',
    ]);
    await checkFileExcludes('src/app/page.tsx', [
      '1,250+',
      '250K+',
      '180K+',
      '12K+',
      '99.9%',
      'What Couples Say',
      'Trusted by top wedding vendors',
      'Newsletter',
      'Subscribe',
      'Join thousands',
    ]);
    console.log('✅ Public Landing Page smoke check passed.\n');

    // 2. Check public-landing compatibility route
    console.log('Checking Public Landing Redirect...');
    await checkFileExists('src/app/public-landing/page.tsx');
    await checkFileContent('src/app/public-landing/page.tsx', ["redirect('/')"]);
    console.log('✅ Public Landing Redirect smoke check passed.\n');

    // 3. Check Login Page
    console.log('Checking Login Page...');
    await checkFileExists('src/app/login/page.tsx');
    await checkFileExists('src/app/login/login.module.css');
    await checkFileContent('src/app/login/page.tsx', ['signIn', 'email', 'password', 'Welcome back']);
    console.log('✅ Login Page smoke check passed.\n');

    // 4. Check Sign Up Steps 1 & 2
    console.log('Checking Register Page...');
    await checkFileExists('src/app/register/page.tsx');
    await checkFileExists('src/app/register/register.module.css');
    await checkFileContent('src/app/register/page.tsx', ['step === 1', 'step === 2', 'groomName', 'brideName', 'budgetAmount', 'guestCount']);
    console.log('✅ Register Page smoke check passed.\n');

    // 5. Check Find Event Page
    console.log('Checking Find Event Page...');
    await checkFileExists('src/app/find-event/page.tsx');
    await checkFileExists('src/app/find-event/find-event.module.css');
    await checkFileContent('src/app/find-event/page.tsx', [
      'handleSearch',
      'getSearchTerm',
      'api/events/search',
      'Search Events',
      'View Invitation',
      'role="alert"',
      'resultHint',
    ]);
    console.log('✅ Find Event Page smoke check passed.\n');

    // 6. Check Find Event API
    console.log('Checking Find Event API...');
    await checkFileExists('src/app/api/events/search/route.ts');
    await checkFileContent('src/app/api/events/search/route.ts', ['dbSelect', 'NextResponse']);
    console.log('✅ Find Event API smoke check passed.\n');

    console.log('All Sprint 10 smoke checks passed successfully! 🎉');
  } catch (error) {
    console.error(`\n❌ QA Check Failed: ${error.message}`);
    process.exit(1);
  }
}

runQaChecks();

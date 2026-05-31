#!/usr/bin/env node
// scripts/test_task85_sprint8_qa.js
// Runs all Vendor Lifecycle Smoke Tests (Sprint 8)

const { spawnSync } = require('child_process');

const tests = [
  { name: 'Task 8.1 - Vendor Onboarding', args: ['scripts/test_task81_vendor_onboarding.js'] },
  { name: 'Task 8.3 - Vendor Profile & Listings', args: ['scripts/test_task83_vendor_profile_listings.js'] },
  { name: 'Task 8.4 - Vendor Browse & Shortlist', args: ['scripts/test_task84_vendor_browse_and_shortlist.js'] },
];

console.log(`\n🚀 Starting Sprint 8 QA: Vendor Lifecycle Smoke Suite\n`);

let allPassed = true;

for (const test of tests) {
  console.log(`⏳ Running ${test.name}...`);
  const result = spawnSync(process.execPath, test.args, { stdio: 'inherit' });
  if (result.status === 0) {
    console.log(`✅ ${test.name} passed!\n`);
  } else {
    console.error(`❌ ${test.name} failed!`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log(`🎉 Sprint 8 QA complete! All vendor lifecycle flows passed.`);
  process.exitCode = 0;
} else {
  console.error(`⚠️ Sprint 8 QA failed. Please check the logs above.`);
  process.exitCode = 1;
}

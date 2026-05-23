#!/usr/bin/env node
// scripts/test_task85_sprint8_qa.js
// Runs all Vendor Lifecycle Smoke Tests (Sprint 8)

const { execSync } = require('child_process');

const tests = [
  { name: 'Task 8.1 - Vendor Onboarding', cmd: 'npm run test:vendor-onboarding' },
  { name: 'Task 8.3 - Vendor Profile & Listings', cmd: 'npm run test:vendor-profile-listings' },
  { name: 'Task 8.4 - Vendor Browse & Shortlist', cmd: 'npm run test:vendor-browse' },
];

console.log(`\n🚀 Starting Sprint 8 QA: Vendor Lifecycle Smoke Suite\n`);

let allPassed = true;

for (const test of tests) {
  console.log(`⏳ Running ${test.name}...`);
  try {
    execSync(test.cmd, { stdio: 'inherit' });
    console.log(`✅ ${test.name} passed!\n`);
  } catch (err) {
    console.error(`❌ ${test.name} failed!`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log(`🎉 Sprint 8 QA complete! All vendor lifecycle flows passed.`);
  process.exit(0);
} else {
  console.error(`⚠️ Sprint 8 QA failed. Please check the logs above.`);
  process.exit(1);
}

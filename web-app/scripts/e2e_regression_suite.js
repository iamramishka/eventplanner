#!/usr/bin/env node
// scripts/e2e_regression_suite.js
// Final regression suite running all critical journeys.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

console.log(`\n🚀 Starting Full E2E Regression Suite for WedPlan\n`);

const scriptsToRun = [
  // Sprint 8 tests
  'test_task82_vendor_onboarding.js',
  'test_task83_vendor_profiles.js',
  'test_sprint8-qa.js',
  
  // Sprint 9 tests
  'test_task92_plans.js',
  'test_task93_notifications.js'
];

let allPassed = true;

for (const script of scriptsToRun) {
  const scriptPath = path.join(__dirname, script);
  if (!fs.existsSync(scriptPath)) {
    console.warn(`⚠️  Skipping ${script} - Not found.`);
    continue;
  }
  
  console.log(`\n▶️  Running ${script}...`);
  try {
    const output = execSync(`node "${scriptPath}"`, { env: { ...process.env, BASE_URL }, stdio: 'pipe' });
    console.log(output.toString().trim());
  } catch (error) {
    console.error(error.stdout ? error.stdout.toString() : '');
    console.error(`❌ ${script} failed with exit code ${error.status}`);
    allPassed = false;
  }
}

console.log(`\n${'='.repeat(55)}`);
if (allPassed) {
  console.log(`🎉 ALL E2E CRITICAL JOURNEYS PASSED.`);
  console.log(`   Ready for Release!`);
  process.exit(0);
} else {
  console.error(`💥 REGRESSION SUITE FAILED. Check logs above.`);
  process.exit(1);
}

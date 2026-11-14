import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from './src/config/db.js';
import { seedDatabase } from './src/seeds/seedData.js';
import { runAllTests } from './src/utils/testRunner.js';

async function main() {
  console.log('--- Initializing Database for Part D Testing Suite ---');
  await connectDB();
  await seedDatabase();

  console.log('\n--- Executing 17 Documented Test Cases ---');
  const result = await runAllTests();

  console.log('\n========================================================================================');
  console.log(`TEST EXECUTION SUMMARY: ${result.summary.passedTests}/${result.summary.totalTests} PASSED (${result.summary.passRate}) in ${result.summary.durationMs}ms`);
  console.log('========================================================================================\n');

  for (const r of result.results) {
    const status = r.passed ? 'PASS [OK]' : 'FAIL [X]';
    console.log(`Test #${String(r.testId).padStart(2, '0')}: [${status}] ${r.name.padEnd(45, ' ')} | Category: ${r.category}`);
    console.log(`   Expected: ${r.expected}`);
    console.log(`   Actual:   ${r.actual}`);
    console.log(`   Details:  ${r.details}\n`);
  }

  await disconnectDB();
  process.exit(result.summary.allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});

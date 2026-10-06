import { runAllTests } from './engine.test';

console.log('Running BlockFall Test Suite...');
const results = runAllTests();

let passed = 0;
let failed = 0;

for (const r of results) {
  if (r.passed) {
    console.log(`  ✓ ${r.test}`);
    passed++;
  } else {
    console.error(`  ✗ ${r.test}`);
    console.error(`    Error: ${r.error}`);
    failed++;
  }
}

console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}

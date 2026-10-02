/**
 * NovaCart CLI Automated Assessment Runner
 * Executes the full test suite in headless mode for CI/CD and platform evaluators.
 */

import { runAllAutomatedTests } from '../services/automatedTestEngine';

async function main() {
  console.log('=====================================================');
  console.log('  NovaCart Automated Assessment & Evaluation Suite   ');
  console.log('=====================================================\n');

  const { results, rubricScores, totalPassed, totalFailed, overallScore } = await runAllAutomatedTests();

  console.log('Test Execution Results:');
  console.log('-----------------------------------------------------');
  results.forEach(test => {
    const symbol = test.status === 'passed' ? '✓' : '✗';
    console.log(`[${symbol}] [${test.category}] ${test.name} (${test.executionTimeMs}ms)`);
  });

  console.log('\nAssessment Rubric Evaluation (Criteria 1-7):');
  console.log('-----------------------------------------------------');
  rubricScores.forEach(r => {
    console.log(`• ${r.criterion}: ${r.score}% [${r.status}]`);
  });

  console.log('\n=====================================================');
  console.log(`TOTAL PASSED: ${totalPassed} / ${results.length}`);
  console.log(`OVERALL EVALUATION SCORE: ${overallScore} / 100`);
  console.log('=====================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

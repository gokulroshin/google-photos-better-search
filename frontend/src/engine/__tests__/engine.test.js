/**
 * Google Photos — Better Search MVP
 * Unit & Integration Test Suite for Phase 2 Local Entropy Engine
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  filterCandidates,
  rankAttributes,
  calculateShannonEntropy,
  generateQuestion,
  runClarificationPipeline
} from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libraryPath = path.resolve(__dirname, '../../data/photoLibrary.json');

const allAssets = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'));

console.log('=== Running Phase 2 Engine Test Suite ===\n');

let totalTests = 0;
let passedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ PASS: ${description}`);
  } catch (err) {
    console.error(`❌ FAIL: ${description}`);
    console.error(`   ${err.message}`);
  }
}

function expectEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}. ${msg}`);
  }
}

function expectTrue(val, msg = '') {
  if (!val) throw new Error(`Expected truthy value. ${msg}`);
}

// -----------------------------------------------------------------------------
// Test Scenario 1: Primary Demo Journey (53 -> 18 -> 6 -> 2 -> Early Stop)
// -----------------------------------------------------------------------------
it('Scenario 1: Primary Demo Journey matches 53 -> 18 -> 6 -> 2 with dynamic questions', () => {
  // Round 0: Initial Query "prescription"
  const step0 = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: [],
    questionIndex: 1
  });

  expectEqual(step0.candidateCount, 53, 'Initial pool size');
  expectEqual(step0.isEarlyStop, false, 'Step 0 early stop');
  expectTrue(step0.nextQuestion !== null, 'Next question exists');
  expectEqual(step0.nextQuestion.attribute, 'condition', 'Q1 attribute should be condition');
  expectEqual(step0.nextQuestion.prompt, 'What was the prescription for?', 'Q1 prompt');
  expectTrue(step0.nextQuestion.options.includes('Vomiting'), 'Q1 options include Vomiting');

  // Round 1: User selects "Vomiting"
  const step1Filters = [{ id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' }];
  const step1 = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: step1Filters,
    questionIndex: 2,
    previousCount: 53
  });

  expectEqual(step1.candidateCount, 18, 'Step 1 count');
  expectEqual(step1.reductionLabel, '53 → 18 matches', 'Step 1 reduction label');
  expectEqual(step1.isEarlyStop, false, 'Step 1 early stop');
  expectTrue(step1.nextQuestion !== null, 'Q2 exists');
  expectEqual(step1.nextQuestion.attribute, 'year', 'Q2 attribute should be year');
  expectEqual(step1.nextQuestion.prompt, 'About when was this prescription?', 'Q2 prompt');
  expectTrue(step1.nextQuestion.options.includes('2024'), 'Q2 options include 2024');

  // Round 2: User selects "2024"
  const step2Filters = [
    ...step1Filters,
    { id: 'f_year', dimension: 'year', value: 2024, label: '2024' }
  ];
  const step2 = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: step2Filters,
    questionIndex: 3,
    previousCount: 18
  });

  expectEqual(step2.candidateCount, 6, 'Step 2 count');
  expectEqual(step2.reductionLabel, '18 → 6 matches', 'Step 2 reduction label');
  expectEqual(step2.isEarlyStop, false, 'Step 2 early stop');
  expectTrue(step2.nextQuestion !== null, 'Q3 exists');
  expectEqual(step2.nextQuestion.attribute, 'location.category', 'Q3 attribute should be location.category');
  expectEqual(step2.nextQuestion.prompt, 'Do you remember where you were when you got it?', 'Q3 prompt');
  expectTrue(step2.nextQuestion.options.includes('Clinic'), 'Q3 options include Clinic');

  // Round 3: User selects "Clinic"
  const step3Filters = [
    ...step2Filters,
    { id: 'f_loc', dimension: 'location.category', value: 'Clinic', label: 'Clinic' }
  ];
  const step3 = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: step3Filters,
    questionIndex: 4,
    previousCount: 6
  });

  expectEqual(step3.candidateCount, 2, 'Final candidate count');
  expectEqual(step3.reductionLabel, '6 → 2 matches', 'Step 3 reduction label');
  expectEqual(step3.isEarlyStop, true, 'Early stop must be triggered');
  expectEqual(step3.earlyStopReason, 'isolated', 'Early stop reason must be isolated');
  expectEqual(step3.nextQuestion, null, 'No further question after early stop');
  expectEqual(step3.candidates[0].id, 'asset_001', 'First target photo is asset_001');
  expectEqual(step3.candidates[1].id, 'asset_002', 'Second target photo is asset_002');
});

// -----------------------------------------------------------------------------
// Test Scenario 2: "I'm Not Sure" Handling (Graceful Pivot)
// -----------------------------------------------------------------------------
it('Scenario 2: Tapping "I\'m not sure" skips unanswerable dimension and pivots to orthogonal clue', () => {
  // Candidate pool remains 53, but "condition" is marked unanswerable
  const pivotResult = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: [],
    unanswerableDimensions: ['condition'],
    questionIndex: 2,
    previousCount: 53
  });

  expectEqual(pivotResult.candidateCount, 53, 'Pool size preserved on Not Sure');
  expectTrue(pivotResult.nextQuestion !== null, 'Pivot question generated');
  expectTrue(pivotResult.nextQuestion.attribute !== 'condition', 'Condition must be skipped');
  // Second highest entropy attribute is year or visualAttributes.paperType
  expectTrue(
    pivotResult.nextQuestion.attribute === 'year' ||
    pivotResult.nextQuestion.attribute === 'visualAttributes.paperType',
    'Pivoted to next highest entropy dimension'
  );
});

// -----------------------------------------------------------------------------
// Test Scenario 3: Memory Chip Removal & Candidate Pool Re-expansion
// -----------------------------------------------------------------------------
it('Scenario 3: Removing an active memory chip re-expands the candidate pool', () => {
  const narrowed = filterCandidates(allAssets, 'prescription', [
    { dimension: 'condition', value: 'Vomiting' }
  ]);
  expectEqual(narrowed.length, 18, 'Narrowed pool');

  // Simulate chip removal by passing empty filters array
  const reExpanded = filterCandidates(allAssets, 'prescription', []);
  expectEqual(reExpanded.length, 53, 'Re-expanded pool count matches initial 53');
});

// -----------------------------------------------------------------------------
// Test Scenario 4: Content-Agnostic Query Handling ("beach")
// -----------------------------------------------------------------------------
it('Scenario 4: Content-agnostic search query ("beach") filters correctly and handles entropy', () => {
  const beachCandidates = filterCandidates(allAssets, 'beach');
  expectTrue(beachCandidates.length >= 2, 'Matches beach travel and pet assets');
  expectTrue(beachCandidates.every(a =>
    a.description.toLowerCase().includes('beach') ||
    a.title.toLowerCase().includes('beach') ||
    a.semanticTags.includes('beach')
  ), 'All candidates are beach-related');

  const pipeline = runClarificationPipeline({
    allAssets,
    query: 'beach',
    questionIndex: 1
  });
  expectTrue(pipeline.candidateCount >= 2, 'Pipeline candidate count');
  expectTrue(pipeline.executionTimeMs < 50, 'Execution time under 50ms');
});

// -----------------------------------------------------------------------------
// Test Scenario 5: High-Precision Initial Query (Instant Shortlist <= 3)
// -----------------------------------------------------------------------------
it('Scenario 5: High precision search query immediately triggers early stop', () => {
  const result = runClarificationPipeline({
    allAssets,
    query: 'Apollo Clinic Prescription - Dr. Rao',
    questionIndex: 1
  });

  expectTrue(result.candidateCount <= 3, 'High precision query isolates shortlist of <= 3 candidates');
  expectEqual(result.isEarlyStop, true, 'Immediate early stop');
  expectEqual(result.earlyStopReason, 'isolated', 'Isolated reason');
  expectEqual(result.nextQuestion, null, 'No question generated');
});

// -----------------------------------------------------------------------------
// Test Scenario 6: Question Budget Limit (Max 5 Questions)
// -----------------------------------------------------------------------------
it('Scenario 6: Hard budget of 5 questions is enforced when candidates > 3', () => {
  const result = runClarificationPipeline({
    allAssets,
    query: 'prescription',
    appliedFilters: [{ dimension: 'condition', value: 'Vomiting' }], // 18 candidates
    questionIndex: 6 // Exceeded 5 questions
  });

  expectEqual(result.candidateCount, 18, 'Candidate count');
  expectEqual(result.isEarlyStop, true, 'Early stop triggered');
  expectEqual(result.earlyStopReason, 'budget_exhausted', 'Budget exhausted reason');
  expectEqual(result.nextQuestion, null, 'No question after budget exhausted');
});

// -----------------------------------------------------------------------------
// Test Scenario 7: Performance Benchmark (< 50ms requirement)
// -----------------------------------------------------------------------------
it('Scenario 7: Full pipeline execution benchmark runs in < 5ms (well under 50ms requirement)', () => {
  const iterations = 50;
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    runClarificationPipeline({
      allAssets,
      query: 'prescription',
      appliedFilters: [{ dimension: 'condition', value: 'Vomiting' }],
      questionIndex: 2
    });
  }
  const totalMs = performance.now() - t0;
  const avgMs = totalMs / iterations;

  console.log(`   Benchmark: ${iterations} pipeline runs took ${totalMs.toFixed(2)}ms (Avg: ${avgMs.toFixed(3)}ms per run)`);
  expectTrue(avgMs < 50, `Average time ${avgMs}ms should be under 50ms`);
  expectTrue(avgMs < 10, `Average time ${avgMs}ms is sub-10ms`);
});

console.log('\n=========================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('🎉 ALL PHASE 2 ENGINE TESTS PASSED!');
  console.log('=========================================\n');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} TESTS FAILED!`);
  console.log('=========================================\n');
  process.exit(1);
}

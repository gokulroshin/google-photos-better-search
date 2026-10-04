/**
 * Google Photos — Better Search MVP
 * Phase 7 Edge Cases & Micro-State Transitions Test Suite
 */

import allAssetsData from '../../data/photoLibrary.json' with { type: 'json' };
import { runClarificationPipeline } from '../index.js';
import { rankAttributes } from '../entropyCalculator.js';

console.log('=== Running Phase 7 Edge Cases & Micro-State Test Suite ===\n');

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
// Test Scenarios
// -----------------------------------------------------------------------------

it('Test 7.1 (EC-12): Over-filtering with mutually impossible attributes drops candidates to 0 but allows auto-relax', () => {
  // Filter for condition: "Vomiting" + location: "Airport" (0 co-occurrences in prescriptions)
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [
      { id: 'f_cond', dimension: 'condition', value: 'Vomiting' },
      { id: 'f_loc', dimension: 'location.category', value: 'Airport' }
    ]
  });

  expectEqual(result.candidateCount, 0, 'Mutually exclusive filters result in 0 candidates in raw filter');

  // Verify that relaxing the conflicting filter (location) restores candidate pool
  const relaxedResult = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [
      { id: 'f_cond', dimension: 'condition', value: 'Vomiting' }
    ]
  });

  expectEqual(relaxedResult.candidateCount, 18, 'Relaxing conflicting filter restores 18 candidates');
});

it('Test 7.2 (EC-05): 3 consecutive "Not sure" marks dimensions as unanswerable without candidate loss', () => {
  // Step 1: User skips Q1 (condition)
  const step1 = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    unanswerableDimensions: ['condition'],
    questionIndex: 2
  });
  expectEqual(step1.candidateCount, 53, 'Step 1 candidate count remains 53');
  expectEqual(step1.nextQuestion.attribute, 'year', 'Pivots to year');

  // Step 2: User skips Q2 (year) -> Entropy ranks paperType next
  const step2 = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    unanswerableDimensions: ['condition', 'year'],
    questionIndex: 3
  });
  expectEqual(step2.candidateCount, 53, 'Step 2 candidate count remains 53');
  expectEqual(step2.nextQuestion.attribute, 'visualAttributes.paperType', 'Pivots to visualAttributes.paperType');

  // Step 3: User skips Q3 (visualAttributes.paperType) -> Pivots to location.category
  const step3 = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    unanswerableDimensions: ['condition', 'year', 'visualAttributes.paperType'],
    questionIndex: 4
  });
  expectEqual(step3.candidateCount, 53, 'Step 3 candidate count remains 53');
  expectEqual(step3.nextQuestion.attribute, 'location.category', 'Pivots to location.category');
});

it('Test 7.3 (EC-14): Entropy calculator handles null, undefined, and sparse metadata gracefully', () => {
  const syntheticSparseCandidates = [
    { id: 'c1', condition: null, year: 2024, location: null, visualAttributes: null, people: [] },
    { id: 'c2', condition: 'Vomiting', year: undefined, location: { category: 'Clinic' }, visualAttributes: {}, people: ['Dr. Rao'] },
    { id: 'c3', condition: undefined, year: 2024, location: null, visualAttributes: { paperType: 'Pink slip' }, people: [] },
    { id: 'c4', condition: null, year: null, location: null, visualAttributes: null, people: null }
  ];

  const ranked = rankAttributes(syntheticSparseCandidates, [], []);
  expectTrue(Array.isArray(ranked), 'Returns array of ranked attributes');
  // Attributes with > 40% null/undefined should be penalized or discounted
  for (const attr of ranked) {
    expectTrue(attr.entropy >= 0, 'Entropy is non-negative number');
    expectTrue(!isNaN(attr.entropy), 'Entropy is not NaN');
  }
});

it('Test 7.4 (EC-07 & EC-08): Shortlist recovery ("Still not it?") resumes questioning on remaining candidate pool', () => {
  // Candidate pool narrowed to 2
  const initialNarrowed = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [
      { id: 'f_cond', dimension: 'condition', value: 'Vomiting' },
      { id: 'f_year', dimension: 'year', value: 2024 },
      { id: 'f_loc', dimension: 'location.category', value: 'Clinic' }
    ]
  });
  expectEqual(initialNarrowed.candidateCount, 2, 'Narrowed to 2 candidates');
  expectEqual(initialNarrowed.isEarlyStop, true, 'Early stop true');

  // "Still not it?" relaxes location filter and marks location as unanswerable
  const recovered = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [
      { id: 'f_cond', dimension: 'condition', value: 'Vomiting' },
      { id: 'f_year', dimension: 'year', value: 2024 }
    ],
    unanswerableDimensions: ['location.category'],
    questionIndex: 4
  });

  expectEqual(recovered.candidateCount, 6, 'Candidate pool re-expands to 6');
  expectEqual(recovered.isEarlyStop, false, 'Questioning resumes');
  expectTrue(recovered.nextQuestion !== null, 'New question generated');
  expectEqual(recovered.nextQuestion.attribute, 'visualAttributes.paperType', 'Next question addresses paperType');
});

it('Test 7.5 (EC-09): Micro-state execution performance is strictly sub-50ms', () => {
  const start = performance.now();
  for (let i = 0; i < 20; i++) {
    runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      appliedFilters: [{ id: 'f_cond', dimension: 'condition', value: 'Vomiting' }],
      questionIndex: 2
    });
  }
  const avgDuration = (performance.now() - start) / 20;
  expectTrue(avgDuration < 10, `Average pipeline execution took ${avgDuration.toFixed(2)}ms (< 10ms requirement)`);
});

console.log('\n=========================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('🎉 ALL PHASE 7 EDGE CASE TESTS PASSED!');
} else {
  console.log(`💥 ${totalTests - passedTests} TESTS FAILED!`);
  process.exit(1);
}
console.log('=========================================\n');

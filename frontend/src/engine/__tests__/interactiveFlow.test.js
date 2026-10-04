/**
 * Google Photos — Better Search MVP
 * Phase 4 End-to-End Interactive Flow Simulation Test
 * Verifies full state machine reducer actions and primary demo journey
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import allAssetsData from '../../data/photoLibrary.json' with { type: 'json' };
import { runClarificationPipeline } from '../index.js';

console.log('=== Running Phase 4 Interactive Flow Walkthrough Test ===\n');

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
// Interactive Journey Step Simulation
// -----------------------------------------------------------------------------

it('Flow Step 0: User submits query "prescription" -> 53 candidates & Q1 generated', () => {
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [],
    questionIndex: 1
  });

  expectEqual(result.candidateCount, 53, 'Initial pool count');
  expectEqual(result.isEarlyStop, false, 'Early stop false');
  expectTrue(result.nextQuestion !== null, 'Q1 exists');
  expectEqual(result.nextQuestion.attribute, 'condition', 'Q1 attribute is condition');
  expectEqual(result.nextQuestion.prompt, 'What was the prescription for?', 'Q1 prompt');
  expectTrue(result.nextQuestion.options.includes('Vomiting'), 'Q1 options has Vomiting');
});

it('Flow Step 1: User selects "Vomiting" -> 53 -> 18 candidates & Q2 generated', () => {
  const filterCond = { id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [filterCond],
    answeredDimensions: ['query', 'condition'],
    questionIndex: 2,
    previousCount: 53
  });

  expectEqual(result.candidateCount, 18, 'Step 1 candidate count');
  expectEqual(result.reductionLabel, '53 → 18 matches', 'Step 1 reduction label');
  expectEqual(result.isEarlyStop, false, 'Early stop false');
  expectTrue(result.nextQuestion !== null, 'Q2 exists');
  expectEqual(result.nextQuestion.attribute, 'year', 'Q2 attribute is year');
  expectEqual(result.nextQuestion.prompt, 'About when was this prescription?', 'Q2 prompt');
  expectTrue(result.nextQuestion.options.includes('2024'), 'Q2 options has 2024');
});

it('Flow Step 2: User selects "2024" -> 18 -> 6 candidates & Q3 generated', () => {
  const filterCond = { id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  const filterYear = { id: 'f_year', dimension: 'year', value: 2024, label: '2024' };
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [filterCond, filterYear],
    answeredDimensions: ['query', 'condition', 'year'],
    questionIndex: 3,
    previousCount: 18
  });

  expectEqual(result.candidateCount, 6, 'Step 2 candidate count');
  expectEqual(result.reductionLabel, '18 → 6 matches', 'Step 2 reduction label');
  expectEqual(result.isEarlyStop, false, 'Early stop false');
  expectTrue(result.nextQuestion !== null, 'Q3 exists');
  expectEqual(result.nextQuestion.attribute, 'location.category', 'Q3 attribute is location.category');
  expectEqual(result.nextQuestion.prompt, 'Do you remember where you were when you got it?', 'Q3 prompt');
  expectTrue(result.nextQuestion.options.includes('Clinic'), 'Q3 options has Clinic');
});

it('Flow Step 3: User selects "Clinic" -> 6 -> 2 candidates & Early Stop activated', () => {
  const filterCond = { id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  const filterYear = { id: 'f_year', dimension: 'year', value: 2024, label: '2024' };
  const filterLoc = { id: 'f_loc', dimension: 'location.category', value: 'Clinic', label: 'Clinic' };
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [filterCond, filterYear, filterLoc],
    answeredDimensions: ['query', 'condition', 'year', 'location.category'],
    questionIndex: 4,
    previousCount: 6
  });

  expectEqual(result.candidateCount, 2, 'Final candidate count');
  expectEqual(result.reductionLabel, '6 → 2 matches', 'Step 3 reduction label');
  expectEqual(result.isEarlyStop, true, 'Early stop triggered');
  expectEqual(result.earlyStopReason, 'isolated', 'Early stop reason isolated');
  expectEqual(result.nextQuestion, null, 'No question generated after early stop');
  expectEqual(result.candidates[0].id, 'asset_001', 'Target asset 1');
  expectEqual(result.candidates[1].id, 'asset_002', 'Target asset 2');
});

it('Flow Step 4: Shortlist Recovery ("Still not it?") relaxes location and asks about paperType', () => {
  // Relax location.category: "Clinic", keep condition and year
  const filterCond = { id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  const filterYear = { id: 'f_year', dimension: 'year', value: 2024, label: '2024' };
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [filterCond, filterYear],
    answeredDimensions: ['query', 'condition', 'year'],
    unanswerableDimensions: ['location.category'], // Relaxed and excluded
    questionIndex: 4,
    previousCount: 2
  });

  expectEqual(result.candidateCount, 6, 'Re-expanded to 6 candidates');
  expectEqual(result.isEarlyStop, false, 'Early stop false');
  expectTrue(result.nextQuestion !== null, 'New question generated');
  expectEqual(result.nextQuestion.attribute, 'visualAttributes.paperType', 'Next question is visual appearance');
  expectEqual(result.nextQuestion.prompt, 'What did the document look like?', 'Paper type prompt');
  expectTrue(result.nextQuestion.options.includes('White paper'), 'Has White paper option');
});

it('Flow Step 5: Chip removal re-expands candidate pool accurately', () => {
  const filterCond = { id: 'f_cond', dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  
  // Starting with condition filter (18 candidates)
  const narrowed = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [filterCond],
    questionIndex: 2
  });
  expectEqual(narrowed.candidateCount, 18, 'Narrowed count');

  // Remove condition filter
  const reExpanded = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [],
    questionIndex: 1,
    previousCount: 18
  });
  expectEqual(reExpanded.candidateCount, 53, 'Re-expanded count is 53');
  expectEqual(reExpanded.nextQuestion.attribute, 'condition', 'Re-evaluates condition question');
});

it('Flow Step 6: "I\'m not sure" skips dimension without dropping any candidates', () => {
  const result = runClarificationPipeline({
    allAssets: allAssetsData,
    query: 'prescription',
    appliedFilters: [],
    unanswerableDimensions: ['condition'],
    questionIndex: 2,
    previousCount: 53
  });

  expectEqual(result.candidateCount, 53, 'Pool size intact');
  expectTrue(result.nextQuestion.attribute !== 'condition', 'Condition skipped');
  expectTrue(['year', 'visualAttributes.paperType'].includes(result.nextQuestion.attribute), 'Valid orthogonal clue');
});

console.log('\n=========================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('🎉 ALL PHASE 4 INTERACTIVE FLOW TESTS PASSED!');
  console.log('=========================================\n');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} TESTS FAILED!`);
  console.log('=========================================\n');
  process.exit(1);
}

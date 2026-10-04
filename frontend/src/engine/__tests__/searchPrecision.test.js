/**
 * Google Photos — Better Search MVP
 * Search Precision & Category Disambiguation Test Suite
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  filterCandidates,
  matchesQuery,
  runClarificationPipeline
} from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libraryPath = path.resolve(__dirname, '../../data/photoLibrary.json');
const allAssets = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'));

console.log('=== Running Search Precision & Disambiguation Test Suite ===\n');

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

it('Food query returns ONLY food, food orders, and dining — zero medical prescriptions', () => {
  const foodCandidates = filterCandidates(allAssets, 'Food');
  expectTrue(foodCandidates.length > 0, 'Food candidates exist');
  expectTrue(
    foodCandidates.every(a => a.contentType !== 'Document'),
    'Zero Document / Prescription assets returned for "Food"'
  );
  expectTrue(
    foodCandidates.some(a => a.contentType === 'Food'),
    'Matches Food photos'
  );
});

it('Food query clarification asks dining-appropriate questions instead of doctor questions', () => {
  const result = runClarificationPipeline({
    allAssets,
    query: 'Food',
    questionIndex: 1
  });
  expectTrue(result.nextQuestion !== null, 'Question generated for Food');
  expectTrue(
    !result.nextQuestion.prompt.toLowerCase().includes('prescription'),
    'Prompt does not mention prescription'
  );
  expectTrue(
    !result.nextQuestion.prompt.toLowerCase().includes('doctor'),
    'Prompt does not mention doctor'
  );
});

it('Query for "cat" uses whole-word boundary and does not match medication or vacation', () => {
  const catCandidates = filterCandidates(allAssets, 'cat');
  expectTrue(catCandidates.length > 0, 'Cat candidates exist');
  expectTrue(
    catCandidates.every(a => a.contentType === 'Pet'),
    'All matches for "cat" are Pet assets'
  );
});

it('Query for "beach" matches travel and pet assets, zero medical documents', () => {
  const beachCandidates = filterCandidates(allAssets, 'beach');
  expectTrue(beachCandidates.length >= 3, 'Matches beach photos');
  expectTrue(
    beachCandidates.every(a => a.contentType !== 'Document'),
    'Zero Document assets for "beach"'
  );
});

it('Prescription query demo journey retains exactly 53 documents', () => {
  const docCandidates = filterCandidates(allAssets, 'prescription');
  expectEqual(docCandidates.length, 53, 'Exactly 53 documents for prescription');
});

console.log('\n=========================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('🎉 ALL SEARCH PRECISION TESTS PASSED!');
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
console.log('=========================================\n');

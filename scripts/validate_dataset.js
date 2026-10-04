/**
 * Google Photos — Better Search MVP
 * Phase 1 Dataset Integrity Validation Script
 * Verifies schema compliance, unique IDs, asset files, and demo reduction curve
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const jsonPath = path.join(rootDir, 'frontend', 'src', 'data', 'photoLibrary.json');
const photosDir = path.join(rootDir, 'frontend', 'public', 'photos');

console.log('--- Starting Phase 1 Dataset Validation ---\n');

if (!fs.existsSync(jsonPath)) {
  console.error(`FAIL: photoLibrary.json not found at ${jsonPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf-8');
const assets = JSON.parse(rawData);

let errorCount = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ERROR: ${message}`);
    errorCount++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Total Count Verification (100 - 150 items)
assert(assets.length >= 100 && assets.length <= 150, `Library has ${assets.length} assets (Target: 100-150)`);

// 2. Schema, ID Uniqueness, and Asset File Verification
const seenIds = new Set();
const validContentTypes = new Set(["Document", "Travel", "People", "Food", "Screenshot", "Pet"]);
const validLocationCategories = new Set(["Clinic", "Hospital", "Home", "Beach", "Restaurant", "Outdoor"]);

let missingFieldsCount = 0;
let missingFilesCount = 0;

assets.forEach((asset, idx) => {
  // ID check
  if (!asset.id || seenIds.has(asset.id)) {
    console.error(`Asset at index ${idx} has invalid or duplicate id: ${asset.id}`);
    errorCount++;
  }
  seenIds.add(asset.id);

  // Required Fields
  const required = [
    'id', 'url', 'thumbnailUrl', 'title', 'contentType',
    'date', 'approxDateLabel', 'year', 'location', 'people',
    'visualAttributes', 'ocrText', 'description', 'semanticTags'
  ];
  for (const field of required) {
    if (asset[field] === undefined || asset[field] === null) {
      missingFieldsCount++;
      console.error(`Asset ${asset.id} is missing field '${field}'`);
    }
  }

  // Enum checks
  if (!validContentTypes.has(asset.contentType)) {
    console.error(`Asset ${asset.id} has invalid contentType: ${asset.contentType}`);
    errorCount++;
  }

  if (!asset.location || !validLocationCategories.has(asset.location.category)) {
    console.error(`Asset ${asset.id} has invalid location.category: ${asset.location?.category}`);
    errorCount++;
  }

  // Semantic Tags
  if (!Array.isArray(asset.semanticTags) || asset.semanticTags.length === 0) {
    console.error(`Asset ${asset.id} has empty semanticTags`);
    errorCount++;
  }

  // Physical WebP File Check
  const filename = path.basename(asset.thumbnailUrl);
  const filePath = path.join(photosDir, filename);
  if (!fs.existsSync(filePath)) {
    missingFilesCount++;
    console.error(`Missing thumbnail image file: ${filePath}`);
  }
});

assert(missingFieldsCount === 0, `All assets possess required fields (0 missing fields)`);
assert(missingFilesCount === 0, `All 130 WebP image files physically exist in frontend/public/photos/`);
assert(seenIds.size === assets.length, `All ${seenIds.size} asset IDs are strictly unique`);

// 3. Category Distribution Verification
const categoryCounts = {};
assets.forEach(a => {
  categoryCounts[a.contentType] = (categoryCounts[a.contentType] || 0) + 1;
});
console.log('\nCategory Distribution:');
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(` - ${cat}: ${count} assets`);
});
assert(categoryCounts['Document'] >= 50, `Document category has ${categoryCounts['Document']} assets (>=50 for broad medical recall)`);
assert(categoryCounts['Travel'] >= 15, `Travel category has ${categoryCounts['Travel']} assets`);
assert(categoryCounts['People'] >= 15, `People category has ${categoryCounts['People']} assets`);
assert(categoryCounts['Food'] >= 10, `Food category has ${categoryCounts['Food']} assets`);
assert(categoryCounts['Screenshot'] >= 10, `Screenshot category has ${categoryCounts['Screenshot']} assets`);
assert(categoryCounts['Pet'] >= 10, `Pet category has ${categoryCounts['Pet']} assets`);

// 4. Primary Demo Journey Reduction Curve Verification (53 -> 18 -> 6 -> 2)
console.log('\n--- Verifying Demo Reduction Curve (53 -> 18 -> 6 -> 2) ---');

// Step 0: Query "prescription"
const queryMatches = assets.filter(a =>
  a.semanticTags.includes('prescription') ||
  a.title.toLowerCase().includes('prescription') ||
  (a.documentSubType && a.documentSubType.toLowerCase().includes('prescription'))
);
console.log(`Step 0 (Query: "prescription"): ${queryMatches.length} candidates`);
assert(queryMatches.length === 53, `Initial query "prescription" yields exactly 53 candidates (Got: ${queryMatches.length})`);

// Step 1: Filter condition == "Vomiting"
const step1Matches = queryMatches.filter(a => a.condition === 'Vomiting');
console.log(`Step 1 (Condition: "Vomiting"): ${step1Matches.length} candidates`);
assert(step1Matches.length === 18, `Condition "Vomiting" narrows candidates to exactly 18 (Got: ${step1Matches.length})`);

// Step 2: Filter year == 2024
const step2Matches = step1Matches.filter(a => a.year === 2024);
console.log(`Step 2 (Year: 2024): ${step2Matches.length} candidates`);
assert(step2Matches.length === 6, `Year 2024 narrows candidates to exactly 6 (Got: ${step2Matches.length})`);

// Step 3: Filter location.category == "Clinic"
const step3Matches = step2Matches.filter(a => a.location?.category === 'Clinic');
console.log(`Step 3 (Location: "Clinic"): ${step3Matches.length} candidates`);
assert(step3Matches.length === 2, `Location "Clinic" narrows candidates to exactly 2 (Got: ${step3Matches.length})`);

// Early stop check
assert(step3Matches.length <= 3, `Candidate count (${step3Matches.length}) is <= 3, successfully triggering Early Stop rule`);

// Step 4: Verify Final Shortlist Candidates
console.log('\nFinal Shortlist Candidates:');
step3Matches.forEach(c => {
  console.log(` • [${c.id}] "${c.title}" | Paper: ${c.visualAttributes?.paperType} | Location: ${c.location.placeName}`);
});
assert(step3Matches.length === 2 && step3Matches[0].id === 'asset_001' && step3Matches[1].id === 'asset_002',
  `Final candidates are asset_001 and asset_002 (Dr. Rao White Paper vs Dr. Ananya Prescription Pad)`
);

// 5. Entropy Calculations Verification on Initial Pool (53 candidates)
console.log('\n--- Shannon Entropy Verification on Candidate Pool (53 assets) ---');

function calculateEntropy(items, attributeExtractor) {
  const counts = {};
  let total = 0;
  items.forEach(item => {
    const val = attributeExtractor(item);
    if (val !== undefined && val !== null) {
      counts[val] = (counts[val] || 0) + 1;
      total++;
    }
  });
  if (total === 0) return 0;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return { entropy, counts };
}

const conditionEntropy = calculateEntropy(queryMatches, a => a.condition);
const yearEntropy = calculateEntropy(queryMatches, a => a.year);
const locationCatEntropy = calculateEntropy(queryMatches, a => a.location?.category);
const paperTypeEntropy = calculateEntropy(queryMatches, a => a.visualAttributes?.paperType);

console.log(`Condition Entropy:     ${conditionEntropy.entropy.toFixed(3)} bits (Distribution:`, conditionEntropy.counts, `)`);
console.log(`Year Entropy:          ${yearEntropy.entropy.toFixed(3)} bits (Distribution:`, yearEntropy.counts, `)`);
console.log(`Location Cat Entropy:  ${locationCatEntropy.entropy.toFixed(3)} bits (Distribution:`, locationCatEntropy.counts, `)`);
console.log(`Paper Type Entropy:    ${paperTypeEntropy.entropy.toFixed(3)} bits (Distribution:`, paperTypeEntropy.counts, `)`);

assert(conditionEntropy.entropy > 1.5, `Condition has strong entropy (> 1.5 bits) for Question 1 selection`);
assert(yearEntropy.entropy > 1.0, `Year has strong entropy (> 1.0 bits)`);
assert(locationCatEntropy.entropy > 1.0, `Location Category has strong entropy (> 1.0 bits)`);

console.log(`\n=========================================`);
if (errorCount === 0) {
  console.log(`🎉 ALL PHASE 1 VALIDATION CHECKS PASSED (0 errors)!`);
  console.log(`=========================================\n`);
  process.exit(0);
} else {
  console.error(`💥 VALIDATION FAILED WITH ${errorCount} ERRORS!`);
  console.log(`=========================================\n`);
  process.exit(1);
}

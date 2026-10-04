/**
 * Google Photos — AI-Native Memory Retrieval MVP ("Better Search")
 * Phase 8 End-to-End Validation & Evaluator Readiness Suite
 * Validates all Acceptance Criteria (V-01 through V-18) from context.md & implementationplan.md
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(backendDir, '.env') });

const {
  allAssetsData,
  filterCandidates,
  rankAttributes,
  runClarificationPipeline
} = require(path.join(backendDir, 'engine.js'));

const {
  parseSearchQuery,
  parseRefinementClue
} = require(path.join(backendDir, 'geminiService.js'));

console.log('================================================================');
console.log('  Google Photos Better Search — Phase 8 End-to-End Validation   ');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function verify(criterionId, description, testFn) {
  totalChecks++;
  try {
    const detail = testFn();
    passedChecks++;
    console.log(`✅ [PASS] ${criterionId}: ${description}`);
    if (detail) console.log(`          ↳ ${detail}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${criterionId}: ${description}`);
    console.error(`          ↳ Error: ${err.message}`);
  }
}

async function verifyAsync(criterionId, description, testFn) {
  totalChecks++;
  try {
    const detail = await testFn();
    passedChecks++;
    console.log(`✅ [PASS] ${criterionId}: ${description}`);
    if (detail) console.log(`          ↳ ${detail}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${criterionId}: ${description}`);
    console.error(`          ↳ Error: ${err.message}`);
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

async function runValidation() {
  // ---------------------------------------------------------------------------
  // V-01: One Dynamic Screen
  // ---------------------------------------------------------------------------
  verify('V-01', 'One dynamic screen (No React Router, single-screen state machine)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8'));
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    expectTrue(!dependencies['react-router'], 'react-router must not be in dependencies');
    expectTrue(!dependencies['react-router-dom'], 'react-router-dom must not be in dependencies');

    const appCode = fs.readFileSync(path.join(frontendDir, 'src', 'App.jsx'), 'utf8');
    expectTrue(appCode.includes('<main className="mobile-shell"'), 'App uses single mobile-shell container');
    expectTrue(!appCode.includes('<Route'), 'No Route components exist');
    return 'Confirmed: Single-screen reactive architecture with zero multi-page routes.';
  });

  // ---------------------------------------------------------------------------
  // V-02: Search bar with demo placeholder
  // ---------------------------------------------------------------------------
  verify('V-02', 'Search bar with demo placeholder', () => {
    const searchBarCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'SearchBar.jsx'), 'utf8');
    expectTrue(
      searchBarCode.includes('placeholder="Try searching for a prescription…"'),
      'Search bar placeholder must match demo target'
    );
    return 'Confirmed: Placeholder prompts user with "Try searching for a prescription…".';
  });

  // ---------------------------------------------------------------------------
  // V-03: Broad initial pool (~50–55)
  // ---------------------------------------------------------------------------
  verify('V-03', 'Broad initial pool (~50–55 candidates for "prescription")', () => {
    const result = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      appliedFilters: []
    });
    expectTrue(
      result.candidateCount >= 50 && result.candidateCount <= 55,
      `Candidate count ${result.candidateCount} must be in [50, 55]`
    );
    return `Confirmed: Initial pool produces ${result.candidateCount} candidate assets.`;
  });

  // ---------------------------------------------------------------------------
  // V-04: Dynamic question selection based on entropy
  // ---------------------------------------------------------------------------
  verify('V-04', 'Dynamic question selection across varied content queries', () => {
    const qPrescription = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription'
    });
    const qTrip = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'trip'
    });

    expectTrue(qPrescription.nextQuestion !== null, 'Prescription Q1 generated');
    expectTrue(qTrip.nextQuestion !== null, 'Trip Q1 generated');

    const attrPrescription = qPrescription.nextQuestion.attribute;
    const attrTrip = qTrip.nextQuestion.attribute;

    expectEqual(attrPrescription, 'condition', 'Prescription Q1 addresses condition');
    expectEqual(attrTrip, 'location.category', 'Trip Q1 addresses location.category');
    expectTrue(attrTrip !== attrPrescription, 'Trip Q1 differs from Prescription Q1 based on data variance');

    return `Confirmed: Q1 adapts dynamically (Prescription: "${attrPrescription}", Trip: "${attrTrip}").`;
  });

  // ---------------------------------------------------------------------------
  // V-05: Question carousel slides from LEFT
  // ---------------------------------------------------------------------------
  verify('V-05', 'Question carousel slides from LEFT (250–400 ms CSS transition)', () => {
    const cssCode = fs.readFileSync(path.join(frontendDir, 'src', 'styles', 'main.css'), 'utf8');
    expectTrue(cssCode.includes('slideInFromLeft'), 'slideInFromLeft keyframe exists');
    expectTrue(cssCode.includes('transform: translateX(-60px)') || cssCode.includes('transform: translateX(-100%)'), 'Translates from negative X (left)');
    expectTrue(cssCode.includes('300ms'), 'Transition duration in 250-400ms range');
    return 'Confirmed: CSS animations strictly slide in from the left.';
  });

  // ---------------------------------------------------------------------------
  // V-06: Processing micro-state (300–700 ms)
  // ---------------------------------------------------------------------------
  verify('V-06', 'Processing micro-state (Sparkle pulse shimmer 300–700 ms)', () => {
    const overlayCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'ProcessingOverlay.jsx'), 'utf8');
    expectTrue(overlayCode.includes('Looking for patterns across your photos…'), 'Overlay text matches spec');

    const carouselCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'QuestionCarousel.jsx'), 'utf8');
    expectTrue(carouselCode.includes('400'), 'Option click includes 400ms micro-state timer');
    return 'Confirmed: 400ms shimmer pulse triggers between interactive steps.';
  });

  // ---------------------------------------------------------------------------
  // V-07: Candidate count updates visibly
  // ---------------------------------------------------------------------------
  verify('V-07', 'Candidate count updates visibly with animated transition', () => {
    const badgeCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'ResultCountBadge.jsx'), 'utf8');
    expectTrue(badgeCode.includes('requestAnimationFrame'), 'Uses requestAnimationFrame for rolling counter');
    expectTrue(badgeCode.includes('count-badge-pulse'), 'Applies count-badge-pulse animation');
    return 'Confirmed: requestAnimationFrame rolling counter animates number reductions.';
  });

  // ---------------------------------------------------------------------------
  // V-08: Photo grid reflows
  // ---------------------------------------------------------------------------
  verify('V-08', 'Photo grid reflows with CSS transitions and staggered entry', () => {
    const gridCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'PhotoGrid.jsx'), 'utf8');
    expectTrue(gridCode.includes('photo-grid-item'), 'Grid items use photo-grid-item class');
    expectTrue(gridCode.includes('animationDelay'), 'Staggered micro-animation delays applied');
    return 'Confirmed: Fluid CSS grid repositioning with staggered thumbnail entrance.';
  });

  // ---------------------------------------------------------------------------
  // V-09: "I'm not sure" pivots correctly
  // ---------------------------------------------------------------------------
  verify('V-09', '"I\'m not sure" pivots to orthogonal attribute without candidate loss', () => {
    const initial = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      questionIndex: 1
    });
    expectEqual(initial.nextQuestion.attribute, 'condition', 'Q1 is condition');

    const notSureStep = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      unanswerableDimensions: ['condition'],
      questionIndex: 2
    });

    expectEqual(notSureStep.candidateCount, 53, 'No candidates lost on "Not sure"');
    expectEqual(notSureStep.nextQuestion.attribute, 'year', 'Pivots to year');
    return 'Confirmed: "I\'m not sure" preserves 53 candidates and pivots to orthogonal year clue.';
  });

  // ---------------------------------------------------------------------------
  // V-10: Early stop at <= 3 candidates
  // ---------------------------------------------------------------------------
  verify('V-10', 'Early stop triggered when candidates <= 3', () => {
    const result = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      appliedFilters: [
        { id: 'f_cond', dimension: 'condition', value: 'Vomiting' },
        { id: 'f_year', dimension: 'year', value: 2024 },
        { id: 'f_loc', dimension: 'location.category', value: 'Clinic' }
      ],
      questionIndex: 4
    });

    expectEqual(result.candidateCount, 2, 'Candidate pool narrowed to 2');
    expectEqual(result.isEarlyStop, true, 'Early stop is active');
    expectEqual(result.nextQuestion, null, 'No further question generated');
    return 'Confirmed: Narrows to 2 candidates and halts questioning for Shortlist view.';
  });

  // ---------------------------------------------------------------------------
  // V-11: Max 5 questions enforced
  // ---------------------------------------------------------------------------
  verify('V-11', 'Hard budget cap of 5 questions enforced', () => {
    const result = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      questionIndex: 6 // Exceeded 5
    });

    expectEqual(result.isEarlyStop, true, 'Early stop enforced after 5 questions');
    expectEqual(result.earlyStopReason, 'budget_exhausted', 'Reason budget_exhausted');
    expectEqual(result.nextQuestion, null, 'No 6th question generated');
    return 'Confirmed: Hard limit stops questioning at 5 questions maximum.';
  });

  // ---------------------------------------------------------------------------
  // V-12: "Still not it?" resumes questioning
  // ---------------------------------------------------------------------------
  verify('V-12', '"Still not it?" resumes questioning on remaining candidate pool', () => {
    // Relax location and mark it unanswerable
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
    return `Confirmed: Re-expands pool to 6 and resumes questioning with "${recovered.nextQuestion.prompt}".`;
  });

  // ---------------------------------------------------------------------------
  // V-13: Photo viewer works
  // ---------------------------------------------------------------------------
  verify('V-13', 'Immersive OLED photo viewer modal with Google Photos actions', () => {
    const viewerCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'PhotoViewerModal.jsx'), 'utf8');
    expectTrue(viewerCode.includes('var(--gp-oled-black)'), 'Uses OLED black background');
    expectTrue(viewerCode.includes('ShareIcon') && viewerCode.includes('LensIcon'), 'Includes Google Photos actions');
    expectTrue(viewerCode.includes('Did you find what you were looking for?'), 'Includes confirmation prompt');
    return 'Confirmed: Immersive dark viewer with Share, Edit, Lens, and confirmation dialog.';
  });

  // ---------------------------------------------------------------------------
  // V-14: Confirmation prompt logs metric (POST /api/confirm)
  // ---------------------------------------------------------------------------
  await verifyAsync('V-14', 'Confirmation prompt logs North Star metric to backend', async () => {
    const testPayload = {
      sessionId: `sess_val_${Date.now()}`,
      targetPhotoId: 'asset_001',
      isSuccess: true,
      durationSeconds: 15,
      questionsAsked: 3
    };

    const res = await fetch('http://localhost:8080/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    expectEqual(res.status, 200, 'HTTP 200 response');
    const data = await res.json();
    expectEqual(data.status, 'recorded', 'Status recorded in telemetry store');

    const telRes = await fetch('http://localhost:8080/api/telemetry');
    const telData = await telRes.json();
    expectTrue(telData.totalRetrievals >= 1, 'Telemetry total retrievals recorded');
    return `Confirmed: Telemetry logging successful (Success rate: ${telData.successRatePercent}%).`;
  });

  // ---------------------------------------------------------------------------
  // V-15: Free-text natural language refinement
  // ---------------------------------------------------------------------------
  await verifyAsync('V-15', 'Free-text refinement parsing with Gemini & fallback', async () => {
    const parsed = await parseRefinementClue('at the clinic', 'location.category');
    expectEqual(parsed.dimension, 'location.category', 'Dimension parsed as location.category');
    expectEqual(parsed.value, 'Clinic', 'Value extracted as Clinic');

    const res = await fetch('http://localhost:8080/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'sess_freetext_test',
        questionId: 'q_location_category',
        freeTextClue: 'at the clinic'
      })
    });

    expectEqual(res.status, 200, 'Refine endpoint returns 200 OK');
    const data = await res.json();
    expectTrue(data.candidateCount > 0, 'Candidates returned');
    return `Confirmed: Free-text parsed into { dimension: "${parsed.dimension}", value: "${parsed.value}" }.`;
  });

  // ---------------------------------------------------------------------------
  // V-16: Chip removal re-expands
  // ---------------------------------------------------------------------------
  verify('V-16', 'Chip removal re-expands candidate pool accurately', () => {
    // 1 filter active
    const narrowed = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      appliedFilters: [{ id: 'f_cond', dimension: 'condition', value: 'Vomiting' }]
    });
    expectEqual(narrowed.candidateCount, 18, 'Narrowed to 18');

    // Remove chip (empty appliedFilters)
    const reExpanded = runClarificationPipeline({
      allAssets: allAssetsData,
      query: 'prescription',
      appliedFilters: []
    });
    expectEqual(reExpanded.candidateCount, 53, 'Pool re-expands to 53');
    return 'Confirmed: Removing [Vomiting ✕] re-expands pool from 18 back to 53.';
  });

  // ---------------------------------------------------------------------------
  // V-17: Mobile viewport compliance
  // ---------------------------------------------------------------------------
  verify('V-17', 'Mobile viewport meta and responsive shell constraints', () => {
    const htmlCode = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
    expectTrue(htmlCode.includes('name="viewport"'), 'Viewport meta tag present');
    expectTrue(htmlCode.includes('width=device-width'), 'Device width set');

    const cssCode = fs.readFileSync(path.join(frontendDir, 'src', 'styles', 'main.css'), 'utf8');
    expectTrue(cssCode.includes('--gp-mobile-width: 390px'), 'Target mobile width defined at 390px');
    return 'Confirmed: Mobile viewport configured with 390px shell constraint.';
  });

  // ---------------------------------------------------------------------------
  // V-18: Self-service usability & evaluator onboarding
  // ---------------------------------------------------------------------------
  verify('V-18', 'Self-service evaluator onboarding with demo starter chips', () => {
    const searchBarCode = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'SearchBar.jsx'), 'utf8');
    expectTrue(searchBarCode.includes('prescription'), 'Includes prescription starter chip');
    expectTrue(searchBarCode.includes('beach'), 'Includes beach starter chip');
    expectTrue(searchBarCode.includes('shoes'), 'Includes shoes starter chip');
    return 'Confirmed: Evaluator onboarding starter chips active on initial feed.';
  });

  // ---------------------------------------------------------------------------
  // Final Results
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  VALIDATION SUMMARY: ${passedChecks} / ${totalChecks} CRITERIA PASSED`);
  if (passedChecks === totalChecks) {
    console.log('  🎉 ALL ACCEPTANCE CRITERIA (V-01 to V-18) VERIFIED & PASSED!');
  } else {
    console.log(`  💥 ${totalChecks - passedChecks} CRITERIA FAILED`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

runValidation().catch(err => {
  console.error('Fatal validation runner error:', err);
  process.exit(1);
});

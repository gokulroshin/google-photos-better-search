/**
 * Google Photos — Better Search MVP
 * Phase 6 Backend API & Gemini Integration Test Suite
 */

const http = require('http');

console.log('=== Running Phase 6 Backend API & Gemini Test Suite ===\n');

let totalTests = 0;
let passedTests = 0;

async function it(description, fn) {
  totalTests++;
  try {
    await fn();
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

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`http://localhost:8080${path}`, {
    method,
    headers,
    body
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, data: json };
}

async function runTestSuite() {
  let activeSessionId = null;

  await it('Test 6.1: GET /health returns 200 and healthy status', async () => {
    const res = await request('/health');
    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.status, 'ok', 'Status is ok');
    expectEqual(res.data.service, 'gp-better-search-backend', 'Service name');
  });

  await it('Test 6.2: POST /api/search extracts clues, returns 53 candidates & Q1 (Condition)', async () => {
    const res = await request('/api/search', {
      method: 'POST',
      body: { query: 'prescription', sessionId: 'sess_test_p6' }
    });

    activeSessionId = res.data.sessionId || 'sess_test_p6';

    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.candidateCount, 53, 'Candidate count 53');
    expectTrue(Array.isArray(res.data.candidates), 'Candidates array');
    expectEqual(res.data.candidates.length, 53, 'Candidates length');
    expectTrue(res.data.nextQuestion !== null, 'Q1 exists');
    expectEqual(res.data.nextQuestion.attribute, 'condition', 'Q1 is condition');
    expectTrue(res.data.nextQuestion.options.includes('Vomiting'), 'Includes Vomiting');
  });

  await it('Test 6.3: POST /api/refine (Option Chip: "Vomiting") narrows to 18 candidates & generates Q2 (Year)', async () => {
    const res = await request('/api/refine', {
      method: 'POST',
      body: {
        sessionId: activeSessionId,
        questionId: 'q_condition',
        selectedOption: 'Vomiting'
      }
    });

    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.candidateCount, 18, 'Candidate count narrowed to 18');
    expectEqual(res.data.reductionBadge, '53 → 18 matches', 'Reduction badge 53 -> 18');
    expectTrue(res.data.nextQuestion !== null, 'Q2 exists');
    expectEqual(res.data.nextQuestion.attribute, 'year', 'Q2 is year');
  });

  await it('Test 6.4: POST /api/refine (Option Chip: "2024") narrows to 6 candidates & generates Q3 (Location)', async () => {
    const res = await request('/api/refine', {
      method: 'POST',
      body: {
        sessionId: activeSessionId,
        questionId: 'q_year',
        selectedOption: '2024'
      }
    });

    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.candidateCount, 6, 'Candidate count narrowed to 6');
    expectEqual(res.data.reductionBadge, '18 → 6 matches', 'Reduction badge 18 -> 6');
    expectTrue(res.data.nextQuestion !== null, 'Q3 exists');
    expectEqual(res.data.nextQuestion.attribute, 'location.category', 'Q3 is location.category');
  });

  await it('Test 6.5: POST /api/refine with free-text memory clue ("at the clinic") parses via Gemini & triggers Early Stop (<= 3)', async () => {
    const res = await request('/api/refine', {
      method: 'POST',
      body: {
        sessionId: activeSessionId,
        questionId: 'q_location_category',
        freeTextClue: 'at the clinic'
      }
    });

    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.candidateCount, 2, 'Candidate count narrowed to 2');
    expectEqual(res.data.isEarlyStop, true, 'Early stop triggered');
    expectEqual(res.data.nextQuestion, null, 'Next question is null on early stop');
  });

  await it('Test 6.6: GET /api/session/:id retrieves persisted session state', async () => {
    const res = await request(`/api/session/${activeSessionId}`);
    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.sessionId, activeSessionId, 'Matching session id');
    expectEqual(res.data.candidateCount, 2, 'Persisted candidate count is 2');
    expectEqual(res.data.isEarlyStop, true, 'Persisted isEarlyStop is true');
  });

  await it('Test 6.7: POST /api/confirm records successful retrieval telemetry', async () => {
    const res = await request('/api/confirm', {
      method: 'POST',
      body: {
        sessionId: activeSessionId,
        targetPhotoId: 'asset_001',
        isSuccess: true,
        durationSeconds: 19,
        questionsAsked: 3
      }
    });

    expectEqual(res.status, 200, 'HTTP 200');
    expectEqual(res.data.status, 'recorded', 'Status recorded');
    expectEqual(res.data.record.isSuccess, true, 'isSuccess true');
  });

  await it('Test 6.8: GET /api/telemetry calculates evaluator North Star metrics', async () => {
    const res = await request('/api/telemetry');
    expectEqual(res.status, 200, 'HTTP 200');
    expectTrue(res.data.totalRetrievals >= 1, 'Total retrievals >= 1');
    expectTrue(res.data.successfulRetrievals >= 1, 'Successful retrievals >= 1');
    expectTrue(res.data.successRatePercent > 0, 'Success rate > 0%');
  });

  console.log('\n=========================================');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL PHASE 6 BACKEND API TESTS PASSED!');
  } else {
    console.log(`💥 ${totalTests - passedTests} TESTS FAILED!`);
    process.exit(1);
  }
  console.log('=========================================\n');
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

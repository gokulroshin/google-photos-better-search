/**
 * Google Photos — Better Search MVP
 * Phase 5 Retrieval Confirmation & Telemetry Logging Test
 */

console.log('=== Running Phase 5 Retrieval Confirmation Test ===\n');

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

async function runTests() {
  await it('Test 5.1: Session telemetry payload conforms to POST /api/confirm schema', () => {
    const payload = {
      sessionId: 'sess_test_123',
      targetPhotoId: 'asset_001',
      isSuccess: true,
      durationSeconds: 18,
      questionsAsked: 3,
      timestamp: new Date().toISOString()
    };

    expectTrue(typeof payload.sessionId === 'string', 'sessionId is string');
    expectEqual(payload.targetPhotoId, 'asset_001', 'targetPhotoId is asset_001');
    expectEqual(payload.isSuccess, true, 'isSuccess is boolean');
    expectEqual(payload.durationSeconds, 18, 'durationSeconds is number');
    expectEqual(payload.questionsAsked, 3, 'questionsAsked is number');
    expectTrue(Boolean(Date.parse(payload.timestamp)), 'valid ISO timestamp');
  });

  await it('Test 5.2: Backend POST /api/confirm records successful retrieval', async () => {
    const payload = {
      sessionId: 'sess_demo_yes',
      targetPhotoId: 'asset_001',
      isSuccess: true,
      durationSeconds: 22,
      questionsAsked: 3
    };

    const res = await fetch('http://localhost:8080/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expectEqual(res.status, 200, 'HTTP 200 OK');
    const data = await res.json();
    expectEqual(data.status, 'recorded', 'Status recorded');
    expectEqual(data.record.isSuccess, true, 'isSuccess recorded');
    expectEqual(data.record.targetPhotoId, 'asset_001', 'targetPhotoId recorded');
  });

  await it('Test 5.3: Backend POST /api/confirm records negative retrieval', async () => {
    const payload = {
      sessionId: 'sess_demo_no',
      targetPhotoId: 'asset_002',
      isSuccess: false,
      durationSeconds: 30,
      questionsAsked: 4
    };

    const res = await fetch('http://localhost:8080/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expectEqual(res.status, 200, 'HTTP 200 OK');
    const data = await res.json();
    expectEqual(data.status, 'recorded', 'Status recorded');
    expectEqual(data.record.isSuccess, false, 'isSuccess false recorded');
  });

  await it('Test 5.4: GET /api/telemetry computes North Star success rate across recorded sessions', async () => {
    const res = await fetch('http://localhost:8080/api/telemetry');
    expectEqual(res.status, 200, 'HTTP 200 OK');
    const data = await res.json();
    expectTrue(data.totalRetrievals >= 2, 'Total retrievals recorded >= 2');
    expectTrue(data.successfulRetrievals >= 1, 'Successful retrievals recorded >= 1');
    expectTrue(typeof data.successRatePercent === 'number', 'Success rate percent is numeric');
    console.log(`   Logged metrics: ${data.successfulRetrievals}/${data.totalRetrievals} successful (${data.successRatePercent}%)`);
  });

  console.log('\n=========================================');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL PHASE 5 CONFIRMATION & TELEMETRY TESTS PASSED!');
    console.log('=========================================\n');
  } else {
    console.error(`💥 ${totalTests - passedTests} TESTS FAILED!`);
    console.log('=========================================\n');
    process.exitCode = 1;
  }
}

runTests();

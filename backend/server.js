require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  allAssetsData,
  filterCandidates,
  runClarificationPipeline
} = require('./engine');
const {
  parseSearchQuery,
  parseRefinementClue
} = require('./geminiService');
const {
  createSession,
  getSession,
  updateSession
} = require('./sessionStore');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// In-memory telemetry store for retrieval confirmation events
const telemetryStore = [];

const path = require('path');
const fs = require('fs');

const distPath = path.resolve(__dirname, '../frontend/dist');
const hasFrontendDist = fs.existsSync(distPath);

if (hasFrontendDist) {
  app.use(express.static(distPath));
}

// -----------------------------------------------------------------------------
// Health & Diagnostic Endpoints
// -----------------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'gp-better-search-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Google Photos — Better Search Prototype API',
    endpoints: {
      health: 'GET /health',
      search: 'POST /api/search',
      refine: 'POST /api/refine',
      confirm: 'POST /api/confirm',
      session: 'GET /api/session/:id',
      telemetry: 'GET /api/telemetry'
    }
  });
});

if (!hasFrontendDist) {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Google Photos — Better Search Prototype API',
      endpoints: {
        health: 'GET /health',
        search: 'POST /api/search',
        refine: 'POST /api/refine',
        confirm: 'POST /api/confirm',
        session: 'GET /api/session/:id',
        telemetry: 'GET /api/telemetry'
      }
    });
  });
}

// -----------------------------------------------------------------------------
// 7.1 POST /api/search - Initial Natural Language Query & Broad Candidate Pool
// -----------------------------------------------------------------------------

app.post('/api/search', async (req, res) => {
  try {
    const { query = '', sessionId: reqSessionId } = req.body || {};
    const sessionId = reqSessionId || `sess_${Date.now().toString(36)}`;

    // 1. Natural language parsing via Gemini (with heuristic fallback)
    const extractedClues = await parseSearchQuery(query);

    // 2. Derive base query keyword and initial applied filter chips if specified
    const baseQuery = extractedClues.query || query;
    const initialFilters = [];

    if (extractedClues.condition) {
      initialFilters.push({
        id: `f_cond_${Date.now()}`,
        dimension: 'condition',
        value: extractedClues.condition,
        label: extractedClues.condition,
        removable: true
      });
    }

    if (extractedClues.year) {
      initialFilters.push({
        id: `f_year_${Date.now()}`,
        dimension: 'year',
        value: extractedClues.year,
        label: String(extractedClues.year),
        removable: true
      });
    }

    if (extractedClues.locationCategory) {
      initialFilters.push({
        id: `f_loc_${Date.now()}`,
        dimension: 'location.category',
        value: extractedClues.locationCategory,
        label: extractedClues.locationCategory,
        removable: true
      });
    }

    // 3. Run the clarification pipeline to filter candidates and determine Q1
    const pipelineResult = runClarificationPipeline({
      allAssets: allAssetsData,
      query: baseQuery,
      appliedFilters: initialFilters,
      questionIndex: 1
    });

    // 4. Save session in store for rehydration and subsequent refinement
    createSession(sessionId, {
      query: baseQuery,
      step: 1,
      appliedFilters: initialFilters,
      answeredDimensions: initialFilters.map(f => f.dimension),
      unanswerableDimensions: [],
      candidateIds: pipelineResult.candidates.map(c => c.id),
      candidateCount: pipelineResult.candidateCount,
      previousCount: null,
      currentQuestion: pipelineResult.nextQuestion,
      isEarlyStop: pipelineResult.isEarlyStop
    });

    // 5. Response conforms to architecture.md §7.1 contract
    res.status(200).json({
      sessionId,
      candidateCount: pipelineResult.candidateCount,
      candidates: pipelineResult.candidates,
      extractedClues,
      nextQuestion: pipelineResult.nextQuestion,
      reductionBadge: pipelineResult.reductionLabel,
      isEarlyStop: pipelineResult.isEarlyStop
    });
  } catch (err) {
    console.error('Error in POST /api/search:', err);
    res.status(500).json({
      error: 'Internal search error',
      message: err.message
    });
  }
});

// -----------------------------------------------------------------------------
// 7.2 POST /api/refine - Progressive Question Answering & Free-Text Clue Parsing
// -----------------------------------------------------------------------------

app.post('/api/refine', async (req, res) => {
  try {
    const {
      sessionId: reqSessionId,
      questionId,
      selectedOption,
      freeTextClue,
      isNotSure = false
    } = req.body || {};

    const sessionId = reqSessionId || `sess_${Date.now().toString(36)}`;
    let session = getSession(sessionId);

    // If session doesn't exist, create an initial fallback session
    if (!session) {
      session = createSession(sessionId, {
        query: 'prescription',
        step: 1,
        appliedFilters: [],
        answeredDimensions: [],
        unanswerableDimensions: []
      });
    }

    const previousCount = session.candidateCount || allAssetsData.length;
    let appliedFilters = [...(session.appliedFilters || [])];
    let answeredDimensions = [...(session.answeredDimensions || [])];
    let unanswerableDimensions = [...(session.unanswerableDimensions || [])];

    // Determine target dimension from questionId or current question
    let activeDimension = null;
    if (questionId) {
      if (questionId.includes('condition')) activeDimension = 'condition';
      else if (questionId.includes('year') || questionId.includes('date')) activeDimension = 'year';
      else if (questionId.includes('location')) activeDimension = 'location.category';
      else if (questionId.includes('paper')) activeDimension = 'visualAttributes.paperType';
      else if (questionId.includes('people')) activeDimension = 'people';
    }
    if (!activeDimension && session.currentQuestion) {
      activeDimension = session.currentQuestion.attribute;
    }

    // Branch A: User tapped "I'm not sure"
    if (isNotSure) {
      if (activeDimension && !unanswerableDimensions.includes(activeDimension)) {
        unanswerableDimensions.push(activeDimension);
      }
    }
    // Branch B: User provided a natural language free-text memory clue
    else if (freeTextClue && freeTextClue.trim()) {
      const parsedClue = await parseRefinementClue(freeTextClue.trim(), activeDimension);

      appliedFilters.push({
        id: `f_free_${Date.now()}`,
        dimension: parsedClue.dimension,
        value: parsedClue.value,
        label: parsedClue.label || freeTextClue.trim(),
        removable: true
      });

      if (parsedClue.dimension && !answeredDimensions.includes(parsedClue.dimension)) {
        answeredDimensions.push(parsedClue.dimension);
      }
    }
    // Branch C: User tapped an option chip
    else if (selectedOption) {
      appliedFilters.push({
        id: `f_opt_${Date.now()}`,
        dimension: activeDimension,
        value: selectedOption,
        label: selectedOption,
        removable: true
      });

      if (activeDimension && !answeredDimensions.includes(activeDimension)) {
        answeredDimensions.push(activeDimension);
      }
    }

    const nextStep = (session.step || 1) + 1;

    // Run clarification pipeline with updated constraints
    const pipelineResult = runClarificationPipeline({
      allAssets: allAssetsData,
      query: session.query,
      appliedFilters,
      answeredDimensions,
      unanswerableDimensions,
      questionIndex: nextStep,
      previousCount
    });

    // Compute reduction badge
    let reductionBadge = `${pipelineResult.candidateCount} matches`;
    if (previousCount !== pipelineResult.candidateCount) {
      reductionBadge = `${previousCount} → ${pipelineResult.candidateCount} matches`;
    }

    // Update session store
    updateSession(sessionId, {
      step: nextStep,
      appliedFilters,
      answeredDimensions,
      unanswerableDimensions,
      candidateIds: pipelineResult.candidates.map(c => c.id),
      candidateCount: pipelineResult.candidateCount,
      previousCount,
      currentQuestion: pipelineResult.nextQuestion,
      isEarlyStop: pipelineResult.isEarlyStop
    });

    // Response conforms to architecture.md §7.2 contract
    res.status(200).json({
      sessionId,
      previousCount,
      candidateCount: pipelineResult.candidateCount,
      reductionBadge,
      activeFilters: [
        { id: 'f_query', label: session.query || 'Search', removable: false },
        ...appliedFilters
      ],
      candidates: pipelineResult.candidates,
      isEarlyStop: pipelineResult.isEarlyStop,
      nextQuestion: pipelineResult.nextQuestion
    });
  } catch (err) {
    console.error('Error in POST /api/refine:', err);
    res.status(500).json({
      error: 'Refinement pipeline error',
      message: err.message
    });
  }
});

// -----------------------------------------------------------------------------
// 7.3 POST /api/confirm - Log Retrieval Confirmation (North Star Metric)
// -----------------------------------------------------------------------------

app.post('/api/confirm', (req, res) => {
  const { sessionId, targetPhotoId, isSuccess, durationSeconds, questionsAsked } = req.body || {};

  const record = {
    sessionId: sessionId || 'sess_' + Date.now(),
    targetPhotoId: targetPhotoId || null,
    isSuccess: Boolean(isSuccess),
    durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : 0,
    questionsAsked: typeof questionsAsked === 'number' ? questionsAsked : 0,
    receivedAt: new Date().toISOString()
  };

  telemetryStore.push(record);
  console.log('[Telemetry Confirm] Recorded North Star metric:', record);

  res.status(200).json({
    status: 'recorded',
    record
  });
});

// -----------------------------------------------------------------------------
// 7.4 GET /api/session/:id - Session State Inspection & Rehydration
// -----------------------------------------------------------------------------

app.get('/api/session/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      sessionId: req.params.id
    });
  }

  res.status(200).json(session);
});

// -----------------------------------------------------------------------------
// GET /api/telemetry - Evaluator Telemetry Summary Endpoint
// -----------------------------------------------------------------------------

app.get('/api/telemetry', (req, res) => {
  const total = telemetryStore.length;
  const successes = telemetryStore.filter(r => r.isSuccess).length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  res.status(200).json({
    totalRetrievals: total,
    successfulRetrievals: successes,
    successRatePercent: Math.round(successRate * 10) / 10,
    records: telemetryStore
  });
});

// Client-side SPA fallback for production builds
if (hasFrontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server - Bind to 0.0.0.0 for containerized / cloud hosting (Railway, Render, Docker)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

module.exports = { app, server };

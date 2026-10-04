/**
 * Google Photos — Better Search MVP
 * Clarification Pipeline Orchestrator (Phase 2)
 * Connects Filter Engine, Entropy Calculator, and Question Generator.
 */

import { filterCandidates, matchesQuery, matchesFilter } from './filterEngine.js';
import { rankAttributes, calculateShannonEntropy, EVALUABLE_DIMENSIONS } from './entropyCalculator.js';
import { generateQuestion } from './questionGenerator.js';

export {
  filterCandidates,
  matchesQuery,
  matchesFilter,
  rankAttributes,
  calculateShannonEntropy,
  EVALUABLE_DIMENSIONS,
  generateQuestion
};

/**
 * Runs the end-to-end clarification pipeline:
 * 1. Filters candidates based on query and applied filters.
 * 2. Checks early-stop condition (<= 3 candidates or >= 5 questions asked).
 * 3. If not stopped, computes Shannon entropy on unresolved candidate attributes.
 * 4. Generates the optimal clarification question with 3-5 options.
 *
 * @param {Object} options
 * @param {Array} options.allAssets - Master photo library
 * @param {string} options.query - Free text query (e.g. "prescription")
 * @param {Array} options.appliedFilters - Active FilterChip objects
 * @param {Array<string>} [options.answeredDimensions] - Attributes already resolved
 * @param {Array<string>} [options.unanswerableDimensions] - Attributes marked "I'm not sure"
 * @param {number} [options.questionIndex] - Current question step (1 to 5)
 * @param {number} [options.previousCount] - Previous candidate count for reduction badge
 * @returns {Object} Pipeline result
 */
export function runClarificationPipeline({
  allAssets,
  query,
  appliedFilters = [],
  answeredDimensions = [],
  unanswerableDimensions = [],
  questionIndex = 1,
  previousCount = null
}) {
  const startTime = performance.now();

  // 1. Filter candidates
  const candidates = filterCandidates(allAssets, query, appliedFilters);
  const candidateCount = candidates.length;

  // Track all answered dimensions from appliedFilters
  const answeredSet = new Set(answeredDimensions);
  appliedFilters.forEach(f => {
    if (f.dimension) answeredSet.add(f.dimension);
  });

  // Calculate reduction badge label
  let reductionLabel = `${candidateCount} possible matches`;
  if (previousCount !== null && previousCount !== candidateCount) {
    reductionLabel = `${previousCount} → ${candidateCount} matches`;
  }

  // 2. Evaluate Early Stop Conditions
  // Condition A: Candidates narrowed to 3 or fewer (target isolated)
  if (candidateCount <= 3) {
    const duration = performance.now() - startTime;
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'isolated', // Target isolated
      nextQuestion: null,
      rankedAttributes: [],
      executionTimeMs: duration
    };
  }

  // Condition B: Question budget reached (max 5 questions)
  if (questionIndex > 5) {
    const duration = performance.now() - startTime;
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'budget_exhausted',
      nextQuestion: null,
      rankedAttributes: [],
      executionTimeMs: duration
    };
  }

  // 3. Rank remaining attributes by Shannon Entropy
  const rankedAttrs = rankAttributes(candidates, Array.from(answeredSet), unanswerableDimensions);

  // Condition C: Zero remaining variance across candidates
  if (rankedAttrs.length === 0 || rankedAttrs[0].entropy <= 0) {
    const duration = performance.now() - startTime;
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'zero_variance',
      nextQuestion: null,
      rankedAttributes: [],
      executionTimeMs: duration
    };
  }

  // 4. Generate the highest-entropy question
  const topAttribute = rankedAttrs[0];
  const nextQuestion = generateQuestion(topAttribute, questionIndex);

  const duration = performance.now() - startTime;

  return {
    candidates,
    candidateCount,
    previousCount,
    reductionLabel,
    isEarlyStop: false,
    earlyStopReason: null,
    nextQuestion,
    rankedAttributes: rankedAttrs,
    executionTimeMs: duration
  };
}

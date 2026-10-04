/**
 * Google Photos — Better Search MVP
 * Reactive State Machine & Centralized Store (Phase 3)
 * Implements the single-screen state machine defined in architecture.md §3.2
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import allAssetsData from '../data/photoLibrary.json';
import { runClarificationPipeline } from '../engine/index.js';

// Initial state definition conforming to SearchState interface
const initialState = {
  // Session metadata
  sessionId: 'sess_' + Date.now().toString(36),
  query: '',
  phase: 'initial_feed', // 'initial_feed' | 'broad_results' | 'clarifying' | 'shortlist' | 'detail_view'
  previousPhase: 'initial_feed',

  // Candidates & Sizing
  allAssets: allAssetsData,
  candidatePool: allAssetsData,
  previousCount: null,
  reductionLabel: `${allAssetsData.length} photos`,

  // AI Question Carousel
  isProcessing: false,
  currentQuestion: null,
  questionIndex: 1, // 1 to 5 (max 5)
  slideDirection: 'from-left',

  // Accumulated Memory Clues
  appliedFilters: [], // FilterChip[]: { id, dimension, value, label, removable }
  unanswerableDimensions: [], // Dimensions marked "I'm not sure"

  // Detail & Confirmation
  selectedPhoto: null,
  isConfirmed: null,
  confirmationToast: null,

  // Telemetry
  searchStartTime: null,
  questionsAnswered: 0,

  // Phase 7 Edge Case States
  consecutiveNotSure: 0,
  isClusteredView: false,
  recoveryAlert: null
};

// Action Types
export const ActionTypes = {
  SUBMIT_QUERY: 'SUBMIT_QUERY',
  SELECT_ANSWER: 'SELECT_ANSWER',
  TAP_NOT_SURE: 'TAP_NOT_SURE',
  REMOVE_CHIP: 'REMOVE_CHIP',
  OPEN_PHOTO: 'OPEN_PHOTO',
  CLOSE_PHOTO: 'CLOSE_PHOTO',
  CONFIRM_RETRIEVAL: 'CONFIRM_RETRIEVAL',
  STILL_NOT_IT: 'STILL_NOT_IT',
  SET_PROCESSING: 'SET_PROCESSING',
  TRIGGER_BETTER_SEARCH: 'TRIGGER_BETTER_SEARCH',
  APPLY_BACKEND_REFINE: 'APPLY_BACKEND_REFINE',
  DISMISS_RECOVERY_ALERT: 'DISMISS_RECOVERY_ALERT',
  EXIT_CLUSTERED_VIEW: 'EXIT_CLUSTERED_VIEW',
  RESET_SEARCH: 'RESET_SEARCH',
  CLEAR_TOAST: 'CLEAR_TOAST'
};

function searchReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.payload
      };

    case ActionTypes.CLEAR_TOAST:
      return {
        ...state,
        confirmationToast: null
      };

    case ActionTypes.SUBMIT_QUERY: {
      const query = (action.payload || '').trim();
      if (!query) {
        return {
          ...state,
          query: '',
          phase: 'initial_feed',
          candidatePool: state.allAssets,
          previousCount: null,
          reductionLabel: `${state.allAssets.length} photos`,
          appliedFilters: [],
          unanswerableDimensions: [],
          currentQuestion: null,
          questionIndex: 1
        };
      }

      // Add query filter chip
      const queryFilter = {
        id: 'f_query',
        dimension: 'query',
        value: query,
        label: query.charAt(0).toUpperCase() + query.slice(1),
        removable: true
      };

      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query,
        appliedFilters: [],
        questionIndex: 1
      });

      // Asynchronously notify backend to initialize session
      if (typeof fetch !== 'undefined') {
        fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, sessionId: state.sessionId })
        }).catch(err => console.debug('Backend search sync skipped:', err.message));
      }

      // If query isolates <= 3 candidates immediately, jump to shortlist
      if (result.isEarlyStop) {
        return {
          ...state,
          query,
          searchStartTime: Date.now(),
          phase: 'shortlist',
          candidatePool: result.candidates,
          previousCount: state.allAssets.length,
          reductionLabel: `${result.candidateCount} matches`,
          appliedFilters: [queryFilter],
          currentQuestion: null,
          questionIndex: 1,
          consecutiveNotSure: 0,
          isClusteredView: false,
          recoveryAlert: null,
          isProcessing: false
        };
      }

      // For broad results (e.g. 53 matches), activate clarifying mode
      return {
        ...state,
        query,
        searchStartTime: Date.now(),
        phase: 'clarifying',
        candidatePool: result.candidates,
        previousCount: state.allAssets.length,
        reductionLabel: `${result.candidateCount} possible matches`,
        appliedFilters: [queryFilter],
        unanswerableDimensions: [],
        currentQuestion: result.nextQuestion,
        questionIndex: 1,
        slideDirection: 'from-left',
        consecutiveNotSure: 0,
        isClusteredView: false,
        recoveryAlert: null,
        isProcessing: false
      };
    }

    case ActionTypes.APPLY_BACKEND_REFINE: {
      const {
        candidates,
        candidateCount,
        reductionBadge,
        activeFilters,
        nextQuestion,
        isEarlyStop
      } = action.payload;

      const effectiveCandidates = candidates || state.candidatePool;
      const effectiveCount = candidateCount !== undefined ? candidateCount : effectiveCandidates.length;

      // EC-12: Over-filter to 0 matches auto-relaxation
      if (effectiveCount === 0) {
        return {
          ...state,
          isProcessing: false,
          consecutiveNotSure: 0,
          recoveryAlert: {
            message: 'No photos matched that detail. We relaxed it so you can continue finding your photo.'
          },
          confirmationToast: '⚠️ No photos matched that clue. Filter relaxed.'
        };
      }

      const isShortlist = Boolean(isEarlyStop) || effectiveCount <= 3;
      const stepNumber = state.questionIndex + 1;

      return {
        ...state,
        candidatePool: effectiveCandidates,
        previousCount: state.candidatePool.length,
        reductionLabel: reductionBadge || `${effectiveCount} matches`,
        appliedFilters: activeFilters && activeFilters.length > 0
          ? activeFilters
          : state.appliedFilters,
        currentQuestion: nextQuestion,
        questionIndex: stepNumber,
        questionsAnswered: state.questionsAnswered + 1,
        consecutiveNotSure: 0,
        recoveryAlert: null,
        phase: isShortlist ? 'shortlist' : 'clarifying',
        slideDirection: 'from-left',
        isProcessing: false
      };
    }

    case ActionTypes.TRIGGER_BETTER_SEARCH: {
      // Manually trigger clarification question from broad results
      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: state.appliedFilters.filter(f => f.dimension !== 'query'),
        unanswerableDimensions: state.unanswerableDimensions,
        questionIndex: state.questionIndex
      });

      return {
        ...state,
        phase: result.isEarlyStop ? 'shortlist' : 'clarifying',
        currentQuestion: result.nextQuestion,
        consecutiveNotSure: 0,
        isClusteredView: false,
        recoveryAlert: null,
        isProcessing: false
      };
    }

    case ActionTypes.SELECT_ANSWER: {
      const { option, attribute } = action.payload;
      const stepNumber = state.questionIndex + 1;

      // Create new filter chip
      const newFilter = {
        id: `f_${attribute.replace('.', '_')}_${Date.now()}`,
        dimension: attribute,
        value: option,
        label: option,
        removable: true
      };

      const nextFilters = [...state.appliedFilters, newFilter];

      // Run pipeline with updated filters
      const effectiveFilters = nextFilters.filter(f => f.dimension !== 'query');
      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: effectiveFilters,
        answeredDimensions: nextFilters.map(f => f.dimension),
        unanswerableDimensions: state.unanswerableDimensions,
        questionIndex: stepNumber,
        previousCount: state.candidatePool.length
      });

      // EC-12: Over-filter to 0 matches auto-relaxation
      if (result.candidateCount === 0) {
        return {
          ...state,
          isProcessing: false,
          consecutiveNotSure: 0,
          recoveryAlert: {
            conflictingFilter: newFilter,
            message: `No photos found matching "${option}". We relaxed this filter so you can keep searching.`
          },
          confirmationToast: `⚠️ No photos matched "${option}". Filter relaxed.`
        };
      }

      const isShortlist = result.isEarlyStop || result.candidateCount <= 3;

      return {
        ...state,
        candidatePool: result.candidates,
        previousCount: state.candidatePool.length,
        reductionLabel: result.reductionLabel,
        appliedFilters: nextFilters,
        currentQuestion: result.nextQuestion,
        questionIndex: stepNumber,
        questionsAnswered: state.questionsAnswered + 1,
        consecutiveNotSure: 0,
        recoveryAlert: null,
        phase: isShortlist ? 'shortlist' : 'clarifying',
        slideDirection: 'from-left',
        isProcessing: false
      };
    }

    case ActionTypes.TAP_NOT_SURE: {
      const currentAttr = state.currentQuestion?.attribute;
      const nextUnanswerable = currentAttr
        ? [...state.unanswerableDimensions, currentAttr]
        : state.unanswerableDimensions;

      const consecutiveNotSure = (state.consecutiveNotSure || 0) + 1;

      // EC-05: 3+ consecutive "I'm not sure" taps terminates questioning and switches to clustered view
      if (consecutiveNotSure >= 3) {
        return {
          ...state,
          consecutiveNotSure,
          isClusteredView: true,
          phase: 'clustered_browse',
          currentQuestion: null,
          unanswerableDimensions: nextUnanswerable,
          recoveryAlert: null,
          isProcessing: false,
          confirmationToast: "💡 We've organized your photos into topic clusters for easy browsing."
        };
      }

      const stepNumber = state.questionIndex + 1;
      const effectiveFilters = state.appliedFilters.filter(f => f.dimension !== 'query');

      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: effectiveFilters,
        answeredDimensions: state.appliedFilters.map(f => f.dimension),
        unanswerableDimensions: nextUnanswerable,
        questionIndex: stepNumber,
        previousCount: state.candidatePool.length
      });

      const isShortlist = result.isEarlyStop || result.candidateCount <= 3;

      return {
        ...state,
        consecutiveNotSure,
        unanswerableDimensions: nextUnanswerable,
        currentQuestion: result.nextQuestion,
        questionIndex: stepNumber,
        phase: isShortlist ? 'shortlist' : 'clarifying',
        slideDirection: 'from-left',
        recoveryAlert: null,
        isProcessing: false
      };
    }

    case ActionTypes.DISMISS_RECOVERY_ALERT:
      return {
        ...state,
        recoveryAlert: null
      };

    case ActionTypes.EXIT_CLUSTERED_VIEW: {
      const effectiveFilters = state.appliedFilters.filter(f => f.dimension !== 'query');
      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: effectiveFilters,
        unanswerableDimensions: state.unanswerableDimensions,
        questionIndex: Math.min(state.questionIndex, 4),
        previousCount: state.candidatePool.length
      });

      return {
        ...state,
        consecutiveNotSure: 0,
        isClusteredView: false,
        phase: result.isEarlyStop ? 'shortlist' : 'clarifying',
        currentQuestion: result.nextQuestion,
        slideDirection: 'from-left'
      };
    }

    case ActionTypes.REMOVE_CHIP: {
      const chipIdToRemove = action.payload;
      const chipToRemove = state.appliedFilters.find(f => f.id === chipIdToRemove);

      // If user clears the root query chip, reset to initial feed
      if (chipToRemove?.dimension === 'query') {
        return {
          ...state,
          query: '',
          phase: 'initial_feed',
          candidatePool: state.allAssets,
          previousCount: null,
          reductionLabel: `${state.allAssets.length} photos`,
          appliedFilters: [],
          unanswerableDimensions: [],
          currentQuestion: null,
          questionIndex: 1
        };
      }

      const nextFilters = state.appliedFilters.filter(f => f.id !== chipIdToRemove);
      const effectiveFilters = nextFilters.filter(f => f.dimension !== 'query');
      const nextUnanswerable = chipToRemove?.dimension
        ? state.unanswerableDimensions.filter(d => d !== chipToRemove.dimension)
        : state.unanswerableDimensions;

      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: effectiveFilters,
        answeredDimensions: nextFilters.map(f => f.dimension),
        unanswerableDimensions: nextUnanswerable,
        questionIndex: Math.max(1, state.questionIndex - 1),
        previousCount: state.candidatePool.length
      });

      return {
        ...state,
        appliedFilters: nextFilters,
        unanswerableDimensions: nextUnanswerable,
        candidatePool: result.candidates,
        previousCount: state.candidatePool.length,
        reductionLabel: result.reductionLabel,
        currentQuestion: result.nextQuestion,
        questionIndex: Math.max(1, state.questionIndex - 1),
        phase: result.isEarlyStop ? 'shortlist' : 'clarifying',
        slideDirection: 'from-left',
        isProcessing: false
      };
    }

    case ActionTypes.STILL_NOT_IT: {
      // Shortlist recovery action:
      // Relax the most restrictive filter and mark that dimension as unanswerable,
      // then formulate the next best orthogonal question over the expanded candidates (EC-07)
      let nextFilters = [...state.appliedFilters];
      const nonQueryFilters = nextFilters.filter(f => f.dimension !== 'query');
      let nextUnanswerable = [...state.unanswerableDimensions];

      if (nonQueryFilters.length > 0) {
        const lastFilter = nonQueryFilters[nonQueryFilters.length - 1];
        nextFilters = nextFilters.filter(f => f.id !== lastFilter.id);
        if (lastFilter.dimension && !nextUnanswerable.includes(lastFilter.dimension)) {
          nextUnanswerable.push(lastFilter.dimension);
        }
      }

      const effectiveFilters = nextFilters.filter(f => f.dimension !== 'query');
      const result = runClarificationPipeline({
        allAssets: state.allAssets,
        query: state.query,
        appliedFilters: effectiveFilters,
        answeredDimensions: nextFilters.map(f => f.dimension),
        unanswerableDimensions: nextUnanswerable,
        questionIndex: Math.min(state.questionIndex, 4),
        previousCount: state.candidatePool.length
      });

      return {
        ...state,
        appliedFilters: nextFilters,
        unanswerableDimensions: nextUnanswerable,
        candidatePool: result.candidates,
        previousCount: state.candidatePool.length,
        reductionLabel: `${result.candidateCount} matches`,
        currentQuestion: result.nextQuestion,
        phase: result.nextQuestion ? 'clarifying' : 'shortlist',
        slideDirection: 'from-left',
        isProcessing: false
      };
    }

    case ActionTypes.OPEN_PHOTO:
      return {
        ...state,
        selectedPhoto: action.payload,
        previousPhase: state.phase,
        phase: 'detail_view'
      };

    case ActionTypes.CLOSE_PHOTO:
      return {
        ...state,
        selectedPhoto: null,
        phase: state.previousPhase || (state.candidatePool.length <= 3 ? 'shortlist' : 'clarifying')
      };

    case ActionTypes.CONFIRM_RETRIEVAL: {
      const isSuccess = typeof action.payload === 'object' ? Boolean(action.payload.isSuccess) : Boolean(action.payload);
      const targetPhotoId = (typeof action.payload === 'object' && action.payload.targetPhotoId) || state.selectedPhoto?.id || null;
      const durationSeconds = (typeof action.payload === 'object' && action.payload.durationSeconds) ||
        Math.max(1, Math.round((Date.now() - (state.searchStartTime || Date.now())) / 1000));
      const questionsAsked = (typeof action.payload === 'object' && action.payload.questionsAsked !== undefined)
        ? action.payload.questionsAsked
        : (state.questionsAnswered || 0);

      const telemetryRecord = {
        sessionId: state.sessionId,
        targetPhotoId,
        isSuccess,
        durationSeconds,
        questionsAsked,
        timestamp: new Date().toISOString()
      };

      // Store in localStorage for inspection and offline retention
      try {
        const stored = JSON.parse(localStorage.getItem('gp_retrieval_telemetry') || '[]');
        stored.push(telemetryRecord);
        localStorage.setItem('gp_retrieval_telemetry', JSON.stringify(stored));
      } catch (e) {
        // Fallback silently if localStorage is restricted
      }

      // Fire async backend telemetry logging
      if (typeof fetch !== 'undefined') {
        fetch('/api/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(telemetryRecord)
        }).catch(err => console.warn('Could not post telemetry to backend:', err.message));
      }

      return {
        ...state,
        isConfirmed: isSuccess,
        lastTelemetry: telemetryRecord,
        confirmationToast: isSuccess
          ? '🎉 Great! Glad we could help you find it.'
          : "Not the right one? Tap 'Still not it?' to try another clue.",
        selectedPhoto: null,
        phase: state.previousPhase || (state.candidatePool.length <= 3 ? 'shortlist' : 'clarifying')
      };
    }

    case ActionTypes.RESET_SEARCH:
      return {
        ...initialState,
        sessionId: 'sess_' + Date.now().toString(36)
      };

    default:
      return state;
  }
}

// React Context
const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Auto-dismiss confirmation toast after 4 seconds
  useEffect(() => {
    if (state.confirmationToast) {
      const timer = setTimeout(() => {
        dispatch({ type: ActionTypes.CLEAR_TOAST });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.confirmationToast]);

  return (
    <SearchContext.Provider value={{ state, dispatch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchStore() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchStore must be used within a SearchProvider');
  }
  return context;
}

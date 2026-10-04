import React, { useState } from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { SparkleIcon } from './Icons.jsx';

export default function QuestionCarousel() {
  const { state, dispatch } = useSearchStore();
  const { currentQuestion, phase, isProcessing, questionIndex } = state;
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeTextValue, setFreeTextValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Visible only during the 'clarifying' phase when a question is available
  if (phase !== 'clarifying' || !currentQuestion) {
    return null;
  }

  const handleSelectOption = (option) => {
    if (isProcessing || isAnimating) return; // Prevent double-tap during animation (EC-09)

    // Trigger 400ms micro-state shimmer, then update state
    dispatch({ type: ActionTypes.SET_PROCESSING, payload: true });
    setTimeout(() => {
      dispatch({
        type: ActionTypes.SELECT_ANSWER,
        payload: {
          option,
          attribute: currentQuestion.attribute,
          questionId: currentQuestion.questionId
        }
      });
    }, 400);
  };

  const handleNotSure = () => {
    if (isProcessing || isAnimating) return;

    dispatch({ type: ActionTypes.SET_PROCESSING, payload: true });
    setTimeout(() => {
      dispatch({ type: ActionTypes.TAP_NOT_SURE });
    }, 350);
  };

  const handleFreeTextSubmit = async (e) => {
    e.preventDefault();
    const text = freeTextValue.trim();
    if (!text || isProcessing || isAnimating) return;

    // Trigger shimmer micro-state
    dispatch({ type: ActionTypes.SET_PROCESSING, payload: true });
    setFreeTextValue('');
    setShowFreeText(false);

    try {
      // Phase 6 & 7: Call backend API for natural language memory parsing
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionId: currentQuestion.questionId,
          freeTextClue: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          dispatch({
            type: ActionTypes.APPLY_BACKEND_REFINE,
            payload: data
          });
        }, 400);
        return;
      }
    } catch (err) {
      console.warn('[QuestionCarousel] Backend refine unavailable, using local fallback:', err.message);
    }

    // Seamless fallback to local deterministic filter
    setTimeout(() => {
      dispatch({
        type: ActionTypes.SELECT_ANSWER,
        payload: {
          option: text,
          attribute: currentQuestion.attribute,
          questionId: currentQuestion.questionId
        }
      });
    }, 400);
  };

  const step = currentQuestion.step || questionIndex || 1;
  const maxSteps = currentQuestion.maxSteps || 5;
  const isInputLocked = isProcessing || isAnimating;

  return (
    <section
      key={`${currentQuestion.questionId}_${step}`}
      className="question-carousel-container slide-from-left"
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationEnd={() => setIsAnimating(false)}
      style={{
        margin: '0 16px 14px 16px',
        padding: '16px',
        borderRadius: 'var(--gp-radius-lg)',
        backgroundColor: '#ffffff',
        border: '1px solid #e1e7f0',
        boxShadow: 'var(--gp-shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}
      aria-label="Clarification Question Carousel"
    >
      {/* Top Header & Step Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SparkleIcon size={16} color="var(--gp-primary)" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--gp-primary)'
            }}
          >
            Better Search
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gp-text-tertiary)' }}>
            Step {step} of {maxSteps}
          </span>
          <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: s <= step ? 'var(--gp-primary)' : 'var(--gp-border)',
                  transition: 'background-color 250ms ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--gp-text-primary)',
          lineHeight: '1.35',
          marginBottom: '14px'
        }}
      >
        {currentQuestion.prompt}
      </h2>

      {/* Dynamic Option Chips with 44px tap target & EC-09 pointer lock */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '14px',
          pointerEvents: isInputLocked ? 'none' : 'auto'
        }}
      >
        {currentQuestion.options && currentQuestion.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelectOption(option)}
            className="touch-target"
            style={{
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: 'var(--gp-radius-pill)',
              border: '1px solid var(--gp-border)',
              backgroundColor: 'var(--gp-chip-bg)',
              color: 'var(--gp-text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              userSelect: 'none'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--gp-chip-hover)';
              e.currentTarget.style.borderColor = 'var(--gp-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--gp-chip-bg)';
              e.currentTarget.style.borderColor = 'var(--gp-border)';
            }}
          >
            {option}
          </button>
        ))}

        {/* Explicit "I'm not sure" Fallback Chip (44px tap target) */}
        {currentQuestion.allowNotSure !== false && (
          <button
            type="button"
            onClick={handleNotSure}
            className="touch-target"
            style={{
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: 'var(--gp-radius-pill)',
              border: '1px dashed var(--gp-border)',
              backgroundColor: '#fafbfc',
              color: 'var(--gp-text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f1f3f4';
              e.currentTarget.style.color = 'var(--gp-text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#fafbfc';
              e.currentTarget.style.color = 'var(--gp-text-secondary)';
            }}
          >
            I'm not sure
          </button>
        )}
      </div>

      {/* Free-Text Refinement Link & Form */}
      <div style={{ borderTop: '1px solid var(--gp-border-light)', paddingTop: '10px' }}>
        {!showFreeText ? (
          <button
            type="button"
            onClick={() => setShowFreeText(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gp-primary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>+ I remember something else...</span>
          </button>
        ) : (
          <form onSubmit={handleFreeTextSubmit} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input
              type="text"
              value={freeTextValue}
              onChange={(e) => setFreeTextValue(e.target.value)}
              placeholder="e.g. pink slip, clinic, Dr Rao..."
              autoFocus
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--gp-radius-pill)',
                border: '1px solid var(--gp-border)',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: 'var(--gp-surface-subtle)'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--gp-primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--gp-border)'}
            />
            <button
              type="submit"
              disabled={!freeTextValue.trim() || isInputLocked}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--gp-radius-pill)',
                border: 'none',
                backgroundColor: freeTextValue.trim() && !isInputLocked ? 'var(--gp-primary)' : 'var(--gp-border)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: freeTextValue.trim() && !isInputLocked ? 'pointer' : 'default',
                transition: 'background-color 150ms ease'
              }}
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFreeText(false);
                setFreeTextValue('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gp-text-tertiary)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

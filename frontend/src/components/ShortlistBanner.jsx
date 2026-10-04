import React from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { SparkleIcon } from './Icons.jsx';

export default function ShortlistBanner() {
  const { state, dispatch } = useSearchStore();
  const { candidatePool, phase } = state;

  // Conditionally visible when phase is 'shortlist' or candidatePool <= 3 in clarifying mode
  const isShortlistActive = (phase === 'shortlist' || (phase === 'clarifying' && candidatePool.length <= 3)) && state.query;

  if (!isShortlistActive) {
    return null;
  }

  const handleStillNotIt = () => {
    dispatch({ type: ActionTypes.STILL_NOT_IT });
  };

  const count = candidatePool.length;

  return (
    <div
      style={{
        margin: '0 16px 14px 16px',
        padding: '16px',
        borderRadius: 'var(--gp-radius-lg)',
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8fd 100%)',
        border: '1px solid #c2d7fb',
        boxShadow: 'var(--gp-shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      role="region"
      aria-label="Target Shortlist Match Summary"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--gp-gemini-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}
        >
          <SparkleIcon size={16} color="#ffffff" />
        </div>

        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--gp-text-primary)',
              lineHeight: '1.3'
            }}
          >
            I think I found what you're looking for.
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--gp-text-secondary)',
              marginTop: '2px',
              lineHeight: '1.4'
            }}
          >
            {count} {count === 1 ? 'photo matches' : 'photos match'} the details you remembered. Tap any photo to inspect.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
        <button
          type="button"
          onClick={handleStillNotIt}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--gp-radius-pill)',
            border: '1px solid #1a73e8',
            backgroundColor: '#ffffff',
            color: 'var(--gp-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gp-chip-active-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          Still not it?
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { SparkleIcon } from './Icons.jsx';

export default function ResultCountBadge() {
  const { state, dispatch } = useSearchStore();
  const { candidatePool, previousCount, phase, isClusteredView } = state;
  const currentCount = candidatePool ? candidatePool.length : 0;

  // Animated rolling counter state
  const [displayedCount, setDisplayedCount] = useState(currentCount);
  const [isPulsing, setIsPulsing] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (phase === 'initial_feed') {
      setDisplayedCount(currentCount);
      return;
    }

    setIsPulsing(true);
    const pulseTimer = setTimeout(() => setIsPulsing(false), 450);

    const start = displayedCount;
    const end = currentCount;
    if (start === end) {
      return () => clearTimeout(pulseTimer);
    }

    const duration = 350; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (end - start) * ease);
      setDisplayedCount(val);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(pulseTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentCount, phase]);

  if (phase === 'initial_feed') {
    return null;
  }

  const handleTriggerBetterSearch = () => {
    dispatch({ type: ActionTypes.TRIGGER_BETTER_SEARCH });
  };

  const handleExitClustered = () => {
    dispatch({ type: ActionTypes.EXIT_CLUSTERED_VIEW });
  };

  const hasReduction = previousCount !== null && previousCount !== currentCount;

  return (
    <div
      style={{
        padding: '6px 16px 10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--gp-surface-light)',
        borderBottom: '1px solid var(--gp-border-light)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          className={isPulsing ? 'count-badge-pulse' : ''}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '13px',
            fontWeight: 600,
            color: isPulsing ? 'var(--gp-primary)' : 'var(--gp-text-secondary)',
            transition: 'color 300ms ease'
          }}
        >
          {hasReduction ? (
            <>
              <span style={{ color: 'var(--gp-text-tertiary)', textDecoration: 'line-through', fontSize: '12px' }}>
                {previousCount}
              </span>
              <span style={{ color: 'var(--gp-primary)', fontWeight: 700 }}>→</span>
              <span style={{ color: 'var(--gp-primary)', fontWeight: 700 }}>{displayedCount} matches</span>
            </>
          ) : (
            <span>{displayedCount} possible matches</span>
          )}
        </span>

        {isClusteredView && (
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--gp-radius-pill)',
              backgroundColor: '#e8f0fe',
              color: 'var(--gp-primary)',
              fontWeight: 600
            }}
          >
            Topic Clusters
          </span>
        )}
      </div>

      {phase === 'broad_results' && (
        <button
          onClick={handleTriggerBetterSearch}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--gp-radius-pill)',
            border: 'none',
            background: 'var(--gp-gemini-gradient)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--gp-shadow-sm)'
          }}
        >
          <SparkleIcon size={14} color="#ffffff" />
          Better Search
        </button>
      )}

      {isClusteredView && (
        <button
          type="button"
          onClick={handleExitClustered}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--gp-radius-pill)',
            border: '1px solid var(--gp-border)',
            backgroundColor: '#ffffff',
            color: 'var(--gp-text-primary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Resume questions
        </button>
      )}
    </div>
  );
}

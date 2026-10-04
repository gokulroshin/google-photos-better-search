import React from 'react';
import { useSearchStore } from '../store/searchStore.jsx';
import { SparkleIcon } from './Icons.jsx';

export default function ProcessingOverlay() {
  const { state } = useSearchStore();

  if (!state.isProcessing) {
    return null;
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        margin: '0 16px 12px 16px',
        borderRadius: 'var(--gp-radius-md)',
        background: 'var(--gp-gemini-gradient-soft)',
        border: '1px solid rgba(66, 133, 244, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--gp-shadow-sm)'
      }}
      className="processing-shimmer"
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--gp-gemini-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <SparkleIcon size={16} color="#ffffff" />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gp-primary)' }}>
          Looking for patterns across your photos…
        </p>
        <p style={{ fontSize: '11px', color: 'var(--gp-text-secondary)', marginTop: '2px' }}>
          Narrowing candidate memories
        </p>
      </div>
    </div>
  );
}

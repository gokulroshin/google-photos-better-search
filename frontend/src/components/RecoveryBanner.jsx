import React from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';

export default function RecoveryBanner() {
  const { state, dispatch } = useSearchStore();
  const { recoveryAlert } = state;

  if (!recoveryAlert) {
    return null;
  }

  const handleDismiss = () => {
    dispatch({ type: ActionTypes.DISMISS_RECOVERY_ALERT });
  };

  const handleReset = () => {
    dispatch({ type: ActionTypes.RESET_SEARCH });
  };

  return (
    <div
      className="recovery-banner"
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#b06000' }}>
            Detail relaxed to keep searching
          </p>
          <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px', lineHeight: 1.35 }}>
            {recoveryAlert.message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--gp-radius-pill)',
            border: '1px solid #dadce0',
            backgroundColor: '#ffffff',
            color: '#3c4043',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Reset search
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--gp-radius-pill)',
            border: 'none',
            backgroundColor: '#f9ab00',
            color: '#202124',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

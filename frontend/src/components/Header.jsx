import React from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { ArrowBackIcon } from './Icons.jsx';

export default function Header() {
  const { state, dispatch } = useSearchStore();
  const isSearchActive = state.query !== '' || state.phase !== 'initial_feed';

  const handleBack = () => {
    dispatch({ type: ActionTypes.RESET_SEARCH });
  };

  return (
    <header
      style={{
        height: 'var(--gp-header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--gp-border-light)',
        background: 'var(--gp-surface-light)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isSearchActive && (
          <button
            onClick={handleBack}
            aria-label="Back to home feed"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              color: 'var(--gp-text-secondary)',
              transition: 'background-color 150ms ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--gp-chip-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowBackIcon size={20} />
          </button>
        )}

        <img
          src="/google-photos-logo.png"
          alt="Google Photos Logo"
          style={{
            width: '26px',
            height: '26px',
            objectFit: 'contain',
            display: 'block'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gp-text-primary)', letterSpacing: '-0.02em' }}>
            Google <span style={{ fontWeight: 400 }}>Photos</span>
          </span>
          {isSearchActive && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--gp-radius-pill)',
                background: 'var(--gp-chip-active-bg)',
                color: 'var(--gp-primary)',
                letterSpacing: '0.02em'
              }}
            >
              Better Search ✨
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: 'var(--gp-shadow-sm)',
          cursor: 'pointer'
        }}
        title="Account: Pradeep"
        aria-label="User Account Pradeep"
      >
        P
      </div>
    </header>
  );
}

import React from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { SearchIcon } from './Icons.jsx';

export default function BottomNav() {
  const { state, dispatch } = useSearchStore();

  // Hide in full-screen photo detail view
  if (state.phase === 'detail_view') {
    return null;
  }

  const handlePhotosTab = () => {
    dispatch({ type: ActionTypes.RESET_SEARCH });
  };

  return (
    <nav
      style={{
        height: 'var(--gp-nav-height)',
        borderTop: '1px solid var(--gp-border-light)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        fontSize: '11px',
        fontWeight: 500,
        backgroundColor: 'var(--gp-surface-light)',
        position: 'sticky',
        bottom: 0,
        zIndex: 20
      }}
      aria-label="Bottom Navigation"
    >
      <button
        onClick={handlePhotosTab}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: state.phase === 'initial_feed' ? 'var(--gp-primary)' : 'var(--gp-text-tertiary)',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '18px' }}>🖼️</span>
        <span>Photos</span>
      </button>

      <button
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: state.phase !== 'initial_feed' ? 'var(--gp-primary)' : 'var(--gp-text-tertiary)',
          cursor: 'pointer'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon size={18} color={state.phase !== 'initial_feed' ? 'var(--gp-primary)' : 'var(--gp-text-tertiary)'} />
        </span>
        <span style={{ fontWeight: state.phase !== 'initial_feed' ? 600 : 500 }}>Search</span>
      </button>

      <button
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: 'var(--gp-text-tertiary)',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '18px' }}>📁</span>
        <span>Library</span>
      </button>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { SearchIcon, MicIcon, CloseIcon, SparkleIcon } from './Icons.jsx';

export default function SearchBar() {
  const { state, dispatch } = useSearchStore();
  const [inputValue, setInputValue] = useState(state.query || '');

  // Keep input in sync with external state changes (e.g. chip dismissals or reset)
  useEffect(() => {
    setInputValue(state.query || '');
  }, [state.query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      dispatch({ type: ActionTypes.SUBMIT_QUERY, payload: inputValue.trim() });
    }
  };

  const handleClear = () => {
    setInputValue('');
    dispatch({ type: ActionTypes.RESET_SEARCH });
  };

  const handleStarterClick = (starterText) => {
    setInputValue(starterText);
    dispatch({ type: ActionTypes.SUBMIT_QUERY, payload: starterText });
  };

  return (
    <div style={{ padding: '12px 16px', background: 'var(--gp-surface-light)' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--gp-surface-subtle)',
          borderRadius: 'var(--gp-radius-pill)',
          padding: '6px 14px',
          gap: '10px',
          boxShadow: 'var(--gp-shadow-sm)',
          border: '1px solid transparent',
          transition: 'all 200ms ease'
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--gp-primary)'}
        onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
      >
        <span style={{ color: 'var(--gp-text-secondary)', display: 'flex', alignItems: 'center' }}>
          <SearchIcon size={18} />
        </span>

        <input
          id="gp-search-input"
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Try searching for a prescription…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '14px',
            color: 'var(--gp-text-primary)',
            fontFamily: 'var(--gp-font-sans)',
            padding: '4px 0'
          }}
          aria-label="Search photos with Better Search"
        />

        {inputValue ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gp-text-tertiary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseIcon size={16} />
          </button>
        ) : (
          <button
            type="button"
            title="Search with Voice"
            aria-label="Voice search"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gp-primary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MicIcon size={18} />
          </button>
        )}
      </form>

      {/* Quick Demo Starter Chips (Visible on initial feed) */}
      {state.phase === 'initial_feed' && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '10px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}
        >
          <button
            onClick={() => handleStarterClick('prescription')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--gp-radius-pill)',
              border: '1px solid var(--gp-chip-active-border)',
              background: 'var(--gp-chip-active-bg)',
              color: 'var(--gp-primary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <SparkleIcon size={14} color="var(--gp-primary)" />
            prescription
          </button>

          <button
            onClick={() => handleStarterClick('beach')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--gp-radius-pill)',
              border: '1px solid var(--gp-border)',
              background: 'var(--gp-chip-bg)',
              color: 'var(--gp-text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            beach 🏖️
          </button>

          <button
            onClick={() => handleStarterClick('shoes')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--gp-radius-pill)',
              border: '1px solid var(--gp-border)',
              background: 'var(--gp-chip-bg)',
              color: 'var(--gp-text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            shoes screenshot 👟
          </button>
        </div>
      )}
    </div>
  );
}

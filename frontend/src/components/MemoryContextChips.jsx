import React from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import { CloseIcon, SparkleIcon } from './Icons.jsx';

export default function MemoryContextChips() {
  const { state, dispatch } = useSearchStore();
  const { appliedFilters } = state;

  if (!appliedFilters || appliedFilters.length === 0) {
    return null;
  }

  const handleRemove = (chipId) => {
    dispatch({ type: ActionTypes.REMOVE_CHIP, payload: chipId });
  };

  return (
    <div
      style={{
        padding: '4px 16px 10px 16px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        alignItems: 'center',
        background: 'var(--gp-surface-light)'
      }}
      aria-label="Active Memory Filters"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--gp-primary)',
          fontSize: '11px',
          fontWeight: 600,
          marginRight: '2px',
          whiteSpace: 'nowrap'
        }}
      >
        <SparkleIcon size={13} color="var(--gp-primary)" />
        <span>Memory:</span>
      </div>

      {appliedFilters.map((chip) => {
        const isQueryChip = chip.dimension === 'query';

        return (
          <div
            key={chip.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: isQueryChip ? '4px 12px' : '4px 8px 4px 10px',
              borderRadius: 'var(--gp-radius-pill)',
              backgroundColor: isQueryChip ? 'var(--gp-chip-active-bg)' : '#eef2fa',
              color: isQueryChip ? 'var(--gp-primary)' : 'var(--gp-text-primary)',
              border: isQueryChip ? '1px solid var(--gp-chip-active-border)' : '1px solid #d3dff0',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 150ms ease'
            }}
          >
            <span>{chip.label}</span>
            {chip.removable !== false && (
              <button
                type="button"
                onClick={() => handleRemove(chip.id)}
                aria-label={`Remove filter ${chip.label}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: isQueryChip ? 'var(--gp-primary)' : 'var(--gp-text-secondary)',
                  opacity: 0.8
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

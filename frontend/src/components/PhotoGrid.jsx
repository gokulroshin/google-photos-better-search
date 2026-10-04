import React, { useMemo } from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';

export default function PhotoGrid() {
  const { state, dispatch } = useSearchStore();
  const { candidatePool, isClusteredView } = state;

  const handlePhotoClick = (asset) => {
    dispatch({ type: ActionTypes.OPEN_PHOTO, payload: asset });
  };

  // Organize into topic clusters when in clustered browse view (EC-05)
  const clusters = useMemo(() => {
    if (!isClusteredView || !candidatePool || candidatePool.length === 0) {
      return null;
    }

    const map = new Map();
    for (const asset of candidatePool) {
      const groupKey = asset.condition || asset.location?.category || asset.documentSubType || 'Other Photos';
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey).push(asset);
    }

    return Array.from(map.entries()).map(([label, assets]) => ({
      label,
      assets
    }));
  }, [candidatePool, isClusteredView]);

  if (!candidatePool || candidatePool.length === 0) {
    return (
      <div
        style={{
          padding: '48px 16px',
          textAlign: 'center',
          color: 'var(--gp-text-tertiary)'
        }}
      >
        <p style={{ fontSize: '15px', fontWeight: 500 }}>No matching memories found</p>
        <p style={{ fontSize: '13px', marginTop: '6px' }}>Try relaxing some filters or re-searching</p>
      </div>
    );
  }

  // Render a single photo thumbnail card
  const renderPhotoCard = (asset, index) => (
    <div
      key={asset.id}
      onClick={() => handlePhotoClick(asset)}
      className="photo-grid-item"
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        backgroundColor: '#e8eaed',
        overflow: 'hidden',
        cursor: 'pointer',
        animationDelay: `${Math.min(index * 20, 200)}ms`
      }}
      tabIndex={0}
      role="gridcell"
      aria-label={asset.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handlePhotoClick(asset);
        }
      }}
    >
      <img
        src={asset.thumbnailUrl}
        alt={asset.title}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 250ms cubic-bezier(0.2, 0, 0, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        padding: '0 2px',
        overflowY: 'auto'
      }}
    >
      {isClusteredView && clusters ? (
        <div style={{ paddingBottom: '80px' }}>
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💡 Photos grouped by topic to help you browse freely:</span>
          </div>

          {clusters.map((cluster) => (
            <section key={cluster.label} style={{ marginBottom: '8px' }}>
              <div className="cluster-header">
                <span>{cluster.label}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gp-text-tertiary)' }}>
                  {cluster.assets.length} photos
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2px'
                }}
                role="grid"
              >
                {cluster.assets.map((asset, idx) => renderPhotoCard(asset, idx))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div
          id="gp-photo-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            paddingBottom: '80px' // Space for bottom navigation
          }}
          role="grid"
          aria-label="Photos grid"
        >
          {candidatePool.map((asset, index) => renderPhotoCard(asset, index))}
        </div>
      )}
    </div>
  );
}

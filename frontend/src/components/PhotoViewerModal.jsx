import React, { useState, useEffect } from 'react';
import { useSearchStore, ActionTypes } from '../store/searchStore.jsx';
import {
  ArrowBackIcon,
  CastIcon,
  StarIcon,
  MoreVertIcon,
  ShareIcon,
  EditIcon,
  LensIcon,
  DeleteIcon,
  SparkleIcon
} from './Icons.jsx';

export default function PhotoViewerModal() {
  const { state, dispatch } = useSearchStore();
  const { selectedPhoto, phase } = state;
  const [isStarred, setIsStarred] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && phase === 'detail_view') {
        dispatch({ type: ActionTypes.CLOSE_PHOTO });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, dispatch]);

  if (phase !== 'detail_view' || !selectedPhoto) {
    return null;
  }

  const handleClose = () => {
    dispatch({ type: ActionTypes.CLOSE_PHOTO });
  };

  const handleConfirm = (isSuccess) => {
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - (state.searchStartTime || Date.now())) / 1000)
    );

    dispatch({
      type: ActionTypes.CONFIRM_RETRIEVAL,
      payload: {
        isSuccess,
        targetPhotoId: selectedPhoto.id,
        durationSeconds,
        questionsAsked: state.questionsAnswered || 0
      }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--gp-oled-black)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff',
        animation: 'fadeIn 200ms ease'
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo detail view: ${selectedPhoto.title}`}
    >
      {/* Top App Bar */}
      <header
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          zIndex: 10
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Back to grid"
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%'
          }}
        >
          <ArrowBackIcon size={22} color="#ffffff" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsStarred(!isStarred)}
            aria-label="Star favorite"
            style={{
              background: 'none',
              border: 'none',
              color: isStarred ? '#FBBC04' : '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <StarIcon size={22} color={isStarred ? '#FBBC04' : '#ffffff'} filled={isStarred} />
          </button>

          <button
            aria-label="Cast photo"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CastIcon size={22} color="#ffffff" />
          </button>

          <button
            aria-label="More photo details"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MoreVertIcon size={22} color="#ffffff" />
          </button>
        </div>
      </header>

      {/* Main Image Display */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          overflow: 'hidden'
        }}
      >
        <img
          src={selectedPhoto.url}
          alt={selectedPhoto.title}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 'var(--gp-radius-sm)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}
        />
      </div>

      {/* Metadata & Confirmation Footer */}
      <footer
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)',
          padding: '14px 16px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 10
        }}
      >
        {/* Title, Date & Location Metadata */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
              {selectedPhoto.title}
            </h3>
            {selectedPhoto.condition && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--gp-radius-pill)',
                  backgroundColor: 'rgba(66, 133, 244, 0.25)',
                  color: '#8ab4f8'
                }}
              >
                {selectedPhoto.condition}
              </span>
            )}
          </div>

          <p style={{ fontSize: '12px', color: '#bdc1c6', marginTop: '3px' }}>
            {selectedPhoto.approxDateLabel} • {selectedPhoto.location?.placeName}, {selectedPhoto.location?.city}
          </p>

          {selectedPhoto.description && (
            <p style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '4px', lineHeight: '1.4' }}>
              {selectedPhoto.description}
            </p>
          )}

          {selectedPhoto.ocrText && (
            <div style={{ marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowOcr(!showOcr)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8ab4f8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showOcr ? '▲ Hide document text' : '▼ View scanned document text (OCR)'}
              </button>
              {showOcr && (
                <p
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#d1d5db',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    marginTop: '4px'
                  }}
                >
                  "{selectedPhoto.ocrText}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Retrieval Confirmation Banner (North Star Metric Capture) */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--gp-radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxShadow: 'var(--gp-shadow-sm)'
          }}
          role="region"
          aria-label="Retrieval confirmation"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparkleIcon size={16} color="#8ab4f8" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
              Did you find what you were looking for?
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              id="confirm-yes-btn"
              onClick={() => handleConfirm(true)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--gp-radius-pill)',
                border: 'none',
                backgroundColor: '#8ab4f8',
                color: '#202124',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 100ms ease'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Yes
            </button>
            <button
              type="button"
              id="confirm-no-btn"
              onClick={() => handleConfirm(false)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--gp-radius-pill)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              No
            </button>
          </div>
        </div>

        {/* Google Photos Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <ShareIcon size={20} color="#ffffff" />
            <span>Share</span>
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <EditIcon size={20} color="#ffffff" />
            <span>Edit</span>
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <LensIcon size={20} color="#ffffff" />
            <span>Lens</span>
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <DeleteIcon size={20} color="#ffffff" />
            <span>Delete</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

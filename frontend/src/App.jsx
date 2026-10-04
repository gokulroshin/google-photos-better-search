import React from 'react';
import { SearchProvider, useSearchStore } from './store/searchStore.jsx';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import MemoryContextChips from './components/MemoryContextChips.jsx';
import ResultCountBadge from './components/ResultCountBadge.jsx';
import RecoveryBanner from './components/RecoveryBanner.jsx';
import ProcessingOverlay from './components/ProcessingOverlay.jsx';
import QuestionCarousel from './components/QuestionCarousel.jsx';
import ShortlistBanner from './components/ShortlistBanner.jsx';
import PhotoGrid from './components/PhotoGrid.jsx';
import BottomNav from './components/BottomNav.jsx';
import PhotoViewerModal from './components/PhotoViewerModal.jsx';

function BetterSearchApp() {
  const { state } = useSearchStore();

  return (
    <main className="mobile-shell" id="gp-app-shell">
      {/* 1. Google Photos Header */}
      <Header />

      {/* 2. SearchBar with prompt & starter pills */}
      <SearchBar />

      {/* 3. Accumulated Memory Filter Chips */}
      <MemoryContextChips />

      {/* 4. Live Result Count Badge & Better Search Nudge */}
      <ResultCountBadge />

      {/* 4.1. Edge Case 12: Over-Filter Auto-Relaxation Recovery Banner */}
      <RecoveryBanner />

      {/* 5. Processing Shimmer Micro-State (300-700ms) */}
      <ProcessingOverlay />

      {/* 6. Clarification Question Carousel (Slide from Left) */}
      <QuestionCarousel />

      {/* 7. Shortlist Banner (Shown when candidates <= 3) */}
      <ShortlistBanner />

      {/* 8. Responsive 3-Column Photo Grid */}
      <PhotoGrid />

      {/* Confirmation Toast Feedback */}
      {state.confirmationToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#323232',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 'var(--gp-radius-pill)',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: 'var(--gp-shadow-lg)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 200ms ease',
            whiteSpace: 'nowrap'
          }}
          role="status"
        >
          {state.confirmationToast}
        </div>
      )}

      {/* 9. Bottom Navigation Bar */}
      <BottomNav />

      {/* 10. Immersive OLED Dark Photo Viewer Modal */}
      <PhotoViewerModal />
    </main>
  );
}

export default function App() {
  return (
    <SearchProvider>
      <BetterSearchApp />
    </SearchProvider>
  );
}

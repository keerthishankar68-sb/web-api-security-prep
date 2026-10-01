import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuestions } from './hooks/useQuestions';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuestionView } from './components/QuestionView';

export const App: React.FC = () => {
  const { data: questions, isLoading, error } = useQuestions();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewedSlugs, setViewedSlugs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('websec_viewed_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set(['what-is-same-origin-policy-sop-and-how-does-cors-relax-it']);
    } catch {
      return new Set(['what-is-same-origin-policy-sop-and-how-does-cors-relax-it']);
    }
  });

  const handleMarkViewed = (slug: string) => {
    setViewedSlugs((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev).add(slug);
      try {
        localStorage.setItem('websec_viewed_questions', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="state-center-box" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
        <p style={{ color: '#64748b', fontWeight: 600, marginTop: '16px' }}>Loading Web &amp; API Security Questions…</p>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="state-center-box" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 700 }}>
          {error ? (error as Error).message : 'Failed to load questions dataset.'}
        </p>
      </div>
    );
  }

  const defaultSlug = questions[0].slug;

  return (
    <div className="app-container">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="app-body-layout">
        {mobileMenuOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
        )}
        <Sidebar
          questions={questions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          viewedSlugs={viewedSlugs}
        />

        <Routes>
          <Route
            path="/:slug"
            element={
              <QuestionView
                questions={questions}
                onMarkViewed={handleMarkViewed}
              />
            }
          />
          <Route path="/" element={<Navigate to={`/${defaultSlug}`} replace />} />
          <Route path="*" element={<Navigate to={`/${defaultSlug}`} replace />} />
        </Routes>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQuestions } from './hooks/useQuestions';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuestionView } from './components/QuestionView';
import { HomeCurriculumView } from './components/HomeCurriculumView';
import { FlashcardsModal } from './components/FlashcardsModal';
import { CommandPalette } from './components/CommandPalette';
import { exportAnkiDeck, printExecutiveSummary } from './utils/exportUtils';
import type { ViewTab } from './types/question';

export const App: React.FC = () => {
  const { data: questions, isLoading, error } = useQuestions();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('visual');

  // Question Mastery Statuses: 'mastered' | 'review' | 'unseen'
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, 'mastered' | 'review' | 'unseen'>>(() => {
    try {
      const saved = localStorage.getItem('websec_question_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateStatus = useCallback((slug: string, status: 'mastered' | 'review' | 'unseen') => {
    setQuestionStatuses((prev) => {
      const next: Record<string, 'mastered' | 'review' | 'unseen'> = { ...prev, [slug]: status };
      try {
        localStorage.setItem('websec_question_statuses', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleMarkViewed = useCallback((slug: string) => {
    setQuestionStatuses((prev) => {
      if (prev[slug]) return prev;
      const next: Record<string, 'mastered' | 'review' | 'unseen'> = { ...prev, [slug]: 'unseen' };
      try {
        localStorage.setItem('websec_question_statuses', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Global Keyboard listener for Ctrl+K, Cmd+K, /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark', 'dark-mode');
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'dark-mode');
    }
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
  const masteredCount = questions.filter(q => questionStatuses[q.slug] === 'mastered').length;

  return (
    <div className="app-container">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onExportAnki={() => exportAnkiDeck(questions)}
        onPrintCheatSheet={() => printExecutiveSummary()}
        masteredCount={masteredCount}
        totalQuestions={questions.length}
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
          questionStatuses={questionStatuses}
        />

        <Routes>
          <Route
            path="/:slug"
            element={
              <QuestionView
                questions={questions}
                onMarkViewed={handleMarkViewed}
                questionStatuses={questionStatuses}
                onUpdateStatus={handleUpdateStatus}
                onOpenFlashcards={() => setIsFlashcardsOpen(true)}
                onExportAnki={() => exportAnkiDeck(questions)}
                onPrintCheatSheet={() => printExecutiveSummary()}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            }
          />
          <Route
            path="/"
            element={
              <HomeCurriculumView
                questions={questions}
                questionStatuses={questionStatuses}
                onOpenFlashcards={() => setIsFlashcardsOpen(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                onExportAnki={() => exportAnkiDeck(questions)}
                onPrintCheatSheet={() => printExecutiveSummary()}
              />
            }
          />
          <Route path="*" element={<Navigate to={`/${defaultSlug}`} replace />} />
        </Routes>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        questions={questions}
        onSelectQuestion={(slug) => navigate(`/${slug}`)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onExportAnki={() => exportAnkiDeck(questions)}
        onPrintCheatSheet={() => printExecutiveSummary()}
        onSwitchTab={(tab) => setActiveTab(tab)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Spaced Repetition Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        questions={questions}
        questionStatuses={questionStatuses}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuestionData, ViewTab } from '../types/question';
import { VisualFlowView } from './VisualFlowView';
import { SayItView } from './SayItView';
import { NailItView } from './NailItView';
import { ChallengeView } from './ChallengeView';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  Tv,
  Mic,
  BookOpen,
  Zap,
  CheckCircle2,
  Bookmark,
  Circle,
  Layers,
  Printer,
  Download
} from 'lucide-react';

interface QuestionViewProps {
  questions: QuestionData[];
  onMarkViewed: (slug: string) => void;
  questionStatuses: Record<string, 'mastered' | 'review' | 'unseen'>;
  onUpdateStatus: (slug: string, status: 'mastered' | 'review' | 'unseen') => void;
  onOpenFlashcards: () => void;
  onExportAnki: () => void;
  onPrintCheatSheet: () => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  questions,
  onMarkViewed,
  questionStatuses,
  onUpdateStatus,
  onOpenFlashcards,
  onExportAnki,
  onPrintCheatSheet,
  activeTab,
  onTabChange,
}) => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const currentIndex = questions.findIndex((q) => q.slug === slug);
  const activeQuestion = currentIndex !== -1 ? questions[currentIndex] : questions[0];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
    if (activeQuestion) {
      onMarkViewed(activeQuestion.slug);
      document.title = `${activeQuestion.title} | WebSec Prep`;
    }
  }, [activeQuestion?.slug, onMarkViewed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => Math.min(activeQuestion.steps.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === '1') {
        onTabChange('visual');
      } else if (e.key === '2') {
        onTabChange('spoken');
      } else if (e.key === '3') {
        onTabChange('deepdive');
      } else if (e.key === '4') {
        onTabChange('quiz');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, onTabChange]);

  if (!activeQuestion) {
    return <div className="state-center-box">Question not found.</div>;
  }

  const currentStatus = questionStatuses[activeQuestion.slug] || 'unseen';
  const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;

  return (
    <main className="app-main-content">
      {/* Top Banner with Category & Mode Switcher */}
      <div className="question-top-bar">
        <div className="question-meta-group">
          <div className="category-tag">
            <Shield size={14} className="meta-shield-icon" />
            <span>{activeQuestion.category}</span>
          </div>
          <span className="module-badge">
            {`Module ${String(currentIndex + 1).padStart(2, '0')} / ${questions.length}`}
          </span>
          <span className={`tier-pill ${(activeQuestion.tier || 'Core').toLowerCase()}`}>
            {activeQuestion.tier || 'CORE'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="view-tabs-switcher" role="tablist">
          <button
            className={`tab-nav-btn ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => onTabChange('visual')}
            title="Interactive Visual Protocol Flow (Key: 1)"
          >
            <Tv size={15} />
            <span>Visual Flow</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'spoken' ? 'active' : ''}`}
            onClick={() => onTabChange('spoken')}
            title="AI Spoken Rehearsal Studio (Key: 2)"
          >
            <Mic size={15} />
            <span>Spoken Script</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'deepdive' ? 'active' : ''}`}
            onClick={() => onTabChange('deepdive')}
            title="Deep-Dive Architectural Defense (Key: 3)"
          >
            <BookOpen size={15} />
            <span>Deep-Dive</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => onTabChange('quiz')}
            title="Rapid Security Quiz (Key: 4)"
          >
            <Zap size={15} />
            <span>Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Title & Concept Subtitle */}
      <div className="question-header-details">
        <h1 className="question-title-heading">{activeQuestion.title}</h1>
        <p className="question-subtitle-text">{activeQuestion.subtitle}</p>

        {/* Question Mastery Status Bar & Quick Study Tools */}
        <div className="question-status-toolbar">
          <div className="status-selector-group">
            <span className="status-toolbar-label">My Status:</span>
            <button
              type="button"
              className={`question-status-btn mastered ${currentStatus === 'mastered' ? 'active' : ''}`}
              onClick={() => onUpdateStatus(activeQuestion.slug, currentStatus === 'mastered' ? 'unseen' : 'mastered')}
              title="Mark question as Mastered"
            >
              <CheckCircle2 size={14} />
              <span>Mastered</span>
            </button>

            <button
              type="button"
              className={`question-status-btn review ${currentStatus === 'review' ? 'active' : ''}`}
              onClick={() => onUpdateStatus(activeQuestion.slug, currentStatus === 'review' ? 'unseen' : 'review')}
              title="Flag question for Review"
            >
              <Bookmark size={14} />
              <span>Needs Review</span>
            </button>

            <button
              type="button"
              className={`question-status-btn unseen ${currentStatus === 'unseen' ? 'active' : ''}`}
              onClick={() => onUpdateStatus(activeQuestion.slug, 'unseen')}
              title="Reset status to Unseen"
            >
              <Circle size={10} />
              <span>Unseen</span>
            </button>
          </div>

          <div className="status-quick-actions">
            <button
              type="button"
              className="quick-action-btn"
              onClick={onOpenFlashcards}
              title="Open flashcard for this question"
            >
              <Layers size={13} />
              <span>Flashcard</span>
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={onExportAnki}
              title="Download Anki deck"
            >
              <Download size={13} />
              <span>Anki Deck</span>
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={onPrintCheatSheet}
              title="Print 1-page summary cheat sheet"
            >
              <Printer size={13} />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Tab Display */}
      <div className="view-stage-wrapper">
        {activeTab === 'visual' && (
          <VisualFlowView
            nodes={activeQuestion.nodes}
            steps={activeQuestion.steps}
            interviewTakeaway={activeQuestion.interviewTakeaway || activeQuestion.nailIt.interviewTakeaway}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
          />
        )}

        {activeTab === 'spoken' && <SayItView question={activeQuestion} />}

        {activeTab === 'deepdive' && <NailItView question={activeQuestion} />}

        {activeTab === 'quiz' && <ChallengeView question={activeQuestion} />}
      </div>

      {/* Modern Navigation Deck */}
      <div className="pagination-nav-deck">
        <button
          className="nav-deck-btn prev"
          disabled={!prevQuestion}
          onClick={() => prevQuestion && navigate(`/${prevQuestion.slug}`)}
          style={{ opacity: prevQuestion ? 1 : 0.4, cursor: prevQuestion ? 'pointer' : 'not-allowed' }}
        >
          <ChevronLeft size={18} />
          <div className="deck-text-group" style={{ textAlign: 'left' }}>
            <div className="deck-direction-tag">Previous Module</div>
            <div className="deck-target-title">{prevQuestion ? prevQuestion.title : 'Beginning of curricula'}</div>
          </div>
        </button>

        <button
          className="nav-deck-btn next"
          disabled={!nextQuestion}
          onClick={() => nextQuestion && navigate(`/${nextQuestion.slug}`)}
          style={{ opacity: nextQuestion ? 1 : 0.4, cursor: nextQuestion ? 'pointer' : 'not-allowed', justifyContent: 'flex-end', textAlign: 'right' }}
        >
          <div className="deck-text-group">
            <div className="deck-direction-tag">Next Module</div>
            <div className="deck-target-title">{nextQuestion ? nextQuestion.title : 'End of curricula'}</div>
          </div>
          <ChevronRight size={18} />
        </button>
      </div>
    </main>
  );
};

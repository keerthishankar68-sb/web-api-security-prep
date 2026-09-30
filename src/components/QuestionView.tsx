import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuestionData, ViewTab } from '../types/question';
import { VisualFlowView } from './VisualFlowView';
import { SayItView } from './SayItView';
import { NailItView } from './NailItView';
import { ChallengeView } from './ChallengeView';
import { Shield, ChevronRight, ChevronLeft, Tv, Mic, BookOpen, Zap } from 'lucide-react';

interface QuestionViewProps {
  questions: QuestionData[];
  onMarkViewed: (slug: string) => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  questions,
  onMarkViewed,
}) => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const currentIndex = questions.findIndex((q) => q.slug === slug);
  const activeQuestion = currentIndex !== -1 ? questions[currentIndex] : questions[0];

  const [activeTab, setActiveTab] = useState<ViewTab>('visual');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveTab('visual');
    if (activeQuestion) {
      onMarkViewed(activeQuestion.slug);
      document.title = `${activeQuestion.title} | SecMastery Protocol Lab`;
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
        setActiveTab('visual');
      } else if (e.key === '2') {
        setActiveTab('spoken');
      } else if (e.key === '3') {
        setActiveTab('deepdive');
      } else if (e.key === '4') {
        setActiveTab('quiz');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion]);

  if (!activeQuestion) {
    return <div className="state-center-box">Question not found.</div>;
  }

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
            onClick={() => setActiveTab('visual')}
          >
            <Tv size={15} />
            <span>Visual Flow</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'spoken' ? 'active' : ''}`}
            onClick={() => setActiveTab('spoken')}
          >
            <Mic size={15} />
            <span>Spoken Script</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'deepdive' ? 'active' : ''}`}
            onClick={() => setActiveTab('deepdive')}
          >
            <BookOpen size={15} />
            <span>Deep-Dive</span>
          </button>

          <button
            className={`tab-nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
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

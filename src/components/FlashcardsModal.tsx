import React, { useState, useEffect, useCallback } from 'react';
import type { QuestionData } from '../types/question';
import {
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Layers,
  Shuffle,
  Volume2,
  Sparkles,
  Target
} from 'lucide-react';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionData[];
  questionStatuses: Record<string, 'mastered' | 'review' | 'unseen'>;
  onUpdateStatus: (slug: string, status: 'mastered' | 'review' | 'unseen') => void;
  initialIndex?: number;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  questions,
  questionStatuses,
  onUpdateStatus,
  initialIndex = 0,
}) => {
  const [deck, setDeck] = useState<QuestionData[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'review'>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync deck with filter
  useEffect(() => {
    if (filterMode === 'review') {
      const reviewQuestions = questions.filter(q => questionStatuses[q.slug] === 'review');
      setDeck(reviewQuestions.length > 0 ? reviewQuestions : questions);
    } else {
      setDeck(questions);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode, questions, questionStatuses]);

  const currentQ = deck[currentIndex] || deck[0];
  const currentStatus = currentQ ? (questionStatuses[currentQ.slug] || 'unseen') : 'unseen';

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const flipCard = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const shuffleDeck = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  // Keyboard navigation inside flashcard modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'ArrowRight') nextCard();
      else if (e.key === 'ArrowLeft') prevCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flipCard, nextCard, prevCard, onClose]);

  // Audio speech for flashcard takeaway
  const speakTakeaway = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window) || !currentQ) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const text = currentQ.interviewTakeaway || currentQ.nailIt.interviewTakeaway;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.onend = () => setIsPlayingAudio(false);
      u.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
      setIsPlayingAudio(true);
    }
  };

  if (!isOpen || !currentQ) return null;

  return (
    <div className="flashcards-modal-overlay" onClick={onClose}>
      <div className="flashcards-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flashcards-modal-header">
          <div className="flashcards-title-wrap">
            <Layers size={18} className="deck-icon" />
            <div>
              <h3>Interview Flashcards &amp; Spaced Repetition</h3>
              <span className="deck-progress-subtitle">
                Card {currentIndex + 1} of {deck.length} ({Math.round(((currentIndex + 1) / deck.length) * 100)}%)
              </span>
            </div>
          </div>

          <div className="flashcards-top-actions">
            <button
              type="button"
              className={`deck-filter-pill ${filterMode === 'review' ? 'active' : ''}`}
              onClick={() => setFilterMode(filterMode === 'all' ? 'review' : 'all')}
              title="Show only questions marked as Needs Review"
            >
              <Bookmark size={13} />
              <span>Review Queue</span>
            </button>

            <button
              type="button"
              className="deck-action-icon-btn"
              onClick={shuffleDeck}
              title="Shuffle cards"
            >
              <Shuffle size={16} />
            </button>

            <button
              type="button"
              className="flashcards-close-btn"
              onClick={onClose}
              aria-label="Close flashcards"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="deck-progress-track">
          <div
            className="deck-progress-bar"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>

        {/* 3D Flip Card Container */}
        <div className="flashcard-3d-scene" onClick={flipCard}>
          <div className={`flashcard-flipper ${isFlipped ? 'flipped' : ''}`}>
            {/* FRONT OF CARD */}
            <div className="flashcard-face flashcard-front">
              <div className="card-top-tags">
                <span className="card-category-badge">{currentQ.category}</span>
                <span className={`card-tier-pill ${(currentQ.tier || 'Core').toLowerCase()}`}>
                  {currentQ.tier || 'Core'}
                </span>
                <span className="card-flip-hint">
                  <RotateCw size={12} />
                  <span>Click or Space to Flip</span>
                </span>
              </div>

              <div className="card-front-center">
                <span className="card-number-label">Question #{currentQ.id}</span>
                <h2 className="card-question-title">{currentQ.title}</h2>
                <p className="card-question-subtitle">{currentQ.subtitle}</p>
              </div>

              <div className="card-front-footer">
                <span className="hint-text">💡 Recall the interview formula &amp; key protocol headers before flipping</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="flashcard-face flashcard-back">
              <div className="card-back-header">
                <div className="back-title-group">
                  <Target size={16} className="target-icon" />
                  <h4>Interview Takeaway Formula</h4>
                </div>
                <button
                  type="button"
                  className={`card-voice-btn ${isPlayingAudio ? 'active' : ''}`}
                  onClick={speakTakeaway}
                  title="Listen to takeaway"
                >
                  <Volume2 size={14} />
                  <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                </button>
              </div>

              <blockquote className="card-takeaway-quote">
                "{currentQ.interviewTakeaway || currentQ.nailIt.interviewTakeaway}"
              </blockquote>

              <div className="card-vocabulary-box">
                <span className="vocab-label">Key Vocabulary to Deliver:</span>
                <div className="card-vocab-tags">
                  {currentQ.sayIt.keyPhrases.map((phrase, i) => (
                    <span key={i} className="card-vocab-pill">
                      <Sparkles size={11} /> {phrase}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-back-footer">
                <span className="card-flip-back-hint">
                  <RotateCw size={12} />
                  <span>Click to Flip Back to Question</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Mastery Toggles */}
        <div className="flashcards-bottom-deck">
          <div className="status-toggle-buttons">
            <button
              type="button"
              className={`btn-status-toggle review ${currentStatus === 'review' ? 'active' : ''}`}
              onClick={() => {
                onUpdateStatus(currentQ.slug, currentStatus === 'review' ? 'unseen' : 'review');
                setTimeout(nextCard, 200);
              }}
            >
              <Bookmark size={15} />
              <span>Needs Review</span>
            </button>

            <button
              type="button"
              className={`btn-status-toggle mastered ${currentStatus === 'mastered' ? 'active' : ''}`}
              onClick={() => {
                onUpdateStatus(currentQ.slug, currentStatus === 'mastered' ? 'unseen' : 'mastered');
                setTimeout(nextCard, 200);
              }}
            >
              <CheckCircle2 size={15} />
              <span>Mastered</span>
            </button>
          </div>

          <div className="navigation-arrows-group">
            <button
              type="button"
              className="btn-card-nav"
              onClick={prevCard}
              title="Previous card (ArrowLeft)"
            >
              <ChevronLeft size={18} />
              <span>Prev</span>
            </button>

            <button
              type="button"
              className="btn-card-nav flip-btn"
              onClick={flipCard}
              title="Flip card (Space)"
            >
              <RotateCw size={15} />
              <span>{isFlipped ? 'Show Front' : 'Show Answer'}</span>
            </button>

            <button
              type="button"
              className="btn-card-nav primary"
              onClick={nextCard}
              title="Next card (ArrowRight)"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

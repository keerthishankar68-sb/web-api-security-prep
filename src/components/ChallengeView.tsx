import React, { useState } from 'react';
import { CheckCircle2, XCircle, Zap, RefreshCw, Trophy } from 'lucide-react';
import type { QuestionData } from '../types/question';

interface ChallengeViewProps {
  question: QuestionData;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ question }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const defaultChallenge = question.quiz || {
    question: `Which core security mechanism is the primary defense against vulnerabilities in: "${question.title}"?`,
    options: [
      `Strict contextual output encoding & CSP with nonces`,
      `Parameterized queries & pre-compiled AST separation`,
      `Secure, HttpOnly, and SameSite=Lax cookie configuration`,
      `Tenant-scoped queries (WHERE id = :id AND org_id = :session_org)`
    ],
    correctIndex: question.id % 4,
    explanation: question.nailIt.interviewTakeaway
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  const isCorrect = selectedOption === defaultChallenge.correctIndex;

  return (
    <div className="challenge-studio-card">
      <div className="challenge-hero-banner">
        <div className="challenge-icon-box">
          <Zap size={22} />
        </div>
        <div className="challenge-text-block">
          <span className="challenge-tag">Knowledge Benchmark</span>
          <h2 className="challenge-question-title">{defaultChallenge.question}</h2>
        </div>
      </div>

      <div className="challenge-options-list">
        {defaultChallenge.options.map((opt: string, idx: number) => {
          let stateClass = '';
          if (submitted) {
            if (idx === defaultChallenge.correctIndex) stateClass = 'is-correct';
            else if (idx === selectedOption) stateClass = 'is-wrong';
          } else if (selectedOption === idx) {
            stateClass = 'is-selected';
          }

          return (
            <button
              key={idx}
              className={`challenge-option-btn ${stateClass}`}
              onClick={() => handleSelect(idx)}
              disabled={submitted}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{opt}</span>
              {submitted && idx === defaultChallenge.correctIndex && (
                <CheckCircle2 size={18} className="icon-feedback correct" />
              )}
              {submitted && idx === selectedOption && !isCorrect && (
                <XCircle size={18} className="icon-feedback wrong" />
              )}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <div className="challenge-action-row">
          <button
            className="submit-challenge-btn"
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className={`challenge-feedback-card ${isCorrect ? 'pass' : 'fail'}`}>
          <div className="feedback-header">
            {isCorrect ? <Trophy size={20} /> : <XCircle size={20} />}
            <h3>{isCorrect ? 'Outstanding! Concept Mastered.' : 'Good attempt! Review the architectural breakdown.'}</h3>
            <button className="retry-btn" onClick={handleReset}>
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
          <p className="feedback-explanation">{defaultChallenge.explanation}</p>
        </div>
      )}
    </div>
  );
};

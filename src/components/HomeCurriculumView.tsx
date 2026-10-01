import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { QuestionData } from '../types/question';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Play,
  ArrowRight,
  Layers,
  Search,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface HomeCurriculumViewProps {
  questions: QuestionData[];
  questionStatuses: Record<string, 'mastered' | 'review' | 'unseen'>;
  onOpenFlashcards: () => void;
  onOpenCommandPalette: () => void;
  onExportAnki: () => void;
  onPrintCheatSheet: () => void;
}

interface LevelConfig {
  id: string;
  levelNumber: number;
  title: string;
  badge: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  colorTheme: 'emerald' | 'blue' | 'purple';
  targetAudience: string;
  description: string;
  icon: React.ReactNode;
  questions: QuestionData[];
}

export const HomeCurriculumView: React.FC<HomeCurriculumViewProps> = ({
  questions,
  questionStatuses,
  onOpenFlashcards,
  onOpenCommandPalette,
  onExportAnki,
  onPrintCheatSheet,
}) => {
  const navigate = useNavigate();
  // Group questions into 3 progressive difficulty levels
  const level1Questions = questions.filter(q => q.tier === 'Core' || (!q.tier && q.id <= 7));
  const level2Questions = questions.filter(q => q.tier === 'Intermediate' || (!q.tier && q.id > 7 && q.id <= 14));
  const level3Questions = questions.filter(q => q.tier === 'Advanced' || (!q.tier && q.id > 14));

  const levels: LevelConfig[] = [
    {
      id: 'level-1-basic',
      levelNumber: 1,
      title: 'Level 1: Basic / Core Fundamentals',
      badge: 'Junior to Mid-Level',
      difficulty: 'Basic',
      colorTheme: 'emerald',
      targetAudience: 'Software Engineers, Frontend/Fullstack Developers & Security Analysts',
      description: 'Foundational web protocol security rules: browser origin sandboxes, CORS preflight negotiations, cookie isolation attributes, and fundamental injection defenses.',
      icon: <ShieldCheck size={24} className="level-icon emerald" />,
      questions: level1Questions,
    },
    {
      id: 'level-2-intermediate',
      levelNumber: 2,
      title: 'Level 2: Intermediate Defenses',
      badge: 'Mid-Level to Senior',
      difficulty: 'Intermediate',
      colorTheme: 'blue',
      targetAudience: 'Senior Engineers, Backend Architects & Security Engineers',
      description: 'Token lifecycle security, cryptographic signature verification, OAuth 2.0 PKCE authentication flows, SSRF cloud perimeter defense, and anti-CSRF token synchronization.',
      icon: <Lock size={24} className="level-icon blue" />,
      questions: level2Questions,
    },
    {
      id: 'level-3-advanced',
      levelNumber: 3,
      title: 'Level 3: Advanced Architectures',
      badge: 'Staff & Principal Architect',
      difficulty: 'Advanced',
      colorTheme: 'purple',
      targetAudience: 'Staff Engineers, Principal Architects & Head of Security',
      description: 'Zero-trust microservice communication with Mutual TLS (mTLS), API Gateway phantom token patterns, distributed rate limiting, and GraphQL query depth DOS defense.',
      icon: <Cpu size={24} className="level-icon purple" />,
      questions: level3Questions,
    }
  ];

  const masteredCount = questions.filter(q => questionStatuses[q.slug] === 'mastered').length;
  const reviewCount = questions.filter(q => questionStatuses[q.slug] === 'review').length;
  const readinessPercent = Math.round((masteredCount / Math.max(1, questions.length)) * 100);

  const firstQuestion = questions[0];

  return (
    <div className="curriculum-home-wrapper">
      {/* Hero Welcome Banner */}
      <section className="curriculum-hero-banner">
        <div className="hero-badge-pill">
          <Sparkles size={14} className="sparkle-gold" />
          <span>Complete 50-Question Security Curriculum</span>
        </div>

        <h1 className="hero-main-heading">
          Web & API Security Interview Masterclass
        </h1>

        <p className="hero-lead-text">
          Interactive protocol sequence diagrams, spoken rehearsal scripts, telemetry packet previews,
          and deep-dive explanations designed for software engineers and security architects.
        </p>

        {/* Primary Action Row */}
        <div className="hero-action-deck">
          {firstQuestion && (
            <button
              type="button"
              className="hero-start-primary-btn"
              onClick={() => navigate(`/${firstQuestion.slug}`)}
            >
              <Play size={18} fill="currentColor" />
              <span>Start with Question 1</span>
              <ArrowRight size={18} className="arrow-pulse" />
            </button>
          )}

          <div className="hero-secondary-tools">
            <button
              type="button"
              className="hero-tool-btn"
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={16} className="tool-btn-icon blue" />
              <span>Search (Ctrl+K)</span>
            </button>
            <button
              type="button"
              className="hero-tool-btn"
              onClick={onOpenFlashcards}
              title="Practice Spaced Repetition Flashcards"
            >
              <Layers size={16} className="tool-btn-icon purple" />
              <span>Flashcards</span>
            </button>
            <button
              type="button"
              className="hero-tool-btn"
              onClick={onExportAnki}
              title="Download full Anki Flashcard deck"
            >
              <Download size={16} className="tool-btn-icon green" />
              <span>Anki Deck (.csv)</span>
            </button>
            <button
              type="button"
              className="hero-tool-btn"
              onClick={onPrintCheatSheet}
              title="Print 1-page executive cheat sheet"
            >
              <Printer size={16} className="tool-btn-icon amber" />
              <span>Print Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* Readiness Overview Strip */}
        <div className="hero-stats-strip">
          <div className="hero-stat-card">
            <span className="stat-label">Total Curricula</span>
            <span className="stat-value">{questions.length} Modules</span>
            <span className="stat-sub">3 Progressive Levels</span>
          </div>

          <div className="hero-stat-card">
            <span className="stat-label">Interview Readiness</span>
            <span className="stat-value highlight-green">{readinessPercent}%</span>
            <span className="stat-sub">{masteredCount} of {questions.length} Mastered</span>
          </div>

          <div className="hero-stat-card">
            <span className="stat-label">In Review Queue</span>
            <span className="stat-value highlight-amber">{reviewCount}</span>
            <span className="stat-sub">Flagged for Rehearsal</span>
          </div>
        </div>
      </section>

      {/* 3-Column Difficulty Panel Layout */}
      <section className="curriculum-levels-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Explore by Difficulty Level</h2>
            <p className="section-subtitle">
              Choose your starting tier. Each level features interactive visual diagrams and benchmark interview spoken scripts.
            </p>
          </div>
        </div>

        <div className="difficulty-three-col">
          {levels.map((lvl) => {
            const lvlMastered = lvl.questions.filter(q => questionStatuses[q.slug] === "mastered").length;
            const firstLvlQ = lvl.questions[0];
            const diffLabel = lvl.difficulty === "Basic" ? "Easy" : lvl.difficulty === "Intermediate" ? "Medium" : "Hard";

            return (
              <div key={lvl.id} className={`diff-col-panel ${lvl.colorTheme}`}>
                <div className="diff-col-header">
                  <div className="diff-col-title-row">
                    <span className={`diff-col-label ${lvl.colorTheme}`}>{diffLabel}</span>
                    <span className="diff-col-count">{lvlMastered} / {lvl.questions.length}</span>
                  </div>
                  <p className="diff-col-desc">{lvl.description}</p>
                  {firstLvlQ && (
                    <button
                      type="button"
                      className={`diff-start-btn ${lvl.colorTheme}`}
                      onClick={() => navigate(`/${firstLvlQ.slug}`)}
                    >
                      Start {diffLabel} <ArrowRight size={13} />
                    </button>
                  )}
                </div>

                <div className="diff-col-list">
                  {lvl.questions.map((q, idx) => {
                    const status = questionStatuses[q.slug] || "unseen";
                    return (
                      <Link
                        key={q.id}
                        to={`/${q.slug}`}
                        className={`diff-q-row ${status}`}
                      >
                        <span className="diff-q-num">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="diff-q-title">{q.title}</span>
                        {status === "mastered" && <CheckCircle2 size={13} className="diff-q-icon mastered" />}
                        {status === "review" && <Bookmark size={13} className="diff-q-icon review" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

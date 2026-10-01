import React, { useState } from 'react';
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
  LayoutGrid,
  SlidersHorizontal,
  Compass,
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
  name: string;
  title: string;
  badge: string;
  shortSubtitle: string;
  topics: string[];
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
  const [activeLevelId, setActiveLevelId] = useState<string>('level-1-basic');
  const [viewMode, setViewMode] = useState<'command-deck' | 'three-col'>('command-deck');

  // Group questions into 3 progressive difficulty levels
  const level1Questions = questions.filter(q => q.tier === 'Core' || (!q.tier && q.id <= 7));
  const level2Questions = questions.filter(q => q.tier === 'Intermediate' || (!q.tier && q.id > 7 && q.id <= 14));
  const level3Questions = questions.filter(q => q.tier === 'Advanced' || (!q.tier && q.id > 14));

  const levels: LevelConfig[] = [
    {
      id: 'level-1-basic',
      levelNumber: 1,
      name: 'Basic',
      title: 'Level 1: Basic — Core Protocol Foundations',
      badge: 'Core Fundamentals • 7 Modules',
      shortSubtitle: 'Browser SOP, CORS negotiations, cookie isolation & injection defense',
      topics: ['Browser SOP Sandbox', 'CORS Preflight (OPTIONS)', 'HttpOnly & SameSite Cookies', 'SQLi Prepared Statements', 'Stored & Reflected XSS', 'Content Security Policy (CSP)', 'Argon2id & bcrypt Hashing'],
      colorTheme: 'emerald',
      targetAudience: 'Software Engineers, Frontend/Fullstack Developers & Security Analysts',
      description: 'Foundational web protocol security rules: browser origin sandboxes, CORS preflight negotiations, cookie isolation attributes, and fundamental injection defenses.',
      icon: <ShieldCheck size={22} className="level-icon emerald" />,
      questions: level1Questions,
    },
    {
      id: 'level-2-intermediate',
      levelNumber: 2,
      name: 'Intermediate',
      title: 'Level 2: Intermediate — Identity & Defense Systems',
      badge: 'Defense Engineering • 7 Modules',
      shortSubtitle: 'Cryptographic tokens, OAuth 2.0 PKCE, SSRF perimeter & anti-CSRF',
      topics: ['JWT Verification & Claims', 'OAuth 2.0 PKCE Flow', 'SSRF Cloud Perimeter Defense', 'Anti-CSRF Synchronizer Tokens', 'OpenID Connect ID Tokens', 'Token Bucket Rate Limiting', 'API Key & Secret Vaulting'],
      colorTheme: 'blue',
      targetAudience: 'Senior Engineers, Backend Architects & Security Engineers',
      description: 'Token lifecycle security, cryptographic signature verification, OAuth 2.0 PKCE authentication flows, SSRF cloud perimeter defense, and anti-CSRF token synchronization.',
      icon: <Lock size={22} className="level-icon blue" />,
      questions: level2Questions,
    },
    {
      id: 'level-3-advanced',
      levelNumber: 3,
      name: 'Advanced',
      title: 'Level 3: Advanced — Zero-Trust & Distributed Systems',
      badge: 'Architectures & Systems • 7 Modules',
      shortSubtitle: 'Mutual TLS (mTLS), Phantom tokens, distributed rate limits & GraphQL DoS',
      topics: ['Mutual TLS (mTLS) Zero-Trust', 'API Gateway Phantom Tokens', 'Distributed Rate Limiting (Redis)', 'GraphQL Query Depth Defense', 'HMAC Webhook Signatures', 'Microservice Auth Delegation', 'KMS & Hardware Security'],
      colorTheme: 'purple',
      targetAudience: 'Staff Engineers, Principal Architects & Head of Security',
      description: 'Zero-trust microservice communication with Mutual TLS (mTLS), API Gateway phantom token patterns, distributed rate limiting, and GraphQL query depth DOS defense.',
      icon: <Cpu size={22} className="level-icon purple" />,
      questions: level3Questions,
    }
  ];

  const masteredCount = questions.filter(q => questionStatuses[q.slug] === 'mastered').length;
  const reviewCount = questions.filter(q => questionStatuses[q.slug] === 'review').length;
  const readinessPercent = Math.round((masteredCount / Math.max(1, questions.length)) * 100);

  const firstQuestion = questions[0];
  const activeLevel = levels.find(l => l.id === activeLevelId) || levels[0];
  const activeLevelMastered = activeLevel.questions.filter(q => questionStatuses[q.slug] === 'mastered').length;
  const activeLevelPercent = Math.round((activeLevelMastered / Math.max(1, activeLevel.questions.length)) * 100);
  const firstActiveQ = activeLevel.questions[0];

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

      {/* Unique Progression Stage */}
      <section className="curriculum-levels-section">
        <div className="section-header-row">
          <div>
            <div className="section-kicker">Interactive Architecture Matrix</div>
            <h2 className="section-title">Explore by Progression Level</h2>
            <p className="section-subtitle">
              Progressive mastery from core browser protocols to distributed zero-trust security architectures.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle-group">
            <button
              type="button"
              className={`view-mode-toggle-btn ${viewMode === 'command-deck' ? 'active' : ''}`}
              onClick={() => setViewMode('command-deck')}
              title="Interactive Level Command Deck"
            >
              <SlidersHorizontal size={14} />
              <span>Command Deck</span>
            </button>
            <button
              type="button"
              className={`view-mode-toggle-btn ${viewMode === 'three-col' ? 'active' : ''}`}
              onClick={() => setViewMode('three-col')}
              title="Side-by-Side 3 Column Grid"
            >
              <LayoutGrid size={14} />
              <span>3-Column Grid</span>
            </button>
          </div>
        </div>

        {viewMode === 'command-deck' ? (
          <div className="unique-command-deck">
            {/* Interactive Level Stepper Rail */}
            <div className="level-stepper-rail">
              {levels.map((lvl) => {
                const isActive = lvl.id === activeLevelId;
                const lvlMastered = lvl.questions.filter(q => questionStatuses[q.slug] === 'mastered').length;

                return (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`level-stepper-card ${lvl.colorTheme} ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveLevelId(lvl.id)}
                  >
                    <div className="stepper-card-top">
                      <div className="stepper-badge-pill">
                        <span className="stepper-level-num">Level {lvl.levelNumber}</span>
                        <span className="stepper-level-name">{lvl.name}</span>
                      </div>
                      <span className="stepper-mastery-tag">
                        {lvlMastered}/{lvl.questions.length} Mastered
                      </span>
                    </div>

                    <div className="stepper-card-mid">
                      <div className="stepper-icon-wrap">{lvl.icon}</div>
                      <div className="stepper-title-box">
                        <h4 className="stepper-main-title">Level {lvl.levelNumber}: {lvl.name}</h4>
                        <p className="stepper-sub-desc">{lvl.shortSubtitle}</p>
                      </div>
                    </div>

                    <div className="stepper-card-bottom">
                      <div className="stepper-progress-bar">
                        <div
                          className="stepper-progress-fill"
                          style={{ width: `${Math.round((lvlMastered / lvl.questions.length) * 100)}%` }}
                        />
                      </div>
                      <span className="stepper-click-hint">
                        {isActive ? '● Currently Active' : 'Click to Focus →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Level Showcase Stage */}
            <div className={`active-level-stage ${activeLevel.colorTheme}`}>
              <div className="stage-hero-banner">
                <div className="stage-hero-info">
                  <div className="stage-tags-row">
                    <span className={`stage-level-pill ${activeLevel.colorTheme}`}>
                      Level {activeLevel.levelNumber}: {activeLevel.name}
                    </span>
                    <span className="stage-audience-tag">
                      <Compass size={13} />
                      {activeLevel.targetAudience}
                    </span>
                  </div>

                  <h3 className="stage-headline">{activeLevel.title}</h3>
                  <p className="stage-description">{activeLevel.description}</p>

                  <div className="stage-domain-chips">
                    <span className="stage-chips-label">Key Protocol Domains:</span>
                    <div className="chips-flex-wrap">
                      {activeLevel.topics.map((t) => (
                        <span key={t} className="stage-chip-item">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="stage-hero-cta">
                  <div className="stage-metric-box">
                    <div className="stage-metric-val">{activeLevelPercent}%</div>
                    <div className="stage-metric-title">Level Mastery Score</div>
                    <div className="stage-meter-track">
                      <div
                        className={`stage-meter-fill ${activeLevel.colorTheme}`}
                        style={{ width: `${activeLevelPercent}%` }}
                      />
                    </div>
                    <div className="stage-metric-sub">
                      {activeLevelMastered} of {activeLevel.questions.length} Modules Mastered
                    </div>
                  </div>

                  {firstActiveQ && (
                    <button
                      type="button"
                      className={`stage-launch-btn ${activeLevel.colorTheme}`}
                      onClick={() => navigate(`/${firstActiveQ.slug}`)}
                    >
                      <Play size={16} fill="currentColor" />
                      <span>Start Level {activeLevel.levelNumber}: {activeLevel.name}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Questions for this Active Level */}
              <div className="stage-questions-deck">
                <div className="stage-deck-header">
                  <span className="stage-deck-title">Curriculum Modules for Level {activeLevel.levelNumber}: {activeLevel.name}</span>
                  <span className="stage-deck-count">{activeLevel.questions.length} Questions</span>
                </div>

                <div className="stage-questions-grid">
                  {activeLevel.questions.map((q, idx) => {
                    const status = questionStatuses[q.slug] || 'unseen';
                    return (
                      <Link
                        key={q.id}
                        to={`/${q.slug}`}
                        className={`stage-card-link ${status} ${activeLevel.colorTheme}`}
                      >
                        <div className="stage-card-meta">
                          <span className="stage-card-num">#{String(idx + 1).padStart(2, '0')}</span>
                          <span className="stage-card-cat">{q.category}</span>
                          <span className={`stage-status-chip ${status}`}>
                            {status === 'mastered' && <CheckCircle2 size={12} />}
                            {status === 'review' && <Bookmark size={12} />}
                            {status === 'mastered' ? 'Mastered' : status === 'review' ? 'In Review' : 'Ready'}
                          </span>
                        </div>

                        <h4 className="stage-card-title">{q.title}</h4>
                        <p className="stage-card-sub">{q.subtitle}</p>

                        <div className="stage-card-footer">
                          <span className="stage-card-prompt">Open Interactive Sequence →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side 3 Column Layout */
          <div className="difficulty-three-col">
            {levels.map((lvl) => {
              const lvlMastered = lvl.questions.filter(q => questionStatuses[q.slug] === 'mastered').length;
              const firstLvlQ = lvl.questions[0];

              return (
                <div key={lvl.id} className={`diff-col-panel ${lvl.colorTheme}`}>
                  <div className="diff-col-header">
                    <div className="diff-col-title-row">
                      <h3 className={`diff-col-name ${lvl.colorTheme}`}>Level {lvl.levelNumber}: {lvl.name}</h3>
                      <span className="diff-col-count">{lvlMastered} / {lvl.questions.length}</span>
                    </div>
                    <div className="diff-col-audience">{lvl.badge}</div>
                    <p className="diff-col-desc">{lvl.description}</p>
                    {firstLvlQ && (
                      <button
                        type="button"
                        className={`diff-start-btn ${lvl.colorTheme}`}
                        onClick={() => navigate(`/${firstLvlQ.slug}`)}
                      >
                        Start Level {lvl.levelNumber}: {lvl.name} <ArrowRight size={13} />
                      </button>
                    )}
                  </div>

                  <div className="diff-col-list">
                    {lvl.questions.map((q, idx) => {
                      const status = questionStatuses[q.slug] || 'unseen';
                      return (
                        <Link
                          key={q.id}
                          to={`/${q.slug}`}
                          className={`diff-q-row ${status}`}
                        >
                          <span className="diff-q-num">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="diff-q-title">{q.title}</span>
                          {status === 'mastered' && <CheckCircle2 size={13} className="diff-q-icon mastered" />}
                          {status === 'review' && <Bookmark size={13} className="diff-q-icon review" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

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
  Circle,
  ChevronRight,
  ChevronDown
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
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'Basic' | 'Intermediate' | 'Advanced'>('all');
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  const toggleLevelCollapse = (levelId: string) => {
    setCollapsedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

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
  const filteredLevels = levels.filter(lvl => selectedTierFilter === 'all' || lvl.difficulty === selectedTierFilter);

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

      {/* Levels Explorer Section */}
      <section className="curriculum-levels-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Explore by Difficulty Level</h2>
            <p className="section-subtitle">
              Choose your starting tier. Each level features interactive visual diagrams and benchmark interview spoken scripts.
            </p>
          </div>
        </div>

        {/* Mobile-Friendly Difficulty Filter Pills */}
        <div className="difficulty-tier-pills-bar" role="tablist" aria-label="Difficulty Levels">
          <button
            type="button"
            role="tab"
            aria-selected={selectedTierFilter === 'all'}
            className={`tier-filter-pill ${selectedTierFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTierFilter('all')}
          >
            All Tiers ({questions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedTierFilter === 'Basic'}
            className={`tier-filter-pill emerald ${selectedTierFilter === 'Basic' ? 'active' : ''}`}
            onClick={() => setSelectedTierFilter('Basic')}
          >
            <span className="pill-dot emerald" />
            Basic ({level1Questions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedTierFilter === 'Intermediate'}
            className={`tier-filter-pill blue ${selectedTierFilter === 'Intermediate' ? 'active' : ''}`}
            onClick={() => setSelectedTierFilter('Intermediate')}
          >
            <span className="pill-dot blue" />
            Intermediate ({level2Questions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedTierFilter === 'Advanced'}
            className={`tier-filter-pill purple ${selectedTierFilter === 'Advanced' ? 'active' : ''}`}
            onClick={() => setSelectedTierFilter('Advanced')}
          >
            <span className="pill-dot purple" />
            Advanced ({level3Questions.length})
          </button>
        </div>

        <div className="levels-cards-stack">
          {filteredLevels.map((lvl) => {
            const lvlMastered = lvl.questions.filter(q => questionStatuses[q.slug] === 'mastered').length;
            const lvlPercent = Math.round((lvlMastered / Math.max(1, lvl.questions.length)) * 100);
            const firstLvlQ = lvl.questions[0];
            const isCollapsed = !!collapsedLevels[lvl.id];

            return (
              <div key={lvl.id} className={`level-track-card ${lvl.colorTheme}`}>
                <div className="level-track-header">
                  <div className="level-header-left">
                    <div className={`level-icon-box ${lvl.colorTheme}`}>
                      {lvl.icon}
                    </div>
                    <div className="level-header-info">
                      <div className="level-badge-row">
                        <span className={`level-difficulty-pill ${lvl.colorTheme}`}>
                          {lvl.difficulty}
                        </span>
                        <span className="level-modules-pill">
                          {lvl.questions.length} Questions
                        </span>
                        <span className="level-audience-tag">
                          {lvl.badge}
                        </span>
                      </div>
                      <h3 className="level-track-title">{lvl.title}</h3>
                      <p className="level-track-desc">{lvl.description}</p>
                    </div>
                  </div>

                  <div className="level-header-right">
                    <div className="level-progress-display">
                      <div className="level-progress-text">
                        <span>Progress: <strong>{lvlMastered}/{lvl.questions.length}</strong></span>
                        <span className="level-percent">{lvlPercent}%</span>
                      </div>
                      <div className="level-progress-bar-bg">
                        <div
                          className={`level-progress-bar-fill ${lvl.colorTheme}`}
                          style={{ width: `${lvlPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="level-actions-row">
                      {firstLvlQ && (
                        <button
                          type="button"
                          className={`level-start-btn ${lvl.colorTheme}`}
                          onClick={() => navigate(`/${firstLvlQ.slug}`)}
                        >
                          <span>Start {lvl.difficulty}</span>
                          <ArrowRight size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="level-collapse-toggle-btn"
                        onClick={() => toggleLevelCollapse(lvl.id)}
                        aria-label={isCollapsed ? `Expand ${lvl.title}` : `Collapse ${lvl.title}`}
                      >
                        <span>{isCollapsed ? `Show (${lvl.questions.length})` : 'Collapse'}</span>
                        <ChevronDown size={14} className={`toggle-arrow ${isCollapsed ? 'is-collapsed' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Items in this Level (collapsible on demand) */}
                {!isCollapsed && (
                  <div className="level-questions-grid">
                    {lvl.questions.map((q) => {
                      const status = questionStatuses[q.slug] || 'unseen';

                      return (
                        <Link
                          key={q.id}
                          to={`/${q.slug}`}
                          className={`level-question-item ${status}`}
                        >
                          <div className="lq-left">
                            <span className="lq-number">#{q.id}</span>
                            <div className="lq-content">
                              <h4 className="lq-title">{q.title}</h4>
                              <span className="lq-category">{q.category}</span>
                            </div>
                          </div>

                          <div className="lq-right">
                            {status === 'mastered' && (
                              <span className="lq-status-badge mastered">
                                <CheckCircle2 size={12} />
                                <span>Mastered</span>
                              </span>
                            )}
                            {status === 'review' && (
                              <span className="lq-status-badge review">
                                <Bookmark size={12} />
                                <span>Review</span>
                              </span>
                            )}
                            {status === 'unseen' && (
                              <span className="lq-status-badge unseen">
                                <Circle size={7} />
                                <span>Unseen</span>
                              </span>
                            )}
                            <ChevronRight size={14} className="lq-arrow" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

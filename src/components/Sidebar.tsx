import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle2, Bookmark, Circle, Home } from 'lucide-react';
import type { QuestionData } from '../types/question';

interface SidebarProps {
  questions: QuestionData[];
  searchTerm: string;
  onSearchChange?: (term: string) => void;
  isOpen: boolean;
  onClose: () => void;
  questionStatuses: Record<string, 'mastered' | 'review' | 'unseen'>;
}

interface TierGroup {
  tier: string;
  label: string;
  questions: QuestionData[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  questions,
  searchTerm,
  isOpen,
  onClose,
  questionStatuses,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'review' | 'unseen'>('all');

  const filtered = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      q.title.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.keywords.some((k) => k.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    const qStatus = questionStatuses[q.slug] || 'unseen';
    if (statusFilter === 'all') return true;
    return qStatus === statusFilter;
  });

  const masteredCount = questions.filter((q) => questionStatuses[q.slug] === 'mastered').length;
  const reviewCount = questions.filter((q) => questionStatuses[q.slug] === 'review').length;
  const progressPercent = Math.round((masteredCount / Math.max(1, questions.length)) * 100);

  const tiers: TierGroup[] = [
    { tier: 'Core', label: 'LEVEL 1: BASIC', questions: [] },
    { tier: 'Intermediate', label: 'LEVEL 2: INTERMEDIATE', questions: [] },
    { tier: 'Advanced', label: 'LEVEL 3: ADVANCED', questions: [] }
  ];

  filtered.forEach((q) => {
    const t = q.tier || (q.id <= 7 ? 'Core' : q.id <= 14 ? 'Intermediate' : 'Advanced');
    const grp = tiers.find((tg) => tg.tier === t) || tiers[0];
    grp.questions.push(q);
  });

  return (
    <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header-section">
        <div className="sidebar-title-row">
          <span className="sidebar-main-title">Protocol Curricula</span>
          <div className="sidebar-title-actions">
            <span className="modules-count-pill">{questions.length} Modules</span>
            <button
              type="button"
              className="sidebar-mobile-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Readiness Meter Bar */}
        <div className="sidebar-progress-box">
          <div className="progress-stats-row">
            <span className="meter-count">{masteredCount} of {questions.length} Mastered</span>
            <span className="meter-percent">{progressPercent}%</span>
          </div>
          <div className="progress-track-bg">
            <div className="progress-fill-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="sidebar-status-filter-pills">
          <button
            type="button"
            className={`status-tab-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({questions.length})
          </button>
          <button
            type="button"
            className={`status-tab-pill mastered ${statusFilter === 'mastered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('mastered')}
          >
            ✓ Mastered ({masteredCount})
          </button>
          <button
            type="button"
            className={`status-tab-pill review ${statusFilter === 'review' ? 'active' : ''}`}
            onClick={() => setStatusFilter('review')}
          >
            ★ Review ({reviewCount})
          </button>
        </div>
      </div>

      <nav className="sidebar-questions-scroll" aria-label="Question Navigation">
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) => `sidebar-home-link ${isActive ? 'active' : ''}`}
          title="Curriculum Levels Overview"
        >
          <Home size={15} />
          <span>All Levels &amp; Curricula</span>
        </NavLink>
        
        {filtered.length === 0 ? (
          <div className="empty-search-state">
            No questions found in "{statusFilter}" filter.
          </div>
        ) : (
          tiers.map((grp) => {
            if (grp.questions.length === 0) return null;

            return (
              <div key={grp.tier} className="curriculum-tier-group">
                <div className="tier-group-header">
                  <span>{grp.label}</span>
                  <span className="tier-count-pill">{grp.questions.length}</span>
                </div>

                <div className="tier-questions-list">
                  {grp.questions.map((q) => {
                    const status = questionStatuses[q.slug] || 'unseen';
                    const numStr = q.id.toString().padStart(2, '0');

                    return (
                      <NavLink
                        key={q.id}
                        to={`/${q.slug}`}
                        onClick={onClose}
                        className={({ isActive }) => `sidebar-question-link ${isActive ? 'active' : ''}`}
                      >
                        <div className="sidebar-q-left">
                          <span className="q-num-tag">{numStr}</span>
                          <span className="q-title-label">{q.title}</span>
                        </div>
                        <div className="sidebar-q-right">
                          {status === 'mastered' && (
                            <span title="Mastered"><CheckCircle2 size={15} className="q-check-icon mastered" /></span>
                          )}
                          {status === 'review' && (
                            <span title="Needs Review"><Bookmark size={15} className="q-bookmark-icon review" /></span>
                          )}
                          {status === 'unseen' && (
                            <span title="Unseen"><Circle size={10} className="q-unseen-dot" /></span>
                          )}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
};

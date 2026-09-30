import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import type { QuestionData } from '../types/question';

interface SidebarProps {
  questions: QuestionData[];
  searchTerm: string;
  onSearchChange?: (term: string) => void;
  isOpen: boolean;
  onClose: () => void;
  viewedSlugs: Set<string>;
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
  viewedSlugs,
}) => {
  const filtered = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.title.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.keywords.some((k) => k.toLowerCase().includes(term))
    );
  });

  const completedCount = questions.filter((q) => viewedSlugs.has(q.slug)).length;
  const progressPercent = Math.round((completedCount / questions.length) * 100);

  const tiers: TierGroup[] = [
    { tier: 'Core', label: 'CORE FUNDAMENTALS', questions: [] },
    { tier: 'Intermediate', label: 'INTERMEDIATE DEFENSES', questions: [] },
    { tier: 'Advanced', label: 'ADVANCED ARCHITECTURES', questions: [] }
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
          <span className="modules-count-pill">{questions.length} Modules</span>
        </div>

        <div className="sidebar-progress-box">
          <div className="progress-stats-row">
            <span className="meter-count">{completedCount} Mastered</span>
            <span className="meter-percent">{progressPercent}%</span>
          </div>
          <div className="progress-track-bg">
            <div className="progress-fill-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <nav className="sidebar-questions-scroll" aria-label="Question Navigation">
        {filtered.length === 0 ? (
          <div className="empty-search-state">No interview questions match your filter.</div>
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
                    const isCompleted = viewedSlugs.has(q.slug);
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
                        {isCompleted && (
                          <CheckCircle2 size={16} className="q-check-icon" />
                        )}
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

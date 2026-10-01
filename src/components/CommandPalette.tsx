import React, { useState, useEffect, useRef } from 'react';
import type { QuestionData } from '../types/question';
import {
  Search,
  Command,
  Layers,
  Download,
  Printer,
  Moon,
  Tv,
  Mic,
  BookOpen,
  Zap,
  Shield,
  CornerDownLeft
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionData[];
  onSelectQuestion: (slug: string) => void;
  onOpenFlashcards: () => void;
  onExportAnki: () => void;
  onPrintCheatSheet: () => void;
  onSwitchTab: (tab: 'visual' | 'spoken' | 'deepdive' | 'quiz') => void;
  onToggleTheme: () => void;
}

interface ActionItem {
  id: string;
  type: 'action' | 'question';
  title: string;
  subtitle?: string;
  category?: string;
  icon: React.ReactNode;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  questions,
  onSelectQuestion,
  onOpenFlashcards,
  onExportAnki,
  onPrintCheatSheet,
  onSwitchTab,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // System actions list
  const systemActions: ActionItem[] = [
    {
      id: 'action-flashcards',
      type: 'action',
      title: 'Open Flashcards & Spaced Repetition Study Deck',
      subtitle: 'Review questions with 3D flip card memory rehearsal',
      icon: <Layers size={16} className="palette-icon purple" />,
      perform: () => { onClose(); onOpenFlashcards(); }
    },
    {
      id: 'action-anki',
      type: 'action',
      title: 'Export Anki Flashcard Deck (.csv)',
      subtitle: 'Download mobile-compatible deck for Anki app',
      icon: <Download size={16} className="palette-icon blue" />,
      perform: () => { onClose(); onExportAnki(); }
    },
    {
      id: 'action-print',
      type: 'action',
      title: 'Print / Save PDF Executive Cheat Sheet',
      subtitle: 'Format questions into a printable 1-page summary sheet',
      icon: <Printer size={16} className="palette-icon green" />,
      perform: () => { onClose(); onPrintCheatSheet(); }
    },
    {
      id: 'action-theme',
      type: 'action',
      title: 'Toggle Dark / Light Mode',
      subtitle: 'Switch between Obsidian Dark and High-Contrast Light theme',
      icon: <Moon size={16} className="palette-icon amber" />,
      perform: () => { onClose(); onToggleTheme(); }
    },
    {
      id: 'action-tab-visual',
      type: 'action',
      title: 'Study Mode: Visual Protocol Flow',
      subtitle: 'Interactive animated SVG packet flow & deep telemetry (Shortcut: 1)',
      icon: <Tv size={16} className="palette-icon blue" />,
      perform: () => { onClose(); onSwitchTab('visual'); }
    },
    {
      id: 'action-tab-spoken',
      type: 'action',
      title: 'Study Mode: Spoken Rehearsal Studio',
      subtitle: 'AI audio coach with live keyword scorecard & pacing (Shortcut: 2)',
      icon: <Mic size={16} className="palette-icon purple" />,
      perform: () => { onClose(); onSwitchTab('spoken'); }
    },
    {
      id: 'action-tab-deepdive',
      type: 'action',
      title: 'Study Mode: Deep-Dive Architectural Defense',
      subtitle: 'Senior talking points, pitfalls, and RFC citations (Shortcut: 3)',
      icon: <BookOpen size={16} className="palette-icon green" />,
      perform: () => { onClose(); onSwitchTab('deepdive'); }
    },
    {
      id: 'action-tab-quiz',
      type: 'action',
      title: 'Study Mode: Rapid Security Quiz',
      subtitle: 'Test scenario-based edge cases and threat detection (Shortcut: 4)',
      icon: <Zap size={16} className="palette-icon amber" />,
      perform: () => { onClose(); onSwitchTab('quiz'); }
    },
  ];

  // Filtered items (actions + matching questions)
  const qTerm = query.toLowerCase().trim();
  const matchedActions = systemActions.filter(a =>
    a.title.toLowerCase().includes(qTerm) || (a.subtitle && a.subtitle.toLowerCase().includes(qTerm))
  );

  const matchedQuestions: ActionItem[] = questions
    .filter(q =>
      q.title.toLowerCase().includes(qTerm) ||
      q.category.toLowerCase().includes(qTerm) ||
      (q.subtitle && q.subtitle.toLowerCase().includes(qTerm)) ||
      q.keywords.some(k => k.toLowerCase().includes(qTerm))
    )
    .slice(0, 8)
    .map(q => ({
      id: q.slug,
      type: 'question',
      title: q.title,
      subtitle: q.subtitle,
      category: q.category,
      icon: <Shield size={16} className="palette-icon blue" />,
      perform: () => { onClose(); onSelectQuestion(q.slug); }
    }));

  const allItems = [...matchedActions, ...matchedQuestions];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].perform();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-window" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="palette-search-header">
          <Search size={18} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command, question, CVE, or keyword (e.g. CORS, JWT, Anki, Dark)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="palette-esc-badge">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="palette-results-list" role="listbox">
          {allItems.length === 0 ? (
            <div className="palette-empty-state">
              No matching commands or questions found for "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`palette-item-row ${isSelected ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => item.perform()}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="palette-item-left">
                    <div className="palette-icon-wrapper">
                      {item.icon}
                    </div>
                    <div className="palette-item-text">
                      <div className="palette-item-title-row">
                        <span className="item-title">{item.title}</span>
                        {item.category && (
                          <span className="item-category-pill">{item.category}</span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span className="item-subtitle">{item.subtitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="palette-item-right">
                    {isSelected && (
                      <span className="palette-select-hint">
                        <span>Select</span>
                        <CornerDownLeft size={13} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer Shortcuts */}
        <div className="palette-footer-bar">
          <div className="palette-footer-shortcuts">
            <span className="shortcut-pill"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span className="shortcut-pill"><kbd>↵</kbd> Select</span>
            <span className="shortcut-pill"><kbd>Esc</kbd> Close</span>
          </div>
          <div className="palette-footer-brand">
            <Command size={12} />
            <span>WebSec Command Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};

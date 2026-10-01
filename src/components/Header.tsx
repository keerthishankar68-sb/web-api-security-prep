import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  Terminal,
  Layers,
  Download,
  Printer,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onOpenCommandPalette: () => void;
  onOpenFlashcards: () => void;
  onExportAnki: () => void;
  onPrintCheatSheet: () => void;
  masteredCount: number;
  totalQuestions: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenCommandPalette,
  onOpenFlashcards,
  onExportAnki,
  onPrintCheatSheet,
  masteredCount,
  totalQuestions,
}) => {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark', 'dark-mode');
    }
  }, [darkMode]);

  const readinessPercent = Math.round((masteredCount / Math.max(1, totalQuestions)) * 100);

  return (
    <header className="app-header">
      <div className="header-left">
        {onToggleMobileMenu && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleMobileMenu}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        <Link to="/" className="brand-wrapper brand-clickable" title="Return to Curriculum Levels Overview">
          <div className="brand-icon-box">
            <Terminal size={18} strokeWidth={2.5} />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">SecMastery</span>
            <span className="brand-tag">API &amp; WEB LAB</span>
          </div>
        </Link>

        {/* Interview Readiness Meter */}
        <div
          className="readiness-meter-pill"
          title={`${masteredCount} of ${totalQuestions} questions mastered`}
        >
          <span className="readiness-meter-dot" />
          <span className="readiness-meter-label">Readiness: <strong>{readinessPercent}%</strong></span>
          <span className="readiness-meter-fraction">({masteredCount}/{totalQuestions})</span>
        </div>
      </div>

      <div className="header-center">
        <div
          className="search-input-wrapper clickable-palette-trigger"
          onClick={onOpenCommandPalette}
          title="Click or press ⌘K to open command search"
        >
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Type ⌘K to search questions, CVEs, or commands..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
            readOnly
          />
          <kbd className="kbd-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="header-right">
        {/* Flashcards Button */}
        <button
          type="button"
          className="header-tool-btn flashcards"
          onClick={onOpenFlashcards}
          title="Open Spaced Repetition Flashcards"
        >
          <Layers size={15} />
          <span className="tool-btn-text">Flashcards</span>
        </button>

        {/* Export Dropdown */}
        <div className="export-dropdown-wrapper">
          <button
            type="button"
            className="header-tool-btn export"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Anki deck or print summary cheat sheet"
          >
            <Download size={14} />
            <span className="tool-btn-text">Study Export</span>
            <ChevronDown size={12} />
          </button>

          {showExportMenu && (
            <div className="export-menu-popover" onMouseLeave={() => setShowExportMenu(false)}>
              <button
                type="button"
                className="export-menu-item"
                onClick={() => { setShowExportMenu(false); onExportAnki(); }}
              >
                <Download size={14} className="menu-icon blue" />
                <div>
                  <div className="menu-title">Export Anki Deck (.csv)</div>
                  <div className="menu-sub">Flashcards for Anki mobile/desktop</div>
                </div>
              </button>

              <button
                type="button"
                className="export-menu-item"
                onClick={() => { setShowExportMenu(false); onPrintCheatSheet(); }}
              >
                <Printer size={14} className="menu-icon green" />
                <div>
                  <div className="menu-title">Print / PDF Cheat Sheet</div>
                  <div className="menu-sub">Clean 1-page printable summary</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};

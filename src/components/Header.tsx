import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Terminal, Sparkles, Menu, X } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark', 'dark-mode');
    }
  }, [darkMode]);

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

        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <Terminal size={18} strokeWidth={2.5} />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-name">SecMastery</span>
            <span className="brand-tag">API &amp; WEB LAB</span>
          </div>
        </div>

        <div className="brand-status-pill">
          <span className="pulse-dot" />
          <span>Interactive Interview Sandbox</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Filter questions, protocols, CVEs, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <kbd className="kbd-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="spec-badge-btn" type="button">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Staff Security Spec</span>
        </button>
      </div>
    </header>
  );
};

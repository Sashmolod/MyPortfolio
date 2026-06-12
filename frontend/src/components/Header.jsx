import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { soundSynth } from '../utils/audioSynth';
import {
  SketchLockIcon,
  SketchSunIcon,
  SketchMoonIcon,
  SketchSoundIcon,
} from './SvgIllustrations';
import { usePortfolioSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

const navItems = ['Home', 'Skills', 'Projects', 'Contact'];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = usePortfolioSettings();
  const { language, setLanguage, t } = useLanguage();
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('audio_muted') === 'true';
    soundSynth.setMuted(saved);
    return saved;
  });

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    localStorage.setItem('audio_muted', String(nextMuted));
    soundSynth.setMuted(nextMuted);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    soundSynth.playPageFlip();
  };

  const handleDoubleClick = (e) => {
    // Only trigger if double clicking the header itself, not the buttons/links
    if (e.target.tagName === 'HEADER' || e.target.tagName === 'H1') {
      window.dispatchEvent(
        new CustomEvent('ink-leak-triggered', {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('page-crumple-transition', {
        detail: { to: '/admin' },
      })
    );
  };

  return (
    <header onDoubleClick={handleDoubleClick}>
      <h1>MyPortfolio</h1>
      <nav
        style={{ display: 'flex', alignItems: 'center' }}
        aria-label="Main Navigation"
      >
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            aria-label={`Go to ${item} section`}
          >
            {t(item.toLowerCase())}
          </a>
        ))}
        {settings?.showAdminLink !== false && (
          <a
            href="/admin"
            onClick={handleAdminClick}
            className="btn"
            aria-label={t('admin')}
            style={{
              marginLeft: '10px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <SketchLockIcon size={18} /> {t('admin')}
          </a>
        )}
        <button
          onClick={handleToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '10px',
            color: 'var(--text)',
            outline: 'none',
            padding: '4px',
          }}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
          aria-label={
            theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
          }
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? (
            <SketchMoonIcon size={20} />
          ) : (
            <SketchSunIcon size={20} />
          )}
        </button>
        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '10px',
            color: 'var(--text)',
            outline: 'none',
            padding: '4px',
          }}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-pressed={!muted}
        >
          <SketchSoundIcon muted={muted} size={20} />
        </button>
        <button
          onClick={() => {
            setLanguage(language === 'ru' ? 'en' : 'ru');
            soundSynth.playPageFlip();
          }}
          style={{
            background: 'none',
            border: 'var(--border-style)',
            borderRadius: 'var(--sketch-radius-3)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '10px',
            color: 'var(--text)',
            outline: 'none',
            padding: '3px 8px',
            fontSize: '13px',
            fontWeight: 'bold',
            fontFamily: "'Architects Daughter', cursive",
          }}
          title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          aria-label="Toggle language"
        >
          {language === 'ru' ? 'EN' : 'RU'}
        </button>
      </nav>
    </header>
  );
}

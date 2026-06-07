import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { soundSynth } from '../utils/audioSynth';
import { SketchLockIcon, SketchSunIcon, SketchMoonIcon, SketchSoundIcon } from './SvgIllustrations';
import { usePortfolioSettings } from '../contexts/SettingsContext';

const navItems = ['Home', 'Skills', 'Projects', 'Contact'];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = usePortfolioSettings();
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
      window.dispatchEvent(new CustomEvent('ink-leak-triggered', {
        detail: { x: e.clientX, y: e.clientY }
      }));
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('page-crumple-transition', {
      detail: { to: '/admin' }
    }));
  };

  return (
    <header onDoubleClick={handleDoubleClick}>
        <h1>MyPortfolio</h1>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
          {(settings?.showAdminLink !== false) && (
            <a
              href="/admin"
              onClick={handleAdminClick}
              className="btn"
              style={{
                marginLeft: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <SketchLockIcon size={18} /> Admin
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
            padding: '4px'
          }}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
        >
          {theme === 'light' ? <SketchMoonIcon size={20} /> : <SketchSunIcon size={20} />}
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
            padding: '4px'
          }}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          <SketchSoundIcon muted={muted} size={20} />
        </button>
      </nav>
    </header>
  );
}
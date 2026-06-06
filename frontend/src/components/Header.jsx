import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { soundSynth } from '../utils/audioSynth';

const navItems = ['Home', 'Skills', 'Projects', 'Contact'];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
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

  return (
    <header>
      <h1>MyPortfolio</h1>
      <nav>
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`}>
            {item}
          </a>
        ))}
        <Link
          to="/admin"
          className="btn"
          style={{ marginLeft: '10px', textDecoration: 'none' }}
        >
          🔐 Admin
        </Link>
        <button
          onClick={handleToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginLeft: '10px'
          }}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginLeft: '10px'
          }}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </nav>
    </header>
  );
}
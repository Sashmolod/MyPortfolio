import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const navItems = ['Home', 'Skills', 'Projects', 'Contact'];

export default function Header() {
  const { theme, toggleTheme } = useTheme();

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
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginLeft: '10px'
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
}
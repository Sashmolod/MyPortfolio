import { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import { SketchLockIcon } from '../components/SvgIllustrations';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Wrong password!');
      setPassword('');
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '400px',
            width: '100%',
            padding: '30px',
            margin: '20px',
          }}
        >
          <h2
            style={{
              marginBottom: '20px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <SketchLockIcon size={24} /> Admin Login
          </h2>
          <div style={{ marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Password:
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {handleLogin();}
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
              }}
            />
          </div>
          {error && (
            <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>
          )}
          <button
            className="btn"
            onClick={handleLogin}
            style={{ width: '100%' }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

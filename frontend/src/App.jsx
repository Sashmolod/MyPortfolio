import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { usePortfolioSettings } from './contexts/SettingsContext';
import api from './api';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import DoodleCanvas from './components/DoodleCanvas';
import DoodleControls from './components/DoodleControls';
import DoodlyHelper from './components/DoodlyHelper';
import CoffeeCup from './components/CoffeeCup';
import SketchyBug from './components/SketchyBug';
import PageTear from './components/PageTear';
import InkLeak from './components/InkLeak';
import PageCrumpler from './components/PageCrumpler';
import ErrorBoundary from './components/ErrorBoundary';
import { Helmet } from 'react-helmet-async';

// Lazy-loaded components for code splitting
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));

/**
 * Главная страница приложения (публичная)
 */
function PublicPage() {
  const { settings } = usePortfolioSettings();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for doodles
  const [drawingMode, setDrawingMode] = useState(false);
  const [doodleColor, setDoodleColor] = useState('rgba(74, 85, 104, 0.85)'); // Default pencil
  const [brushWidth, setBrushWidth] = useState(3);
  const [doodlePaths, setDoodlePaths] = useState(() => {
    try {
      const saved = localStorage.getItem('doodle_paths');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save paths to localStorage when changed
  useEffect(() => {
    localStorage.setItem('doodle_paths', JSON.stringify(doodlePaths));
  }, [doodlePaths]);

  const handleUndo = () => {
    setDoodlePaths((prev) => prev.slice(0, -1));
  };

  const [isGuessing, setIsGuessing] = useState(false);

  const handleGuessDrawing = async () => {
    if (doodlePaths.length === 0) {
      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: {
            guess:
              'Хм-м... Кажется, холст пуст! Нарисуй что-нибудь, и я попробую угадать! 🎨',
          },
        })
      );
      return;
    }

    setIsGuessing(true);
    window.dispatchEvent(new CustomEvent('doodly-guess-start'));

    try {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      doodlePaths.forEach((p) => {
        p.points.forEach((pt) => {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        });
      });

      const pad = 20;
      const width = maxX - minX + pad * 2;
      const height = maxY - minY + pad * 2;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      doodlePaths.forEach((path) => {
        if (path.points.length < 1) return;
        ctx.beginPath();
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;

        const start = path.points[0];
        ctx.moveTo(start.x - minX + pad, start.y - minY + pad);

        for (let i = 1; i < path.points.length; i++) {
          const pt = path.points[i];
          ctx.lineTo(pt.x - minX + pad, pt.y - minY + pad);
        }
        ctx.stroke();
      });

      const base64Image = canvas.toDataURL('image/png');

      const response = await fetch('/api/portfolio/doodly/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error('Vision guess failed');
      const data = await response.json();

      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: { guess: data.guess },
        })
      );
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: {
            guess: 'Ой! Мой AI-взгляд затуманился. Попробуй еще раз! 🔌',
          },
        })
      );
    } finally {
      setIsGuessing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Delete all doodles? / Удалить все рисунки?')) {
      setDoodlePaths([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, projectsRes, heroRes] = await Promise.all([
          api.get('/portfolio/skills'),
          api.get('/portfolio/projects'),
          api.get('/portfolio/hero'),
        ]);
        setSkills(skillsRes.data);
        setProjects(projectsRes.data);
        setHeroData(heroRes.data);
        setHero(heroRes.data?.hero || null);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Track page visit once per session
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionKey = 'portfolio_tracked_session';
        if (sessionStorage.getItem(sessionKey)) {
          return;
        }
        sessionStorage.setItem(sessionKey, 'true');
        await api.post('/portfolio/track-visit', {
          path: window.location.pathname,
          referrer: document.referrer || null,
        });
      } catch (err) {
        console.error('Error tracking visit:', err);
      }
    };
    trackVisit();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Helmet>
        <title>
          {hero?.name
            ? `${hero.name} - ${hero.title} | Portfolio`
            : 'Developer Portfolio | Sketchbook'}
        </title>
        <meta
          name="description"
          content={
            hero?.bio ||
            'Creative sketch-style web developer portfolio with hand-drawn interactive elements and drawings.'
          }
        />
        <meta
          name="keywords"
          content="web developer, sketch portfolio, frontend developer, nestjs react, creative developer, interactive doodles"
        />
        <meta
          property="og:title"
          content={
            hero?.name
              ? `${hero.name} - ${hero.title} | Portfolio`
              : 'Developer Portfolio | Sketchbook'
          }
        />
        <meta
          property="og:description"
          content={
            hero?.bio ||
            'Creative sketch-style web developer portfolio with hand-drawn interactive elements.'
          }
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content={
            hero?.name
              ? `${hero.name} - ${hero.title} | Portfolio`
              : 'Developer Portfolio | Sketchbook'
          }
        />
        <meta
          property="twitter:description"
          content={
            hero?.bio ||
            'Creative sketch-style web developer portfolio with hand-drawn interactive elements.'
          }
        />
      </Helmet>
      <DoodleCanvas
        active={drawingMode}
        color={doodleColor}
        brushWidth={brushWidth}
        paths={doodlePaths}
        setPaths={setDoodlePaths}
      />
      <DoodleControls
        active={drawingMode}
        setActive={setDrawingMode}
        color={doodleColor}
        setColor={setDoodleColor}
        brushWidth={brushWidth}
        setBrushWidth={setBrushWidth}
        onUndo={handleUndo}
        onClear={handleClear}
        onGuessDrawing={handleGuessDrawing}
        isGuessing={isGuessing}
      />
      <Header />
      <main className="app-main">
        <Hero data={hero} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <ContactForm />
        <CoffeeCup />
      </main>
      {settings?.enableDoodly && <DoodlyHelper />}
      {settings?.enableBug && <SketchyBug />}
      {settings?.enablePageTear && <PageTear />}
      {settings?.enableInkLeak && <InkLeak />}
      <Footer />
    </div>
  );
}

/**
 * Loading fallback для lazy-loaded компонентов
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>Loading...</p>
    </div>
  );
}

/**
 * Админ-панель (защищённая)
 */
function AdminPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}

/**
 * Основная роутинговая компонента
 */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Публичные route */}
      <Route
        path="/"
        element={
          <ErrorBoundary>
            <PublicPage />
          </ErrorBoundary>
        }
      />

      {/* Страница логина */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            </Suspense>
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />

      {/* Защищённые route (только для авторизованных) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <ErrorBoundary>
              <AdminPage />
            </ErrorBoundary>
          }
        />
      </Route>

      {/* Всё остальное — редирект на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <ToastContainer />
      <PageCrumpler />
      <AppRoutes />
    </>
  );
}

export default App;

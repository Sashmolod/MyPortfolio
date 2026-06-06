import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage'
import AdminDashboard from './admin/pages/AdminDashboard';
import api from './api';
import DoodleCanvas from './components/DoodleCanvas';
import DoodleControls from './components/DoodleControls';
import DoodlyHelper from './components/DoodlyHelper';
import CoffeeCup from './components/CoffeeCup';

/**
 * Главная страница приложения (публичная)
 */
function PublicPage() {
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [heroData, setHeroData] = useState(null);
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
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
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
      />
      <Header />
      <main className="app-main">
        <Hero data={heroData} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <ContactForm />
        <CoffeeCup />
      </main>
      <DoodlyHelper />
      <Footer />
    </div>
  );
}

/**
 * Админ-панель (защищённая)
 */
function AdminPage() {
  return <AdminDashboard />;
}

/**
 * Основная роутинговая компонента
 */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Публичные route */}
      <Route path="/" element={<PublicPage />} />

      {/* Страница логина */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/admin" replace />} />

      {/* Защищённые route (только для авторизованных) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminPage />} />
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
      <AppRoutes />
    </>
  );
}

export default App;
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

/**
 * Главная страница приложения (публичная)
 */
function PublicPage() {
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div>
      <Header />
      <main className="app-main">
        <Hero data={heroData} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <ContactForm />
      </main>
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
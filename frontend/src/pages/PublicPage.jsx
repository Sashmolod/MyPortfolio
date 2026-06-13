import { useState, useEffect } from 'react';
import { usePortfolioSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../api';
import Header from '../components/Header';
import HeroSection from '../components/portfolio/HeroSection';
import SkillsSection from '../components/portfolio/SkillsSection';
import ProjectsSection from '../components/portfolio/ProjectsSection';
import ContactSection from '../components/portfolio/ContactSection';
import Footer from '../components/Footer';
import DoodleCanvas from '../components/creative/DoodleCanvas';
import DoodleControls from '../components/creative/DoodleControls';
import DoodlyHelper from '../components/creative/DoodlyHelper';
import CoffeeCup from '../components/creative/CoffeeCup';
import SketchyBug from '../components/creative/SketchyBug';
import PageTear from '../components/creative/PageTear';
import InkLeak from '../components/creative/InkLeak';
import { useTemplate } from '../contexts/TemplateContext';
import { Helmet } from 'react-helmet-async';

/**
 * PublicPage Component
 * 
 * Renders the main user-facing homepage of the portfolio.
 * It fetches the portfolio data (hero details, projects, skills), handles the doodling/canvas
 * interactions (doodling controls, colors, undo/clear actions), tracks analytics page visits,
 * and handles calling the AI vision model to guess what the user drew.
 */
export default function PublicPage() {
  const { settings } = usePortfolioSettings();
  const { t, language } = useLanguage();
  const { config } = useTemplate();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for doodles/canvas sketching
  const [drawingMode, setDrawingMode] = useState(false);
  const [doodleColor, setDoodleColor] = useState('rgba(74, 85, 104, 0.85)'); // Default pencil charcoal color
  const [brushWidth, setBrushWidth] = useState(3);
  
  // Initialize paths from localStorage if available, so user drawings persist across reloads
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
    // Remove the last drawn path line to undo
    setDoodlePaths((prev) => prev.slice(0, -1));
  };

  const [isGuessing, setIsGuessing] = useState(false);

  /**
   * handleGuessDrawing
   * 
   * Triggers the AI vision guess request.
   * 1. Finds the bounding box of the user's sketch on screen.
   * 2. Re-draws the sketch onto a temporary canvas cropped specifically to the bounding box.
   *    This step is crucial because it crops out blank margins, making the sketch larger
   *    and more centered, which significantly improves the AI vision model's recognition accuracy.
   * 3. Exports the cropped canvas as a PNG DataURL.
   * 4. Sends it to the backend to get a guess from the AI model.
   * 5. Dispatches custom events to notify the interactive 'Doodly Helper' script of the outcome.
   */
  const handleGuessDrawing = async () => {
    if (doodlePaths.length === 0) {
      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: {
            guess: t('Хм-м... Кажется, холст пуст! Нарисуй что-нибудь, и я попробую угадать! 🎨 / Hmm... It seems the canvas is empty! Draw something and I will try to guess! 🎨'),
          },
        })
      );
      return;
    }

    setIsGuessing(true);
    window.dispatchEvent(new CustomEvent('doodly-guess-start'));

    try {
      // Find the bounding box limits (min/max X & Y coordinates) of all points drawn
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

      // Add small safety padding (20px) to ensure edges aren't cut off
      const pad = 20;
      const width = maxX - minX + pad * 2;
      const height = maxY - minY + pad * 2;

      // Create a temporary offscreen canvas for rendering the cropped sketch
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fill background with solid white (transparency can confuse the vision model)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Set smooth stroke corners
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw all paths offset by the minX / minY coordinates to align it to the top-left of the cropped canvas
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

      // Export to base64 DataURL (image/png)
      const base64Image = canvas.toDataURL('image/png');

      // Send base64 payload to backend AI endpoint
      const response = await fetch('/api/portfolio/doodly/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image, lang: language }),
      });

      if (!response.ok) throw new Error('Vision guess failed');
      const data = await response.json();

      // Dispatch event to show the guess result inside Doodly's speech bubble
      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: { guess: t(data.guess) },
        })
      );
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent('doodly-guess-result', {
          detail: {
            guess: t('Ой! Мой AI-взгляд затуманился. Попробуй еще раз! 🔌 / Oops! My AI vision got blurry. Try again! 🔌'),
          },
        })
      );
    } finally {
      setIsGuessing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(t('deleteConfirm'))) {
      setDoodlePaths([]);
    }
  };

  // Fetch portfolio contents (skills, projects, hero bio)
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
        
        const heroDataRaw = heroRes.data;
        let finalHero = heroDataRaw?.hero || heroDataRaw || null;
        
        // Attach socialLinks object back to the hero state for compatibility
        if (heroDataRaw?.socialLinks) {
          finalHero = {
            ...finalHero,
            socialLinks: heroDataRaw.socialLinks
          };
        }
        setHero(finalHero);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Track page visit once per browser session
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionKey = 'portfolio_tracked_session';
        if (sessionStorage.getItem(sessionKey)) {
          return; // Already tracked in this session
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
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Helmet>
        <title>
          {hero?.name
            ? `${hero.name} - ${t(hero.title)} | Portfolio`
            : t('Портфолио разработчика | Блокнот / Developer Portfolio | Sketchbook')}
        </title>
        <meta
          name="description"
          content={
            t(hero?.bio) ||
            t('Креативное портфолио веб-разработчика в стиле набросков с интерактивными элементами и рисунками. / Creative sketch-style web developer portfolio with hand-drawn interactive elements and drawings.')
          }
        />
        <meta
          name="keywords"
          content={t('веб-разработчик, скетч-портфолио, фронтенд-разработчик, nestjs react, креативный разработчик, интерактивные рисунки / web developer, sketch portfolio, frontend developer, nestjs react, creative developer, interactive doodles')}
        />
        <meta
          property="og:title"
          content={
            hero?.name
              ? `${hero.name} - ${t(hero.title)} | Portfolio`
              : t('Портфолио разработчика | Блокнот / Developer Portfolio | Sketchbook')
          }
        />
        <meta
          property="og:description"
          content={
            t(hero?.bio) ||
            t('Креативное портфолио веб-разработчика в стиле набросков с интерактивными элементами. / Creative sketch-style web developer portfolio with hand-drawn interactive elements.')
          }
        />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content={
            hero?.name
              ? `${hero.name} - ${t(hero.title)} | Portfolio`
              : t('Портфолио разработчика | Блокнот / Developer Portfolio | Sketchbook')
          }
        />
        <meta
          property="twitter:description"
          content={
            t(hero?.bio) ||
            t('Креативное портфолио веб-разработчика в стиле набросков с интерактивными элементами. / Creative sketch-style web developer portfolio with hand-drawn interactive elements.')
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
        {config.layout.sections
          .filter((section) => section.enabled)
          .map((section) => {
            switch (section.id) {
              case 'hero':
                return <HeroSection key="hero" data={hero} />;
              case 'skills':
                return <SkillsSection key="skills" skills={skills} />;
              case 'projects':
                return <ProjectsSection key="projects" projects={projects} />;
              case 'contact':
                return <ContactSection key="contact" />;
              default:
                return null;
            }
          })}
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

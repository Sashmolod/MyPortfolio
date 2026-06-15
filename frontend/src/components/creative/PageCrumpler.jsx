import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { soundSynth } from '../../utils/audioSynth';
import { usePortfolioSettings } from '../../contexts/SettingsContext';

export default function PageCrumpler() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { settings } = usePortfolioSettings();
  const navigate = useNavigate();
  const [pendingCallback, setPendingCallback] = useState(null);

  useEffect(() => {
    const handleTransition = (e) => {
      if (!settings?.enableCrumpledPageTransition) {
        // If settings are disabled or not loaded, skip animation
        if (e.detail?.to) {
          navigate(e.detail.to);
        } else if (e.detail?.action) {
          e.detail.action();
        }
        return;
      }

      soundSynth.playCrumple();
      setIsAnimating(true);

      const callback = () => {
        if (e.detail?.to) {
          navigate(e.detail.to);
        } else if (e.detail?.action) {
          e.detail.action();
        }
      };
      setPendingCallback(() => callback);
    };

    window.addEventListener('page-crumple-transition', handleTransition);
    return () =>
      window.removeEventListener('page-crumple-transition', handleTransition);
  }, [settings, navigate]);

  const handleAnimationComplete = () => {
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
    setTimeout(() => {
      setIsAnimating(false);
    }, 150);
  };

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999, // Sit above everything
            background: 'rgba(0,0,0,0.06)',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Crumpling sheet paper ball */}
          <motion.div
            initial={{
              width: '100vw',
              height: '100vh',
              borderRadius: '0px',
              scale: 1,
              rotate: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              width: ['100vw', '180px', '70px', '70px'],
              height: ['100vh', '180px', '70px', '70px'],
              borderRadius: ['0px', '30px', '50%', '50%'],
              scale: [1, 0.8, 0.4, 0],
              rotate: [0, 45, 180, 360],
              x: [0, 90, 240, 800],
              y: [0, -60, -180, -600],
            }}
            transition={{
              duration: 1.1,
              times: [0, 0.4, 0.7, 1],
              ease: 'easeInOut',
            }}
            onAnimationComplete={handleAnimationComplete}
            style={{
              background: 'var(--card-bg)',
              border: 'var(--border-style)',
              borderStyle: 'solid',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Sketchy crinkled wrinkles inside the paper ball */}
            <svg
              viewBox="0 0 100 100"
              width="100%"
              height="100%"
              style={{ opacity: 0.5 }}
            >
              <path
                d="M 10 30 Q 30 20, 50 40 T 90 20 M 20 80 Q 40 60, 60 70 T 80 50"
                fill="none"
                stroke="var(--text)"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <path
                d="M 40 10 Q 50 40, 30 70 T 50 90 M 70 20 Q 60 50, 80 80"
                fill="none"
                stroke="var(--text)"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

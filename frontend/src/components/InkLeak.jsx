import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundSynth } from '../utils/audioSynth';

export default function InkLeak() {
  const [stage, setStage] = useState('idle'); // 'idle', 'falling', 'blot', 'scattering'
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [shatterDots, setShatterDots] = useState([]);

  useEffect(() => {
    const handleInkLeakTriggered = (e) => {
      if (stage !== 'idle') return;

      const x = e.detail?.x || window.innerWidth / 2;
      const y = e.detail?.y || 50;

      setClickPos({ x, y });
      setStage('falling');
    };

    window.addEventListener('ink-leak-triggered', handleInkLeakTriggered);
    return () =>
      window.removeEventListener('ink-leak-triggered', handleInkLeakTriggered);
  }, [stage]);

  // When droplet hits landing Y, turn into blot
  const handleFallComplete = () => {
    soundSynth.playSplat();
    setStage('blot');
  };

  const handleBlotClick = () => {
    soundSynth.playPop();

    // Generate scatter vectors
    const dots = Array.from({ length: 7 }).map((_, i) => {
      const angle = (i * 360) / 7 + Math.random() * 15;
      const distance = 120 + Math.random() * 60;
      return {
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        size: 8 + Math.random() * 6,
      };
    });

    setShatterDots(dots);
    setStage('scattering');

    // Return to idle after animation
    setTimeout(() => {
      setStage('idle');
      setShatterDots([]);
    }, 1200);
  };

  const landingY = clickPos.y + 180; // Falls 180px down

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: stage === 'idle' ? 'none' : 'auto',
        zIndex: 99999, // very high layer
      }}
    >
      <AnimatePresence>
        {/* 1. Falling Droplet */}
        {stage === 'falling' && (
          <motion.div
            initial={{ x: clickPos.x, y: clickPos.y, scaleY: 1.4, scaleX: 0.8 }}
            animate={{
              y: landingY,
              scaleY: [1.4, 1.1, 1],
              scaleX: [0.8, 0.95, 1],
            }}
            exit={{ scale: 0 }}
            onAnimationComplete={handleFallComplete}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              width: '16px',
              height: '22px',
              background: 'var(--text)',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              marginLeft: '-8px',
              marginTop: '-11px',
            }}
          />
        )}

        {/* 2. Ink Blot */}
        {stage === 'blot' && (
          <motion.div
            initial={{ x: clickPos.x, y: landingY, scale: 0.1, rotate: 0 }}
            animate={{ scale: 1, rotate: [0, 5, -3, 0] }}
            role="button"
            tabIndex={0}
            aria-label="Ink blot. Click to pop and scatter."
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBlotClick();
              }
            }}
            style={{
              position: 'absolute',
              marginLeft: '-55px',
              marginTop: '-55px',
              cursor: 'pointer',
            }}
            onClick={handleBlotClick}
          >
            <svg viewBox="0 0 110 110" width="110" height="110">
              <path
                d="M 55 15 
                   C 70 8, 85 22, 92 38 
                   C 98 52, 90 70, 82 85 
                   C 72 98, 52 92, 38 88 
                   C 22 83, 10 65, 18 48 
                   C 25 32, 38 20, 55 15 Z"
                fill="var(--text)"
                style={{ filter: 'url(#wobblyFilterInk)' }}
              />
              {/* Outer splash dots */}
              <circle cx="98" cy="80" r="3.5" fill="var(--text)" />
              <circle cx="12" cy="30" r="2.5" fill="var(--text)" />
              <circle cx="45" cy="100" r="3.2" fill="var(--text)" />
              <circle cx="85" cy="15" r="2" fill="var(--text)" />

              {/* Two cute white dots for eyes in the blot to make it look alive */}
              <circle cx="50" cy="50" r="3.5" fill="var(--card-bg)" />
              <circle cx="60" cy="50" r="3.5" fill="var(--card-bg)" />
              <circle cx="50" cy="50" r="1.5" fill="var(--text)" />
              <circle cx="60" cy="50" r="1.5" fill="var(--text)" />

              <defs>
                <filter
                  id="wobblyFilterInk"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.06"
                    numOctaves="3"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
            </svg>
          </motion.div>
        )}

        {/* 3. Scattering Droplets */}
        {stage === 'scattering' && (
          <div
            style={{ position: 'absolute', left: clickPos.x, top: landingY }}
          >
            {shatterDots.map((dot) => (
              <motion.div
                key={dot.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: dot.x,
                  y: dot.y,
                  scale: [1, 0.8, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  background: 'var(--text)',
                  borderRadius: '50%',
                  marginLeft: `-${dot.size / 2}px`,
                  marginTop: `-${dot.size / 2}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Micro eyes on flying droplets */}
                {dot.size > 10 && (
                  <div style={{ display: 'flex', gap: '1px' }}>
                    <div
                      style={{
                        width: '2.5px',
                        height: '2.5px',
                        background: 'var(--card-bg)',
                        borderRadius: '50%',
                      }}
                    />
                    <div
                      style={{
                        width: '2.5px',
                        height: '2.5px',
                        background: 'var(--card-bg)',
                        borderRadius: '50%',
                      }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

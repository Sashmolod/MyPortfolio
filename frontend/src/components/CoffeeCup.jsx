import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundSynth } from '../utils/audioSynth';

export default function CoffeeCup() {
  const [clicks, setClicks] = useState(0);
  const [isSpilled, setIsSpilled] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (isSpilled) {
      // Reset cup
      soundSynth.playPop();
      setClicks(0);
      setIsSpilled(false);
      return;
    }

    const nextClicks = clicks + 1;
    setClicks(nextClicks);

    if (nextClicks >= 5) {
      soundSynth.playSplat();
      setIsSpilled(true);
    } else {
      soundSynth.playSlosh();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '40px auto 20px auto',
        width: '180px',
        height: '120px',
        userSelect: 'none',
        zIndex: 100
      }}
    >
      {/* Coffee Puddle SVG (appears when spilled) */}
      <AnimatePresence>
        {isSpilled && (
          <motion.svg
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            transition={{ duration: 0.4 }}
            viewBox="0 0 150 60"
            width="150"
            height="60"
            style={{
              position: 'absolute',
              left: '45px',
              top: '50px',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            {/* Sketchy Coffee Puddle */}
            <path
              d="M 10 30 Q 30 10, 70 15 Q 110 10, 130 25 Q 145 40, 110 50 Q 75 45, 40 52 Q 5 45, 10 30 Z"
              fill="rgba(139, 92, 26, 0.25)" // Coffee color translucent
              stroke="rgba(139, 92, 26, 0.7)"
              strokeWidth="2"
              strokeDasharray="4 3"
              style={{ filter: "url(#wobblyFilter)" }}
            />
            {/* Small Splats */}
            <circle cx="120" cy="18" r="2.5" fill="rgba(139, 92, 26, 0.5)" />
            <circle cx="25" cy="48" r="3.5" fill="rgba(139, 92, 26, 0.5)" />
            <circle cx="140" cy="40" r="1.5" fill="rgba(139, 92, 26, 0.5)" />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Coffee Cup Container */}
      <motion.div
        style={{
          zIndex: 2,
          cursor: 'pointer',
          originX: 0.5,
          originY: 0.8
        }}
        onClick={handleClick}
        animate={
          isSpilled
            ? { rotate: -75, x: -35, y: 15 }
            : isShaking
            ? { x: [0, -6, 6, -6, 6, 0], y: [0, -3, 0, -3, 0] }
            : { y: 0 }
        }
        transition={isShaking ? { duration: 0.4 } : { duration: 0.3 }}
        whileHover={{ scale: isSpilled ? 1 : 1.08 }}
      >
        <svg
          viewBox="0 0 80 80"
          width="70"
          height="70"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Steam (animates when upright) */}
          {!isSpilled && (
            <g opacity="0.65" stroke="var(--text)" strokeWidth="1.5" fill="none">
              <path d="M 32 15 Q 35 8, 32 2">
                <animate attributeName="d" values="M 32 15 Q 35 8, 32 2;M 32 15 Q 29 8, 32 2;M 32 15 Q 35 8, 32 2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 42 16 Q 45 9, 42 3">
                <animate attributeName="d" values="M 42 16 Q 45 9, 42 3;M 42 16 Q 39 9, 42 3;M 42 16 Q 45 9, 42 3" dur="2.3s" repeatCount="indefinite" />
              </path>
            </g>
          )}

          {/* Cup Body */}
          <path
            d="M 20 20 L 25 60 Q 40 68, 55 60 L 60 20 Z"
            fill="var(--card-bg)"
            stroke="var(--text)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            style={{ filter: "url(#wobblyFilter)" }}
          />

          {/* Coffee liquid inside (rim) */}
          {!isSpilled && (
            <ellipse
              cx="40"
              cy="20"
              rx="18"
              ry="4"
              fill="rgba(139, 92, 26, 0.85)"
              stroke="var(--text)"
              strokeWidth="2.5"
            />
          )}

          {/* Cup Handle */}
          <path
            d="M 57 28 Q 72 32, 68 45 Q 64 54, 54 50"
            fill="none"
            stroke="var(--text)"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: "url(#wobblyFilter)" }}
          />

          {/* Plate / Saucer */}
          {!isSpilled && (
            <path
              d="M 12 66 Q 40 76, 68 66 Q 72 63, 68 63 L 12 63 Z"
              fill="var(--card-bg)"
              stroke="var(--text)"
              strokeWidth="3"
              strokeLinejoin="round"
              style={{ filter: "url(#wobblyFilter)" }}
            />
          )}

          {/* Coffee Splashes spilling out (animated trigger) */}
          {isSpilled && (
            <path
              d="M 20 20 Q 15 15, 10 18 M 22 25 Q 12 28, 8 24 M 24 32 Q 14 36, 12 40"
              fill="none"
              stroke="rgba(139, 92, 26, 0.85)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </motion.div>

      {/* Label Helper */}
      <span style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px', pointerEvents: 'none', textAlign: 'center', fontFamily: "'Comic Neue', cursive" }}>
        {isSpilled ? "Oops! Spilled (Click to Reset)" : `☕ Coffee break (${clicks}/5 clicks)`}
      </span>
    </div>
  );
}

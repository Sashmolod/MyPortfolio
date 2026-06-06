import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundSynth } from '../utils/audioSynth';

const DOODLY_QUOTES = [
  "Привет! Я скрепка Дудли. 📎 Помогу оживить твой день!",
  "Попробуй покликать на кружку кофе в самом низу страницы... Только осторожно! ☕",
  "Если включить карандаш, можно нарисовать усы разработчику на аватаре! 🥸",
  "Слышишь этот шуршащий звук карандаша? Чистый релакс... ✏️",
  "Когда режим рисования включен, клики по ссылкам отключены. Выключи его, чтобы ходить по сайту!",
  "А вы знали, что баги в коде боятся щекотки? 🪱",
  "CSS Grid — это как тетрадь в клеточку, размечать страницы одно удовольствие!",
  "Кстати, в админке появилась полноценная галерея картинок! Удобно, правда?",
  "Не забудьте заглянуть в раздел Projects, там спрятаны скриншоты проектов в стиле набросков!",
  "Ого, какой красивый рисунок на полях! Повесишь его на холодильник? 🎨",
  "Программирование — это на 10% написание кода и на 90% разглядывание монитора. 🖥️"
];

export default function DoodlyHelper() {
  const [bubbleText, setBubbleText] = useState("");
  const [isWaving, setIsWaving] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(false);

  // Greet user shortly after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      showQuote("Привет! Нажми на меня, чтобы поболтать или услышать шутку! 📎");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const showQuote = (text) => {
    soundSynth.playPop();
    setBubbleText(text || DOODLY_QUOTES[Math.floor(Math.random() * DOODLY_QUOTES.length)]);
    setActiveSpeech(true);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
  };

  const handleClick = () => {
    showQuote(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 100003, // Above canvas and other controls
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}
    >
      {/* Paperclip Character */}
      <motion.div
        className="doodly-character"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        onClick={handleClick}
        animate={isWaving ? {
          rotate: [0, -15, 10, -10, 5, 0],
          y: [0, -10, 0, -5, 0]
        } : {
          y: [0, -2, 0]
        }}
        transition={isWaving ? {
          duration: 0.8
        } : {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
      >
        <svg
          viewBox="0 0 60 100"
          width="50"
          height="80"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sketchy paperclip body */}
          <path
            d="M 30 10 C 10 10, 10 90, 30 90 C 45 90, 45 35, 30 35 C 20 35, 20 75, 30 75 C 36 75, 36 50, 30 50"
            fill="none"
            stroke="var(--text)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "url(#wobblyFilter)" }}
          />

          {/* Eyes */}
          <ellipse cx="25" cy="22" rx="4" ry="5" fill="var(--text)" />
          <ellipse cx="37" cy="22" rx="4" ry="5" fill="var(--text)" />
          {/* Pupils */}
          <circle cx="26" cy="21" r="1.2" fill="var(--card-bg)" />
          <circle cx="38" cy="21" r="1.2" fill="var(--card-bg)" />

          {/* Friendly Smile */}
          <path
            d="M 27 30 Q 31 34, 35 30"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Blush */}
          <circle cx="21" cy="28" r="2.5" fill="rgba(239, 68, 68, 0.4)" />
          <circle cx="41" cy="28" r="2.5" fill="rgba(239, 68, 68, 0.4)" />

          {/* Filters for sketchy look */}
          <defs>
            <filter id="wobblyFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      </motion.div>

      {/* Wobbly Speech Bubble */}
      <AnimatePresence>
        {activeSpeech && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, x: -20, y: 10 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, x: -20, y: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              pointerEvents: 'auto',
              marginLeft: '12px',
              marginBottom: '35px',
              background: 'var(--card-bg)',
              border: 'var(--border-style)',
              borderStyle: 'solid',
              borderRadius: 'var(--sketch-radius-2)',
              padding: '10px 14px',
              boxShadow: 'var(--shadow)',
              maxWidth: '220px',
              fontFamily: "'Architects Daughter', cursive",
              fontSize: '12px',
              lineHeight: '1.4',
              color: 'var(--text)',
              position: 'relative'
            }}
          >
            {bubbleText}
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveSpeech(false);
              }}
              style={{
                position: 'absolute',
                top: '2px',
                right: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                color: 'var(--text)',
                opacity: 0.5
              }}
            >
              ✕
            </button>
            {/* Wobbly Speech Bubble Tail */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '-10px',
                width: '0',
                height: '0',
                borderTop: '6px solid transparent',
                borderRight: '10px solid var(--text)',
                borderBottom: '6px solid transparent',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '11px',
                left: '-8px',
                width: '0',
                height: '0',
                borderTop: '5px solid transparent',
                borderRight: '8px solid var(--card-bg)',
                borderBottom: '5px solid transparent',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

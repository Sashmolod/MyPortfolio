import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundSynth } from '../utils/audioSynth';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const DOODLY_QUOTES = [
  'Привет! Я скрепка-интеллектуал Дудли. 🎓 Помогу настроить работу и поделюсь знаниями! / Hi! I am Doodly, the intellectual paperclip. 🎓 I will help you set up and share some knowledge!',
  'Попробуй покликать на кружку кофе в самом низу страницы... Только осторожно! ☕ / Try clicking on the coffee cup at the bottom of the page... Just be careful! ☕',
  'Если включить карандаш, можно нарисовать усы разработчику на аватаре! 🥸 / If you enable the pencil, you can draw a mustache on the developer avatar! 🥸',
  'Слышишь этот шуршащий звук карандаша? Чистый релакс... ✏️ / Do you hear that rustling sound of the pencil? Pure relaxation... ✏️',
  'Когда режим рисования включен, клики по ссылкам отключены. Выключи его, чтобы ходить по сайту! / When drawing mode is active, clicking on links is disabled. Turn it off to browse the site!',
  'А вы знали, что баги в коде боятся щекотки? 🪱 / Did you know that bugs in the code are afraid of being tickled? 🪱',
  'CSS Grid — это как тетрадь в клеточку, размечать страницы одно удовольствие! / CSS Grid is like a squared notebook, a pure pleasure to layout pages!',
  'Кстати, в админке появилась полноценная галерея картинок! Удобно, правда? / By the way, there is a full image gallery in the admin dashboard! Handy, right?',
  'Не забудьте заглянуть в раздел Projects, там спрятаны скриншоты проектов в стиле набросков! / Do not forget to check the Projects section, sketch-style project screenshots are hidden there!',
  'Ого, какой отличный результат на листе! Заслуживает твердой A+! 📝 / Wow, what a great result on the paper! Deserves a solid A+! 📝',
  'Программирование — это на 10% написание кода и на 90% разглядывание монитора. 🖥️ / Programming is 10% writing code and 90% staring at the screen. 🖥️',
];

export default function DoodlyHelper() {
  const { t } = useLanguage();
  const [bubbleText, setBubbleText] = useState('');
  const [isWaving, setIsWaving] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const isFirstRender = useRef(true);

  // Greet user shortly after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      showQuote(
        'Привет! Нажми на меня, чтобы поболтать или услышать шутку! 🎓 / Hi! Click on me to chat or hear a joke! 🎓'
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // React to theme changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (theme === 'dark') {
      showQuote(
        'Ого, включили синьку (чертёж)! Всё светится, как на доске инженера! 📐 / Wow, blueprint theme enabled! Everything glows like on an engineer board! 📐'
      );
    } else {
      showQuote('Кремовая бумага — классика! Глазам сразу приятнее. 📄 / Cream paper is a classic! Instantly easier on the eyes. 📄');
    }
  }, [theme]);

  // Listen to canvas guess events
  useEffect(() => {
    const handleGuessStart = () => {
      setBubbleText(t('Так-так-так... Посмотрим на твой шедевр! Угадываю... 🎨 / Well, well, well... Let\'s look at your masterpiece! Guessing... 🎨'));
      setActiveSpeech(true);
      setIsLoading(true);
      setIsWaving(true);
    };

    const handleGuessResult = (e) => {
      setIsLoading(false);
      setBubbleText(e.detail.guess || t('Хм-м, не могу распознать рисунок... / Hmm, I cannot recognize the drawing...'));
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 800);
    };

    window.addEventListener('doodly-guess-start', handleGuessStart);
    window.addEventListener('doodly-guess-result', handleGuessResult);

    return () => {
      window.removeEventListener('doodly-guess-start', handleGuessStart);
      window.removeEventListener('doodly-guess-result', handleGuessResult);
    };
  }, []);

  // Listen to all contextual commentator events
  useEffect(() => {
    const handleDrawStart = () => {
      showQuote(
        'О, рисуешь на полях? Рисуй-рисуй, а потом нажми «Дудли, угадай!» — я попробую отгадать твой шедевр! 🎨 / Oh, drawing on the margins? Keep drawing, then click "Doodly, guess!" — I will try to guess your masterpiece! 🎨'
      );
    };

    const handleCoffeeSlosh = () => {
      showQuote('Осторожнее с кофе! ☕ Я же бумажный, размокну мигом! / Be careful with that coffee! ☕ I am made of paper, I will get soaked instantly!');
    };

    const handleCoffeeSpill = () => {
      showQuote(
        'А-а-а! Кофе пролился! ☕ Бумага промокла! Быстрее кликни по кружке, чтобы всё вытереть! / Oh no! Coffee spilled! ☕ The paper got wet! Quick, click the cup to wipe it all up!'
      );
    };

    const handleBugSquashed = () => {
      showQuote(
        'Бедный жучок! Он просто хотел почитать про твои навыки в React... 🪲 / Poor little bug! It just wanted to read about your React skills... 🪲'
      );
    };

    const handleTttStart = () => {
      showQuote('Сыграем в крестики-нолики? Мой ход! Ставлю нолик... 🎓 / Shall we play Tic-Tac-Toe? My move! Placing an O... 🎓');
    };

    const handleTttWinDoodly = () => {
      showQuote('Ха-ха! Умная скрепка побеждает человека! 🏆 Сыграем ещё? / Haha! The smart paperclip beats the human! 🏆 Play again?');
    };

    const handleTttWinUser = () => {
      showQuote(
        'Ладно, твоя победа. Но это потому, что у меня нет пальцев держать карандаш! 😅 / Alright, you win. But that is only because I do not have fingers to hold a pencil! 😅'
      );
    };

    const handleTttDraw = () => {
      showQuote(
        'Ничья! Дружба победила... или бумага на полях закончилась! 🤝 / A draw! Friendship wins... or we ran out of paper on the margins! 🤝'
      );
    };

    const handleProjectHover = (e) => {
      const title = e.detail?.title || 'проектом';
      showQuote(
        `Интересуешься проектом «${title}»? У него очень крутой стек, загляни внутрь! 💻 / Interested in the "${title}" project? It has a very cool stack, check it out! 💻`
      );
    };

    const handleCopy = () => {
      showQuote(
        'Опа, копируешь? Надеюсь, это для твоего резюме, а не плагиат! 😉 / Whoa, copying? I hope it is for your resume and not plagiarism! 😉'
      );
    };

    const handleFormFocus = () => {
      showQuote(
        'Пишешь письмо? Напиши что-нибудь приятное, а я лично доставлю его самолётиком! ✈️ / Writing a letter? Write something nice, and I will personally deliver it as a paper plane! ✈️'
      );
    };

    const handleFormSent = () => {
      showQuote(
        'Полетел самолётик! ✈️ Надеюсь, попутный ветер донесёт его до почты! / The plane is off! ✈️ Hopefully a tailwind carries it to the mailbox!'
      );
    };

    const handleInkLeak = () => {
      showQuote(
        'Ой-ой! Ручка протекла! 🖋️ Быстрее тыкни по кляксе, пока чернила не залили всё портфолио! / Uh-oh! The pen leaked! 🖋️ Quick, tap the ink blot before it floods the entire portfolio!'
      );
    };

    const handleDoodlyErased = () => {
      showQuote('Эй! Не стирай меня! Я же бумажный, исчезну мигом! 😱 / Hey! Do not erase me! I am made of paper, I will disappear in no time! 😱');
    };

    window.addEventListener('doodle-draw-start', handleDrawStart);
    window.addEventListener('coffee-slosh', handleCoffeeSlosh);
    window.addEventListener('coffee-spill', handleCoffeeSpill);
    window.addEventListener('bug-squashed', handleBugSquashed);
    window.addEventListener('ttt-start', handleTttStart);
    window.addEventListener('ttt-win-doodly', handleTttWinDoodly);
    window.addEventListener('ttt-win-user', handleTttWinUser);
    window.addEventListener('ttt-draw', handleTttDraw);
    window.addEventListener('project-hover', handleProjectHover);
    window.addEventListener('form-focus', handleFormFocus);
    window.addEventListener('form-airplane-sent', handleFormSent);
    window.addEventListener('ink-leak-triggered', handleInkLeak);
    window.addEventListener('doodly-erased', handleDoodlyErased);
    document.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('doodle-draw-start', handleDrawStart);
      window.removeEventListener('coffee-slosh', handleCoffeeSlosh);
      window.removeEventListener('coffee-spill', handleCoffeeSpill);
      window.removeEventListener('bug-squashed', handleBugSquashed);
      window.removeEventListener('ttt-start', handleTttStart);
      window.removeEventListener('ttt-win-doodly', handleTttWinDoodly);
      window.removeEventListener('ttt-win-user', handleTttWinUser);
      window.removeEventListener('ttt-draw', handleTttDraw);
      window.removeEventListener('project-hover', handleProjectHover);
      window.removeEventListener('form-focus', handleFormFocus);
      window.removeEventListener('form-airplane-sent', handleFormSent);
      window.removeEventListener('ink-leak-triggered', handleInkLeak);
      window.removeEventListener('doodly-erased', handleDoodlyErased);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  const showQuote = (text) => {
    soundSynth.playPop();
    const rawQuote = text || DOODLY_QUOTES[Math.floor(Math.random() * DOODLY_QUOTES.length)];
    setBubbleText(t(rawQuote));
    setActiveSpeech(true);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
  };

  const handleClick = () => {
    setInputValue('');
    showQuote(null);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    soundSynth.playPop();

    try {
      const response = await fetch('/api/portfolio/doodly/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setBubbleText(data.response);
      soundSynth.playPop();
    } catch (err) {
      console.error(err);
      setBubbleText(
        t('Ой, у меня карандаш сломался во время размышлений... Попробуй еще раз! ✏️ / Oops, my pencil broke while thinking... Try again! ✏️')
      );
    } finally {
      setIsLoading(false);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 800);
    }
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
        pointerEvents: 'none',
      }}
    >
      {/* Smart Clip Character */}
      <motion.div
        className="doodly-character"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        onClick={handleClick}
        animate={
          isWaving
            ? {
                rotate: [0, -10, 10, -5, 5, 0],
                y: [0, -12, 0, -6, 0],
              }
            : {
                y: [0, -2, 0],
              }
        }
        transition={
          isWaving
            ? {
                duration: 0.8,
              }
            : {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        whileHover={{ scale: 1.1 }}
      >
        <svg
          viewBox="0 0 76 100"
          width="68"
          height="90"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sketchy paperclip body */}
          <path
            d="M 33 10 C 13 10, 13 90, 33 90 C 48 90, 48 35, 33 35 C 23 35, 23 75, 33 75 C 39 75, 39 50, 33 50"
            fill="none"
            stroke="var(--text)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'url(#wobblyFilter)' }}
          />

          {/* Left Lens & Right Lens of Glasses */}
          <circle
            cx="26"
            cy="22"
            r="6.5"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            style={{ filter: 'url(#wobblyFilter)' }}
          />
          <circle
            cx="40"
            cy="22"
            r="6.5"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            style={{ filter: 'url(#wobblyFilter)' }}
          />
          {/* Glasses Bridge */}
          <path
            d="M 32.5 22 Q 33 20.5, 33.5 22"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Glasses Temples (legs extending back) */}
          <path
            d="M 19.5 22 Q 15 21, 12 24"
            fill="none"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 46.5 22 Q 51 21, 54 24"
            fill="none"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Eyes (inside glasses) */}
          <circle cx="26" cy="22" r="2" fill="var(--text)" />
          <circle cx="40" cy="22" r="2" fill="var(--text)" />
          {/* White reflections */}
          <circle cx="27" cy="21" r="0.7" fill="var(--card-bg)" />
          <circle cx="41" cy="21" r="0.7" fill="var(--card-bg)" />

          {/* Blush */}
          <circle cx="18" cy="28" r="2" fill="rgba(239, 68, 68, 0.4)" />
          <circle cx="48" cy="28" r="2" fill="rgba(239, 68, 68, 0.4)" />

          {/* Friendly Smile */}
          <path
            d="M 30 28 Q 33 31, 36 28"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bow Tie (at y = 43) */}
          {/* Left wing */}
          <path
            d="M 33 43 L 26 39 L 26 47 Z"
            fill="var(--primary)"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right wing */}
          <path
            d="M 33 43 L 40 39 L 40 47 Z"
            fill="var(--primary)"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center knot */}
          <circle
            cx="33"
            cy="43"
            r="2.5"
            fill="var(--primary)"
            stroke="var(--text)"
            strokeWidth="1.5"
          />

          {/* Left Arm & Pencil */}
          <path
            d="M 23 48 Q 14 51, 9 47"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ filter: 'url(#wobblyFilter)' }}
          />
          {/* Pencil (tip at 3, 53) */}
          <path
            d="M 9 43 L 5 50 L 4 53 L 6 52 L 10 45 Z"
            fill="var(--secondary)"
            stroke="var(--text)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Pencil lead tip */}
          <path d="M 4 53 L 4 50 L 6 52 Z" fill="var(--text)" />

          {/* Right Arm & Paper Sheet (A+) */}
          <path
            d="M 42 52 Q 50 55, 55 52"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ filter: 'url(#wobblyFilter)' }}
          />
          {/* Paper Sheet */}
          <path
            d="M 55 44 L 69 42 L 72 60 L 58 62 Z"
            fill="var(--card-bg)"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ filter: 'url(#wobblyFilter)' }}
          />
          {/* Paper Lines */}
          <path
            d="M 58 49 L 64 48 M 58 53 L 63 52 M 59 57 L 65 56"
            fill="none"
            stroke="var(--text)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* A+ Text */}
          <text
            x="64"
            y="58"
            fill="var(--primary)"
            fontSize="8"
            fontWeight="bold"
            fontFamily="'Architects Daughter', cursive"
            transform="rotate(-5, 64, 58)"
          >
            A+
          </text>

          {/* Filters for sketchy look */}
          <defs>
            <filter
              id="wobblyFilter"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="3"
                xChannelSelector="R"
                yChannelSelector="G"
              />
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
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              pointerEvents: 'auto',
              marginLeft: '12px',
              marginBottom: '35px',
              background: 'var(--card-bg)',
              border: 'var(--border-style)',
              borderStyle: 'solid',
              borderRadius: 'var(--sketch-radius-2)',
              padding: '12px 14px 10px 14px',
              boxShadow: 'var(--shadow)',
              maxWidth: '220px',
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              lineHeight: '1.4',
              color: 'var(--text)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                wordBreak: 'break-word',
                paddingRight: '10px',
                minHeight: '30px',
              }}
            >
              {isLoading ? (
                <div
                  style={{ display: 'flex', gap: '3px', alignItems: 'center' }}
                >
                  <span>{t('Размышляю / Thinking')}</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    •
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    •
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    style={{ fontWeight: 'bold' }}
                  >
                    •
                  </motion.span>
                </div>
              ) : (
                bubbleText
              )}
            </div>

            {/* Chat Input Field at the bottom of the speech bubble */}
            <form
              onSubmit={handleChatSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '6px',
                borderTop: '1px dashed var(--text)',
                paddingTop: '6px',
                width: '100%',
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={t('Спроси меня... / Ask me...')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-family)',
                  fontSize: '11px',
                  color: 'var(--text)',
                  padding: '2px 0',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                  opacity: isLoading || !inputValue.trim() ? 0.3 : 0.8,
                }}
              >
                ➔
              </button>
            </form>
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
                opacity: 0.5,
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

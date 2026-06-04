/**
 * Набор SVG-иллюстраций для портфолио
 */

// Иконка браузера/разработчика
export function DeveloperIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
    >
      {/* Фон - круг */}
      <circle cx="200" cy="200" r="180" fill="url(#bgGrad)" opacity="0.1" />
      
      {/* Монитор */}
      <rect x="100" y="80" width="200" height="140" rx="10" fill="url(#monitorGrad)" />
      <rect x="110" y="90" width="180" height="110" rx="5" fill="#1a1a2e" />
      
      {/* Код на экране */}
      <text x="125" y="115" fill="#667eea" fontSize="10" fontFamily="monospace">{'<Dev>'}</text>
      <text x="125" y="135" fill="#94a3b8" fontSize="9" fontFamily="monospace">{`{`}</text>
      <text x="135" y="150" fill="#f59e0b" fontSize="9" fontFamily="monospace">name</text>
      <text x="170" y="150" fill="#6ee7b7" fontSize="9" fontFamily="monospace">= "Dev"</text>
      <text x="125" y="168" fill="#6ee7b7" fontSize="9" fontFamily="monospace">skills</text>
      <text x="170" y="168" fill="#a78bfa" fontSize="9" fontFamily="monospace">= [⚡, 🚀]</text>
      <text x="125" y="188" fill="#94a3b8" fontSize="9" fontFamily="monospace">{`}`}</text>
      
      {/* Подставка монитора */}
      <rect x="170" y="220" width="60" height="10" rx="2" fill="#4a5568" />
      <rect x="150" y="230" width="100" height="8" rx="4" fill="#2d3748" />
      
      {/* Кофе/чай */}
      <ellipse cx="320" cy="260" rx="20" ry="5" fill="#4a5568" />
      <rect x="305" y="220" width="30" height="40" rx="3" fill="#e2e8f0" />
      <ellipse cx="320" cy="220" rx="15" ry="3" fill="#92400e" />
      {/* Пар */}
      <path d="M315 215 Q317 208 315 200" stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity="0.6">
        <animate attributeName="d" values="M315 215 Q317 208 315 200;M315 215 Q313 208 315 200;M315 215 Q317 208 315 200" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M325 213 Q327 206 325 198" stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity="0.4">
        <animate attributeName="d" values="M325 213 Q327 206 325 198;M325 213 Q323 206 325 198;M325 213 Q327 206 325 198" dur="2.5s" repeatCount="indefinite" />
      </path>
      
      {/* Клавиатура */}
      <rect x="120" y="260" width="160" height="50" rx="5" fill="#4a5568" />
      {[0,1,2,3,4,5].map(i => (
        <rect key={`r${i}`} x={135 + i * 22} y="268" width="16" height="8" rx="2" fill="#718096" />
      ))}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={`k${i}`} x={133 + i * 21} y="280" width="16" height="8" rx="2" fill="#718096" />
      ))}
      
      {/* Блик */}
      <path d="M110 90 Q200 85 290 90 L290 100 Q200 95 110 100 Z" fill="white" opacity="0.1" />
      
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="monitorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Иконка технологий (шестерёнки/код)
export function TechIcon({ color = '#667eea', size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.7 7.3L10 12L14.7 16.7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 18.5L4.5 14L9 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

// Иконка React (атом)
export function ReactIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(0 12 12)" opacity="0.7" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)" opacity="0.7" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)" opacity="0.7" />
    </svg>
  );
}

// Иконка Node.js (зелёный лист/запись)
export function NodeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4.5 6.5V17.5L12 22L19.5 17.5V6.5L12 2Z" stroke="#68A063" strokeWidth="1.5" fill="none" />
      <path d="M12 8V16" stroke="#68A063" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11L15 11" stroke="#68A063" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Иконка Python (змея/код)
export function PythonIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 8.5 5 8.5 5V7H12V9H6S2.5 9.5 2.5 14.5S5 22 9 22H10V20H9C7 20 7 17 7 17V12H11L12 11H16V9H8" fill="#3776AB" />
      <path d="M12 22C16 22 15.5 19 15.5 19V17H12V15H18S21.5 13.5 21.5 8.5 19 2 15 2H14V4H15C17 4 17 7 17 7V12H13L12 13H8V15H16" fill="#FFD435" />
    </svg>
  );
}

// Иконка базы данных (PostgreSQL)
export function DatabaseIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="5" rx="8" ry="3" stroke="#336791" strokeWidth="1.5" />
      <path d="M4 5V19C4 20.66 7.58 22 12 22C16.42 22 20 20.66 20 19V5" stroke="#336791" strokeWidth="1.5" />
      <path d="M4 12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12" stroke="#336791" strokeWidth="1.2" opacity="0.5" />
      <circle cx="9" cy="9" r="1" fill="#336791" opacity="0.4" />
      <circle cx="15" cy="9" r="1" fill="#336791" opacity="0.4" />
    </svg>
  );
}

// Иконка Docker (кит/контейнер)
export function DockerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" />
      <rect x="7.25" y="10" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" />
      <rect x="11.5" y="10" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" />
      <rect x="15.75" y="10" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" opacity="0.6" />
      <rect x="9.375" y="6.5" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" />
      <rect x="13.625" y="6.5" width="3.5" height="3.5" rx="0.5" fill="#0DB7ED" opacity="0.8" />
      <path d="M3 14C3 12.9 5 12 7 12C9 12 10 14 12 14C14 14 16 12 18 12C20 12 21 12.9 21 14V17C21 18.1 19 19 17 19H7C5 19 3 18.1 3 17V14Z" fill="#0DB7ED" opacity="0.5" />
    </svg>
  );
}

// Иконка SQL (таблица)
export function SqlIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#336791" strokeWidth="1.5" />
      <path d="M3 9H21" stroke="#336791" strokeWidth="1.2" />
      <path d="M3 15H21" stroke="#336791" strokeWidth="1.2" />
      <path d="M9 3V21" stroke="#336791" strokeWidth="1.2" />
      <circle cx="6" cy="6" r="1" fill="#f59e0b" />
      <rect x="11" y="5" width="4" height="2" rx="0.5" fill="#6ee7b7" opacity="0.6" />
      <rect x="11" y="11" width="6" height="2" rx="0.5" fill="#a78bfa" opacity="0.6" />
    </svg>
  );
}

// Иконка Rocket (проект/запуск)
export function RocketIcon({ size = 48, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Корпус ракеты */}
      <path d="M32 4C32 4 20 18 20 36L16 44H48L44 36C44 18 32 4 32 4Z" fill="url(#rocketGrad)" stroke="#e2e8f0" strokeWidth="1" />
      {/* Нос */}
      <path d="M32 4C32 4 26 12 26 20L32 24L38 20C38 12 32 4 32 4Z" fill="#667eea" opacity="0.5" />
      {/* Окно */}
      <circle cx="32" cy="28" r="5" fill="#1a1a2e" stroke="#667eea" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="3" fill="#667eea" opacity="0.3" />
      {/* Крылья */}
      <path d="M20 36L12 48H22L24 44" fill="#e53e3e" stroke="#c53030" strokeWidth="0.5" />
      <path d="M44 36L52 48H42L40 44" fill="#e53e3e" stroke="#c53030" strokeWidth="0.5" />
      {/* Пламя */}
      <path d="M24 44C24 44 26 52 32 56C38 52 40 44 40 44" fill="url(#flameGrad)" opacity="0.9">
        <animate attributeName="d" values="M24 44C24 44 26 52 32 56C38 52 40 44 40 44;M24 44C24 44 27 54 32 58C37 54 40 44 40 44;M24 44C24 44 26 52 32 56C38 52 40 44 40 44" dur="0.3s" repeatCount="indefinite" />
      </path>
      <defs>
        <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#a0aec0" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Иконка письма (контакт)
export function MailIcon({ size = 48, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Конверт */}
      <rect x="8" y="16" width="48" height="34" rx="4" fill="#4a5568" />
      <path d="M8 20L32 38L56 20" stroke="#667eea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Блик */}
      <path d="M8 20L32 38L56 20V50C56 52.2 54.2 54 52 54H12C9.8 54 8 52.2 8 50V20Z" fill="white" opacity="0.05" />
      {/* Анимация - волна */}
      <path d="M30 24L32 26L34 24" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// Иконка проекта (папка/документ)
export function ProjectIcon({ size = 48, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Папка */}
      <path d="M8 16C8 14.9 8.9 14 10 14H26L32 22H54C55.1 22 56 22.9 56 24V50C56 51.1 55.1 52 54 52H10C8.9 52 8 51.1 8 50V16Z" fill="url(#folderGrad)" stroke="#e2e8f0" strokeWidth="1" />
      {/* Вкладка */}
      <rect x="8" y="10" width="20" height="6" rx="2" fill="#718096" />
      {/* Контент внутри */}
      <rect x="14" y="30" width="24" height="4" rx="1" fill="#667eea" opacity="0.5" />
      <rect x="14" y="38" width="18" height="3" rx="1" fill="#94a3b8" opacity="0.4" />
      <rect x="14" y="44" width="20" height="3" rx="1" fill="#94a3b8" opacity="0.4" />
      <defs>
        <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#718096" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Иконка звезды (для навыков)
export function StarIcon({ size = 20, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

// Иконка кода (</>)
export function CodeIcon({ size = 48, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#1a1a2e" stroke="#667eea" strokeWidth="2" />
      <text x="14" y="30" fill="#667eea" fontSize="16" fontFamily="monospace" fontWeight="bold">{'<'}</text>
      <text x="34" y="30" fill="#f59e0b" fontSize="16" fontFamily="monospace" fontWeight="bold">{'}>'}</text>
      <rect x="14" y="38" width="36" height="4" rx="2" fill="#6ee7b7" opacity="0.3" />
    </svg>
  );
}

// Декоративные частицы/круги для фона
export function BackgroundParticles({ count = 15 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 400,
    y: Math.random() * 400,
    r: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <svg viewBox="0 0 400 400" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="#667eea"
          opacity="0.15"
        >
          <animate
            attributeName="cy"
            values={`${p.y};${p.y - 30};${p.y}`}
            dur={`${p.duration}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.1;0.25;0.1"
            dur={`${p.duration / 2}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

// Иконка галочки
export function CheckIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

// Иконка молнии (для социального блока)
export function LightningIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}
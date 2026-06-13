import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DeveloperIllustration, BackgroundParticles } from '../SvgIllustrations';
import heroImg from '../../assets/hero.png';

/**
 * Словарь со встроенными путями SVG для социальных сетей (эскизный стиль)
 */
const SOCIAL_ICONS = {
  github: {
    viewBox: '0 0 24 24',
    paths: (
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    ),
  },
  linkedin: {
    viewBox: '0 0 24 24',
    paths: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <path d="M8 11v6M8 8v.01M12 11v6M12 14c0-1.2 1-2 2.2-2 1.2 0 1.8.8 1.8 2v3" />
      </>
    ),
  },
  twitter: {
    viewBox: '0 0 24 24',
    paths: <path d="M4 4l7.5 10L4 20h3l6-8 5 8h3l-8-11L20 4h-3l-5 7-4-7H4z" />,
  },
  bluesky: {
    viewBox: '0 0 24 24',
    paths: (
      <path d="M12 8c-.8-2-3-5.5-6-6.5-2.5-1-3.5 1.5-1.5 4.5C6 8.5 9.5 11 12 11.5c-2.5.5-6 3-7.5 5.5-2 3-1 5.5 1.5 4.5 3-1 5.2-4.5 6-6.5.8 2 3 5.5 6 6.5 2.5 1 3.5-1.5 1.5-4.5-1.5-2.5-5-5-7.5-5.5 2.5-.5 6-3 7.5-5.5 2-3 1-5.5-1.5-4.5-3 1-5.2 4.5-6 6.5z" />
    ),
  },
  discord: {
    viewBox: '0 0 24 24',
    paths: (
      <path d="M19 5.5a14 14 0 00-3.5-1c-.1.3-.3.7-.4.9a13 13 0 00-6.2 0c-.1-.2-.3-.6-.4-.9A14 14 0 005 5.5C2.5 9 2 13 2.5 16.5a14 14 0 004.2 2.1c.4-.6.8-1.3 1.1-2a9 9 0 01-1.7-.8c.1-.1.2-.2.3-.3a13 13 0 0011.2 0c.1.1.2.2.3.3a9 9 0 01-1.7.8c.3.7.7 1.4 1.1 2a14 14 0 004.2-2.1C22 13 21.5 9 19 5.5z M8.5 13.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
    ),
  },
  documentation: {
    viewBox: '0 0 24 24',
    paths: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
  },
  telegram: {
    viewBox: '0 0 24 24',
    paths: (
      <path d="M21 5L2 12.5l7 2.5 1.5 5 3-4.5 5.5 3.5L21 5z M9 15l10-8.5L11.5 16" />
    ),
  },
  instagram: {
    viewBox: '0 0 24 24',
    paths: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </>
    ),
  },
};

/**
 * Компонент иконки социальной сети (рендерится напрямую в React)
 */
function SocialIcon({ name, size = 20 }) {
  const cleanName = name?.toLowerCase()?.trim() || '';
  const icon = SOCIAL_ICONS[cleanName];
  const [dynamicSvg, setDynamicSvg] = useState(null);

  useEffect(() => {
    // Если есть локальная скетч-иконка, загрузка не требуется
    if (icon) return;

    let isMounted = true;

    // Преобразуем имя в slug для Simple Icons (убираем пробелы и спецсимволы)
    const slug = cleanName.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

    fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`)
      .then((res) => {
        if (!res.ok) throw new Error('Icon not found');
        return res.text();
      })
      .then((svgText) => {
        if (!isMounted) return;

        // Извлекаем только внутреннее содержимое путей SVG, чтобы обернуть в наш стилизованный тэг
        const match = svgText.match(/<path[^>]*>/i);
        if (match) {
          const pathsContent = svgText.substring(
            svgText.indexOf('>') + 1,
            svgText.lastIndexOf('</svg>')
          );
          setDynamicSvg(pathsContent);
        } else {
          setDynamicSvg(svgText);
        }
      })
      .catch(() => {
        // Ошибка или иконка не найдена - остаемся на фолбеке
      });

    return () => {
      isMounted = false;
    };
  }, [cleanName, icon]);

  if (icon) {
    return (
      <svg
        viewBox={icon.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block', color: 'var(--text)' }}
      >
        {icon.paths}
      </svg>
    );
  }

  if (dynamicSvg) {
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block', color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: dynamicSvg }}
      />
    );
  }

  // Fallback: показываем первую букву названия
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: `${size}px`, height: `${size}px` }}
    >
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fill="currentColor"
        fontSize="12"
        fontWeight="bold"
      >
        {name?.[0]?.toUpperCase() || '?'}
      </text>
    </svg>
  );
}

export default function HeroSection({ data }) {
  const hero = data || {
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Passionate developer creating amazing web experiences.',
    avatar: '/hero.png',
    socialLinks: [],
  };

  const socialLinksFromData = hero.socialLinks || [];

  // Парсим ссылки из массива или объекта (для обратной совместимости)
  const parsedLinks = Array.isArray(socialLinksFromData)
    ? socialLinksFromData.map((link) => ({
        name: link.platform,
        url: link.url || '#',
      }))
    : Object.entries(socialLinksFromData)
        .filter(([_, url]) => url && url.trim() !== '')
        .map(([name, url]) => ({
          name,
          url,
        }));

  // Если ссылок в БД нет, показываем дефолтные
  const linksToRender =
    parsedLinks.length > 0
      ? parsedLinks
      : [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'LinkedIn', url: 'https://linkedin.com' },
          { name: 'Twitter', url: 'https://twitter.com' },
        ];

  return (
    <section id="home" className="hero">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{hero.name}</h1>
        <p className="subtitle">{hero.title}</p>
        <p>{hero.bio}</p>
        <div className="social-links">
          {linksToRender.map(({ name, url }) => {
            const title = name.charAt(0).toUpperCase() + name.slice(1);
            return (
              <a
                key={name}
                href={url}
                title={title}
                target="_blank"
                rel="noopener noreferrer"
                className="sketch-link social-link"
              >
                <SocialIcon name={name} size={20} />
              </a>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BackgroundParticles count={20} />
        {hero.avatar && hero.avatar !== '/favicon.svg' ? (
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: 'var(--sketch-radius-1)',
              overflow: 'hidden',
              border: 'var(--border-style)',
              boxShadow: 'var(--shadow)',
              background: 'var(--card-bg)',
              transition: 'border-radius 0.3s ease',
            }}
          >
            <img
              src={hero.avatar === '/hero.png' ? heroImg : hero.avatar}
              alt={hero.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <DeveloperIllustration />
        )}
      </motion.div>
    </section>
  );
}

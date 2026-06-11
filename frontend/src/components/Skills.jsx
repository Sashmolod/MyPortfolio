import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CodeIcon } from './SvgIllustrations';
import { usePortfolioSettings } from '../contexts/SettingsContext';

function SkillIcon({ iconKey, name, size = 48 }) {
  const { settings } = usePortfolioSettings();
  const [svgContent, setSvgContent] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  const drawAnimation = settings?.enableDrawSkills;

  useEffect(() => {
    if (!drawAnimation || !iconKey) return;

    let key = iconKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (key === 'sql') key = 'postgresql';
    if (key === 'js') key = 'javascript';
    if (key === 'node') key = 'nodejs';

    const url = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then((text) => {
        setSvgContent(text);
        setFetchFailed(false);
      })
      .catch(() => {
        const plainUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`;
        fetch(plainUrl)
          .then((res) => {
            if (!res.ok) throw new Error('Not found');
            return res.text();
          })
          .then((text) => {
            setSvgContent(text);
            setFetchFailed(false);
          })
          .catch(() => {
            setFetchFailed(true);
          });
      });
  }, [iconKey, drawAnimation]);

  if (!iconKey) return <CodeIcon size={size} />;

  if (drawAnimation && svgContent && !fetchFailed) {
    const cleanSvg = svgContent
      .replace(
        /<svg/,
        `<svg width="${size}" height="${size}" class="draw-svg-icon"`
      )
      .replace(
        /<\/svg>/,
        `
        <style>
          .draw-svg-icon path, .draw-svg-icon rect, .draw-svg-icon circle, .draw-svg-icon polygon {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawPathAnim 3.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            stroke: var(--text) !important;
            stroke-width: 1.5px !important;
            fill: none !important;
          }
          @keyframes drawPathAnim {
            to {
              stroke-dashoffset: 0;
            }
          }
        </style>
      </svg>`
      );
    return (
      <div
        style={{ display: 'inline-flex' }}
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
    );
  }

  let key = iconKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (key === 'sql') key = 'postgresql';
  if (key === 'js') key = 'javascript';
  if (key === 'node') key = 'nodejs';

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg`}
      alt={name}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      onError={(e) => {
        if (!e.target.src.includes('-plain')) {
          e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`;
        } else {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="56" height="56" rx="8" fill="#1a1a2e" stroke="#667eea" stroke-width="2"/><text x="14" y="30" fill="#667eea" font-size="16" font-family="monospace" font-weight="bold">&lt;</text><text x="34" y="30" fill="#f59e0b" font-size="16" font-family="monospace" font-weight="bold">}&gt;</text><rect x="14" y="38" width="36" height="4" rx="2" fill="#6ee7b7" opacity="0.3"/></svg>`;
        }
      }}
    />
  );
}

export default function Skills({ skills = [] }) {
  const defaultSkills = [
    {
      name: 'JavaScript',
      icon: 'javascript',
      level: 90,
      description: 'ES6+, TypeScript',
    },
    {
      name: 'React',
      icon: 'react',
      level: 85,
      description: 'Hooks, Redux, Context API',
    },
    {
      name: 'Node.js',
      icon: 'nodejs',
      level: 80,
      description: 'Express, NestJS',
    },
    { name: 'Python', icon: 'python', level: 75, description: 'Django, Flask' },
    {
      name: 'PostgreSQL',
      icon: 'postgresql',
      level: 70,
      description: 'SQL, TypeORM',
    },
    {
      name: 'Docker',
      icon: 'docker',
      level: 65,
      description: 'Containerization',
    },
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  return (
    <section id="skills">
      <h2>Skills</h2>
      <div className="grid">
        {displaySkills.map((skill, index) => (
          <motion.div
            key={skill.id || skill.name}
            className="card skill-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <SkillIcon iconKey={skill.icon} name={skill.name} size={48} />
            </div>
            <h3>{skill.name}</h3>
            <p>{skill.description || 'No description'}</p>
            <div className="level-bar">
              <div
                className="level-fill"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { CodeIcon } from './SvgIllustrations';

/**
 * Компонент иконки навыка.
 * Использует Devicons CDN по ключу из поля icon.
 * Список ключей: https://devicon.dev/
 * Примеры: javascript, typescript, react, nodejs, python, docker,
 *          postgresql, mongodb, css3, html5, git, linux, nestjs,
 *          redux, graphql, figma, swift, kotlin, rust, go ...
 */
function SkillIcon({ iconKey, name, size = 48 }) {
  if (!iconKey) return <CodeIcon size={size} />;

  // Убираем пробелы, приводим к нижнему регистру для devicon
  let key = iconKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
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
        // Пробуем plain вариант если original не найден
        if (!e.target.src.includes('-plain')) {
          e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`;
        } else {
          // Fallback — скрываем сломанный img и показываем CodeIcon через замену
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="56" height="56" rx="8" fill="#1a1a2e" stroke="#667eea" stroke-width="2"/><text x="14" y="30" fill="#667eea" font-size="16" font-family="monospace" font-weight="bold">&lt;</text><text x="34" y="30" fill="#f59e0b" font-size="16" font-family="monospace" font-weight="bold">}&gt;</text><rect x="14" y="38" width="36" height="4" rx="2" fill="#6ee7b7" opacity="0.3"/></svg>`;
        }
      }}
    />
  );
}

export default function Skills({ skills = [] }) {
  const defaultSkills = [
    { name: 'JavaScript', icon: 'javascript', level: 90, description: 'ES6+, TypeScript' },
    { name: 'React', icon: 'react', level: 85, description: 'Hooks, Redux, Context API' },
    { name: 'Node.js', icon: 'nodejs', level: 80, description: 'Express, NestJS' },
    { name: 'Python', icon: 'python', level: 75, description: 'Django, Flask' },
    { name: 'PostgreSQL', icon: 'postgresql', level: 70, description: 'SQL, TypeORM' },
    { name: 'Docker', icon: 'docker', level: 65, description: 'Containerization' },
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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
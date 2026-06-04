import { motion } from 'framer-motion';
import { ReactIcon, NodeIcon, PythonIcon, DatabaseIcon, DockerIcon, CodeIcon } from './SvgIllustrations';

export default function Skills({ skills = [] }) {
  const iconMap = {
    'JavaScript': <CodeIcon size={48} />,
    'React': <ReactIcon size={48} />,
    'Node.js': <NodeIcon size={48} />,
    'Python': <PythonIcon size={48} />,
    'SQL': <DatabaseIcon size={48} />,
    'Docker': <DockerIcon size={48} />,
  };

  const defaultSkills = [
    { name: 'JavaScript', level: 90, description: 'ES6+, TypeScript' },
    { name: 'React', level: 85, description: 'Hooks, Redux, Context API' },
    { name: 'Node.js', level: 80, description: 'Express, NestJS' },
    { name: 'Python', level: 75, description: 'Django, Flask' },
    { name: 'SQL', level: 70, description: 'PostgreSQL, MySQL' },
    { name: 'Docker', level: 65, description: 'Containerization' },
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
              {iconMap[skill.name] || <CodeIcon size={48} />}
            </div>
            <h3>{skill.name}</h3>
            <p>{skill.description || skill.icon}</p>
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
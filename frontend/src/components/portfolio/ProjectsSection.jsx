import { motion } from 'framer-motion';
import { RocketIcon, ProjectIcon } from '../SvgIllustrations';
import api from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ProjectsSection({ projects = [] }) {
  const { t } = useLanguage();
  const defaultProjects = [
    {
      title: 'Сайт-портфолио / Portfolio Website',
      description: 'Личный сайт-портфолио, созданный на React и Vite. / A personal portfolio website built with React and Vite.',
      technologies: 'React, Vite, CSS',
      link: '#',
    },
    {
      title: 'E-Commerce приложение / E-Commerce App',
      description:
        'Полнофункциональное e-commerce приложение с интеграцией платежей. / Full-stack e-commerce application with payment integration.',
      technologies: 'React, Node.js, MongoDB, Stripe',
      link: '#',
    },
    {
      title: 'API Менеджера задач / Task Manager API',
      description: 'RESTful API для управления задачами с авторизацией. / RESTful API for task management with authentication.',
      technologies: 'Node.js, Express, PostgreSQL, JWT',
      link: '#',
    },
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <section id="projects">
      <h2>{t('projects')}</h2>
      <div className="grid">
        {displayProjects.map((project, index) => (
          <motion.div
            key={project.id || project.title}
            className="card project-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            onMouseEnter={() => {
              const now = Date.now();
              if (
                !window.lastProjectHoverTime ||
                now - window.lastProjectHoverTime > 8000
              ) {
                window.lastProjectHoverTime = now;
                window.dispatchEvent(
                  new CustomEvent('project-hover', {
                    detail: { title: t(project.title) },
                  })
                );
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
                height: '160px',
                overflow: 'hidden',
                borderRadius: 'var(--sketch-radius-3)',
                border: 'var(--border-style)',
                background: 'var(--card-bg)',
              }}
            >
              {project.image ? (
                <img
                  src={project.image}
                  alt={t(project.title)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <RocketIcon size={56} />
                </div>
              )}
            </div>
            <h3>{t(project.title)}</h3>
            <p style={{ minHeight: '60px', margin: '0.5rem 0' }}>
              {t(project.description)}
            </p>
            <div className="tags" style={{ marginBottom: 'auto' }}>
              {project.skills && project.skills.length > 0 ? (
                project.skills.map((skill) => (
                  <span key={skill.id} className="tag sketch-link">
                    {t(skill.name)}
                  </span>
                ))
              ) : (
                (project.technologies || '').split(',').map(tech => tech.trim()).filter(Boolean).map((tech, idx) => (
                  <span key={idx} className="tag sketch-link">
                    {t(tech)}
                  </span>
                ))
              )}
            </div>
            {project.link && (
              <a
                href={project.link}
                className="btn"
                style={{ marginTop: '12px', display: 'inline-block' }}
                aria-label={`${t('viewProject')}: ${t(project.title)}`}
                onClick={async () => {
                  if (project.id) {
                    try {
                      await api.post(`/portfolio/projects/${project.id}/view`);
                    } catch (err) {
                      console.error('Failed to track project view:', err);
                    }
                  }
                }}
              >
                {t('viewProject')}
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

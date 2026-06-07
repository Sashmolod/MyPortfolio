import { motion } from 'framer-motion';
import { RocketIcon, ProjectIcon } from './SvgIllustrations';

export default function Projects({ projects = [] }) {
  const defaultProjects = [
    { title: 'Portfolio Website', description: 'A personal portfolio website built with React and Vite.', technologies: 'React, Vite, CSS', link: '#' },
    { title: 'E-Commerce App', description: 'Full-stack e-commerce application with payment integration.', technologies: 'React, Node.js, MongoDB, Stripe', link: '#' },
    { title: 'Task Manager API', description: 'RESTful API for task management with authentication.', technologies: 'Node.js, Express, PostgreSQL, JWT', link: '#' },
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <section id="projects">
      <h2>Projects</h2>
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
              if (!window.lastProjectHoverTime || now - window.lastProjectHoverTime > 8000) {
                window.lastProjectHoverTime = now;
                window.dispatchEvent(new CustomEvent('project-hover', {
                  detail: { title: project.title }
                }));
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', height: '160px', overflow: 'hidden', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)', background: 'var(--card-bg)' }}>
              {project.image ? (
                <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                  <RocketIcon size={56} />
                </div>
              )}
            </div>
            <h3>{project.title}</h3>
            <p style={{ minHeight: '60px', margin: '0.5rem 0' }}>{project.description}</p>
            <div className="tags" style={{ marginBottom: 'auto' }}>
              {(Array.isArray(project.technologies)
                ? project.technologies
                : typeof project.technologies === 'string'
                  ? project.technologies.split(',')
                  : []
              ).map((tech) => {
                const trimmed = tech ? String(tech).trim() : '';
                if (!trimmed) return null;
                return (
                  <span key={trimmed} className="tag sketch-link">{trimmed}</span>
                );
              })}
            </div>
            {project.link && (
              <a 
                href={project.link} 
                className="btn" 
                style={{ marginTop: '12px', display: 'inline-block' }}
                aria-label={`View Project: ${project.title}`}
              >
                View Project
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

function ProjectCard({ project, onEdit, onDelete }) {
  const { t } = useLanguage();
  return (
    <motion.div
      className="card"
      style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>{project.title}</h3>
      <p><strong>{t('Описание: / Description:')}</strong> {project.description}</p>
      {project.image && (
        <div style={{ marginBottom: '10px' }}>
          <img
            src={project.image}
            alt={project.title}
            style={{
              maxWidth: '100%',
              maxHeight: '120px',
              objectFit: 'cover',
              borderRadius: 'var(--sketch-radius-3)',
              border: 'var(--border-style)',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      {project.link && (
        <p>
          <strong>{t('Ссылка: / Link:')}</strong>{' '}
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="sketch-link"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            {project.link}
          </a>
        </p>
      )}
      {project.skills && project.skills.length > 0 && (
        <p>
          <strong>{t('Навыки: / Skills:')}</strong>{' '}
          {project.skills
            .map((s) => s?.name || s)
            .filter(Boolean)
            .join(', ')}
        </p>
      )}
      <p><strong>{t('Порядок сортировки: / Sort Order:')}</strong> {project.sortOrder}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button className="btn" onClick={() => onEdit(project)}>{t('Редактировать / Edit')}</button>
        <button className="btn btn-danger" onClick={() => onDelete(project.id, 'project')}>{t('Удалить / Delete')}</button>
      </div>
    </motion.div>
  );
}

export default function ProjectsList({ projects = [], onEdit, onDelete }) {
  const { t } = useLanguage();
  if (!projects || projects.length === 0) {
    return <p>{t('Проектов пока нет. Нажмите кнопку выше, чтобы добавить. / No projects yet. Click the button above to add one.')}</p>;
  }

  return (
    <div className="grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

function ProjectCard({ project, onEdit, onDelete }) {
  const { t } = useLanguage();
  return (
    <Card
      style={{ position: 'relative' }}
      hoverable
    >
      <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>{project.title}</h3>
      <p style={{ fontFamily: 'var(--font-family)' }}>
        <strong>{t('Описание: / Description:')}</strong> {project.description ? t(project.description) : t('Нет описания / No description')}
      </p>
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
        <p style={{ fontFamily: 'var(--font-family)' }}>
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
        <p style={{ fontFamily: 'var(--font-family)' }}>
          <strong>{t('Навыки: / Skills:')}</strong>{' '}
          {project.skills
            .map((s) => s?.name || s)
            .filter(Boolean)
            .join(', ')}
        </p>
      )}
      <p style={{ fontFamily: 'var(--font-family)' }}>
        <strong>{t('Порядок сортировки: / Sort Order:')}</strong> {project.sortOrder}
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <Button size="sm" onClick={() => onEdit(project)} style={{ width: 'auto', margin: 0 }}>
          {t('Редактировать / Edit')}
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(project.id, 'project')} style={{ width: 'auto', margin: 0 }}>
          {t('Удалить / Delete')}
        </Button>
      </div>
    </Card>
  );
}

export default function ProjectsList({ projects = [], onEdit, onDelete }) {
  const { t } = useLanguage();
  if (!projects || projects.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-family)' }}>
        {t('Проектов пока нет. Нажмите кнопку выше, чтобы добавить. / No projects yet. Click the button above to add one.')}
      </p>
    );
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
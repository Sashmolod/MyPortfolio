import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function TrashView({ items, onRestore, onDeletePermanently }) {
  const { t } = useLanguage();
  const {
    skills = [],
    projects = [],
    messages = [],
    socialLinks = [],
  } = items || {};
  const isEmpty =
    skills.length === 0 &&
    projects.length === 0 &&
    messages.length === 0 &&
    socialLinks.length === 0;

  if (isEmpty) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
          {t('Корзина пуста / Trash is empty')}
        </h3>
        <p style={{ opacity: 0.6, fontFamily: 'var(--font-family)' }}>
          {t('Удаленных элементов не найдено. / No soft-deleted items found.')}
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {skills.length > 0 && (
        <div>
          <h2
            style={{
              marginBottom: '15px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px',
              fontFamily: 'var(--font-family)',
              fontWeight: 'bold',
            }}
          >
            {t('Удаленные навыки / Deleted Skills')}
          </h2>
          <div className="grid">
            {skills.map((skill) => (
              <Card
                key={skill.id}
                style={{ position: 'relative', opacity: 0.8 }}
                hoverable
              >
                <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>{skill.name}</h3>
                <p style={{ fontFamily: 'var(--font-family)' }}>
                  {t('Уровень: / Level:')} {skill.level}%
                </p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px', fontFamily: 'var(--font-family)' }}>
                  {t('Удалено: / Deleted:')} {new Date(skill.deletedAt).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', width: 'auto', margin: 0 }}
                    onClick={() => onRestore(skill.id, 'skill')}
                  >
                    {t('Восстановить / Restore')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: 'auto', margin: 0 }}
                    onClick={() => onDeletePermanently(skill.id, 'skill')}
                  >
                    {t('Удалить навсегда / Delete Permanently')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2
            style={{
              marginBottom: '15px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px',
              fontFamily: 'var(--font-family)',
              fontWeight: 'bold',
            }}
          >
            {t('Удаленные проекты / Deleted Projects')}
          </h2>
          <div className="grid">
            {projects.map((project) => (
              <Card
                key={project.id}
                style={{ position: 'relative', opacity: 0.8 }}
                hoverable
              >
                <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>{project.title}</h3>
                <p style={{ fontFamily: 'var(--font-family)' }}>
                  {project.description ? t(project.description).slice(0, 100) : t('Нет описания / No description')}...
                </p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px', fontFamily: 'var(--font-family)' }}>
                  {t('Удалено: / Deleted:')} {new Date(project.deletedAt).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', width: 'auto', margin: 0 }}
                    onClick={() => onRestore(project.id, 'project')}
                  >
                    {t('Восстановить / Restore')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: 'auto', margin: 0 }}
                    onClick={() => onDeletePermanently(project.id, 'project')}
                  >
                    {t('Удалить навсегда / Delete Permanently')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div>
          <h2
            style={{
              marginBottom: '15px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px',
              fontFamily: 'var(--font-family)',
              fontWeight: 'bold',
            }}
          >
            {t('Удаленные социальные ссылки / Deleted Social Links')}
          </h2>
          <div className="grid">
            {socialLinks.map((link) => (
              <Card
                key={link.id}
                style={{ position: 'relative', opacity: 0.8 }}
                hoverable
              >
                <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>{link.platform}</h3>
                <p style={{ fontFamily: 'var(--font-family)' }}>
                  URL:{' '}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                    }}
                  >
                    {link.url}
                  </a>
                </p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px', fontFamily: 'var(--font-family)' }}>
                  {t('Удалено: / Deleted:')} {new Date(link.deletedAt).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', width: 'auto', margin: 0 }}
                    onClick={() => onRestore(link.id, 'social-link')}
                  >
                    {t('Восстановить / Restore')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: 'auto', margin: 0 }}
                    onClick={() => onDeletePermanently(link.id, 'social-link')}
                  >
                    {t('Удалить навсегда / Delete Permanently')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <h2
            style={{
              marginBottom: '15px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px',
              fontFamily: 'var(--font-family)',
              fontWeight: 'bold',
            }}
          >
            {t('Удаленные сообщения / Deleted Messages')}
          </h2>
          <div className="grid">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                style={{ position: 'relative', opacity: 0.8 }}
                hoverable
              >
                <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
                  {msg.subject || t('(без темы) / (no subject)')}
                </h3>
                <p style={{ fontFamily: 'var(--font-family)' }}>
                  <strong>{t('От: / From:')}</strong> {msg.name} ({msg.email})
                </p>
                <p style={{ marginTop: '8px', fontFamily: 'var(--font-family)' }}>
                  {msg.message?.slice(0, 100)}...
                </p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px', fontFamily: 'var(--font-family)' }}>
                  {t('Удалено: / Deleted:')} {new Date(msg.deletedAt).toLocaleString()}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', width: 'auto', margin: 0 }}
                    onClick={() => onRestore(msg.id, 'message')}
                  >
                    {t('Восстановить / Restore')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: 'auto', margin: 0 }}
                    onClick={() => onDeletePermanently(msg.id, 'message')}
                  >
                    {t('Удалить навсегда / Delete Permanently')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

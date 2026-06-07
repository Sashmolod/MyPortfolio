import { motion } from 'framer-motion';

export default function TrashView({ items, onRestore, onDeletePermanently }) {
  const { skills = [], projects = [], messages = [], socialLinks = [] } = items || {};
  const isEmpty = skills.length === 0 && projects.length === 0 && messages.length === 0 && socialLinks.length === 0;

  if (isEmpty) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Trash is empty</h3>
        <p style={{ opacity: 0.6 }}>No soft-deleted items found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {skills.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Deleted Skills</h2>
          <div className="grid">
            {skills.map(skill => (
              <motion.div key={skill.id} className="card" style={{ position: 'relative', opacity: 0.8 }} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}>
                <h3>{skill.name}</h3>
                <p>Level: {skill.level}%</p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Deleted: {new Date(skill.deletedAt).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn" style={{ background: '#10b981' }} onClick={() => onRestore(skill.id, 'skill')}>Restore</button>
                  <button className="btn btn-danger" onClick={() => onDeletePermanently(skill.id, 'skill')}>Delete Permanently</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Deleted Projects</h2>
          <div className="grid">
            {projects.map(project => (
              <motion.div key={project.id} className="card" style={{ position: 'relative', opacity: 0.8 }} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}>
                <h3>{project.title}</h3>
                <p>{project.description?.slice(0, 100)}...</p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Deleted: {new Date(project.deletedAt).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn" style={{ background: '#10b981' }} onClick={() => onRestore(project.id, 'project')}>Restore</button>
                  <button className="btn btn-danger" onClick={() => onDeletePermanently(project.id, 'project')}>Delete Permanently</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Deleted Social Links</h2>
          <div className="grid">
            {socialLinks.map(link => (
              <motion.div key={link.id} className="card" style={{ position: 'relative', opacity: 0.8 }} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}>
                <h3>{link.platform}</h3>
                <p>URL: <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{link.url}</a></p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Deleted: {new Date(link.deletedAt).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn" style={{ background: '#10b981' }} onClick={() => onRestore(link.id, 'social-link')}>Restore</button>
                  <button className="btn btn-danger" onClick={() => onDeletePermanently(link.id, 'social-link')}>Delete Permanently</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Deleted Messages</h2>
          <div className="grid">
            {messages.map(msg => (
              <motion.div key={msg.id} className="card" style={{ position: 'relative', opacity: 0.8 }} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}>
                <h3>{msg.subject || '(no subject)'}</h3>
                <p><strong>From:</strong> {msg.name} ({msg.email})</p>
                <p style={{ marginTop: '8px' }}>{msg.message?.slice(0, 100)}...</p>
                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Deleted: {new Date(msg.deletedAt).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn" style={{ background: '#10b981' }} onClick={() => onRestore(msg.id, 'message')}>Restore</button>
                  <button className="btn btn-danger" onClick={() => onDeletePermanently(msg.id, 'message')}>Delete Permanently</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

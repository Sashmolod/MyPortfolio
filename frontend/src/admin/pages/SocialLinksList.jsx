import { motion } from 'framer-motion';

function SocialLinkCard({ link, onEdit, onDelete }) {
  return (
    <motion.div
      className="card"
      style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>{link.name}</h3>
      <p>
        <strong>URL:</strong>{' '}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sketch-link"
          style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {link.url}
        </a>
      </p>
      <p><strong>Sort Order:</strong> {link.sortOrder}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button className="btn" onClick={() => onEdit(link)}>Edit</button>
        <button className="btn btn-danger" onClick={() => onDelete(link.id, 'social-link')}>Delete</button>
      </div>
    </motion.div>
  );
}

export default function SocialLinksList({ links, onEdit, onDelete }) {
  if (links.length === 0) {
    return <p>No social links yet. Click the button above to add one.</p>;
  }

  return (
    <div className="grid">
      {links.map((link) => (
        <SocialLinkCard
          key={link.id}
          link={link}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
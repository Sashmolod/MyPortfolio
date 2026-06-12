import { motion } from 'framer-motion';

function MessageCard({ message, onEdit, onDelete }) {
  return (
    <motion.div
      className="card"
      style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>{message.name}</h3>
      <p><strong>Email:</strong> {message.email}</p>
      <p><strong>Subject:</strong> {message.subject}</p>
      <p style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', border: '1px dashed var(--border-color)', padding: '10px', borderRadius: 'var(--sketch-radius-3)' }}>
        {message.message}
      </p>
      <p style={{ fontSize: '12px', opacity: 0.6 }}>
        <strong>Created:</strong> {message.createdAt ? new Date(message.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button className="btn btn-danger" onClick={() => onDelete(message.id, 'message')}>Delete</button>
      </div>
    </motion.div>
  );
}

export default function MessagesList({ messages, onDelete }) {
  if (messages.length === 0) {
    return <p>No messages yet.</p>;
  }

  return (
    <div className="grid">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onEdit={() => {}}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
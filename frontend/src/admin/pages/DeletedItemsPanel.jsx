import { useState } from 'react';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  skill: 'Skill',
  project: 'Project',
  'social-link': 'Social Link',
  message: 'Message',
};

export default function DeletedItemsPanel({ deletedItems, onRestore, onPermanentDelete }) {
  const [expandedType, setExpandedType] = useState(null);

  if (deletedItems.length === 0) {return null;}

  const grouped = deletedItems.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) {acc[type] = [];}
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      className="card"
      style={{ marginTop: '30px', border: '2px dashed var(--danger)', background: 'var(--card-bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 style={{ fontFamily: "'Architects Daughter', cursive", fontSize: '1.3rem', marginBottom: '15px', color: 'var(--danger)' }}>
        Deleted Items ({deletedItems.length})
      </h2>
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} style={{ marginBottom: '10px' }}>
          <button
            className="btn"
            onClick={() => setExpandedType(expandedType === type ? null : type)}
            style={{ fontSize: '0.85rem', padding: '6px 12px', boxShadow: '2px 2px 0px var(--border-color)', marginBottom: 0 }}
          >
            {TYPE_LABELS[type] || type} ({items.length}) {expandedType === type ? '▼' : '▶'}
          </button>
          {expandedType === type && (
            <div style={{ marginTop: '10px', paddingLeft: '15px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px dashed var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    <span style={{ opacity: 0.6, marginLeft: '8px' }}>
                      (deleted {item.deletedAt})
                    </span>
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn"
                      onClick={() => onRestore(item.id, item.type)}
                      style={{ fontSize: '11px', padding: '4px 8px', boxShadow: '1.5px 1.5px 0px var(--border-color)', marginBottom: 0 }}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onPermanentDelete(item.id, item.type)}
                      style={{ fontSize: '11px', padding: '4px 8px', boxShadow: '1.5px 1.5px 0px var(--border-color)', marginBottom: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
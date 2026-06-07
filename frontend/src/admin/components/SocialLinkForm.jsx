import { useState } from 'react';
import { motion } from 'framer-motion';

function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

export default function SocialLinkForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(() => {
    if (item) return pick(item, ['platform', 'url', 'sortOrder']);
    return { platform: '', url: '', sortOrder: 0 };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.platform.trim()) errs.platform = 'Platform is required';
    if (!form.url.trim()) errs.url = 'URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSaveData(pick(form, ['platform', 'url', 'sortOrder']));
    setSaving(false);
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>{item ? 'Edit Social Link' : 'Add Social Link'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input
              placeholder="Platform (e.g. GitHub, Reddit)"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className={errors.platform ? 'input-error' : ''}
              required
            />
            {errors.platform && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.platform}</span>}
          </div>
          <div>
            <input
              placeholder="URL (e.g. https://github.com/...)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={errors.url ? 'input-error' : ''}
              required
            />
            {errors.url && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.url}</span>}
          </div>
          <div>
            <label style={{ fontSize: '14px', fontFamily: "'Architects Daughter', cursive" }}>Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="btn" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

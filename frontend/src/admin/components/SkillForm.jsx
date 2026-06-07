import { useState } from 'react';
import { motion } from 'framer-motion';

function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

export default function SkillForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(() => {
    if (item) return pick(item, ['name', 'icon', 'description', 'level', 'sortOrder']);
    return { name: '', icon: '', description: '', level: 50, sortOrder: 0 };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.level < 0 || form.level > 100) errs.level = 'Level must be 0-100';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSaveData(pick(form, ['name', 'icon', 'description', 'level', 'sortOrder']));
    setSaving(false);
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>{item ? 'Edit Skill' : 'Add Skill'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? 'input-error' : ''}
              required
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>{errors.name}</span>}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                placeholder="Icon key (e.g., react, typescript, docker)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value.trim().toLowerCase() })}
                style={{ flex: 1, margin: 0 }}
              />
              {form.icon && (() => {
                let previewKey = form.icon.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (previewKey === 'sql') previewKey = 'postgresql';
                if (previewKey === 'js') previewKey = 'javascript';
                if (previewKey === 'node') previewKey = 'nodejs';
                return (
                  <img
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${previewKey}/${previewKey}-original.svg`}
                    alt={form.icon}
                    width={40}
                    height={40}
                    style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)', padding: '4px', background: 'var(--card-bg)' }}
                    onError={(e) => {
                      e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${previewKey}/${previewKey}-plain.svg`;
                    }}
                  />
                );
              })()}
            </div>
            <p style={{ fontSize: '11px', opacity: 0.6, margin: '4px 0 0', fontFamily: "'Architects Daughter', cursive", lineHeight: 1.4 }}>
              Ключи: javascript, typescript, react, nodejs, python, postgresql, mongodb, docker, git, css3, html5, nestjs, redux, graphql, linux, figma, swift, kotlin, rust, go, vuejs, angularjs, nextjs, nuxtjs
            </p>
          </div>
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <input
              type="number"
              placeholder="Level (0-100)"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: +e.target.value })}
              min="0"
              max="100"
              className={errors.level ? 'input-error' : ''}
              required
            />
            {errors.level && <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>{errors.level}</span>}
          </div>
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

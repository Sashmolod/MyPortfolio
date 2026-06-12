import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';

export default function SkillForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(() => {
    if (item)
      return {
        name: item.name || '',
        icon: item.icon || '',
        description: item.description || '',
        level: item.level ?? 50,
        sortOrder: item.sortOrder ?? 0,
        categoryId: item.categoryId != null ? String(item.categoryId) : '',
        subcategoryId: item.subcategoryId != null ? String(item.subcategoryId) : '',
      };
    return { name: '', icon: '', description: '', level: 50, sortOrder: 0, categoryId: '', subcategoryId: '' };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/admin/skill-categories/flat');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch skill categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      if (cat.parentId === null || cat.parentId === undefined) map.set(cat.id, []);
    }
    for (const sub of categories) {
      if (sub.parentId !== null && sub.parentId !== undefined) {
        const parentSubs = map.get(sub.parentId) || [];
        parentSubs.push(sub);
        map.set(sub.parentId, parentSubs);
      }
    }
    return map;
  }, [categories]);

  const selectedCategory = useMemo(() => {
    if (!form.categoryId) return null;
    return categories.find((c) => c.id === Number(form.categoryId)) || null;
  }, [categories, form.categoryId]);

  const subcategories = selectedCategory ? (categoryMap.get(selectedCategory.id) || []) : [];

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
    await onSaveData({
      name: form.name,
      icon: form.icon,
      description: form.description,
      level: form.level,
      sortOrder: form.sortOrder,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
    });
    setSaving(false);
  };

  const handleCategoryChange = (e) => {
    setForm({ ...form, categoryId: e.target.value, subcategoryId: '' });
  };

  const renderIconPreview = () => {
    if (!form.icon) return null;
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
        onError={(e) => { e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${previewKey}/${previewKey}-plain.svg`; }}
      />
    );
  };

  const renderError = (field) => {
    if (!errors[field]) return null;
    return <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>{errors[field]}</span>;
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>
        {item ? 'Edit Skill' : 'Add Skill'}
      </h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={errors.name ? 'input-error' : ''} required />
            {renderError('name')}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input placeholder="Icon key (e.g., react, typescript, docker)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value.trim().toLowerCase() })} style={{ flex: 1, margin: 0 }} />
              {renderIconPreview()}
            </div>
          </div>
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <input type="number" placeholder="Level (0-100)" value={form.level} onChange={(e) => setForm({ ...form, level: +e.target.value })} min="0" max="100" className={errors.level ? 'input-error' : ''} required />
            {renderError('level')}
          </div>
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />
          <div>
            <label style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', display: 'block' }}>Category</label>
            {loadingCategories ? (
              <p style={{ fontSize: '12px', opacity: 0.5 }}>Loading...</p>
            ) : (
              <select value={form.categoryId} onChange={handleCategoryChange} style={{ margin: 0 }}>
                <option value="">No category</option>
                {categories.filter(c => c.parentId === null || c.parentId === undefined).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>
          {form.categoryId && (
            <div>
              <label style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', display: 'block' }}>Subcategory</label>
              <select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} style={{ margin: 0 }}>
                <option value="">No subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}
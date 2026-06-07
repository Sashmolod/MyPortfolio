import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';

function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

export default function ProjectForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(() => {
    if (item) return pick(item, ['title', 'description', 'image', 'link', 'technologies', 'sortOrder']);
    return { title: '', description: '', image: '', link: '', technologies: '', sortOrder: 0 };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSaveData(pick(form, ['title', 'description', 'image', 'link', 'technologies', 'sortOrder']));
    setSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setForm(prev => ({ ...prev, image: res.data.url }));
        window.toast?.('Image uploaded successfully', 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      window.toast?.('Failed to upload image: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>{item ? 'Edit Project' : 'Add Project'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={errors.title ? 'input-error' : ''}
              required
            />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>{errors.title}</span>}
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          
          <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-3)', padding: '12px', background: 'var(--card-bg)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>Project Image</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={{ flex: 1, margin: 0 }} />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <button type="button" className="btn" disabled={uploading} style={{ whiteSpace: 'nowrap', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
            {form.image && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={form.image} alt="Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }} onClick={() => setForm({ ...form, image: '' })}>Remove</button>
              </div>
            )}
          </div>

          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input placeholder="Technologies (comma separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
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

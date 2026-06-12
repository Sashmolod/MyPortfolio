import { useState, useEffect } from 'react';
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
    if (item)
      return pick(item, [
        'title', 'description', 'image', 'link', 'sortOrder',
      ]);
    return { title: '', description: '', image: '', link: '', sortOrder: 0 };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [skills, setSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState(() => {
    if (item && item.skills) return item.skills.map((s) => s.id);
    return [];
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/admin/skills');
        setSkills(res.data || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

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
    await onSaveData(pick(form, ['title', 'description', 'image', 'link', 'sortOrder']), selectedSkillIds);
    setSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      if (res.data && res.data.url) {
        setForm((prev) => ({ ...prev, image: res.data.url }));
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
    <motion.div className="card" style={{ marginBottom: '20px' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>
        {item ? 'Edit Project' : 'Add Project'}
      </h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={errors.title ? 'input-error' : ''} required />
            {errors.title && <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>{errors.title}</span>}
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-3)', padding: '12px', background: 'var(--card-bg)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>Project Image</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={{ flex: 1, margin: 0 }} />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <button type="button" className="btn" disabled={uploading} style={{ whiteSpace: 'nowrap', margin: 0 }}>{uploading ? 'Uploading...' : 'Upload Image'}</button>
              </div>
            </div>
            {uploading && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-2)', height: '14px', position: 'relative', overflow: 'hidden', background: 'var(--input-bg)' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--text)', transition: 'width 0.1s ease', backgroundImage: 'repeating-linear-gradient(45deg, var(--bg) 0px, var(--bg) 2px, transparent 2px, transparent 10px)' }} />
                </div>
                <div style={{ fontFamily: "'Architects Daughter', cursive", fontSize: '11px', textAlign: 'center', marginTop: '2px', fontWeight: 'bold' }}>Uploading: {uploadProgress}%</div>
              </div>
            )}
            {form.image && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={form.image} alt="Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }} onClick={() => setForm({ ...form, image: '' })}>Remove</button>
              </div>
            )}
          </div>

          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />

          <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-3)', padding: '12px', background: 'var(--card-bg)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>Skills (click to select)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`btn ${isSelected ? 'btn-primary' : 'btn'}`}
                    onClick={() => toggleSkill(skill.id)}
                    style={{
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? 'var(--bg)' : 'var(--text)',
                      border: 'var(--border-style)',
                      padding: '4px 10px',
                      fontSize: '13px',
                      margin: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {skill.name} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
              {skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--secondary)' }}>No skills available</span>}
            </div>
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import heroImg from '../../assets/hero.png';

// Confirm dialog component (replacement for window.confirm)
function ConfirmDialog({ message, onConfirm, onCancel, isOpen }) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998,
        backdropFilter: 'blur(3px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-sketch"
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ marginBottom: '24px', fontSize: '1.2rem', fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MediaTab({ items, refresh }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      window.toast?.('Image uploaded successfully', 'success');
      refresh();
    } catch (err) {
      console.error(err);
      window.toast?.('Failed to upload image: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await api.delete(`/upload/${filename}`);
      window.toast?.('Image deleted successfully', 'success');
      refresh();
    } catch (err) {
      console.error(err);
      window.toast?.('Failed to delete image', 'error');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    window.toast?.('URL copied to clipboard!', 'success');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} 
            disabled={uploading}
          />
          <button className="btn" disabled={uploading}>
            {uploading ? 'Uploading...' : '+ Upload New Image'}
          </button>
        </div>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
          Загружайте сюда изображения, чтобы использовать их в качестве аватара или картинок проектов.
        </p>
      </div>

      {items.length === 0 ? (
        <p>No media files uploaded yet. Upload one above!</p>
      ) : (
        <div className="grid">
          {items.map((file) => (
            <motion.div 
              key={file.filename} 
              className="card" 
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ position: 'relative', height: '140px', background: 'var(--secondary)', borderBottom: 'var(--border-style)' }}>
                <img 
                  src={file.url} 
                  alt={file.filename} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.src = 'https://placehold.co/140x140?text=No+Image'; }}
                />
              </div>
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', wordBreak: 'break-all', fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold' }}>
                    {file.filename}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', opacity: 0.7 }}>
                    Size: {formatSize(file.size)} | {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn" 
                    style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }} 
                    onClick={() => handleCopyUrl(file.url)}
                  >
                    Copy URL
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }} 
                    onClick={() => handleDelete(file.filename)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { logout, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('skills');
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setItems([]);
    try {
      if (activeTab === 'media') {
        const res = await api.get('/upload');
        setItems(res.data);
      } else if (activeTab === 'skills') {
        const res = await api.get('/admin/skills');
        setItems(res.data);
      } else if (activeTab === 'projects') {
        const res = await api.get('/admin/projects');
        setItems(res.data);
      } else if (activeTab === 'social-links') {
        const res = await api.get('/admin/social-links');
        setItems(res.data);
      } else if (activeTab === 'messages') {
        const res = await api.get('/admin/messages');
        setMessages(res.data);
      } else if (activeTab === 'hero') {
        const res = await api.get('/portfolio/hero');
        let data = res.data;
        // Парсим до объекта (защита от двойного кодирования)
        let sl = data.socialLinks;
        while (sl && typeof sl === 'string') {
          try { sl = JSON.parse(sl); } catch { sl = {}; break; }
        }
        data = { ...data, socialLinks: sl || {} };
        setHeroData(data);
      } else if (activeTab === 'trash') {
        const [skillsRes, projectsRes, messagesRes, socialLinksRes] = await Promise.all([
          api.get('/admin/skills/deleted'),
          api.get('/admin/projects/deleted'),
          api.get('/admin/messages/deleted'),
          api.get('/admin/social-links/deleted'),
        ]);
        setItems({
          skills: skillsRes.data,
          projects: projectsRes.data,
          messages: messagesRes.data,
          socialLinks: socialLinksRes.data,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      window.toast?.('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, type) => {
    try {
      await api.post(`/admin/${type}/${id}/restore`);
      window.toast?.('Item restored successfully', 'success');
      fetchData();
    } catch (err) {
      console.error('Error restoring:', err);
      window.toast?.('Error restoring item: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id, type) => {
    setConfirmDialog({
      message: `Are you sure you want to delete this ${type}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/${type}/${id}`);
          window.toast?.(`${type.slice(0, -1)} deleted successfully`, 'success');
          fetchData();
        } catch (err) {
          console.error('Error deleting:', err);
          window.toast?.('Error deleting item', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeleteHero = async () => {
    if (!heroData?.id) return;
    setConfirmDialog({
      message: 'Are you sure you want to delete Hero data?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/hero/${heroData.id}`);

          window.toast?.('Hero deleted successfully', 'success');
          fetchData();
          setHeroData(null);
        } catch (err) {
          console.error('Error deleting hero:', err);
          window.toast?.('Error deleting hero: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    try {
      await changePassword(passwordForm);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordErrors({});
      window.toast?.('Password changed successfully', 'success');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      window.toast?.('Password change failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleSave = async (type, form) => {
    try {
      if (editingItem?.id) {
        await api.put(`/admin/${type}/${editingItem.id}`, form);
        window.toast?.(`${type} updated successfully`, 'success');
      } else {
        await api.post(`/admin/${type}`, form);
        window.toast?.(`${type} created successfully`, 'success');
      }
      fetchData(); setShowForm(false); setEditingItem(null);
    } catch (err) {
      window.toast?.(`Error saving ${type}: ` + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleSaveHero = async (form) => {
    try {
      if (heroData?.id) {
        await api.put(`/admin/hero/${heroData.id}`, form);
        window.toast?.('Hero updated successfully', 'success');
      } else {
        await api.post('/admin/hero', form);

        window.toast?.('Hero created successfully', 'success');
      }
      fetchData(); setShowForm(false); setEditingItem(null);
    } catch (err) {
      window.toast?.('Error saving hero: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const renderForm = () => {
    if (activeTab === 'skills') return <SkillForm item={editingItem} onSaveData={(form) => handleSave('skill', form)} onCancel={() => { setShowForm(false); setEditingItem(null); }} />;
    if (activeTab === 'projects') return <ProjectForm item={editingItem} onSaveData={(form) => handleSave('project', form)} onCancel={() => { setShowForm(false); setEditingItem(null); }} />;
    if (activeTab === 'social-links') return <SocialLinkForm item={editingItem} onSaveData={(form) => handleSave('social-link', form)} onCancel={() => { setShowForm(false); setEditingItem(null); }} />;
    if (activeTab === 'hero') return <HeroForm heroData={heroData || editingItem} onSaveData={handleSaveHero} onCancel={() => { setShowForm(false); setEditingItem(null); }} />;
    return null;
  };

  const typeLabel = activeTab === 'skills' ? 'skill' : activeTab === 'projects' ? 'project' : activeTab === 'social-links' ? 'social-link' : '';

  // Loading skeleton component
  function SkeletonCard() {
    return (
      <div className="card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
        <div style={{ height: '20px', background: 'var(--border)', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ height: '14px', background: 'var(--border)', borderRadius: '4px', width: '80%' }} />
        <div style={{ height: '14px', background: 'var(--border)', borderRadius: '4px', width: '60%', marginTop: '8px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} isOpen={!!confirmDialog} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold' }}>Admin Dashboard</h1>
        <button
          onClick={() => logout()}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['skills', 'projects', 'social-links', 'media', 'hero', 'messages', 'trash', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'social-links' ? 'Social Links' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab !== 'messages' && activeTab !== 'hero' && activeTab !== 'trash' && activeTab !== 'settings' && activeTab !== 'media' && (
        <button className="btn" onClick={() => setShowForm(true)} style={{ marginBottom: '20px' }}>
          + Add {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
        </button>
      )}

      {showForm && renderForm()}

      {loading ? (
        <div className="grid">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : activeTab === 'messages' ? (
        messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <div className="grid">
            {messages.map((msg) => (
              <motion.div key={msg.id} className="card" style={{ position: 'relative' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3>{msg.subject || '(no subject)'}</h3>
                <p><strong>From:</strong> {msg.name} ({msg.email})</p>
                <p style={{ marginTop: '10px' }}>{msg.message}</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '10px' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
                <button className="btn btn-danger" style={{ position: 'absolute', top: '16px', right: '16px', margin: 0 }}
                  onClick={() => handleDelete(msg.id, 'message')}>Delete</button>
              </motion.div>
            ))}
          </div>
        )
      ) : activeTab === 'hero' ? (
        !heroData ? (
          <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <p>No hero data yet.</p>
            <button className="btn" onClick={() => setShowForm(true)} style={{ marginTop: '10px' }}>+ Create Hero Section</button>
          </div>
        ) : (
          <motion.div className="card" style={{ marginBottom: '20px', position: 'relative' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3>{heroData.name || 'Hero Section'}</h3>
            <p><strong>Title:</strong> {heroData.title}</p>
            <p><strong>Bio:</strong> {heroData.bio}</p>
            <p><strong>Avatar:</strong> {heroData.avatar}</p>
            <p><strong>Social Links:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              {Array.isArray(heroData.socialLinks) ? (
                heroData.socialLinks.map((link) => (
                  <li key={link.id}>
                    <strong>{link.platform}:</strong>{' '}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="sketch-link" style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>{link.url}</a>
                  </li>
                ))
              ) : (
                Object.entries(heroData.socialLinks || {}).map(([key, value]) =>
                  value ? (<li key={key}><strong>{key}:</strong> <a href={value} target="_blank" rel="noopener noreferrer" className="sketch-link" style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>{value}</a></li>) : null
                )
              )}
            </ul>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="btn" onClick={() => { setEditingItem(heroData); setShowForm(true); }}>Edit</button>
              <button className="btn btn-danger" onClick={handleDeleteHero}>Delete</button>
            </div>
          </motion.div>
        )
      ) : activeTab === 'media' ? (
        <MediaTab items={items} refresh={fetchData} />
      ) : activeTab === 'trash' ? (
        <TrashView items={items} onRestore={handleRestore} />
      ) : activeTab === 'settings' ? (
        <div style={{ maxWidth: '420px', margin: '20px auto 0 auto' }}>
          {passwordSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                border: 'var(--border-style)',
                borderColor: 'var(--accent)',
                borderRadius: 'var(--sketch-radius-3)',
                padding: '12px',
                color: 'var(--text)',
                background: 'var(--card-bg)',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              Пароль успешно изменён!
            </motion.div>
          )}
          <div className="card">
            <h3 style={{ fontFamily: "'Architects Daughter', cursive", marginBottom: '20px', fontWeight: 'bold', fontSize: '1.4rem' }}>
              Change Password
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <input
                    type="password"
                    placeholder="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className={passwordErrors.currentPassword ? 'input-error' : ''}
                    required
                  />
                  {passwordErrors.currentPassword && (
                    <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>
                      {passwordErrors.currentPassword}
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="New password (min. 6 characters)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={passwordErrors.newPassword ? 'input-error' : ''}
                    minLength={6}
                    required
                  />
                  {passwordErrors.newPassword && (
                    <span style={{ color: 'var(--danger)', fontSize: '12px', display: 'block', marginTop: '-8px', marginBottom: '8px', fontFamily: "'Architects Daughter', cursive" }}>
                      {passwordErrors.newPassword}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: '12px', width: '100%' }}>
                Сменить пароль
              </button>
            </form>
          </div>
        </div>
      ) : items.length === 0 ? (
        <p>No items yet. Click the button above to add one.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <motion.div key={item.id} className="card" style={{ position: 'relative' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3>{item.name || item.title || item.platform}</h3>
              {activeTab === 'skills' && (
                <>
                  <p><strong>Icon:</strong> {item.icon}</p>
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Level:</strong> {item.level}%</p>
                  <p><strong>Sort Order:</strong> {item.sortOrder}</p>
                </>
              )}
              {activeTab === 'projects' && (
                <>
                  <p><strong>Description:</strong> {item.description}</p>
                  {item.image && <p><strong>Image:</strong> {item.image}</p>}
                   {item.link && <p><strong>Link:</strong> <a href={item.link} target="_blank" rel="noopener noreferrer" className="sketch-link" style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>{item.link}</a></p>}
                  <p><strong>Technologies:</strong> {item.technologies}</p>
                  <p><strong>Sort Order:</strong> {item.sortOrder}</p>
                </>
              )}
              {activeTab === 'social-links' && (
                <>
                  <p><strong>URL:</strong> <a href={item.url} target="_blank" rel="noopener noreferrer" className="sketch-link" style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>{item.url}</a></p>
                  <p><strong>Sort Order:</strong> {item.sortOrder}</p>
                </>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button className="btn" onClick={() => { setEditingItem(item); setShowForm(true); }}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}>Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to pick only allowed fields from an item
function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

function SkillForm({ item, onSaveData, onCancel }) {
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
    // Ensure only allowed fields are sent
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

function ProjectForm({ item, onSaveData, onCancel }) {
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

function HeroForm({ heroData, onSaveData, onCancel }) {
  const [form, setForm] = useState(() => {
    if (heroData) {
      return pick(heroData, ['name', 'title', 'bio', 'avatar']);
    }
    return { name: '', title: '', bio: '', avatar: null };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { window.toast?.('Name is required', 'warning'); return; }
    setSaving(true);
    const payload = pick(form, ['name', 'title', 'bio', 'avatar']);
    await onSaveData(payload);
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
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
        setForm(prev => ({ ...prev, avatar: res.data.url }));
        window.toast?.('Avatar uploaded successfully', 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      window.toast?.('Failed to upload avatar: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3 style={{ fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold', marginBottom: '20px' }}>{heroData?.id ? 'Edit Hero Section' : 'Create Hero Section'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Name (e.g., John Doe)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Title (e.g., Full Stack Developer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="3" />
          
          <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-3)', padding: '12px', background: 'var(--card-bg)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Architects Daughter', cursive" }}>Avatar Image</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <input placeholder="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} style={{ flex: 1, margin: 0 }} />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <button type="button" className="btn" disabled={uploading} style={{ whiteSpace: 'nowrap', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </button>
              </div>
            </div>
            {form.avatar && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={
                    form.avatar === '/hero.png'
                      ? heroImg
                      : form.avatar
                  } 
                  alt="Preview" 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)' }} 
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }} onClick={() => setForm({ ...form, avatar: '' })}>Remove</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: 'var(--border-style)', opacity: 0.8 }}>
            <h4 style={{ margin: '0 0 8px 0', fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold' }}>Social Links</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Социальные сети теперь управляются динамически в отдельной вкладке 
              <strong> «Social Links»</strong> на панели навигации сверху.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

function TrashView({ items, onRestore }) {
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
                <button className="btn" style={{ marginTop: '12px', background: '#10b981' }} onClick={() => onRestore(skill.id, 'skill')}>Restore</button>
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
                <button className="btn" style={{ marginTop: '12px', background: '#10b981' }} onClick={() => onRestore(project.id, 'project')}>Restore</button>
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
                <button className="btn" style={{ marginTop: '12px', background: '#10b981' }} onClick={() => onRestore(link.id, 'social-link')}>Restore</button>
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
                <button className="btn" style={{ marginTop: '12px', background: '#10b981' }} onClick={() => onRestore(msg.id, 'message')}>Restore</button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SocialLinkForm({ item, onSaveData, onCancel }) {
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
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// Confirm dialog component (replacement for window.confirm)
function ConfirmDialog({ message, onConfirm, onCancel, isOpen }) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: 'var(--card-bg)', color: 'var(--text)', padding: '24px',
          borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ marginBottom: '20px', fontSize: '16px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn" style={{ background: '#6b7280' }} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={onConfirm}>Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { logout, changePassword } = useAuth();
  const navigate = useNavigate();
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
    try {
      if (activeTab === 'skills') {
        const res = await api.get('/admin/skills');
        setItems(res.data);
      } else if (activeTab === 'projects') {
        const res = await api.get('/admin/projects');
        setItems(res.data);
      } else if (activeTab === 'messages') {
        const res = await api.get('/admin/messages');
        setMessages(res.data);
      } else if (activeTab === 'hero') {
        const res = await api.get('/portfolio/hero');
        let data = res.data;
        if (data.socialLinks && typeof data.socialLinks === 'string') {
          data = { ...data, socialLinks: JSON.parse(data.socialLinks) };
        }
        setHeroData(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      window.toast?.('Failed to load data', 'error');
    } finally {
      setLoading(false);
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
          await api.delete(`/portfolio/hero/${heroData.id}`);
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
        await api.put(`/portfolio/hero/${heroData.id}`, form);
        window.toast?.('Hero updated successfully', 'success');
      } else {
        await api.post('/portfolio/hero', form);
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
    if (activeTab === 'hero') return <HeroForm heroData={heroData || editingItem} onSaveData={handleSaveHero} onCancel={() => { setShowForm(false); setEditingItem(null); }} />;
    return null;
  };

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

  if (activeTab === 'settings') {
    return (
      <>
        <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} isOpen={!!confirmDialog} />
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '20px' }}>Admin Dashboard</h1>
          {passwordSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
              padding: '12px', background: '#10b981', color: 'white', borderRadius: '6px', marginBottom: '16px'
            }}>Пароль успешно изменён!</motion.div>
          )}
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h3>Change Password</h3>
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <input type="password" placeholder="Current password" value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: `1px solid ${passwordErrors.currentPassword ? '#ef4444' : 'var(--border)'}`, borderRadius: '6px', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  {passwordErrors.currentPassword && <span style={{ color: '#ef4444', fontSize: '12px' }}>{passwordErrors.currentPassword}</span>}
                </div>
                <div>
                  <input type="password" placeholder="New password (min. 6 characters)" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} minLength={6}
                    style={{ width: '100%', padding: '12px', border: `1px solid ${passwordErrors.newPassword ? '#ef4444' : 'var(--border)'}`, borderRadius: '6px', background: 'var(--input-bg)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  {passwordErrors.newPassword && <span style={{ color: '#ef4444', fontSize: '12px' }}>{passwordErrors.newPassword}</span>}
                </div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: '12px', width: '100%' }}>Сменить пароль</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  const typeLabel = activeTab === 'skills' ? 'skill' : activeTab === 'projects' ? 'project' : '';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} isOpen={!!confirmDialog} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <button onClick={async () => { await logout(); navigate('/'); }}
          style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['skills', 'projects', 'hero', 'messages', 'settings'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 16px', background: activeTab === tab ? 'var(--primary)' : 'var(--card-bg)',
              color: activeTab === tab ? 'white' : 'var(--text)', border: '1px solid var(--border)',
              borderRadius: '6px', cursor: 'pointer' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab !== 'messages' && activeTab !== 'hero' && (
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
                <button className="btn" style={{ marginTop: '10px', background: '#ef4444', position: 'absolute', top: '16px', right: '16px' }}
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
              {Object.entries(heroData.socialLinks || {}).map(([key, value]) =>
                value ? (<li key={key}><strong>{key}:</strong> <a href={value} target="_blank" rel="noopener noreferrer">{value}</a></li>) : null
              )}
            </ul>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="btn" onClick={() => { setEditingItem(heroData); setShowForm(true); }}>Edit</button>
              <button className="btn" style={{ background: '#ef4444' }} onClick={handleDeleteHero}>Delete</button>
            </div>
          </motion.div>
        )
      ) : items.length === 0 ? (
        <p>No items yet. Click the button above to add one.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <motion.div key={item.id} className="card" style={{ position: 'relative' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3>{item.name || item.title}</h3>
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
                  {item.link && <p><strong>Link:</strong> <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a></p>}
                  <p><strong>Technologies:</strong> {item.technologies}</p>
                  <p><strong>Sort Order:</strong> {item.sortOrder}</p>
                </>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button className="btn" onClick={() => { setEditingItem(item); setShowForm(true); }}>Edit</button>
                <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}>Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(item || { name: '', icon: '', description: '', level: 50, sortOrder: 0 });
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
    await onSaveData(form);
    setSaving(false);
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3>{item ? 'Edit Skill' : 'Add Skill'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              style={{ width: '100%', padding: '10px', border: errors.name ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '6px', boxSizing: 'border-box' }} />
            {errors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.name}</span>}
          </div>
          <input placeholder="Icon (e.g., react, node)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <input type="number" placeholder="Level (0-100)" value={form.level} onChange={(e) => setForm({ ...form, level: +e.target.value })} min="0" max="100" style={{ width: '100%', padding: '10px', border: errors.level ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '6px', boxSizing: 'border-box' }} />
            {errors.level && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.level}</span>}
          </div>
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" style={{ background: '#6b7280' }} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

function ProjectForm({ item, onSaveData, onCancel }) {
  const [form, setForm] = useState(item || { title: '', description: '', image: '', link: '', technologies: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
    await onSaveData(form);
    setSaving(false);
  };

  return (
    <motion.div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3>{item ? 'Edit Project' : 'Add Project'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              style={{ width: '100%', padding: '10px', border: errors.title ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '6px', boxSizing: 'border-box' }} />
            {errors.title && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.title}</span>}
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Image URL (or leave empty for upload feature)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input placeholder="Technologies (comma separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" style={{ background: '#6b7280' }} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

function HeroForm({ heroData, onSaveData, onCancel }) {
  const [form, setForm] = useState(heroData || { name: '', title: '', bio: '', avatar: '/favicon.svg', socialLinks: { github: '', linkedin: '', twitter: '' } });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { window.toast?.('Name is required', 'warning'); return; }
    setSaving(true);
    await onSaveData(form);
    setSaving(false);
  };

  const handleSocialChange = (key, value) => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: value } });

  return (
    <motion.div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary)' }}
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h3>{heroData?.id ? 'Edit Hero Section' : 'Create Hero Section'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Name (e.g., John Doe)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Title (e.g., Full Stack Developer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="3" />
          <input placeholder="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Social Links</h4>
            <input placeholder="GitHub URL" value={form.socialLinks?.github || ''} onChange={(e) => handleSocialChange('github', e.target.value)} />
            <input placeholder="LinkedIn URL" value={form.socialLinks?.linkedin || ''} onChange={(e) => handleSocialChange('linkedin', e.target.value)} />
            <input placeholder="Twitter URL" value={form.socialLinks?.twitter || ''} onChange={(e) => handleSocialChange('twitter', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn" style={{ background: '#6b7280' }} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}
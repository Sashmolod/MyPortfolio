import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { usePortfolioSettings } from '../../contexts/SettingsContext';
import { SketchLockIcon } from '../../components/SvgIllustrations';

import ConfirmDialog from '../components/ConfirmDialog';
import MediaTab from '../components/MediaTab';
import TrashView from '../components/TrashView';
import SkillForm from '../components/SkillForm';
import ProjectForm from '../components/ProjectForm';
import HeroForm from '../components/HeroForm';
import SocialLinkForm from '../components/SocialLinkForm';

export default function AdminDashboard() {
  const { logout, changePassword } = useAuth();
  const { settings, updateSettingsLocally, refreshSettings } = usePortfolioSettings();
  const [savingSettings, setSavingSettings] = useState(false);

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
    if (activeTab !== 'settings' && activeTab !== 'security') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const handleToggleSetting = async (key, currentValue) => {
    try {
      setSavingSettings(true);
      const nextValue = !currentValue;
      updateSettingsLocally({ [key]: nextValue });
      await api.put('/admin/settings', { [key]: nextValue });
      window.toast?.('Настройки обновлены / Settings updated', 'success');
      refreshSettings();
    } catch (err) {
      console.error(err);
      window.toast?.('Failed to save setting', 'error');
      updateSettingsLocally({ [key]: currentValue });
    } finally {
      setSavingSettings(false);
    }
  };

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

  const handlePermanentDelete = async (id, type) => {
    setConfirmDialog({
      message: `Are you sure you want to permanently delete this ${type}? This action is irreversible!`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/${type}/${id}/hard`);
          window.toast?.('Item permanently deleted', 'success');
          fetchData();
        } catch (err) {
          console.error('Error hard deleting:', err);
          window.toast?.('Error deleting item permanently: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
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

  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent('page-crumple-transition', {
      detail: { action: () => logout() }
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} isOpen={!!confirmDialog} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontFamily: "'Architects Daughter', cursive", fontWeight: 'bold' }}>Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['skills', 'projects', 'social-links', 'media', 'hero', 'messages', 'trash', 'settings', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'social-links' ? 'Social Links' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {activeTab !== 'messages' && activeTab !== 'hero' && activeTab !== 'trash' && activeTab !== 'settings' && activeTab !== 'security' && activeTab !== 'media' && (
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
        <TrashView items={items} onRestore={handleRestore} onDeletePermanently={handlePermanentDelete} />
      ) : activeTab === 'settings' ? (
        <div style={{ maxWidth: '520px', margin: '20px auto 0 auto' }}>
          <div className="card">
            <h3 style={{ fontFamily: "'Architects Daughter', cursive", marginBottom: '20px', fontWeight: 'bold', fontSize: '1.4rem' }}>
              Интерактивные функции и анимации
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'enableDoodly', label: 'Умная Скрепка Дудли (Smart Clip Helper)' },
                { key: 'enableSounds', label: 'Звуковые эффекты (Web Audio API)' },
                { key: 'enableBug', label: 'Пасхалка: Ползающий жучок (Sketchy Bug)' },
                { key: 'enablePageTear', label: 'Пасхалка: Загнутый уголок (Крестики-Нолики)' },
                { key: 'enableInkLeak', label: 'Пасхалка: Протекающие чернила (Header Double Click)' },
                { key: 'enableCoffeeSpill', label: 'Пасхалка: Проливаемая чашка кофе' },
                { key: 'enableDrawSkills', label: 'Анимация: Отрисовка линий навыков при скролле' },
                { key: 'enableEraser', label: 'Инструмент: Интерактивный ластик (Eraser Tool)' },
                { key: 'enableCrumpledPageTransition', label: 'Переходы: Сминание страницы при смене разделов' },
                {
                  key: 'showAdminLink',
                  label: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                      Отображать ссылку <SketchLockIcon size={16} /> Admin в шапке сайта
                    </span>
                  )
                },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: savingSettings ? 'default' : 'pointer',
                    fontSize: '14px',
                    fontFamily: "'Architects Daughter', cursive",
                    color: 'var(--text)',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!settings[key]}
                    disabled={savingSettings}
                    onChange={() => handleToggleSetting(key, settings[key])}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: savingSettings ? 'default' : 'pointer',
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'security' ? (
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
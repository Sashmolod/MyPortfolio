import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { usePortfolioSettings } from '../../contexts/SettingsContext';
import { SketchLockIcon } from '../../components/SvgIllustrations';
import { statsApi } from '../../api/statsApi';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';
import { soundSynth } from '../../utils/audioSynth';

import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MediaTab from '../components/MediaTab';
import SkillForm from '../components/SkillForm';
import ProjectForm from '../components/ProjectForm';
import HeroForm from '../components/HeroForm';
import SocialLinkForm from '../components/SocialLinkForm';
import StatsView from '../components/StatsView';
import SkillCategoryManager from './SkillCategoryManager';
import TabNavigation from './TabNavigation';
import SkillsList from './SkillsList';
import ProjectsList from './ProjectsList';
import SocialLinksList from './SocialLinksList';
import MessagesList from './MessagesList';
import DeletedItemsPanel from './DeletedItemsPanel';
import SettingsTab from '../components/SettingsTab';
import SecurityTab from '../components/SecurityTab';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { settings, updateSettingsLocally, refreshSettings } =
    usePortfolioSettings();
  const [savingSettings, setSavingSettings] = useState(false);

  const [activeTab, setActiveTab] = useState('skills');
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [statsEnabled, setStatsEnabled] = useState(true);

  // Fetch backend capability configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/portfolio/config');
        if (res.data && typeof res.data.statsEnabled === 'boolean') {
          setStatsEnabled(res.data.statsEnabled);
        }
      } catch (err) {
        console.error('Error fetching backend capabilities config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Synchronously update tab state, clear previous list, and display skeleton loader
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setItems([]);
  };

  // Stats state
  const [statsOverview, setStatsOverview] = useState(null);
  const [visitsList, setVisitsList] = useState([]);
  const [visitsMeta, setVisitsMeta] = useState(null);
  const [statsPage, setStatsPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(false);

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
      if (activeTab === 'categories') {
        // Categories are managed by SkillCategoryManager component
      } else if (activeTab === 'media') {
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
        const data = res.data;
        // Извлекаем hero объект из обёртки { hero: {...}, socialLinks: [...] }
        let hero = data.hero || data;
        // Парсим socialLinks (защита от двойного кодирования)
        let sl = data.socialLinks || data.socialLinksStr;
        while (sl && typeof sl === 'string') {
          try {
            sl = JSON.parse(sl);
          } catch {
            sl = {};
            break;
          }
        }
        // Преобразуем массив socialLinks в объект для обратной совместимости
        let socialLinksObj = {};
        if (Array.isArray(sl)) {
          socialLinksObj = sl.reduce((acc, link) => {
            acc[link.platform] = link.url;
            return acc;
          }, {});
        } else if (typeof sl === 'object') {
          socialLinksObj = sl;
        }
        hero = { ...hero, socialLinks: socialLinksObj };
        setHeroData(hero);
      } else if (activeTab === 'trash') {
        const [skillsRes, projectsRes, messagesRes, socialLinksRes] =
          await Promise.all([
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
      window.toast?.(
        'Error restoring item: ' + (err.response?.data?.message || err.message),
        'error'
      );
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
          window.toast?.(
            'Error deleting item permanently: ' +
              (err.response?.data?.message || err.message),
            'error'
          );
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
          window.toast?.(
            `${type.slice(0, -1)} deleted successfully`,
            'success'
          );
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
    if (!heroData?.id) {return;}
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
          window.toast?.(
            'Error deleting hero: ' +
              (err.response?.data?.message || err.message),
            'error'
          );
        } finally {
          setConfirmDialog(null);
        }
      },
    });
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
      fetchData();
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      window.toast?.(
        `Error saving ${type}: ` + (err.response?.data?.message || err.message),
        'error'
      );
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
      fetchData();
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      window.toast?.(
        'Error saving hero: ' + (err.response?.data?.message || err.message),
        'error'
      );
    }
  };

  const renderForm = () => {
    if (activeTab === 'skills')
      {return (
        <SkillForm
          item={editingItem}
          onSaveData={(form) => handleSave('skill', form)}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      );}
    if (activeTab === 'projects')
      {return (
        <ProjectForm
          item={editingItem}
          onSaveData={(form) => handleSave('project', form)}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      );}
    if (activeTab === 'social-links')
      {return (
        <SocialLinkForm
          item={editingItem}
          onSaveData={(form) => handleSave('social-link', form)}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      );}
    if (activeTab === 'hero')
      {return (
        <HeroForm
          heroData={heroData || editingItem}
          onSaveData={handleSaveHero}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      );}
    return null;
  };

  const typeLabel =
    activeTab === 'skills'
      ? 'skill'
      : activeTab === 'projects'
        ? 'project'
        : activeTab === 'social-links'
          ? 'social-link'
          : '';

  const typeLabelMapped =
    activeTab === 'skills'
      ? t('Навык / Skill')
      : activeTab === 'projects'
        ? t('Проект / Project')
        : activeTab === 'social-links'
          ? t('Ссылка / Social Link')
          : '';

  // Loading skeleton component
  function SkeletonCard() {
    return (
      <div
        className="card"
        style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
      >
        <div
          style={{
            height: '20px',
            background: 'var(--border)',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
        <div
          style={{
            height: '14px',
            background: 'var(--border)',
            borderRadius: '4px',
            width: '80%',
          }}
        />
        <div
          style={{
            height: '14px',
            background: 'var(--border)',
            borderRadius: '4px',
            width: '60%',
            marginTop: '8px',
          }}
        />
      </div>
    );
  }

  const handleLogout = () => {
    window.dispatchEvent(
      new CustomEvent('page-crumple-transition', {
        detail: { action: () => logout() },
      })
    );
  };

  // Stats functions
  const fetchStatsOverview = async () => {
    setStatsLoading(true);
    try {
      const data = await statsApi.getOverview();
      setStatsOverview(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      window.toast?.('Failed to load stats', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchVisits = async (page = 1) => {
    setStatsLoading(true);
    try {
      const data = await statsApi.getVisits({ page, limit: 20 });
      setVisitsList(data.visits);
      setVisitsMeta({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
      setStatsPage(page);
    } catch (err) {
      console.error('Error fetching visits:', err);
      window.toast?.('Failed to load visits', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCleanupStats = async (days = 30) => {
    const periodLabel =
      days === 0
        ? 'ВСЕ записи о визитах'
        : `записи о визитах старше ${days} дней`;
    setConfirmDialog({
      message: `Вы действительно хотите удалить ${periodLabel}? / Are you sure you want to delete visits: ${periodLabel}?`,
      onConfirm: async () => {
        try {
          const result = await statsApi.cleanupVisits(days);
          window.toast?.(result.message, 'success');
          fetchStatsOverview();
          fetchVisits(statsPage);
        } catch (err) {
          console.error('Error cleaning up stats:', err);
          window.toast?.('Failed to cleanup stats', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStatsOverview();
      fetchVisits(1);
    }
    return () => {
      // cleanup
    };
  }, [activeTab]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Helmet>
        <title>{t('Админ-панель / Admin Dashboard')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ConfirmDialog
        {...confirmDialog}
        onCancel={() => setConfirmDialog(null)}
        isOpen={!!confirmDialog}
      />

      <div

        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--bg)',
          paddingTop: '15px',
          paddingBottom: '15px',
          borderBottom: '2px dashed var(--border-color)',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Architects Daughter', cursive",
              fontWeight: 'bold',
            }}
          >
            {t('Панель управления / Admin Dashboard')}
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setLanguage(language === 'ru' ? 'en' : 'ru');
                soundSynth.playPageFlip();
              }}
              style={{
                background: 'none',
                border: 'var(--border-style)',
                borderRadius: 'var(--sketch-radius-3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)',
                outline: 'none',
                padding: '3px 8px',
                fontSize: '13px',
                fontWeight: 'bold',
                fontFamily: "'Architects Daughter', cursive",
              }}
              title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
              aria-label="Toggle language"
            >
              {language === 'ru' ? 'EN' : 'RU'}
            </button>
            <button onClick={handleLogout} className="btn btn-danger" style={{ marginBottom: 0 }}>
              {t('logout')}
            </button>
          </div>
        </div>

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} statsEnabled={statsEnabled} />
      </div>

      {activeTab !== 'messages' &&
        activeTab !== 'hero' &&
        activeTab !== 'trash' &&
        activeTab !== 'stats' &&
        activeTab !== 'settings' &&
        activeTab !== 'security' &&
        activeTab !== 'media' &&
        activeTab !== 'categories' && (
          <button
            className="btn"
            onClick={() => setShowForm(true)}
            style={{ marginBottom: '20px' }}
          >
            {t('+ Добавить / + Add') + ' ' + typeLabelMapped}
          </button>
        )}

      {showForm && renderForm()}

      {loading ? (
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : activeTab === 'hero' ? (
        !heroData ? (
          <div
            className="card"
            style={{ marginBottom: '20px', textAlign: 'center' }}
          >
            <p>No hero data yet.</p>
            <button
              className="btn"
              onClick={() => setShowForm(true)}
              style={{ marginTop: '10px' }}
            >
              + Create Hero Section
            </button>
          </div>
        ) : (
          <motion.div
            className="card"
            style={{ marginBottom: '20px', position: 'relative' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>{heroData.name || 'Hero Section'}</h3>
            <p>
              <strong>Title:</strong> {heroData.title}
            </p>
            <p>
              <strong>Bio:</strong> {heroData.bio}
            </p>
            <p>
              <strong>Avatar:</strong> {heroData.avatar}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                className="btn"
                onClick={() => {
                  setEditingItem(heroData);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDeleteHero}>
                Delete
              </button>
            </div>
          </motion.div>
        )
      ) : activeTab === 'media' ? (
        <MediaTab items={items} refresh={fetchData} />
      ) : activeTab === 'stats' ? (
        <StatsView
          statsOverview={statsOverview}
          visitsList={visitsList}
          visitsMeta={visitsMeta}
          statsPage={statsPage}
          statsLoading={statsLoading}
          onFetchOverview={fetchStatsOverview}
          onFetchVisits={(page) => fetchVisits(page || statsPage)}
          onCleanup={handleCleanupStats}
        />
      ) : activeTab === 'trash' ? (
        <DeletedItemsPanel
          deletedItems={(() => {
            if (!items || typeof items !== 'object' || Array.isArray(items)) {return [];}
            return Object.entries(items).flatMap(([type, list]) => {
              if (!Array.isArray(list)) {return [];}
              const singularType = type === 'socialLinks' ? 'social-link' : type.slice(0, -1);
              return list.map(item => ({ ...item, type: singularType }));
            });
          })()}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />
      ) : activeTab === 'categories' ? (
        <SkillCategoryManager />
      ) : activeTab === 'skills' ? (
        <SkillsList
          skills={items}
          onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
          onDelete={(id) => handleDelete(id, 'skill')}
        />
      ) : activeTab === 'projects' ? (
        <ProjectsList
          projects={items}
          onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
          onDelete={(id) => handleDelete(id, 'project')}
        />
      ) : activeTab === 'social-links' ? (
        <SocialLinksList
          links={items}
          onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
          onDelete={(id) => handleDelete(id, 'social-link')}
        />
      ) : activeTab === 'messages' ? (
        <MessagesList
          messages={messages}
          onDelete={(id) => handleDelete(id, 'message')}
        />
      ) : activeTab === 'settings' ? (
        <SettingsTab
          settings={settings}
          savingSettings={savingSettings}
          onToggleSetting={handleToggleSetting}
        />
      ) : activeTab === 'security' ? (
        <SecurityTab />
      ) : null}
    </div>
  );
}


import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const TABS = [
  { key: 'skills', tabKey: 'tabSkills' },
  { key: 'projects', tabKey: 'tabProjects' },
  { key: 'social-links', tabKey: 'tabSocialLinks' },
  { key: 'messages', tabKey: 'tabMessages' },
  { key: 'hero', tabKey: 'tabHero' },
  { key: 'categories', tabKey: 'tabCategories' },
  { key: 'media', tabKey: 'tabMedia' },
  { key: 'stats', tabKey: 'tabStats' },
  { key: 'trash', tabKey: 'tabTrash' },
  { key: 'settings', tabKey: 'tabSettings' },
  { key: 'security', tabKey: 'tabSecurity' },
];

export default function TabNavigation({ activeTab, onTabChange, statsEnabled = true }) {
  const { t } = useLanguage();
  
  const filteredTabs = TABS.filter((tab) => {
    if (tab.key === 'stats' && !statsEnabled) {
      return false;
    }
    return true;
  });

  return (
    <motion.div
      className="card"
      style={{ marginBottom: '20px', padding: '0' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          padding: '8px',
        }}
      >
        {filteredTabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
            style={{
              whiteSpace: 'nowrap',
              margin: 0,
              flexShrink: 0,
            }}
          >
            {t(tab.tabKey)}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
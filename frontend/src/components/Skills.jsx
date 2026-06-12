import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CodeIcon } from './SvgIllustrations';
import { usePortfolioSettings } from '../contexts/SettingsContext';
import { statsApi } from '../api/statsApi';
import { useLanguage } from '../contexts/LanguageContext';

function SkillIcon({ iconKey, name, size = 20 }) {
  const { settings } = usePortfolioSettings();
  if (!iconKey) return <CodeIcon size={size} />;
  let key = iconKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'sql') key = 'postgresql';
  if (key === 'js') key = 'javascript';
  if (key === 'node') key = 'nodejs';
  const url = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg`;
  if (settings?.enableDrawSkills) {
    return <img src={url} alt={name} width={size} height={size} className="draw-svg-icon" style={{ objectFit: 'contain', opacity: 0.7 }} onError={(e) => { e.target.style.display = 'none'; }} />;
  }
  return <img src={url} alt={name} width={size} height={size} style={{ objectFit: 'contain' }} onError={(e) => { if (!e.target.src.includes('-plain')) e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`; else e.target.style.display = 'none'; }} />;
}

function SkillBadge({ skill, compact = false }) {
  const { t } = useLanguage();
  const displayName = t(skill.name);
  const displayDesc = skill.description ? t(skill.description) : `${displayName}: ${skill.level}%`;
  return (
    <motion.div
      title={displayDesc}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--bg)',
        border: '1.5px solid var(--border-color)',
        borderRadius: compact ? 'var(--sketch-radius-3)' : 'var(--sketch-radius-1)',
        padding: compact ? '4px 10px' : '6px 12px',
        fontSize: compact ? '0.8rem' : '0.9rem',
        cursor: 'default',
        boxShadow: '1.5px 1.5px 0px var(--border-color)',
        transition: 'box-shadow 0.2s ease',
      }}
      whileHover={{
        scale: 1.05,
        rotate: [0, -1, 1, 0],
        boxShadow: '3px 3px 0px var(--border-color)',
      }}
    >
      <SkillIcon iconKey={skill.icon} name={displayName} size={compact ? 14 : 18} />
      <span style={{ fontWeight: 'bold' }}>{displayName}</span>
      <span style={{
        color: 'var(--secondary)',
        fontSize: compact ? '0.65rem' : '0.75rem',
        fontFamily: "'Architects Daughter', cursive"
      }}>
        {skill.level}%
      </span>
    </motion.div>
  );
}

export default function Skills() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    statsApi.getSkillCategories()
      .then((res) => {
        const cats = res || [];
        setCategories(cats);
        // Expand all by default
        const defaultExpanded = {};
        cats.forEach(c => {
          defaultExpanded[c.id] = true;
        });
        setExpanded(defaultExpanded);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const expandAll = () => { const all = {}; categories.forEach(c => { all[c.id] = true; }); setExpanded(all); };
  const collapseAll = () => setExpanded({});

  if (loading) return <section id="skills"><h2>{t('skills')}</h2><p>{t('loading')}</p></section>;

  return (
    <section id="skills">
      <h2>
        {t('skills')}
        {categories.length > 0 && (
          <span style={{ fontSize: '0.6em', marginLeft: '1rem', fontWeight: 'normal' }}>
            <button
              onClick={expandAll}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                marginRight: '0.5rem',
                textDecoration: 'underline',
                textDecorationStyle: 'dashed'
              }}
            >
              {t('all')}
            </button>
            <button
              onClick={collapseAll}
              style={{
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                textDecoration: 'underline',
                textDecorationStyle: 'dashed'
              }}
            >
              {t('none')}
            </button>
          </span>
        )}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '30px',
      }}>
        {categories.map((cat) => {
          const cs = (cat.skills || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          const subs = (cat.subcategories || []).filter(s => (s.skills || []).length > 0).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          if (!cs.length && !subs.length) return null;

          const isExp = expanded[cat.id];
          const total = cs.length + subs.reduce((s, sub) => s + sub.skills.length, 0);

          return (
            <motion.div
              key={cat.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '20px',
                cursor: 'pointer',
              }}
              onClick={() => toggle(cat.id)}
            >
              {/* Category Header */}
              <h3 style={{
                fontFamily: "'Architects Daughter', cursive",
                fontSize: '1.3rem',
                color: 'var(--primary)',
                marginBottom: isExp ? '16px' : '0',
                borderBottom: isExp ? '2px dashed var(--border-color)' : 'none',
                paddingBottom: isExp ? '8px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                userSelect: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{isExp ? '▼' : '▶'}</span>
                  <span>{isExp ? '📂' : '📁'}</span>
                  <span>{t(cat.name)}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                  ({total})
                </span>
              </h3>

              {/* Skills Area */}
              {isExp && (
                <div
                  onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside the card
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px', flex: 1 }}
                >
                  {/* Direct Skills */}
                  {cs.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cs.map((skill) => (
                        <SkillBadge key={skill.id} skill={skill} />
                      ))}
                    </div>
                  )}

                  {/* Subcategories */}
                  {subs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                      {subs.map((sub) => (
                        <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: 'var(--text-muted)',
                            fontFamily: "'Architects Daughter', cursive",
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            paddingBottom: '2px'
                          }}>
                            {t(sub.name)}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {(sub.skills || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((skill) => (
                              <SkillBadge key={skill.id} skill={skill} compact />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
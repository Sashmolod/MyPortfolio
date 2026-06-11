import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CodeIcon } from './SvgIllustrations';
import { usePortfolioSettings } from '../contexts/SettingsContext';
import { statsApi } from '../api/statsApi';

function SkillIcon({ iconKey, name, size = 48 }) {
  const { settings } = usePortfolioSettings();
  const [svgContent, setSvgContent] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const drawAnimation = settings?.enableDrawSkills;

  useEffect(() => {
    if (!drawAnimation || !iconKey) return;
    let key = iconKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key === 'sql') key = 'postgresql';
    if (key === 'js') key = 'javascript';
    if (key === 'node') key = 'nodejs';
    const url = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg`;
    fetch(url)
      .then((res) => { if (!res.ok) throw new Error('Not found'); return res.text(); })
      .then((text) => { setSvgContent(text); setFetchFailed(false); })
      .catch(() => {
        const plainUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`;
        fetch(plainUrl)
          .then((res) => { if (!res.ok) throw new Error('Not found'); return res.text(); })
          .then((text) => { setSvgContent(text); setFetchFailed(false); })
          .catch(() => { setFetchFailed(true); });
      });
  }, [iconKey, drawAnimation]);

  if (!iconKey) return <CodeIcon size={size} />;
  if (drawAnimation && svgContent && !fetchFailed) {
    const cleanSvg = svgContent
      .replace(/<svg/, `<svg width="${size}" height="${size}" class="draw-svg-icon"`)
      .replace(/<\/svg>/, `<style>.draw-svg-icon path,.draw-svg-icon rect,.draw-svg-icon circle,.draw-svg-icon polygon{stroke-dasharray:1000;stroke-dashoffset:1000;animation:drawPathAnim 3.2s cubic-bezier(0.4,0,0.2,1) forwards;stroke:var(--text)!important;stroke-width:1.5px!important;fill:none!important}@keyframes drawPathAnim{to{stroke-dashoffset:0}}</style></svg>`);
    return <div style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
  }
  let key = iconKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'sql') key = 'postgresql';
  if (key === 'js') key = 'javascript';
  if (key === 'node') key = 'nodejs';
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-original.svg`}
      alt={name} width={size} height={size} style={{ objectFit: 'contain' }}
      onError={(e) => {
        if (!e.target.src.includes('-plain')) { e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${key}/${key}-plain.svg`; }
        else { e.target.style.display = 'none'; }
      }}
    />
  );
}

function renderSkills(skills, prefix = '') {
  const sorted = (skills || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  if (sorted.length === 0) return null;

  return (
    <>
      {sorted.map((skill, index) => (
        <motion.div
          key={skill.id || `${prefix}${skill.name}`}
          className="card skill-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          viewport={{ once: true }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <SkillIcon iconKey={skill.icon} name={skill.name} size={48} />
          </div>
          <h3>{skill.name}</h3>
          <p>{skill.description || 'No description'}</p>
          <div className="level-bar">
            <div className="level-fill" style={{ width: `${skill.level}%` }} />
          </div>
        </motion.div>
      ))}
    </>
  );
}

export default function Skills() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getSkillCategories()
      .then((res) => {
        setCategories(res || []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section id="skills"><h2>Skills</h2><p>Loading skills...</p></section>;
  }

  return (
    <section id="skills">
      <h2>Skills</h2>
      {categories.map((category) => {
        const categorySkills = category.skills || [];
        const subs = (category.subcategories || []).sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );

        const subsWithSkills = subs.filter(
          (sub) => (sub.skills || []).length > 0
        );

        const hasAnySkills = categorySkills.length > 0 || subsWithSkills.length > 0;
        if (!hasAnySkills) return null;

        return (
          <div key={category.id} style={{ marginBottom: '2rem' }}>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              style={{
                color: 'var(--primary)',
                marginBottom: '1rem',
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '0.5rem'
              }}
            >
              {category.name}
            </motion.h3>

            {/* Навыки категории */}
            {renderSkills(categorySkills)}

            {/* Подкатегории с навыками */}
            {subsWithSkills.map((sub) => (
              <div key={sub.id} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  paddingLeft: '1rem'
                }}>
                  {sub.name}
                </h4>
                <div className="grid">
                  {renderSkills(sub.skills, `${sub.id}-`)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
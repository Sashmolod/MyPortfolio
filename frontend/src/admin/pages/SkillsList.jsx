import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

function SkillRow({ skill, onEdit, onDelete }) {
  const { t } = useLanguage();
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        marginBottom: '10px',
        background: 'var(--card-bg)',
        border: 'var(--border-style)',
        borderRadius: 'var(--sketch-radius-3)',
        boxShadow: '3px 3px 0px var(--border-color)',
        gap: '16px',
        flexWrap: 'wrap',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-radius 0.3s ease',
      }}
      whileHover={{
        transform: 'translate(-2px, -2px)',
        boxShadow: '5px 5px 0px var(--border-color)',
        borderRadius: 'var(--sketch-radius-1)',
      }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Icon & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', flex: '1 1 200px' }}>
        {skill.icon && <span style={{ fontSize: '1.2rem' }}>{skill.icon}</span>}
        <strong style={{ fontSize: '15px' }}>{skill.name}</strong>
        {skill.subcategory && (
          <span style={{
            fontSize: '11px',
            opacity: 0.7,
            border: '1px solid var(--border-color)',
            padding: '1px 6px',
            borderRadius: '10px',
            whiteSpace: 'nowrap'
          }}>
            {skill.subcategory}
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        flex: '3 1 250px',
        minWidth: '180px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }} title={skill.description}>
        {skill.description || 'Нет описания / No description'}
      </div>

      {/* Level bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '140px', flex: '1 1 150px' }}>
        <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: `${skill.level}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-family)', width: '40px', textAlign: 'right' }}>
          {skill.level}%
        </span>
      </div>

      {/* Sort order */}
      <div style={{ fontSize: '12px', opacity: 0.7, minWidth: '60px', textAlign: 'center' }}>
        {t('Сортировка: / Sort:')} <strong>{skill.sortOrder}</strong>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          className="btn"
          onClick={() => onEdit(skill)}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            boxShadow: '2px 2px 0px var(--border-color)',
            width: 'auto',
            marginBottom: 0
          }}
        >
          {t('Редактировать / Edit')}
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(skill.id, 'skill')}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            boxShadow: '2px 2px 0px var(--border-color)',
            width: 'auto',
            marginBottom: 0
          }}
        >
          {t('Удалить / Delete')}
        </button>
      </div>
    </motion.div>
  );
}

export default function SkillsList({ skills = [], onEdit, onDelete }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('sortOrder-asc');

  const filteredAndSortedSkills = useMemo(() => {
    // 1. Filter
    let result = (Array.isArray(skills) ? skills : []).filter(skill => {
      const query = searchQuery.toLowerCase();
      return (
        (skill.name || '').toLowerCase().includes(query) ||
        (skill.subcategory || '').toLowerCase().includes(query) ||
        (skill.description || '').toLowerCase().includes(query)
      );
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === 'sortOrder-asc') {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      if (sortBy === 'sortOrder-desc') {
        return (b.sortOrder || 0) - (a.sortOrder || 0);
      }
      if (sortBy === 'level-desc') {
        return (b.level || 0) - (a.level || 0);
      }
      if (sortBy === 'level-asc') {
        return (a.level || 0) - (b.level || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    return result;
  }, [skills, searchQuery, sortBy]);

  const grouped = filteredAndSortedSkills.reduce((acc, skill) => {
    const cat = skill.category || 'Без категории';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder={t('Поиск по названию, подкатегории или описанию... / Search by name, subcategory or description...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: '1 1 300px',
            margin: 0,
            padding: '8px 12px',
            fontSize: '14px',
            width: 'auto',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 auto' }}>
          <span style={{ fontSize: '14px', fontFamily: 'var(--font-family)', whiteSpace: 'nowrap' }}>
            {t('Сортировка: / Sort by:')}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              margin: 0,
              padding: '8px 12px',
              fontSize: '14px',
              width: '180px',
              cursor: 'pointer'
            }}
          >
            <option value="sortOrder-asc">{t('Порядок (возр.) / Order (asc)')}</option>
            <option value="sortOrder-desc">{t('Порядок (убыв.) / Order (desc)')}</option>
            <option value="level-desc">{t('Уровень (убыв.) / Level (desc)')}</option>
            <option value="level-asc">{t('Уровень (возр.) / Level (asc)')}</option>
            <option value="name-asc">{t('Имя (А-Я) / Name (A-Z)')}</option>
            <option value="name-desc">{t('Имя (Я-А) / Name (Z-A)')}</option>
          </select>
        </div>
      </div>

      {Object.entries(grouped).map(([category, categorySkills]) => (
        <motion.div
          key={category}
          style={{ marginBottom: '30px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2
            style={{
              fontFamily: "'Architects Daughter', cursive",
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '10px',
              marginBottom: '20px',
              fontSize: '1.5rem',
              color: 'var(--accent)',
            }}
          >
            {category}
            <span style={{ fontSize: '0.9rem', opacity: 0.6, marginLeft: '10px' }}>
              ({categorySkills.length})
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categorySkills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
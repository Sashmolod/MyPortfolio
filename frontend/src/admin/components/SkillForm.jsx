import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function SkillForm({ item, onSaveData, onCancel }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => {
    if (item)
      {return {
        name: item.name || '',
        icon: item.icon || '',
        description: item.description || '',
        level: item.level ?? 50,
        sortOrder: item.sortOrder ?? 0,
        categoryId: item.categoryId != null ? String(item.categoryId) : '',
        subcategoryId: item.subcategoryId != null ? String(item.subcategoryId) : '',
      };}
    return { name: '', icon: '', description: '', level: 50, sortOrder: 0, categoryId: '', subcategoryId: '' };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/admin/skill-categories/flat');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch skill categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      if (cat.parentId === null || cat.parentId === undefined) {map.set(cat.id, []);}
    }
    for (const sub of categories) {
      if (sub.parentId !== null && sub.parentId !== undefined) {
        const parentSubs = map.get(sub.parentId) || [];
        parentSubs.push(sub);
        map.set(sub.parentId, parentSubs);
      }
    }
    return map;
  }, [categories]);

  const selectedCategory = useMemo(() => {
    if (!form.categoryId) {return null;}
    return categories.find((c) => c.id === Number(form.categoryId)) || null;
  }, [categories, form.categoryId]);

  const subcategories = selectedCategory ? (categoryMap.get(selectedCategory.id) || []) : [];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {errs.name = 'Название обязательно / Name is required';}
    if (form.level < 0 || form.level > 100) {errs.level = 'Уровень должен быть от 0 до 100 / Level must be 0-100';}
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {return;}
    setSaving(true);
    await onSaveData({
      name: form.name,
      icon: form.icon,
      description: form.description,
      level: form.level,
      sortOrder: form.sortOrder,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
    });
    setSaving(false);
  };

  const handleCategoryChange = (e) => {
    setForm({ ...form, categoryId: e.target.value, subcategoryId: '' });
  };

const ICON_MAPPINGS = {
  sql: 'postgresql',
  postgres: 'postgresql',
  js: 'javascript',
  node: 'nodejs',
  mongo: 'mongodb',
  aws: 'amazonwebservices',
  css: 'css3',
  html: 'html5',
  vue: 'vuejs',
  javaspring: 'spring',
  rubyonrails: 'rails',
  aspnet: 'dotnetcore',
  elk: 'elasticsearch',
  mssql: 'microsoftsqlserver',
  kafka: 'apachekafka',
};

  const renderIconPreview = () => {
    if (!form.icon) {return null;}
    const keyRaw = form.icon.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const previewKey = ICON_MAPPINGS[keyRaw] || keyRaw;
    return (
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${previewKey}/${previewKey}-original.svg`}
        alt={form.icon}
        width={40}
        height={40}
        style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)', padding: '4px', background: 'var(--card-bg)' }}
        onError={(e) => { e.target.src = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${previewKey}/${previewKey}-plain.svg`; }}
      />
    );
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold', marginBottom: '20px' }}>
        {item ? t('Редактировать навык / Edit Skill') : t('Добавить навык / Add Skill')}
      </h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            placeholder={t('Название / Name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name ? t(errors.name) : null}
            required
          />
          
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                placeholder={t('Ключ иконки (например, react, typescript, docker) / Icon key (e.g., react, typescript, docker)')}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value.trim().toLowerCase() })}
                containerStyle={{ flex: 1 }}
                style={{ margin: 0 }}
              />
              {renderIconPreview()}
            </div>
          </div>

          <Input
            placeholder={t('Описание / Description')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            type="number"
            placeholder={t('Уровень (0-100) / Level (0-100)')}
            value={form.level}
            onChange={(e) => setForm({ ...form, level: +e.target.value })}
            min="0"
            max="100"
            error={errors.level ? t(errors.level) : null}
            required
          />

          <Input
            type="number"
            placeholder={t('Порядок сортировки / Sort Order')}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })}
          />

          <Select
            label={t('Категория / Category')}
            value={form.categoryId}
            onChange={handleCategoryChange}
            loading={loadingCategories}
          >
            <option value="">{t('Без категории / No category')}</option>
            {categories.filter(c => c.parentId === null || c.parentId === undefined).map(cat => (
              <option key={cat.id} value={cat.id}>{t(cat.name)}</option>
            ))}
          </Select>

          {form.categoryId && (
            <Select
              label={t('Подкатегория / Subcategory')}
              value={form.subcategoryId}
              onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
            >
              <option value="">{t('Без подкатегории / No subcategory')}</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{t(sub.name)}</option>
              ))}
            </Select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <Button type="submit" variant="primary" loading={saving}>
            {t('Сохранить / Save')}
          </Button>
          <Button onClick={onCancel}>
            {t('Отмена / Cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
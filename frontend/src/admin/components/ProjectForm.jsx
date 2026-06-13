import { useState, useEffect } from 'react';
import api from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';

function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

export default function ProjectForm({ item, onSaveData, onCancel }) {
  const { t } = useLanguage();
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
    if (!form.title.trim()) {
      errs.title = 'Название обязательно / Title is required';
    }
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
    <Card style={{ marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold', marginBottom: '20px' }}>
        {item ? t('Редактировать проект / Edit Project') : t('Добавить проект / Add Project')}
      </h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            placeholder={t('Название / Title')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title ? t(errors.title) : null}
            required
          />
          
          <TextArea
            placeholder={t('Описание / Description')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />

          <Card style={{ padding: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-family)' }}>
              {t('Изображение проекта / Project Image')}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <Input
                placeholder={t('URL изображения / Image URL')}
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                containerStyle={{ flex: 1 }}
                style={{ margin: 0 }}
              />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <Button type="button" disabled={uploading} style={{ whiteSpace: 'nowrap', margin: 0 }}>
                  {uploading ? t('Загрузка... / Uploading...') : t('Загрузить изображение / Upload Image')}
                </Button>
              </div>
            </div>
            {uploading && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ border: 'var(--border-style)', borderRadius: 'var(--sketch-radius-2)', height: '14px', position: 'relative', overflow: 'hidden', background: 'var(--input-bg)' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--text)', transition: 'width 0.1s ease', backgroundImage: 'repeating-linear-gradient(45deg, var(--bg) 0px, var(--bg) 2px, transparent 2px, transparent 10px)' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-family)', fontSize: '11px', textAlign: 'center', marginTop: '2px', fontWeight: 'bold' }}>
                  {t('Загрузка: / Uploading:')} {uploadProgress}%
                </div>
              </div>
            )}
            {form.image && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={form.image} alt="Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <Button variant="danger" style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }} onClick={() => setForm({ ...form, image: '' })}>
                  {t('Удалить / Remove')}
                </Button>
              </div>
            )}
          </Card>

          <Input
            placeholder={t('Ссылка / Link')}
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          
          <Input
            type="number"
            placeholder={t('Порядок сортировки / Sort Order')}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })}
          />

          <Card style={{ padding: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-family)' }}>
              {t('Навыки (кликните для выбора) / Skills (click to select)')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <Button
                    key={skill.id}
                    type="button"
                    variant={isSelected ? 'primary' : 'default'}
                    onClick={() => toggleSkill(skill.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '13px',
                      margin: 0,
                    }}
                  >
                    {skill.name} {isSelected ? '✓' : ''}
                  </Button>
                );
              })}
              {skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--secondary)', fontFamily: 'var(--font-family)' }}>{t('Нет доступных навыков / No skills available')}</span>}
            </div>
          </Card>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <Button type="submit" variant="primary" loading={saving}>
              {t('Сохранить / Save')}
            </Button>
            <Button onClick={onCancel}>
              {t('Отмена / Cancel')}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

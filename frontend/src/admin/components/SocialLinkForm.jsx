import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function pick(obj, keys) {
  const result = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) result[k] = obj[k];
  }
  return result;
}

export default function SocialLinkForm({ item, onSaveData, onCancel }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => {
    if (item) return pick(item, ['platform', 'url', 'sortOrder']);
    return { platform: '', url: '', sortOrder: 0 };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.platform.trim()) errs.platform = 'Платформа обязательна / Platform is required';
    if (!form.url.trim()) errs.url = 'URL обязателен / URL is required';
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
    <Card style={{ marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold', marginBottom: '20px' }}>
        {item ? t('Редактировать ссылку / Edit Social Link') : t('Добавить ссылку / Add Social Link')}
      </h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            placeholder={t('Платформа (например, GitHub, Reddit) / Platform (e.g. GitHub, Reddit)')}
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            error={errors.platform ? t(errors.platform) : null}
            required
          />
          <Input
            placeholder={t('URL (например, https://github.com/...) / URL (e.g. https://github.com/...)')}
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            error={errors.url ? t(errors.url) : null}
            required
          />
          <Input
            type="number"
            label={t('Порядок сортировки / Sort Order')}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
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

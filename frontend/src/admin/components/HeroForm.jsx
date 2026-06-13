import { useState } from 'react';
import api from '../../api';
import heroImg from '../../assets/hero.png';
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

function boxBlur(src, width, height, radius) {
  const dest = new Uint8ClampedArray(src.length);
  const temp = new Uint8ClampedArray(src.length);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const px = x + k;
        if (px >= 0 && px < width) {
          sum += src[y * width + px];
          count++;
        }
      }
      temp[y * width + x] = Math.round(sum / count);
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const py = y + k;
        if (py >= 0 && py < height) {
          sum += temp[py * width + x];
          count++;
        }
      }
      dest[y * width + x] = Math.round(sum / count);
    }
  }

  return dest;
}

function convertToSketch(imgElement) {
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth || imgElement.width;
  canvas.height = imgElement.naturalHeight || imgElement.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  const grayscale = new Uint8ClampedArray(len / 4);
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayscale[i / 4] = gray;
  }

  const inverted = new Uint8ClampedArray(grayscale.length);
  for (let i = 0; i < grayscale.length; i++) {
    inverted[i] = 255 - grayscale[i];
  }

  const blurred = boxBlur(inverted, canvas.width, canvas.height, 4);

  for (let i = 0; i < len; i += 4) {
    const grayVal = grayscale[i / 4];
    const blurVal = blurred[i / 4];

    let blend = 255;
    if (blurVal < 255) {
      blend = Math.min(255, Math.floor((grayVal * 255) / (255 - blurVal)));
    }

    data[i] = blend;
    data[i + 1] = blend;
    data[i + 2] = blend;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

export default function HeroForm({ heroData, onSaveData, onCancel }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => {
    if (heroData) {
      return pick(heroData, ['name', 'title', 'bio', 'avatar']);
    }
    return { name: '', title: '', bio: '', avatar: '' };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sketching, setSketching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      window.toast?.(t('Имя обязательно для заполнения / Name is required'), 'warning');
      return;
    }
    setSaving(true);
    const payload = {};
    if (form.name?.trim()) payload.name = form.name.trim();
    if (form.title?.trim()) payload.title = form.title.trim();
    if (form.bio?.trim()) payload.bio = form.bio.trim();
    if (form.avatar?.trim()) payload.avatar = form.avatar.trim();
    await onSaveData(payload);
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
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
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      if (res.data && res.data.url) {
        setForm((prev) => ({ ...prev, avatar: res.data.url }));
        window.toast?.('Avatar uploaded successfully', 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      window.toast?.(
        'Failed to upload avatar: ' +
          (err.response?.data?.message || err.message),
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleMakeSketch = async () => {
    if (!form.avatar) return;
    setSketching(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = form.avatar === '/hero.png' ? heroImg : form.avatar;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () =>
          reject(new Error('Failed to load avatar image for sketching'));
      });

      const dataUrl = convertToSketch(img);
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], 'sketch_avatar.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.url) {
        setForm((prev) => ({ ...prev, avatar: res.data.url }));
        window.toast?.('Avatar converted to sketch successfully', 'success');
      }
    } catch (err) {
      console.error('Sketch conversion error:', err);
      window.toast?.('Failed to convert to sketch: ' + err.message, 'error');
    } finally {
      setSketching(false);
    }
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 'bold', marginBottom: '20px' }}>
        {heroData?.id ? t('Редактировать Hero секцию / Edit Hero Section') : t('Создать Hero секцию / Create Hero Section')}
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            placeholder={t('Имя (например, Иван Иванов) / Name (e.g., John Doe)')}
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder={t('Профессия (например, Full Stack Разработчик) / Title (e.g., Full Stack Developer)')}
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <TextArea
            placeholder={t('Биография / Bio')}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
          />

          <Card style={{ padding: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-family)' }}>
              {t('Аватар / Avatar Image')}
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <Input
                placeholder={t('URL аватара / Avatar URL')}
                value={form.avatar || ''}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                containerStyle={{ flex: 1 }}
                style={{ margin: 0 }}
              />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <Button type="button" disabled={uploading} style={{ whiteSpace: 'nowrap', margin: 0 }}>
                  {uploading ? t('Загрузка... / Uploading...') : t('Загрузить аватар / Upload Avatar')}
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
            {form.avatar && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={form.avatar === '/hero.png' ? heroImg : form.avatar} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--sketch-radius-3)', border: 'var(--border-style)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <Button disabled={sketching || uploading} style={{ padding: '4px 8px', fontSize: '12px', margin: 0, backgroundColor: 'var(--accent)', color: 'var(--text)' }} onClick={handleMakeSketch}>
                  {sketching ? t('Конвертация... / Converting...') : t('✨ Эскиз карандашом / ✨ Pencil Sketch')}
                </Button>
                <Button variant="danger" style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }} onClick={() => setForm({ ...form, avatar: '' })}>
                  {t('Удалить / Remove')}
                </Button>
              </div>
            )}
          </Card>

          <Card style={{ padding: '12px', borderTop: 'var(--border-style)', opacity: 0.8 }}>
            <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
              {t('Социальные ссылки / Social Links')}
            </h4>
            <p style={{ fontSize: '14px', margin: 0, fontFamily: 'var(--font-family)' }}>
              {t('Социальные сети теперь управляются динамически в отдельной вкладке «Social Links» на панели навигации сверху. / Social links are now managed dynamically in a separate "Social Links" tab in the navigation bar above. ')}
            </p>
          </Card>
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

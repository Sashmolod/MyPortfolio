import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import heroImg from '../../assets/hero.png';

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
      window.toast?.('Name is required', 'warning');
      return;
    }
    setSaving(true);
    // Only send non-empty values (avoid sending null/empty strings)
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
    <motion.div
      className="card"
      style={{ marginBottom: '20px' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3
        style={{
          fontFamily: "'Architects Daughter', cursive",
          fontWeight: 'bold',
          marginBottom: '20px',
        }}
      >
        {heroData?.id ? 'Edit Hero Section' : 'Create Hero Section'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            placeholder="Name (e.g., John Doe)"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Title (e.g., Full Stack Developer)"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Bio"
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows="3"
          />

          <div
            style={{
              border: 'var(--border-style)',
              borderRadius: 'var(--sketch-radius-3)',
              padding: '12px',
              background: 'var(--card-bg)',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              Avatar Image
            </label>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <input
                placeholder="Avatar URL"
                value={form.avatar || ''}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                style={{ flex: 1, margin: 0 }}
              />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  disabled={uploading}
                  style={{ whiteSpace: 'nowrap', margin: 0 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </button>
              </div>
            </div>
            {uploading && (
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    border: 'var(--border-style)',
                    borderRadius: 'var(--sketch-radius-2)',
                    height: '14px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--secondary)',
                  }}
                >
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: 'var(--text)',
                      transition: 'width 0.1s ease',
                      backgroundImage:
                        'repeating-linear-gradient(45deg, var(--bg) 0px, var(--bg) 2px, transparent 2px, transparent 10px)',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "'Architects Daughter', cursive",
                    fontSize: '11px',
                    textAlign: 'center',
                    marginTop: '2px',
                    fontWeight: 'bold',
                  }}
                >
                  Uploading: {uploadProgress}%
                </div>
              </div>
            )}
            {form.avatar && (
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <img
                  src={form.avatar === '/hero.png' ? heroImg : form.avatar}
                  alt="Preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: 'var(--sketch-radius-3)',
                    border: 'var(--border-style)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  disabled={sketching || uploading}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    margin: 0,
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text)',
                  }}
                  onClick={handleMakeSketch}
                >
                  {sketching ? 'Converting...' : '✨ Эскиз карандашом'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }}
                  onClick={() => setForm({ ...form, avatar: '' })}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: 'var(--border-style)',
              opacity: 0.8,
            }}
          >
            <h4
              style={{
                margin: '0 0 8px 0',
                fontFamily: "'Architects Daughter', cursive",
                fontWeight: 'bold',
              }}
            >
              Social Links
            </h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Социальные сети теперь управляются динамически в отдельной вкладке
              <strong> «Social Links»</strong> на панели навигации сверху.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

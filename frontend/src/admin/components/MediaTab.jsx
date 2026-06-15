import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';

export default function MediaTab({ items, refresh }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {return;}

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(0);
    try {
      await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      window.toast?.('Image uploaded successfully', 'success');
      refresh();
    } catch (err) {
      console.error(err);
      window.toast?.(
        'Failed to upload image: ' +
          (err.response?.data?.message || err.message),
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) {return;}

    try {
      await api.delete(`/upload/${filename}`);
      window.toast?.('Image deleted successfully', 'success');
      refresh();
    } catch (err) {
      console.error(err);
      window.toast?.('Failed to delete image', 'error');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    window.toast?.('URL copied to clipboard!', 'success');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) {return '0 B';}
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
            }}
            disabled={uploading}
          />
          <button className="btn" disabled={uploading}>
            {uploading ? 'Uploading...' : '+ Upload New Image'}
          </button>
        </div>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
          Загружайте сюда изображения, чтобы использовать их в качестве аватара
          или картинок проектов.
        </p>

        {uploading && (
          <div style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }}>
            <div
              style={{
                border: 'var(--border-style)',
                borderRadius: 'var(--sketch-radius-2)',
                height: '18px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--input-bg)',
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
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '4px',
                fontWeight: 'bold',
              }}
            >
              Uploading... {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p>No media files uploaded yet. Upload one above!</p>
      ) : (
        <div className="grid">
          {items.map((file) => (
            <motion.div
              key={file.filename}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '140px',
                  background: 'var(--input-bg)',
                  borderBottom: 'var(--border-style)',
                }}
              >
                <img
                  src={file.url}
                  alt={file.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/140x140?text=No+Image';
                  }}
                />
              </div>
              <div
                style={{
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '14px',
                      wordBreak: 'break-all',
                      fontFamily: "'Architects Daughter', cursive",
                      fontWeight: 'bold',
                    }}
                  >
                    {file.filename}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      opacity: 0.7,
                    }}
                  >
                    Size: {formatSize(file.size)} |{' '}
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}
                    onClick={() => handleCopyUrl(file.url)}
                  >
                    Copy URL
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}
                    onClick={() => handleDelete(file.filename)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

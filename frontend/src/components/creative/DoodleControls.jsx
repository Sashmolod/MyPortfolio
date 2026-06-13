import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';

export default function DoodleControls({
  active,
  setActive,
  color,
  setColor,
  brushWidth,
  setBrushWidth,
  onUndo,
  onClear,
  onGuessDrawing,
  isGuessing,
}) {
  const [minimized, setMinimized] = useState(false);
  const { settings } = usePortfolioSettings();
  const { t } = useLanguage();

  // Brush presets
  const presets = [
    {
      name: 'Pencil',
      color: 'rgba(74, 85, 104, 0.85)',
      width: 3,
      label: '✏️ ' + t('Карандаш / Pencil'),
    },
    {
      name: 'Red Pen',
      color: 'rgba(229, 62, 62, 0.9)',
      width: 3,
      label: '🖊️ ' + t('Красная ручка / Red Pen'),
    },
    {
      name: 'Highlighter',
      color: 'rgba(59, 130, 246, 0.45)',
      width: 16,
      label: '🖍️ ' + t('Маркер / Highlight'),
    },
  ];

  if (settings?.enableEraser) {
    presets.push({
      name: 'Eraser',
      color: 'eraser',
      width: 24,
      label: '🧼 ' + t('Ластик / Eraser'),
    });
  }

  const toggleMode = () => {
    setActive(!active);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100002, // Sit above canvas and everything else
        fontFamily: 'var(--font-family)',
      }}
    >
      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="minimized-btn"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="btn"
            style={{
              padding: '10px 14px',
              borderRadius: '50%',
              fontSize: '18px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow)',
            }}
            title={t('Открыть панель рисования / Open drawing panel')}
          >
            🎨
          </motion.button>
        ) : (
          <motion.div
            key="expanded-panel"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
              background: 'var(--card-bg)',
              border: 'var(--border-style)',
              borderStyle: 'dashed',
              borderRadius: 'var(--sketch-radius-2)',
              padding: '14px',
              boxShadow: 'var(--shadow)',
              width: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  userSelect: 'none',
                }}
              >
                🎨 {t('Рисование / Doodles')}
              </span>
              <button
                onClick={() => setMinimized(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--text)',
                  opacity: 0.8,
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={t('Свернуть панель / Minimize toolbar')}
              >
                —
              </button>
            </div>

            {/* Toggle Button */}
            <Button
              onClick={toggleMode}
              variant={active ? 'danger' : 'primary'}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {active
                ? '📴 ' + t('Отключить рисование / Disable Drawing')
                : '✏️ ' + t('Включить рисование / Enable Drawing')}
            </Button>

            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Tool Selection */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        userSelect: 'none',
                      }}
                    >
                      {t('Выберите инструмент: / Select Tool:')}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {presets.map((p) => {
                        const isSelected =
                          color === p.color && brushWidth === p.width;
                        return (
                          <button
                            key={p.name}
                            onClick={() => {
                              setColor(p.color);
                              setBrushWidth(p.width);
                            }}
                            className="btn-tab"
                            style={{
                              fontSize: '12px',
                              padding: '5px 8px',
                              textAlign: 'left',
                              border: isSelected
                                ? '2px solid var(--accent)'
                                : '1px solid var(--text)',
                              borderStyle: isSelected ? 'solid' : 'dashed',
                              borderRadius: 'var(--sketch-radius-3)',
                              backgroundColor: isSelected
                                ? 'var(--secondary)'
                                : 'transparent',
                              color: isSelected ? 'var(--bg)' : 'var(--text)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{p.label}</span>
                            {isSelected && <span>✔</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Guessing Button */}
                  <Button
                    onClick={onGuessDrawing}
                    disabled={isGuessing}
                    variant="accent"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '4px',
                    }}
                  >
                    🎓 {isGuessing ? t('Угадываю... / Guessing...') : t('Дудли, угадай! / Doodly, guess!')}
                  </Button>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      borderTop: 'var(--border-style)',
                      borderTopStyle: 'dashed',
                      paddingTop: '10px',
                    }}
                  >
                    <Button
                      onClick={onUndo}
                      style={{ flex: 1, padding: '5px', fontSize: '12px' }}
                      title={t('Удалить последний штрих / Remove last stroke')}
                    >
                      ↩️ {t('Назад / Undo')}
                    </Button>
                    <Button
                      onClick={onClear}
                      variant="danger"
                      style={{ flex: 1, padding: '5px', fontSize: '12px' }}
                      title={t('Очистить весь холст / Clear all doodles')}
                    >
                      🗑️ {t('Сброс / Clear')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {active && (
              <p
                style={{
                  margin: 0,
                  fontSize: '10px',
                  opacity: 0.7,
                  textAlign: 'center',
                  userSelect: 'none',
                }}
              >
                {t('* Во время рисования клики по ссылкам отключены. Отключите рисование для перехода по ссылкам. / * Link clicks are disabled while drawing. Turn off to click links.')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

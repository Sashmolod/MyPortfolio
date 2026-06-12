import { SketchLockIcon } from '../../components/SvgIllustrations';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * SettingsTab Component
 * Renders the toggle switches for easter eggs, sounds, animations, and other interactive settings.
 * 
 * Props:
 * - settings: Object holding the current toggle states (e.g. { enableDoodly: true })
 * - savingSettings: Boolean indicating if a save API call is currently in progress
 * - onToggleSetting: Callback function triggered when a setting checkbox is clicked
 */
export default function SettingsTab({ settings = {}, savingSettings = false, onToggleSetting }) {
  const { t, language } = useLanguage();

  // Define all available settings with their database keys and user-friendly labels
  const settingsList = [
    {
      key: 'enableDoodly',
      label: t('Умная Скрепка Дудли (Smart Clip Helper) / Smart Clip Helper (Doodly)'),
    },
    {
      key: 'enableSounds',
      label: t('Звуковые эффекты (Web Audio API) / Sound effects (Web Audio API)'),
    },
    {
      key: 'enableBug',
      label: t('Пасхалка: Ползающий жучок (Sketchy Bug) / Easter egg: Crawling sketchy bug'),
    },
    {
      key: 'enablePageTear',
      label: t('Пасхалка: Загнутый уголок (Крестики-Нолики) / Easter egg: Dog-eared corner (Tic-Tac-Toe)'),
    },
    {
      key: 'enableInkLeak',
      label: t('Пасхалка: Протекающие чернила (Header Double Click) / Easter egg: Leaking ink (Header Double Click)'),
    },
    {
      key: 'enableCoffeeSpill',
      label: t('Пасхалка: Проливаемая чашка кофе / Easter egg: Spillable coffee cup'),
    },
    {
      key: 'enableDrawSkills',
      label: t('Анимация: Отрисовка линий навыков при скролле / Animation: Skill lines drawing on scroll'),
    },
    {
      key: 'enableEraser',
      label: t('Инструмент: Интерактивный ластик (Eraser Tool) / Tool: Interactive eraser (Eraser Tool)'),
    },
    {
      key: 'enableCrumpledPageTransition',
      label: t('Переходы: Сминание страницы при смене разделов / Transitions: Page crumpling on section change'),
    },
    {
      key: 'showAdminLink',
      label: language === 'ru' ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            verticalAlign: 'middle',
          }}
        >
          Отображать ссылку <SketchLockIcon size={16} /> Admin в
          шапке сайта
        </span>
      ) : (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            verticalAlign: 'middle',
          }}
        >
          Show <SketchLockIcon size={16} /> Admin link in header
        </span>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '520px', margin: '20px auto 0 auto' }}>
      <div className="card">
        <h3
          style={{
            fontFamily: "'Architects Daughter', cursive",
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: '1.4rem',
          }}
        >
          {t('Интерактивные функции и анимации / Interactive features and animations')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {settingsList.map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: savingSettings ? 'default' : 'pointer',
                fontSize: '14px',
                fontFamily: "'Architects Daughter', cursive",
                color: 'var(--text)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={!!settings[key]}
                disabled={savingSettings}
                // Notify parent element to trigger put request
                onChange={() => onToggleSetting(key, settings[key])}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: savingSettings ? 'default' : 'pointer',
                  margin: 0, // Reset default browser margin
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

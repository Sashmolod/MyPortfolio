import { createContext, useContext, useState, useEffect } from 'react';

// ────────────────────────────────────────────────
//  Dictionary
// ────────────────────────────────────────────────
const dictionary = {
  ru: {
    home: 'Главная',
    skills: 'Навыки',
    projects: 'Проекты',
    contact: 'Контакты',
    admin: 'Панель',
    logout: 'Выйти',
    loading: 'Загрузка...',
    noDescription: 'Нет описания',
    deleteConfirm: 'Удалить все рисунки?',
    all: '+ Все',
    none: '− Ничего',
    viewProject: 'Смотреть проект',
    allRightsReserved: 'Все права защищены.',

    // Canvas Controls
    pencil: 'Карандаш',
    eraser: 'Ластик',
    brushSize: 'Размер',
    color: 'Цвет',
    undo: 'Назад',
    clear: 'Очистить',
    aiGuess: 'ИИ Угадать',
    guessing: 'Думаю...',

    // Contact Form
    name: 'Имя',
    email: 'Эл. почта',
    subject: 'Тема',
    message: 'Сообщение',
    send: 'Отправить',
    sending: 'Отправка...',
    nameRequired: 'Необходимо ввести имя',
    nameMinChars: 'Имя должно содержать от 2 символов',
    emailRequired: 'Необходимо ввести email',
    emailInvalid: 'Неверный формат email',
    subjectRequired: 'Необходимо ввести тему',
    subjectMinChars: 'Тема должна содержать от 3 символов',
    messageRequired: 'Необходимо ввести сообщение',
    messageMinChars: 'Сообщение должно содержать от 10 символов',
    captchaRequired: 'Пожалуйста, решите пример',
    captchaPlaceholder: 'Ответ',
    captchaLoading: 'Загрузка проверочного кода...',
    captchaError: 'Не удалось загрузить проверочный код.',
    captchaIncorrect: 'Неверный ответ на капчу',
    captchaSolve: 'Решите пример:',
    captchaRefresh: 'Обновить пример',
    successToast: 'Сообщение отправлено!',
    failedToast: 'Не удалось отправить сообщение. Пожалуйста, попробуйте снова.',

    // Admin Tabs
    tabSkills: 'Навыки',
    tabProjects: 'Проекты',
    tabSocialLinks: 'Ссылки',
    tabMessages: 'Сообщения',
    tabHero: 'Инфо',
    tabCategories: 'Категории',
    tabMedia: 'Медиа',
    tabStats: 'Статистика',
    tabTrash: 'Корзина',
    tabSettings: 'Настройки',
    tabSecurity: 'Безопасность',
  },
  en: {
    home: 'Home',
    skills: 'Skills',
    projects: 'Projects',
    contact: 'Contact',
    admin: 'Admin',
    logout: 'Logout',
    loading: 'Loading...',
    noDescription: 'No description',
    deleteConfirm: 'Delete all drawings?',
    all: '+ All',
    none: '− None',
    viewProject: 'View Project',
    allRightsReserved: 'All rights reserved.',

    // Canvas Controls
    pencil: 'Pencil',
    eraser: 'Eraser',
    brushSize: 'Brush Size',
    color: 'Color',
    undo: 'Undo',
    clear: 'Clear',
    aiGuess: 'AI Guess',
    guessing: 'Guessing...',

    // Contact Form
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send',
    sending: 'Sending...',
    nameRequired: 'Name is required',
    nameMinChars: 'Name must be at least 2 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    subjectRequired: 'Subject is required',
    subjectMinChars: 'Subject must be at least 3 characters',
    messageRequired: 'Message is required',
    messageMinChars: 'Message must be at least 10 characters',
    captchaRequired: 'Please solve the math puzzle',
    captchaPlaceholder: 'Answer',
    captchaLoading: 'Loading captcha...',
    captchaError: 'Failed to load captcha.',
    captchaIncorrect: 'Incorrect captcha answer',
    captchaSolve: 'Solve the puzzle:',
    captchaRefresh: 'Refresh',
    successToast: 'Message sent successfully!',
    failedToast: 'Failed to send message. Please try again.',

    // Admin Tabs
    tabSkills: 'Skills',
    tabProjects: 'Projects',
    tabSocialLinks: 'Social Links',
    tabMessages: 'Messages',
    tabHero: 'Hero',
    tabCategories: 'Categories',
    tabMedia: 'Media',
    tabStats: 'Stats',
    tabTrash: 'Trash',
    tabSettings: 'Settings',
    tabSecurity: 'Security',
  },
};

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
function detectLanguage() {
  const saved = localStorage.getItem('portfolio_language');
  if (saved === 'ru' || saved === 'en') return saved;

  if (typeof navigator !== 'undefined') {
    const langs = [
      ...(navigator.languages || []),
      navigator.language,
    ].filter(Boolean);

    for (const lang of langs) {
      if (lang.toLowerCase().startsWith('ru')) return 'ru';
    }
  }
  return 'en';
}

function translate(lang, keyOrBilingual) {
  if (typeof keyOrBilingual !== 'string') return keyOrBilingual;

  // Check dictionary first
  const entry = dictionary[lang][keyOrBilingual];
  if (entry) return entry;

  // Bilingual separator fallback  "RU_TEXT / EN_TEXT"  or  "RU_TEXT | EN_TEXT"
  const hasSlash = keyOrBilingual.includes(' / ');
  const hasPipe  = keyOrBilingual.includes(' | ');
  if (hasSlash || hasPipe) {
    const sep      = hasSlash ? ' / ' : ' | ';
    const segments = keyOrBilingual.split(sep);
    return lang === 'ru' ? segments[0].trim() : segments[1].trim();
  }

  return keyOrBilingual;
}

// ────────────────────────────────────────────────
//  Context
// ────────────────────────────────────────────────
const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  useEffect(() => {
    localStorage.setItem('portfolio_language', language);
  }, [language]);

  const setLanguage = (lang) => setLanguageState(lang);
  const t = (keyOrBilingual) => translate(language, keyOrBilingual);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context) return context;

  // Safe default fallback for unit tests and isolated component runs
  return {
    language: 'ru',
    setLanguage: () => {},
    t: (keyOrBilingual) => translate('ru', keyOrBilingual),
  };
}

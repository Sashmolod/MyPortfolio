import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer>
      <p>{new Date().getFullYear()} MyPortfolio. {t('allRightsReserved')}</p>
    </footer>
  );
}

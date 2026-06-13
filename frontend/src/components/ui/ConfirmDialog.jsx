import Modal from './Modal';
import Button from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  isOpen,
}) {
  const { t } = useLanguage();
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <p
        style={{
          marginBottom: '24px',
          fontSize: '1.2rem',
          fontFamily: 'var(--font-family)',
          fontWeight: 'bold',
        }}
      >
        {message}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>
          {t('Отмена / Cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t('Удалить / Delete')}
        </Button>
      </div>
    </Modal>
  );
}

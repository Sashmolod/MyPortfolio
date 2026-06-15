import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

/**
 * SecurityTab Component
 * Handles the "Change Password" functionality for the admin dashboard.
 * Encapsulates password states, validation, error displaying, and API interaction.
 */
export default function SecurityTab() {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  
  // Local form states
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate form inputs before sending to the backend
  const validateForm = () => {
    const errs = {};
    if (!form.currentPassword) {
      errs.currentPassword = t('Необходим текущий пароль / Current password is required');
    }
    if (!form.newPassword) {
      errs.newPassword = t('Необходим новый пароль / New password is required');
    } else if (form.newPassword.length < 6) {
      errs.newPassword = t('Пароль должен содержать от 6 символов / Password must be at least 6 characters');
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {return;}

    setSubmitting(true);
    try {
      // Call authentication service API
      await changePassword(form);
      
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '' });
      setErrors({});
      window.toast?.(t('Пароль изменен / Password changed successfully'), 'success');
      
      // Clear success notification alert after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      window.toast?.(t('Ошибка изменения пароля / Change failed: ') + errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '20px auto 0 auto' }}>
      {success && (
        <Card
          style={{
            borderColor: 'var(--accent)',
            padding: '12px',
            color: 'var(--text)',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: 'var(--font-family)',
          }}
        >
          {t('Пароль успешно изменён! / Password changed!')}
        </Card>
      )}

      <Card>
        <h3
          style={{
            fontFamily: 'var(--font-family)',
            marginBottom: '20px',
            fontWeight: 'bold',
            fontSize: '1.4rem',
          }}
        >
          {t('Сменить пароль / Change Password')}
        </h3>
        
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
              type="password"
              placeholder={t('Текущий пароль / Current password')}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              error={errors.currentPassword}
              required
            />

            <Input
              type="password"
              placeholder={t('Новый пароль (минимум 6 символов) / New password (min. 6 characters)')}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              error={errors.newPassword}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            style={{ marginTop: '12px', width: '100%', marginBottom: 0 }}
          >
            {t('Сменить пароль / Change Password')}
          </Button>
        </form>
      </Card>
    </div>
  );
}

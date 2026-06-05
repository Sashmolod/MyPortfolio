import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { MailIcon } from './SvgIllustrations';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (field, value) => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Name is required' : value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !value.trim() ? 'Email is required' : !validateEmail(value) ? 'Invalid email format' : '';
      case 'subject':
        return !value.trim() ? 'Subject is required' : value.trim().length < 3 ? 'Subject must be at least 3 characters' : '';
      case 'message':
        return !value.trim() ? 'Message is required' : value.trim().length < 10 ? 'Message must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const fieldError = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    for (const field of Object.keys(formData)) {
      const error = validate(field, formData[field]);
      if (error) newErrors[field] = error;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await api.post('/portfolio/message', formData);
      window.toast?.('Message sent successfully!', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch {
      window.toast?.('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errMsg = (field) => errors[field] && (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        color: 'var(--danger)',
        fontSize: '12px',
        margin: '2px 0 10px',
        fontFamily: "'Architects Daughter', cursive",
      }}
    >
      {errors[field]}
    </motion.p>
  );

  return (
    <section id="contact">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.4, type: 'Spring' }}
          viewport={{ once: true }}
          style={{ display: 'inline-block', marginBottom: '0.5rem' }}
        >
          <MailIcon size={64} />
        </motion.div>
      </div>
      <h2>Contact</h2>
      <form onSubmit={handleSubmit} className="contact-form" noValidate>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name ? 'input-error' : ''}
          required
        />
        {errMsg('name')}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'input-error' : ''}
          required
        />
        {errMsg('email')}

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.subject ? 'input-error' : ''}
          required
        />
        {errMsg('subject')}

        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.message ? 'input-error' : ''}
          required
        />
        {errMsg('message')}

        <button type="submit" className="btn" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
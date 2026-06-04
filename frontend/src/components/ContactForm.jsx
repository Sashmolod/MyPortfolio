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
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Validate on change if there was already an error
    if (errors[name]) {
      const fieldError = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
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

  const inputStyle = (fieldName) => ({
    padding: '12px 16px',
    border: `1px solid ${errors[fieldName] ? '#ef4444' : 'var(--border)'}`,
    borderRadius: '6px',
    background: 'var(--input-bg)',
    color: 'var(--text)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  });

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
        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle('name')}
            required
          />
          {errors.name && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0', padding: '0 4px' }}>
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle('email')}
            required
          />
          {errors.email && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0', padding: '0 4px' }}>
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle('subject')}
            required
          />
          {errors.subject && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0', padding: '0 4px' }}>
              {errors.subject}
            </motion.p>
          )}
        </div>

        {/* Message */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ ...inputStyle('message'), minHeight: '120px', resize: 'vertical' }}
            required
          />
          {errors.message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0', padding: '0 4px' }}>
              {errors.message}
            </motion.p>
          )}
        </div>

        <button type="submit" className="btn" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
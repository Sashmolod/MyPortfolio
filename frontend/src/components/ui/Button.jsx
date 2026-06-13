import { motion } from 'framer-motion';
import Spinner from './Spinner';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'default', // default (btn), primary (btn-primary), danger (btn-danger)
  disabled = false,
  loading = false,
  style = {},
  className = '',
  size = 'md', // sm, md, lg
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'danger': return 'btn-danger';
      case 'accent': return 'btn-accent';
      default: return 'btn';
    }
  };

  const getPadding = () => {
    if (size === 'sm') return '6px 12px';
    if (size === 'lg') return '12px 24px';
    return '8px 16px';
  };

  const getFontSize = () => {
    if (size === 'sm') return '12px';
    if (size === 'lg') return '16px';
    return '14px';
  };

  const defaultStyle = {
    padding: getPadding(),
    fontSize: getFontSize(),
    boxShadow: '2px 2px 0px var(--border-color)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    margin: 0,
    ...style,
  };

  return (
    <motion.button
      type={type}
      className={`${getVariantClass()} ${className}`}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      style={defaultStyle}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      whileHover={disabled || loading ? undefined : { y: -1, x: -1, boxShadow: '3px 3px 0px var(--border-color)' }}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </motion.button>
  );
}

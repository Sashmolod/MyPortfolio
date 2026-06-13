import { motion } from 'framer-motion';

export default function Card({
  children,
  style = {},
  whileHover,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) {
  const defaultStyle = {
    background: 'var(--card-bg)',
    border: 'var(--border-style)',
    borderRadius: 'var(--sketch-radius-3)',
    boxShadow: '3px 3px 0px var(--border-color)',
    padding: '20px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-radius 0.3s ease',
    ...style,
  };

  const hoverStyle = whileHover !== undefined
    ? whileHover
    : (hoverable || onClick
      ? {
          y: -2,
          x: -2,
          boxShadow: '5px 5px 0px var(--border-color)',
          borderRadius: 'var(--sketch-radius-1)',
        }
      : undefined);

  return (
    <motion.div
      className={`card ${className}`}
      style={defaultStyle}
      whileHover={hoverStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

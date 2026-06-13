import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  style = {},
  ...props
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      >
        <Card
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            width: '90%',
            maxWidth: '500px',
            boxShadow: '6px 6px 0px var(--border-color)',
            background: 'var(--bg)',
            position: 'relative',
            ...style,
          }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {title && (
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontFamily: 'var(--font-family)', fontWeight: 'bold' }}>
              {title}
            </h3>
          )}
          {children}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

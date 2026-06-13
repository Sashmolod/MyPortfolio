export default function TextArea({
  label,
  error,
  className = '',
  style = {},
  containerStyle = {},
  required = false,
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', ...containerStyle }}>
      {label && (
        <label style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-family)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <textarea
        className={`${error ? 'input-error' : ''} ${className}`}
        style={{ margin: 0, width: '100%', ...style }}
        required={required}
        {...props}
      />
      {error && (
        <span
          style={{
            color: 'var(--danger)',
            fontSize: '12px',
            fontFamily: 'var(--font-family)',
            marginTop: '2px',
            display: 'block',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export default function Select({
  label,
  error,
  options = [],
  children,
  className = '',
  style = {},
  containerStyle = {},
  loading = false,
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
      {loading ? (
        <span style={{ fontSize: '13px', opacity: 0.6, padding: '8px 0', fontFamily: 'var(--font-family)' }}>Loading...</span>
      ) : (
        <select
          className={`${error ? 'input-error' : ''} ${className}`}
          style={{ margin: 0, width: '100%', ...style }}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
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

export default function Spinner({ size = 'md', color = 'currentColor', className = '', style = {} }) {
  const getDimensions = () => {
    if (size === 'sm') {return 16;}
    if (size === 'lg') {return 32;}
    return 24;
  };

  const dim = getDimensions();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ui-spinner-spin {
          to { transform: rotate(360deg); }
        }
      ` }} />
      <svg
        className={`ui-spinner ${className}`}
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          animation: 'ui-spinner-spin 1s linear infinite',
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style,
        }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </>
  );
}

import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            color: 'var(--text)',
            padding: '24px',
            fontFamily: "'Architects Daughter', cursive",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              border: 'var(--border-style)',
              borderRadius: 'var(--sketch-radius-1)',
              boxShadow: 'var(--shadow)',
              padding: '40px 24px',
            }}
          >
            <h1 style={{ fontSize: '2rem', marginBottom: '16px', fontWeight: 'bold' }}>
              Oops! Something ripped! 📄💥
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '24px', lineHeight: '1.5' }}>
              It looks like a page element crashed. My paper sketchbook has a small tear, but don't worry! We can easily refresh it.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: 'var(--secondary)',
                  border: 'var(--border-style)',
                  borderRadius: 'var(--sketch-radius-3)',
                  padding: '12px',
                  fontSize: '12px',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="btn"
              style={{
                fontSize: '1.1rem',
                padding: '10px 24px',
                cursor: 'pointer'
              }}
            >
              🔄 Glue It Back! (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

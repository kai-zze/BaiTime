import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BaiTime Uncaught Exception:', error, errorInfo);
    // Auto reload silently to load fresh assets without showing any error popup UI
    const lastReload = sessionStorage.getItem('baitime_last_auto_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('baitime_last_auto_reload', now.toString());
      window.location.reload();
    }
  }

  private handleRecover = () => {
    try {
      sessionStorage.removeItem('baitime_last_auto_reload');
    } catch {
      // Storage fallback
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B132B',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            backgroundColor: '#111C38',
            padding: '36px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 91, 0, 0.3)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px', color: '#FF5B00' }}>
              BaiTime Defense Timer
            </h1>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.5 }}>
              A temporary issue occurred while loading this session. Tap below to refresh and continue.
            </p>
            <button
              onClick={this.handleRecover}
              style={{
                backgroundColor: '#FF5B00',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Refresh Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Unregister stale service workers from prior deployments to prevent white screen traps
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

import React from 'react';
import { ErrorState } from '../ui/EmptyState.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)' }}>
          <ErrorState 
            title="SOMETHING WENT WRONG" 
            message={this.state.error?.message || "An unexpected error occurred in the application."} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

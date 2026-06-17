import React from 'react';
import { ErrorState } from './EmptyState.jsx';

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
    // You can also log the error to an error reporting service here
    console.error("Uncaught error in React ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // In a real app, might want to navigate to home or reset other state
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
          <ErrorState 
            title="SYSTEM HALTED" 
            message={this.state.error?.toString() || "An unexpected application error occurred."} 
            onRetry={this.handleRetry} 
          />
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

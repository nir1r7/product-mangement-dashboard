import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h2>Something went wrong</h2>
                        <p>We're sorry, but something unexpected happened.</p>
                        
                        <div className="error-actions">
                            <button 
                                onClick={this.handleRetry}
                                className="btn btn-primary"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary"
                            >
                                Reload Page
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details (Development)</summary>
                                <pre className="error-stack">
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

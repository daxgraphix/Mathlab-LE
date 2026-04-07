
import React, { Component, ReactNode } from 'react';
import { Icons } from './Icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State = { hasError: false, error: null };
  
  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  setState: Component<Props, State>['setState'] = (stateUpdate) => {
    this.state = { ...this.state, ...(typeof stateUpdate === 'function' ? stateUpdate(this.state) : stateUpdate) };
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-theme-bg p-8 text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md">
            <div className="w-20 h-20 mx-auto mb-4 bg-brand-danger/20 rounded-full flex items-center justify-center">
              <Icons.Exit className="w-10 h-10 text-brand-danger" />
            </div>
            <h1 className="font-display text-2xl text-theme-text mb-2">System Malfunction</h1>
            <p className="text-theme-muted text-sm mb-6">
              The simulation has encountered an unexpected error. 
              {this.state.error && (
                <span className="block mt-2 text-xs font-mono text-brand-danger/70">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-theme-accent text-white rounded-xl font-bold hover:bg-theme-accent/80 transition-colors"
              >
                Retry Simulation
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-theme-panel text-theme-text rounded-xl font-bold hover:bg-theme-panel/80 transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

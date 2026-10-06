import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BlockFall Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 text-slate-800 font-sans">
          <div className="w-full max-w-md p-6 bg-white border border-slate-300 rounded-2xl shadow-xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unexpected State Encountered</h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              BlockFall safely protected your session. Click below to refresh the game engine and continue playing.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart BlockFall</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

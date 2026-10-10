import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Portfolix ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    localStorage.removeItem('portfolix_access_token');
    localStorage.removeItem('portfolix_refresh_token');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F1A] text-[#dde2f6] flex items-center justify-center p-6 selection:bg-[#3B82F6]/30 selection:text-white font-sans">
          <div className="card-level-2 max-w-lg w-full p-8 border-[#EF4444]/30 shadow-2xl bg-[#161F33] text-center relative overflow-hidden rounded-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-5 shadow-lg shadow-[#EF4444]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight mb-2 font-sans">
              Application Runtime Error
            </h1>
            <p className="text-xs text-[#9CA3AF] mb-6 leading-relaxed font-sans">
              Portfolix QuantEdge encountered an unexpected rendering error. You can reload the terminal or reset your session state.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-[#0B0F1A] border border-[#EF4444]/20 text-left font-mono text-xs text-[#EF4444] overflow-x-auto max-h-40">
                <div className="font-bold text-[#EF4444] mb-1 label-caps">Error Message:</div>
                <div>{this.state.error.toString()}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Terminal
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-[#dde2f6] hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Home className="w-4 h-4" />
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

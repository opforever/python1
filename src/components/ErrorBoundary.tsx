import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Python Sanctuary Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected disturbance occurred.';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen w-full bg-[#0b0f14] text-slate-200 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#0e141b] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Zen Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-medium text-slate-100 mb-2 tracking-wide">
              Serene Recovery
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The Python Sanctuary encountered a momentary ripple during initialization. Your workspace can be restored with a breath and a click.
            </p>

            {/* Error Message Box */}
            <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 mb-6 text-left font-mono text-xs text-rose-300/90 break-words max-h-28 overflow-y-auto">
              <span className="text-slate-400 select-none block text-[10px] mb-1 font-sans">CAUGHT EXCEPTION:</span>
              {errorMessage}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
              <button
                id="btn-error-reload"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <button
                id="btn-error-reset"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all"
                title="Clears any corrupt local storage and reloads with clean state"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Reset Data</span>
              </button>
            </div>

            {/* Collapsible Technical Details */}
            <button
              onClick={this.toggleDetails}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors mt-2"
            >
              <span>Technical Diagnostics</span>
              {this.state.showDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {this.state.showDetails && (
              <div className="w-full mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-left font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto select-text whitespace-pre-wrap">
                <div className="font-semibold text-rose-400 mb-1">Stack Trace:</div>
                {this.state.error?.stack || 'No stack trace available'}
                {componentStack && (
                  <>
                    <div className="font-semibold text-slate-400 mt-2 mb-1">Component Stack:</div>
                    {componentStack}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

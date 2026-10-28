import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RSU VPASS] Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                The application encountered an unexpected display issue. Your saved records are securely stored in the cloud database.
              </p>
              {this.state.error && (
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-left font-mono text-[10px] text-slate-700 max-h-24 overflow-y-auto break-words">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Local Cache & Refresh</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

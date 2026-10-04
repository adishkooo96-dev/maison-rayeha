import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('[Maison ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-ivory text-near-black">
          <div className="max-w-lg w-full p-8 bg-ivory-surface border border-border text-center space-y-6 shadow-xs">
            <div className="w-12 h-12 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center text-gold mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-medium">
                MAISON NOTICE
              </span>
              <h2 className="text-xl font-display font-normal text-near-black">
                {isRtl ? 'اختلال موقت در بارگذاری آتلیه' : 'Sensory Calibration In Progress'}
              </h2>
              <p className="text-xs text-muted leading-relaxed font-light">
                {isRtl
                  ? 'خطایی در پردازش صفحه رخ داده است. جزئیات فنی خطا جهت بررسی در زیر نمایش داده شده است:'
                  : 'An unexpected disturbance was encountered. Technical error details are shown below:'}
              </p>
            </div>

            {/* Visible Error Box for Transparent Debugging */}
            {this.state.error && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-800 text-xs font-mono text-start break-all max-h-48 overflow-y-auto space-y-1">
                <div className="font-bold text-rose-900">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-rose-600 whitespace-pre-wrap font-mono mt-1">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-near-black text-ivory hover:bg-gold hover:text-near-black transition-colors text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تلاش مجدد' : 'Try Again'}</span>
              </button>

              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-near-black hover:border-gold hover:text-gold transition-colors text-xs uppercase tracking-wider font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isRtl ? 'صفحه اصلی' : 'Return Home'}</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

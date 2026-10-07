import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertCircle, WifiOff } from 'lucide-react';
import { clearAllCaches } from '../../lib/pwaCacheManager';
import { reconnectFirebase } from '../../lib/firebase';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

function isNetworkError(err: Error | null): boolean {
  if (!err) return false;
  if ((err as any).isNetworkError) return true;
  const msg = (err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed') ||
    msg.includes('dynamically imported module') ||
    msg.includes('module script failed') ||
    msg.includes('loading chunk') ||
    msg.includes('chunk') ||
    msg.includes('unavailable') ||
    msg.includes('net::err') ||
    name === 'chunkloaderror'
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isRetrying: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Maison ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, isRetrying: false });
  };

  private handleRetryConnection = async () => {
    this.setState({ isRetrying: true });
    try {
      // Clear stale browser chunk caches
      await clearAllCaches();
      // Reconnect Firebase
      await reconnectFirebase(true);

      // Reset state or reload page if dynamic import failed
      if (isNetworkError(this.state.error)) {
        window.location.reload();
      } else {
        this.setState({ hasError: false, error: null, isRetrying: false });
      }
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
      const isNet = isNetworkError(this.state.error);

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[var(--bg-page,#0A0A0A)] text-[var(--text-primary,#FBF9F5)]">
          <div className="max-w-lg w-full p-8 bg-[var(--bg-surface,#141414)] border border-[var(--border,#2E2E2E)] text-center space-y-6 shadow-xl rounded-xs">
            <div className="w-14 h-14 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center text-gold mx-auto">
              {isNet ? <WifiOff className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-medium">
                {isNet ? (isRtl ? 'وضعیت شبکه' : 'NETWORK NOTICE') : 'MAISON NOTICE'}
              </span>
              <h2 className="text-xl font-display font-normal text-[var(--text-primary,#FBF9F5)]">
                {isNet
                  ? isRtl
                    ? 'اختلال در اتصال به شبکه یا هاست'
                    : 'Network or Host Connection Interrupted'
                  : isRtl
                  ? 'اختلال موقت در بارگذاری آتلیه'
                  : 'Sensory Calibration In Progress'}
              </h2>
              <p className="text-xs text-[var(--text-secondary,#A0A0A0)] leading-relaxed font-light">
                {isNet
                  ? isRtl
                    ? 'ارتباط شما با سرور یا هاست به دلیل قطعی اینترنت، تغییر نسخه یا انقضای نشست کاری با اختلال مواجه شده است. با دکمه زیر می‌توانید اتصال را مجدداً برقرار کنید.'
                    : 'Your connection to the server was interrupted due to network timeout or outdated cache. Please reconnect below.'
                  : isRtl
                  ? 'خطایی در پردازش صفحه رخ داده است. جزئیات فنی خطا جهت بررسی در زیر نمایش داده شده است:'
                  : 'An unexpected disturbance was encountered. Technical error details are shown below:'}
              </p>
            </div>

            {/* Error Message Details */}
            {this.state.error && (
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded text-rose-300 text-xs font-mono text-start break-all max-h-36 overflow-y-auto space-y-1">
                <div className="font-semibold text-rose-200">
                  {this.state.error.name}: {this.state.error.message}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetryConnection}
                disabled={this.state.isRetrying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gold text-black hover:bg-gold-light transition-colors text-xs uppercase tracking-wider font-medium cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                <span>
                  {this.state.isRetrying
                    ? isRtl
                      ? 'در حال برقراری اتصال...'
                      : 'Reconnecting...'
                    : isRtl
                    ? 'تلاش مجدد برای اتصال'
                    : 'Retry Connection'}
                </span>
              </button>

              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[var(--border,#2E2E2E)] text-[var(--text-primary,#FBF9F5)] hover:border-gold hover:text-gold transition-colors text-xs uppercase tracking-wider font-medium"
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


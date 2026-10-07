import React from 'react';
import { WifiOff, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useI18n } from '../../hooks/useI18n';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, hasNetworkError, errorMessage, isReconnecting, retryConnection, clearNetworkError } =
    useNetwork();
  const { lang } = useI18n();
  const isRtl = lang === 'fa';

  if (isOnline && !hasNetworkError) {
    return null;
  }

  const defaultMsg = !isOnline
    ? isRtl
      ? 'اتصال اینترنت شما قطع است. در حال تلاش برای اتصال مجدد...'
      : 'You are currently offline. Attempting to reconnect...'
    : isRtl
    ? errorMessage || 'اختلال در اتصال به هاست یا سرور. لطفاً ارتباط خود را بازیابی کنید.'
    : errorMessage || 'Connection to server interrupted. Please reconnect.';

  return (
    <aside
      aria-label="Network Status"
      className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="bg-[var(--announcement-bg,#121212)] text-[var(--announcement-text,#FBF9F5)] border border-gold/60 shadow-2xl rounded-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 shrink-0 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gold" />
            )}
          </div>
          <div className="text-start min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gold font-medium">
              {isRtl ? 'وضعیت اتصال' : 'CONNECTION STATUS'}
            </div>
            <p className="text-xs text-[var(--announcement-text,#FBF9F5)]/90 font-light truncate sm:whitespace-normal line-clamp-2">
              {defaultMsg}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gold/20">
          <button
            type="button"
            onClick={() => retryConnection()}
            disabled={isReconnecting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light active:bg-gold-dark text-black font-medium text-xs rounded-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>
              {isReconnecting
                ? isRtl
                  ? 'در حال اتصال...'
                  : 'Reconnecting...'
                : isRtl
                ? 'تلاش مجدد برای اتصال'
                : 'Retry Connection'}
            </span>
          </button>

          {isOnline && hasNetworkError && (
            <button
              type="button"
              onClick={clearNetworkError}
              aria-label="Close"
              className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer rounded-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

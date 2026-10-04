import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../hooks/useI18n';
import { LocaleLink } from '../navigation/LocaleLink';

export interface HeaderAccountButtonProps {
  isTransparent?: boolean;
}

export const HeaderAccountButton: React.FC<HeaderAccountButtonProps> = ({
  isTransparent = false,
}) => {
  const { lang } = useI18n();
  const { user, profile, isAdmin } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Extract photo URL if present on profile or Firebase User
  const photoUrl = user?.photoURL || profile?.photoURL;

  // Determine user initial for avatar letter fallback
  const getInitial = (): string => {
    const rawName = profile?.name || user?.displayName || user?.email || '';
    const trimmed = rawName.trim();
    if (!trimmed) return 'U';
    // For Persian or English, return the first character in upper-case
    return trimmed.charAt(0).toUpperCase();
  };

  const initial = getInitial();
  const displayName = profile?.name || user?.displayName || user?.email || (lang === 'fa' ? 'همراه گرامی' : 'Patron');

  // Accessible ARIA label
  const ariaLabel = user
    ? lang === 'fa'
      ? `حساب کاربری: ${displayName}`
      : `Account: ${displayName}`
    : lang === 'fa'
    ? 'ورود به حساب کاربری'
    : 'Sign In';

  // Ring offset color depending on header transparency
  const ringOffsetClass = isTransparent
    ? 'group-hover:ring-offset-near-black focus-visible:ring-offset-near-black'
    : 'group-hover:ring-offset-ivory-surface focus-visible:ring-offset-ivory-surface';

  // If user is logged in, navigate to /account; if not, /login
  const destination = user ? '/account' : '/login';

  return (
    <LocaleLink
      to={destination}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center shrink-0 rounded-full transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${ringOffsetClass}`}
    >
      {user ? (
        // Logged-in state: 32px on mobile, 36px on desktop circular avatar
        <div className="relative flex items-center justify-center">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 select-none shadow-xs group-hover:scale-105 group-hover:ring-2 group-hover:ring-gold group-hover:ring-offset-1 ${ringOffsetClass} ${
              photoUrl && !imageError
                ? 'bg-near-black ring-1 ring-gold/40'
                : 'bg-gold text-near-black ring-1 ring-gold-dark/20'
            }`}
          >
            {photoUrl && !imageError ? (
              <img
                src={photoUrl}
                alt={displayName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            ) : (
              <span
                className="font-display font-medium text-xs sm:text-sm leading-none flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                {initial}
              </span>
            )}
          </div>

          {/* Admin badge pip if user has administrator privileges */}
          {isAdmin && (
            <span
              className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 bg-near-black text-gold rounded-full flex items-center justify-center ring-1 ring-gold shadow-2xs pointer-events-none"
              title={lang === 'fa' ? 'مدیر سیستم' : 'Admin'}
              aria-label="Admin"
            >
              <Shield className="w-2 h-2 stroke-[2]" />
            </span>
          )}
        </div>
      ) : (
        // Logged-out state: Circular outline with generic user icon inside
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
            isTransparent
              ? 'border-ivory/50 text-ivory/90 group-hover:border-gold group-hover:text-gold group-hover:bg-gold/15 group-hover:ring-2 group-hover:ring-gold/40'
              : 'border-border text-near-black/75 group-hover:border-gold group-hover:text-gold-dark group-hover:bg-gold/10 group-hover:ring-2 group-hover:ring-gold/30'
          }`}
        >
          <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
        </div>
      )}
    </LocaleLink>
  );
};

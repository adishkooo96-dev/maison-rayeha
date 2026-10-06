import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../hooks/useI18n';

export interface ThemeToggleProps {
  className?: string;
  isTransparent?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  isTransparent = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useI18n();

  const isDark = theme === 'dark';

  const ariaLabel =
    lang === 'fa'
      ? isDark
        ? 'حالت روشن (تغییر تم)'
        : 'حالت تیره (تغییر تم)'
      : isDark
      ? 'Light mode (switch theme)'
      : 'Dark mode (switch theme)';

  const tooltipTitle =
    lang === 'fa'
      ? isDark
        ? 'تغییر به حالت روشن'
        : 'تغییر به حالت تیره'
      : isDark
      ? 'Switch to Light mode'
      : 'Switch to Dark mode';

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={tooltipTitle}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0 cursor-pointer ${
        isTransparent
          ? 'text-white hover:text-gold'
          : 'text-[var(--text-primary)] hover:text-gold'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 stroke-[1.5] transition-transform duration-200 hover:rotate-45 text-gold-light" />
      ) : (
        <Moon className="w-5 h-5 stroke-[1.5] transition-transform duration-200 hover:-rotate-12 text-[var(--text-primary)] hover:text-gold" />
      )}
    </button>
  );
};

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
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0 cursor-pointer ${
        isTransparent
          ? 'text-white hover:text-gold-light'
          : isDark
          ? 'text-gold-light hover:text-white'
          : 'text-stone-800 hover:text-gold-dark'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 stroke-[1.75] transition-transform duration-200 hover:rotate-45 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.35)]" />
      ) : (
        <Moon className="w-5 h-5 stroke-[1.75] transition-transform duration-200 hover:-rotate-12 text-stone-700 hover:text-gold-dark" />
      )}
    </button>
  );
};

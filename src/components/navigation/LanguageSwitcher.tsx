import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../../types';
import { useI18n } from '../../hooks/useI18n';

export interface LanguageSwitcherProps {
  className?: string;
  isTransparent?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  isTransparent = false,
}) => {
  const { lang: routeLangParam } = useParams<{ lang?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  // URL :lang param is the single source of truth
  const pathFirstSegment = location.pathname.split('/').filter(Boolean)[0];
  const urlLang: Language =
    routeLangParam === 'en' || routeLangParam === 'fa'
      ? routeLangParam
      : pathFirstSegment === 'en'
      ? 'en'
      : 'fa';

  // The LanguageSwitcher shows the TARGET language: "EN" while on fa, "FA" while on en
  const targetLang: Language = urlLang === 'fa' ? 'en' : 'fa';
  const targetLabel = urlLang === 'fa' ? 'EN' : 'FA';

  const handleSwitch = () => {
    // Replace :lang prefix in the URL, keeping current page, search params, and hash
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments[0] === 'fa' || segments[0] === 'en') {
      segments[0] = targetLang;
    } else {
      segments.unshift(targetLang);
    }
    const targetPath = '/' + segments.join('/') + location.search + location.hash;
    navigate(targetPath);
  };

  return (
    <button
      type="button"
      id="language-switcher"
      onClick={handleSwitch}
      aria-label={`${t('common.language')}: ${targetLang === 'en' ? 'English' : 'فارسی'}`}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
        isTransparent
          ? 'border-ivory/40 text-ivory hover:text-gold hover:border-gold bg-black/30'
          : 'border-border text-near-black hover:text-gold hover:border-gold bg-ivory-subtle'
      } ${className}`}
    >
      {targetLabel}
    </button>
  );
};

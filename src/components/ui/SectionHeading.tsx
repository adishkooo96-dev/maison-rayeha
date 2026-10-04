import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
  darkVariant?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  darkVariant = false,
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col mb-12 sm:mb-16 ${
        isCenter ? 'items-center text-center' : 'items-start text-start'
      } ${className}`}
    >
      {eyebrow && (
        <span
          className={`text-xs md:text-sm font-medium tracking-widest rtl:tracking-normal uppercase mb-3 ${
            darkVariant ? 'text-gold-light' : 'text-gold-dark'
          }`}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal sm:font-medium font-display rtl:font-extrabold rtl:leading-[1.35] tracking-wide rtl:tracking-normal ${
          darkVariant ? 'text-ivory' : 'text-near-black'
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-sm sm:text-base max-w-2xl leading-relaxed rtl:leading-loose ${
            darkVariant ? 'text-ivory/70' : 'text-muted'
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Decorative luxury motif accent line with small diamond */}
      <div
        className={`flex items-center gap-2 mt-6 ${
          isCenter ? 'mx-auto' : ''
        }`}
        aria-hidden="true"
      >
        <div className="w-8 sm:w-12 h-[1.5px] bg-gold" />
        <div className={`w-2.5 h-2.5 rotate-45 border-[1.5px] border-gold ${darkVariant ? 'bg-near-black' : 'bg-ivory'}`} />
        <div className="w-8 sm:w-12 h-[1.5px] bg-gold" />
      </div>
    </div>
  );
};

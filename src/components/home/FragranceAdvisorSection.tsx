import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Send,
  Loader2,
  Award,
  Layers,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import {
  getFragranceRecommendations,
  getCuratedMasterpieceFallback,
  RecommendationResult,
} from '../../lib/geminiFragranceAdvisor';

const PRESET_QUERIES = [
  { fa: 'رایحه چوبی، وانیل دودی، مناسب شب‌های زمستان', en: 'Woody, smoky vanilla for winter nights' },
  { fa: 'مرکبات تازه، ترنج و چای سبز، خنک برای تابستان', en: 'Fresh citrus, bergamot and green tea for summer' },
  { fa: 'کهربا، زعفران و عود لوکس، ماندگاری بالا برای مراسم رسمی', en: 'Amber, saffron and royal oud for formal events' },
  { fa: 'رز فرانسوی، مشک سفید و پودری، ملایم و رمانتیک', en: 'French rose, white musk and powdery, gentle & romantic' },
];

export const FragranceAdvisorSection: React.FC = () => {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Immediately clear previous results on new search
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const data = await getFragranceRecommendations(trimmed, lang, controller.signal);
      if (controller.signal.aborted) return;
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setResult(data);
      } else {
        setResult(getCuratedMasterpieceFallback(trimmed, lang));
      }
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'AbortError') {
        return;
      }
      // Seamlessly activate curated fallback without showing red error banner
      setResult(getCuratedMasterpieceFallback(trimmed, lang));
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setQuery(presetText);
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery('');
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <section
      id="fragrance-advisor-section"
      className="py-16 sm:py-24 bg-[var(--bg-page)] text-[var(--text-primary)] relative overflow-hidden"
      aria-labelledby="fragrance-advisor-heading"
    >
      {/* Decorative ambient background glows */}
      <div
        className="absolute top-1/4 -start-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -end-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-medium uppercase tracking-widest rtl:tracking-normal mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>
              {lang === 'fa' ? 'هوش مصنوعی پیشرفته عطرسازی' : 'Gemini AI Scent Sommelier'}
            </span>
          </div>

          <h2
            id="fragrance-advisor-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-[var(--text-primary)] tracking-tight leading-tight"
          >
            {lang === 'fa' ? 'مشاور هوشمند رایحه و عطر' : 'Bespoke Fragrance Sommelier'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed">
            {lang === 'fa'
              ? 'سلیقه بویایی، نت‌های محبوب یا حس و حال مورد نظر خود را بنویسید تا هوش مصنوعی میسون با ارزیابی هارمونی عطرها، ۳ شاهکار برتر جهان را به شما پیشنهاد دهد.'
              : 'Describe your favorite olfactory notes, mood, or season. Our Gemini-powered perfumer curates three world-class masterpieces tailored to your scent signature.'}
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-3xl mx-auto bg-[var(--bg-surface)] border border-gold/30 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="fragrance-advisor-input"
                className="block text-xs uppercase tracking-wider font-semibold text-[var(--text-primary)]"
              >
                {lang === 'fa'
                  ? 'رایحه‌ها، طبع یا ویژگی‌های مورد نظر شما:'
                  : 'Your preferred notes, mood or occasion:'}
              </label>

              <div className="relative">
                <textarea
                  id="fragrance-advisor-input"
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    lang === 'fa'
                      ? 'مثال: عاشق بوی چوب صندل، قهوه و وانیل هستم؛ طبع گرم و سنگین برای فصول سرد با پخش بوی فوق‌العاده...'
                      : 'e.g. I love sandalwood, warm vanilla and smoky amber with high sillage for winter evenings...'
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 text-sm sm:text-base bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-[var(--text-secondary)]/60 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="pt-1">
              <span className="text-[11px] text-[var(--text-secondary)] block mb-2 font-medium">
                {lang === 'fa' ? 'یا از نمونه‌های پیشنهادی انتخاب کنید:' : 'Or tap an inspiration:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUERIES.map((preset, idx) => {
                  const text = lang === 'fa' ? preset.fa : preset.en;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(text)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] hover:text-gold hover:border-gold transition-colors text-start cursor-pointer disabled:opacity-50"
                    >
                      ✦ {text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 order-2 md:order-1 text-center md:text-start">
                <Compass className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>
                  {lang === 'fa'
                    ? 'تحلیل دقیق نت‌ها بر اساس دانش عطرسازی نیش'
                    : 'Curated by Haute Parfumerie expertise'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto order-1 md:order-2">
                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full sm:w-auto text-xs px-4 justify-center"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    {lang === 'fa' ? 'جستجوی جدید' : 'New Query'}
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading || !query.trim()}
                  isLoading={isLoading}
                  className="w-full sm:w-auto min-w-0 sm:min-w-[200px] justify-center shadow-md font-bold text-xs sm:text-sm tracking-wide px-5"
                  rightIcon={!isLoading ? <Send className="w-4 h-4 rtl:rotate-180" /> : undefined}
                >
                  {lang === 'fa' ? 'پیشنهاد عطر هوشمند' : 'Get Fragrance Recommendations'}
                </Button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}
        </div>

        {/* Loading State with Scent Calibration Animation */}
        {isLoading && (
          <div className="mt-12 text-center py-12 px-6 max-w-xl mx-auto rounded-2xl bg-[var(--bg-surface)]/70 border border-gold/30 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping opacity-75" />
              <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold flex items-center justify-center text-gold">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            </div>

            <h3 className="text-lg font-display text-[var(--text-primary)] font-medium">
              {lang === 'fa'
                ? 'استاد عطرساز در حال کاوش در میان شاهکارهای جهان است...'
                : 'Calibrating olfactory harmonies & world-class essences...'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-light">
              {lang === 'fa'
                ? 'تحلیل ساختار هرم بویایی، پایداری نت‌ها و میزان هماهنگی با سلیقه شما'
                : 'Analyzing top, heart, and base notes to create your ideal scent profile'}
            </p>
          </div>
        )}

        {/* Recommendations Result Showcase */}
        {result && !isLoading && (
          <div className="mt-12 sm:mt-16 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Honest Source Indicator Badge */}
            <div className="flex justify-center">
              {result.source === 'ai' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-medium shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>{t('advisor.aiNote')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] text-xs font-medium shadow-xs">
                  <Compass className="w-3.5 h-3.5 text-gold" />
                  <span>{t('advisor.fallbackNote')}</span>
                </div>
              )}
            </div>

            {/* Consultant Note Intro */}
            {result.consultantNote && (
              <div className="max-w-3xl mx-auto text-center p-6 rounded-2xl bg-[var(--bg-surface)] border-s-4 border-gold shadow-md">
                <span className="text-[11px] font-mono uppercase tracking-widest text-gold block mb-1">
                  {result.source === 'ai'
                    ? t('advisor.aiAnalysis')
                    : t('advisor.curatedSelection')}
                </span>
                <p className="text-sm sm:text-base text-[var(--text-primary)] font-serif italic leading-relaxed">
                  «{result.consultantNote}»
                </p>
              </div>
            )}

            {/* 3 Luxury Fragrance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {result.recommendations.map((perfume, index) => {
                return (
                  <div
                    key={index}
                    className="bg-[var(--bg-surface)] border border-gold/40 hover:border-gold rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient gold accent */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Card Header & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="w-7 h-7 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-mono font-bold text-xs">
                          {index + 1}
                        </span>
                        {perfume.scentFamily && (
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
                            {perfume.scentFamily}
                          </span>
                        )}
                      </div>

                      {/* Fragrance Name & Brand */}
                      <div className="mb-4">
                        {perfume.brand && (
                          <span className="text-[11px] uppercase tracking-widest text-gold-dark font-medium block mb-1">
                            {perfume.brand}
                          </span>
                        )}
                        <h3 className="text-xl sm:text-2xl font-display font-medium text-[var(--text-primary)] group-hover:text-gold transition-colors">
                          {perfume.name}
                        </h3>
                      </div>

                      {/* Olfactory Pyramid Notes */}
                      {((perfume.topNotes && perfume.topNotes.length > 0) ||
                        (perfume.heartNotes && perfume.heartNotes.length > 0) ||
                        (perfume.baseNotes && perfume.baseNotes.length > 0)) && (
                        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border)] mb-4 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-gold font-medium text-[11px] uppercase">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{lang === 'fa' ? 'هرم بویایی' : 'Olfactory Pyramid'}</span>
                          </div>

                          {perfume.topNotes && perfume.topNotes.length > 0 && (
                            <div className="text-[11px] leading-relaxed">
                              <span className="text-[var(--text-secondary)] font-medium me-1">
                                {lang === 'fa' ? 'نت آغازین:' : 'Top:'}
                              </span>
                              <span className="text-[var(--text-primary)]">
                                {perfume.topNotes.join('، ')}
                              </span>
                            </div>
                          )}

                          {perfume.heartNotes && perfume.heartNotes.length > 0 && (
                            <div className="text-[11px] leading-relaxed">
                              <span className="text-[var(--text-secondary)] font-medium me-1">
                                {lang === 'fa' ? 'نت میانی:' : 'Heart:'}
                              </span>
                              <span className="text-[var(--text-primary)]">
                                {perfume.heartNotes.join('، ')}
                              </span>
                            </div>
                          )}

                          {perfume.baseNotes && perfume.baseNotes.length > 0 && (
                            <div className="text-[11px] leading-relaxed">
                              <span className="text-[var(--text-secondary)] font-medium me-1">
                                {lang === 'fa' ? 'نت پایه:' : 'Base:'}
                              </span>
                              <span className="text-[var(--text-primary)]">
                                {perfume.baseNotes.join('، ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reason of recommendation */}
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                          <Award className="w-3.5 h-3.5 text-gold" />
                          <span>{lang === 'fa' ? 'چرا این عطر؟' : 'Why this perfume?'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                          {perfume.reason}
                        </p>
                      </div>
                    </div>

                    {/* Season / Occasion Tag */}
                    {perfume.seasonOrOccasion && (
                      <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                        <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="truncate">{perfume.seasonOrOccasion}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

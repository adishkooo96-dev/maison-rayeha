import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Clock,
  Wind,
  ShieldCheck,
  X,
  MessageSquarePlus,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';
import { CustomerReview, ReviewStats, ReviewSortOption } from '../../types/review';
import {
  getProductReviews,
  addProductReview,
  toggleReviewHelpful,
  calculateReviewStats,
} from '../../data/reviews';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';

export interface ProductReviewsProps {
  product: Product;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const { lang, isRTL, t, formatNumber } = useI18n();

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [onlyVerifiedFilter, setOnlyVerifiedFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form fields
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formName, setFormName] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formSize, setFormSize] = useState<string>(
    product.sizes.length > 0 ? `${product.sizes[0].ml}ml` : '50ml'
  );
  const [formLongevity, setFormLongevity] = useState<'moderate' | 'long' | 'eternal'>('long');
  const [formSillage, setFormSillage] = useState<'intimate' | 'moderate' | 'strong' | 'enormous'>('strong');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formComment, setFormComment] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Load reviews on product change
  useEffect(() => {
    const list = getProductReviews(product.id);
    setReviews(list);
    setSelectedRatingFilter(null);
    setOnlyVerifiedFilter(false);
    setSortBy('newest');
  }, [product.id]);

  // Handle escape key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Calculate stats
  const stats: ReviewStats = useMemo(() => {
    return calculateReviewStats(reviews);
  }, [reviews]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (selectedRatingFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    if (onlyVerifiedFilter) {
      result = result.filter((r) => r.verifiedPurchase);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      if (sortBy === 'most-helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      return 0;
    });

    return result;
  }, [reviews, selectedRatingFilter, onlyVerifiedFilter, sortBy]);

  // Handle helpful vote
  const handleHelpfulClick = (reviewId: string) => {
    toggleReviewHelpful(reviewId);
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const nextVoted = !r.userVotedHelpful;
          return {
            ...r,
            userVotedHelpful: nextVoted,
            helpfulCount: r.helpfulCount + (nextVoted ? 1 : -1),
          };
        }
        return r;
      })
    );
  };

  // Submit new review
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formComment.trim()) {
      setFormError(t('reviews.validationRequired'));
      return;
    }

    setSubmitting(true);
    setFormError(null);

    setTimeout(() => {
      const created = addProductReview({
        productId: product.id,
        authorName: formName.trim(),
        authorLocation: formLocation.trim() || undefined,
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
        verifiedPurchase: true,
        purchasedSize: formSize,
        longevityRating: formLongevity,
        sillageRating: formSillage,
      });

      setReviews((prev) => [created, ...prev]);
      setSubmitting(false);
      setSubmitSuccess(true);

      // Reset form
      setFormTitle('');
      setFormComment('');

      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
      }, 1800);
    }, 400);
  };

  const ratingLabelMap: Record<number, string> = {
    5: lang === 'fa' ? 'شاهکار بویایی (۵ از ۵)' : 'Masterwork (5 of 5)',
    4: lang === 'fa' ? 'بسیار باکیفیت و دلنشین (۴ از ۵)' : 'Very High Quality (4 of 5)',
    3: lang === 'fa' ? 'خوب و معقول (۳ از ۵)' : 'Good & Pleasant (3 of 5)',
    2: lang === 'fa' ? 'متوسط و معمولی (۲ از ۵)' : 'Fair & Average (2 of 5)',
    1: lang === 'fa' ? 'پایین‌تر از انتظار (۱ از ۵)' : 'Below Expectations (1 of 5)',
  };

  return (
    <section className="pt-20 border-t border-border/80 text-start" aria-labelledby="reviews-heading">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-border/80">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-gold-dark font-medium block mb-1">
            {t('reviews.sectionSubtitle')}
          </span>
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-display font-light text-near-black">
            {t('reviews.sectionTitle')}
          </h2>
        </div>

        <Button
          variant="primary"
          size="md"
          className="shadow-2xs self-start md:self-auto"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<MessageSquarePlus className="w-4 h-4 stroke-[1.5]" />}
        >
          {t('reviews.writeReviewBtn')}
        </Button>
      </div>

      {/* Ratings & Sensory Consensuses Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 bg-ivory-surface border border-border/80 p-6 sm:p-8 rounded-xs shadow-2xs">
        {/* Left: Overall Score and Distribution */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b lg:border-b-0 lg:border-e border-border/70 pb-8 lg:pb-0 lg:pe-8">
          <div className="flex flex-col items-center justify-center text-center shrink-0 min-w-[130px]">
            <span className="text-5xl sm:text-6xl font-display font-light text-near-black tracking-tight">
              {formatNumber(stats.averageRating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <div className="flex items-center gap-1 text-gold my-2" aria-label={`Rating: ${stats.averageRating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(stats.averageRating)
                      ? 'fill-gold text-gold stroke-[1.5]'
                      : 'text-border fill-border'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-muted font-light">
              {t('reviews.basedOn', { count: formatNumber(stats.totalReviews) })}
            </span>
            <span className="text-[11px] text-gold-dark font-medium mt-1">
              {t('reviews.recommendationRate', { percent: formatNumber(stats.recommendPercent) })}
            </span>
          </div>

          {/* Star Distribution Bars */}
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              const isSelected = selectedRatingFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setSelectedRatingFilter(isSelected ? null : stars)}
                  className={`w-full group flex items-center gap-2.5 text-xs py-1 px-1.5 rounded-xs transition-colors cursor-pointer text-start ${
                    isSelected ? 'bg-gold/15 font-medium' : 'hover:bg-ivory'
                  }`}
                  aria-label={`Filter by ${stars} stars`}
                >
                  <span className="w-12 text-muted font-light flex items-center gap-1">
                    <span>{formatNumber(stars)}</span>
                    <Star className="w-3 h-3 fill-gold text-gold" />
                  </span>

                  <div className="flex-1 h-2 bg-ivory-subtle border border-border/40 rounded-xs overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-xs ${
                        isSelected ? 'bg-gold' : 'bg-gold/75 group-hover:bg-gold'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-10 text-end text-[11px] text-muted font-mono">
                    {formatNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Scent Sensory Consensuses */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Longevity Consensus */}
            <div className="bg-ivory border border-border/70 p-4 rounded-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-near-black flex items-center gap-2">
                  <Clock className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                  {t('reviews.longevityConsensus')}
                </span>
                <span className="text-[11px] text-gold-dark font-medium">
                  {lang === 'fa' ? stats.longevityConsensus.label.fa : stats.longevityConsensus.label.en}
                </span>
              </div>
              <div className="h-1.5 bg-ivory-subtle border border-border/40 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-gold-dark rounded-xs"
                  style={{ width: `${(stats.longevityConsensus.score / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Sillage Consensus */}
            <div className="bg-ivory border border-border/70 p-4 rounded-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-near-black flex items-center gap-2">
                  <Wind className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                  {t('reviews.sillageConsensus')}
                </span>
                <span className="text-[11px] text-gold-dark font-medium">
                  {lang === 'fa' ? stats.sillageConsensus.label.fa : stats.sillageConsensus.label.en}
                </span>
              </div>
              <div className="h-1.5 bg-ivory-subtle border border-border/40 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-gold-dark rounded-xs"
                  style={{ width: `${(stats.sillageConsensus.score / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quality & Batch Authenticity Guarantee */}
          <div className="flex items-center gap-3 p-3 bg-gold/10 border border-gold/30 rounded-xs text-xs text-near-black">
            <ShieldCheck className="w-5 h-5 stroke-[1.5] text-gold-dark shrink-0" />
            <span className="font-light text-[11px] leading-relaxed">
              {lang === 'fa'
                ? 'تمامی نقدها از خریداران مستند و هواداران معتبر آتلیه میسون رایحه جمع‌آوری و اعتبارسنجی شده است.'
                : 'All critiques are certified from documented patrons and fragrance connoisseurs of Maison Rayeha.'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border/60">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRatingFilter(null)}
            className={`min-h-[38px] px-3 text-xs rounded-xs border transition-colors cursor-pointer ${
              selectedRatingFilter === null && !onlyVerifiedFilter
                ? 'bg-near-black text-ivory border-near-black shadow-2xs font-medium'
                : 'bg-ivory text-near-black border-border hover:border-gold/60'
            }`}
          >
            {t('reviews.filterAll')}
          </button>

          <button
            type="button"
            onClick={() => setOnlyVerifiedFilter(!onlyVerifiedFilter)}
            className={`min-h-[38px] px-3 text-xs rounded-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
              onlyVerifiedFilter
                ? 'bg-gold text-near-black border-gold shadow-2xs font-medium'
                : 'bg-ivory text-near-black border-border hover:border-gold/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{t('reviews.filterVerified')}</span>
          </button>

          {selectedRatingFilter !== null && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gold/15 text-gold-dark border border-gold/40 rounded-xs">
              <span>{t('reviews.filterStars', { stars: formatNumber(selectedRatingFilter) })}</span>
              <button
                type="button"
                onClick={() => setSelectedRatingFilter(null)}
                className="hover:text-near-black cursor-pointer ms-1 p-0.5"
                aria-label="Clear star filter"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted font-light">{t('reviews.sortLabel')}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
            className="min-h-[38px] px-3 py-1 bg-ivory text-near-black border border-border rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer text-xs"
          >
            <option value="newest">{t('reviews.sortNewest')}</option>
            <option value="highest">{t('reviews.sortHighest')}</option>
            <option value="lowest">{t('reviews.sortLowest')}</option>
            <option value="most-helpful">{t('reviews.sortHelpful')}</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredAndSortedReviews.length === 0 ? (
        <div className="py-16 text-center bg-ivory-surface border border-border/80 rounded-xs p-8 shadow-2xs">
          <Filter className="w-8 h-8 stroke-[1.5] text-gold-dark mx-auto mb-3" />
          <p className="text-sm text-near-black font-medium">{t('reviews.noReviewsFound')}</p>
          <button
            type="button"
            onClick={() => {
              setSelectedRatingFilter(null);
              setOnlyVerifiedFilter(false);
            }}
            className="mt-3 text-xs text-gold-dark underline hover:text-gold cursor-pointer"
          >
            {t('reviews.filterAll')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedReviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-ivory-surface border border-border/80 p-6 sm:p-7 rounded-xs shadow-2xs transition-all hover:border-gold/40"
            >
              {/* Header: Reviewer Info & Ratings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 text-gold-dark flex items-center justify-center font-display font-medium text-sm shrink-0">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-near-black">{rev.authorName}</h3>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gold-dark font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5] text-gold-dark" />
                          <span>{t('reviews.verifiedBuyerBadge')}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted font-light mt-0.5">
                      {rev.authorLocation && <span>{rev.authorLocation} · </span>}
                      {rev.purchasedSize && (
                        <span>
                          {t('reviews.purchasedSizeLabel')} {rev.purchasedSize} ·{' '}
                        </span>
                      )}
                      <span>{rev.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gold self-start sm:self-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(rev.rating)
                          ? 'fill-gold text-gold stroke-[1.5]'
                          : 'text-border fill-border'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="text-xs font-mono font-semibold text-near-black ms-1">
                    {formatNumber(rev.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

              {/* Olfactory Tags */}
              {(rev.longevityRating || rev.sillageRating) && (
                <div className="flex flex-wrap items-center gap-3 my-3 text-[11px] text-muted">
                  {rev.longevityRating && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-dark stroke-[1.5]" />
                      <span>{t('reviews.longevityConsensus')}:</span>
                      <strong className="text-near-black font-medium">
                        {rev.longevityRating === 'eternal'
                          ? t('reviews.formLongevityEternal')
                          : rev.longevityRating === 'long'
                          ? t('reviews.formLongevityLong')
                          : t('reviews.formLongevityModerate')}
                      </strong>
                    </span>
                  )}
                  {rev.sillageRating && (
                    <span className="inline-flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-gold-dark stroke-[1.5]" />
                      <span>{t('reviews.sillageConsensus')}:</span>
                      <strong className="text-near-black font-medium">
                        {rev.sillageRating === 'enormous'
                          ? t('reviews.formSillageEnormous')
                          : rev.sillageRating === 'strong'
                          ? t('reviews.formSillageStrong')
                          : rev.sillageRating === 'moderate'
                          ? t('reviews.formSillageModerate')
                          : t('reviews.formSillageIntimate')}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* Review Headline & Body */}
              <div className="mt-3">
                <h4 className="text-base font-medium text-near-black font-display mb-2">{rev.title}</h4>
                <p className="text-xs sm:text-sm text-near-black/80 font-light leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>

              {/* Card Footer: Helpful button */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                <button
                  type="button"
                  onClick={() => handleHelpfulClick(rev.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    rev.userVotedHelpful
                      ? 'bg-gold/15 text-gold-dark border-gold/40 font-medium'
                      : 'bg-ivory text-muted hover:text-near-black border-border hover:border-gold/60'
                  }`}
                  aria-label="Vote this review as helpful"
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 stroke-[1.5] ${
                      rev.userVotedHelpful ? 'fill-gold-dark text-gold-dark' : ''
                    }`}
                  />
                  <span>
                    {rev.userVotedHelpful ? t('reviews.helpfulThanks') : t('reviews.helpfulButton')} (
                    {formatNumber(rev.helpfulCount)})
                  </span>
                </button>

                <span className="text-[11px] text-muted/80">Maison Rayeha Concierge Verified</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('reviews.modalTitle')}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-near-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-ivory-surface border border-border shadow-2xl p-6 sm:p-8 rounded-xs text-start relative my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/80 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-dark font-medium block mb-1">
                  Maison Rayeha Critique
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-light text-near-black">
                  {t('reviews.modalTitle')}
                </h3>
                <p className="text-xs text-muted font-light mt-1">
                  {t('reviews.modalSubtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={t('common.close')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-near-black transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Success message */}
            {submitSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gold/15 text-gold-dark border border-gold/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-lg font-display text-near-black">{t('reviews.formSuccess')}</h4>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xs">
                    {formError}
                  </div>
                )}

                {/* Rating Stars Picker */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                    {t('reviews.formRating')} *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        aria-label={`Select ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 stroke-[1.5] ${
                            star <= (hoverRating || formRating)
                              ? 'fill-gold text-gold'
                              : 'text-border fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ms-3 text-xs text-gold-dark font-medium">
                      {ratingLabelMap[hoverRating || formRating]}
                    </span>
                  </div>
                </div>

                {/* Sensory Assessments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Longevity */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                      {t('reviews.formLongevity')}
                    </label>
                    <select
                      value={formLongevity}
                      onChange={(e) => setFormLongevity(e.target.value as 'moderate' | 'long' | 'eternal')}
                      className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <option value="moderate">{t('reviews.formLongevityModerate')}</option>
                      <option value="long">{t('reviews.formLongevityLong')}</option>
                      <option value="eternal">{t('reviews.formLongevityEternal')}</option>
                    </select>
                  </div>

                  {/* Sillage */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                      {t('reviews.formSillage')}
                    </label>
                    <select
                      value={formSillage}
                      onChange={(e) => setFormSillage(e.target.value as 'intimate' | 'moderate' | 'strong' | 'enormous')}
                      className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <option value="intimate">{t('reviews.formSillageIntimate')}</option>
                      <option value="moderate">{t('reviews.formSillageModerate')}</option>
                      <option value="strong">{t('reviews.formSillageStrong')}</option>
                      <option value="enormous">{t('reviews.formSillageEnormous')}</option>
                    </select>
                  </div>
                </div>

                {/* Personal Information & Bottle Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                      {t('reviews.formName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t('reviews.formNamePlaceholder')}
                      className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-muted/60"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                      {t('reviews.formLocation')}
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder={t('reviews.formLocationPlaceholder')}
                      className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-muted/60"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                      {t('reviews.formSize')}
                    </label>
                    <select
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {product.sizes.map((s) => (
                        <option key={s.ml} value={`${s.ml}ml`}>
                          {s.ml} ml
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                    {t('reviews.formReviewTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={t('reviews.formReviewTitlePlaceholder')}
                    className="w-full bg-ivory border border-border px-3 py-2 text-xs text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-muted/60"
                  />
                </div>

                {/* Detailed Comment */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                    {t('reviews.formComment')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder={t('reviews.formCommentPlaceholder')}
                    className="w-full bg-ivory border border-border p-3 text-xs text-near-black rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold placeholder:text-muted/60 leading-relaxed"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsModalOpen(false)}
                  >
                    {t('common.close')}
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    disabled={submitting}
                    leftIcon={<Sparkles className="w-4 h-4 stroke-[1.5]" />}
                  >
                    {submitting ? t('reviews.formSubmitting') : t('reviews.formSubmit')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

import { CustomerReview, ReviewStats } from '../types/review';

const LOCAL_STORAGE_REVIEWS_KEY = 'maison_rayeha_customer_reviews';
const LOCAL_STORAGE_VOTES_KEY = 'maison_rayeha_helpful_votes';

export const SEED_REVIEWS: Record<string, CustomerReview[]> = {
  'oud-nocturne': [
    {
      id: 'rev-on-1',
      productId: 'oud-nocturne',
      authorName: 'دکتر علیرضا سپهری',
      authorLocation: 'تهران، فرمانیه',
      rating: 5,
      title: 'شاهکار اصیل عطرسازی نیش شرق',
      comment: 'عود نوکتورن بی‌شک یکی از باشکوه‌ترین تفاسیر از عود کامبوج است. رایحه زعفران در دقایق نخست اعجاز می‌کند و پیوند آن با چرم دباغی‌شده و کندر عمانی، حسی از یک کاخ کهن و مجلل را تداعی می‌نماید. ماندگاری روی لباس بیش از دو روز و پخش بو تحسین‌برانگیز است.',
      createdAt: '2026-08-14',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'eternal',
      sillageRating: 'enormous',
      helpfulCount: 42,
    },
    {
      id: 'rev-on-2',
      productId: 'oud-nocturne',
      authorName: 'نسترن حسینی',
      authorLocation: 'دبی، امارات',
      rating: 5,
      title: 'بسته‌بندی فاخر، رایحه‌ای بی‌نظیر برای شب',
      comment: 'جعبه چوبی با مهر موم طلایی هنگام بازگشایی حس یک شیء عتیقه سلطنتی را منتقل می‌کند. من ۵۰ میل را سفارش دادم و بازخورد فوق‌العاده‌ای در مهمانی‌های رسمی گرفتم. رز دمشقی در میانه کار تیزی عود را بسیار تلطیف کرده است.',
      createdAt: '2026-08-02',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'eternal',
      sillageRating: 'strong',
      helpfulCount: 28,
    },
    {
      id: 'rev-on-3',
      productId: 'oud-nocturne',
      authorName: 'Jean-Marc Dupont',
      authorLocation: 'Paris, France',
      rating: 5,
      title: 'A true collector gem of highest calibre',
      comment: 'The balance between smoky Cambodian agarwood and Persian saffron is unmatched. Often western houses over-sweeten Eastern accords, but Maison Rayeha crafted this with pure aristocratic austerity. Magnificent.',
      createdAt: '2026-07-20',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'eternal',
      sillageRating: 'strong',
      helpfulCount: 19,
    },
    {
      id: 'rev-on-4',
      productId: 'oud-nocturne',
      authorName: 'مهندس کاوه شمس',
      authorLocation: 'شیراز',
      rating: 4,
      title: 'بسیار باکیفیت و باوقار، مخصوص فصول سرد',
      comment: 'عطری به غایت سنگین و باوقار. برای جلسات کاری سطح بالا و زمستان فوق‌العاده است. در روزهای گرم توصیه نمی‌شود زیرا غلظت ۳۰ درصدی بسیار قوی دارد. کیفیت اسانس‌ها بدون حتی ذره‌ای حالت شیمیایی است.',
      createdAt: '2026-06-29',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'long',
      sillageRating: 'strong',
      helpfulCount: 14,
    },
  ],
  'rose-de-shiraz': [
    {
      id: 'rev-rs-1',
      productId: 'rose-de-shiraz',
      authorName: 'سارا پرتوآذر',
      authorLocation: 'تهران، شهرک غرب',
      rating: 5,
      title: 'نرم‌ترین و اشرافی‌ترین رز دنیا',
      comment: 'هیچ شباهتی به رزهای تکراری و گلابی ندارد؛ بوی گلبرگ تازه چیده شده همراه با شبنم صبحگاهی در باغ‌های قصرالدشت شیراز است. وانیل بوربون و مشک کشمیر در انتها فضایی مخملی و بی‌نهایت لطیف خلق می‌کنند.',
      createdAt: '2026-08-19',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'long',
      sillageRating: 'strong',
      helpfulCount: 35,
    },
    {
      id: 'rev-rs-2',
      productId: 'rose-de-shiraz',
      authorName: 'فرهاد ناصری',
      authorLocation: 'اصفهان',
      rating: 5,
      title: 'هدیه‌ای به یادماندنی با امضای میسون رایحه',
      comment: 'به عنوان هدیه سالگرد ازدواج برای همسرم خریدم. جعبه دست‌ساز چوبی و کارت اصالت خوش‌نویسی شده ارزش خرید را دوچندان کرده است. ماندگاری روی شال و پالتو عالی است.',
      createdAt: '2026-07-31',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'long',
      sillageRating: 'moderate',
      helpfulCount: 22,
    },
    {
      id: 'rev-rs-3',
      productId: 'rose-de-shiraz',
      authorName: 'Elena Rostova',
      authorLocation: 'Geneva, Switzerland',
      rating: 5,
      title: 'Sublime poetic velvet',
      comment: 'The pink peppercorn and wild raspberry opening keeps the rose modern and luminous. It does not feel antique or heavy; it feels like walking through an imperial private garden in early May.',
      createdAt: '2026-06-15',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'long',
      sillageRating: 'moderate',
      helpfulCount: 17,
    },
  ],
  'santal-celeste': [
    {
      id: 'rev-sc-1',
      productId: 'santal-celeste',
      authorName: 'پویا امین‌زاده',
      authorLocation: 'تهران، الهیه',
      rating: 5,
      title: 'آرامش محض؛ لمس صندل کرمی و شیر بادام',
      comment: 'رایحه مراقبه‌گون و معنوی چوب صندل میسور با زنبق فلورانسی هارمونی شگفت‌انگیزی دارد. خط بوی آن سرگیجه‌آور نیست بلکه هاله‌ای از آرامش و شیک‌پوشی مینیمال دور شما ایجاد می‌کند.',
      createdAt: '2026-08-05',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'long',
      sillageRating: 'moderate',
      helpfulCount: 29,
    },
    {
      id: 'rev-sc-2',
      productId: 'santal-celeste',
      authorName: 'مریم بهرامی',
      authorLocation: 'تبریز',
      rating: 5,
      title: 'یونیسکس به معنای واقعی کلمه',
      comment: 'هم من و هم همسرم استفاده می‌کنیم و روی پوست هر کدام از ما پیچیدگی متفاوتی را آشکار می‌کند. در روزهای پاییزی بوی چوب خیس‌خورده و کرم بادام حس بی‌نظیری دارد.',
      createdAt: '2026-07-12',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'long',
      sillageRating: 'moderate',
      helpfulCount: 16,
    },
  ],
};

// Generic seed reviews generator for other products so no product has an empty state
export function getDefaultReviewsForProduct(productId: string): CustomerReview[] {
  if (SEED_REVIEWS[productId]) {
    return SEED_REVIEWS[productId];
  }

  return [
    {
      id: `rev-${productId}-1`,
      productId,
      authorName: 'کیوان دادرس',
      authorLocation: 'تهران، تجریش',
      rating: 5,
      title: 'کیفیت اسانس‌های نیش کاملاً ملموس است',
      comment: 'شفافیت و عمق نوت‌ها از همان پاف اول تفاوت چشمگیر خود را با عطرهای تجاری نشان می‌دهد. هیچ‌گونه نت تند الکلی در شروع حس نمی‌شود و تغییر فاز از نوت آغازین به قلب عطر با ظرافت هنرمندانه‌ای صورت می‌گیرد.',
      createdAt: '2026-08-11',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'long',
      sillageRating: 'strong',
      helpfulCount: 18,
    },
    {
      id: `rev-${productId}-2`,
      productId,
      authorName: 'سمیرا خسروانی',
      authorLocation: 'مشهد',
      rating: 5,
      title: 'هنر عطرسازی اصیل و بسته‌بندی شاهکار',
      comment: 'از ظرافت تراش بطری کریستال تا هرم بویایی لایه‌لایه، همه چیز در اوج سلیقه طراحی شده است. رد بوی عطر تا ساعت‌ها در فضای اتاق باقی می‌ماند و حس آرامش و تمایز را القا می‌کند.',
      createdAt: '2026-07-28',
      verifiedPurchase: true,
      purchasedSize: '100ml',
      longevityRating: 'long',
      sillageRating: 'strong',
      helpfulCount: 12,
    },
    {
      id: `rev-${productId}-3`,
      productId,
      authorName: 'Marcus Vance',
      authorLocation: 'London, UK',
      rating: 4,
      title: 'Impeccable distillation and natural balance',
      comment: 'A masterclass in restraint and luxury composition. The fragrance stays close yet project effortlessly upon movement. Elegant, distinctive, and completely worthy of a boutique collection.',
      createdAt: '2026-06-22',
      verifiedPurchase: true,
      purchasedSize: '50ml',
      longevityRating: 'long',
      sillageRating: 'moderate',
      helpfulCount: 9,
    },
  ];
}

// Read reviews from localStorage + seed
export function getProductReviews(productId: string): CustomerReview[] {
  const seeds = getDefaultReviewsForProduct(productId);
  if (typeof window === 'undefined') return seeds;

  try {
    const rawStored = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    const stored: Record<string, CustomerReview[]> = rawStored ? JSON.parse(rawStored) : {};
    const productStored = stored[productId] || [];

    // Combine stored user reviews first, then seeds
    const combined = [...productStored, ...seeds];

    // Check user helpful votes
    const rawVotes = localStorage.getItem(LOCAL_STORAGE_VOTES_KEY);
    const votes: Record<string, boolean> = rawVotes ? JSON.parse(rawVotes) : {};

    return combined.map((rev) => ({
      ...rev,
      userVotedHelpful: !!votes[rev.id],
      helpfulCount: rev.helpfulCount + (votes[rev.id] ? 1 : 0),
    }));
  } catch {
    return seeds;
  }
}

// Add a new user review
export function addProductReview(review: Omit<CustomerReview, 'id' | 'createdAt' | 'helpfulCount' | 'userVotedHelpful'>): CustomerReview {
  const newReview: CustomerReview = {
    ...review,
    id: `user-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString().split('T')[0],
    helpfulCount: 0,
    userVotedHelpful: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const rawStored = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      const stored: Record<string, CustomerReview[]> = rawStored ? JSON.parse(rawStored) : {};
      if (!stored[review.productId]) {
        stored[review.productId] = [];
      }
      stored[review.productId].unshift(newReview);
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(stored));
    } catch (e) {
      console.error('Error saving review to localStorage', e);
    }
  }

  return newReview;
}

// Toggle helpful vote
export function toggleReviewHelpful(reviewId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const rawVotes = localStorage.getItem(LOCAL_STORAGE_VOTES_KEY);
    const votes: Record<string, boolean> = rawVotes ? JSON.parse(rawVotes) : {};
    const hasVoted = !!votes[reviewId];

    if (hasVoted) {
      delete votes[reviewId];
    } else {
      votes[reviewId] = true;
    }

    localStorage.setItem(LOCAL_STORAGE_VOTES_KEY, JSON.stringify(votes));
    return !hasVoted;
  } catch {
    return false;
  }
}

// Calculate comprehensive review stats for a product
export function calculateReviewStats(reviews: CustomerReview[]): ReviewStats {
  if (!reviews.length) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recommendPercent: 100,
      longevityConsensus: {
        label: { fa: 'بسیار طولانی (بیش از ۱۰ ساعت)', en: 'Very Long Lasting (>10h)' },
        score: 4.8,
      },
      sillageConsensus: {
        label: { fa: 'گیرا و پرقدرت', en: 'Strong & Noticeable' },
        score: 4.6,
      },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  let recommendCount = 0;

  reviews.forEach((r) => {
    const clampedRating = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[clampedRating] = (distribution[clampedRating] || 0) + 1;
    sum += r.rating;
    if (r.rating >= 4) recommendCount += 1;
  });

  const averageRating = Number((sum / reviews.length).toFixed(1));
  const recommendPercent = Math.round((recommendCount / reviews.length) * 100);

  return {
    averageRating,
    totalReviews: reviews.length,
    distribution,
    recommendPercent,
    longevityConsensus: {
      label: { fa: 'بسیار طولانی (۱۰ تا ۱۴ ساعت)', en: 'Very Long Lasting (10–14h)' },
      score: 4.8,
    },
    sillageConsensus: {
      label: { fa: 'خط بوی ماندگار و گیرا', en: 'Enveloping & Sophisticated' },
      score: 4.6,
    },
  };
}

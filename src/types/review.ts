import { Language } from './index';

export interface CustomerReview {
  id: string;
  productId: string;
  authorName: string;
  authorLocation?: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  createdAt: string; // ISO date string or formatted date
  verifiedPurchase: boolean;
  purchasedSize?: string; // e.g. '50ml' | '100ml'
  longevityRating?: 'moderate' | 'long' | 'eternal'; // 'متوسط' | 'طولانی' | 'ماندگاری بی‌پایان'
  sillageRating?: 'intimate' | 'moderate' | 'strong' | 'enormous'; // 'نزدیک به پوست' | 'متوسط' | 'قوی' | 'فراگیر'
  helpfulCount: number;
  userVotedHelpful?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendPercent: number;
  longevityConsensus: {
    label: { fa: string; en: string };
    score: number; // 1-5 scale
  };
  sillageConsensus: {
    label: { fa: string; en: string };
    score: number; // 1-5 scale
  };
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'most-helpful';

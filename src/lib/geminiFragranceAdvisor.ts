import { GoogleGenAI, Type, Schema } from '@google/genai';
import { products } from '../data/products';

export interface RecommendedPerfume {
  name: string;
  brand?: string;
  scentFamily?: string;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  reason: string;
  seasonOrOccasion?: string;
}

export interface RecommendationResult {
  consultantNote: string;
  recommendations: RecommendedPerfume[];
}

const RECOMMENDATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    consultantNote: {
      type: Type.STRING,
      description: 'A brief, elegant introduction from the master perfumer in warm Persian addressing the user.',
    },
    recommendations: {
      type: Type.ARRAY,
      description: 'Exactly 3 renowned global perfumes matching the user taste.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Name of the fragrance (e.g., Creed Aventus, Tom Ford Tobacco Vanille, Maison Rayeha Oud Nocturne).',
          },
          brand: {
            type: Type.STRING,
            description: 'Fragrance brand house.',
          },
          scentFamily: {
            type: Type.STRING,
            description: 'Olfactory family or vibe in Persian (e.g. چوبی کهربایی، مرکباتی معطر، شرقی وانیلی).',
          },
          topNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key top olfactory notes.',
          },
          heartNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key heart olfactory notes.',
          },
          baseNotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key base olfactory notes.',
          },
          reason: {
            type: Type.STRING,
            description: 'Detailed yet concise poetic reason in Persian why this matches the user input.',
          },
          seasonOrOccasion: {
            type: Type.STRING,
            description: 'Best season or occasion to wear in Persian.',
          },
        },
        required: ['name', 'brand', 'scentFamily', 'reason'],
      },
    },
  },
  required: ['consultantNote', 'recommendations'],
};

/**
 * Maps scent family key to readable Persian text.
 */
function getFamilyLabelFa(family: string): string {
  switch (family) {
    case 'oriental':
      return 'شرقی و کهربایی سلطنتی';
    case 'woody':
      return 'چوبی و رزینی نیش';
    case 'fresh':
      return 'مرکباتی و اقیانوسی خنک';
    case 'floral':
      return 'گلی و مخملی فاخر';
    default:
      return 'نیش اختصاصی';
  }
}

/**
 * Intelligent client-side fallback based on products in the project and international classics.
 * Always returns a rich, tailored 3-perfume recommendation even if Gemini API is unreachable or denied.
 */
export function getCuratedMasterpieceFallback(userQuery: string, lang: 'fa' | 'en' = 'fa'): RecommendationResult {
  const q = (userQuery || '').toLowerCase();

  // Try matching directly against project catalog
  const matchingFromCatalog: RecommendedPerfume[] = [];

  for (const p of products) {
    const nameStr = `${p.name.fa} ${p.name.en} ${p.brand} ${p.scentFamily}`.toLowerCase();
    const notesStr = [
      ...(p.notes.top.fa || []),
      ...(p.notes.heart.fa || []),
      ...(p.notes.base.fa || []),
      ...(p.notes.top.en || []),
      ...(p.notes.heart.en || []),
      ...(p.notes.base.en || []),
    ].join(' ').toLowerCase();

    // Check if user query matches product family, name, or notes
    const isFamilyMatch =
      (q.includes('چوب') || q.includes('wood')) && p.scentFamily === 'woody' ||
      (q.includes('شرق') || q.includes('عود') || q.includes('oud') || q.includes('oriental')) && p.scentFamily === 'oriental' ||
      (q.includes('خنک') || q.includes('مرکبات') || q.includes('fresh') || q.includes('citrus')) && p.scentFamily === 'fresh' ||
      (q.includes('گل') || q.includes('floral') || q.includes('رز') || q.includes('rose')) && p.scentFamily === 'floral';

    const isDirectMatch = q.split(/\s+/).some((word) => word.length > 2 && (nameStr.includes(word) || notesStr.includes(word)));

    if (isFamilyMatch || isDirectMatch) {
      matchingFromCatalog.push({
        name: lang === 'fa' ? p.name.fa : p.name.en,
        brand: p.brand,
        scentFamily: lang === 'fa' ? getFamilyLabelFa(p.scentFamily) : p.scentFamily,
        topNotes: lang === 'fa' ? p.notes.top.fa : p.notes.top.en,
        heartNotes: lang === 'fa' ? p.notes.heart.fa : p.notes.heart.en,
        baseNotes: lang === 'fa' ? p.notes.base.fa : p.notes.base.en,
        reason: lang === 'fa' ? p.description.fa : p.description.en,
        seasonOrOccasion: lang === 'fa' ? (p.isBestseller ? 'چهارفصل، موقعیت‌های ویژه و محافل رسمی' : 'تمام فصول') : 'Signature versatile wear',
      });
    }

    if (matchingFromCatalog.length >= 3) break;
  }

  // Woody & Oud specialized fallback
  if (q.includes('چوب') || q.includes('wood') || q.includes('عود') || q.includes('oud') || q.includes('صندل')) {
    return {
      consultantNote:
        lang === 'fa'
          ? 'بر اساس علاقه و اشتیاق شما به نت‌های اصیل چوبی و رزین‌های گرانبها، این ۳ شاهکار باوقار و پرشکوه برای امضای بویایی شما برگزیده شدند:'
          : 'Based on your preference for noble woods and precious resins, here are three curated masterworks for your olfactory signature:',
      recommendations: [
        {
          name: 'عود نوکتورن (Oud Nocturne)',
          brand: 'Maison Rayeha Haute Parfumerie',
          scentFamily: 'شرقی چوبی سلطنتی',
          topNotes: ['زعفران قائنات', 'هل سبز گواتمالا', 'ترنج کالابریا'],
          heartNotes: ['رز دمشقی ارگانیک', 'چرم دباغی‌شده', 'کندر عمانی'],
          baseNotes: ['عود طبیعی کامبوج', 'کهربای تیره', 'چوب صندل کهن'],
          reason: 'فرمولاسیون دست‌ساز نیش با ۳۰٪ غلظت روغن خالص که عمق باستانی عود و گرمای لوکس کهربا را به کمال رسانده است.',
          seasonOrOccasion: 'مراسم رسمی فاخر و ضیافت‌های مجلل شبانه',
        },
        {
          name: 'Oud Wood',
          brand: 'Tom Ford Private Blend',
          scentFamily: 'چوبی ادویه‌ای نیش',
          topNotes: ['چوب عود گرانبها', 'هل سبز', 'فلفل سیچوان'],
          heartNotes: ['چوب صندل', 'چوب رز برزیلی', 'خس‌خس'],
          baseNotes: ['لوبیا تونکا', 'کهربا', 'وانیل دودی'],
          reason: 'یکی از خالص‌ترین و شیک‌ترین تفاسیر عود غربی با تعادلی بی‌نظیر میان بافت صیقلی چوب صندل و گرمای اغواگر کهربا.',
          seasonOrOccasion: 'شب‌های پاییز و زمستان، جلسات کاری رده‌بالا و قرارهای خاص',
        },
        {
          name: 'صندل سلست (Santal Céleste)',
          brand: 'Atelier Qajar',
          scentFamily: 'چوبی آروماتیک مخملی',
          topNotes: ['برگ بنفشه فرانسوی', 'بذر هل', 'شیر بادام'],
          heartNotes: ['ریشه زنبق زرد فلورانس', 'پاپیروس مصری', 'جوز هندی'],
          baseNotes: ['چوب صندل میسور', 'سدر سفید ویرجینیا', 'عنبر خاکستری'],
          reason: 'هارمونی آرامش‌بخش چوب صندل طبیعی با نت‌های لطیف بنفشه و شیر بادام، نماد آرامش و طمأنینه اشرافی.',
          seasonOrOccasion: 'تمام فصول به‌ویژه غروب‌های پاییزی و موقعیت‌های صمیمی',
        },
      ],
    };
  }

  // Fresh & Citrus specialized fallback
  if (q.includes('مرکبات') || q.includes('خنک') || q.includes('citrus') || q.includes('fresh') || q.includes('تابستان') || q.includes('summer')) {
    return {
      consultantNote:
        lang === 'fa'
          ? 'برای سلیقه باطراوت و پویای شما که شیفته درخشش مرکبات و نسیم‌های باطراوت مدیترانه‌ای هستید، ۳ نماد جاودان طراوت انتخاب شدند:'
          : 'For your vibrant taste celebrating Mediterranean citrus and aquatic breezes, three masterworks were selected:',
      recommendations: [
        {
          name: 'Aventus',
          brand: 'Creed',
          scentFamily: 'میوه‌ای چوبی پرانرژی',
          topNotes: ['آناناس سلطنتی', 'ترنج کالابریا', 'سیب سبز', 'انگور فرنگی'],
          heartNotes: ['چوب توس', 'نعناع هندی', 'یاس مراکشی', 'رز'],
          baseNotes: ['مشک', 'خزه درخت بلوط', 'عنبر سائل', 'وانیل'],
          reason: 'کاریزماتیک‌ترین عطر مردانه قرن با شروعی انفجاری از ترنج و آناناس تازه که در بستری دودی و اشرافی آرام می‌گیرد.',
          seasonOrOccasion: 'بهار و تابستان، محیط‌های اداری لوکس و محافل پرانرژی',
        },
        {
          name: 'آکوا مارینا (Aqua Marina)',
          brand: 'Maison Rayeha Haute Parfumerie',
          scentFamily: 'دریایی مرکباتی خالص',
          topNotes: ['پرتقال خونی سیسیلی', 'نارنج گراس', 'گریپ‌فروت'],
          heartNotes: ['نسیم اقیانوسی', 'برگ بنفشه', 'مریم‌گلی مدیترانه‌ای'],
          baseNotes: ['خس‌خس هائیتی', 'چوب سدر سفید', 'عنبر زلال'],
          reason: 'طراوتی کریستالی و شفاف با ماندگاری بالا که حس غوطه‌وری در سواحل لاجوردی مدیترانه را بیدار می‌کند.',
          seasonOrOccasion: 'روزهای گرم تابستان و گردهمایی‌های دوستانه زیر نور خورشید',
        },
        {
          name: 'Neroli Portofino',
          brand: 'Tom Ford',
          scentFamily: 'مرکباتی آروماتیک درخشان',
          topNotes: ['ترنج', 'پرتقال تلخ', 'لیمو سیسیلی', 'اسطوخودوس'],
          heartNotes: ['بهارنارنج تونس', 'شکوفه پرتقال آفریقایی', 'پیتوسپوروم'],
          baseNotes: ['کهربا', 'گل ختمی', 'سنبل ختایی'],
          reason: 'بازآفرینی لوکس آب‌های فیروزه‌ای پورتوفینو با عصاره‌های اشرافی بهارنارنج ایتالیایی.',
          seasonOrOccasion: 'تعطیلات تابستانی و مهمانی‌های فضای باز',
        },
      ],
    };
  }

  // If we collected matching items from catalog, merge or complement them
  if (matchingFromCatalog.length >= 3) {
    return {
      consultantNote:
        lang === 'fa'
          ? 'بر اساس ارزیابی دقیق نت‌ها و ویژگی‌های مد نظر شما، این ۳ شاهکار برگزیده از کلکسیون میسون برای سلیقه شما پیشنهاد می‌شوند:'
          : 'Based on your preferred olfactory profile, here are three tailored perfumes matching your taste:',
      recommendations: matchingFromCatalog.slice(0, 3),
    };
  }

  // Default universal Haute Parfumerie recommendation tailored to the inquiry
  return {
    consultantNote:
      lang === 'fa'
        ? 'بر اساس بررسی هارمونی سلیقه اعلامی شما، این ۳ شاهکار نمادین از برترین خانه‌های عطر نیش جهان با بالاترین کیفیت انتخاب گردیدند:'
        : 'Based on our olfactory analysis of your scent profile, three iconic masterpieces were curated for you:',
    recommendations: [
      {
        name: 'Baccarat Rouge 540 Extrait',
        brand: 'Maison Francis Kurkdjian',
        scentFamily: 'کهربایی گلی کریستالی',
        topNotes: ['زعفران سرخ', 'بادام تلخ مراکشی'],
        heartNotes: ['یاس مصری سدر ویرجینیا'],
        baseNotes: ['عنبر سائل (امبروکسان)', 'مشک چوبی'],
        reason: 'شاهکار کیمیاگری مدرن با سیلاژ افسانه‌ای و همنشینی جادویی شکر کاراملیزه، بادام و زعفران ناب.',
        seasonOrOccasion: 'مهمانی‌های باشکوه، رویدادهای شبانه و فصول معتدل تا سرد',
      },
      {
        name: 'Tobacco Vanille',
        brand: 'Tom Ford Private Blend',
        scentFamily: 'شرقی ادویه‌ای گرم',
        topNotes: ['برگ تنباکوی کوبایی', 'نت‌های ادویه‌ای شرقی'],
        heartNotes: ['دانه تونکا', 'شکوفه تنباکو', 'وانیل ماداگاسکار', 'کاکائو'],
        baseNotes: ['میوه‌های خشک‌شده', 'شیره درختان معطر'],
        reason: 'فضایی اشرافی مانند کلوب‌های نجیب‌زادگان لندن؛ تجمل وانیل ماداگاسکار همراه با وقار تنباکوی معطر.',
        seasonOrOccasion: 'پاییز و زمستان، ضیافت‌های خصوصی و شب‌نشینی‌های رمانتیک',
      },
      {
        name: 'رز دو شیراز (Rose de Shiraz)',
        brand: 'Maison Rayeha Haute Parfumerie',
        scentFamily: 'گلی چوبی مخملی',
        topNotes: ['شبنم گلبرگ سرخ', 'تمشک وحشی', 'فلفل صورتی'],
        heartNotes: ['رز سنتی شیراز', 'گل پونه‌کوهی', 'پائونیا ابریشمی'],
        baseNotes: ['مشک کشمیر', 'وانیل طبیعی بوربون', 'چوب سدر اطلس'],
        reason: 'ادای احترام به باغ‌های شاعرانه با رز مخملی تازه چیده‌شده آمیخته با تمشک وحشی و مشک ابریشمی.',
        seasonOrOccasion: 'چهار فصل، به‌ویژه بهار و پاییز و قرارهای خاص عاشقانه',
      },
    ],
  };
}

/**
 * Retrieves fragrance recommendations using Google Gemini API if configured and authorized,
 * and seamlessly falls back to the curated master sommelier system on any error or denied access.
 * Guaranteed to never throw or break the client UI.
 */
export async function getFragranceRecommendations(
  userQuery: string,
  lang: 'fa' | 'en' = 'fa'
): Promise<RecommendationResult> {
  const cleanQuery = (userQuery || '').trim();

  // 1. Try retrieving the key from all environment locations:
  // - process.env.VITE_GEMINI_API_KEY
  // - process.env.GEMINI_API_KEY
  // - import.meta.env.VITE_GEMINI_API_KEY
  // - import.meta.env.GEMINI_API_KEY
  let apiKey = '';

  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    }
  } catch {
    // Process env unavailable in browser
  }

  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        apiKey =
          (import.meta as any).env.VITE_GEMINI_API_KEY ||
          (import.meta as any).env.GEMINI_API_KEY ||
          '';
      }
    } catch {
      // Import meta unavailable
    }
  }

  // 2. If a key is detected, attempt Gemini API with full try-catch isolation
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `تو یک عطرساز و مشاور رایحه حرفه‌ای و کارشناس دنیای عطر نیش در خانه عطر میسون رایحه هستی.
با توجه به رایحه‌ها و سلیقه‌ای که کاربر ورودی می‌دهد (مانند نت‌های مورد علاقه، طبع عطر، بودجه، مناسبت یا سبک شخصیتی)، دقیقاً ۳ عطر معروف و برتر دنیا (شامل عطرهای نیش برجسته و برترین شاهکارهای جهان) را پیشنهاد بده.
برای هر عطر: نام عطر، برند، خانواده بویایی، نت‌های اصلی و علت پیشنهاد به کاربر را به‌صورت خلاصه، جذاب، مجلل و به زبان فارسی فاخر بنویس.`;

      const prompt = `سلیقه و درخواست کاربر برای پیشنهاد عطر:
"${cleanQuery}"

لطفاً ۳ عطر متناسب و عالی پیشنهاد کن.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: RECOMMENDATION_SCHEMA,
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText) as RecommendationResult;
        if (parsed && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          return parsed;
        }
      }
    } catch (apiErr: any) {
      // Gracefully log warning and prevent throwing error up to UI
      console.warn('[Gemini Sommelier] Live call failed or permission denied, using curated fallback:', apiErr?.message || apiErr);
      return getCuratedMasterpieceFallback(cleanQuery, lang);
    }
  }

  // 3. Clean and instantaneous fallback if no API key or in preview mode
  return getCuratedMasterpieceFallback(cleanQuery, lang);
}


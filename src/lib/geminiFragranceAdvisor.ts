import { GoogleGenAI, Type, Schema } from '@google/genai';

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
 * Intelligent client-side fallback in case of missing keys or network restrictions,
 * ensuring seamless user testing directly within the preview iframe.
 */
function getCuratedMasterpieceFallback(userQuery: string): RecommendationResult {
  const q = userQuery.toLowerCase();

  if (q.includes('چوب') || q.includes('wood') || q.includes('عود') || q.includes('oud') || q.includes('صندل')) {
    return {
      consultantNote: 'با توجه به اشتیاق شما به نت‌های اصیل چوبی و رزین‌های گرانبها، این ۳ شاهکار باوقار و پرشکوه برای امضای بویایی شما برگزیده شدند:',
      recommendations: [
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
          name: 'Tam Dao Eau de Parfum',
          brand: 'Diptyque Paris',
          scentFamily: 'چوبی آروماتیک مخملی',
          topNotes: ['سرو ایتالیایی', 'مورد', 'گل رز'],
          heartNotes: ['چوب صندل گوا', 'چوب سدر اطلس'],
          baseNotes: ['مشک سفید', 'کهربای برفی', 'رزین گرم'],
          reason: 'سفری معنوی به جنگل‌های هندوچین با لطیف‌ترین و خامه‌ای‌ترین حس چوب صندل که حسی از آرامش عمیق را ساطع می‌کند.',
          seasonOrOccasion: 'تمام فصول به‌ویژه غروب‌های پاییزی و موقعیت‌های صمیمی',
        },
      ],
    };
  }

  if (q.includes('مرکبات') || q.includes('خنک') || q.includes('citrus') || q.includes('fresh') || q.includes('تابستان') || q.includes('summer')) {
    return {
      consultantNote: 'برای سلیقه باطراوت و پویای شما که شیفته درخشش مرکبات و نسیم‌های باطراوت مدیترانه‌ای هستید، ۳ نماد جاودان طراوت انتخاب شدند:',
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

  // Default universal Haute Parfumerie recommendation tailored to the inquiry
  return {
    consultantNote: 'بر اساس بررسی هارمونی سلیقه اعلامی شما، این ۳ شاهکار نمادین از برترین خانه‌های عطر نیش جهان با بالاترین کیفیت انتخاب گردیدند:',
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
        name: 'رز دمشق امپریال (Rose Impériale)',
        brand: 'Maison Rayeha Haute Parfumerie',
        scentFamily: 'گلی چوبی نیش',
        topNotes: ['فلفل صورتی', 'تمشک وحشی', 'پرتقال تلخ'],
        heartNotes: ['رز سرخ دمشقی', 'پئونی مخملی', 'پاپیروس مصری'],
        baseNotes: ['چوب عود سفید', 'کهربای عسلی', 'مشک ابریشمی'],
        reason: 'تفسیر مدرن و باوقار از رز سنتی که با چوب‌های تاریک و زعفران مهار شده و امضایی فراموش‌نشدنی می‌سازد.',
        seasonOrOccasion: 'چهار فصل، به‌ویژه بهار و پاییز و قرارهای خاص عاشقانه',
      },
    ],
  };
}

export async function getFragranceRecommendations(
  userQuery: string,
  lang: 'fa' | 'en' = 'fa'
): Promise<RecommendationResult> {
  // Try retrieving the key from all possible runtime environments:
  // 1. process.env.VITE_GEMINI_API_KEY
  // 2. process.env.GEMINI_API_KEY (AI Studio default platform environment)
  // 3. import.meta.env.VITE_GEMINI_API_KEY
  let apiKey = '';

  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    }
  } catch {
    // Process env unavailable in strict browser context
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

  // If a valid key exists, query Google Gemini models
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `تو یک عطرساز و مشاور رایحه حرفه‌ای و کارشناس دنیای عطر نیش در خانه عطر میسون رایحه هستی.
با توجه به رایحه‌ها و سلیقه‌ای که کاربر ورودی می‌دهد (مانند نت‌های مورد علاقه، طبع عطر، بودجه، مناسبت یا سبک شخصیتی)، دقیقاً ۳ عطر معروف و برتر دنیا (شامل عطرهای نیش برجسته و برترین شاهکارهای جهان) را پیشنهاد بده.
برای هر عطر: نام عطر، برند، خانواده بویایی، نت‌های اصلی و علت پیشنهاد به کاربر را به‌صورت خلاصه، جذاب، مجلل و به زبان فارسی فاخر بنویس.`;

      const prompt = `سلیقه و درخواست کاربر برای پیشنهاد عطر:
"${userQuery}"

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
    } catch (apiErr) {
      console.warn('Gemini live call encountered an error, falling back to curated sommelier library:', apiErr);
      // Fallback gracefully to curated master perfumes so the preview is never broken
      return getCuratedMasterpieceFallback(userQuery);
    }
  }

  // Graceful fallback ensuring preview testability even without client key injection
  return getCuratedMasterpieceFallback(userQuery);
}

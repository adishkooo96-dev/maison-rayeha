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
      description: 'Exactly 3 renowned global perfumes from world-famous houses matching the user taste.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Name of the fragrance from world-renowned houses (e.g. Creed Aventus, Kilian Angels’ Share).',
          },
          brand: {
            type: Type.STRING,
            description: 'Global fragrance house brand name (e.g. Creed, Tom Ford, Parfums de Marly).',
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

interface KnowledgeFragrance {
  id: string;
  name: { fa: string; en: string };
  brand: string;
  scentFamily: { fa: string; en: string };
  topNotes: { fa: string[]; en: string[] };
  heartNotes: { fa: string[]; en: string[] };
  baseNotes: { fa: string[]; en: string[] };
  keywords: string[];
  gender: 'masculine' | 'feminine' | 'unisex';
  season: 'winter' | 'fall' | 'spring' | 'summer' | 'all';
  vibes: string[];
  description: { fa: string; en: string };
  seasonOrOccasion: { fa: string; en: string };
}

// Renowned Global Masterpieces Knowledge Base (Strictly authentic international world perfumes)
const GLOBAL_KNOWLEDGE_BASE: KnowledgeFragrance[] = [
  // =========================================================================
  // 1. GOURMAND, COFFEE, CHOCOLATE, SWEET, CARAMEL & VANILLA
  // =========================================================================
  {
    id: 'black-phantom',
    name: { fa: 'بلک فانتوم (Black Phantom)', en: 'Black Phantom' },
    brand: 'Kilian Paris',
    scentFamily: { fa: 'شرقی گورماند دارک و اعتیادآور', en: 'Dark Oriental Gourmand' },
    topNotes: { fa: ['عصاره رام مارتینیک', 'نیشکر', 'بادام تلخ'], en: ['Martinique Rum', 'Sugar Cane', 'Bitter Almond'] },
    heartNotes: { fa: ['قهوه تلخ اسپرسو', 'شکلات دارک ۷۵٪', 'کارامل ذوب‌شده'], en: ['Dark Espresso Coffee', 'Dark Chocolate', 'Melted Caramel'] },
    baseNotes: { fa: ['چوب صندل میسور', 'گل آفتاب‌پرست', 'وانیل ماداگاسکار'], en: ['Sandalwood', 'Heliotrope', 'Madagascar Vanilla'] },
    keywords: ['قهوه', 'شکلات', 'کاکائو', 'اسپرسو', 'کارامل', 'شیرین', 'تلخ', 'بادام', 'گورماند', 'coffee', 'chocolate', 'dark', 'sweet', 'rum'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['دارک', 'اغواگر', 'لوکس', 'شبانه', 'رازآلود'],
    description: {
      fa: 'تیره‌ترین و اغواگرترین تفکر گورماند جهان؛ همنشینی انفجاری دانه قهوه تازه برشته با شکلات تلخ و رام کارائیبی.',
      en: 'The darkest luxury gourmand harmony with roasted espresso beans, dark chocolate, and Caribbean rum.',
    },
    seasonOrOccasion: { fa: 'شب‌های سرد زمستان، قرارهای خاص و دورهمی‌های نیمه‌شب', en: 'Winter nights and intimate encounters' },
  },
  {
    id: 'angels-share',
    name: { fa: 'انجلز شیر (Angels’ Share)', en: 'Angels’ Share' },
    brand: 'Kilian Paris',
    scentFamily: { fa: 'کهربایی ادویه‌ای و کنیاک گرم', en: 'Amber Spicy Gourmand' },
    topNotes: { fa: ['کنیاک فرانسوی کهنسال', 'دارچین سیلان'], en: ['Aged French Cognac', 'Ceylon Cinnamon'] },
    heartNotes: { fa: ['پرالین فندقی', 'دانه تونکا برشته', 'عصاره چوب بلوط'], en: ['Hazelnut Praline', 'Roasted Tonka', 'Oakwood'] },
    baseNotes: { fa: ['وانیل بوربون', 'چوب صندل', 'بنزوئین شیرین'], en: ['Bourbon Vanilla', 'Sandalwood', 'Sweet Benzoin'] },
    keywords: ['دارچین', 'وانیل', 'پرالین', 'کنیاک', 'گرم', 'شیرین', 'بلوط', 'تونکا', 'cinnamon', 'vanilla', 'cognac', 'warm'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['سرمست‌کننده', 'گرمابخش', 'اشرافی', 'مجلل'],
    description: {
      fa: 'الهام‌گرفته از میراث هشت نسل تقطیر کنیاک؛ ادای احترامی جاودان به دارچین لطیف، پرالین شکلاتی و وانیل مست‌کننده.',
      en: 'Inspired by eight generations of cognac heritage with refined cinnamon, praline, and mesmerizing vanilla.',
    },
    seasonOrOccasion: { fa: 'فصل‌های پاییز و زمستان، شب‌های رمانتیک و ضیافت‌های مجلل', en: 'Autumn & winter evenings' },
  },
  {
    id: 'bianco-latte',
    name: { fa: 'بیانکو لاته (Bianco Latte)', en: 'Bianco Latte' },
    brand: 'Giardini di Toscana',
    scentFamily: { fa: 'شیرین وانیلی کاراملی ابریشمی', en: 'Sweet Caramel Vanilla' },
    topNotes: { fa: ['کارامل ذوب‌شده کرمی', 'شیر گرم'], en: ['Caramel', 'Warm Milk'] },
    heartNotes: { fa: ['عسل طبیعی کوهستان', 'کومارین ابریشمی'], en: ['Raw Honey', 'Coumarin'] },
    baseNotes: { fa: ['وانیل خالص ماداگاسکار', 'مشک سفید مخملی'], en: ['Madagascar Vanilla', 'White Musk'] },
    keywords: ['شیرین', 'وانیل', 'کارامل', 'عسل', 'شیر', 'دخترانه', 'ملایم', 'کرمی', 'vanilla', 'caramel', 'sweet', 'honey', 'milk'],
    gender: 'feminine',
    season: 'fall',
    vibes: ['نرم', 'آرامش‌بخش', 'شیرین', 'هوس‌انگیز', 'جذاب'],
    description: {
      fa: 'آغوشی گرم از کارامل لطیف، عسل طلایی و وانیل کرمی؛ رایحه‌ای که حس راحتی و جذابیت معصومانه را تداعی می‌کند.',
      en: 'A comforting embrace of creamy caramel, golden honey, and rich Madagascar vanilla.',
    },
    seasonOrOccasion: { fa: 'تمام فصول به ویژه پاییز و زمستان، روزمره شیک و قرارهای دونفره', en: 'Cozy moments and everyday luxury' },
  },
  {
    id: 'love-dont-be-shy',
    name: { fa: 'لاو دونت بی شای (Love, Don’t Be Shy)', en: 'Love, Don’t Be Shy' },
    brand: 'Kilian Paris',
    scentFamily: { fa: 'شرقی گلی شیرین و آب‌نباتی', en: 'Sweet Floral Gourmand' },
    topNotes: { fa: ['شکوفه پرتقال', 'ترنج', 'فلفل صورتی', 'گشنیز'], en: ['Orange Blossom', 'Bergamot', 'Pink Pepper'] },
    heartNotes: { fa: ['مارشمالو شکری', 'گل یاس رازقی', 'رز صدتومانی'], en: ['Marshmallow', 'Jasmine Sambac', 'Peony'] },
    baseNotes: { fa: ['وانیل بوربون', 'کارامل عسلی', 'مشک سفید'], en: ['Bourbon Vanilla', 'Caramel', 'White Musk'] },
    keywords: ['شیرین', 'آب‌نبات', 'مارشمالو', 'شکوفه پرتقال', 'زنانه', 'دخترانه', 'رمانتیک', 'وانیل', 'sweet', 'marshmallow', 'floral'],
    gender: 'feminine',
    season: 'spring',
    vibes: ['رمانتیک', 'دلفریب', 'شیرین', 'خواستنی'],
    description: {
      fa: 'رایحه‌ای هوس‌انگیز همچون نخستین عشق؛ آمیزه‌ای دلربا از مارشمالوی شکری، شکوفه پرتقال و شهد وانیل.',
      en: 'An unforgettable, delicious treat of sugary marshmallow, sweet orange blossom, and vanilla nectar.',
    },
    seasonOrOccasion: { fa: 'بهار، پاییز، قرارهای رمانتیک و مهمانی‌های شاداب', en: 'Date nights and celebrations' },
  },
  {
    id: 'tobacco-vanille',
    name: { fa: 'توباکو وانیل (Tobacco Vanille)', en: 'Tobacco Vanille' },
    brand: 'Tom Ford Private Blend',
    scentFamily: { fa: 'شرقی ادویه‌ای تنباکویی وانیلی', en: 'Oriental Spicy Tobacco' },
    topNotes: { fa: ['برگ تنباکوی هاوانا', 'نت‌های ادویه‌ای گرم'], en: ['Tobacco Leaf', 'Spicy Notes'] },
    heartNotes: { fa: ['دانه تونکا', 'شکوفه تنباکو', 'وانیل ماداگاسکار', 'کاکائو تلخ'], en: ['Tonka Bean', 'Tobacco Blossom', 'Vanilla', 'Cacao'] },
    baseNotes: { fa: ['میوه‌های خشک‌شده', 'شیره درختان معطر'], en: ['Dried Fruits', 'Woody Sap'] },
    keywords: ['تنباکو', 'وانیل', 'کاکائو', 'ادویه', 'گرم', 'شیرین', 'زمستان', 'tobacco', 'vanilla', 'cacao', 'warm', 'tom ford'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['اشرافی', 'باوقار', 'گرمابخش', 'لوکس'],
    description: {
      fa: 'فضایی اشرافی مانند کلوب‌های نجیب‌زادگان لندن؛ تجمل وانیل ماداگاسکار همراه با وقار تنباکوی معطر و کاکائو.',
      en: 'An opulent aristocratic lounge blending aromatic tobacco leaves with Madagascar vanilla and rich cacao.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، ضیافت‌های خصوصی و شب‌نشینی‌های رمانتیک', en: 'Winter formal events & luxury evenings' },
  },
  {
    id: 'lost-cherry',
    name: { fa: 'لاست چری (Lost Cherry)', en: 'Lost Cherry' },
    brand: 'Tom Ford Private Blend',
    scentFamily: { fa: 'شرقی میوه‌ای بادامی و آلبالویی', en: 'Oriental Fruity Almond' },
    topNotes: { fa: ['گیلاس سیاه', 'لیکور آلبالو', 'بادام تلخ'], en: ['Black Cherry', 'Cherry Liqueur', 'Bitter Almond'] },
    heartNotes: { fa: ['شربت آلبالوی گلاسه‌ای', 'رز ترکی', 'یاس سامباک'], en: ['Griotte Syrup', 'Turkish Rose', 'Jasmine Sambac'] },
    baseNotes: { fa: ['بالم پرو', 'دانه تونکا برشته', 'چوب صندل', 'وانیل'], en: ['Peru Balsam', 'Tonka Bean', 'Sandalwood', 'Vanilla'] },
    keywords: ['گیلاس', 'آلبالو', 'بادام', 'شیرین', 'مشروبی', 'میوه ای', 'اغواگر', 'cherry', 'almond', 'fruity', 'sweet', 'liqueur'],
    gender: 'feminine',
    season: 'fall',
    vibes: ['اغواگر', 'هوس‌انگیز', 'جذاب', 'مدرن'],
    description: {
      fa: 'سفری جسورانه به ژرفای وسوسه؛ غوطه‌وری در شهد گیلاس سیاه تازه چیده‌شده آمیخته با بادام تلخ و تونکای گرم.',
      en: 'A luscious intoxicating plunge into ripe black cherries, bitter almond essence, and roasted tonka warmth.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، قرارهای عاشقانه، مهمانی‌های شبانه خاص', en: 'Evening dates & night events' },
  },
  {
    id: 'naxos',
    name: { fa: 'ناکسوس (Naxos)', en: 'Naxos' },
    brand: 'Xerjoff 1861',
    scentFamily: { fa: 'عسلی تنباکویی ادویه‌ای مدیترانه‌ای', en: 'Honey Tobacco Citrus' },
    topNotes: { fa: ['ترنج کالابریا', 'لیمو سیسیلی', 'اسطوخودوس تازه'], en: ['Bergamot', 'Lemon', 'Lavender'] },
    heartNotes: { fa: ['عسل طبیعی کوهستان', 'دارچین سیلان', 'کشمیران', 'گل یاس'], en: ['Raw Honey', 'Cinnamon', 'Cashmeran', 'Jasmine'] },
    baseNotes: { fa: ['برگ تنباکوی هاوانا', 'دانه تونکا', 'وانیل بوربون'], en: ['Tobacco Leaf', 'Tonka', 'Bourbon Vanilla'] },
    keywords: ['عسل', 'تنباکو', 'اسطوخودوس', 'دارچین', 'وانیل', 'گرم', 'شیرین', 'ایتالیایی', 'honey', 'tobacco', 'lavender', 'cinnamon', 'sweet'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['پرانرژی', 'دلپذیر', 'سلطنتی', 'گرمابخش', 'جذاب'],
    description: {
      fa: 'قلب تپنده جزیره سیسیل؛ رقابت عاشقانه شهد عسل خالص کوهی با برگ‌های تنباکوی گرم، اسطوخودوس و دارچین.',
      en: 'The radiant spirit of Sicily blending golden mountain honey with rich tobacco leaf and Mediterranean citrus.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، مهمانی‌های شبانه پرهیجان و دورهمی‌های صمیمی', en: 'Winter holidays, social gatherings' },
  },
  {
    id: 'grand-soir',
    name: { fa: 'گرند سوآر (Grand Soir)', en: 'Grand Soir' },
    brand: 'Maison Francis Kurkdjian',
    scentFamily: { fa: 'کهربایی بالزامیک و وانیلی طلایی', en: 'Amber Balsamic Vanilla' },
    topNotes: { fa: ['صمغ لادن اسپانیایی', 'اسطوخودوس لطیف'], en: ['Spanish Labdanum', 'Soft Lavender'] },
    heartNotes: { fa: ['صمغ بنزوئین سیام', 'دانه تونکا برزیلی'], en: ['Siam Benzoin', 'Brazilian Tonka'] },
    baseNotes: { fa: ['کهربای طلایی تیره', 'وانیل ماداگاسکار'], en: ['Golden Amber', 'Madagascar Vanilla'] },
    keywords: ['کهربا', 'عنبر', 'وانیل', 'گرم', 'شیرین', 'لوکس', 'پاریس', 'amber', 'vanilla', 'benzoin', 'warm', 'mfk'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['درخشان', 'مخملی', 'سلطنتی', 'آرامش‌بخش'],
    description: {
      fa: 'شب‌های طلایی و چراغانی پاریس؛ شاهکار کهربایی که با صمغ‌های اشرافی بنزوئین و وانیل خالص شما را در بر می‌گیرد.',
      en: 'The luminous magic of a Parisian grand evening, dressed in glowing amber, warm resins, and rich vanilla.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، ضیافت‌های باشکوه، دیدارهای خاص و لحظات رمانتیک', en: 'Formal dinners & grand soirées' },
  },

  // =========================================================================
  // 2. LEATHER, SMOKY, INCENSE, DARK & OUD
  // =========================================================================
  {
    id: 'tuscan-leather',
    name: { fa: 'توسکان لدر (Tuscan Leather)', en: 'Tuscan Leather' },
    brand: 'Tom Ford Private Blend',
    scentFamily: { fa: 'چرمی دودی میوه‌ای کاریزماتیک', en: 'Leather Fruity Smoky' },
    topNotes: { fa: ['تمشک ترش و وحشی', 'زعفران اعلا', 'آویشن کوهی'], en: ['Tart Raspberry', 'Saffron', 'Thyme'] },
    heartNotes: { fa: ['صمغ کندر عمانی', 'گل یاس شب‌بو'], en: ['Olibanum Incense', 'Night Jasmine'] },
    baseNotes: { fa: ['چرم سیاه دباغی‌شده', 'جیر مخملی', 'کهربای گرم', 'نت‌های چوبی'], en: ['Black Leather', 'Suede', 'Amber', 'Woody Notes'] },
    keywords: ['چرم', 'جیر', 'دودی', 'تمشک', 'تلخ', 'زعفران', 'کندر', 'سنگین', 'leather', 'smoky', 'raspberry', 'saffron', 'bitter'],
    gender: 'masculine',
    season: 'winter',
    vibes: ['قدرتمند', 'کاریزماتیک', 'لوکس', 'تاریک', 'رسمی'],
    description: {
      fa: 'نماد بی‌بدیل چرم لوکس مدرن؛ تضاد نبوغ‌آمیز میان زبری چرم سیاه دباغی‌شده و لطافت تمشک وحشی و زعفران.',
      en: 'The definitive raw yet refined leather masterpiece with wild raspberry and dark Tuscan resins.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، استایل کت چرم و کت‌وشلوار، جلسات مهم کاری', en: 'Cold weather, executive meetings' },
  },
  {
    id: 'ombre-leather',
    name: { fa: 'امبره لدر (Ombré Leather)', en: 'Ombré Leather' },
    brand: 'Tom Ford',
    scentFamily: { fa: 'چرمی آروماتیک مخملی و گرم', en: 'Velvety Aromatic Leather' },
    topNotes: { fa: ['هل سبز تند', 'زعفران'], en: ['Cardamom', 'Saffron'] },
    heartNotes: { fa: ['چرم جیر سیاه', 'گل یاس رازقی سامباک'], en: ['Black Leather Suede', 'Jasmine Sambac'] },
    baseNotes: { fa: ['خزه بلوط', 'نعناع هندی (پچولی)', 'کهربا'], en: ['Oakmoss', 'Patchouli', 'Amber'] },
    keywords: ['چرم', 'هل', 'تلخ', 'شیک', 'مردانه', 'جیر', 'یاس', 'leather', 'cardamom', 'suede', 'tom ford'],
    gender: 'masculine',
    season: 'fall',
    vibes: ['خوش‌پوش', 'کاریزماتیک', 'همه‌پسند', 'مدرن'],
    description: {
      fa: 'آزادی بی‌پایان در پهنه کویرهای غربی؛ تلفیق چرم مخملی خوش‌پوش با ادویه هل سبز و یاس دلفریب.',
      en: 'A vast textural leather landscape illuminated by green cardamom, nocturnal jasmine, and rich patchouli.',
    },
    seasonOrOccasion: { fa: 'پاییز، زمستان و بهار معتدل، قرارهای کاری و استایل شیک روزمره', en: 'Versatile autumn/winter signature' },
  },
  {
    id: 'interlude-man',
    name: { fa: 'اینترلود من (Interlude Man)', en: 'Interlude Man' },
    brand: 'Amouage',
    scentFamily: { fa: 'شرقی چوبی صمغی و دودی عمیق', en: 'Smoky Woody Balsamic' },
    topNotes: { fa: ['پونه کوهی معطر', 'فلفل دلمه‌ای', 'ترنج'], en: ['Oregano', 'Pimento Berry', 'Bergamot'] },
    heartNotes: { fa: ['کندر هجری خالص', 'صمغ جاوی (اپوپوناکس)', 'کهربا', 'لادن'], en: ['Frankincense', 'Opoponax', 'Amber', 'Cistus'] },
    baseNotes: { fa: ['چرم سنگین', 'عود طبیعی', 'نعناع هندی (پچولی)', 'چوب صندل'], en: ['Leather', 'Agarwood Oud', 'Patchouli', 'Sandalwood'] },
    keywords: ['دودی', 'دود', 'بخور', 'کندر', 'عود', 'تلخ', 'چرم', 'سنگین', 'صمغ', 'incense', 'smoke', 'oud', 'leather', 'amouage'],
    gender: 'masculine',
    season: 'winter',
    vibes: ['هیولای ماندگاری', 'تاریک', 'باصلابت', 'رمزآلود', 'عمیق'],
    description: {
      fa: 'معروف به «بلو بیست» و پادشاه بلامنازع دنیای بخور و دود؛ انفجاری آتشین از کندر سلطنتی عمان و رزین‌های کهنسال.',
      en: 'The legendary "Blue Beast" crowned in smoke, incense resins, aged leather, and pure Omani frankincense.',
    },
    seasonOrOccasion: { fa: 'سردترین روزهای زمستان، محیط‌های باز و مراسم بسیار رسمی', en: 'Extreme cold, formal grandeur' },
  },
  {
    id: 'black-afgano',
    name: { fa: 'بلک افغان (Black Afgano)', en: 'Black Afgano' },
    brand: 'Nasomatto',
    scentFamily: { fa: 'چوبی دودی تاریک و رزینی خالص', en: 'Dark Woody Smoky' },
    topNotes: { fa: ['نت‌های سبز تیره', 'حشیش دودی'], en: ['Dark Green Notes', 'Smoky Cannabis'] },
    heartNotes: { fa: ['قهوه تلخ', 'تنباکوی سوخته', 'رزین‌های جنگلی'], en: ['Bitter Coffee', 'Burnt Tobacco', 'Forest Resins'] },
    baseNotes: { fa: ['عود خالص دودی', 'بخور باستانی'], en: ['Smoky Oud', 'Ancient Incense'] },
    keywords: ['دودی', 'تلخ', 'قهوه', 'تنباکو', 'عود', 'سیاه', 'سنگین', 'خاص', 'black afgano', 'smoky', 'oud', 'coffee', 'incense'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['هیپنوتیزم‌کننده', 'تاریک', 'غیرمتعارف', 'سنگین'],
    description: {
      fa: 'رایحه‌ای رازآلود و خلسه‌آور با غلظت اکستریت؛ تجسم قطرات قهوه غلیظ، عود سوخته و بخور باستانی.',
      en: 'A hypnotic, pitch-black scent evoking temporal bliss through burnt resins, roasted coffee, and rich smoky oud.',
    },
    seasonOrOccasion: { fa: 'شب‌های سرد زمستان، مناسب افراد با سلیقه خاص و آوانگارد', en: 'Cold winter nights, daring niche lovers' },
  },
  {
    id: 'by-the-fireplace',
    name: { fa: 'بای د فایرپلیس (By the Fireplace)', en: 'By the Fireplace' },
    brand: 'Maison Margiela Replica',
    scentFamily: { fa: 'چوبی ادویه‌ای دودی نوستالژیک', en: 'Woody Smoky Gourmand' },
    topNotes: { fa: ['میخک ادویه‌ای', 'شکوفه پرتقال', 'فلفل صورتی'], en: ['Cloves', 'Orange Blossom', 'Pink Pepper'] },
    heartNotes: { fa: ['شاه‌بلوط بو داده', 'چوب گایاک دودی', 'سرو کوهی'], en: ['Roasted Chestnut', 'Guaiac Wood', 'Juniper'] },
    baseNotes: { fa: ['وانیل ارگانیک', 'بالم پرو', 'چوب کشمیر'], en: ['Vanilla', 'Peru Balsam', 'Cashmeran'] },
    keywords: ['دود', 'دودی', 'شومینه', 'شاه‌بلوط', 'چوب سوخته', 'گرم', 'زمستان', 'وانیل', 'fireplace', 'smoke', 'chestnut', 'cozy'],
    gender: 'unisex',
    season: 'winter',
    vibes: ['نوستالژیک', 'گرمابخش', 'آرامش‌بخش', 'زمستانی'],
    description: {
      fa: 'تصویری عطرآگین از نشستن کنار شعله‌های زرد شومینه در کلبه‌ای برفی؛ رایحه شاه‌بلوط برشته و چوب‌های افروخته.',
      en: 'The evocative warmth of roasted chestnuts and crackling wood beside a roaring winter fireplace.',
    },
    seasonOrOccasion: { fa: 'عصرهای برفی زمستان، خلوت‌های آرام و فضاهای صمیمی', en: 'Chilly evenings and cozy gatherings' },
  },
  {
    id: 'jazz-club',
    name: { fa: 'جاز کلاب (Jazz Club)', en: 'Jazz Club' },
    brand: 'Maison Margiela Replica',
    scentFamily: { fa: 'چرمی تنباکویی مشروبی گرم', en: 'Leather Tobacco Boozy' },
    topNotes: { fa: ['فلفل صورتی', 'روغن بهارنارنج', 'لیمو ترش'], en: ['Pink Pepper', 'Neroli', 'Lemon'] },
    heartNotes: { fa: ['عصاره رام هاوانا', 'مریم‌گلی', 'علف خس‌خس ژاوه‌ای'], en: ['Rum Absolute', 'Clary Sage', 'Java Vetiver'] },
    baseNotes: { fa: ['برگ تنباکوی کوبایی', 'دانه تونکا', 'صمغ استیراکس'], en: ['Tobacco Leaf', 'Tonka Bean', 'Styrax'] },
    keywords: ['تنباکو', 'توتون', 'سیگار', 'پیپ', 'رام', 'مشروبی', 'چرم', 'گرم', 'تلخ', 'tobacco', 'rum', 'leather', 'bar'],
    gender: 'masculine',
    season: 'fall',
    vibes: ['جذاب', 'خلسه‌آور', 'کافه‌ای', 'مردانه', 'مدرن'],
    description: {
      fa: 'هوای رازآلود یک کلوب جاز در بروکلین؛ نوای ساکسیفون، گیلاس‌های کریستالی رام و عطر خوش تنباکوی هاوانا.',
      en: 'An intimate Brooklyn jazz club alive with smooth brass, aged rum, and fine tobacco curls.',
    },
    seasonOrOccasion: { fa: 'غروب‌های پاییزی، کافه‌گردی، قرارهای عاشقانه شبانه', en: 'Autumn evenings and jazz nights' },
  },
  {
    id: 'oud-wood',
    name: { fa: 'عود وود (Oud Wood)', en: 'Oud Wood' },
    brand: 'Tom Ford Private Blend',
    scentFamily: { fa: 'چوبی ادویه‌ای نیش و اشرافی', en: 'Woody Spicy Oud' },
    topNotes: { fa: ['هل سبز', 'فلفل سیچوان', 'چوب بلسان بنفش'], en: ['Cardamom', 'Sichuan Pepper', 'Rosewood'] },
    heartNotes: { fa: ['عود گرانبها', 'چوب صندل', 'خس‌خس'], en: ['Agarwood Oud', 'Sandalwood', 'Vetiver'] },
    baseNotes: { fa: ['دانه تونکا', 'وانیل دودی', 'کهربا'], en: ['Tonka Bean', 'Smoky Vanilla', 'Amber'] },
    keywords: ['عود', 'چوب', 'صندل', 'هل', 'تلخ', 'شیک', 'باوقار', 'oud', 'wood', 'cardamom', 'sandalwood'],
    gender: 'unisex',
    season: 'all',
    vibes: ['شیک', 'باوقار', 'دیپلماتیک', 'کلاسیک'],
    description: {
      fa: 'پالوده‌ترین و خوش‌پوش‌ترین روایت عود در دنیای غرب؛ توازن استادانه میان عود نرم، هل سبز و صندل مخملی.',
      en: 'The benchmark modern Western oud with smooth sandalwood, smoky cardamom, and amber.',
    },
    seasonOrOccasion: { fa: 'چهارفصل به جز گرمای شدید، جلسات کاری رسمی و قرارهای مهم', en: 'Signature versatile formal wear' },
  },

  // =========================================================================
  // 3. FRESH, AQUATIC, MARINE, CITRUS, GREEN TEA & MINT
  // =========================================================================
  {
    id: 'creed-aventus',
    name: { fa: 'اونتوس (Aventus)', en: 'Aventus' },
    brand: 'Creed',
    scentFamily: { fa: 'میوه‌ای چوبی چایپر کاریزماتیک', en: 'Fruity Chypre Woody' },
    topNotes: { fa: ['آناناس دودی آبدار', 'ترنج کالابریا', 'سیب سبز', 'انگور فرنگی سیاه'], en: ['Smoky Pineapple', 'Calabrian Bergamot', 'Green Apple', 'Blackcurrant'] },
    heartNotes: { fa: ['چوب توس دودی (توسکا)', 'نعناع هندی', 'یاس مراکشی', 'رز'], en: ['Birch Wood', 'Patchouli', 'Moroccan Jasmine', 'Rose'] },
    baseNotes: { fa: ['مشک طبیعی', 'خزه درخت بلوط', 'عنبر سائل (امبرگریس)', 'وانیل'], en: ['Musk', 'Oakmoss', 'Ambergris', 'Vanilla'] },
    keywords: ['آناناس', 'ترنج', 'دودی', 'خنک', 'چوبی', 'سیب', 'مردانه', 'کاریزماتیک', 'pineapple', 'bergamot', 'fresh', 'aventus', 'creed'],
    gender: 'masculine',
    season: 'all',
    vibes: ['کاریزماتیک', 'مقتدر', 'پیروزمند', 'همه‌پسند', 'لوکس'],
    description: {
      fa: 'پادشاه بی‌رقیب عطرهای مردانه قرن ۲۱؛ تقابل رویایی شادابی آناناس و ترنج با ستون فقرات دودی توس و عنبر سائل.',
      en: 'The celebrated triumph of fresh royal pineapple, crisp bergamot, and smoky birch bark.',
    },
    seasonOrOccasion: { fa: 'چهارفصل، موقعیت‌های اداری رده‌بالا، جلسات پیروزی و مهمانی‌ها', en: 'All seasons, executive signature' },
  },
  {
    id: 'silver-mountain-water',
    name: { fa: 'سیلور مانتین واتر (Silver Mountain Water)', en: 'Silver Mountain Water' },
    brand: 'Creed',
    scentFamily: { fa: 'آروماتیک برفی و کریستالی', en: 'Aromatic Crisp Fresh' },
    topNotes: { fa: ['ترنج تازه', 'نارنگی ماندارین سیسیلی'], en: ['Bergamot', 'Mandarin Orange'] },
    heartNotes: { fa: ['چای سبز کوهستان آلپ', 'شکوفه مویز سیاه'], en: ['Alpine Green Tea', 'Blackcurrant Bud'] },
    baseNotes: { fa: ['مشک سفید برفی', 'صندل چوب', 'پتی‌گرین', 'صمغ گالبانوم'], en: ['Snow White Musk', 'Sandalwood', 'Petitgrain', 'Galbanum'] },
    keywords: ['چای سبز', 'خنک', 'برف', 'کوهستان', 'مرکبات', 'نارنگی', 'پاک', 'تمیز', 'green tea', 'fresh', 'mountain', 'clean', 'snow'],
    gender: 'unisex',
    season: 'summer',
    vibes: ['زلال', 'برفی', 'شفاف', 'آرامش‌بخش', 'اسپرت'],
    description: {
      fa: 'نسیم خنک چشمه‌های جاری از یخچال‌های طبیعی آلپ سوئیس؛ درخشش چای سبز خالص و مشک پاکیزه برفی.',
      en: 'The crystal rush of sparkling Alpine snow streams laced with invigorating green tea and frosted musk.',
    },
    seasonOrOccasion: { fa: 'روزهای بهار و تابستان، فعالیت‌های ورزشی، استایل مینیمال', en: 'Warm days, crisp minimalist wear' },
  },
  {
    id: 'afternoon-swim',
    name: { fa: 'افترنون سوییم (Afternoon Swim)', en: 'Afternoon Swim' },
    brand: 'Louis Vuitton',
    scentFamily: { fa: 'مرکباتی اقیانوسی انرژی‌بخش', en: 'Citrus Aquatic Marine' },
    topNotes: { fa: ['پرتقال خونی سیسیلی آبدار', 'نارنگی ماندارین'], en: ['Sicilian Orange', 'Mandarin'] },
    heartNotes: { fa: ['ترنج کالابریا', 'زنجبیل تازه', 'نسیم دریا'], en: ['Calabrian Bergamot', 'Ginger', 'Sea Breeze'] },
    baseNotes: { fa: ['عنبر خاکستری زلال', 'مشک شفاف'], en: ['Ambergris', 'Clean Musk'] },
    keywords: ['مرکبات', 'پرتقال', 'نارنگی', 'اقیانوس', 'دریا', 'آب', 'خنک', 'تابستان', 'شنا', 'citrus', 'orange', 'aquatic', 'summer', 'sea'],
    gender: 'unisex',
    season: 'summer',
    vibes: ['انرژی‌بخش', 'شاداب', 'اقیانوسی', 'سرزنده'],
    description: {
      fa: 'شیرجه‌ای باطراوت در دل امواج نیلگون اقیانوس؛ تداعی یک بعدازظهر داغ تابستانی غرق در شهد پرتقال سیسیلی.',
      en: 'A plunge of pure vitamin C into oceanic surf, alive with sparkling mandarin and sun-drenched orange.',
    },
    seasonOrOccasion: { fa: 'تابستان داغ، کنار استخر، تعطیلات ساحلی و روزمرگی پرانرژی', en: 'Hot summer days, beach holidays' },
  },
  {
    id: 'imagination-lv',
    name: { fa: 'ایمجینیشن (Imagination)', en: 'Imagination' },
    brand: 'Louis Vuitton',
    scentFamily: { fa: 'مرکباتی آروماتیک چای سیاه نیش', en: 'Citrus Aromatic Tea' },
    topNotes: { fa: ['ترنج کالابریا', 'پرتقال سیسیلی', 'نارنج تلخ'], en: ['Calabrian Bergamot', 'Sicilian Orange', 'Bitter Orange'] },
    heartNotes: { fa: ['چای سیاه چینی (بلک تی)', 'زنجبیل نیجریه', 'شکوفه بهارنارنج', 'دارچین'], en: ['Chinese Black Tea', 'Nigerian Ginger', 'Neroli', 'Cinnamon'] },
    baseNotes: { fa: ['امبروکسان کریستالی', 'صمغ کندر', 'چوب گایاک'], en: ['Crystal Ambroxan', 'Olibanum', 'Guaiac Wood'] },
    keywords: ['چای سیاه', 'ترنج', 'زنجبیل', 'امبروکسان', 'خنک', 'شیک', 'لوکس', 'تمیز', 'black tea', 'tea', 'citrus', 'ginger', 'ambroxan'],
    gender: 'masculine',
    season: 'summer',
    vibes: ['لوکس', 'آرامش‌بخش', 'جذاب', 'مدرن', 'ماندگار'],
    description: {
      fa: 'کیمیاگری مدرن ژاک کاوالیه؛ همنشینی جادویی دانه چای سیاه کمیاب چین با درخشش مرکبات و مولکول کهربایی امبروکسان.',
      en: 'A modern masterpiece weaving rare Chinese black tea with radiant citrus and sparkling ambroxan.',
    },
    seasonOrOccasion: { fa: 'بهار و تابستان، استایل سفید و لنین، رویدادهای روزانه لوکس', en: 'Spring/summer luxury signature' },
  },
  {
    id: 'hacivat',
    name: { fa: 'هاچیوات (Hacivat)', en: 'Hacivat' },
    brand: 'Nishane Istanbul',
    scentFamily: { fa: 'چایپر میوه‌ای چوبی ماندگار', en: 'Chypre Fruity Woody' },
    topNotes: { fa: ['آناناس ترش و شیرین', 'گریپ‌فروت', 'ترنج'], en: ['Pineapple', 'Grapefruit', 'Bergamot'] },
    heartNotes: { fa: ['چوب سدر سفید', 'نعناع هندی (پچولی)', 'گل یاس'], en: ['Cedarwood', 'Patchouli', 'Jasmine'] },
    baseNotes: { fa: ['خزه درخت بلوط سنگین', 'نت‌های چوبی خشک'], en: ['Oakmoss', 'Dry Timber'] },
    keywords: ['آناناس', 'گریپ‌فروت', 'خزه بلوط', 'خنک', 'تلخ', 'ماندگاری بالا', 'پخش بو', 'pineapple', 'grapefruit', 'oakmoss', 'fresh'],
    gender: 'unisex',
    season: 'summer',
    vibes: ['انفجاری', 'باصلابت', 'شاداب', 'پرتوان'],
    description: {
      fa: 'قدرتمندترین عطر میوه‌ای چوبی خنک تاریخ نیش؛ انفجار مرکبات و آناناس طبیعی با بستری پایدار از خزه بلوط کلاسیک.',
      en: 'An extraordinary celebration of crisp pineapple, juicy grapefruit, and earthy oakmoss power.',
    },
    seasonOrOccasion: { fa: 'بهار و تابستان، مناسب کسانی که به دنبال پخش بوی بی‌نهایت خنک هستند', en: 'Warm seasons, high-sillage lovers' },
  },
  {
    id: 'torino-21',
    name: { fa: 'تورینو ۲۱ (Torino21)', en: 'Torino21' },
    brand: 'Xerjoff',
    scentFamily: { fa: 'آروماتیک سبز نعنایی و مرکباتی انرژی‌بخش', en: 'Aromatic Green Mint' },
    topNotes: { fa: ['نعناع باطراوت تازه', 'لیمو سیسیلی', 'ریحان کوهی', 'آویشن'], en: ['Fresh Mint', 'Sicilian Lemon', 'Basil', 'Thyme'] },
    heartNotes: { fa: ['اسطوخودوس فرانسوی', 'گل برف', 'رزماری'], en: ['Lavender', 'Lily of the Valley', 'Rosemary'] },
    baseNotes: { fa: ['مشک تمیز کریستالی', 'صمغ لیمو'], en: ['Clean Musk', 'Lemon Verbena'] },
    keywords: ['نعناع', 'ریحان', 'لیمو', 'خنک', 'ورزش', 'اسپرت', 'باطراوت', 'mint', 'lemon', 'fresh', 'xerjoff', 'green'],
    gender: 'unisex',
    season: 'summer',
    vibes: ['فوق‌العاده باطراوت', 'ورزشی', 'انرژیک', 'زلال'],
    description: {
      fa: 'عطر رسمی مسابقات تنیس تورین؛ انفجار نعناع طبیعی خردشده، ریحان تازه و لیموی سیسیلی که حواس را بیدار می‌کند.',
      en: 'The definitive luxury mint sensation: crisp crushed spearmint, garden basil, and vibrant Sicilian citrus.',
    },
    seasonOrOccasion: { fa: 'تابستان داغ، بعد از ورزش و باشگاه، سفرهای ساحلی', en: 'Hot summer days, athletic refresh' },
  },

  // =========================================================================
  // 4. FLORAL, ROSE, JASMINE, TUBEROSE & POWDERY
  // =========================================================================
  {
    id: 'delina',
    name: { fa: 'دلینا (Delina)', en: 'Delina' },
    brand: 'Parfums de Marly',
    scentFamily: { fa: 'گلی میوه‌ای مدرن و مخملی', en: 'Floral Fruity Velvet' },
    topNotes: { fa: ['سرخالو (لیچی)', 'ریواس ترش', 'ترنج کالابریا', 'جوز هندی'], en: ['Lychee', 'Rhubarb', 'Bergamot', 'Nutmeg'] },
    heartNotes: { fa: ['رز ترکیه‌ای ممتاز', 'گل صدتومانی (پائونیا)', 'گل برف'], en: ['Turkish Rose', 'Peony', 'Lily of the Valley'] },
    baseNotes: { fa: ['وانیل ماداگاسکار', 'مشک کشمیر', 'چوب سدر', 'صمغ بخور'], en: ['Vanilla', 'Cashmeran', 'Cedar', 'Incense'] },
    keywords: ['رز', 'گل', 'زنانه', 'دخترانه', 'لیچی', 'ریواس', 'پودری', 'لطیف', 'صورتی', 'rose', 'floral', 'feminine', 'lychee', 'sweet'],
    gender: 'feminine',
    season: 'spring',
    vibes: ['پرنسسی', 'رمانتیک', 'اشرافی', 'مخملی', 'جذاب'],
    description: {
      fa: 'تجسم زن زنانگی اشرافی قرن هجدهم؛ سمفونی لطیف گلبرگ‌های رز ترکی که با ریواس باطراوت و چوب کشمیر جلا یافته است.',
      en: 'A sensual bouquet of royal Turkish rose, tart rhubarb, sparkling lychee, and creamy cashmeran.',
    },
    seasonOrOccasion: { fa: 'بهار و تابستان، جشن‌های عروسی، مهمانی‌های مجلل و قرارهای رمانتیک', en: 'Weddings, romantic dates, spring garden parties' },
  },
  {
    id: 'portrait-of-a-lady',
    name: { fa: 'پُرتره آو اِ لیدی (Portrait of a Lady)', en: 'Portrait of a Lady' },
    brand: 'Frederic Malle',
    scentFamily: { fa: 'شرقی گلی دارک و پچولی فاخر', en: 'Dark Rose Patchouli' },
    topNotes: { fa: ['رز دمشقی ارگانیک (۴۰۰ گلبرگ در هر شیشه)', 'میخک ادویه‌ای', 'تمشک ترش'], en: ['Turkish Rose', 'Cloves', 'Raspberry'] },
    heartNotes: { fa: ['نعناع هندی اندونزی (پچولی)', 'دارچین', 'انگور فرنگی سیاه'], en: ['Patchouli', 'Cinnamon', 'Blackcurrant'] },
    baseNotes: { fa: ['صمغ کندر عمانی', 'چوب صندل میسور', 'کهربای تیره', 'مشک'], en: ['Frankincense', 'Sandalwood', 'Amber', 'Musk'] },
    keywords: ['رز', 'پچولی', 'نعناع هندی', 'دارک', 'تلخ', 'کندر', 'تمشک', 'سنگین', 'rose', 'patchouli', 'dark', 'gothic', 'incense'],
    gender: 'unisex',
    season: 'fall',
    vibes: ['دارک', 'اشرافی', 'دراماتیک', 'باصلابت', 'هنری'],
    description: {
      fa: 'شاهکار بدون تاریخ دومینیک روپیون؛ رز سیاه مخملی غوطه‌ور در امواج سنگین نعناع هندی، دارچین و کندر عرفانی.',
      en: 'A grand symphonic opera of baroque dark rose, lavish patchouli, cinnamon, and mystical frankincense.',
    },
    seasonOrOccasion: { fa: 'پاییز و زمستان، رویدادهای هنری، سالن‌های اپرا و مجالس شبانه باوقار', en: 'Formal galas, autumn evenings' },
  },
  {
    id: 'carnal-flower',
    name: { fa: 'کارنال فلاور (Carnal Flower)', en: 'Carnal Flower' },
    brand: 'Frederic Malle',
    scentFamily: { fa: 'گلی سفید مریم سبز و طبیعی', en: 'Lush White Tuberose' },
    topNotes: { fa: ['برگ‌های سبز مریم', 'اکالیپتوس باطراوت', 'ترنج'], en: ['Green Stems', 'Eucalyptus', 'Bergamot'] },
    heartNotes: { fa: ['گل مریم طبیعی هند', 'گل یاسمن', 'شکوفه پرتقال', 'طالبی'], en: ['Indian Tuberose', 'Jasmine', 'Orange Blossom', 'Melon'] },
    baseNotes: { fa: ['مشک سفید', 'نارگیل خامه ای', 'چوب سفید'], en: ['White Musk', 'Creamy Coconut', 'White Wood'] },
    keywords: ['مریم', 'گل مریم', 'یاس', 'سفید', 'سبز', 'طبیعی', 'اکالیپتوس', 'tuberose', 'jasmine', 'white floral', 'carnal'],
    gender: 'feminine',
    season: 'spring',
    vibes: ['اغواگر', 'طبیعت‌گرایانه', 'نفس‌گیر', 'اشرافی'],
    description: {
      fa: 'خالص‌ترین و بی‌پرده‌ترین تفسیر گل مریم در تاریخ عطرسازی؛ رایحه مریم مست‌کننده پس از باران که با اکالیپتوس جان گرفته است.',
      en: 'The definitive tuberose work: sensual forbidden flower laced with green eucalyptus and creamy coconut.',
    },
    seasonOrOccasion: { fa: 'بهار و شب‌های تابستان، مهمانی‌های فضای باز و لحظات خاطره‌انگیز', en: 'Warm spring/summer evenings' },
  },
  {
    id: 'baccarat-rouge-540',
    name: { fa: 'باکارات رژ ۵۴۰ اکستریت (Baccarat Rouge 540 Extrait)', en: 'Baccarat Rouge 540 Extrait' },
    brand: 'Maison Francis Kurkdjian',
    scentFamily: { fa: 'کهربایی گلی کریستالی شگفت‌انگیز', en: 'Amber Floral Mineral' },
    topNotes: { fa: ['زعفران سرخ قائنات', 'بادام تلخ مراکشی'], en: ['Red Saffron', 'Bitter Moroccan Almond'] },
    heartNotes: { fa: ['گل یاس مصری', 'چوب سدر ویرجینیا'], en: ['Egyptian Grandiflorum Jasmine', 'Cedar'] },
    baseNotes: { fa: ['عنبر سائل معدنی (امبروکسان)', 'مشک چوبی گرم'], en: ['Ambergris Mineral', 'Warm Woody Musk'] },
    keywords: ['زعفران', 'بادام', 'شیرین', 'کریستال', 'امبروکسان', 'ماندگاری', 'پخش بو', 'خاص', 'saffron', 'almond', 'sweet', 'baccarat', 'mfk'],
    gender: 'unisex',
    season: 'all',
    vibes: ['سحرانگیز', 'کریستالی', 'ردبوی ماندگار', 'لوکس'],
    description: {
      fa: 'کیمیاگری مدرن با سیلاژ افسانه‌ای؛ همنشینی جادویی شکر کاراملیزه با بادام تلخ، زعفران و کهربای درخشان.',
      en: 'A poetic alchemy of roasted bitter almond, fiery saffron, luminous cedar, and crystalline ambergris.',
    },
    seasonOrOccasion: { fa: 'مهمانی‌های باشکوه، رویدادهای لوکس و محافل شبانه چهارفصل', en: 'Black-tie galas, grand occasions' },
  },

  // =========================================================================
  // 5. WOODY, SANDALWOOD, CEDAR, VETIVER & EARTHY
  // =========================================================================
  {
    id: 'santal-33',
    name: { fa: 'سنتال ۳۳ (Santal 33)', en: 'Santal 33' },
    brand: 'Le Labo',
    scentFamily: { fa: 'چوبی آروماتیک پاپیروسی نیش', en: 'Woody Aromatic Papyrus' },
    topNotes: { fa: ['برگ بنفشه فرانسوی', 'بذر هل'], en: ['Violet Leaf', 'Cardamom'] },
    heartNotes: { fa: ['ریشه زنبق زرد', 'پاپیروس مصری', 'چرم جیر'], en: ['Iris', 'Egyptian Papyrus', 'Suede'] },
    baseNotes: { fa: ['چوب صندل استرالیایی', 'سدر ویرجینیا', 'کهربا'], en: ['Sandalwood', 'Cedarwood', 'Amber'] },
    keywords: ['صندل', 'چوب', 'پاپیروس', 'هل', 'بنفشه', 'زنبق', 'تلخ', 'هنری', 'sandalwood', 'cedar', 'woody', 'papyrus', 'le labo'],
    gender: 'unisex',
    season: 'all',
    vibes: ['مینیمال', 'هنری', 'آیکونیک', 'مدرن', 'شهری'],
    description: {
      fa: 'عطر افسانه‌ای جامعه هنری نیویورک؛ تفسیر ساختارشکن از چوب صندل خنک و آمیخته با بوی پاپیروس باستانی و برگ بنفشه.',
      en: 'The cult aromatic icon fusing Australian sandalwood with crisp violet leaf, iris, and smokey papyrus.',
    },
    seasonOrOccasion: { fa: 'چهارفصل، محیط‌های کاری مدرن، گالری‌ها و دیدارهای دوستانه', en: 'All seasons signature creative wear' },
  },
  {
    id: 'terre-d-hermes',
    name: { fa: 'تق د هرمس (Terre d’Hermès)', en: 'Terre d’Hermès' },
    brand: 'Hermès',
    scentFamily: { fa: 'چوبی مرکباتی خاکی و باوقار', en: 'Woody Mineral Citrus' },
    topNotes: { fa: ['پرتقال تلخ آبدار', 'گریپ‌فروت'], en: ['Bitter Orange', 'Grapefruit'] },
    heartNotes: { fa: ['فلفل سیاه', 'فلفل صورتی', 'گل شمعدانی', 'سنگ آتش‌زنه (فلینت)'], en: ['Black Pepper', 'Pink Pepper', 'Pelargonium', 'Flint Mineral'] },
    baseNotes: { fa: ['علف خس‌خس (وتیور)', 'سدر اطلس', 'نعناع هندی', 'بنزوئین'], en: ['Vetiver', 'Atlas Cedar', 'Patchouli', 'Benzoin'] },
    keywords: ['پرتقال', 'خاک', 'وتیور', 'خس‌خس', 'فلفل', 'تلخ', 'مردانه', 'باوقار', 'orange', 'earthy', 'vetiver', 'hermes', 'mineral'],
    gender: 'masculine',
    season: 'all',
    vibes: ['زمین‌محور', 'باوقار', 'جنتلمنی', 'قابل‌اعتماد', 'کلاسیک'],
    description: {
      fa: 'شاعرانگی پیوند میان آسمان و زمین؛ تلخی پرتقال وحشی در آغوش نت‌های معدنی سنگ چخماق و خس‌خس آرامش‌بخش.',
      en: 'A narrative of alchemy between earth and sky: bitter orange, mineral flint, and noble cedar-vetiver.',
    },
    seasonOrOccasion: { fa: 'چهارفصل به خصوص بهار و پاییز، اداری، جلسات رسمی و کت‌وشلوار', en: 'Business, executive and everyday dignity' },
  },
  {
    id: 'the-noir-29',
    name: { fa: 'د نوآر ۲۹ (Thé Noir 29)', en: 'Thé Noir 29' },
    brand: 'Le Labo',
    scentFamily: { fa: 'آروماتیک چای تلخ و انجیر نیش', en: 'Aromatic Black Tea Fig' },
    topNotes: { fa: ['برگ انجیر تازه', 'برگ بو مدیترانه‌ای', 'ترنج'], en: ['Fig Leaf', 'Bay Leaf', 'Bergamot'] },
    heartNotes: { fa: ['چوب سدر', 'خس‌خس هائیتی', 'مشک'], en: ['Cedar', 'Vetiver', 'Musk'] },
    baseNotes: { fa: ['عصاره چای سیاه خشک', 'تنباکو', 'علف خشک'], en: ['Black Tea Extract', 'Tobacco', 'Hay'] },
    keywords: ['چای', 'چای سیاه', 'انجیر', 'تلخ', 'برگ بو', 'سدر', 'آروماتیک', 'tea', 'black tea', 'fig', 'vetiver', 'tobacco'],
    gender: 'unisex',
    season: 'fall',
    vibes: ['روشنفکرانه', 'عمیق', 'آرامش‌بخش', 'خاص', 'مرموز'],
    description: {
      fa: 'ستایش شاعرانه از برگ‌های تلخ چای سیاه؛ هم‌نشینی انجیر سبز، بوی کتاب‌های کهن و دود ملایم چوب سدر.',
      en: 'A tribute to the noble black tea leaf with green fig freshness, dry woods, and comforting hay warmth.',
    },
    seasonOrOccasion: { fa: 'پاییز، کافه‌های دنج، مطالعه و لحظات آرامش فردی', en: 'Autumn reading days, cozy coffee spots' },
  },
  {
    id: 'layton',
    name: { fa: 'لیتون (Layton)', en: 'Layton' },
    brand: 'Parfums de Marly',
    scentFamily: { fa: 'شرقی فوژه ادویه‌ای اغواگر', en: 'Oriental Fougère Spicy' },
    topNotes: { fa: ['سیب سبز کریسپی', 'اسطوخودوس معطر', 'ترنج', 'نارنگی ماندارین'], en: ['Green Apple', 'Lavender', 'Bergamot', 'Mandarin'] },
    heartNotes: { fa: ['هل سبز گواتمالا', 'گل شمعدانی', 'یاس سفید'], en: ['Cardamom', 'Geranium', 'Jasmine'] },
    baseNotes: { fa: ['وانیل پودری بوربون', 'چوب صندل', 'فلفل سیاه', 'نعناع هندی'], en: ['Powdery Vanilla', 'Sandalwood', 'Black Pepper', 'Patchouli'] },
    keywords: ['سیب', 'هل', 'وانیل', 'اسطوخودوس', 'شیرین', 'ادویه', 'چهارفصل', 'همه‌پسند', 'apple', 'cardamom', 'vanilla', 'layton', 'spicy'],
    gender: 'masculine',
    season: 'all',
    vibes: ['اغواگر', 'جنتلمنی', 'محبوب', 'همه‌فن‌حریف', 'لوکس'],
    description: {
      fa: 'یکی از پرطرفدارترین عطرهای نیش تاریخ؛ همنشینی اشتهاآور سیب ترد پاییزی با هل معطر، اسطوخودوس و وانیل کرمی.',
      en: 'A magnetic aristocratic fougère opening with crisp green apple and drying down to warm cardamom-vanilla.',
    },
    seasonOrOccasion: { fa: 'چهارفصل (به جز اوج گرمای تابستان)، قرارهای کاری و عاشقانه', en: 'Versatile signature wear for dates & events' },
  },
];

/**
 * Normalizes Persian and English text for deep semantic keyword matching.
 */
function normalizeQuery(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Olfactory Scoring Sommelier:
 * Dynamically scores world-renowned candidate perfumes against the user query across notes,
 * families, feelings, seasons, gender, and occasion.
 * ONLY recommends authentic international global fragrances.
 */
export function getCuratedMasterpieceFallback(
  userQuery: string,
  lang: 'fa' | 'en' = 'fa'
): RecommendationResult {
  const rawQ = userQuery || '';
  const q = normalizeQuery(rawQ);
  const words = q.split(' ').filter((w) => w.length >= 2);

  // Exclusively world-renowned global masterpieces
  const allCandidates: KnowledgeFragrance[] = [...GLOBAL_KNOWLEDGE_BASE];

  // Specific thematic keyword clusters
  const clusters = {
    coffee: ['قهوه', 'اسپرسو', 'شکلات', 'کاکائو', 'coffee', 'chocolate', 'espresso', 'دارک'],
    vanilla_sweet: ['وانیل', 'وانیلی', 'شیرین', 'کارامل', 'عسل', 'تونکا', 'مارشمالو', 'پرالین', 'کیک', 'sweet', 'vanilla', 'caramel', 'honey'],
    leather_smoke: ['چرم', 'چرمی', 'جیر', 'تنباکو', 'توتون', 'سیگار', 'دود', 'دودی', 'بخور', 'کندر', 'شومینه', 'خاکستر', 'leather', 'smoke', 'smoky', 'tobacco', 'incense'],
    fresh_aquatic: ['خنک', 'سرد', 'اقیانوس', 'اقیانوسی', 'دریا', 'دریایی', 'آب', 'خیار', 'هندوانه', 'نعناع', 'چای', 'چای سبز', 'fresh', 'aquatic', 'marine', 'mint', 'sea'],
    citrus_fruity: ['مرکبات', 'مرکباتی', 'لیمو', 'ترنج', 'پرتقال', 'نارنگی', 'گریپ فروت', 'آناناس', 'سیب', 'تمشک', 'گیلاس', 'لیچی', 'citrus', 'lemon', 'orange', 'pineapple', 'apple', 'bergamot'],
    floral: ['گل', 'گلی', 'رز', 'یاس', 'مریم', 'زنبق', 'بنفشه', 'بهارنارنج', 'نرولی', 'شکوفه', 'پودری', 'floral', 'rose', 'jasmine', 'tuberose', 'iris', 'powdery'],
    woody_amber: ['چوب', 'چوبی', 'صندل', 'سدر', 'خس خس', 'وتیور', 'پچولی', 'نعناع هندی', 'کهربا', 'عنبر', 'عود', 'زعفران', 'wood', 'woody', 'sandalwood', 'cedar', 'vetiver', 'oud', 'amber'],
    spicy_warm: ['ادویه', 'ادویه ای', 'گرم', 'دارچین', 'هل', 'فلفل', 'زنجبیل', 'جوز', 'میخک', 'spicy', 'warm', 'cinnamon', 'cardamom', 'pepper'],
    bitter: ['تلخ', 'تلخی', 'سنگین', 'خاص', 'نیش', 'دارک', 'bitter', 'dark'],
    masculine: ['مردانه', 'مرد', 'پسرانه', 'کت و شلوار', 'جنتلمن', 'men', 'masculine', 'man'],
    feminine: ['زنانه', 'زن', 'دخترانه', 'خانم', 'عروس', 'women', 'feminine', 'woman'],
    winter: ['زمستان', 'زمستانه', 'پاییز', 'پاییزی', 'سرد', 'سرما', 'برف', 'winter', 'fall', 'autumn'],
    summer: ['تابستان', 'تابستانه', 'بهار', 'بهاری', 'گرما', 'گرم', 'آفتاب', 'ساحل', 'summer', 'spring'],
    formal: ['رسمی', 'مجلسی', 'جلسه', 'عروسی', 'مهمانی', 'لوکس', 'formal', 'party', 'luxury'],
    sport: ['اسپرت', 'باشگاه', 'ورزش', 'روزمره', 'casual', 'sport', 'gym'],
  };

  const detectedCategories: string[] = [];
  for (const [key, list] of Object.entries(clusters)) {
    if (list.some((k) => q.includes(normalizeQuery(k)))) {
      detectedCategories.push(key);
    }
  }

  // Score each candidate
  const scored = allCandidates.map((fragrance) => {
    let score = 0;
    const matchReasons: string[] = [];

    const allNotesTextFa = [
      ...fragrance.topNotes.fa,
      ...fragrance.heartNotes.fa,
      ...fragrance.baseNotes.fa,
    ].join(' ').toLowerCase();

    const allNotesTextEn = [
      ...fragrance.topNotes.en,
      ...fragrance.heartNotes.en,
      ...fragrance.baseNotes.en,
    ].join(' ').toLowerCase();

    // 1. Direct word occurrences in notes (Highest priority)
    for (const w of words) {
      if (w.length < 2) continue;
      if (allNotesTextFa.includes(w) || allNotesTextEn.includes(w)) {
        score += 25;
        matchReasons.push(`نت ${w}`);
      }
      if (fragrance.keywords.some((k) => k.includes(w))) {
        score += 15;
      }
      if (normalizeQuery(fragrance.name.fa).includes(w) || fragrance.name.en.toLowerCase().includes(w)) {
        score += 20;
      }
    }

    // 2. Thematic cluster bonuses
    if (detectedCategories.includes('coffee')) {
      if (fragrance.keywords.some((k) => ['قهوه', 'اسپرسو', 'شکلات', 'کاکائو', 'coffee', 'chocolate'].includes(k))) {
        score += 40;
      }
    }
    if (detectedCategories.includes('vanilla_sweet')) {
      if (fragrance.keywords.some((k) => ['وانیل', 'شیرین', 'کارامل', 'عسل', 'تونکا', 'sweet', 'vanilla'].includes(k))) {
        score += 30;
      }
    }
    if (detectedCategories.includes('leather_smoke')) {
      if (fragrance.keywords.some((k) => ['چرم', 'دودی', 'دود', 'تنباکو', 'بخور', 'کندر', 'leather', 'smoke', 'tobacco'].includes(k))) {
        score += 35;
      }
    }
    if (detectedCategories.includes('fresh_aquatic')) {
      if (fragrance.keywords.some((k) => ['خنک', 'اقیانوس', 'دریا', 'چای', 'نعناع', 'fresh', 'aquatic', 'sea'].includes(k)) || fragrance.season === 'summer') {
        score += 35;
      }
    }
    if (detectedCategories.includes('citrus_fruity')) {
      if (fragrance.keywords.some((k) => ['مرکبات', 'لیمو', 'پرتقال', 'ترنج', 'آناناس', 'گریپ فروت', 'citrus', 'orange', 'pineapple'].includes(k))) {
        score += 30;
      }
    }
    if (detectedCategories.includes('floral')) {
      if (fragrance.keywords.some((k) => ['رز', 'یاس', 'مریم', 'زنبق', 'شکوفه', 'گل', 'floral', 'rose', 'jasmine', 'tuberose'].includes(k))) {
        score += 35;
      }
    }
    if (detectedCategories.includes('woody_amber')) {
      if (fragrance.keywords.some((k) => ['چوب', 'صندل', 'سدر', 'وتیور', 'کهربا', 'عود', 'wood', 'sandalwood', 'cedar', 'oud'].includes(k))) {
        score += 30;
      }
    }
    if (detectedCategories.includes('spicy_warm')) {
      if (fragrance.keywords.some((k) => ['ادویه', 'گرم', 'دارچین', 'هل', 'فلفل', 'spicy', 'warm', 'cinnamon'].includes(k))) {
        score += 25;
      }
    }
    if (detectedCategories.includes('bitter')) {
      if (fragrance.keywords.some((k) => ['تلخ', 'چرم', 'وتیور', 'دودی', 'قهوه', 'bitter'].includes(k))) {
        score += 30;
      }
    }

    // 3. Gender alignment
    if (detectedCategories.includes('masculine')) {
      if (fragrance.gender === 'masculine') score += 20;
      else if (fragrance.gender === 'unisex') score += 10;
      else if (fragrance.gender === 'feminine') score -= 25;
    }
    if (detectedCategories.includes('feminine')) {
      if (fragrance.gender === 'feminine') score += 20;
      else if (fragrance.gender === 'unisex') score += 10;
      else if (fragrance.gender === 'masculine') score -= 25;
    }

    // 4. Season alignment
    if (detectedCategories.includes('winter')) {
      if (fragrance.season === 'winter' || fragrance.season === 'fall') score += 15;
      else if (fragrance.season === 'summer') score -= 15;
    }
    if (detectedCategories.includes('summer')) {
      if (fragrance.season === 'summer' || fragrance.season === 'spring') score += 15;
      else if (fragrance.season === 'winter') score -= 15;
    }

    return { fragrance, score, matchReasons };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Deduplicate and choose top 3 unique perfumes
  const topCandidates: KnowledgeFragrance[] = [];
  const seenIds = new Set<string>();

  for (const item of scored) {
    if (!seenIds.has(item.fragrance.id)) {
      seenIds.add(item.fragrance.id);
      topCandidates.push(item.fragrance);
    }
    if (topCandidates.length >= 3) break;
  }

  // Format tailored recommendations
  const recommendations: RecommendedPerfume[] = topCandidates.map((f) => {
    // Generate tailored reason based on user input
    let personalizedReason = f.description[lang];
    if (lang === 'fa') {
      if (detectedCategories.includes('coffee') && (f.keywords.includes('قهوه') || f.keywords.includes('شکلات'))) {
        personalizedReason = `به دلیل حضور نت‌های غنی و اصیل قهوه و شکلات که دقیقاً پاسخگوی سلیقه دارک و تلخ‌پسند مورد نظر شماست.`;
      } else if (detectedCategories.includes('vanilla_sweet') && f.keywords.includes('وانیل')) {
        personalizedReason = `به دلیل تعادل بی‌نظیر وانیل و کارامل کرمی که رایحه‌ای شیرین، دلنشین و هوس‌انگیز را خلق کرده است.`;
      } else if (detectedCategories.includes('fresh_aquatic') && (f.keywords.includes('خنک') || f.keywords.includes('اقیانوس') || f.keywords.includes('چای'))) {
        personalizedReason = `به دلیل طراوت کریستالی و نت‌های زلال اقیانوسی و گیاهی که حس خنکی و سبکی ماندگار را به ارمغان می‌آورد.`;
      } else if (detectedCategories.includes('leather_smoke') && (f.keywords.includes('چرم') || f.keywords.includes('دودی'))) {
        personalizedReason = `به دلیل اصالت عمیق چرم دباغی‌شده و لایه‌های دودی که وقار، صلابت و کاریزمای متفاوتی به امضای شما می‌بخشد.`;
      } else if (detectedCategories.includes('floral') && (f.keywords.includes('رز') || f.keywords.includes('یاس') || f.keywords.includes('مریم'))) {
        personalizedReason = `به دلیل لطافت اشرافی و شکوه مخملی نت‌های گلی تازه که رایحه‌ای برازنده، رمانتیک و لطیف را به تصویر می‌کشد.`;
      }
    }

    return {
      name: f.name[lang],
      brand: f.brand,
      scentFamily: f.scentFamily[lang],
      topNotes: f.topNotes[lang],
      heartNotes: f.heartNotes[lang],
      baseNotes: f.baseNotes[lang],
      reason: personalizedReason,
      seasonOrOccasion: f.seasonOrOccasion[lang],
    };
  });

  // Compose tailored master consultant note
  let consultantNote = '';
  if (lang === 'fa') {
    if (detectedCategories.includes('coffee')) {
      consultantNote = `با توجه به علاقه شما به نت‌های تلخ و اعتیادآور قهوه، شکلات و روایح دارک، این ۳ شاهکار فاخر از برترین خانه‌های عطر نیش جهان برای شما برگزیده شدند:`;
    } else if (detectedCategories.includes('vanilla_sweet')) {
      consultantNote = `بر اساس اشتیاق شما به روایح شیرین، کاراملی و وانیلی، این ۳ شاهکار دل‌انگیز، مخملی و اغواگر از دنیای عطر نیش بین‌المللی به عنوان امضای بویایی شما پیشنهاد می‌شوند:`;
    } else if (detectedCategories.includes('leather_smoke')) {
      consultantNote = `با توجه به انتخاب سنجیده شما برای روایح سنگین، دودی و چرم اصیل، این ۳ نماد صلابت و کاریزما از مشهورترین عطرهای جهان در نظر گرفته شدند:`;
    } else if (detectedCategories.includes('fresh_aquatic') || detectedCategories.includes('citrus_fruity')) {
      consultantNote = `برای سلیقه باطراوت و پویای شما که شیفته خنکای اقیانوس، نسیم مرکباتی و شفافیت تابستانی هستید، این ۳ نماد طراوت از سرشناس‌ترین برندهای جهان انتخاب شدند:`;
    } else if (detectedCategories.includes('floral')) {
      consultantNote = `بر اساس علاقه شما به گلبرگ‌های لطیف، شکوفه‌های بهاری و لطافت نیش، این ۳ اثر هنری گلی و فاخر از مشهورترین خانه‌های عطر دنیا تقدیم حضورتان می‌گردد:`;
    } else if (detectedCategories.includes('woody_amber')) {
      consultantNote = `با توجه به گرایش شما به اصالت چوب‌های کهنسال و گرمای شاهانه کهربا و عود، این ۳ شاهکار باوقار از تاریخ عطرسازی جهان گزینش گردیدند:`;
    } else {
      consultantNote = `بر اساس بررسی دقیق ویژگی‌ها و هارمونی بویایی مد نظر شما («${rawQ}»)، این ۳ شاهکار نمادین از نامدارترین خانه‌های عطر جهان پیشنهاد می‌گردند:`;
    }
  } else {
    consultantNote = `Based on your personalized olfactory inquiry ("${rawQ}"), our master perfumer has curated these three world-renowned masterpieces from prestigious global fragrance houses:`;
  }

  return {
    consultantNote,
    recommendations,
  };
}

/**
 * Retrieves fragrance recommendations using Google Gemini API if configured,
 * and seamlessly falls back to the curated master sommelier system on any error or denied access.
 * Strictly recommends world-renowned global fragrances (no local store products).
 */
export async function getFragranceRecommendations(
  userQuery: string,
  lang: 'fa' | 'en' = 'fa'
): Promise<RecommendationResult> {
  const cleanQuery = (userQuery || '').trim();
  if (!cleanQuery) {
    return getCuratedMasterpieceFallback('', lang);
  }

  // 1. Try retrieving the key from all possible environment locations:
  let apiKey = '';

  try {
    apiKey =
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.GEMINI_API_KEY ||
      '';
  } catch {
    //
  }

  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        apiKey =
          process.env.VITE_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          '';
      }
    } catch {
      //
    }
  }

  if (!apiKey && typeof window !== 'undefined') {
    try {
      apiKey =
        (window as any).__GEMINI_API_KEY__ ||
        (window as any).GEMINI_API_KEY ||
        localStorage.getItem('gemini_api_key') ||
        '';
    } catch {
      //
    }
  }

  // 2. If a key is present and valid, call Gemini API
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `تو یک استاد عطرساز ارشد بین‌المللی (Master Perfumer) و کارشناس دنیای عطر نیش جهان هستی.
دستورالعمل حیاتی و الزامی:
پیشنهادات تو باید منحصراً و ۱۰۰٪ از میان شناخته‌شده‌ترین، معتبرترین و برترین عطرهای موجود در جهان (برندهای بین‌المللی مانند Creed, Tom Ford, Parfums de Marly, Kilian, Maison Francis Kurkdjian, Amouage, Xerjoff, Nishane, Le Labo, Frederic Malle, Diptyque, Louis Vuitton, Byredo, Dior, Chanel, Hermes و ...) باشد.
به هیچ عنوان از عطرهای ساختگی، فرضی، متفرقه یا محصولات داخلی هیچ وب‌سایتی استفاده نکن؛ بلکه دقیقاً ۳ عطر واقعی، اورجینال و سرشناس از میان عطرهای موجود در جهان را بر اساس سلیقه و نت‌های درخواستی کاربر پیشنهاد بده.
برای هر عطر: نام عطر (Name)، برند جهانی (Brand)، خانواده بویایی (Scent Family)، نت‌های آغازین، میانی و پایه، و علت پیشنهاد (Reason) را به شکلی فاخر و جذاب بنویس.`;

      const prompt = `سلیقه و درخواست بویایی کاربر:
"${cleanQuery}"

لطفاً دقیقاً ۳ عطر معروف، اصیل و برتر جهان (برندهای بین‌المللی دنیای عطر) که بیشترین همخوانی با این رایحه را دارند پیشنهاد بده.`;

      // Try with gemini-2.5-flash first
      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: RECOMMENDATION_SCHEMA,
            temperature: 0.7,
          },
        });
        responseText = response.text || '';
      } catch (firstModelErr) {
        // Fallback to gemini-3.8-flash if model name differs
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: RECOMMENDATION_SCHEMA,
              temperature: 0.7,
            },
          });
          responseText = fallbackResponse.text || '';
        } catch {
          throw firstModelErr;
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText) as RecommendationResult;
        if (
          parsed &&
          Array.isArray(parsed.recommendations) &&
          parsed.recommendations.length > 0
        ) {
          return parsed;
        }
      }
    } catch (apiErr: any) {
      console.warn(
        '[Gemini Sommelier] Live API unavailable. Seamlessly activating curated global sommelier engine:',
        apiErr?.message || apiErr
      );
      return getCuratedMasterpieceFallback(cleanQuery, lang);
    }
  }

  // 3. Fallback to curated world-renowned perfumes
  return getCuratedMasterpieceFallback(cleanQuery, lang);
}

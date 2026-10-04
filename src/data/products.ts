import { Product } from '../types';
import { PRODUCT_IMAGES } from './images';

/* Real brand asset placeholder: Replace unsplash image URLs with high-resolution studio bottle photography */
export const products: Product[] = [
  // 1. Oud Nocturne (Maison Rayeha - Oriental - Unisex)
  {
    id: 'oud-nocturne',
    slug: 'oud-nocturne',
    brand: 'Maison Rayeha',
    name: {
      fa: 'عود نوکتورن',
      en: 'Oud Nocturne',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم سلطنتی - شب‌نشینی رزین‌ها و کهربا',
      en: 'Royal Extrait de Parfum – Nocturnal Resins & Amber',
    },
    description: {
      fa: 'قصیده‌ای اغواگر در توصیف شب‌های رازآلود شرق. همنشینی عود کهنسال کامبوجی با زعفران سرخ قائنات و دودی لطیف از بخور باستانی کندر.',
      en: 'A mesmerizing nocturne celebrating ancient Eastern twilight. Aged Cambodian agarwood is laced with royal saffron and a contemplative plume of rare Omani resins.',
    },
    price: {
      fa: 12900000,
      en: 225,
    },
    sizes: [
      { ml: 30, price: { fa: 12900000, en: 225 } },
      { ml: 50, price: { fa: 18500000, en: 320 } },
      { ml: 100, price: { fa: 28900000, en: 495 } },
    ],
    scentFamily: 'oriental',
    gender: 'unisex',
    concentration: {
      fa: 'اکستریت د پرفیوم (۳۰٪ غلظت روغن نیش)',
      en: 'Extrait de Parfum (30% pure oil concentrate)',
    },
    notes: {
      top: {
        fa: ['زعفران قائنات', 'هل سبز گواتمالا', 'ترنج کالابریا'],
        en: ['Persian Saffron', 'Guatemalan Green Cardamom', 'Calabrian Bergamot'],
      },
      heart: {
        fa: ['رز دمشقی ارگانیک', 'چرم دباغی‌شده', 'صمغ کندر عمان'],
        en: ['Organic Damask Rose', 'Burnished Leather', 'Omani Frankincense'],
      },
      base: {
        fa: ['عود طبیعی کامبوج', 'کهربای تیره', 'چوب صندل کهن'],
        en: ['Wild Cambodian Oud', 'Dark Amber', 'Aged Sandalwood'],
      },
    },
    images: PRODUCT_IMAGES['oud-nocturne'],
    isBestseller: true,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 15,
    popularity: 18450,
    salesCount: 1420,
    createdAt: '2025-11-10',
    rating: 4.95,
    reviewCount: 84,
    longevity: 4.9,
    sillage: 4.8,
  },

  // 2. Rose de Shiraz (Maison Rayeha - Floral - Feminine)
  {
    id: 'rose-de-shiraz',
    slug: 'rose-de-shiraz',
    brand: 'Maison Rayeha',
    name: {
      fa: 'رز دو شیراز',
      en: 'Rose de Shiraz',
    },
    subtitle: {
      fa: 'او د پرفیوم مخملی - گلبرگ‌های سپیده‌دم باغ ارم',
      en: 'Velvet Eau de Parfum – Dawn Petals of Eram Gardens',
    },
    description: {
      fa: 'ادای احترام به باغ‌های شاعرانه شیراز در سپیده‌دم. رز مخملی تازه چیده‌شده آمیخته با لمس تمشک وحشی و مشک ابریشمی سفید.',
      en: 'An homage to the poetic garden courtyards of Shiraz at first dawn. Velvety, dew-kissed petals melded with wild berries and crystalline musk.',
    },
    price: {
      fa: 11200000,
      en: 195,
    },
    sizes: [
      { ml: 30, price: { fa: 11200000, en: 195 } },
      { ml: 50, price: { fa: 16200000, en: 280 } },
      { ml: 100, price: { fa: 24500000, en: 420 } },
    ],
    scentFamily: 'floral',
    gender: 'feminine',
    concentration: {
      fa: 'او د پرفیوم نفیس',
      en: 'Haute Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['شبنم گلبرگ سرخ', 'تمشک وحشی', 'فلفل صورتی'],
        en: ['Dewy Rose Petals', 'Wild Raspberries', 'Pink Peppercorn'],
      },
      heart: {
        fa: ['رز سنتی شیراز', 'گل پونه‌کوهی', 'پائونیا ابریشمی'],
        en: ['Heritage Shiraz Rose', 'Wild Oregano Blossom', 'Silk Peony'],
      },
      base: {
        fa: ['مشک کشمیر', 'وانیل طبیعی بوربون', 'چوب سدر اطلس'],
        en: ['Cashmere Musk', 'Bourbon Vanilla Bean', 'Atlas Cedar'],
      },
    },
    images: PRODUCT_IMAGES['rose-de-shiraz'],
    isBestseller: true,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 20,
    popularity: 16800,
    salesCount: 1290,
    createdAt: '2025-12-05',
    rating: 4.9,
    reviewCount: 62,
    longevity: 4.6,
    sillage: 4.4,
  },

  // 3. Santal Céleste (Atelier Qajar - Woody - Unisex)
  {
    id: 'santal-celeste',
    slug: 'santal-celeste',
    brand: 'Atelier Qajar',
    name: {
      fa: 'صندل سلست',
      en: 'Santal Céleste',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم چوبی و مراقبه‌گون - شیر بادام و زنبق',
      en: 'Woody & Meditative Extrait – Almond Milk & Orris',
    },
    description: {
      fa: 'آرامش مراقبه‌گون چوب صندل میسور در هماهنگی باشکوه با برگ بنفشه، پودر زنبق فلورانسی و شیر بادام بو داده.',
      en: 'The meditative aura of rare Mysore sandalwood in serene accord with Florentine iris root, violet leaf, and warm toasted almond milk.',
    },
    price: {
      fa: 12400000,
      en: 215,
    },
    sizes: [
      { ml: 30, price: { fa: 12400000, en: 215 } },
      { ml: 50, price: { fa: 17800000, en: 310 } },
      { ml: 100, price: { fa: 26800000, en: 460 } },
    ],
    scentFamily: 'woody',
    gender: 'unisex',
    concentration: {
      fa: 'اکستریت د پرفیوم غلیظ',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['برگ بنفشه فرانسوی', 'بذر هل', 'شیر بادام'],
        en: ['French Violet Leaves', 'Crushed Cardamom', 'Almond Milk'],
      },
      heart: {
        fa: ['ریشه زنبق زرد فلورانس', 'پاپیروس مصری', 'جوز هندی'],
        en: ['Florentine Orris', 'Egyptian Papyrus', 'Grated Nutmeg'],
      },
      base: {
        fa: ['چوب صندل میسور', 'سدر سفید ویرجینیا', 'عنبر خاکستری'],
        en: ['Mysore Sandalwood', 'White Virginia Cedar', 'Ambergris'],
      },
    },
    images: PRODUCT_IMAGES['santal-celeste'],
    isBestseller: true,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    popularity: 14200,
    salesCount: 980,
    createdAt: '2026-08-20',
    rating: 4.88,
    reviewCount: 47,
    longevity: 4.7,
    sillage: 4.3,
  },

  // 4. Ambre Impérial (L’Élixir d’Ispahan - Oriental - Unisex)
  {
    id: 'ambre-imperial',
    slug: 'ambre-imperial',
    brand: 'L’Élixir d’Ispahan',
    name: {
      fa: 'عنبر امپریال',
      en: 'Ambre Impérial',
    },
    subtitle: {
      fa: 'او د پرفیوم کهربایی گرم - صمغ بنزوئین و وانیل بوربون',
      en: 'Warm Amber Eau de Parfum – Siam Benzoin & Vanilla',
    },
    description: {
      fa: 'گرمایی طلایی و شاهانه؛ رزین‌های نفیس کهربا که با لوبیای تونکای برشته و وانیل دودی ماداگاسکار جلا یافته‌اند.',
      en: 'A regal cloak of golden resinous warmth. Luminous amber polished with roasted tonka beans and smoked Madagascar vanilla orchids.',
    },
    price: {
      fa: 10800000,
      en: 190,
    },
    sizes: [
      { ml: 30, price: { fa: 10800000, en: 190 } },
      { ml: 50, price: { fa: 15900000, en: 275 } },
      { ml: 100, price: { fa: 23800000, en: 410 } },
    ],
    scentFamily: 'oriental',
    gender: 'unisex',
    concentration: {
      fa: 'او د پرفیوم',
      en: 'Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['پوست دارچین سیلان', 'پرتقال خونی سیسیلی'],
        en: ['Ceylon Cinnamon Bark', 'Sicilian Blood Orange'],
      },
      heart: {
        fa: ['صمغ بنزوئین سیام', 'گل آفتاب‌پرست', 'لوبیای تونکا'],
        en: ['Siam Benzoin Resin', 'Heliotrope', 'Roasted Tonka Bean'],
      },
      base: {
        fa: ['کهربای فسیل‌شده', 'وانیل ارگانیک بوربون', 'چوب گایاک'],
        en: ['Fossilized Amber', 'Organic Bourbon Vanilla', 'Guaiacwood'],
      },
    },
    images: PRODUCT_IMAGES['ambre-imperial'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 10,
    popularity: 11600,
    salesCount: 610,
    createdAt: '2026-07-15',
    rating: 4.85,
    reviewCount: 38,
    longevity: 4.8,
    sillage: 4.6,
  },

  // 5. Fleur de Safran (Atelier Qajar - Floral - Unisex)
  {
    id: 'fleur-de-safran',
    slug: 'fleur-de-safran',
    brand: 'Atelier Qajar',
    name: {
      fa: 'فلور دو زعفران',
      en: 'Fleur de Safran',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم زربافت - زعفران سرگل و عسل زاگرس',
      en: 'Gilded Extrait – Sargol Saffron & Wild Honey',
    },
    description: {
      fa: 'ترکیبی شاهانه از شکوفه‌های زعفران بنفش، عسل کوهستان زاگرس و لایه‌ای نازک از جیر لطیف و چوب سدر.',
      en: 'An opulent marriage of fragile violet saffron blossoms, wild mountain honey, and a tender veil of suede and cedar.',
    },
    price: {
      fa: 13500000,
      en: 235,
    },
    sizes: [
      { ml: 30, price: { fa: 13500000, en: 235 } },
      { ml: 50, price: { fa: 19200000, en: 335 } },
      { ml: 100, price: { fa: 29500000, en: 510 } },
    ],
    scentFamily: 'floral',
    gender: 'unisex',
    concentration: {
      fa: 'اکستریت د پرفیوم',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['زعفران قائنات سرگل', 'بهارنارنج شیراز', 'ترنج سبز'],
        en: ['Persian Sargol Saffron', 'Shiraz Neroli', 'Green Bergamot'],
      },
      heart: {
        fa: ['عسل کوهی وحشی', 'گل یاس رازقی', 'پوست درخت دارچین'],
        en: ['Wild Mountain Honey', 'Sambac Jasmine', 'Cinnamon Bark'],
      },
      base: {
        fa: ['جیر ابریشمی', 'پچولی اندونزی', 'کهربای کریستالی'],
        en: ['Silk Suede', 'Indonesian Patchouli', 'Crystalline Amber'],
      },
    },
    images: PRODUCT_IMAGES['fleur-de-safran'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    popularity: 9800,
    salesCount: 460,
    createdAt: '2026-09-01',
    rating: 4.92,
    reviewCount: 51,
    longevity: 4.8,
    sillage: 4.5,
  },

  // 6. Vétiver Minéral (Darvazeh Botanicals - Fresh - Masculine)
  {
    id: 'vetiver-mineral',
    slug: 'vetiver-mineral',
    brand: 'Darvazeh Botanicals',
    name: {
      fa: 'وتیور مینرال',
      en: 'Vétiver Minéral',
    },
    subtitle: {
      fa: 'او د پرفیوم خنک و زمینی - نمک دریا و ریشه وتیور هائیتی',
      en: 'Earthy Crisp Eau de Parfum – Sea Salt & Vetiver',
    },
    description: {
      fa: 'رایحه‌ای مدرن، عمیق و خنک از ریشه‌های وتیور هائیتی، سنگ‌های نمکی ساحل دریای خزر و نسیم مرکبات سبز کوهستانی.',
      en: 'A contemporary mineral elegance. Crisp Haitian vetiver roots washed by northern coastal salt breeze and highland citrus rind.',
    },
    price: {
      fa: 9900000,
      en: 175,
    },
    sizes: [
      { ml: 30, price: { fa: 9900000, en: 175 } },
      { ml: 50, price: { fa: 14800000, en: 260 } },
      { ml: 100, price: { fa: 21900000, en: 380 } },
    ],
    scentFamily: 'fresh',
    gender: 'masculine',
    concentration: {
      fa: 'او د پرفیوم فرش نیش',
      en: 'Fresh Niche Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['گریپ‌فروت خونی', 'نمک دریایی', 'مریم گلی فرانسوی'],
        en: ['Pink Grapefruit', 'Sea Salt Flakes', 'French Clary Sage'],
      },
      heart: {
        fa: ['میوه ارس کوهی', 'برگ نعناع هندی', 'سنگ چخماق مرطوب'],
        en: ['Juniper Berry', 'Crisp Mint Leaf', 'Flint Accord'],
      },
      base: {
        fa: ['وتیور هائیتی', 'خزه بلوط جنگلی', 'سدر سفید'],
        en: ['Haitian Vetiver', 'Forest Oakmoss', 'White Cedar'],
      },
    },
    images: PRODUCT_IMAGES['vetiver-mineral'],
    isBestseller: true,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 25,
    popularity: 15300,
    salesCount: 1140,
    createdAt: '2026-01-12',
    rating: 4.87,
    reviewCount: 73,
    longevity: 4.4,
    sillage: 4.2,
  },

  // 7. Cuir de Perse (Naveed Parfums - Woody - Unisex)
  {
    id: 'cuir-de-perse',
    slug: 'cuir-de-perse',
    brand: 'Naveed Parfums',
    name: {
      fa: 'چرم پارس',
      en: 'Cuir de Perse',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم چرمی و دودی - تنباکوی بلوند و مر',
      en: 'Smoky Leather Extrait – Blond Tobacco & Myrrh',
    },
    description: {
      fa: 'شکوه و اقتدار تاریخی با تارهای چرم کهن، آلو سیاه دودی، رزین مر و روحی از تنباکوی ناب در کمال برازندگی.',
      en: 'A commanding narrative of royal antiquity. Ancient cured leather layered over smoked black plum, myrrh, and noble blond tobacco leaf.',
    },
    price: {
      fa: 13200000,
      en: 230,
    },
    sizes: [
      { ml: 30, price: { fa: 13200000, en: 230 } },
      { ml: 50, price: { fa: 18900000, en: 330 } },
      { ml: 100, price: { fa: 28800000, en: 495 } },
    ],
    scentFamily: 'woody',
    gender: 'unisex',
    concentration: {
      fa: 'اکستریت د پرفیوم',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['آلو سیاه خشک دودی', 'زعفران زرین', 'بذر گشنیز'],
        en: ['Smoked Black Plum', 'Golden Saffron', 'Cracked Coriander'],
      },
      heart: {
        fa: ['چرم نرم اسبی', 'گل اوسمانتوس چینی', 'برگ تنباکوی کوبایی'],
        en: ['Antique Saddle Leather', 'Osmanthus', 'Blond Tobacco'],
      },
      base: {
        fa: ['صمغ مر یمنی', 'روغن قطران درخت غان', 'روغن وتیور تیره'],
        en: ['Yemeni Myrrh', 'Birch Tar', 'Dark Vetiver'],
      },
    },
    images: PRODUCT_IMAGES['cuir-de-perse'],
    isBestseller: false,
    isNew: false,
    inStock: false,
    stockQuantity: 0,
    popularity: 8200,
    salesCount: 390,
    createdAt: '2025-09-28',
    rating: 4.93,
    reviewCount: 41,
    longevity: 4.9,
    sillage: 4.7,
  },

  // 8. Citrus Éthéré (Darvazeh Botanicals - Citrus - Unisex)
  {
    id: 'citrus-ethere',
    slug: 'citrus-ethere',
    brand: 'Darvazeh Botanicals',
    name: {
      fa: 'سیتروس اتره',
      en: 'Citrus Éthéré',
    },
    subtitle: {
      fa: 'او د پرفیوم درخشان - لیمو ترش سیسیلی و زنجبیل تازه',
      en: 'Luminous Citrus – Sicilian Lemon & Ginger',
    },
    description: {
      fa: 'درخشش اولین پرتوهای آفتاب مدیترانه‌ای بر ترنج کالابریا، شکوفه‌های لیمو امالفی و زنجبیل تازه همراه با پوششی تمیز از مشک بلورین.',
      en: 'Sun-drenched crystalline luminosity. Cold-pressed Calabrian bergamot, Amalfi lemon blossom, and fresh ginger enveloped in crisp crystalline musk.',
    },
    price: {
      fa: 9500000,
      en: 165,
    },
    sizes: [
      { ml: 30, price: { fa: 9500000, en: 165 } },
      { ml: 50, price: { fa: 13900000, en: 245 } },
      { ml: 100, price: { fa: 20900000, en: 365 } },
    ],
    scentFamily: 'citrus',
    gender: 'unisex',
    concentration: {
      fa: 'او د پرفیوم',
      en: 'Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['ترنج کالابریا فشرده', 'لیمو ترش امالفی', 'پرتقال ماندارین'],
        en: ['Cold-pressed Bergamot', 'Amalfi Lemon Rind', 'Mandarin'],
      },
      heart: {
        fa: ['شکوفه پرتقال تلخ', 'زنجبیل تازه تند', 'چای سفید سیلان'],
        en: ['Orange Blossom', 'Fresh Grated Ginger', 'Ceylon White Tea'],
      },
      base: {
        fa: ['مشک پنبه‌ای سفید', 'چوب سدر روشن', 'عنبر شفاف'],
        en: ['Cotton White Musk', 'Light Cedar', 'Crystalline Amber'],
      },
    },
    images: PRODUCT_IMAGES['citrus-ethere'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 15,
    popularity: 10900,
    salesCount: 520,
    createdAt: '2026-08-10',
    rating: 4.82,
    reviewCount: 35,
    longevity: 4.2,
    sillage: 4.1,
  },

  // 9. Jasmin d’Ispahan (L’Élixir d’Ispahan - Floral - Feminine)
  {
    id: 'jasmin-dispahan',
    slug: 'jasmin-dispahan',
    brand: 'L’Élixir d’Ispahan',
    name: {
      fa: 'یاس اسپهان',
      en: 'Jasmin d’Ispahan',
    },
    subtitle: {
      fa: 'او د پرفیوم یاس شب‌بو - بهارنارنج و بادام تلخ',
      en: 'Night Jasmine Eau de Parfum – Neroli & Bitter Almond',
    },
    description: {
      fa: 'ترنم شبانه گل‌های یاس رازقی در حیاط عمارت‌های تاریخی اصفهان؛ حریری از بهارنارنج، شیرینی لطیف عسلاب و چوب صندل کرمی.',
      en: 'The nocturnal bloom of Sambac jasmine within historic Isfahani courtyards, accented with neroli blossom, wild almond, and creamy sandalwood.',
    },
    price: {
      fa: 11800000,
      en: 205,
    },
    sizes: [
      { ml: 30, price: { fa: 11800000, en: 205 } },
      { ml: 50, price: { fa: 16900000, en: 295 } },
      { ml: 100, price: { fa: 25400000, en: 440 } },
    ],
    scentFamily: 'floral',
    gender: 'feminine',
    concentration: {
      fa: 'او د پرفیوم فلورال',
      en: 'Floral Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['بهارنارنج کاشان', 'نارنگی ماندارین سیسیلی', 'بادام تلخ'],
        en: ['Kashan Neroli', 'Sicilian Green Mandarin', 'Bitter Almond'],
      },
      heart: {
        fa: ['یاس رازقی شب‌بو', 'مریم هندی', 'شکوفه پرتقال'],
        en: ['Night-blooming Sambac Jasmine', 'Indian Tuberose', 'Orange Blossom'],
      },
      base: {
        fa: ['چوب صندل استرالیا', 'مشک ابریشمی', 'عنبر شفاف'],
        en: ['Australian Sandalwood', 'Silk Musk', 'Sheer Amber'],
      },
    },
    images: PRODUCT_IMAGES['jasmin-dispahan'],
    isBestseller: false,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    popularity: 7600,
    salesCount: 340,
    createdAt: '2026-03-22',
    rating: 4.89,
    reviewCount: 29,
    longevity: 4.5,
    sillage: 4.4,
  },

  // 10. Bois Fumé (Naveed Parfums - Woody - Masculine)
  {
    id: 'bois-fume',
    slug: 'bois-fume',
    brand: 'Naveed Parfums',
    name: {
      fa: 'بوآ فومه',
      en: 'Bois Fumé',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم دودی - چوب گایاک و صمغ لادن',
      en: 'Smoky Woods Extrait – Guaiacwood & Labdanum',
    },
    description: {
      fa: 'تصویری عمیق و پرابهت از آتش چوب‌های کهنسال بلوط در غروب پاییزی؛ پیوند گایاک دودی با لادن رزینی و دانه هل سیاه.',
      en: 'An intense portrait of ancient hearthwood embers; smoked Paraguayan guaiac melded with Spanish labdanum and cracked black cardamom.',
    },
    price: {
      fa: 12500000,
      en: 220,
    },
    sizes: [
      { ml: 30, price: { fa: 12500000, en: 220 } },
      { ml: 50, price: { fa: 17900000, en: 315 } },
      { ml: 100, price: { fa: 27500000, en: 475 } },
    ],
    scentFamily: 'woody',
    gender: 'masculine',
    concentration: {
      fa: 'اکستریت د پرفیوم',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['هل سیاه هندی', 'فلفل سیاه تلخ', 'میوه کاج جنگلی'],
        en: ['Black Cardamom', 'Cracked Black Pepper', 'Pine Cones'],
      },
      heart: {
        fa: ['چوب گایاک دودی', 'صمغ لادن اسپانیایی', 'نعناع هندی کهن'],
        en: ['Smoked Guaiac', 'Spanish Labdanum', 'Aged Patchouli'],
      },
      base: {
        fa: ['سدر کوهستانی اطلس', 'چرم خام', 'خزه بلوط'],
        en: ['Atlas Mountain Cedar', 'Raw Leather', 'Forest Oakmoss'],
      },
    },
    images: PRODUCT_IMAGES['bois-fume'],
    isBestseller: true,
    isNew: false,
    inStock: false,
    stockQuantity: 0,
    popularity: 13900,
    salesCount: 1020,
    createdAt: '2026-02-18',
    rating: 4.91,
    reviewCount: 44,
    longevity: 4.8,
    sillage: 4.7,
  },

  // 11. Neroli Royale (Maison Rayeha - Citrus - Feminine)
  {
    id: 'neroli-royale',
    slug: 'neroli-royale',
    brand: 'Maison Rayeha',
    name: {
      fa: 'نرولی رویال',
      en: 'Néroli Royale',
    },
    subtitle: {
      fa: 'او د پرفیوم اشرافی - شکوفه پرتقال کاشان و مشک بلورین',
      en: 'Aristocratic Néroli – Orange Blossoms & Ambergris',
    },
    description: {
      fa: 'عطری الهام‌گرفته از جشن گلاب‌گیری اردیبهشت کاشان؛ شکوفه‌های ناب بهارنارنج همراه با پرتقال طلایی و رد پای لطیف چوب سدر.',
      en: 'A golden homage to the historic Kashan neroli harvests; delicate orange blossoms, zesty mandarin, and a crystalline veil of white cedar.',
    },
    price: {
      fa: 10500000,
      en: 185,
    },
    sizes: [
      { ml: 30, price: { fa: 10500000, en: 185 } },
      { ml: 50, price: { fa: 15400000, en: 270 } },
      { ml: 100, price: { fa: 22800000, en: 395 } },
    ],
    scentFamily: 'citrus',
    gender: 'feminine',
    concentration: {
      fa: 'او د پرفیوم لوکس',
      en: 'Haute Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['پرتقال تلخ کالابریا', 'بهارنارنج کاشان', 'روغن پتی‌گرن'],
        en: ['Calabrian Bitter Orange', 'Kashan Neroli', 'Petitgrain Essence'],
      },
      heart: {
        fa: ['شکوفه پرتقال امپریال', 'گل یاسمن سفید', 'هل سفید'],
        en: ['Imperial Orange Blossom', 'White Jasmine', 'White Cardamom'],
      },
      base: {
        fa: ['مشک کشمیر', 'سدر فرانسوی', 'عنبر خاکستری روشن'],
        en: ['Cashmere Musk', 'French Cedar', 'Luminous Ambergris'],
      },
    },
    images: PRODUCT_IMAGES['neroli-royale'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 10,
    popularity: 10400,
    salesCount: 580,
    createdAt: '2026-07-25',
    rating: 4.86,
    reviewCount: 33,
    longevity: 4.3,
    sillage: 4.0,
  },

  // 12. Encens Sacré (Atelier Qajar - Oriental - Unisex)
  {
    id: 'encens-sacre',
    slug: 'encens-sacre',
    brand: 'Atelier Qajar',
    name: {
      fa: 'انسان ساکره',
      en: 'Encens Sacré',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم عرفانی - صمغ کندر عمان و فلفل سیاه',
      en: 'Mystic Resins Extrait – Omani Frankincense & Black Pepper',
    },
    description: {
      fa: 'رایحه‌ای مقدس و تأمل‌برانگیز از کهن‌ترین معابد مشرق‌زمین. رقص دود کندر عمانی با دانه‌های خردشده هل و صمغ درخت مرمکی.',
      en: 'A sacred contemplative tapestry woven from the highest grade Omani frankincense tears, cracked pepper, and ancient balsamic myrrh.',
    },
    price: {
      fa: 13800000,
      en: 240,
    },
    sizes: [
      { ml: 30, price: { fa: 13800000, en: 240 } },
      { ml: 50, price: { fa: 19800000, en: 345 } },
      { ml: 100, price: { fa: 29900000, en: 520 } },
    ],
    scentFamily: 'oriental',
    gender: 'unisex',
    concentration: {
      fa: 'اکستریت د پرفیوم',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['دود کندر هجری', 'فلفل سیاه مالابار', 'بذر گشنیز وحشی'],
        en: ['Hojari Frankincense Smoke', 'Malabar Pepper', 'Wild Coriander'],
      },
      heart: {
        fa: ['صمغ مرمکی یمن', 'چوب سرو باستانی', 'جوز هندی بو داده'],
        en: ['Yemeni Myrrh Tears', 'Ancient Cypress', 'Roasted Nutmeg'],
      },
      base: {
        fa: ['صمغ بنزوئین', 'عنبر سیاه فسیلی', 'روغن وتیور برشته'],
        en: ['Siam Benzoin', 'Black Fossil Amber', 'Roasted Vetiver'],
      },
    },
    images: PRODUCT_IMAGES['encens-sacre'],
    isBestseller: true,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    popularity: 17200,
    salesCount: 1350,
    createdAt: '2025-11-30',
    rating: 4.96,
    reviewCount: 58,
    longevity: 4.9,
    sillage: 4.8,
  },

  // 13. Brise d’Alborz (Darvazeh Botanicals - Fresh - Unisex)
  {
    id: 'brise-dalborz',
    slug: 'brise-dalborz',
    brand: 'Darvazeh Botanicals',
    name: {
      fa: 'بریز د البرز',
      en: 'Brise d’Alborz',
    },
    subtitle: {
      fa: 'او د پرفیوم آلپی و کوهستانی - آویشن وحشی و آب چشمه',
      en: 'Alpine Breeze Eau de Parfum – Wild Thyme & Glacier Water',
    },
    description: {
      fa: 'نسیم خنک دامنه‌های البرز بر تن علفزارهای کوهی؛ آمیزه‌ای طراوت‌بخش از آویشن کوهی، سنبل ختایی و آب چشمه‌های صخره‌ای.',
      en: 'The invigorating purity of highland Alborz ridges; fresh wild thyme, crisp angelica root, and pristine mineral springs.',
    },
    price: {
      fa: 9200000,
      en: 160,
    },
    sizes: [
      { ml: 30, price: { fa: 9200000, en: 160 } },
      { ml: 50, price: { fa: 13500000, en: 235 } },
      { ml: 100, price: { fa: 19800000, en: 345 } },
    ],
    scentFamily: 'fresh',
    gender: 'unisex',
    concentration: {
      fa: 'او د پرفیوم طبیعی',
      en: 'Natural Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['آب چشمه کوهستان', 'نعناع فلفلی کوهی', 'ترنج سبز'],
        en: ['Glacier Spring Accord', 'Wild Mountain Mint', 'Green Bergamot'],
      },
      heart: {
        fa: ['آویشن وحشی زاگرس', 'برگ گزنه جوان', 'سنبل ختایی'],
        en: ['Wild Thyme Herb', 'Young Nettle Leaf', 'Angelica Root'],
      },
      base: {
        fa: ['خزه صخره‌ای', 'چوب سدر نقره‌ای', 'مشک ابریشم'],
        en: ['Alpine Rock Moss', 'Silver Cedar', 'Silk Musk'],
      },
    },
    images: PRODUCT_IMAGES['brise-dalborz'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 20,
    popularity: 8800,
    salesCount: 410,
    createdAt: '2026-06-28',
    rating: 4.81,
    reviewCount: 22,
    longevity: 4.2,
    sillage: 3.9,
  },

  // 14. Tabac Noble (Naveed Parfums - Oriental - Masculine)
  {
    id: 'tabac-noble',
    slug: 'tabac-noble',
    brand: 'Naveed Parfums',
    name: {
      fa: 'تاباک نوبل',
      en: 'Tabac Noble',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم اشرافی - برگ تنباکوی هاوانا و عسل وحشی',
      en: 'Noble Tobacco Extrait – Havana Leaf & Forest Honey',
    },
    description: {
      fa: 'روایت شکوه و اصالت؛ برگ‌های خشکیده تنباکو که در عسل جنگلی و عصاره دانه‌های تونکا خوابانده شده‌اند.',
      en: 'An opulent aristocratic statement; sundried tobacco leaves cured with dark forest honey, spiced tonka, and bitter cacao.',
    },
    price: {
      fa: 12800000,
      en: 225,
    },
    sizes: [
      { ml: 30, price: { fa: 12800000, en: 225 } },
      { ml: 50, price: { fa: 18400000, en: 320 } },
      { ml: 100, price: { fa: 27900000, en: 485 } },
    ],
    scentFamily: 'oriental',
    gender: 'masculine',
    concentration: {
      fa: 'اکستریت د پرفیوم غلیظ',
      en: 'Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['برگ تنباکوی بلوند', 'دانه گشنیز بوداده', 'زنجبیل خشک'],
        en: ['Blond Tobacco Leaves', 'Roasted Coriander', 'Dry Ginger'],
      },
      heart: {
        fa: ['عسل جنگلی شاه بلوط', 'کاکائوی تلخ ونزوئلا', 'لوبیای تونکا'],
        en: ['Chestnut Forest Honey', 'Bittersweet Cacao', 'Tonka Bean'],
      },
      base: {
        fa: ['صمغ وانیل دودی', 'چوب سدر ویرجینیا', 'کهربای طلایی'],
        en: ['Smoked Vanilla Pod', 'Virginia Cedar', 'Golden Amber'],
      },
    },
    images: PRODUCT_IMAGES['tabac-noble'],
    isBestseller: true,
    isNew: false,
    inStock: true,
    stockQuantity: 20,
    popularity: 16100,
    salesCount: 1220,
    createdAt: '2025-10-04',
    rating: 4.94,
    reviewCount: 67,
    longevity: 4.9,
    sillage: 4.7,
  },

  // 15. Iris de Florence (Maison Rayeha - Floral - Feminine)
  {
    id: 'iris-de-florence',
    slug: 'iris-de-florence',
    brand: 'Maison Rayeha',
    name: {
      fa: 'ایریس دو فلورانس',
      en: 'Iris de Florence',
    },
    subtitle: {
      fa: 'اکستریت د پرفیوم پودری - کره زنبق پالادیا و وانیل کرمی',
      en: 'Powdery Haute Extrait – Pallida Orris Butter & Vanilla',
    },
    description: {
      fa: 'نهایت ظرافت و تجمل؛ کره خالص زنبق فلورانسی که شش سال در سایه کهنه شده و با حریری از مشک سفید و هلو پوست‌مخملی آمیخته است.',
      en: 'The pinnacle of understated luxury; six-year aged Florentine iris pallida butter cushioned by velvet peach skin and whisper-soft white musks.',
    },
    price: {
      fa: 14500000,
      en: 250,
    },
    sizes: [
      { ml: 30, price: { fa: 14500000, en: 250 } },
      { ml: 50, price: { fa: 21000000, en: 365 } },
      { ml: 100, price: { fa: 31500000, en: 550 } },
    ],
    scentFamily: 'floral',
    gender: 'feminine',
    concentration: {
      fa: 'اکستریت د پرفیوم پودری',
      en: 'Powdery Extrait de Parfum',
    },
    notes: {
      top: {
        fa: ['هلو سفید وحشی', 'بذر گل ختی', 'نارنگی صورتی'],
        en: ['White Wild Peach', 'Ambrette Seed', 'Pink Mandarin'],
      },
      heart: {
        fa: ['کره زنبق پالادیا فلورانس', 'گل بنفشه پارما', 'گل برف'],
        en: ['Florentine Pallida Orris Butter', 'Parma Violet', 'Lily of the Valley'],
      },
      base: {
        fa: ['مشک پنبه‌ای سفید', 'چوب صندل میسور', 'وانیل ماداگاسکار'],
        en: ['Cotton White Musk', 'Mysore Sandalwood', 'Madagascar Vanilla'],
      },
    },
    images: PRODUCT_IMAGES['iris-de-florence'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 15,
    popularity: 12100,
    salesCount: 710,
    createdAt: '2026-08-05',
    rating: 4.97,
    reviewCount: 39,
    longevity: 4.7,
    sillage: 4.3,
  },

  // 16. Cèdre de l’Atlas (Atelier Qajar - Woody - Masculine)
  {
    id: 'cedre-de-latlas',
    slug: 'cedre-de-latlas',
    brand: 'Atelier Qajar',
    name: {
      fa: 'سدر د لاتلاس',
      en: 'Cèdre de l’Atlas',
    },
    subtitle: {
      fa: 'او د پرفیوم چوبی خشک - صمغ درخت سرو و وتیور خاکی',
      en: 'Dry Cedar Eau de Parfum – Atlas Resin & Earthy Roots',
    },
    description: {
      fa: 'ابهت کوهستان با چوب‌های خشک و صمغی سدر اطلس؛ لایه‌بندی شده با دانه‌های هل سبز و عطر خاک باران‌خورده پاییز.',
      en: 'A statuesque woody profile evoking high mountain forest air; aromatic Atlas cedar needles, petrichor, and warm crushed spice.',
    },
    price: {
      fa: 10200000,
      en: 180,
    },
    sizes: [
      { ml: 30, price: { fa: 10200000, en: 180 } },
      { ml: 50, price: { fa: 14900000, en: 260 } },
      { ml: 100, price: { fa: 21900000, en: 380 } },
    ],
    scentFamily: 'woody',
    gender: 'masculine',
    concentration: {
      fa: 'او د پرفیوم',
      en: 'Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['برگ سوزنی سدر', 'هل سبز', 'ترنج خشک'],
        en: ['Cedar Needles', 'Green Cardamom', 'Dried Bergamot'],
      },
      heart: {
        fa: ['چوب سدر کهن اطلس', 'صمغ گالبانوم ایرانی', 'میوه کاج'],
        en: ['Aged Atlas Cedar', 'Persian Galbanum Resin', 'Juniper Cones'],
      },
      base: {
        fa: ['وتیور هائیتی', 'خزه بلوط', 'عنبر خاکی'],
        en: ['Haitian Vetiver', 'Forest Oakmoss', 'Earthy Amber'],
      },
    },
    images: PRODUCT_IMAGES['cedre-de-latlas'],
    isBestseller: false,
    isNew: false,
    inStock: false,
    stockQuantity: 0,
    popularity: 8600,
    salesCount: 370,
    createdAt: '2026-02-28',
    rating: 4.83,
    reviewCount: 31,
    longevity: 4.6,
    sillage: 4.4,
  },

  // 17. Mandarine Solaire (Darvazeh Botanicals - Citrus - Feminine)
  {
    id: 'mandarine-solaire',
    slug: 'mandarine-solaire',
    brand: 'Darvazeh Botanicals',
    name: {
      fa: 'ماندارین سولر',
      en: 'Mandarine Solaire',
    },
    subtitle: {
      fa: 'او د پرفیوم آفتابی - نارنگی سرخ سیسیلی و زردآلوی طلایی',
      en: 'Solar Citrus – Red Sicilian Mandarin & Golden Apricot',
    },
    description: {
      fa: 'شیرینی شاداب و تابستانی نارنگی سرخ آبدار در همراهی با گلابی وحشی، زردآلوی رسیده و نسیم گرم چوب صندل.',
      en: 'A joyous burst of golden Mediterranean sunshine; succulent red mandarin, sun-ripened apricot nectar, and solar musk.',
    },
    price: {
      fa: 9800000,
      en: 170,
    },
    sizes: [
      { ml: 30, price: { fa: 9800000, en: 170 } },
      { ml: 50, price: { fa: 14200000, en: 250 } },
      { ml: 100, price: { fa: 20800000, en: 365 } },
    ],
    scentFamily: 'citrus',
    gender: 'feminine',
    concentration: {
      fa: 'او د پرفیوم',
      en: 'Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['نارنگی سرخ سیسیلی', 'پوست گریپ‌فروت', 'برگ نعناع'],
        en: ['Red Sicilian Mandarin', 'Grapefruit Zest', 'Mint Sprig'],
      },
      heart: {
        fa: ['شهد زردآلوی طلایی', 'گل بهارنارنج', 'پئونی صورتی'],
        en: ['Golden Apricot Nectar', 'Orange Blossom', 'Pink Peony'],
      },
      base: {
        fa: ['مشک آفتابی', 'سدر سفید روشن', 'وانیل ملایم'],
        en: ['Solar White Musk', 'Light Cedar', 'Gentle Vanilla'],
      },
    },
    images: PRODUCT_IMAGES['mandarine-solaire'],
    isBestseller: false,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    popularity: 12800,
    salesCount: 750,
    createdAt: '2026-09-12',
    rating: 4.84,
    reviewCount: 26,
    longevity: 4.3,
    sillage: 4.1,
  },

  // 18. Aqua Kashan (L’Élixir d’Ispahan - Fresh - Unisex)
  {
    id: 'aqua-kashan',
    slug: 'aqua-kashan',
    brand: 'L’Élixir d’Ispahan',
    name: {
      fa: 'آکوا کاشان',
      en: 'Aqua Kashan',
    },
    subtitle: {
      fa: 'او د پرفیوم خنک و اشرافی - گلاب دوآتشه و ریحان بنفش',
      en: 'Aristocratic Aquatic – Double-distilled Rosewater & Opal Basil',
    },
    description: {
      fa: 'خنکای فواره‌های مرمرین در میان گرمای کویر؛ تلفیق شاهکار گلاب دوآتشه کاشان با برگ‌های خنک ریحان بنفش و خیار پوست‌کنده.',
      en: 'A serene sanctuary of marble fountain waters in the desert; double-distilled Kashan rosewater with purple basil and crisp cucumber rind.',
    },
    price: {
      fa: 10400000,
      en: 180,
    },
    sizes: [
      { ml: 30, price: { fa: 10400000, en: 180 } },
      { ml: 50, price: { fa: 15200000, en: 265 } },
      { ml: 100, price: { fa: 22400000, en: 390 } },
    ],
    scentFamily: 'fresh',
    gender: 'unisex',
    concentration: {
      fa: 'او د پرفیوم نیش',
      en: 'Niche Eau de Parfum',
    },
    notes: {
      top: {
        fa: ['برگ ریحان بنفش', 'خیار سبز آبدار', 'ترنج ایتالیایی'],
        en: ['Purple Opal Basil', 'Dewy Cucumber', 'Italian Bergamot'],
      },
      heart: {
        fa: ['گلاب دوآتشه کاشان', 'نیلوفر آبی صیقلی', 'چای سبز ژاپنی'],
        en: ['Kashan Double Rosewater', 'Water Lily', 'Japanese Green Tea'],
      },
      base: {
        fa: ['مشک شفاف دریایی', 'چوب سدر مرطوب', 'عنبر کریستالی'],
        en: ['Marine White Musk', 'Driftwood Cedar', 'Crystalline Amber'],
      },
    },
    images: PRODUCT_IMAGES['aqua-kashan'],
    isBestseller: true,
    isNew: true,
    inStock: true,
    stockQuantity: 20,
    discountPercent: 10,
    popularity: 14700,
    salesCount: 1080,
    createdAt: '2026-08-30',
    rating: 4.9,
    reviewCount: 48,
    longevity: 4.4,
    sillage: 4.2,
  },
];

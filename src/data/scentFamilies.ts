import { ScentFamily } from '../types';
import { SCENT_FAMILY_IMAGES } from './images';

/* Real brand asset placeholder: Replace image references in images.ts with curated ingredient photography */
export const scentFamilies: ScentFamily[] = [
  {
    id: 'floral',
    name: {
      fa: 'خانواده گلی (Floral)',
      en: 'Floral Family',
    },
    tagline: {
      fa: 'لطافت رمانتیک و جاودان گل‌های نیش',
      en: 'Romantic, velvety poetry of timeless blossoms',
    },
    description: {
      fa: 'ترکیباتی غنی از رز دمشقی، یاس رازقی، زنبق فلورانس و شکوفه‌های سپید که نوری دلپذیر به شخصیت شما می‌بخشند.',
      en: 'Lush extracts of damask rose, night-blooming jasmine, orris root, and neroli that envelope you in an unforgettable embrace.',
    },
    characteristicNotes: {
      fa: ['رز دمشقی', 'یاس سفید', 'زنبق زرد', 'بهارنارنج', 'پائونیا'],
      en: ['Damask Rose', 'White Jasmine', 'Florentine Orris', 'Neroli', 'Silk Peony'],
    },
    image: SCENT_FAMILY_IMAGES.floral,
  },
  {
    id: 'woody',
    name: {
      fa: 'خانواده چوبی (Woody)',
      en: 'Woody Family',
    },
    tagline: {
      fa: 'گرما، اقتدار و وقار جنگل‌های باستانی',
      en: 'Earthy warmth, strength, and quiet meditative depth',
    },
    description: {
      fa: 'آکوردهای استوار چوب صندل میسور، سدر اطلس، پچولی خاکی و خس‌خس که حضوری مقتدر و پایدار خلق می‌کنند.',
      en: 'Noble chords of aged Mysore sandalwood, Virginia cedar, smoky patchouli, and earthy roots rooted in quiet confidence.',
    },
    characteristicNotes: {
      fa: ['صندل میسور', 'سدر اطلس', 'پچولی کهن', 'چوب گایاک', 'خزه بلوط'],
      en: ['Mysore Sandalwood', 'Atlas Cedar', 'Aged Patchouli', 'Guaiacwood', 'Oakmoss'],
    },
    image: SCENT_FAMILY_IMAGES.woody,
  },
  {
    id: 'oriental',
    name: {
      fa: 'خانواده شرقی (Oriental)',
      en: 'Oriental Family',
    },
    tagline: {
      fa: 'سحرانگیز، گرم، دودی و بی‌نهایت اغواگر',
      en: 'Intoxicating, resinous, warm, and deeply enigmatic',
    },
    description: {
      fa: 'رقص کهربای زرین، عود سلطنتی کامبوج، صمغ کندر و وانیل دودی برای لحظاتی خاطره‌انگیز و رد بویی پر ابهت.',
      en: 'Golden amber tears, wild agarwood, frankincense, and bourbon vanilla creating an opulent, head-turning sillage.',
    },
    characteristicNotes: {
      fa: ['عود کامبوج', 'عنبر زرین', 'بنزوئین سیام', 'زعفران قائنات', 'وانیل بوربون'],
      en: ['Cambodian Oud', 'Golden Amber', 'Siam Benzoin', 'Persian Saffron', 'Bourbon Vanilla'],
    },
    image: SCENT_FAMILY_IMAGES.oriental,
  },
  {
    id: 'fresh',
    name: {
      fa: 'خانواده خنک و باطراوت (Fresh)',
      en: 'Fresh Family',
    },
    tagline: {
      fa: 'نسیم زلال کوهستان و امواج تمیز اقیانوسی',
      en: 'Crystalline mountain air and crisp oceanic tranquility',
    },
    description: {
      fa: 'آمیزه‌ای با طراوت از نمک دریا، چای سفید، مریم‌گلی کوهی و وتیور شفاف که حسی از انرژی بی‌پایان و پاکی خالص می‌آفریند.',
      en: 'Aerated accords of sea salt, mountain clary sage, white tea, and crisp vetiver roots bringing revitalizing serenity.',
    },
    characteristicNotes: {
      fa: ['نمک دریایی', 'وتیور هائیتی', 'مریم‌گلی', 'چای سفید', 'برگ نعناع'],
      en: ['Sea Salt Accord', 'Haitian Vetiver', 'Clary Sage', 'White Tea', 'Crisp Mint'],
    },
    image: SCENT_FAMILY_IMAGES.fresh,
  },
  {
    id: 'citrus',
    name: {
      fa: 'خانواده مرکباتی (Citrus)',
      en: 'Citrus Family',
    },
    tagline: {
      fa: 'درخشش آفتاب مدیترانه و نشاط ترنج و پرتقال تلخ',
      en: 'Sun-drenched Mediterranean sparkle and radiant zest',
    },
    description: {
      fa: 'اسانس‌های فشرده سرد ترنج کالابریا، لیمو امالفی و گریپ‌فروت سرخ که شروعی پرشور و سرزنده پدید می‌آورند.',
      en: 'Cold-pressed zests of bergamot, Amalfi lemon rind, and blood orange balanced by subtle floral undertones.',
    },
    characteristicNotes: {
      fa: ['ترنج کالابریا', 'لیمو ترش امالفی', 'شکوفه پرتقال', 'گریپ‌فروت', 'پتی‌گرین'],
      en: ['Calabrian Bergamot', 'Amalfi Lemon', 'Orange Blossom', 'Pink Grapefruit', 'Petitgrain'],
    },
    image: SCENT_FAMILY_IMAGES.citrus,
  },
];

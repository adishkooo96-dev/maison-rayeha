import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface LocalizedString {
  fa: string;
  en: string;
}

export interface ValueItem {
  title: LocalizedString;
  description: LocalizedString;
}

export interface AboutContent {
  heroHeadline: LocalizedString;
  heroSubtext: LocalizedString;
  storyText: LocalizedString;
  valuesTitle: LocalizedString;
  values: ValueItem[];
}

export interface ContactContent {
  address: LocalizedString;
  phone: string;
  email: string;
  workingHours: LocalizedString;
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroHeadline: {
    fa: 'جاودانگی در هر قطره، وقار در هر نت',
    en: 'Eternity in Every Drop, Distinction in Every Chord',
  },
  heroSubtext: {
    fa: 'ما عطر را نه به عنوان یک بوی گذرا، بلکه به عنوان والاترین جلوه هویت، خاطره و احساس ناب بشری خلق می‌کنیم.',
    en: 'We compose fragrance not as mere scent, but as the deepest intangible portrait of identity, memory, and timeless grace.',
  },
  storyText: {
    fa: 'میسون رایحه بر این باور استوار شد که جهان امروز نیازمند اصالت از دست‌رفته است. در کارگاه‌های تخصصی ما، هر عطر مانند یک قطعه شعر دست‌ساز شکل می‌گیرد. ما با جستجوی وسواس‌گونه در دشت‌های گل سرخ کهن، جنگل‌های کهنسال صندل و مراتع دورافتاده کندر، نایاب‌ترین مواهب طبیعت را بدون هرگونه سازش در خلوص، به عصاره تبدیل می‌کنیم.\n\nفرآیند تقطیر آرام و کهنه‌سازی در دمای کنترل‌شده، اجازه می‌دهد آکوردها با گذر زمان عمق و وقاری پیدا کنند که در تولیدات انبوه دست‌نیافتنی است.',
    en: "Maison Rayeha was founded on the singular conviction that modern perfumery craves forgotten authenticity. In our specialized ateliers, every fragrance takes shape as a handcrafted ode. Through tireless quests across ancient Damask rose valleys, aged sandalwood groves, and remote frankincense plateaus, we transmute nature's rarest gifts into extraits without compromise.\n\nSlow, patient cold distillation and cellar maturation allow every chord to develop an atmospheric depth impossible in mass-market production.",
  },
  valuesTitle: {
    fa: 'ارزش‌هایی که به آنها وفاداریم',
    en: 'Values That Guide Our Hand',
  },
  values: [
    {
      title: {
        fa: 'استادی و مهارت دست‌ساز',
        en: 'Artisanal Mastery',
      },
      description: {
        fa: 'هر بطری با دست پر شده، پلمپ طلایی شده و با امضای انحصاری استاد عطرساز به دست شما می‌رسد.',
        en: 'Every flacon is hand-filled, wax-sealed, and individually numbered with a master perfumer’s provenance card.',
      },
    },
    {
      title: {
        fa: 'نادرترین عصاره‌های جهان',
        en: 'Noble Rare Botanicals',
      },
      description: {
        fa: 'استفاده انحصاری از رز دمشق، عود طبیعی کهن، زعفران سوپرنگین و صندل سلطنتی در بالاترین غلظت اکستریت.',
        en: 'Uncompromising use of Damask rose harvests, aged natural oud, select saffron filaments, and royal mysore sandalwood.',
      },
    },
    {
      title: {
        fa: 'پایداری و احترام به زمین',
        en: 'Conscious Stewardship',
      },
      description: {
        fa: 'برداشت مسئولانه، بطری‌های کریستال قابل بازیافت و بسته‌بندی‌های کاملاً زیست‌تجزیه‌پذیر بدون پلاستیک.',
        en: 'Ethical harvesting partnerships, recyclable crystal flacons, and 100% plastic-free biodegradable presentation boxes.',
      },
    },
    {
      title: {
        fa: 'اصالت و شفافیت مطلق',
        en: 'Uncompromised Authenticity',
      },
      description: {
        fa: 'هر قطره عطر دارای برگه آزمایشگاه و شناسنامه دیجیتال اصالت است تا از اصالت کیفی آن مطمئن باشید.',
        en: 'Every bottle carries a verifiable certificate of origin, batch formulation date, and laboratory authenticity seal.',
      },
    },
  ],
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  address: {
    fa: 'تهران، خیابان ولیعصر، زعفرانیه، پلاک ۲۴، گالری سلطنتی میسون رایحه',
    en: '24 Zaferanieh Ave, Suite 4B, Tehran & 18 Rue de la Paix, 75002 Paris',
  },
  phone: '۰۲۱-۲۲۰۰۰۰۰۰',
  email: 'concierge@maisonrayeha.com',
  workingHours: {
    fa: 'شنبه تا پنج‌شنبه: ۱۰:۰۰ الی ۲۰:۰۰ (جمعه‌ها با هماهنگی قبلی)',
    en: 'Mon – Sat: 10:00 – 20:00 (Sundays by prior appointment)',
  },
};

export function mergeAboutContent(raw?: any): AboutContent {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_ABOUT_CONTENT;
  }

  const values: ValueItem[] = Array.isArray(raw.values) && raw.values.length > 0
    ? raw.values.map((v: any, idx: number) => {
        const def = DEFAULT_ABOUT_CONTENT.values[idx] || {
          title: { fa: '', en: '' },
          description: { fa: '', en: '' },
        };
        return {
          title: {
            fa: typeof v?.title?.fa === 'string' && v.title.fa.trim() ? v.title.fa.trim() : def.title.fa,
            en: typeof v?.title?.en === 'string' && v.title.en.trim() ? v.title.en.trim() : def.title.en,
          },
          description: {
            fa: typeof v?.description?.fa === 'string' && v.description.fa.trim() ? v.description.fa.trim() : def.description.fa,
            en: typeof v?.description?.en === 'string' && v.description.en.trim() ? v.description.en.trim() : def.description.en,
          },
        };
      })
    : DEFAULT_ABOUT_CONTENT.values;

  return {
    heroHeadline: {
      fa: typeof raw.heroHeadline?.fa === 'string' && raw.heroHeadline.fa.trim()
        ? raw.heroHeadline.fa.trim()
        : DEFAULT_ABOUT_CONTENT.heroHeadline.fa,
      en: typeof raw.heroHeadline?.en === 'string' && raw.heroHeadline.en.trim()
        ? raw.heroHeadline.en.trim()
        : DEFAULT_ABOUT_CONTENT.heroHeadline.en,
    },
    heroSubtext: {
      fa: typeof raw.heroSubtext?.fa === 'string' && raw.heroSubtext.fa.trim()
        ? raw.heroSubtext.fa.trim()
        : DEFAULT_ABOUT_CONTENT.heroSubtext.fa,
      en: typeof raw.heroSubtext?.en === 'string' && raw.heroSubtext.en.trim()
        ? raw.heroSubtext.en.trim()
        : DEFAULT_ABOUT_CONTENT.heroSubtext.en,
    },
    storyText: {
      fa: typeof raw.storyText?.fa === 'string' && raw.storyText.fa.trim()
        ? raw.storyText.fa.trim()
        : DEFAULT_ABOUT_CONTENT.storyText.fa,
      en: typeof raw.storyText?.en === 'string' && raw.storyText.en.trim()
        ? raw.storyText.en.trim()
        : DEFAULT_ABOUT_CONTENT.storyText.en,
    },
    valuesTitle: {
      fa: typeof raw.valuesTitle?.fa === 'string' && raw.valuesTitle.fa.trim()
        ? raw.valuesTitle.fa.trim()
        : DEFAULT_ABOUT_CONTENT.valuesTitle.fa,
      en: typeof raw.valuesTitle?.en === 'string' && raw.valuesTitle.en.trim()
        ? raw.valuesTitle.en.trim()
        : DEFAULT_ABOUT_CONTENT.valuesTitle.en,
    },
    values,
  };
}

export function mergeContactContent(raw?: any): ContactContent {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_CONTACT_CONTENT;
  }

  return {
    address: {
      fa: typeof raw.address?.fa === 'string' && raw.address.fa.trim()
        ? raw.address.fa.trim()
        : DEFAULT_CONTACT_CONTENT.address.fa,
      en: typeof raw.address?.en === 'string' && raw.address.en.trim()
        ? raw.address.en.trim()
        : DEFAULT_CONTACT_CONTENT.address.en,
    },
    phone: typeof raw.phone === 'string' && raw.phone.trim()
      ? raw.phone.trim()
      : DEFAULT_CONTACT_CONTENT.phone,
    email: typeof raw.email === 'string' && raw.email.trim()
      ? raw.email.trim()
      : DEFAULT_CONTACT_CONTENT.email,
    workingHours: {
      fa: typeof raw.workingHours?.fa === 'string' && raw.workingHours.fa.trim()
        ? raw.workingHours.fa.trim()
        : DEFAULT_CONTACT_CONTENT.workingHours.fa,
      en: typeof raw.workingHours?.en === 'string' && raw.workingHours.en.trim()
        ? raw.workingHours.en.trim()
        : DEFAULT_CONTACT_CONTENT.workingHours.en,
    },
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const docRef = doc(db, 'siteContent', 'about');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEFAULT_ABOUT_CONTENT;
    }
    return mergeAboutContent(snap.data());
  } catch (err) {
    console.warn('[contentApi] Failed to load siteContent/about from Firestore, using fallback:', err);
    return DEFAULT_ABOUT_CONTENT;
  }
}

export async function getContactContent(): Promise<ContactContent> {
  try {
    const docRef = doc(db, 'siteContent', 'contact');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEFAULT_CONTACT_CONTENT;
    }
    return mergeContactContent(snap.data());
  } catch (err) {
    console.warn('[contentApi] Failed to load siteContent/contact from Firestore, using fallback:', err);
    return DEFAULT_CONTACT_CONTENT;
  }
}

export async function saveAboutContent(data: AboutContent): Promise<void> {
  const docRef = doc(db, 'siteContent', 'about');
  await setDoc(docRef, data, { merge: true });
}

export async function saveContactContent(data: {
  address: { fa: string; en: string };
  phone: string;
  email: string;
  workingHours: { fa: string; en: string };
}): Promise<void> {
  const docRef = doc(db, 'siteContent', 'contact');
  await setDoc(
    docRef,
    {
      address: {
        fa: (data.address?.fa || '').trim(),
        en: (data.address?.en || '').trim(),
      },
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      workingHours: {
        fa: (data.workingHours?.fa || '').trim(),
        en: (data.workingHours?.en || '').trim(),
      },
    },
    { merge: true }
  );
}

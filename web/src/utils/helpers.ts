import { differenceInMinutes, sub, format } from 'date-fns';

export function getFirstTwoSentences(str: string) {
  const sentences = str.split(/\.|\?|!/);
  return sentences.slice(0, 2).join('. ') + '.';
}

export function renderAgo(date: Date) {
  const dateMinus2Hours = sub(date, { hours: 2 });
  const minutes = differenceInMinutes(new Date(), dateMinus2Hours);

  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)} h`;
  } else if (minutes < 60 * 24 * 2) {
    return `Yesterday`;
  } else {
    return format(date, `d MMMM, HH:mm`);
  }
}

export function isAllowedAdminUserId(userId: string) {
  return [
    'user_2URfAQaMVqvIi0lWfkVoEkK97qz',
    'user_2UNVeD1ZI8CTqInfzVfzrfYL0K7',
  ].includes(userId);
}

interface LanguageProps {
  name: string;
  slogan: string;
  mostRead: string;
  rtl?: boolean;
}

export const languages: Record<string, LanguageProps> = {
  en: {
    name: 'English',
    slogan: 'Swedish news in English',
    mostRead: 'Most read',
  },
  fi: {
    name: 'Finnish',
    slogan: 'Ruotsin uutisia suomeksi',
    mostRead: 'Luetuimmat',
  },
  ar: {
    name: 'Arabic',
    slogan: 'الأخبار السويدية باللغة العربية',
    rtl: true,
    mostRead: 'الأكثر قراءة',
  },
  ru: {
    name: 'Russian',
    slogan: 'Шведские новости на русском языке',
    mostRead: 'самый читаемый',
  },
  uk: {
    name: 'Ukrainian',
    slogan: 'Шведські новини українською',
    mostRead: 'найчитаніший',
  },
  ckb: {
    name: 'Kurdish',
    slogan: 'هەواڵی سویدی بە زمانی کوردی',
    rtl: true,
    mostRead: 'زۆربەیان دەخوێننەوە',
  },
  fa: {
    name: 'Persian',
    slogan: 'اخبار سوئدی به زبان فارسی',
    rtl: true,
    mostRead: 'بیشترین خوانده شده',
  },
  so: {
    name: 'Somali',
    slogan: 'Wararka Swedishka ee Soomaaliga',
    mostRead: 'inta badan akhriska',
  },
  // es: {
  //   name: 'Spanish',
  //   slogan: 'Noticias suecas en español',
  // },
  // de: {
  //   name: 'German',
  //   slogan: 'Schwedische Nachrichten auf Deutsch',
  // },
  // fr: {
  //   name: 'French',
  //   slogan: 'Actualités suédoises en français',
  // },
};

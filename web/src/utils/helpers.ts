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

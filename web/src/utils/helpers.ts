import { differenceInMinutes, format } from 'date-fns';
import { sv } from 'date-fns/locale';

export function getFirstTwoSentences(str: string) {
  const sentences = str.split(/\.|\?|!/);
  return sentences.slice(0, 2).join('. ') + '.';
}

export function renderAgo(date: Date) {
  console.log('in render ago');
  console.log(date);
  console.log('');

  const minutes = differenceInMinutes(new Date(), date);

  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)} tim`;
  } else if (minutes < 60 * 24 * 2) {
    return `Igår`;
  } else {
    return format(date, 'd MMMM, HH:mm', {
      locale: sv,
    });
  }
}

export function getFirstTwoSentences(str: string) {
  const sentences = str.split(/\.|\?|!/);
  return sentences.slice(0, 2).join(". ") + ".";
}

/*
 * Vocabulary and phrase dataset for the application.
 * Each entry contains the French expression, its English translation, an approximate IPA transcription,
 * a part of speech indicator and a difficulty level used for spaced repetition scheduling.
 * This is a small sample to illustrate functionality; you can extend this list or load from an external source.
 */

const vocabularyData = [
  {
    id: 1,
    fr: 'Bonjour',
    en: 'Hello',
    ipa: 'bɔ̃.ʒuʁ',
    type: 'greeting',
    difficulty: 1
  },
  {
    id: 2,
    fr: 'Merci',
    en: 'Thank you',
    ipa: 'mɛʁ.si',
    type: 'polite',
    difficulty: 1
  },
  {
    id: 3,
    fr: 'Je m’appelle',
    en: 'My name is',
    ipa: 'ʒə ma.pɛl',
    type: 'phrase',
    difficulty: 1
  },
  {
    id: 4,
    fr: 'Comment ça va?',
    en: 'How are you?',
    ipa: 'kɔ.mɑ̃ sa va',
    type: 'question',
    difficulty: 1
  },
  {
    id: 5,
    fr: 'J’aime le fromage',
    en: 'I like cheese',
    ipa: 'ʒɛm lə fʁɔ.maʒ',
    type: 'sentence',
    difficulty: 1
  },
  {
    id: 6,
    fr: 'Un chat',
    en: 'A cat',
    ipa: 'ɛ̃ ʃa',
    type: 'noun',
    difficulty: 1
  },
  {
    id: 7,
    fr: 'Un chien',
    en: 'A dog',
    ipa: 'ɛ̃ ʃjɛ̃',
    type: 'noun',
    difficulty: 1
  },
  {
    id: 8,
    fr: 'Je voudrais un café',
    en: 'I would like a coffee',
    ipa: 'ʒə vu.dʁɛ ɛ̃ ka.fe',
    type: 'sentence',
    difficulty: 2
  },
  {
    id: 9,
    fr: 'Où sont les toilettes?',
    en: 'Where are the toilets?',
    ipa: 'u sɔ̃ le twa.lɛt',
    type: 'question',
    difficulty: 2
  },
  {
    id: 10,
    fr: 'Je ne comprends pas',
    en: 'I don’t understand',
    ipa: 'ʒə nə kɔ̃.pʁɑ̃ pa',
    type: 'phrase',
    difficulty: 2
  }
];

/**
 * Retrieves the next set of items for the daily list based on spaced repetition.
 * Items with lower scores (less well learned) are prioritized.
 * For simplicity, this function sorts by difficulty and cycles through the dataset.
 * In a more sophisticated implementation, you could store review dates in localStorage and schedule accordingly.
 */
function getDailyList(count = 5) {
  // Sort by difficulty ascending; break ties randomly
  const sorted = [...vocabularyData].sort((a, b) => {
    if (a.difficulty === b.difficulty) {
      return Math.random() - 0.5;
    }
    return a.difficulty - b.difficulty;
  });
  return sorted.slice(0, count);
}
import translationsData from './translations.json';

// טעינת המילון מהקובץ JSON
const translations: Record<string, string> = translationsData as Record<string, string>;

/**
 * מחזיר תרגום עברי למילה באנגלית
 * @param word - המילה באנגלית
 * @returns התרגום בעברית, או null אם לא נמצא
 */
export function getTranslation(word: string): string | null {
  if (!word) return null;
  
  const wordLower = word.toLowerCase().trim();
  
  // נסה למצוא תרגום ישיר
  if (translations[wordLower]) {
    return translations[wordLower];
  }
  
  // נסה למצוא תרגום עם רווחים (למשל "ice cream")
  const wordsWithSpaces = Object.keys(translations).filter(key => key.includes(' '));
  for (const key of wordsWithSpaces) {
    if (wordLower.includes(key)) {
      return translations[key];
    }
  }
  
  return null;
}

/**
 * מחזיר את כל המילון
 */
export function getAllTranslations(): Record<string, string> {
  return translations;
}

/**
 * בודק אם מילה קיימת במילון
 */
export function hasTranslation(word: string): boolean {
  if (!word) return false;
  const wordLower = word.toLowerCase().trim();
  return wordLower in translations;
}

/**
 * מחזיר תרגום או ערך ברירת מחדל
 */
export function getTranslationOrDefault(word: string, defaultValue: string = 'לא ידוע'): string {
  const translation = getTranslation(word);
  return translation || defaultValue;
}

/**
 * מחפש תרגום קודם במילון מקומי, ואם לא נמצא - במילון המרכזי
 * @param word - המילה באנגלית
 * @param localDictionary - מילון מקומי (אופציונלי)
 * @param defaultValue - ערך ברירת מחדל אם לא נמצא תרגום
 * @returns התרגום בעברית
 */
export function getTranslationWithFallback(
  word: string, 
  localDictionary?: Record<string, string>,
  defaultValue: string = 'לא ידוע'
): string {
  if (!word) return defaultValue;
  
  const wordLower = word.toLowerCase().trim();
  
  // קודם כל, נסה למצוא במילון המקומי
  if (localDictionary && localDictionary[wordLower]) {
    return localDictionary[wordLower];
  }
  
  // אם לא נמצא במילון המקומי, נסה במילון המרכזי
  const centralTranslation = getTranslation(wordLower);
  if (centralTranslation) {
    return centralTranslation;
  }
  
  // אם לא נמצא בשום מקום, החזר ערך ברירת מחדל
  return defaultValue;
}


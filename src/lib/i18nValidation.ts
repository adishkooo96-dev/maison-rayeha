import faTranslations from '../locales/fa.json';
import enTranslations from '../locales/en.json';

/**
 * Validates key symmetry between fa.json and en.json.
 * Returns an array of error messages if any keys or structures mismatch.
 */
export function validateTranslationSymmetry(): string[] {
  const errors: string[] = [];

  function compareKeys(obj1: Record<string, any>, obj2: Record<string, any>, prefix: string, label1: string, label2: string) {
    for (const key of Object.keys(obj1)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (!(key in obj2)) {
        errors.push(`Missing key in ${label2}: ${fullPath}`);
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        if (typeof obj2[key] !== 'object' || obj2[key] === null) {
          errors.push(`Type mismatch at ${fullPath}: ${label1} is object, ${label2} is ${typeof obj2[key]}`);
        } else {
          compareKeys(obj1[key], obj2[key], fullPath, label1, label2);
        }
      }
    }
  }

  compareKeys(faTranslations, enTranslations, '', 'fa.json', 'en.json');
  compareKeys(enTranslations, faTranslations, '', 'en.json', 'fa.json');

  return [...new Set(errors)];
}

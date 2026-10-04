import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const faPath = path.resolve(__dirname, '../src/locales/fa.json');
const enPath = path.resolve(__dirname, '../src/locales/en.json');

const fa = JSON.parse(fs.readFileSync(faPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

function getFlattenedKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getFlattenedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const faKeys = new Set(getFlattenedKeys(fa));
const enKeys = new Set(getFlattenedKeys(en));

const missingInEn = [...faKeys].filter(k => !enKeys.has(k));
const missingInFa = [...enKeys].filter(k => !faKeys.has(k));

console.log(`Total fa keys: ${faKeys.size}`);
console.log(`Total en keys: ${enKeys.size}`);

if (missingInEn.length === 0 && missingInFa.length === 0) {
  console.log('✓ 100% key parity! fa.json and en.json have identical key structures.');
  process.exit(0);
} else {
  if (missingInEn.length > 0) {
    console.error('Keys present in fa.json but missing in en.json:', missingInEn);
  }
  if (missingInFa.length > 0) {
    console.error('Keys present in en.json but missing in fa.json:', missingInFa);
  }
  process.exit(1);
}

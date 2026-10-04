/**
 * ============================================================================
 * Maison Rayeha Haute Parfumerie - Central Imagery Registry
 *
 * NOTE: Replace with real brand photography when available.
 *
 * Aesthetic Guidelines for all placeholders:
 * - Strictly fine fragrance glass flacons, perfume distillations, or noble raw botanicals.
 * - Strictly NO cosmetics, skincare tubes, face creams, or people's faces.
 * - Strictly NO visible text, third-party logos, or brand labels.
 * - Deep, moody, warm chiaroscuro lighting on dark or neutral obsidian/slate surfaces.
 * ============================================================================
 */

import heroPerfumeFlaconLocal from '../assets/images/hero_perfume_bottle_1789982325599.jpg';
import atelierPerfumeFlaconLocal from '../assets/images/atelier_perfume_1789982338394.jpg';

/**
 * 1. Hero Section Imagery
 * An opulent, minimalist crystal perfume flacon with warm amber liquid on dark obsidian stone,
 * with dramatic chiaroscuro backlighting, atmospheric mist, and zero visible brand labels or text.
 */
export const HERO_BACKGROUND_IMAGE = heroPerfumeFlaconLocal;

/**
 * High-resolution CDN fallback for Hero (if external URL is ever required)
 */
export const HERO_BACKGROUND_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=85';

/**
 * 2. Brand Story / Haute Atelier Imagery
 * Capturing master perfumery craftsmanship, vintage flacons, and precious harvests.
 */
export const BRAND_STORY_IMAGES = {
  // Primary: Artisanal fragrance distillation atelier with crystal flacons and apothecary glassware
  primary: atelierPerfumeFlaconLocal,
  // Secondary: Dark fluted amber extrait de parfum flacon on aged wood
  secondary:
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
};

/**
 * 3. Featured Collection Campaign Imagery
 * Each collection features noble glass flacons in architectural, moody settings.
 */
export const COLLECTION_IMAGES = {
  oudHeritage:
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
  botanicalNocturne:
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
  mediterraneanWhispers:
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85',
};

/**
 * 4. Scent Family Olfactory Mood Imagery
 * Highlighting pure natural ingredients and evocative atmospheres without cosmetics or text.
 */
export const SCENT_FAMILY_IMAGES = {
  floral:
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80', // Persian Damascena rose petals
  woody:
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80', // Misty ancient cedar forest
  oriental:
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', // Dark amber extrait flacon with golden glow
  fresh:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Pure crystalline marine breeze
  citrus:
    'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=800&q=80', // Sun-drenched Mediterranean citrus grove
};

/**
 * 5. Product Catalog Flacon Photography Placeholders
 * Curated pairings of primary bottle shots and secondary atmospheric angles for every fragrance.
 * All images are strictly luxury fine fragrance flacons with no third-party branding or skincare tubes.
 */
export const PRODUCT_IMAGES: Record<string, string[]> = {
  'oud-nocturne': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
  ],
  'rose-de-shiraz': [
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
  ],
  'santal-celeste': [
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
  ],
  'ambre-imperial': [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  ],
  'fleur-de-safran': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
  ],
  'vetiver-mineral': [
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
  ],
  'cuir-de-perse': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  ],
  'citrus-ethere': [
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80',
  ],
  'jasmin-dispahan': [
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
  ],
  'bois-fume': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
  ],
  'neroli-royale': [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  ],
  'encens-sacre': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
  ],
  'brise-dalborz': [
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
  ],
  'tabac-noble': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  ],
  'iris-de-florence': [
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
  ],
  'cedre-de-latlas': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80',
  ],
  'mandarine-solaire': [
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  ],
  'aqua-kashan': [
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
  ],
};

/**
 * Fallback perfume flacon image if any item lacks a specific photo
 */
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80';

# Maison Rayeha | Haute Parfumerie (میسون رایحه)

> An artisanal, bilingual (Persian & English) e-commerce experience for an exclusive niche fragrance house, bridging ancient Persian olfactory heritage with classical French distillation.

---

## 💎 Architectural Highlights

- **Native Bilingual Routing (`/:lang/...`)**: Full URL-driven state where `/:lang` is the single source of truth (`/fa` and `/en`). Direction (`dir="rtl"` / `dir="ltr"`), `lang`, and fonts toggle synchronously with zero page flicker.
- **Strict Logical CSS**: 100% adherence to CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`) ensuring natural layout symmetry across Persian and English without layout hacks.
- **Pure Numeric Formatting**: All numbers and monetary values are stored as raw numeric values and rendered via `Intl.NumberFormat` localized helpers (`formatNumber`, `formatPrice`, `formatPercent`). Digits never hardcode inside strings.
- **Dynamic Zod Validation**: Contact and checkout forms employ schema evaluation at render time, translating validation messages dynamically when switching languages. Includes Persian/Arabic digit normalization (`۰-۹`, `٠-٩` → `0-9`).
- **Code-Splitting & Resilience**: Lazy loading on all routes with branded luxury suspense skeletons and an `ErrorBoundary` fallback.

---

## 🧭 Page Catalog & Routes

| Route | Description |
|---|---|
| `/:lang/` | **Home**: Immersive hero with ambient bottle art, curated bestsellers, scent harmonies, and newsletter. |
| `/:lang/shop` | **Catalog**: Multi-faceted filter system (scent family, notes, concentration, price range), quick-view modal, live search. |
| `/:lang/shop/:slug` | **Product Detail**: High-res flacon imagery with cursor zoom, accord pyramid (top, heart, base notes), size selector, and JSON-LD schema. |
| `/:lang/cart` | **Bag**: Real-time summary, quantity steppers, coupon code validation, and undoable removal toasts. |
| `/:lang/checkout` | **Concierge Checkout**: 3-step luxury checkout (Address with Iran province/city cascades, Shipping tier, Bank gateway/Stripe simulation). |
| `/:lang/order-confirmation` | **Sanctuary Confirmation**: Order certificate with printable receipt, trackable reference number, and delivery schedule. |
| `/:lang/about` | **Brand Story**: Artisanal split narrative, noble ingredients, 3-step creation ritual, and live statistics band. |
| `/:lang/contact` | **Concierge & Salon**: Contact inquiry form, atelier GPS coordinates, hours, and 6-question luxury FAQ accordion. |
| `/:lang/404` | **Branded 404**: Luxury flacon silhouette with live catalog search and salon quick links. |

---

## 🔍 SEO & Metadata Infrastructure

1. **Structured Data (JSON-LD)**:
   - `Organization` + `WebSite` (with `SearchAction`) on the Homepage.
   - `BreadcrumbList` on Shop, Product Detail, About, and Contact pages.
   - Rich `Product` schema with pricing, availability, and rating.
2. **Meta & Social Share Cards**:
   - `react-helmet-async` powered `Seo` component managing `<title>`, `<meta name="description">`, OpenGraph, Twitter Cards, and canonical tags.
   - `hreflang` alternate tags pointing to `/fa`, `/en`, and `x-default`.
   - `noindex, nofollow` on Cart, Checkout, Order Confirmation, and 404 pages.
3. **Search Engine Assets**:
   - `/public/robots.txt`: Explicit crawl permissions and sitemap link.
   - `/public/sitemap.xml`: Complete bilingual URL catalog for all public views and 18 flacons.
   - `/public/site.webmanifest` & `/public/favicon.svg`: Luxury flacon icon with dark theme-color.

### 🌐 Configuring Your Production Custom Domain

When deploying to your live domain (e.g. `https://maisonrayeha.com`):
1. In `src/components/seo/Seo.tsx`, update `DEFAULT_SITE_URL` to your production domain.
2. In `public/robots.txt`, update the `Sitemap:` directive URL.
3. In `public/sitemap.xml`, update the `<loc>` and `<xhtml:link>` domain prefixes.

---

## 🛠️ Development & Tooling Commands

```bash
# Start local development server (Port 3000)
npm run dev

# Run TypeScript linter & type-check
npm run lint

# Production build bundle
npm run build

# Verify 100% key parity between Persian and English locales
node scripts/verify-locales.js
```

---

## 📂 Key Directory Map

```text
├── public/
│   ├── favicon.svg          # Luxury gold flacon vector icon
│   ├── robots.txt           # Search engine crawl rules
│   ├── sitemap.xml          # Multilingual sitemap with hreflang tags
│   └── site.webmanifest     # PWA web manifest
├── scripts/
│   └── verify-locales.js    # Automated symmetry test between fa.json & en.json
├── src/
│   ├── assets/              # Curated fine fragrance bottle imagery
│   ├── components/
│   │   ├── common/          # ErrorBoundary, SuspenseFallback, ScrollToTop, CookieConsent
│   │   ├── home/            # Hero, Bestsellers, ScentFamilies, BrandStory
│   │   ├── layout/          # Header, Footer, Drawer, CartDrawer, Layout
│   │   ├── navigation/      # LocaleLink, LanguageSwitcher
│   │   ├── product/         # ProductCard, OlfactoryPyramid
│   │   ├── seo/             # Reusable Seo and JSON-LD component
│   │   ├── shop/            # ShopFilters, SortDropdown
│   │   └── ui/              # Accordion, Button, Input, Select, Stepper, Toast
│   ├── data/                # Products (18 niche flacons), images, collections
│   ├── hooks/               # useI18n
│   ├── lib/                 # formatters, iranLocations, pricing, i18n
│   ├── locales/             # fa.json & en.json
│   ├── pages/               # AboutPage, ContactPage, NotFoundPage, Shop, etc.
│   └── store/               # Zustand stores for Cart, UI, and Orders
```

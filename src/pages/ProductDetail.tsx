import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Check, ShieldCheck, Truck, Sparkles, Droplets, Clock, Wind, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { products as initialProducts } from '../data/products';
import { getProductBySlug, getAllProducts, subscribeToProducts } from '../lib/productsApi';
import { getSizePrice, getRelatedProducts, getStartingPrice } from '../lib/products';
import { Product } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useCartStore } from '../store/cartStore';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Rating } from '../components/ui/Rating';
import { RadioGroup } from '../components/ui/RadioGroup';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/product/ProductCard';
import { ProductReviews } from '../components/product/ProductReviews';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';

export const ProductDetail: React.FC = () => {
  const { lang, isRTL, t, formatPrice, getLocalized, formatNumber } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const localeNavigate = useLocaleNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(() => {
    return initialProducts.find((p) => p.slug === slug) || null;
  });
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(!product);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      const unsub = subscribeToProducts((productsList) => {
        setAllProducts(productsList);
        const found = productsList.find((p) => p.slug === slug || p.id === slug);
        if (found) {
          setProduct(found);
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [slug]);

  // Selected size state (e.g. '50ml')
  const [selectedSize, setSelectedSize] = useState<string>('50ml');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Localized values
  const productName = product ? (getLocalized(product.name, lang) ?? '') : '';
  const productSubtitle = product ? (getLocalized(product.subtitle, lang) ?? '') : '';
  const productDesc = product ? (getLocalized(product.description, lang) ?? '') : '';
  const productConcentration = product ? (getLocalized(product.concentration, lang) ?? 'Extrait de Parfum') : '';

  // Update default size on product change
  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSize(`${product.sizes[0].ml}ml`);
      setActiveImageIndex(0);
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  // Set document title & SEO
  useEffect(() => {
    if (product) {
      document.title = `${productName} | ${product.brand} | Maison Rayeha`;
    } else {
      document.title = `${t('productDetail.notFoundTitle')} | Maison Rayeha`;
    }
  }, [product, productName, t]);

  if (loading && !product) {
    return (
      <div className="pt-32 pb-24 bg-ivory text-near-black text-center min-h-[60vh] flex items-center justify-center">
        <Container size="md">
          <div className="py-20 px-6 space-y-4">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted font-light">
              {lang === 'fa' ? 'در حال بازیابی اطلاعات اثر...' : 'Loading fragrance composition...'}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 bg-ivory text-near-black text-center">
        <Container size="md">
          <div className="py-20 px-6 border border-border bg-ivory-surface space-y-4 rounded-xs shadow-2xs">
            <Sparkles className="w-10 h-10 stroke-[1.5] text-gold-dark mx-auto" />
            <h1 className="text-2xl font-display font-light text-near-black">
              {t('productDetail.notFoundTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed font-light">
              {t('productDetail.notFoundDesc')}
            </p>
            <div className="pt-4">
              <Button variant="primary" size="md" onClick={() => localeNavigate('/shop')}>
                {t('productDetail.backToShop')}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Price for the selected size
  const currentPrice = getSizePrice(product, selectedSize);

  // Related products
  const relatedProducts = getRelatedProducts(product, allProducts, 4);

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product || product.inStock === false) return;
    const added = addItem(product, selectedSize, quantity);
    if (added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Image zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Radio options for sizes
  const sizeRadioOptions = product.sizes.map((s) => ({
    value: `${s.ml}ml`,
    label: `${s.ml} ml`,
    sublabel: formatPrice(s.price),
  }));

  // Accordion items for description, specs, shipping
  const accordionItems = [
    {
      id: 'description',
      title: t('productDetail.descriptionTab'),
      content: (
        <div className="space-y-3">
          <p>{productDesc}</p>
          <p className="italic text-muted/80">
            {t('productDetail.craftsmanship')}
          </p>
        </div>
      ),
    },
    {
      id: 'profile',
      title: t('productDetail.profileTab'),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Droplets className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
            <span>
              <strong>{t('productDetail.concentration')}:</strong>{' '}
              {productConcentration || 'Extrait de Parfum'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
            <span>
              <strong>{t('productDetail.longevity')}:</strong>{' '}
              {product.longevity
                ? `${formatNumber(product.longevity, { useGrouping: false })} / ${formatNumber(5, { useGrouping: false })}`
                : `${formatNumber(4.8, { useGrouping: false })} / ${formatNumber(5, { useGrouping: false })}`}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Wind className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
            <span>
              <strong>{t('productDetail.sillage')}:</strong>{' '}
              {product.sillage
                ? `${formatNumber(product.sillage, { useGrouping: false })} / ${formatNumber(5, { useGrouping: false })}`
                : `${formatNumber(4.7, { useGrouping: false })} / ${formatNumber(5, { useGrouping: false })}`}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
            <span>
              <strong>{t('productDetail.scentFamily')}:</strong> {t(`filters.${product.scentFamily}`)}
            </span>
          </div>
          <div className="col-span-full pt-2 text-[11px] text-muted border-t border-border/60">
            {t('productDetail.flaconCraft')}
          </div>
        </div>
      ),
    },
    {
      id: 'shipping',
      title: t('productDetail.shippingTab'),
      content: <p>{t('productDetail.shippingContent')}</p>,
    },
  ];

  // Schema.org structured data (JSON-LD)
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: productName,
    image: product.images,
    description: productDesc,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: lang === 'fa' ? 'IRR' : 'USD',
      price: currentPrice,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('productDetail.breadcrumbHome'),
        item: `https://maisonrayeha.com/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('productDetail.breadcrumbShop'),
        item: `https://maisonrayeha.com/${lang}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: productName,
        item: `https://maisonrayeha.com/${lang}/shop/${product.slug}`,
      },
    ],
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      <Seo
        title={`${productName} | ${product.brand}`}
        description={productDesc}
        image={product.images[0]}
        ogType="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <div className="pt-28 pb-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))] lg:pb-24 bg-[var(--bg-page)] text-[var(--text-primary)]">
        <Container size="xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: t('productDetail.breadcrumbHome'), href: '/' },
              { label: t('productDetail.breadcrumbShop'), href: '/shop' },
              {
                label: product.brand,
                href: `/shop?brand=${encodeURIComponent(product.brand)}`,
              },
              { label: productName, isCurrent: true },
            ]}
          />
        </div>

        {/* Product Master View Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 pb-16 border-b border-[var(--border)] text-start">
          {/* Gallery Column (lg: 6 or 7 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
            {/* Main Stage with Zoom Lens */}
            <div
              className="relative aspect-[4/5] bg-[var(--bg-surface-raised)] border-[1.5px] border-gold rounded-[12px] shadow-sm overflow-hidden cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Product Badges */}
              <div className="absolute top-4 start-4 z-10 flex flex-col gap-2 pointer-events-none">
                {product.isBestseller && (
                  <Badge variant="gold">{t('product.bestseller')}</Badge>
                )}
                {product.isNew && (
                  <Badge variant="dark">{t('product.new')}</Badge>
                )}
              </div>

              {/* Standard Image */}
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${productName} - ${product.brand}`}
                width="800"
                height="1000"
                referrerPolicy="no-referrer"
                decoding="async"
                className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                  isZoomed ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Zoomed Lens Layer */}
              {isZoomed && (
                <div
                  className="absolute inset-0 pointer-events-none bg-no-repeat"
                  style={{
                    backgroundImage: `url(${product.images[activeImageIndex] || product.images[0]})`,
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    backgroundSize: '200%',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 shrink-0 bg-ivory-surface border transition-all overflow-hidden cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-gold ring-1 ring-gold'
                        : 'border-border opacity-70 hover:opacity-100 hover:border-gold/60'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${productName} view ${idx + 1}`}
                      loading="lazy"
                      width="80"
                      height="96"
                      referrerPolicy="no-referrer"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info & Purchase Column (lg: 6 or 5 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Brand & Meta */}
              <div className="flex items-center justify-between text-xs text-muted">
                <LocaleLink
                  to={`/shop?brand=${encodeURIComponent(product.brand)}`}
                  className="text-gold-dark uppercase tracking-[0.25em] rtl:tracking-normal font-semibold text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                >
                  <bdi dir="ltr">{product.brand}</bdi>
                </LocaleLink>
                <Badge variant="outline">{t(`product.${product.gender}`)}</Badge>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-normal sm:font-medium rtl:font-extrabold rtl:leading-[1.32] text-near-black">
                  {productName}
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-1 font-light tracking-wide rtl:tracking-normal leading-relaxed rtl:leading-loose">
                  {productSubtitle}
                </p>
              </div>

              {/* Rating */}
              <div className="pt-1">
                <a
                  href="#product-reviews"
                  className="inline-block hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                  aria-label={t('reviews.sectionTitle')}
                >
                  <Rating
                    score={product.rating || 4.9}
                    reviewCount={product.reviewCount || 48}
                    reviewsLabel={t('productDetail.reviewsCount')}
                  />
                </a>
              </div>

              {/* Price Display */}
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-light font-mono text-[var(--text-primary)]">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-light">
                    ({selectedSize} •{' '}
                    {productConcentration || 'Extrait de Parfum'})
                  </span>
                </div>
                {product && !product.inStock && (
                  <p className="mt-2 text-xs font-medium text-rose-500 rtl:font-normal flex items-center gap-1.5 animate-in fade-in duration-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{t('product.unavailableNote')}</span>
                  </p>
                )}
                {product && product.inStock && typeof product.stockQuantity === 'number' && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                  <p className="mt-2 text-xs font-medium text-amber-500 rtl:font-normal flex items-center gap-1.5 animate-in fade-in duration-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{t('product.limitedStock')}</span>
                  </p>
                )}
              </div>

              {/* Flacon Volume Selector */}
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider rtl:tracking-normal font-semibold text-[var(--text-primary)] block mb-2.5">
                  {t('productDetail.selectSize')}
                </span>
                <RadioGroup
                  name="product-size-selector"
                  options={sizeRadioOptions}
                  value={selectedSize}
                  onChange={(val) => setSelectedSize(String(val))}
                  disabled={!product.inStock}
                />
              </div>

              {/* Quantity Stepper & Add to Bag */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={typeof product?.stockQuantity === 'number' && product.stockQuantity > 0 ? Math.min(10, product.stockQuantity) : 10}
                  className="shrink-0"
                  disabled={!product.inStock}
                />

                <Button
                  variant={!product.inStock ? 'outline' : isAdded ? 'gold' : 'primary'}
                  size="lg"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  leftIcon={
                    !product.inStock ? undefined : isAdded ? (
                      <Check className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    )
                  }
                >
                  {!product.inStock
                    ? t('product.outOfStock')
                    : isAdded
                    ? t('productDetail.addedToBag')
                    : t('productDetail.addToBag')}
                </Button>
              </div>

              {/* Value Propositions */}
              <div className="pt-4 space-y-2.5 text-xs text-muted/90 font-light border-t border-border/70">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
                  <span>{t('productDetail.freeDelivery')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
                  <span>{t('productDetail.luxuryBox')}</span>
                </div>
              </div>
            </div>

            {/* Accordions (Description, Profile, Shipping) */}
            <div className="pt-6">
              <Accordion items={accordionItems} defaultOpenId="description" />
            </div>
          </div>
        </div>

        {/* Olfactory Notes Pyramid Visualizer */}
        <section className="py-16 border-b border-border/80 text-start" aria-labelledby="pyramid-heading">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-gold font-medium block mb-2">
              {t('productDetail.harmonicStructure')}
            </span>
            <h2 id="pyramid-heading" className="text-2xl sm:text-3xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black">
              {t('productDetail.pyramidTitle')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted font-light leading-relaxed rtl:leading-loose">
              {t('productDetail.pyramidSubtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Notes */}
            <div className="bg-ivory-surface border border-border/80 p-6 flex flex-col justify-between rounded-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                  <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-semibold">
                    {formatNumber(1, { minimumIntegerDigits: 2, useGrouping: false })}. {t('productDetail.topNotes')}
                  </span>
                  <Sparkles className="w-4 h-4 text-gold/70" />
                </div>
                <p className="text-[11px] text-muted mb-4 font-light leading-relaxed rtl:leading-loose">
                  {t('productDetail.topNotesDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(getLocalized(product.notes.top, lang) || []).map((note) => (
                    <span
                      key={note}
                      className="px-2.5 py-1 bg-ivory text-near-black text-xs border border-border rounded-xs font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Heart Notes */}
            <div className="bg-ivory-surface border border-gold/40 shadow-2xs p-6 flex flex-col justify-between rounded-xs relative">
              <div className="absolute -top-2.5 start-6 bg-gold text-near-black text-[10px] font-mono uppercase tracking-wider rtl:tracking-normal px-2 py-0.5 rounded-xs font-semibold">
                {t('productDetail.heartOfEssence')}
              </div>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                  <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-semibold">
                    {formatNumber(2, { minimumIntegerDigits: 2, useGrouping: false })}. {t('productDetail.heartNotes')}
                  </span>
                  <Droplets className="w-4 h-4 text-gold/70" />
                </div>
                <p className="text-[11px] text-muted mb-4 font-light leading-relaxed rtl:leading-loose">
                  {t('productDetail.heartNotesDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(getLocalized(product.notes.heart, lang) || []).map((note) => (
                    <span
                      key={note}
                      className="px-2.5 py-1 bg-ivory text-near-black text-xs border border-gold/40 rounded-xs font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Base Notes */}
            <div className="bg-ivory-surface border border-border/80 p-6 flex flex-col justify-between rounded-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                  <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-gold font-semibold">
                    {formatNumber(3, { minimumIntegerDigits: 2, useGrouping: false })}. {t('productDetail.baseNotes')}
                  </span>
                  <Wind className="w-4 h-4 text-gold/70" />
                </div>
                <p className="text-[11px] text-muted mb-4 font-light leading-relaxed rtl:leading-loose">
                  {t('productDetail.baseNotesDesc')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(getLocalized(product.notes.base, lang) || []).map((note) => (
                    <span
                      key={note}
                      className="px-2.5 py-1 bg-ivory text-near-black text-xs border border-border rounded-xs font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Comments & Olfactory Reviews Section */}
        <div id="product-reviews">
          <ProductReviews product={product} />
        </div>

        {/* Related Creations Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 text-start" aria-labelledby="related-heading">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-border/80">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium block mb-1">
                  {t('productDetail.curatedHarmonies')}
                </span>
                <h2 id="related-heading" className="text-2xl sm:text-3xl font-display font-light text-near-black">
                  {t('productDetail.relatedTitle')}
                </h2>
              </div>

              <LocaleLink
                to={`/shop?scentFamily=${product.scentFamily}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold hover:text-gold-dark font-medium transition-colors"
              >
                <span>{t('shop.breadcrumb')}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </LocaleLink>
            </div>

            {/* Related products: 2-col on mobile (<640px), 3-col on tablet (640-1024px), 4-col on desktop (1024px+) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Mobile Sticky Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-start">
          <span className="text-sm font-mono font-medium text-gold block truncate">
            {formatPrice(currentPrice)}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] block truncate font-light">
            {selectedSize} • {productName}
          </span>
          {product && !product.inStock && (
            <span className="text-[11px] text-rose-500 block font-medium truncate">
              {t('product.outOfStock')}
            </span>
          )}
        </div>
        <Button
          variant={product && !product.inStock ? 'outline' : isAdded ? 'gold' : 'primary'}
          size="md"
          className="min-h-[44px] px-5 shrink-0"
          disabled={Boolean(product && !product.inStock)}
          onClick={handleAddToCart}
          leftIcon={
            product && !product.inStock ? undefined : isAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )
          }
        >
          {product && !product.inStock
            ? t('product.outOfStock')
            : isAdded
            ? t('productDetail.addedToBag')
            : t('productDetail.addToBag')}
        </Button>
      </div>
    </div>
    </>
  );
};

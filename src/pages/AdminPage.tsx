import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Package,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  Database,
  Check,
  X,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  Image as ImageIcon,
  ImageOff,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Tag,
  Users,
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowLeft,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { useLocaleNavigate, LocaleLink } from '../components/navigation/LocaleLink';
import { Product, ScentFamilyId, Gender } from '../types';
import { FirestoreOrder, OrderStatus, UserProfile } from '../types/auth';
import { ChatConversation } from '../types/chat';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  subscribeToProducts,
  migrateProductStockQuantities,
} from '../lib/productsApi';
import { getAllOrders, updateOrderStatus, subscribeToOrders } from '../lib/ordersApi';
import { getAllUsers } from '../lib/usersApi';
import { subscribeToAllChats } from '../lib/chatApi';
import { seedFirestoreProducts } from '../lib/seedFirestore';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Seo } from '../components/seo/Seo';
import { AdminSupportChat } from '../components/admin/AdminSupportChat';
import { AdminCoupons } from '../components/admin/AdminCoupons';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminContent } from '../components/admin/AdminContent';

const SAMPLE_PRESET_IMAGES = [
  {
    key: 'admin.products.sampleAmberOud',
    label: 'عطر کهربایی و عود (Amber & Oud)',
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'admin.products.sampleDarkWoody',
    label: 'شیشه تیره چوبی (Dark Woody)',
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'admin.products.sampleFreshCitrus',
    label: 'شیشه مینیمال مرکباتی (Fresh Citrus)',
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'admin.products.sampleRoseFloral',
    label: 'شیشه لوکس گلی (Rose & Floral)',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
  },
];

interface ImageThumbnailPreviewProps {
  url: string;
}

const ImageThumbnailPreview: React.FC<ImageThumbnailPreviewProps> = ({ url }) => {
  const { t } = useI18n();
  const [loadStatus, setLoadStatus] = useState<'empty' | 'loading' | 'loaded' | 'error'>('empty');

  useEffect(() => {
    const trimmed = url?.trim();
    if (!trimmed) {
      setLoadStatus('empty');
      return;
    }
    setLoadStatus('loading');
    const img = new Image();
    img.src = trimmed;
    img.onload = () => setLoadStatus('loaded');
    img.onerror = () => setLoadStatus('error');
  }, [url]);

  if (loadStatus === 'empty') {
    return (
      <div
        className="w-12 h-12 rounded bg-zinc-100 border border-dashed border-zinc-300 flex flex-col items-center justify-center shrink-0 text-zinc-400"
        title={t('admin.products.imgEmpty')}
      >
        <ImageIcon className="w-5 h-5 stroke-[1.5]" />
      </div>
    );
  }

  if (loadStatus === 'loading') {
    return (
      <div
        className="w-12 h-12 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0"
        title={t('admin.products.imgLoading')}
      >
        <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadStatus === 'error') {
    return (
      <div
        className="w-12 h-12 rounded bg-red-50 border border-red-200 flex flex-col items-center justify-center shrink-0 text-red-500"
        title={t('admin.products.imgError')}
      >
        <ImageOff className="w-4 h-4 stroke-[1.5]" />
        <span className="text-[9px] font-mono leading-none mt-0.5">{t('admin.products.errorBadge')}</span>
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 rounded overflow-hidden border border-zinc-300 bg-zinc-100 shrink-0">
      <img
        src={url.trim()}
        alt={t('admin.products.previewAlt')}
        className="w-full h-full object-cover"
      />
      <div
        className="absolute top-1 end-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white"
        title={t('admin.products.imgSuccess')}
      />
    </div>
  );
};

export const AdminPage: React.FC = () => {
  const { lang, isRTL, t, formatPrice, formatNumber } = useI18n();
  const { user, profile, isAdmin, isOwner, loading: authLoading } = useAuth();
  const localeNavigate = useLocaleNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'support' | 'coupons' | 'users' | 'content'>('dashboard');

  // Support Chat state
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [chatsLoading, setChatsLoading] = useState<boolean>(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [searchProductQuery, setSearchProductQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'lowStock' | 'outOfStock' | 'inStock'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [seedingLoading, setSeedingLoading] = useState<boolean>(false);
  const [migratingStockLoading, setMigratingStockLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<boolean>(false);

  // Users state (lifted so Dashboard & Users tab share in-memory data without duplicate reads)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (!isManualRefresh) setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users for dashboard:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  // Dashboard calculation: Total Revenue (sum of processing, shipped, delivered)
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => ['processing', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (Number(o.totals?.total) || 0), 0);
  }, [orders]);

  // Dashboard calculation: Orders in the last 7 calendar days
  const last7DaysData = useMemo(() => {
    const list: { dateStr: string; label: string; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${dateNum}`;

      const label = d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
      });

      list.push({
        dateStr: key,
        label,
        count: 0,
      });
    }

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const od = new Date(o.createdAt);
      const y = od.getFullYear();
      const m = String(od.getMonth() + 1).padStart(2, '0');
      const dateNum = String(od.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${dateNum}`;

      const dayObj = list.find((item) => item.dateStr === key);
      if (dayObj) {
        dayObj.count += 1;
      }
    });

    return list;
  }, [orders, lang]);

  const maxOrdersIn7Days = useMemo(() => {
    return Math.max(1, ...last7DaysData.map((d) => d.count));
  }, [last7DaysData]);

  // Dashboard calculation: Top selling products (by quantity sold in non-cancelled orders)
  const topSellingProducts = useMemo(() => {
    const map: { [id: string]: { id: string; name: string; image: string; qty: number } } = {};

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        (o.items || []).forEach((it) => {
          const pId = it.productId || (it as any).product?.id;
          if (!pId) return;

          const prod = products.find((p) => p.id === pId || p.slug === pId);
          const name =
            (prod ? prod.name[lang] : '') ||
            it.productName?.[lang] ||
            (typeof it.productName === 'string' ? it.productName : '') ||
            t('admin.dashboard.defaultFragranceName');
          const image = prod?.images?.[0] || it.image || (it as any).product?.images?.[0] || 'https://via.placeholder.com/80';

          if (!map[pId]) {
            map[pId] = { id: pId, name, image, qty: 0 };
          }
          map[pId].qty += Number(it.quantity) || 1;
        });
      });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders, products, lang]);

  // Dashboard calculation: Recent 5 orders sorted by createdAt descending
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // Status badge renderer for order rows
  const renderOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            {t('admin.dashboard.statusPending')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            {t('admin.dashboard.statusProcessing')}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
            {t('admin.dashboard.statusShipped')}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            {t('admin.dashboard.statusDelivered')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
            {t('admin.dashboard.statusCancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  // Product Form State
  const [formSlug, setFormSlug] = useState('');
  const [formBrand, setFormBrand] = useState('Maison Rayeha');
  const [formNameFa, setFormNameFa] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSubtitleFa, setFormSubtitleFa] = useState('');
  const [formSubtitleEn, setFormSubtitleEn] = useState('');
  const [formDescFa, setFormDescFa] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formScentFamily, setFormScentFamily] = useState<ScentFamilyId>('oriental');
  const [formGender, setFormGender] = useState<Gender>('unisex');
  const [formConcentrationFa, setFormConcentrationFa] = useState('اکستریت د پرفیوم (۳۰٪ غلظت روغن نیش)');
  const [formConcentrationEn, setFormConcentrationEn] = useState('Extrait de Parfum (30% pure oil concentrate)');
  const [formPriceFa, setFormPriceFa] = useState<number>(12900000);
  const [formPriceEn, setFormPriceEn] = useState<number>(225);
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200',
  ]);
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(20);

  // Protect route
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        localeNavigate('/');
      }
    }
  }, [user, isAdmin, authLoading, localeNavigate]);

  // Subscribe to products
  useEffect(() => {
    if (isAdmin) {
      setProductsLoading(true);
      const unsub = subscribeToProducts((data) => {
        setProducts(data);
        setProductsLoading(false);
      });
      return () => unsub();
    }
  }, [isAdmin]);

  // Subscribe to orders
  useEffect(() => {
    if (isAdmin) {
      setOrdersLoading(true);
      const unsub = subscribeToOrders((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
      return () => unsub();
    }
  }, [isAdmin]);

  // Subscribe to chats
  useEffect(() => {
    if (isAdmin) {
      setChatsLoading(true);
      const unsub = subscribeToAllChats((data) => {
        setChats(data);
        setChatsLoading(false);
      });
      return () => unsub();
    }
  }, [isAdmin]);

  const unreadChatsCount = chats.filter((c) => c.unreadByAdmin).length;

  // Seed Handler
  const handleSeedProducts = async () => {
    if (!window.confirm(t('admin.header.seedConfirm'))) return;
    setSeedingLoading(true);
    setStatusMessage(null);
    try {
      const res = await seedFirestoreProducts(true);
      setStatusMessage({ text: res.message || t('admin.header.seedSuccess'), type: 'success' });
      const updated = await getAllProducts();
      setProducts(updated);
    } catch (err: any) {
      setStatusMessage({ text: err.message || t('admin.header.seedError', { detail: '' }), type: 'error' });
    } finally {
      setSeedingLoading(false);
    }
  };

  // Open modal for Create or Edit
  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormSlug(prod.slug);
      setFormBrand(prod.brand);
      setFormNameFa(prod.name.fa);
      setFormNameEn(prod.name.en);
      setFormSubtitleFa(prod.subtitle.fa);
      setFormSubtitleEn(prod.subtitle.en);
      setFormDescFa(prod.description.fa);
      setFormDescEn(prod.description.en);
      setFormScentFamily(prod.scentFamily);
      setFormGender(prod.gender);
      const concFa = typeof prod.concentration === 'object' && prod.concentration ? prod.concentration.fa : (prod.concentration || '');
      const concEn = typeof prod.concentration === 'object' && prod.concentration ? prod.concentration.en : (prod.concentration || '');
      setFormConcentrationFa(concFa);
      setFormConcentrationEn(concEn);
      setFormPriceFa(prod.price.fa);
      setFormPriceEn(prod.price.en);
      setFormImages(prod.images.length > 0 ? prod.images : ['']);
      setFormIsBestseller(prod.isBestseller);
      setFormIsNew(prod.isNew);
      const qty = typeof prod.stockQuantity === 'number' ? prod.stockQuantity : prod.inStock ? 20 : 0;
      setFormStockQuantity(qty);
    } else {
      setEditingProduct(null);
      setFormSlug(`fragrance-${Date.now()}`);
      setFormBrand('Maison Rayeha');
      setFormNameFa('');
      setFormNameEn('');
      setFormSubtitleFa('');
      setFormSubtitleEn('');
      setFormDescFa('');
      setFormDescEn('');
      setFormScentFamily('oriental');
      setFormGender('unisex');
      setFormConcentrationFa('اکستریت د پرفیوم (۳۰٪ غلظت روغن نیش)');
      setFormConcentrationEn('Extrait de Parfum (30% pure oil concentrate)');
      setFormPriceFa(12000000);
      setFormPriceEn(220);
      setFormImages(['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200']);
      setFormIsBestseller(false);
      setFormIsNew(true);
      setFormStockQuantity(20);
    }
    setIsProductModalOpen(true);
  };

  // Image URL management handlers
  const handleUpdateImageUrl = (index: number, val: string) => {
    setFormImages((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddImageField = () => {
    setFormImages((prev) => [...prev, '']);
  };

  const handleRemoveImageField = (index: number) => {
    setFormImages((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleApplySampleImage = (url: string) => {
    setFormImages((prev) => {
      if (prev.length === 1 && !prev[0].trim()) {
        return [url];
      }
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanImages = formImages.map((u) => u.trim()).filter(Boolean);
      const finalImages = cleanImages.length > 0 ? cleanImages : [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200'
      ];

      const payload: Omit<Product, 'id'> = {
        slug: formSlug.trim() || `prod-${Date.now()}`,
        brand: formBrand.trim(),
        name: { fa: formNameFa.trim(), en: formNameEn.trim() },
        subtitle: { fa: formSubtitleFa.trim(), en: formSubtitleEn.trim() },
        description: { fa: formDescFa.trim(), en: formDescEn.trim() },
        scentFamily: formScentFamily,
        gender: formGender,
        concentration: { fa: formConcentrationFa, en: formConcentrationEn },
        price: { fa: Number(formPriceFa), en: Number(formPriceEn) },
        sizes: [
          { ml: 30, price: { fa: Number(formPriceFa), en: Number(formPriceEn) } },
          { ml: 50, price: { fa: Math.round(Number(formPriceFa) * 1.45), en: Math.round(Number(formPriceEn) * 1.45) } },
          { ml: 100, price: { fa: Math.round(Number(formPriceFa) * 2.2), en: Math.round(Number(formPriceEn) * 2.2) } },
        ],
        notes: editingProduct?.notes || {
          top: { fa: ['ترنج', 'زعفران'], en: ['Bergamot', 'Saffron'] },
          heart: { fa: ['رز دمشقی', 'کهربا'], en: ['Damask Rose', 'Amber'] },
          base: { fa: ['عود', 'چوب صندل'], en: ['Oud', 'Sandalwood'] },
        },
        images: finalImages,
        isBestseller: formIsBestseller,
        isNew: formIsNew,
        stockQuantity: Math.max(0, Number(formStockQuantity) || 0),
        inStock: Math.max(0, Number(formStockQuantity) || 0) > 0,
        discountPercent: editingProduct?.discountPercent || 0,
        popularity: editingProduct?.popularity || 5000,
        salesCount: editingProduct?.salesCount || 100,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        rating: editingProduct?.rating || 4.9,
        reviewCount: editingProduct?.reviewCount || 1,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setStatusMessage({ text: t('admin.products.saveSuccess'), type: 'success' });
      } else {
        await createProduct(payload);
        setStatusMessage({ text: t('admin.products.createSuccess'), type: 'success' });
      }

      setIsProductModalOpen(false);
      const updated = await getAllProducts();
      setProducts(updated);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setStatusMessage({ text: err.message || t('admin.products.saveError'), type: 'error' });
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(t('admin.products.confirmDelete', { name }))) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setStatusMessage({ text: t('admin.products.deleteSuccess'), type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || t('admin.products.deleteError'), type: 'error' });
    }
  };

  // Immediate inline stock quantity update
  const handleUpdateStockQuantity = async (product: Product, newQuantity: number) => {
    try {
      const clamped = Math.max(0, Math.floor(newQuantity || 0));
      const nextInStock = clamped > 0;
      await updateProduct(product.id, { stockQuantity: clamped, inStock: nextInStock });
      setStatusMessage({
        text: t('admin.products.stockUpdateSuccess', {
          name: product.name[lang] || product.name.fa,
          count: formatNumber(clamped),
          status: nextInStock ? t('admin.products.statusInStock') : t('admin.products.statusOutOfStock'),
        }),
        type: 'success',
      });
    } catch (err: any) {
      console.warn('Error updating product stock quantity:', err);
      setStatusMessage({ text: err.message || t('admin.products.stockUpdateError'), type: 'error' });
    }
  };

  // Run stock quantity migration on existing Firestore documents
  const handleRunStockMigration = async () => {
    setMigratingStockLoading(true);
    setStatusMessage(null);
    try {
      const res = await migrateProductStockQuantities();
      setStatusMessage({ text: res.message || t('admin.header.migrationSuccess', { message: '' }), type: 'success' });
      const updated = await getAllProducts();
      setProducts(updated);
    } catch (err: any) {
      setStatusMessage({ text: err.message || t('admin.header.migrationError', { detail: '' }), type: 'error' });
    } finally {
      setMigratingStockLoading(false);
    }
  };

  // Update Order Status
  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderStatus(true);
    try {
      await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      setStatusMessage({ text: t('admin.orders.updateSuccess'), type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || t('admin.orders.updateError'), type: 'error' });
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-muted font-mono">{t('admin.header.verifyingCredentials')}</p>
      </div>
    );
  }

  const lowStockProducts = products.filter(
    (p) => typeof p.stockQuantity === 'number' && p.stockQuantity > 0 && p.stockQuantity <= 5
  );
  const outOfStockProducts = products.filter(
    (p) => (typeof p.stockQuantity === 'number' && p.stockQuantity === 0) || p.inStock === false
  );
  const healthyStockProducts = products.filter(
    (p) => typeof p.stockQuantity === 'number' && p.stockQuantity > 5
  );

  const filteredProducts = products.filter((p) => {
    const q = searchProductQuery.toLowerCase();
    const matchesSearch =
      p.name.fa.toLowerCase().includes(q) ||
      p.name.en.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    const qty = typeof p.stockQuantity === 'number' ? p.stockQuantity : p.inStock ? 20 : 0;
    if (stockFilter === 'lowStock') {
      return qty > 0 && qty <= 5;
    }
    if (stockFilter === 'outOfStock') {
      return qty === 0;
    }
    if (stockFilter === 'inStock') {
      return qty > 5;
    }
    return true;
  });

  return (
    <div className="admin-scope py-8 bg-zinc-50 min-h-screen text-start text-zinc-900 font-sans" style={{ colorScheme: 'light' }}>
      <Seo title="Admin Dashboard | Maison Rayeha" description="Internal administrative dashboard" />

      <Container size="xl">
        {/* Admin Header */}
        <div className="bg-white border border-zinc-200 p-6 rounded-md shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-zinc-900 text-gold flex items-center justify-center">
              <Shield className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900">{t('admin.header.title')}</h1>
                <span className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-mono">
                  {t('admin.header.firestoreConnected')}
                </span>
                {lowStockProducts.length > 0 && (
                  <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    <span>{t('admin.header.lowStockBanner', { count: formatNumber(lowStockProducts.length) })}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('admin.header.signedInAs')} <span className="font-medium text-zinc-800">{user?.email}</span>{' '}
                {isOwner ? (
                  <span className="text-[11px] font-bold text-gold-dark bg-gold/15 border border-gold/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <span>{t('admin.header.roleOwner')}</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                    {t('admin.header.roleAdmin')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunStockMigration}
              disabled={migratingStockLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${migratingStockLoading ? 'animate-spin' : ''}`} />}
              title={t('admin.header.migrationTooltip')}
            >
              {migratingStockLoading ? t('admin.header.migrationLoading') : t('admin.header.migrationBtn')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedProducts}
              disabled={seedingLoading}
              leftIcon={<Database className="w-4 h-4 stroke-[1.5]" />}
            >
              {seedingLoading ? t('admin.header.seedLoading') : t('admin.header.seedBtn')}
            </Button>

            <LocaleLink
              to="/account"
              className="text-xs px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors"
            >
              {t('admin.header.viewStore')}
            </LocaleLink>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-3.5 mb-6 rounded-md text-xs flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 hover:opacity-70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2 border-b border-zinc-200 mb-6 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.dashboard')}</span>
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center" title={t('admin.dashboard.inventoryAlerts')}>
                {formatNumber(lowStockProducts.length + outOfStockProducts.length)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Package className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.products')} ({formatNumber(products.length)})</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" title={t('admin.tabs.lowStockBadgeTitle', { count: formatNumber(lowStockProducts.length) })}>
                {formatNumber(lowStockProducts.length)} {t('admin.tabs.lowStockShort')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.orders')} ({formatNumber(orders.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors relative whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.support')}</span>
            {unreadChatsCount > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                {formatNumber(unreadChatsCount)}
              </span>
            ) : (
              <span className="text-xs text-zinc-400 font-mono">({formatNumber(chats.length)})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Tag className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.coupons')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.users')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4 stroke-[1.5]" />
            <span>{t('admin.tabs.content')}</span>
          </button>
        </div>

        {/* Tab: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 1. TOP ROW: 4 STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 shadow-xs text-start">
                <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                  <span className="text-xs font-medium">
                    {t('admin.dashboard.totalRevenue')}
                  </span>
                  <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-900">
                  {formatPrice(totalRevenue)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {t('admin.dashboard.totalRevenueDesc')}
                </p>
              </div>

              {/* Total Orders Count */}
              <div
                onClick={() => setActiveTab('orders')}
                className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 shadow-xs cursor-pointer hover:border-zinc-400 transition-colors text-start"
              >
                <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                  <span className="text-xs font-medium">
                    {t('admin.dashboard.totalOrders')}
                  </span>
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-900">
                  {formatNumber(orders.length)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {t('admin.dashboard.totalOrdersDesc')}
                </p>
              </div>

              {/* Total Products Count */}
              <div
                onClick={() => setActiveTab('products')}
                className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 shadow-xs cursor-pointer hover:border-zinc-400 transition-colors text-start"
              >
                <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                  <span className="text-xs font-medium">
                    {t('admin.dashboard.totalProducts')}
                  </span>
                  <div className="w-8 h-8 rounded bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <Package className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-900">
                  {formatNumber(products.length)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {t('admin.dashboard.totalProductsDesc')}
                </p>
              </div>

              {/* Total Registered Users */}
              <div
                onClick={() => setActiveTab('users')}
                className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 shadow-xs cursor-pointer hover:border-zinc-400 transition-colors text-start"
              >
                <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                  <span className="text-xs font-medium">
                    {t('admin.dashboard.totalUsers')}
                  </span>
                  <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Users className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-900">
                  {formatNumber(users.length)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {t('admin.dashboard.totalUsersDesc')}
                </p>
              </div>
            </div>

            {/* 2. MIDDLE ROW: 7-DAY ORDERS BAR CHART + TOP SELLING PRODUCTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Last 7 Days Orders Bar Chart (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs flex flex-col justify-between text-start">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-700 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          {t('admin.dashboard.ordersLast7Days')}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          {t('admin.dashboard.dailyOrderVolume')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                      {formatNumber(last7DaysData.reduce((acc, d) => acc + d.count, 0))}{' '}
                      {t('admin.dashboard.ordersPerWeek')}
                    </span>
                  </div>

                  {/* CSS Bar Chart Container */}
                  <div className="h-44 sm:h-48 flex items-end justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 pb-2 pt-6 bg-zinc-50/70 border border-zinc-100 rounded-md">
                    {last7DaysData.map((day) => {
                      const heightPct =
                        day.count === 0 ? 3 : Math.max(12, Math.round((day.count / maxOrdersIn7Days) * 100));

                      return (
                        <div
                          key={day.dateStr}
                          className="flex-1 flex flex-col items-center justify-end h-full group"
                        >
                          {/* Count number above bar */}
                          <span
                            className={`text-[11px] font-mono font-bold mb-1 transition-colors ${
                              day.count > 0 ? 'text-zinc-900 group-hover:text-gold-dark' : 'text-zinc-400'
                            }`}
                          >
                            {formatNumber(day.count)}
                          </span>

                          {/* Bar */}
                          <div className="w-full max-w-[30px] sm:max-w-[40px] bg-zinc-200/70 rounded-t flex items-end overflow-hidden h-full">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all duration-300 ${
                                day.count > 0
                                  ? 'bg-zinc-800 group-hover:bg-zinc-950'
                                  : 'bg-transparent'
                              }`}
                            />
                          </div>

                          {/* Date label under bar */}
                          <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium mt-2 whitespace-nowrap text-center">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Selling Products (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs flex flex-col justify-between text-start">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900">
                          {t('admin.dashboard.topSelling')}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          {t('admin.dashboard.topSellingDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-zinc-600 hover:text-zinc-900 underline font-medium cursor-pointer"
                    >
                      {t('admin.dashboard.viewAllProducts')}
                    </button>
                  </div>

                  {topSellingProducts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      {t('admin.dashboard.noSalesYet')}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {topSellingProducts.map((p, idx) => (
                        <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 text-center text-xs font-mono font-bold text-zinc-400">
                              #{idx + 1}
                            </span>
                            <img
                              src={p.image}
                              alt=""
                              className="w-9 h-9 object-cover rounded border border-zinc-200 shrink-0"
                            />
                            <p className="text-xs font-medium text-zinc-900 truncate">
                              {p.name}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-100 text-zinc-800 shrink-0">
                            {formatNumber(p.qty)} {t('admin.dashboard.unitsSold')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. RECENT ORDERS (Last 5 orders) */}
            <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      {t('admin.dashboard.recentOrders')}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {t('admin.dashboard.recentOrdersDesc')}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />}
                >
                  {t('admin.dashboard.allOrders')}
                </Button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {t('admin.dashboard.noOrdersYet')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
                      <tr>
                        <th className="p-3">{t('admin.dashboard.orderNumber')}</th>
                        <th className="p-3">{t('admin.dashboard.customer')}</th>
                        <th className="p-3">{t('admin.dashboard.total')}</th>
                        <th className="p-3">{t('admin.dashboard.status')}</th>
                        <th className="p-3">{t('admin.dashboard.date')}</th>
                        <th className="p-3 text-end">{t('admin.dashboard.action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {recentOrders.map((ord) => (
                        <tr
                          key={ord.id || ord.orderNumber}
                          onClick={() => {
                            setActiveTab('orders');
                            setSelectedOrder(ord);
                          }}
                          className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                        >
                          <td className="p-3 font-mono font-bold text-zinc-900 group-hover:text-gold-dark">
                            {ord.orderNumber}
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-zinc-800">{ord.customerName}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              {ord.customerEmail || ord.customerPhone}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-zinc-900">
                            {formatPrice(ord.totals.total)}
                          </td>
                          <td className="p-3">
                            {renderOrderStatusBadge(ord.status)}
                          </td>
                          <td className="p-3 text-[11px] text-zinc-500 font-mono">
                            {lang === 'fa'
                              ? new Date(ord.createdAt).toLocaleDateString('fa-IR')
                              : new Date(ord.createdAt).toLocaleDateString('en-US')}
                          </td>
                          <td className="p-3 text-end">
                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-900 font-medium">
                              <span>{t('admin.dashboard.view')}</span>
                              <Eye className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. INVENTORY ALERTS (Stock warning overview) */}
            <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-200 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      {t('admin.dashboard.inventoryAlerts')}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {t('admin.dashboard.inventoryAlertsDesc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('products');
                      setStockFilter('lowStock');
                    }}
                    leftIcon={<Package className="w-3.5 h-3.5" />}
                  >
                    {t('admin.dashboard.viewLowStock')}
                  </Button>
                </div>
              </div>

              {/* Alert Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Low Stock (1 to 5) */}
                <div
                  onClick={() => {
                    setActiveTab('products');
                    setStockFilter('lowStock');
                  }}
                  className="p-4 rounded-md border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 transition-colors cursor-pointer text-start"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-900">
                      {t('admin.dashboard.lowStockTitle')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 font-mono">
                      {formatNumber(lowStockProducts.length)} {t('admin.dashboard.itemsUnit')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-900 mb-2">
                    {formatNumber(lowStockProducts.length)}
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {lowStockProducts.length > 0 ? (
                      <span>
                        {t('admin.dashboard.itemsPrefix')}{lowStockProducts.slice(0, 3).map((p) => (p.name[lang] || p.name.fa)).join(lang === 'fa' ? '، ' : ', ')}
                        {lowStockProducts.length > 3 ? t('admin.dashboard.andMore') : ''}
                      </span>
                    ) : (
                      t('admin.dashboard.noLowStockAlert')
                    )}
                  </p>
                </div>

                {/* 2. Out of Stock (=== 0) */}
                <div
                  onClick={() => {
                    setActiveTab('products');
                    setStockFilter('outOfStock');
                  }}
                  className="p-4 rounded-md border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 transition-colors cursor-pointer text-start"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-rose-900">
                      {t('admin.dashboard.outOfStockTitle')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-900 font-mono">
                      {formatNumber(outOfStockProducts.length)} {t('admin.dashboard.itemsUnit')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-900 mb-2">
                    {formatNumber(outOfStockProducts.length)}
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    {outOfStockProducts.length > 0 ? (
                      <span>
                        {t('admin.dashboard.itemsPrefix')}{outOfStockProducts.slice(0, 3).map((p) => (p.name[lang] || p.name.fa)).join(lang === 'fa' ? '، ' : ', ')}
                        {outOfStockProducts.length > 3 ? t('admin.dashboard.andMore') : ''}
                      </span>
                    ) : (
                      t('admin.dashboard.noOutOfStockAlert')
                    )}
                  </p>
                </div>

                {/* 3. Healthy Stock (> 5) */}
                <div
                  onClick={() => {
                    setActiveTab('products');
                    setStockFilter('inStock');
                  }}
                  className="p-4 rounded-md border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors cursor-pointer text-start"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-900">
                      {t('admin.dashboard.healthyStockTitle')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 font-mono">
                      {formatNumber(healthyStockProducts.length)} {t('admin.dashboard.itemsUnit')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-900 mb-2">
                    {formatNumber(healthyStockProducts.length)}
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {t('admin.dashboard.healthyStockDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Products */}
        {activeTab === 'products' && (
          <div className="bg-white border border-zinc-200 rounded-md shadow-xs">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder={t('admin.products.searchPlaceholder')}
                    value={searchProductQuery}
                    onChange={(e) => setSearchProductQuery(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded px-3 py-2 ps-9 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Inventory Filter Quick Views */}
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded border border-zinc-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStockFilter('all')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      stockFilter === 'all'
                        ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {t('admin.products.filterAll')} ({formatNumber(products.length)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockFilter('lowStock')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      stockFilter === 'lowStock'
                        ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                        : 'text-amber-800 hover:text-amber-900'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t('admin.products.filterLowStock')} ({formatNumber(lowStockProducts.length)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStockFilter('outOfStock')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      stockFilter === 'outOfStock'
                        ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                        : 'text-rose-700 hover:text-rose-900'
                    }`}
                  >
                    <span>{t('admin.products.filterOutOfStock')} ({formatNumber(outOfStockProducts.length)})</span>
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => openProductModal()}
                leftIcon={<Plus className="w-4 h-4 stroke-[1.5]" />}
              >
                {t('admin.products.addNew')}
              </Button>
            </div>

            {/* Products Table */}
            {productsLoading ? (
              <div className="p-12 text-center text-xs text-zinc-500">{t('admin.products.loading')}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500">
                {t('admin.products.noProductsFound')}{' '}
                {stockFilter !== 'all' && (
                  <button
                    onClick={() => setStockFilter('all')}
                    className="text-zinc-900 underline font-medium ms-1"
                  >
                    {t('admin.products.showAll')}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-zinc-100/80 text-zinc-600 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="p-3">{t('admin.products.colImage')}</th>
                      <th className="p-3">{t('admin.products.colName')}</th>
                      <th className="p-3">{t('admin.products.colBrandFamily')}</th>
                      <th className="p-3">{t('admin.products.colPrice')}</th>
                      <th className="p-3 min-w-[170px]">{t('admin.products.colStock')}</th>
                      <th className="p-3 text-end">{t('admin.products.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredProducts.map((p) => {
                      const qty = typeof p.stockQuantity === 'number' ? p.stockQuantity : p.inStock ? 20 : 0;
                      const isOutOf = qty === 0;
                      const isLow = qty > 0 && qty <= 5;

                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/80">
                          <td className="p-3">
                            <img
                              src={p.images[0] || 'https://via.placeholder.com/80'}
                              alt=""
                              className="w-10 h-10 object-cover rounded border border-zinc-200"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-zinc-900">{p.name[lang] || p.name.fa}</p>
                            <p className="text-[11px] text-zinc-500">{lang === 'fa' ? p.name.en : (p.name.fa || p.name.en)}</p>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-zinc-800">{p.brand}</span>
                            <span className="text-[10px] text-zinc-500 block">{p.scentFamily}</span>
                          </td>
                          <td className="p-3 font-mono font-medium">
                            {formatPrice(p.price)}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                              {/* Editable Numeric Field */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max="9999"
                                  value={qty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    handleUpdateStockQuantity(p, isNaN(val) ? 0 : val);
                                  }}
                                  className="w-16 bg-zinc-50 border border-zinc-300 rounded px-2 py-1 text-xs font-mono font-bold text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                  title={t('admin.products.editStockTooltip')}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStockQuantity(p, qty + 1)}
                                    className="px-1 py-0.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded text-[9px] text-zinc-700 leading-none cursor-pointer"
                                    title={t('admin.products.increaseQty')}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStockQuantity(p, Math.max(0, qty - 1))}
                                    className="px-1 py-0.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded text-[9px] text-zinc-700 leading-none cursor-pointer"
                                    title={t('admin.products.decreaseQty')}
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>

                              {/* Live Status Badge */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isOutOf ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                    <span>✕ {t('admin.products.badgeOutOfStock')} ({formatNumber(0)})</span>
                                  </span>
                                ) : isLow ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    <span>{t('admin.products.badgeLowStock')} ({formatNumber(qty)})</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{t('admin.products.badgeInStock')} ({formatNumber(qty)})</span>
                                  </span>
                                )}

                                {p.isBestseller && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-medium">
                                    {t('admin.products.bestsellerBadge')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-end">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openProductModal(p)}
                                className="p-1.5 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                                title={t('admin.products.actionEdit')}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name[lang] || p.name.fa)}
                                className="p-1.5 hover:bg-red-100 rounded text-red-600 cursor-pointer"
                                title={t('admin.products.actionDelete')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-zinc-200 rounded-md shadow-xs">
            {ordersLoading ? (
              <div className="p-12 text-center text-xs text-zinc-500">{t('admin.orders.loading')}</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500">{t('admin.orders.empty')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-zinc-100/80 text-zinc-600 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="p-3">{t('admin.orders.colOrderNumber')}</th>
                      <th className="p-3">{t('admin.orders.colCustomer')}</th>
                      <th className="p-3">{t('admin.orders.colItems')}</th>
                      <th className="p-3">{t('admin.orders.colTotal')}</th>
                      <th className="p-3">{t('admin.orders.colDate')}</th>
                      <th className="p-3">{t('admin.orders.colStatus')}</th>
                      <th className="p-3 text-end">{t('admin.orders.colDetails')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {orders.map((ord) => (
                      <tr key={ord.id || ord.orderNumber} className="hover:bg-zinc-50/80">
                        <td className="p-3 font-mono font-medium text-zinc-900">{ord.orderNumber}</td>
                        <td className="p-3">
                          <p className="font-medium text-zinc-900">{ord.customerName}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{ord.customerPhone || ord.customerEmail}</p>
                        </td>
                        <td className="p-3">{formatNumber(ord.items.length)} {t('admin.orders.itemsCount')}</td>
                        <td className="p-3 font-mono font-medium">{formatPrice(ord.totals.total)}</td>
                        <td className="p-3 text-[11px] text-zinc-500">
                          {lang === 'fa'
                            ? new Date(ord.createdAt).toLocaleDateString('fa-IR')
                            : new Date(ord.createdAt).toLocaleDateString('en-US')}
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            disabled={updatingOrderStatus}
                            onChange={(e) => handleStatusChange(ord.id!, e.target.value as OrderStatus)}
                            className="bg-zinc-50 border border-zinc-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-800"
                          >
                            <option value="pending">{t('admin.dashboard.statusPending')}</option>
                            <option value="processing">{t('admin.dashboard.statusProcessing')}</option>
                            <option value="shipped">{t('admin.dashboard.statusShipped')}</option>
                            <option value="delivered">{t('admin.dashboard.statusDelivered')}</option>
                            <option value="cancelled">{t('admin.dashboard.statusCancelled')}</option>
                          </select>
                        </td>
                        <td className="p-3 text-end">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                            title={t('admin.orders.viewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Support Chat */}
        {activeTab === 'support' && (
          <AdminSupportChat chats={chats} />
        )}

        {/* Tab: Coupons */}
        {activeTab === 'coupons' && (
          <AdminCoupons
            orders={orders}
            onShowMessage={(msg) => setStatusMessage(msg)}
          />
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <AdminUsers
            orders={orders}
            currentUserId={user?.uid}
            isCurrentUserOwner={isOwner}
            onShowMessage={(msg) => setStatusMessage(msg)}
            users={users}
            setUsers={setUsers}
            loading={usersLoading}
            onRefreshUsers={fetchUsers}
          />
        )}

        {/* Tab: Content */}
        {activeTab === 'content' && (
          <AdminContent onShowMessage={(msg) => setStatusMessage(msg)} />
        )}

        {/* Product Create / Edit Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto text-start">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
                <h3 className="text-base font-bold text-zinc-900">
                  {editingProduct ? t('admin.products.modalEditTitle') : t('admin.products.modalAddTitle')}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelNameFa')}</label>
                    <input
                      type="text"
                      required
                      value={formNameFa}
                      onChange={(e) => setFormNameFa(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelNameEn')}</label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelSlug')}</label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelBrand')}</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelSubtitleFa')}</label>
                    <input
                      type="text"
                      value={formSubtitleFa}
                      onChange={(e) => setFormSubtitleFa(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelSubtitleEn')}</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formSubtitleEn}
                      onChange={(e) => setFormSubtitleEn(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('admin.products.labelDescFa')}</label>
                  <textarea
                    rows={2}
                    value={formDescFa}
                    onChange={(e) => setFormDescFa(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('admin.products.labelDescEn')}</label>
                  <textarea
                    rows={2}
                    dir="ltr"
                    value={formDescEn}
                    onChange={(e) => setFormDescEn(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelScentFamily')}</label>
                    <select
                      value={formScentFamily}
                      onChange={(e) => setFormScentFamily(e.target.value as ScentFamilyId)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    >
                      <option value="oriental">{t('admin.products.familyOriental')}</option>
                      <option value="floral">{t('admin.products.familyFloral')}</option>
                      <option value="woody">{t('admin.products.familyWoody')}</option>
                      <option value="fresh">{t('admin.products.familyFresh')}</option>
                      <option value="citrus">{t('admin.products.familyCitrus')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelGender')}</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as Gender)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2"
                    >
                      <option value="unisex">{t('admin.products.genderUnisex')}</option>
                      <option value="feminine">{t('admin.products.genderFeminine')}</option>
                      <option value="masculine">{t('admin.products.genderMasculine')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">{t('admin.products.labelPrice')}</label>
                    <input
                      type="number"
                      required
                      value={formPriceFa}
                      onChange={(e) => setFormPriceFa(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded p-2 font-mono"
                    />
                  </div>
                </div>

                {/* Product Images (Repeatable URL list with Live Thumbnail Preview) */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-semibold text-zinc-900">
                        {t('admin.products.labelImages')}
                      </label>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {t('admin.products.imagesHelper')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageField}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 text-ivory rounded text-[11px] font-medium hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('admin.products.addImage')}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formImages.map((imageUrl, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 bg-white border border-zinc-200 rounded-md shadow-2xs"
                      >
                        {/* Live Thumbnail Preview */}
                        <ImageThumbnailPreview url={imageUrl} />

                        {/* URL Input */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-zinc-500">
                              {idx === 0 ? t('admin.products.primaryImage') : `${t('admin.products.secondaryImage')} #${formatNumber(idx + 1)}`}
                            </span>
                            {imageUrl.trim() && (
                              <a
                                href={imageUrl.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 font-mono"
                                title={t('admin.products.openNewTab')}
                              >
                                <span>{t('admin.products.viewLink')}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <input
                            type="url"
                            dir="ltr"
                            required={idx === 0}
                            placeholder="https://images.unsplash.com/photo-..."
                            value={imageUrl}
                            onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-300 rounded p-1.5 text-xs font-mono focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                          />
                        </div>

                        {/* Remove / Clear Button */}
                        {formImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImageField(idx)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                            title={t('admin.products.removeImage')}
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Sample Presets from Maison Rayeha registry */}
                  <div className="pt-2 border-t border-zinc-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-zinc-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold-dark" />
                        <span>{t('admin.products.sampleImagesTitle')}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PRESET_IMAGES.map((sample, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleApplySampleImage(sample.url)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded text-[10px] border border-zinc-200 cursor-pointer transition-colors"
                          title={sample.url}
                        >
                          <img
                            src={sample.url}
                            alt={t(sample.key) || sample.label}
                            className="w-3.5 h-3.5 rounded-xs object-cover"
                          />
                          <span>{t(sample.key) || sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-900">
                      {t('admin.products.labelStock')}
                    </label>
                    <span className="text-[11px] font-mono">
                      {formStockQuantity === 0 ? (
                        <span className="text-rose-700 font-bold bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                          ✕ {t('admin.products.stockStatusZero')}
                        </span>
                      ) : formStockQuantity <= 5 ? (
                        <span className="text-amber-800 font-bold bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                          ⚠ {t('admin.products.stockStatusLow', { count: formatNumber(formStockQuantity) })}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ✓ {t('admin.products.stockStatusNormal', { count: formatNumber(formStockQuantity) })}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={formStockQuantity}
                      onChange={(e) => setFormStockQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-32 bg-white border border-zinc-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormStockQuantity(0)}
                        className="text-[10px] px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded text-rose-700 cursor-pointer"
                      >
                        {t('admin.products.quickStockZero')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStockQuantity(3)}
                        className="text-[10px] px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded text-amber-700 cursor-pointer"
                      >
                        {t('admin.products.quickStockLow', { count: formatNumber(3) })}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStockQuantity(20)}
                        className="text-[10px] px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded text-emerald-700 cursor-pointer"
                      >
                        {t('admin.products.quickStockNormal', { count: formatNumber(20) })}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {t('admin.products.stockCalculationNote')}
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBestseller}
                      onChange={(e) => setFormIsBestseller(e.target.checked)}
                      className="rounded text-zinc-900"
                    />
                    <span>{t('admin.products.bestsellerCheckbox')}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsNew}
                      onChange={(e) => setFormIsNew(e.target.checked)}
                      className="rounded text-zinc-900"
                    />
                    <span>{t('admin.products.newCheckbox')}</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    {t('admin.products.cancelBtn')}
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    {t('admin.products.saveBtn')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto text-start text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{t('admin.orders.modalTitle', { number: selectedOrder.orderNumber })}</h3>
                  <p className="text-[11px] text-zinc-500">
                    {t('admin.orders.registeredAt')}{' '}
                    {lang === 'fa'
                      ? new Date(selectedOrder.createdAt).toLocaleString('fa-IR')
                      : new Date(selectedOrder.createdAt).toLocaleString('en-US')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-zinc-50 p-3 rounded mb-4 space-y-1">
                <p>
                  <strong>{t('admin.orders.customerName')}:</strong> {selectedOrder.customerName}
                </p>
                <p>
                  <strong>{t('admin.orders.customerEmail')}:</strong> {selectedOrder.customerEmail}
                </p>
                <p>
                  <strong>{t('admin.orders.customerPhone')}:</strong> {selectedOrder.customerPhone || t('admin.orders.phoneNotProvided')}
                </p>
                <p>
                  <strong>{t('admin.orders.shippingAddress')}:</strong> {selectedOrder.shippingAddress?.fullAddress || selectedOrder.shippingAddress?.addressLine1 || t('admin.orders.defaultAddressCity')}, {selectedOrder.shippingAddress?.city || ''}
                </p>
              </div>

              {/* Items */}
              <div className="border border-zinc-200 rounded p-3 mb-4 space-y-2">
                <p className="font-semibold border-b border-zinc-200 pb-1">{t('admin.orders.purchasedItems')}:</p>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span>
                      {it.productName[lang] || it.productName.fa} ({it.size}) × {formatNumber(it.quantity)}
                    </span>
                    <span className="font-mono">
                      {formatPrice({
                        fa: it.unitPrice.fa * it.quantity,
                        en: (it.unitPrice.en || Math.round(it.unitPrice.fa / 55000)) * it.quantity,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-zinc-50 p-3 rounded mb-4 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>{t('admin.orders.subtotal')}:</span>
                  <span>{formatPrice(selectedOrder.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('admin.orders.shippingCost')}:</span>
                  <span>{formatPrice(selectedOrder.totals.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 pt-1 border-t border-zinc-200">
                  <span>{t('admin.orders.totalPaid')}:</span>
                  <span>{formatPrice(selectedOrder.totals.total)}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  {t('admin.orders.closeBtn')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

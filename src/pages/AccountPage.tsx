import React, { useEffect, useState } from 'react';
import {
  User,
  Package,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Camera,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { getUserOrders } from '../lib/ordersApi';
import { FirestoreOrder, OrderStatus } from '../types/auth';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';

export const AccountPage: React.FC = () => {
  const { lang, isRTL, t, formatPrice, formatNumber } = useI18n();
  const { user, profile, isAdmin, logout, loading: authLoading, updateProfileData } = useAuth();
  const localeNavigate = useLocaleNavigate();

  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoInput, setPhotoInput] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    if (profile?.photoURL || user?.photoURL) {
      setPhotoInput(profile?.photoURL || user?.photoURL || '');
    }
  }, [profile?.photoURL, user?.photoURL]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      localeNavigate('/login?returnUrl=/account');
    }
  }, [user, authLoading, localeNavigate]);

  // Load user orders
  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      getUserOrders(user.uid)
        .then((data) => setOrders(data))
        .catch((err) => console.error('Failed to load orders', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      localeNavigate('/');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 stroke-[1.5]" />
            <span>{lang === 'fa' ? 'تحویل داده شده' : 'Delivered'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3 stroke-[1.5]" />
            <span>{lang === 'fa' ? 'ارسال شده با پیک VIP' : 'Shipped'}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 stroke-[1.5]" />
            <span>{lang === 'fa' ? 'در حال آماده‌سازی و بسته‌بندی' : 'Processing'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 stroke-[1.5]" />
            <span>{lang === 'fa' ? 'لغو شده' : 'Cancelled'}</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium bg-gold/15 text-gold-dark border border-gold/40">
            <Clock className="w-3 h-3 stroke-[1.5]" />
            <span>{lang === 'fa' ? 'در انتظار تایید سفارش' : 'Pending'}</span>
          </span>
        );
    }
  };

  if (authLoading || !user) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-muted font-light">{lang === 'fa' ? 'در حال بارگذاری...' : 'Loading profile...'}</p>
      </div>
    );
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-ivory min-h-screen text-start">
      <Seo
        title={lang === 'fa' ? 'حساب کاربری | میسون رایحه' : 'My Account | Maison Rayeha'}
        description={lang === 'fa' ? 'مشاهده سفارشات و مدیریت حساب کاربری در خانه عطر میسون رایحه' : 'View orders and manage your Maison Rayeha profile'}
      />

      <Container size="lg">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-10 border-b border-border/80">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] rtl:tracking-normal text-gold-dark font-medium block mb-1">
              Patron Concierge
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-light text-near-black">
              {lang === 'fa' ? 'حساب کاربری اختصاصی' : 'Personal Account'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <LocaleLink
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-xs font-medium bg-near-black text-gold hover:bg-near-black/90 transition-colors shadow-2xs border border-gold/30"
              >
                <Shield className="w-4 h-4 stroke-[1.5]" />
                <span>{lang === 'fa' ? 'ورود به پنل مدیریت' : 'Admin Panel'}</span>
              </LocaleLink>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5 stroke-[1.5]" />}
            >
              {lang === 'fa' ? 'خروج از حساب' : 'Sign Out'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Profile Card (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-ivory-surface border border-border/80 p-6 rounded-xs shadow-2xs">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/70">
                <div className="relative group/avatar shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/40 text-gold-dark font-display text-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {profile?.photoURL || user.photoURL ? (
                      <img
                        src={profile?.photoURL || user.photoURL || ''}
                        alt={profile?.name || user.displayName || 'Patron'}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'P'}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                    title={lang === 'fa' ? 'تغییر تصویر پروفایل' : 'Change profile photo'}
                    className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-near-black text-gold border border-gold/40 flex items-center justify-center hover:bg-gold hover:text-near-black transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3 h-3 stroke-[1.5]" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-medium text-near-black truncate">
                    {profile?.name || user.displayName || 'Patron'}
                  </h2>
                  <p className="text-xs text-muted font-light mt-0.5 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium bg-gold/20 text-gold-dark border border-gold/40">
                        <Shield className="w-3 h-3 stroke-[1.5]" />
                        <span>{lang === 'fa' ? 'مدیر ارشد آتلیه (Admin)' : 'Administrator'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium bg-ivory text-muted border border-border">
                        <User className="w-3 h-3 stroke-[1.5]" />
                        <span>{lang === 'fa' ? 'همراه گرامی میسون رایحه' : 'Patron Member'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo URL edit form */}
              {isEditingPhoto && (
                <div className="mb-5 p-3 bg-[var(--bg-surface-raised)] border border-[var(--border)] rounded-xs space-y-2.5">
                  <label className="text-[11px] font-medium text-[var(--text-primary)] block">
                    {lang === 'fa' ? 'آدرس تصویر پروفایل (Photo URL):' : 'Profile Photo URL:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoInput}
                      onChange={(e) => setPhotoInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 min-h-[38px] px-2.5 py-1 text-xs border border-[var(--border)] rounded-xs bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      disabled={savingPhoto}
                      onClick={async () => {
                        setSavingPhoto(true);
                        try {
                          await updateProfileData({ photoURL: photoInput.trim() });
                          setIsEditingPhoto(false);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSavingPhoto(false);
                        }
                      }}
                      className="min-h-[38px] px-3 bg-gold text-near-black hover:bg-gold-dark hover:text-white rounded-xs text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'ثبت' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPhoto(false)}
                      className="min-h-[38px] px-2.5 border border-border text-muted hover:text-near-black rounded-xs text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted font-light">
                    {lang === 'fa'
                      ? 'تصویر پس از ذخیره به‌صورت خودکار در نشان دایره‌ای بالای سایت نمایش داده می‌شود.'
                      : 'After saving, this photo displays inside the circular avatar in the header.'}
                  </p>
                </div>
              )}

              {/* Profile Details */}
              <div className="space-y-3 text-xs">
                {profile?.phone && (
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted font-light">{lang === 'fa' ? 'شماره تماس:' : 'Phone:'}</span>
                    <span className="font-mono text-near-black">{profile.phone}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted font-light">{lang === 'fa' ? 'عضویت از:' : 'Member Since:'}</span>
                  <span className="font-mono text-near-black">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '2026'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted font-light">{lang === 'fa' ? 'وضعیت تایید حساب:' : 'Status:'}</span>
                  <span className="text-emerald-700 font-medium">{lang === 'fa' ? 'فعال و تاییدشده' : 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Concierge Assistance Box */}
            <div className="bg-gold/10 border border-gold/30 p-5 rounded-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-near-black mb-1">
                {lang === 'fa' ? 'مشاوره اختصاصی انتخاب عطر' : 'Private Concierge'}
              </h3>
              <p className="text-[11px] text-muted font-light leading-relaxed">
                {lang === 'fa'
                  ? 'کارشناسان بویایی ما آماده پاسخگویی به سوالات و انتخاب شاهکارهای متناسب با طبع شما هستند.'
                  : 'Our master perfumers are at your service for bespoke fragrance advice.'}
              </p>
            </div>
          </div>

          {/* Orders History (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <div className="bg-ivory-surface border border-border/80 p-6 sm:p-8 rounded-xs shadow-2xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 stroke-[1.5] text-gold-dark" />
                  <h2 className="text-lg font-display text-near-black">
                    {lang === 'fa' ? 'تاریخچه سفارش‌های شما' : 'Order History'}
                  </h2>
                </div>
                <span className="text-xs text-muted font-mono">
                  {formatNumber(orders.length)} {lang === 'fa' ? 'سفارش ثبت‌شده' : 'orders'}
                </span>
              </div>

              {ordersLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted">{lang === 'fa' ? 'در حال فراخوانی سفارش‌ها از دیتابیس...' : 'Fetching orders...'}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <Package className="w-12 h-12 stroke-[1.5] text-gold-dark/60 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-near-black">
                      {lang === 'fa' ? 'تاکنون سفارشی با این حساب ثبت نکرده‌اید.' : 'No orders recorded yet.'}
                    </p>
                    <p className="text-xs text-muted font-light mt-1">
                      {lang === 'fa'
                        ? 'اولین شاهکار بویایی خود را از گالری عطرهای نیش انتخاب فرمایید.'
                        : 'Explore our haute parfumerie gallery and order your first signature flacon.'}
                    </p>
                  </div>
                  <LocaleLink
                    to="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-medium bg-near-black text-ivory hover:bg-gold hover:text-near-black transition-colors shadow-2xs mt-2"
                  >
                    <span>{lang === 'fa' ? 'مشاهده کلکسیون عطرها' : 'Explore Collections'}</span>
                    <ArrowIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  </LocaleLink>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div
                      key={ord.id || ord.orderNumber}
                      className="border border-border/70 rounded-xs p-5 hover:border-gold/50 transition-colors bg-ivory"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-border/50 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-muted font-light">{lang === 'fa' ? 'کد سفارش:' : 'Order ID:'}</span>
                            <span className="font-mono font-medium text-near-black">{ord.orderNumber}</span>
                          </div>
                          <div className="text-[11px] text-muted">
                            {new Date(ord.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(ord.status)}
                          <span className="font-mono font-semibold text-near-black text-sm">
                            {formatPrice(ord.totals.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2.5 py-1">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-xs border border-border/50 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-near-black truncate">
                                  {lang === 'fa' ? item.productName.fa : item.productName.en}
                                </p>
                                <p className="text-[11px] text-muted">
                                  {item.size} × {formatNumber(item.quantity)}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-muted text-xs shrink-0">
                              {formatPrice(
                                (lang === 'fa' ? item.unitPrice.fa : item.unitPrice.en) * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted">
                        <span>
                          {lang === 'fa' ? 'شیوه ارسال:' : 'Shipping:'}{' '}
                          {ord.shippingMethod === 'vip_courier'
                            ? (lang === 'fa' ? 'پیک اختصاصی VIP' : 'VIP Courier')
                            : (lang === 'fa' ? 'پست ویژه بیمه‌شده' : 'Insured Express')}
                        </span>
                        <span>{lang === 'fa' ? 'جعبه چوبی مهر و موم شده' : 'Lacquered wooden coffret'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

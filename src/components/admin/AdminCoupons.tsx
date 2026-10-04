import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Tag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Calendar,
  Percent,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import {
  FirestoreCoupon,
  getAllCoupons,
  saveCoupon,
  toggleCouponActive,
  deleteCoupon,
  seedDefaultCoupons,
} from '../../lib/couponsApi';
import { FirestoreOrder } from '../../types/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AdminCouponsProps {
  orders: FirestoreOrder[];
  onShowMessage?: (msg: { text: string; type: 'success' | 'error' }) => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ orders, onShowMessage }) => {
  const { lang, t, formatPrice, formatNumber } = useI18n();

  const [coupons, setCoupons] = useState<FirestoreCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<FirestoreCoupon | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form inputs
  const [formCode, setFormCode] = useState<string>('');
  const [formType, setFormType] = useState<'percent' | 'fixed'>('percent');
  const [formValue, setFormValue] = useState<string>('10');
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<string>('0');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formNote, setFormNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Single getDocs load
  const loadCoupons = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.coupons.errorLoad'),
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, onShowMessage]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Count how many orders used each coupon code (calculated once when orders are loaded)
  const usageCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      const code = order.couponCode || (order as any).coupon?.code;
      if (code) {
        const upper = String(code).trim().toUpperCase();
        counts[upper] = (counts[upper] || 0) + 1;
      }
    }
    return counts;
  }, [orders]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormType('percent');
    setFormValue('10');
    setFormExpiresAt('');
    setFormMinOrderAmount('0');
    setFormIsActive(true);
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: FirestoreCoupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormType(coupon.type);
    setFormValue(String(coupon.value));

    let expDateString = '';
    if (coupon.expiresAt) {
      try {
        const d = (coupon.expiresAt as any)?.toDate
          ? (coupon.expiresAt as any).toDate()
          : new Date(coupon.expiresAt as any);
        if (!isNaN(d.getTime())) {
          expDateString = d.toISOString().split('T')[0];
        }
      } catch (e) {
        // ignore format error
      }
    }
    setFormExpiresAt(expDateString);
    setFormMinOrderAmount(String(coupon.minOrderAmount || 0));
    setFormIsActive(coupon.isActive);
    setFormNote(coupon.note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanCode) {
      setFormError(t('admin.coupons.errorEmptyCode'));
      return;
    }

    const numericValue = Number(formValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      setFormError(t('admin.coupons.errorPositiveValue'));
      return;
    }

    if (formType === 'percent' && (numericValue < 1 || numericValue > 100)) {
      setFormError(t('admin.coupons.errorPercentRange'));
      return;
    }

    const numericMinOrder = Math.max(0, Number(formMinOrderAmount) || 0);

    // Uniqueness validation on creation
    if (!editingCoupon) {
      const codeExists = coupons.some((c) => c.code === cleanCode);
      if (codeExists) {
        setFormError(t('admin.coupons.errorCodeExists', { code: cleanCode }));
        return;
      }
    }

    setIsSaving(true);
    try {
      await saveCoupon(
        {
          code: cleanCode,
          type: formType,
          value: numericValue,
          isActive: formIsActive,
          expiresAt: formExpiresAt ? formExpiresAt : null,
          minOrderAmount: numericMinOrder,
          note: formNote.trim(),
        },
        Boolean(editingCoupon)
      );

      setIsModalOpen(false);
      if (onShowMessage) {
        onShowMessage({
          text: editingCoupon
            ? t('admin.coupons.couponUpdated', { code: cleanCode })
            : t('admin.coupons.couponCreated', { code: cleanCode }),
          type: 'success',
        });
      }
      await loadCoupons();
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      setFormError(err.message || t('admin.coupons.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: FirestoreCoupon) => {
    setTogglingCode(coupon.code);
    try {
      await toggleCouponActive(coupon.code, coupon.isActive);
      // Optimistic update
      setCoupons((prev) =>
        prev.map((c) => (c.code === coupon.code ? { ...c, isActive: !c.isActive } : c))
      );
      if (onShowMessage) {
        onShowMessage({
          text: !coupon.isActive
            ? t('admin.coupons.couponActivated', { code: coupon.code })
            : t('admin.coupons.couponDeactivated', { code: coupon.code }),
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Failed to toggle coupon active status:', err);
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.coupons.errorToggle'),
          type: 'error',
        });
      }
      await loadCoupons();
    } finally {
      setTogglingCode(null);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteConfirmCode) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(deleteConfirmCode);
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.coupons.couponDeleted', { code: deleteConfirmCode }),
          type: 'success',
        });
      }
      setDeleteConfirmCode(null);
      await loadCoupons();
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.coupons.errorDelete'),
          type: 'error',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const result = await seedDefaultCoupons();
      if (onShowMessage) {
        if (result.createdCount > 0) {
          onShowMessage({
            text: t('admin.coupons.defaultCodesImported', { count: formatNumber(result.createdCount) }),
            type: 'success',
          });
        } else {
          onShowMessage({
            text: t('admin.coupons.defaultCodesExist'),
            type: 'success',
          });
        }
      }
      await loadCoupons();
    } catch (err: any) {
      console.error('Failed to seed default coupons:', err);
      if (onShowMessage) {
        onShowMessage({
          text: t('admin.coupons.errorSeed'),
          type: 'error',
        });
      }
    } finally {
      setSeeding(false);
    }
  };

  const formatExpiry = (expiresAt: any) => {
    if (!expiresAt) {
      return (
        <span className="text-zinc-400 text-[11px]">
          {t('admin.coupons.noExpiry')}
        </span>
      );
    }
    try {
      const d = (expiresAt as any)?.toDate ? (expiresAt as any).toDate() : new Date(expiresAt);
      if (isNaN(d.getTime())) return '-';
      const isPast = d.getTime() < Date.now();
      return (
        <span className={`text-[11px] font-mono ${isPast ? 'text-red-500 font-semibold' : 'text-zinc-600'}`}>
          {lang === 'fa' ? d.toLocaleDateString('fa-IR') : d.toLocaleDateString('en-US')}
          {isPast && (
            <span className="ms-1 text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">
              ({t('admin.coupons.expired')})
            </span>
          )}
        </span>
      );
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-md shadow-xs">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gold-dark stroke-[1.5]" />
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {t('admin.coupons.title')}
            </h2>
            <p className="text-xs text-zinc-500">
              {t('admin.coupons.totalCodes', { count: formatNumber(coupons.length) })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCoupons(true)}
            disabled={refreshing || loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 stroke-[1.5] ${refreshing ? 'animate-spin' : ''}`} />}
          >
            {t('admin.coupons.refresh')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={seeding || loading}
            leftIcon={<Sparkles className="w-3.5 h-3.5 stroke-[1.5] text-gold-dark" />}
          >
            {seeding ? t('admin.coupons.importing') : t('admin.coupons.importDefaults')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4 stroke-[1.5]" />}
          >
            {t('admin.coupons.newCoupon')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">
              {t('admin.coupons.loading')}
            </p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs">
            <Tag className="w-10 h-10 stroke-[1] text-zinc-300 mx-auto mb-2" />
            <p className="font-medium text-zinc-700 mb-1">
              {t('admin.coupons.emptyTitle')}
            </p>
            <p className="text-zinc-400 mb-4">
              {t('admin.coupons.emptyDesc')}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSeedDefaults} disabled={seeding}>
                {t('admin.coupons.importDefaults')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
                {t('admin.coupons.createFirst')}
              </Button>
            </div>
          </div>
        ) : (
          <table className="w-full text-xs text-start">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 font-medium">
              <tr>
                <th className="py-3 px-4 text-start">{t('admin.coupons.thCode')}</th>
                <th className="py-3 px-4 text-start">{t('admin.coupons.thType')}</th>
                <th className="py-3 px-4 text-start">{t('admin.coupons.thValue')}</th>
                <th className="py-3 px-4 text-center">{t('admin.coupons.thStatus')}</th>
                <th className="py-3 px-4 text-start">{t('admin.coupons.thExpiry')}</th>
                <th className="py-3 px-4 text-start">{t('admin.coupons.thMinOrder')}</th>
                <th className="py-3 px-4 text-center">{t('admin.coupons.thOrdersUsed')}</th>
                <th className="py-3 px-4 text-end">{t('admin.coupons.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {coupons.map((c) => {
                const usedCount = usageCountMap[c.code] || 0;
                const isTogglingThis = togglingCode === c.code;

                return (
                  <tr key={c.code} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded tracking-wider">
                          <bdi dir="ltr">{c.code}</bdi>
                        </span>
                        {c.note && (
                          <span className="text-[11px] text-zinc-400 truncate max-w-[150px]" title={c.note}>
                            ({c.note})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                        {c.type === 'percent' ? (
                          <>
                            <Percent className="w-3 h-3 text-gold-dark" />
                            <span>{t('admin.coupons.typePercent')}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3 text-emerald-600" />
                            <span>{t('admin.coupons.typeFixed')}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {c.type === 'percent' ? (
                        <span className="font-mono text-gold-dark">{formatNumber(c.value)}{lang === 'fa' ? '٪' : '%'}</span>
                      ) : (
                        <span className="font-mono">{formatPrice(c.value)}</span>
                      )}
                    </td>

                    {/* Active Toggle Switch */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        disabled={isTogglingThis}
                        title={
                          c.isActive
                            ? t('admin.coupons.clickToDeactivate')
                            : t('admin.coupons.clickToActivate')
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                          } ${isTogglingThis ? 'animate-ping' : ''}`}
                        />
                        <span>
                          {c.isActive
                            ? t('admin.coupons.active')
                            : t('admin.coupons.inactive')}
                        </span>
                      </button>
                    </td>

                    {/* Expiry */}
                    <td className="py-3 px-4">{formatExpiry(c.expiresAt)}</td>

                    {/* Minimum Order */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {c.minOrderAmount && c.minOrderAmount > 0 ? (
                        formatPrice(c.minOrderAmount)
                      ) : (
                        <span className="text-zinc-400 font-sans">{t('admin.coupons.noMinOrder')}</span>
                      )}
                    </td>

                    {/* Used Count */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                          usedCount > 0
                            ? 'bg-gold/15 text-gold-dark font-bold'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {formatNumber(usedCount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          title={t('admin.coupons.editTooltip')}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmCode(c.code)}
                          title={t('admin.coupons.deleteTooltip')}
                          className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto text-start text-xs border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-dark stroke-[1.5]" />
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingCoupon
                    ? t('admin.coupons.modalEditTitle', { code: editingCoupon.code })
                    : t('admin.coupons.modalCreateTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block font-medium text-zinc-800 mb-1">
                  {t('admin.coupons.formCodeLabel')}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <Input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. WELCOME10"
                  disabled={Boolean(editingCoupon)}
                  className="font-mono uppercase tracking-wider text-xs"
                  required
                />
                {editingCoupon && (
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {t('admin.coupons.formCodeRenameNotice')}
                  </p>
                )}
              </div>

              {/* Type and Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-800 mb-1">
                    {t('admin.coupons.formTypeLabel')}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'percent' | 'fixed')}
                    className="w-full h-10 px-3 border border-zinc-300 rounded text-xs bg-white text-zinc-900 focus:outline-none focus:border-zinc-900"
                  >
                    <option value="percent">{t('admin.coupons.formTypePercentOption')}</option>
                    <option value="fixed">{t('admin.coupons.formTypeFixedOption')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-800 mb-1">
                    {formType === 'percent'
                      ? t('admin.coupons.formValuePercentLabel')
                      : t('admin.coupons.formValueFixedLabel')}
                    <span className="text-red-500 ms-1">*</span>
                  </label>
                  <Input
                    type="number"
                    min={formType === 'percent' ? 1 : 1000}
                    max={formType === 'percent' ? 100 : undefined}
                    step={formType === 'percent' ? 1 : 1000}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* Minimum Order Amount */}
              <div>
                <label className="block font-medium text-zinc-800 mb-1">
                  {t('admin.coupons.formMinOrderLabel')}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="10000"
                  value={formMinOrderAmount}
                  onChange={(e) => setFormMinOrderAmount(e.target.value)}
                  className="font-mono text-xs"
                  placeholder="0"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block font-medium text-zinc-800 mb-1">
                  {t('admin.coupons.formExpiryLabel')}
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="text-xs"
                  />
                  {formExpiresAt && (
                    <button
                      type="button"
                      onClick={() => setFormExpiresAt('')}
                      className="absolute end-2 top-2.5 text-zinc-400 hover:text-zinc-600 text-[11px]"
                    >
                      {t('admin.coupons.formClear')}
                    </button>
                  )}
                </div>
              </div>

              {/* Note / Description */}
              <div>
                <label className="block font-medium text-zinc-800 mb-1">
                  {t('admin.coupons.formNoteLabel')}
                </label>
                <Input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder={t('admin.coupons.formNotePlaceholder')}
                  className="text-xs"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded">
                <div>
                  <span className="font-semibold text-zinc-900 block">
                    {t('admin.coupons.formActiveTitle')}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {formIsActive
                      ? t('admin.coupons.formActiveDesc')
                      : t('admin.coupons.formInactiveDesc')}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  {t('admin.coupons.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  {editingCoupon
                    ? t('admin.coupons.saveChanges')
                    : t('admin.coupons.createCouponBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-start text-xs border border-zinc-200">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900">
                  {t('admin.coupons.deleteModalTitle')}
                </h4>
                <p className="text-zinc-500 text-xs">
                  {t('admin.coupons.deleteConfirmQuestion', { code: deleteConfirmCode })}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 mb-4 bg-zinc-50 p-2.5 rounded border border-zinc-200">
              {t('admin.coupons.deleteWarning')}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmCode(null)}
                disabled={isDeleting}
              >
                {t('admin.coupons.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteCoupon}
                disabled={isDeleting}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('admin.coupons.yesDelete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

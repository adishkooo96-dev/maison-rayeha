import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RefreshCw,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useI18n } from '../../hooks/useI18n';
import {
  AboutContent,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  getAboutContent,
  saveAboutContent,
} from '../../lib/contentApi';
import { Button } from '../ui/Button';

interface AdminContentProps {
  onShowMessage?: (msg: { text: string; type: 'success' | 'error' }) => void;
}

export const AdminContent: React.FC<AdminContentProps> = ({ onShowMessage }) => {
  const { lang, t, formatNumber } = useI18n();

  // Default to 'contact' sub-tab so the Contact form is immediately accessible
  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'about'>('contact');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // --- CONTACT PAGE FORM STATES (Individual flat states for 100% reliable editing) ---
  const [addressFa, setAddressFa] = useState<string>(DEFAULT_CONTACT_CONTENT.address.fa);
  const [addressEn, setAddressEn] = useState<string>(DEFAULT_CONTACT_CONTENT.address.en);
  const [phone, setPhone] = useState<string>(DEFAULT_CONTACT_CONTENT.phone);
  const [email, setEmail] = useState<string>(DEFAULT_CONTACT_CONTENT.email);
  const [workingHoursFa, setWorkingHoursFa] = useState<string>(DEFAULT_CONTACT_CONTENT.workingHours.fa);
  const [workingHoursEn, setWorkingHoursEn] = useState<string>(DEFAULT_CONTACT_CONTENT.workingHours.en);

  const [savingContact, setSavingContact] = useState<boolean>(false);
  const [contactStatus, setContactStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // --- ABOUT PAGE FORM STATES ---
  const [aboutForm, setAboutForm] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [savingAbout, setSavingAbout] = useState<boolean>(false);
  const [aboutStatus, setAboutStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load existing data from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setInitialLoading(true);
      try {
        // Fetch contact content doc
        const contactDocRef = doc(db, 'siteContent', 'contact');
        const contactSnap = await getDoc(contactDocRef);
        if (contactSnap.exists() && isMounted) {
          const cData = contactSnap.data();
          if (cData.address?.fa) setAddressFa(cData.address.fa);
          if (cData.address?.en) setAddressEn(cData.address.en);
          if (cData.phone) setPhone(cData.phone);
          if (cData.email) setEmail(cData.email);
          if (cData.workingHours?.fa) setWorkingHoursFa(cData.workingHours.fa);
          if (cData.workingHours?.en) setWorkingHoursEn(cData.workingHours.en);
        }

        // Fetch about content doc
        const aboutData = await getAboutContent();
        if (isMounted) {
          setAboutForm(aboutData);
        }
      } catch (err) {
        console.error('[AdminContent] Error loading site content on mount:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save Contact Page handler
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    setContactStatus(null);

    const payload = {
      address: {
        fa: addressFa.trim(),
        en: addressEn.trim(),
      },
      phone: phone.trim(),
      email: email.trim(),
      workingHours: {
        fa: workingHoursFa.trim(),
        en: workingHoursEn.trim(),
      },
    };

    try {
      const docRef = doc(db, 'siteContent', 'contact');
      await setDoc(docRef, payload, { merge: true });

      const successMsg = t('admin.content.contactSuccess');

      setContactStatus({ type: 'success', message: successMsg });
      if (onShowMessage) {
        onShowMessage({ text: successMsg, type: 'success' });
      }
    } catch (err: any) {
      console.error('[AdminContent] Failed to save siteContent/contact:', err);
      const detail = err?.message || err?.code || String(err);
      const errorMsg = t('admin.content.contactError', { detail });

      setContactStatus({ type: 'error', message: errorMsg });
      if (onShowMessage) {
        onShowMessage({ text: errorMsg, type: 'error' });
      }
    } finally {
      setSavingContact(false);
    }
  };

  // Save About Page handler
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    setAboutStatus(null);
    try {
      await saveAboutContent(aboutForm);
      const successMsg = t('admin.content.aboutSuccess');

      setAboutStatus({ type: 'success', message: successMsg });
      if (onShowMessage) {
        onShowMessage({ text: successMsg, type: 'success' });
      }
    } catch (err: any) {
      console.error('[AdminContent] Failed to save siteContent/about:', err);
      const detail = err?.message || err?.code || String(err);
      const errorMsg = t('admin.content.aboutError', { detail });

      setAboutStatus({ type: 'error', message: errorMsg });
      if (onShowMessage) {
        onShowMessage({ text: errorMsg, type: 'error' });
      }
    } finally {
      setSavingAbout(false);
    }
  };

  const handleResetContact = () => {
    if (window.confirm(t('admin.content.resetContactConfirm'))) {
      setAddressFa(DEFAULT_CONTACT_CONTENT.address.fa);
      setAddressEn(DEFAULT_CONTACT_CONTENT.address.en);
      setPhone(DEFAULT_CONTACT_CONTENT.phone);
      setEmail(DEFAULT_CONTACT_CONTENT.email);
      setWorkingHoursFa(DEFAULT_CONTACT_CONTENT.workingHours.fa);
      setWorkingHoursEn(DEFAULT_CONTACT_CONTENT.workingHours.en);
      setContactStatus(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-12 text-center shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500">
          {t('admin.content.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Sub-Section Switcher */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-zinc-900 text-gold flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {t('admin.content.title')}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t('admin.content.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-md shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('contact')}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'contact'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-gold-dark" />
            <span>{t('admin.content.tabContact')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('about')}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'about'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span>{t('admin.content.tabAbout')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-SECTION 1: CONTACT PAGE (REBUILT COMPLETELY)
         ======================================================== */}
      {activeSubTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-dark" />
                <h3 className="text-sm font-bold text-zinc-900">
                  {t('admin.content.contactTitle')}
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                siteContent/contact
              </span>
            </div>

            {/* 1. Address: two textareas (فارسی, English) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-800">
                {t('admin.content.addressLabel')}
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langFa')}
                  </span>
                  <textarea
                    dir="rtl"
                    rows={3}
                    value={addressFa}
                    onChange={(e) => setAddressFa(e.target.value)}
                    placeholder={t('admin.content.addressPlaceholderFa')}
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs transition-colors"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langEn')}
                  </span>
                  <textarea
                    dir="ltr"
                    rows={3}
                    value={addressEn}
                    onChange={(e) => setAddressEn(e.target.value)}
                    placeholder={t('admin.content.addressPlaceholderEn')}
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Phone: one input (the direct contact number) */}
            {/* 3. Email: one input */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('admin.content.phoneLabel')}</span>
                  </div>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === 'fa' ? '۰۲۱-۲۲۰۰۰۰۰۰' : '+98 21 22000000'}
                  className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs transition-colors"
                />
                <span className="text-[11px] text-zinc-400 block">
                  {t('admin.content.phoneHelper')}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('admin.content.emailLabel')}</span>
                  </div>
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="concierge@maisonrayeha.com"
                  className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs transition-colors"
                />
                <span className="text-[11px] text-zinc-400 block">
                  {t('admin.content.emailHelper')}
                </span>
              </div>
            </div>

            {/* 4. Working hours: two inputs/textareas (فارسی, English) */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    {t('admin.content.workingHoursLabel')}
                  </span>
                </div>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langFa')}
                  </span>
                  <textarea
                    dir="rtl"
                    rows={2}
                    value={workingHoursFa}
                    onChange={(e) => setWorkingHoursFa(e.target.value)}
                    placeholder={t('admin.content.workingHoursPlaceholderFa')}
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs transition-colors"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langEn')}
                  </span>
                  <textarea
                    dir="ltr"
                    rows={2}
                    value={workingHoursEn}
                    onChange={(e) => setWorkingHoursEn(e.target.value)}
                    placeholder={t('admin.content.workingHoursPlaceholderEn')}
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inline Status Message */}
          {contactStatus && (
            <div
              className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
                contactStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200 font-mono'
              }`}
            >
              <div className="flex items-center gap-2">
                {contactStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{contactStatus.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setContactStatus(null)}
                className="p-1 hover:opacity-70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-md shadow-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetContact}
            >
              {t('admin.content.resetContactBtn')}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={savingContact}
              leftIcon={
                savingContact ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              {savingContact
                ? t('admin.content.savingContactBtn')
                : t('admin.content.saveContactBtn')}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================
          SUB-SECTION 2: ABOUT PAGE
         ======================================================== */}
      {activeSubTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-dark" />
                <h3 className="text-sm font-bold text-zinc-900">
                  {t('admin.content.heroSectionTitle')}
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
                siteContent/about
              </span>
            </div>

            {/* Hero Headline */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-800">
                {t('admin.content.heroHeadlineLabel')}
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langFa')}
                  </span>
                  <input
                    type="text"
                    dir="rtl"
                    value={aboutForm.heroHeadline.fa}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        heroHeadline: { ...aboutForm.heroHeadline, fa: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langEn')}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={aboutForm.heroHeadline.en}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        heroHeadline: { ...aboutForm.heroHeadline, en: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hero Subtext */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-zinc-800">
                {t('admin.content.heroSubtextLabel')}
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langFa')}
                  </span>
                  <textarea
                    dir="rtl"
                    rows={3}
                    value={aboutForm.heroSubtext.fa}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        heroSubtext: { ...aboutForm.heroSubtext, fa: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langEn')}
                  </span>
                  <textarea
                    dir="ltr"
                    rows={3}
                    value={aboutForm.heroSubtext.en}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        heroSubtext: { ...aboutForm.heroSubtext, en: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Story Text */}
          <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start space-y-4">
            <div className="pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">
                {t('admin.content.storySectionTitle')}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="block text-[11px] font-medium text-zinc-500 mb-1">{t('admin.content.langFa')}</span>
                <textarea
                  dir="rtl"
                  rows={5}
                  value={aboutForm.storyText.fa}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      storyText: { ...aboutForm.storyText, fa: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs"
                  required
                />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                  {t('admin.content.langEn')}
                </span>
                <textarea
                  dir="ltr"
                  rows={5}
                  value={aboutForm.storyText.en}
                  onChange={(e) =>
                    setAboutForm({
                      ...aboutForm,
                      storyText: { ...aboutForm.storyText, en: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-y shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white border border-zinc-200 rounded-md p-5 sm:p-6 shadow-xs text-start space-y-6">
            <div className="pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">
                {t('admin.content.valuesSectionTitle')}
              </h3>
            </div>

            {/* Values Section Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-800">
                {t('admin.content.valuesTitleLabel')}
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langFa')}
                  </span>
                  <input
                    type="text"
                    dir="rtl"
                    value={aboutForm.valuesTitle.fa}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        valuesTitle: { ...aboutForm.valuesTitle, fa: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-zinc-500 mb-1">
                    {t('admin.content.langEn')}
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    value={aboutForm.valuesTitle.en}
                    onChange={(e) =>
                      setAboutForm({
                        ...aboutForm,
                        valuesTitle: { ...aboutForm.valuesTitle, en: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-zinc-300 rounded px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-2xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Value items */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-zinc-800">
                {t('admin.content.valuesCardsLabel')}
              </label>

              {aboutForm.values.map((val, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-zinc-50 border border-zinc-200 rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <span className="text-xs font-bold text-zinc-700">
                      {t('admin.content.valueNumber', { number: formatNumber(idx + 1) })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] text-zinc-500 mb-1">{t('admin.content.titleFa')}</span>
                      <input
                        type="text"
                        dir="rtl"
                        value={val.title.fa}
                        onChange={(e) => {
                          const next = [...aboutForm.values];
                          next[idx] = {
                            ...next[idx],
                            title: { ...next[idx].title, fa: e.target.value },
                          };
                          setAboutForm({ ...aboutForm, values: next });
                        }}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
                        required
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-500 mb-1">{t('admin.content.titleEn')}</span>
                      <input
                        type="text"
                        dir="ltr"
                        value={val.title.en}
                        onChange={(e) => {
                          const next = [...aboutForm.values];
                          next[idx] = {
                            ...next[idx],
                            title: { ...next[idx].title, en: e.target.value },
                          };
                          setAboutForm({ ...aboutForm, values: next });
                        }}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] text-zinc-500 mb-1">{t('admin.content.descFa')}</span>
                      <textarea
                        dir="rtl"
                        rows={2}
                        value={val.description.fa}
                        onChange={(e) => {
                          const next = [...aboutForm.values];
                          next[idx] = {
                            ...next[idx],
                            description: { ...next[idx].description, fa: e.target.value },
                          };
                          setAboutForm({ ...aboutForm, values: next });
                        }}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-y shadow-2xs"
                        required
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-500 mb-1">
                        {t('admin.content.descEn')}
                      </span>
                      <textarea
                        dir="ltr"
                        rows={2}
                        value={val.description.en}
                        onChange={(e) => {
                          const next = [...aboutForm.values];
                          next[idx] = {
                            ...next[idx],
                            description: { ...next[idx].description, en: e.target.value },
                          };
                          setAboutForm({ ...aboutForm, values: next });
                        }}
                        className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-y shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inline About Status Message */}
          {aboutStatus && (
            <div
              className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
                aboutStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200 font-mono'
              }`}
            >
              <div className="flex items-center gap-2">
                {aboutStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{aboutStatus.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAboutStatus(null)}
                className="p-1 hover:opacity-70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end p-4 bg-white border border-zinc-200 rounded-md shadow-xs">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={savingAbout}
              leftIcon={
                savingAbout ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              {savingAbout
                ? t('admin.content.savingAboutBtn')
                : t('admin.content.saveAboutBtn')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

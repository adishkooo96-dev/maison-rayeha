import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
import { Mail, User, Phone, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';
import { PasswordInput } from '../components/ui/PasswordInput';
import { handleLiveDigitInput } from '../lib/formatters';

const registerSchema = z
  .object({
    name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل نامعتبر است'),
    phone: z.string().optional(),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور با تکرار آن مطابقت ندارد',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { lang, isRTL, t } = useI18n();
  const { register: registerAuth } = useAuth();
  const localeNavigate = useLocaleNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    setSubmitting(true);
    try {
      await registerAuth(data.name, data.email, data.password, data.phone);
      localeNavigate(returnUrl);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError(
          lang === 'fa'
            ? 'این ایمیل قبلاً در سیستم ثبت شده است. لطفاً وارد شوید.'
            : 'This email is already registered. Please sign in.'
        );
      } else if (code === 'auth/weak-password') {
        setAuthError(
          lang === 'fa'
            ? 'رمز عبور ضعیف است. لطفاً رمزی با حداقل ۶ کاراکتر انتخاب نمایید.'
            : 'Password is too weak. Please use at least 6 characters.'
        );
      } else if (code === 'auth/invalid-email') {
        setAuthError(
          lang === 'fa'
            ? 'فرمت ایمیل نامعتبر است.'
            : 'Invalid email address.'
        );
      } else {
        console.warn('Registration request failed:', err?.message || err);
        setAuthError(err?.message || (lang === 'fa' ? 'خطا در ثبت‌نام.' : 'Registration failed.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-ivory min-h-[calc(100vh-100px)] flex items-center">
      <Seo
        title={lang === 'fa' ? 'ثبت‌نام و عضویت | میسون رایحه' : 'Create an Account | Maison Rayeha'}
        description={lang === 'fa' ? 'عضویت در باشگاه خریداران نیش میسون رایحه' : 'Join the Maison Rayeha patron community'}
      />

      <Container size="sm" className="w-full">
        <div className="bg-ivory-surface border border-border/80 p-8 sm:p-10 rounded-xs shadow-2xs text-start">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] rtl:tracking-normal text-gold-dark font-medium block mb-2">
              Maison Rayeha Concierge
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-light text-near-black">
              {lang === 'fa' ? 'ایجاد حساب کاربری' : 'Join Maison Rayeha'}
            </h1>
            <p className="text-xs sm:text-sm text-muted font-light mt-2 max-w-sm mx-auto">
              {lang === 'fa'
                ? 'ثبت‌نام برای پیگیری سفارشات، دسترسی به نسخه‌های لیمیتد و خدمات اختصاصی'
                : 'Register to track orders, access limited vintages, and bespoke concierge'}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 stroke-[1.5]" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                {lang === 'fa' ? 'نام و نام خانوادگی' : 'Full Name'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  placeholder={lang === 'fa' ? 'مثال: امیررضا پارسا' : 'e.g. Alireza Parsa'}
                  className="w-full bg-ivory border border-border px-3.5 py-2.5 ps-10 text-xs sm:text-sm text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
                <User className="w-4 h-4 stroke-[1.5] text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.name && <p className="text-red-600 text-[11px] mt-1">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                {lang === 'fa' ? 'پست الکترونیک (ایمیل)' : 'Email Address'} *
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="name@domain.com"
                  className="w-full bg-ivory border border-border px-3.5 py-2.5 ps-10 text-xs sm:text-sm text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
                <Mail className="w-4 h-4 stroke-[1.5] text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.email && <p className="text-red-600 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                {lang === 'fa' ? 'شماره تماس (جهت هماهنگی ارسال)' : 'Phone Number (Optional)'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  {...register('phone', {
                    onChange: handleLiveDigitInput,
                  })}
                  onInput={handleLiveDigitInput}
                  placeholder="0912..."
                  className="w-full bg-ivory border border-border px-3.5 py-2.5 ps-10 text-xs sm:text-sm text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
                <Phone className="w-4 h-4 stroke-[1.5] text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                {lang === 'fa' ? 'رمز عبور' : 'Password'} *
              </label>
              <PasswordInput
                id="register-password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-600 text-[11px] mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                {lang === 'fa' ? 'تکرار رمز عبور' : 'Confirm Password'} *
              </label>
              <PasswordInput
                id="register-confirm-password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-[11px] mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full min-h-[44px] justify-center mt-3"
              rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
            >
              {submitting
                ? (lang === 'fa' ? 'در حال ثبت‌نام...' : 'Creating account...')
                : (lang === 'fa' ? 'تکمیل عضویت' : 'Complete Registration')}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-border/70 text-center">
            <p className="text-xs text-muted font-light">
              {lang === 'fa' ? 'قبلاً ثبت‌نام کرده‌اید؟' : 'Already have an account?'}{' '}
              <LocaleLink
                to={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                className="text-gold-dark hover:text-gold font-medium underline ms-1 transition-colors"
              >
                {lang === 'fa' ? 'ورود به حساب کاربری' : 'Sign in'}
              </LocaleLink>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

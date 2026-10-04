import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Mail,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { LocaleLink } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';

const COOLDOWN_SECONDS = 30;

export const ForgotPasswordPage: React.FC = () => {
  const { lang, isRTL, t } = useI18n();

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Dynamic Zod schema with localized error messages
  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(
        1,
        t('forgotPassword.emailRequired') ||
          (lang === 'fa' ? 'ایمیل الزامی است' : 'Email is required')
      )
      .email(
        t('forgotPassword.emailInvalid') ||
          (lang === 'fa' ? 'فرمت ایمیل نامعتبر است' : 'Invalid email format')
      ),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (cooldown > 0) return;

    setGeneralError(null);
    setSubmitting(true);
    const targetEmail = data.email.trim();

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setIsSubmitted(true);
      setSubmittedEmail(targetEmail);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      const code = err?.code || '';
      // Security measure: Never expose whether an email exists in the system
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-email'
      ) {
        setIsSubmitted(true);
        setSubmittedEmail(targetEmail);
        setCooldown(COOLDOWN_SECONDS);
      } else if (code === 'auth/too-many-requests') {
        setGeneralError(
          lang === 'fa'
            ? 'درخواست‌های بیش از حد مجاز. لطفاً دقایقی دیگر مجدداً تلاش فرمایید.'
            : 'Too many attempts. Please try again shortly.'
        );
      } else {
        console.warn('Password reset technical failure:', err?.message || err);
        setGeneralError(
          t('forgotPassword.errorMessage') ||
            (lang === 'fa'
              ? 'خطا در برقراری ارتباط. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش فرمایید.'
              : 'Network or server error. Please check your connection and try again.')
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || !submittedEmail) return;
    onSubmit({ email: submittedEmail });
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="py-16 sm:py-24 bg-ivory min-h-[calc(100vh-200px)] flex items-center">
      <Seo
        title={
          t('forgotPassword.metaTitle') ||
          (lang === 'fa' ? 'بازیابی رمز عبور | میسون رایحه' : 'Reset Password | Maison Rayeha')
        }
        description={
          t('forgotPassword.metaDescription') ||
          (lang === 'fa'
            ? 'بازیابی رمز عبور حساب کاربری خانه عطر میسون رایحه'
            : 'Reset your Maison Rayeha account password')
        }
      />

      <Container size="sm" className="w-full">
        <div className="bg-ivory-surface border border-border/80 p-8 sm:p-10 rounded-xs shadow-2xs text-start">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] rtl:tracking-normal text-gold-dark font-medium block mb-2">
              {t('forgotPassword.badge') || 'Maison Rayeha Concierge'}
            </span>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold-dark">
                <KeyRound className="w-5 h-5 stroke-[1.5]" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-light text-near-black">
              {t('forgotPassword.title') || (lang === 'fa' ? 'بازیابی رمز عبور' : 'Reset Your Password')}
            </h1>
            <p className="text-xs sm:text-sm text-muted font-light mt-2 max-w-sm mx-auto">
              {t('forgotPassword.subtitle') ||
                (lang === 'fa'
                  ? 'ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود'
                  : "Enter your email and we'll send you a reset link")}
            </p>
          </div>

          {generalError && (
            <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 stroke-[1.5]" />
              <span>{generalError}</span>
            </div>
          )}

          {isSubmitted ? (
            /* Success State */
            <div className="space-y-6">
              <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200/90 rounded-xs text-start">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[1.75]" />
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-medium text-emerald-900">
                      {t('forgotPassword.successTitle') ||
                        (lang === 'fa' ? 'درخواست بازیابی ثبت شد' : 'Request Received')}
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed font-light">
                      {t('forgotPassword.successMessage') ||
                        (lang === 'fa'
                          ? 'در صورت وجود حساب با این ایمیل، لینک بازیابی ارسال شد.'
                          : 'If an account exists with this email, a reset link has been sent.')}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 font-light pt-1">
                      {t('forgotPassword.successHint') ||
                        (lang === 'fa'
                          ? 'لطفاً صندوق ورودی (Inbox) و پوشه هرزنامه (Spam) ایمیل خود را بررسی نمایید.'
                          : 'Please check your inbox and spam folders.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cooldown / Resend actions */}
              <div className="space-y-3 pt-2">
                {cooldown > 0 ? (
                  <p className="text-center text-xs text-muted font-light">
                    {lang === 'fa'
                      ? `امکان ارسال مجدد تا ${cooldown.toLocaleString('fa-IR')} ثانیه دیگر`
                      : `Resend available in ${cooldown}s`}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={submitting}
                    className="w-full justify-center text-xs min-h-[40px]"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />}
                  >
                    {t('forgotPassword.resendButton') ||
                      (lang === 'fa' ? 'ارسال مجدد لینک' : 'Resend Reset Link')}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSubmitted(false);
                    setGeneralError(null);
                  }}
                  className="w-full justify-center text-xs text-muted hover:text-near-black"
                >
                  {t('forgotPassword.tryAnother') ||
                    (lang === 'fa' ? 'استفاده از ایمیل دیگر' : 'Try another email')}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="pt-4 border-t border-border/70 text-center">
                <LocaleLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gold-dark hover:text-gold font-medium transition-colors"
                >
                  <BackArrowIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>
                    {t('forgotPassword.backToLogin') ||
                      (lang === 'fa' ? 'بازگشت به صفحه ورود' : 'Back to Sign In')}
                  </span>
                </LocaleLink>
              </div>
            </div>
          ) : (
            /* Email Request Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-near-black font-medium mb-1.5">
                  {t('forgotPassword.emailLabel') ||
                    (lang === 'fa' ? 'پست الکترونیک (ایمیل)' : 'Email Address')}{' '}
                  *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    {...register('email')}
                    placeholder={
                      t('forgotPassword.emailPlaceholder') || 'name@domain.com'
                    }
                    className="w-full bg-ivory border border-border px-3.5 py-2.5 ps-10 text-xs sm:text-sm text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  />
                  <Mail className="w-4 h-4 stroke-[1.5] text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-[11px] mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || cooldown > 0}
                className="w-full min-h-[44px] justify-center mt-2"
                rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
              >
                {submitting
                  ? t('forgotPassword.submitting') ||
                    (lang === 'fa' ? 'در حال ارسال...' : 'Sending...')
                  : cooldown > 0
                  ? lang === 'fa'
                    ? `ارسال مجدد (${cooldown.toLocaleString('fa-IR')} ثانیه)`
                    : `Resend (${cooldown}s)`
                  : t('forgotPassword.submitButton') ||
                    (lang === 'fa' ? 'ارسال لینک بازیابی' : 'Send Reset Link')}
              </Button>

              {/* Back to Login Link */}
              <div className="mt-8 pt-6 border-t border-border/70 text-center">
                <LocaleLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-gold-dark font-light transition-colors"
                >
                  <BackArrowIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>
                    {t('forgotPassword.backToLogin') ||
                      (lang === 'fa' ? 'بازگشت به صفحه ورود' : 'Back to Sign In')}
                  </span>
                </LocaleLink>
              </div>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
};

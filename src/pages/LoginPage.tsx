import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { Seo } from '../components/seo/Seo';
import { WelcomeModal } from '../components/common/WelcomeModal';
import { PasswordInput } from '../components/ui/PasswordInput';

const loginSchema = z.object({
  email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { lang, isRTL, t } = useI18n();
  const { login, profile } = useAuth();
  const localeNavigate = useLocaleNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  // Return URL after login (defaults to Home '/')
  const searchParams = new URLSearchParams(location.search);
  const rawReturnUrl = searchParams.get('returnUrl');
  const returnUrl = (rawReturnUrl && rawReturnUrl !== '/account') ? rawReturnUrl : '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setSubmitting(true);
    try {
      const userProfile = await login(data.email, data.password);
      // Derive name: profile name falling back to email prefix
      const emailPrefix = data.email.split('@')[0] || 'Patron';
      const resolvedName = (userProfile?.name && userProfile.name.trim()) || emailPrefix;
      setWelcomeName(resolvedName);
      // Trigger the welcome modal instead of immediate auto-redirect
      setShowWelcomeModal(true);
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        setAuthError(
          lang === 'fa'
            ? 'ایمیل یا رمز عبور وارد شده نادرست است. در صورت نداشتن حساب کاربری، لطفاً ثبت‌نام نمایید.'
            : 'Invalid email or password. If you do not have an account yet, please register.'
        );
      } else if (code === 'auth/too-many-requests') {
        setAuthError(
          lang === 'fa'
            ? 'درخواست‌های مکرر. لطفاً دقایقی دیگر مجدداً تلاش فرمایید.'
            : 'Too many attempts. Please try again shortly.'
        );
      } else {
        console.warn('Login request failed:', err?.message || err);
        setAuthError(err?.message || (lang === 'fa' ? 'خطا در ورود به حساب.' : 'Failed to sign in.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissWelcomeModal = () => {
    setShowWelcomeModal(false);
    localeNavigate(returnUrl);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-ivory min-h-[calc(100vh-100px)] flex items-center">
      <Seo
        title={lang === 'fa' ? 'ورود به حساب کاربری | میسون رایحه' : 'Sign In | Maison Rayeha'}
        description={lang === 'fa' ? 'ورود به پنل اختصاصی مشتریان خانه عطر میسون رایحه' : 'Sign in to your Maison Rayeha patron account'}
      />

      <Container size="sm" className="w-full">
        <div className="bg-ivory-surface border border-border/80 p-8 sm:p-10 rounded-xs shadow-2xs text-start">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] rtl:tracking-normal text-gold-dark font-medium block mb-2">
              Maison Rayeha Concierge
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-light text-near-black">
              {lang === 'fa' ? 'ورود به حساب کاربری' : 'Sign in to Your Account'}
            </h1>
            <p className="text-xs sm:text-sm text-muted font-light mt-2 max-w-sm mx-auto">
              {lang === 'fa'
                ? 'به باشگاه همراهان و خریداران عطر نیش میسون رایحه خوش آمدید'
                : 'Access your curated orders, sensory preferences, and bespoke concierge'}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 stroke-[1.5]" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              {errors.email && (
                <p className="text-red-600 text-[11px] mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-near-black font-medium">
                  {lang === 'fa' ? 'رمز عبور' : 'Password'} *
                </label>
              </div>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-600 text-[11px] mt-1">{errors.password.message}</p>
              )}
              <div className="flex justify-end mt-2">
                <LocaleLink
                  to="/forgot-password"
                  className="text-[11px] sm:text-xs text-muted hover:text-gold-dark font-light transition-colors"
                >
                  {lang === 'fa' ? 'رمز عبور را فراموش کرده‌اید؟' : 'Forgot password?'}
                </LocaleLink>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full min-h-[44px] justify-center mt-2"
              rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
            >
              {submitting
                ? (lang === 'fa' ? 'در حال ورود...' : 'Signing in...')
                : (lang === 'fa' ? 'ورود به حساب' : 'Sign In')}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-border/70 text-center">
            <p className="text-xs text-muted font-light">
              {lang === 'fa' ? 'هنوز عضو خانواده میسون رایحه نشده‌اید؟' : "Don't have an account yet?"}{' '}
              <LocaleLink
                to={`/register${returnUrl && returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                className="text-gold-dark hover:text-gold font-medium underline ms-1 transition-colors"
              >
                {lang === 'fa' ? 'عضویت و ثبت‌نام' : 'Create an Account'}
              </LocaleLink>
            </p>
          </div>
        </div>
      </Container>

      {/* Elegant Post-Login Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleDismissWelcomeModal}
        userName={welcomeName}
      />
    </div>
  );
};

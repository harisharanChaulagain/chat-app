'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/useLogin';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Mail, Lock, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const loginMutation = useLogin();
    const setUser = useUserStore((state) => state.setUser);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setRememberMe(true);
            setValue('email', savedEmail);
        }
    }, [setValue]);

    const onSubmit = (data: LoginFormData) => {
        setIsLoading(true);

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', data.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        loginMutation.mutate(data, {
            onSuccess: (response) => {
                setUser(response.user);
                setIsLoading(false);

                toast.success(response.message || 'Login successful!', {
                    duration: 3000,
                    position: 'top-right',
                    icon: '🎉',
                });

                setTimeout(() => {
                    window.location.href = '/chats';
                }, 1500);
            },
            onError: (error: Error) => {
                setIsLoading(false);
                const errorMessage =
                    (error as { response?: { data?: { message?: string } } }).response
                        ?.data?.message || 'Login failed. Please try again.';
                toast.error(errorMessage, {
                    duration: 4000,
                    position: 'top-right',
                });
            },
        });
    };

    // `overflow-x-hidden` (not `overflow-hidden`) so a short landscape viewport
    // can still scroll the card into view.
    return (
        <div className="relative flex min-h-screen-dvh items-center justify-center overflow-x-hidden bg-[var(--bg)] px-4 py-8 sm:py-10">

            {/* Background glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.14)_0%,transparent_70%)] animate-float sm:h-[500px] sm:w-[500px]" />
                <div
                    className="absolute -bottom-40 -left-40 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] sm:h-[500px] sm:w-[500px]"
                    style={{ animation: 'float 4s ease-in-out infinite 1s' }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo + heading */}
                <div
                    className="mb-6 text-center opacity-0 animate-fade-in-up sm:mb-8"
                    style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                >
                    <div
                        className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] sm:mb-5 sm:h-16 sm:w-16"
                        style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-brand)' }}
                    >
                        <MessageCircle className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                        Welcome <span className="gradient-text">back</span>
                    </h1>
                    <p className="text-sm text-[var(--muted)]">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="card space-y-4 p-5 opacity-0 animate-fade-in-up sm:space-y-5 sm:p-8"
                    style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
                >
                    {/* Email field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text)]">
                            Email address
                        </label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <Mail className="h-[18px] w-[18px] text-[var(--muted-2)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />
                            </div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={`field pl-11 ${errors.email ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                                <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text)]">
                            Password
                        </label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <Lock className="h-[18px] w-[18px] text-[var(--muted-2)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />
                            </div>
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className={`field pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--muted-2)] transition-colors hover:text-[var(--text)]"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-[18px] w-[18px]" />
                                ) : (
                                    <Eye className="h-[18px] w-[18px]" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                                <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Remember + Forgot — wraps rather than overflowing on tiny screens */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <label className="group flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[var(--border)] accent-[var(--primary)]"
                            />
                            <span className="text-[13px] text-[var(--muted)] transition-colors group-hover:text-[var(--text)] sm:text-sm">
                                Remember me
                            </span>
                        </label>
                        <a
                            href="/forgot-password"
                            className="text-[13px] font-medium text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)] sm:text-sm"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary group flex w-full items-center justify-center gap-2 py-3 font-semibold"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner spinner-inverse h-5 w-5" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                <LogIn className="h-5 w-5" />
                                Sign in
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[var(--surface)] px-3 text-[var(--muted-2)]">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social logins */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] sm:px-4"
                            onClick={() => toast.success('Google login coming soon!')}
                        >
                            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] sm:px-4"
                            onClick={() => toast('GitHub login coming soon!')}
                        >
                            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.296 2.75-1.026 2.75-1.026.544 1.378.201 2.397.099 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Sign up link */}
                    <div className="pt-1 text-center">
                        <p className="text-sm text-[var(--muted)]">
                            Don&apos;t have an account?{' '}
                            <a
                                href="/signup"
                                className="group inline-flex items-center gap-1 font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                            >
                                Create an account
                                <Sparkles className="h-3 w-3 transition-transform group-hover:rotate-12" />
                            </a>
                        </p>
                    </div>
                </form>

            </div>
        </div>
    );
}

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/useLogin';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import AuthShell, { AuthDivider, GoogleButton } from '@/components/ui/AuthShell';
import Link from 'next/link';

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

    return (
        <AuthShell
            heading="Welcome back"
            subheading="Sign in to pick up your conversations."
            artTitle="Your people are waiting."
            artBody="Pick up where you left off — your matches, messages and calls are all right where you left them."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        <p className="flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
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
                        <p className="flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
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
                            className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[var(--border)] accent-[var(--primary-fill)]"
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

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-[15px]"
                >
                    {isLoading ? (
                        <>
                            <span className="spinner spinner-inverse h-5 w-5" />
                            Signing in…
                        </>
                    ) : (
                        'Log in'
                    )}
                </button>

                <AuthDivider label="or" />

                <GoogleButton
                    label="Continue with Google"
                    onClick={() => toast.success('Google login coming soon!')}
                />

                <p className="pt-1 text-center text-sm text-[var(--muted)]">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                    >
                        Create an account
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}

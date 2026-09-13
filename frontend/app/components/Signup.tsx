'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@/hooks/useSignup';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';

const signupSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
    const signupMutation = useSignup();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema)
    });

    const password = watch('password', '');
    // Strength colours come from the palette tokens so the meter reads the same
    // in both themes.
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: '', width: '0%', color: '' };
        let score = 0;
        if (pass.length >= 6) score++;
        if (pass.length >= 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { label: 'Weak', width: '20%', color: 'var(--danger)' };
        if (score <= 2) return { label: 'Fair', width: '40%', color: '#F97316' };
        if (score <= 3) return { label: 'Good', width: '60%', color: 'var(--warning)' };
        if (score <= 4) return { label: 'Strong', width: '80%', color: '#4ADE80' };
        return { label: 'Very strong', width: '100%', color: 'var(--success)' };
    };

    const strength = getPasswordStrength(password);

    const onSubmit = (data: SignupFormData) => {
        setIsLoading(true);
        signupMutation.mutate(data, {
            onSuccess: (response) => {
                setIsLoading(false);
                toast.success(response.message || 'Account created successfully!', {
                    duration: 3000,
                    icon: '🎉',
                });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            },
            onError: (error: Error) => {
                setIsLoading(false);
                const errorMessage =
                    (error as { response?: { data?: { message?: string } } }).response
                        ?.data?.message || 'Signup failed. Please try again.';
                toast.error(errorMessage);
            },
        });
    };

    // `overflow-x-hidden` (not `overflow-hidden`) so a short landscape viewport
    // can still scroll this taller form into view.
    return (
        <div className="relative flex min-h-screen-dvh items-center justify-center overflow-x-hidden bg-[var(--bg)] px-4 py-8 sm:py-10">

            {/* Background glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_70%)] animate-float sm:h-[500px] sm:w-[500px]" />
                <div
                    className="absolute -bottom-40 -right-40 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.12)_0%,transparent_70%)] sm:h-[500px] sm:w-[500px]"
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
                        Create <span className="gradient-text">account</span>
                    </h1>
                    <p className="text-sm text-[var(--muted)]">
                        Join ChatVerse and start connecting
                    </p>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="card space-y-4 p-5 opacity-0 animate-fade-in-up sm:space-y-5 sm:p-8"
                    style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
                >
                    {/* Name field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text)]">
                            Full name
                        </label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <User className="h-[18px] w-[18px] text-[var(--muted-2)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />
                            </div>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="John Doe"
                                className={`field pl-11 ${errors.name ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                                <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

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
                                placeholder="Create a strong password"
                                className={`field pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--muted-2)] transition-colors hover:text-[var(--text)]"
                            >
                                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>
                        {/* Password strength bar */}
                        {password && (
                            <div className="space-y-1.5">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: strength.width, background: strength.color }}
                                    />
                                </div>
                                <p className="text-xs font-medium text-[var(--muted)]">
                                    {strength.label}
                                </p>
                            </div>
                        )}
                        {errors.password && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                                <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text)]">
                            Confirm password
                        </label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <Lock className="h-[18px] w-[18px] text-[var(--muted-2)] transition-colors duration-200 group-focus-within:text-[var(--primary)]" />
                            </div>
                            <input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                className={`field pl-11 pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--muted-2)] transition-colors hover:text-[var(--text)]"
                            >
                                {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                                <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                                {errors.confirmPassword.message}
                            </p>
                        )}
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
                                Creating account…
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-5 w-5" />
                                Create account
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    {/* Login link */}
                    <div className="pt-1 text-center">
                        <p className="text-sm text-[var(--muted)]">
                            Already have an account?{' '}
                            <a
                                href="/login"
                                className="group inline-flex items-center gap-1 font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                            >
                                Sign in
                                <Sparkles className="h-3 w-3 transition-transform group-hover:rotate-12" />
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

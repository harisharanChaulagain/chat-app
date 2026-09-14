'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@/hooks/useSignup';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import AuthShell, { AuthDivider, GoogleButton } from '@/components/ui/AuthShell';
import Link from 'next/link';

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

    return (
        <AuthShell
            heading="Create your account"
            subheading="It takes a minute. Then you can start saying hello."
            artTitle="Say hello to someone new."
            artBody="Follow each other and the chat opens up — messages, voice and video, all in one place."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        <p className="flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
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
                        <p className="flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
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
                        <p className="flex items-center gap-1.5 text-xs text-[var(--danger-text)]">
                            <span className="inline-block h-1 w-1 rounded-full bg-[var(--danger)]" />
                            {errors.confirmPassword.message}
                        </p>
                    )}
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
                            Creating account…
                        </>
                    ) : (
                        'Create account'
                    )}
                </button>

                <AuthDivider label="or" />

                <GoogleButton
                    label="Continue with Google"
                    onClick={() => toast.success('Google signup coming soon!')}
                />

                <p className="pt-1 text-center text-sm text-[var(--muted)]">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}

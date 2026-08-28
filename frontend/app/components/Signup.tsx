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
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: '', width: '0%', color: '' };
        let score = 0;
        if (pass.length >= 6) score++;
        if (pass.length >= 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { label: 'Weak', width: '20%', color: 'bg-red-500' };
        if (score <= 2) return { label: 'Fair', width: '40%', color: 'bg-orange-500' };
        if (score <= 3) return { label: 'Good', width: '60%', color: 'bg-yellow-500' };
        if (score <= 4) return { label: 'Strong', width: '80%', color: 'bg-green-400' };
        return { label: 'Very Strong', width: '100%', color: 'bg-green-500' };
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
            onError: (error: any) => {
                setIsLoading(false);
                const errorMessage =
                    error.response?.data?.message || 'Signup failed. Please try again.';
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)] animate-float" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)]" style={{ animation: 'float 4s ease-in-out infinite 1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo + heading */}
                <div className="text-center mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-end)] to-[var(--accent-start)] shadow-[var(--shadow-glow)] mb-5">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        Create <span className="gradient-text">Account</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">Join ChatVerse and start connecting</p>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="glass-card p-8 space-y-5 animate-fade-in-up opacity-0"
                    style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
                >
                    {/* Name field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Full Name
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-4.5 w-4.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-start)] transition-colors duration-200" />
                            </div>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="John Doe"
                                className={`input-dark pl-11 ${errors.name ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.name && (
                            <p className="text-[var(--color-error)] text-xs flex items-center gap-1.5 mt-1">
                                <span className="inline-block w-1 h-1 bg-[var(--color-error)] rounded-full" />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4.5 w-4.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-start)] transition-colors duration-200" />
                            </div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={`input-dark pl-11 ${errors.email ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[var(--color-error)] text-xs flex items-center gap-1.5 mt-1">
                                <span className="inline-block w-1 h-1 bg-[var(--color-error)] rounded-full" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4.5 w-4.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-start)] transition-colors duration-200" />
                            </div>
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                className={`input-dark pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        </div>
                        {/* Password strength bar */}
                        {password && (
                            <div className="space-y-1">
                                <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                        style={{ width: strength.width }}
                                    />
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{strength.label}</p>
                            </div>
                        )}
                        {errors.password && (
                            <p className="text-[var(--color-error)] text-xs flex items-center gap-1.5 mt-1">
                                <span className="inline-block w-1 h-1 bg-[var(--color-error)] rounded-full" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4.5 w-4.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-start)] transition-colors duration-200" />
                            </div>
                            <input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                className={`input-dark pl-11 pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-[var(--color-error)] text-xs flex items-center gap-1.5 mt-1">
                                <span className="inline-block w-1 h-1 bg-[var(--color-error)] rounded-full" />
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-btn py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Login link */}
                    <div className="text-center pt-1">
                        <p className="text-sm text-[var(--text-muted)]">
                            Already have an account?{' '}
                            <a href="/login" className="text-[var(--accent-start)] hover:text-[var(--accent-end)] font-medium transition-colors inline-flex items-center gap-1 group">
                                Sign in
                                <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@/hooks/useSignup';

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

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit = (data: SignupFormData) => {
        signupMutation.mutate(data, {
            onSuccess: (response) => {
                alert(response.message); 
            },
            onError: (error: any) => {
                const errorMessage =
                    error.response?.data?.message || 'Signup failed. Please try again.';
                alert(errorMessage); 
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4 space-y-4 border rounded">
            <div>
                <label className="block font-medium">Name</label>
                <input {...register('name')} className="w-full border px-3 py-2 rounded" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block font-medium">Email</label>
                <input {...register('email')} type="email" className="w-full border px-3 py-2 rounded" />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block font-medium">Password</label>
                <input {...register('password')} type="password" className="w-full border px-3 py-2 rounded" />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div>
                <label className="block font-medium">Confirm Password</label>
                <input {...register('confirmPassword')} type="password" className="w-full border px-3 py-2 rounded" />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign Up
            </button>


        </form>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome 🎉');
      router.push('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">Taskflow</span>
        </div>

        <div className="card p-8 shadow-xl shadow-slate-200/60">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create an account</h1>
          <p className="text-slate-500 text-sm mb-8">Start managing your tasks today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                className={`input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`input pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={`input ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full mt-2">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

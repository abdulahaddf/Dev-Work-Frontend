'use client';

import Nav from '@/components/layout/Nav';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // Get redirect path from query params
  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirect') || '/dashboard';
    }
    return '/dashboard';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authApi.login(formData);
      setAuth(response.data.data.user, response.data.data.token);
      toast.success('Welcome back!');
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <nav className="border-b border-[#1E293B] py-4">
        <Nav />
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center mx-auto mb-4"
          >
            <BriefcaseBusiness className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gradient">Welcome Back</h1>
          <p className="text-[#6B7280] mt-2">Sign in to your DevWork account</p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card space-y-5"
        >
          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
           
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
            
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Demo credentials */}
          <div className="p-4 bg-[#1E293B]/50 rounded-lg">
            <p className="text-[#6B7280] text-xs mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p className="text-[#9CA3AF]">
                <span className="text-[#EF4444]">Admin:</span> admin@devwork.com / admin123
              </p>
              <p className="text-[#9CA3AF]">
                <span className="text-[#3B82F6]">Buyer:</span> buyer@devwork.com / buyer123
              </p>
              <p className="text-[#9CA3AF]">
                <span className="text-[#10B981]">Solver:</span> solver@devwork.com / solver123
              </p>
            </div>
          </div>

          {/* Link to register */}
          <p className="text-center text-[#6B7280] text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#14B8A6] hover:underline">
              Sign up
            </Link>
          </p>
        </motion.form>
      </motion.div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import {
  BriefcaseBusiness,
  Shield,
  Users,
  FileCheck2,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import HeoSection from '@/components/layout/HeoSection';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);



  return (
    <div className="min-h-screen bg-[#020617] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className=" w-11/12 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center">
              <BriefcaseBusiness className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">DevWork</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <HeoSection/>

      {/* Footer */}
      <footer className="relative z-10  border-t border-[#1E293B] my-20 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-[#6B7280] text-sm">
          <p>Built with Next.js, Express, Prisma, and PostgreSQL</p>
          <p className="mt-2">© 2024 DevWork. Interview-ready SaaS Demo.</p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Strict permissions for Admins, Buyers, and Solvers',
    },
    {
      icon: <FileCheck2 className="w-6 h-6" />,
      title: 'Workflow Automation',
      description: 'State machine enforced project and task lifecycles',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Buyers and Solvers work together seamlessly',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#020617] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
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
      <main className="relative z-10 px-6 pt-20 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Role-Based Project Marketplace
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-[#E5E7EB]">Connect </span>
            <span className="text-gradient">Buyers</span>
            <span className="text-[#E5E7EB]"> with </span>
            <span className="text-gradient">Solvers</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-[#6B7280] mb-12 max-w-2xl mx-auto"
          >
            A production-ready SaaS platform with strict workflow enforcement,
            clean API design, and modern animated UI. Built for real teams.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card hover-glow text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-[#E5E7EB] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6B7280]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Workflow Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-24"
        >
          <div className="card-elevated p-8">
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-6 text-center">
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { step: '1', label: 'Admin assigns roles' },
                { step: '2', label: 'Buyer creates project' },
                { step: '3', label: 'Solver requests work' },
                { step: '4', label: 'Buyer assigns solver' },
                { step: '5', label: 'Solver delivers work' },
                { step: '6', label: 'Buyer reviews & accepts' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </div>
                  <span className="text-sm text-[#9CA3AF] whitespace-nowrap">{item.label}</span>
                  {index < 5 && (
                    <ArrowRight className="w-4 h-4 text-[#334155] hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1E293B] px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-[#6B7280] text-sm">
          <p>Built with Next.js, Express, Prisma, and PostgreSQL</p>
          <p className="mt-2">© 2024 DevWork. Interview-ready SaaS Demo.</p>
        </div>
      </footer>
    </div>
  );
}

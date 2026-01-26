import React from 'react'
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

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
export default function HeoSection() {
  return (
    <div className="relative z-10 px-6 pt-20 pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-11/12 mx-auto text-center"
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
      </div>
  )
}

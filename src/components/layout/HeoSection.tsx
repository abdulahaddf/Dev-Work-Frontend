import React from 'react'
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import WorkFlowSection from './WorkFlowSection';
 

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
    <div className="relative z-1 px-6 pt-20 pb-32">
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
          <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-gray-100">Connect </span>
            <span className="bg-gradient-to-r from-[#14B8A6] via-cyan-400 to-[#14B8A6] bg-clip-text text-transparent">
              Buyers
            </span>
            <span className="text-gray-100"> with </span>
            <span className="bg-gradient-to-r from-[#14B8A6] via-cyan-400 to-[#14B8A6] bg-clip-text text-transparent">
              Solvers
            </span>
          </h1>
        </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-[#6B7280] mb-12 max-w-2xl mx-auto"
          >
            A production-ready SaaS platform with strict workflow enforcement,
            clean API design, and modern animated UI. Built for real teams.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4">
              {/* CTA Buttons - Enhanced */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link href="/register" className="btn-primary">
            <span className="relative flex items-center justify-center gap-2">
              Get Started Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          
          <button className="btn-ghost">
            <span className="flex items-center justify-center gap-2">
              Schedule Demo
              <Zap className="w-5 h-5" />
            </span>
          </button>
        </div>

          </motion.div>
        </motion.div>

      <WorkFlowSection/>
      </div>
  )
}



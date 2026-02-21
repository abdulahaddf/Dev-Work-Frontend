'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Headphones, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function TrustSection() {
  return (
    <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent to-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Guarantee Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Quality Guaranteed, <br />
              <span className="text-gradient">Or Your Money Back.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
              We stand by our process. With strict task verification and role-based assignments, we ensure high standards for every project.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Escrowed Payments</h4>
                  <p className="text-sm text-gray-500">Payments are only released when you accept the completed task.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">100% Refund Policy</h4>
                  <p className="text-sm text-gray-500">Not satisfied with the result? Admins intervene to resolve disputes.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Admin CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#14B8A6]/20 blur-[100px] rounded-full" />
            <div className="relative bg-[#0F172A] border border-[#1E293B] rounded-[2rem] p-10 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Headphones className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">Connect with an Admin</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Need a custom enterprise solution or help with a complex project? Our admins are available 24/7 to assist.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    3 Admins Online Now
                  </div>
                  <div className="text-sm text-gray-500 italic">Average response time: &lt; 5 minutes</div>
                </div>

                <Link href="/register" className="btn-primary w-full group">
                  <span className="flex items-center justify-center gap-2">
                    Contact Admin Support
                    <Zap className="w-4 h-4 fill-white" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

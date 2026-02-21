'use client';

import { motion } from 'framer-motion';
import { Users, Briefcase, CheckCircle, Globe } from 'lucide-react';

const stats = [
  { label: 'Active Solvers', value: '2.5k+', icon: <Users className="w-5 h-5" /> },
  { label: 'Verified Buyers', value: '450+', icon: <Globe className="w-5 h-5" /> },
  { label: 'Projects Completed', value: '12k+', icon: <CheckCircle className="w-5 h-5" /> },
  { label: 'Total Value', value: '$8.2M', icon: <Briefcase className="w-5 h-5" /> },
];

export default function StatsSection() {
  return (
    <section className="relative z-10 px-6 py-20 bg-[#0F172A]/30 border-y border-[#1E293B]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#14B8A6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#14B8A6]">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

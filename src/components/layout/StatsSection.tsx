'use client';

import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, Briefcase, CheckCircle, Globe } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  numericValue: number;
  suffix: string;
  isMonetary?: boolean;
  icon: React.ReactNode;
}

const stats: StatItem[] = [
  { label: 'Active Solvers', value: '2.5k+', numericValue: 2500, suffix: '+', icon: <Users className="w-5 h-5" /> },
  { label: 'Verified Buyers', value: '450+', numericValue: 450, suffix: '+', icon: <Globe className="w-5 h-5" /> },
  { label: 'Projects Completed', value: '12k+', numericValue: 12000, suffix: '+', icon: <CheckCircle className="w-5 h-5" /> },
  { label: 'Total Value', value: '$800k+', numericValue: 8000, suffix: 'M', isMonetary: true, icon: <Briefcase className="w-5 h-5" /> },
];

interface CounterProps {
  value: number;
  suffix: string;
  isMonetary?: boolean;
}

function Counter({ value, suffix, isMonetary }: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(isMonetary ? '$0M' : '0');
  
  const spring = useSpring(0, { duration: 2000 });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (isMonetary) {
        setDisplayValue(`$${(latest / 1000).toFixed(1)}M`);
      } else if (latest >= 1000) {
        setDisplayValue(`${(latest / 1000).toFixed(1)}k+`);
      } else {
        setDisplayValue(`${Math.floor(latest)}+`);
      }
    });
    return unsubscribe;
  }, [spring, isMonetary]);

  return (
    <motion.div ref={ref} className="text-3xl md:text-4xl font-bold text-white mb-1">
      {displayValue}
    </motion.div>
  );
}

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
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#14B8A6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#14B8A6]">
                {stat.icon}
              </div>
              <Counter 
                value={stat.numericValue} 
                suffix={stat.suffix} 
                isMonetary={stat.isMonetary}
              />
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

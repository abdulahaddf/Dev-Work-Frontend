'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah Jenkins',
    role: 'Product Manager at TechFlow',
    content: 'DevWork has transformed how we handle technical debt. The solver we hired was exceptional and integrated perfectly with our team.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    name: 'Michael Chen',
    role: 'Founder of BuildIt',
    content: 'The role-based system ensures only qualified people work on your critical tasks. The escrow-like workflow gives me full confidence.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    name: 'Elena Rodriguez',
    role: 'CTO, DataWave',
    content: 'Real-time chat and progress tracking made managing our complex migration project a breeze. Highly recommended for startups.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  },
];

export default function ReviewsSection() {
  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Trusted by </span>
            <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Hear from our buyers who have successfully scaled their engineering teams using DevWork.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0F172A]/50 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-8 relative group hover:border-[#14B8A6]/30 transition-all"
            >
              <div className="absolute top-6 right-8 text-[#14B8A6]/10">
                <Quote className="w-12 h-12" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#14B8A6] text-[#14B8A6]" />
                ))}
              </div>

              <p className="text-gray-400 mb-8 leading-relaxed italic">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-[#1E293B]" />
                <div>
                  <h4 className="text-white font-bold text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

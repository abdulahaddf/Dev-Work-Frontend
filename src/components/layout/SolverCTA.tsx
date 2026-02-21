'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code, Terminal, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function SolverCTA() {
  return (
    <section className="relative z-10 px-6 py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#14B8A6] rounded-[3rem] p-12 md:p-20 overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-64 -mt-64 transition-transform group-hover:scale-110 duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
                Open for Developers
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Work on Great Projects. <br />
                <span className="text-black/30">Get Paid in Stable.</span>
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-lg">
                Join our elite network of Solvers. Access high-quality projects, clear requirements, and guaranteed payments.
              </p>
              
              <Link href="/register?role=SOLVER" className="inline-flex items-center gap-3 bg-white text-[#0F766E] px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                Join as a Solver
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <Code className="w-8 h-8 text-white mb-4" />
                  <h4 className="text-white font-bold mb-1">Modern Stack</h4>
                  <p className="text-white/60 text-xs">Work with React, Next.js, and Node.js.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-8">
                  <Terminal className="w-8 h-8 text-white mb-4" />
                  <h4 className="text-white font-bold mb-1">Clear Scope</h4>
                  <p className="text-white/60 text-xs">Each project has defined tasks and acceptance criteria.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <Cpu className="w-8 h-8 text-white mb-4" />
                  <h4 className="text-white font-bold mb-1">AI Guided</h4>
                  <p className="text-white/60 text-xs">Benefit from our AI-assisted platform workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

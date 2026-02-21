'use client';

import Footer from '@/components/layout/Footer';
import HeoSection from '@/components/layout/HeoSection';
import Nav from '@/components/layout/Nav';
import ProjectsSection from '@/components/layout/ProjectsSection';
import StatsSection from '@/components/layout/StatsSection';
import ReviewsSection from '@/components/layout/ReviewsSection';
import TrustSection from '@/components/layout/TrustSection';
import SolverCTA from '@/components/layout/SolverCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-4">
        <Nav/>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <HeoSection/>
        
        {/* Stats */}
        <StatsSection />
        
        {/* Projects */}
        <ProjectsSection/>
        
        {/* Trust & Admin */}
        <TrustSection />
        
        {/* Reviews */}
        <ReviewsSection />
        
        {/* Solver CTA */}
        <SolverCTA />
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}

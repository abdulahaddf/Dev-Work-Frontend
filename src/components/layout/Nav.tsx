import { useAuthStore } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { BriefcaseBusiness, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
    const { isAuthenticated } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-11/12 mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center">
              <BriefcaseBusiness className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">DevWork</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? <>
            <Link href="/dashboard" className="btn btn-primary text-lg px-4 py-1">Dashboard</Link>
            <button onClick={() => {useAuthStore.getState().logout()}} className="btn-ghost text-lg px-4 py-1">Logout</button>
            </> : <><Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link></>}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute top-full left-0 right-0 w-full bg-[#0F172A] border-b border-[#1E293B] md:hidden z-50 shadow-lg"
              >
                <div className="w-full px-4 py-6 flex flex-col gap-3">
                  {isAuthenticated ? <>
                  <Link 
                    href="/dashboard" 
                    className="btn btn-primary w-full text-center text-white font-semibold py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      useAuthStore.getState().logout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="btn btn-ghost w-full text-white font-semibold py-2"
                  >
                    Logout
                  </button>
                  </> : <>
                  <Link 
                    href="/login" 
                    className="btn btn-ghost w-full text-center text-white font-semibold py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn-primary w-full text-center text-white font-semibold py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                  </>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
  )
}

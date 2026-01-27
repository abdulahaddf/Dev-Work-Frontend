'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { RoleBadge } from '@/components/status/StatusBadge';
import {
  Home,
  FolderOpen,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BriefcaseBusiness,
  FileCheck2,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  
  // Buyer routes
  { label: 'My Projects', href: '/dashboard/projects', icon: <FolderOpen className="w-5 h-5" />, roles: ['BUYER'] },
  { label: 'New Project', href: '/dashboard/projects/new', icon: <PlusCircle className="w-5 h-5" />, roles: ['BUYER'] },
  
  // Solver routes
  { label: 'Browse Projects', href: '/dashboard/browse', icon: <BriefcaseBusiness className="w-5 h-5" />, roles: ['SOLVER'] },
  { label: 'My Tasks', href: '/dashboard/tasks', icon: <FileCheck2 className="w-5 h-5" />, roles: ['SOLVER'] },
  
  // Admin routes
  { label: 'All Projects', href: '/dashboard/admin/projects', icon: <FolderOpen className="w-5 h-5" />, roles: ['ADMIN'] },
  { label: 'Users', href: '/dashboard/admin/users', icon: <Users className="w-5 h-5" />, roles: ['ADMIN'] },
];

export default function DashboardNav() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  // Filter nav items based on user roles
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => user?.roles.includes(role));
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={`
          hidden lg:flex flex-col fixed left-0 top-0 h-full
          bg-[#0F172A] border-r border-[#1E293B] z-40
          transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-[#1E293B]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center">
            <BriefcaseBusiness className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-gradient"
              >
                <Link href="/"> 
                DevWork
                </Link>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[#1E293B]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
              <span className="text-[#14B8A6] font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-[#E5E7EB] truncate">
                    {user?.name}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {user?.roles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[#1E293B] border border-[#334155] rounded-full flex items-center justify-center hover:bg-[#334155] transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 text-[#6B7280] transition-transform ${
              isSidebarOpen ? 'rotate-90' : '-rotate-90'
            }`}
          />
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-[#1E293B] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center">
            <BriefcaseBusiness className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient">DevWork</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-[#1E293B] rounded-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-[#E5E7EB]" />
          ) : (
            <Menu className="w-6 h-6 text-[#E5E7EB]" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-[#020617] z-40 overflow-y-auto"
          >
            <nav className="p-4 space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import RoleGate from '@/components/auth/RoleGate';
import StatusBadge, { RoleBadge } from '@/components/status/StatusBadge';
import { adminApi, projectsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle,
  Clock,
  FolderOpen,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load data based on user role
      if (user?.roles.includes('ADMIN')) {
        // Admin: view overall system stats using admin API
        const response = await adminApi.getProjects({ page: 1, limit: 5 });
        const projects = response.data.data.projects || [];
        const pagination = response.data.data.pagination;
        console.log(projects);
        setRecentProjects(projects);
        setStats({
          totalProjects: pagination.total || projects.length,
          // Consider any non-completed project as active for admin overview
          activeProjects: projects.filter(
            (p: any) => p.status !== 'COMPLETED'
          ).length,
          completedProjects: projects.filter(
            (p: any) => p.status === 'COMPLETED'
          ).length,
          pendingTasks: projects.filter(
            (p: any) => !['IN_PROGRESS', 'UNDER_REVIEW','REQUESTED'].includes(p.status)
          ).length,
        });
      } else if (user?.roles.includes('BUYER')) {
        const response = await projectsApi.getMyProjects({ limit: 5 });
        const projects = response.data.data.projects;
        setRecentProjects(projects);
        setStats({
          totalProjects: response.data.data.pagination.total,
          activeProjects: projects.filter(
            (p: any) => !['DRAFT', 'COMPLETED'].includes(p.status)
          ).length,
          completedProjects: projects.filter(
            (p: any) => p.status === 'COMPLETED'
          ).length,
          pendingTasks: projects.filter(
            (p: any) => !['IN_PROGRESS', 'UNDER_REVIEW','REQUESTED'].includes(p.status)
          ).length,
        });
      } else if (user?.roles.includes('SOLVER')) {
        const response = await projectsApi.getAssignedProjects({ limit: 5 });
        const projects = response.data.data.projects;
        setRecentProjects(projects);
        setStats({
          totalProjects: response.data.data.pagination.total,
          activeProjects: projects.filter(
            (p: any) => p.status === 'IN_PROGRESS', 'UNDER_REVIEW'
          ).length,
          completedProjects: projects.filter(
            (p: any) => p.status === 'COMPLETED'
          ).length,
          pendingTasks: projects.filter(
            (p: any) => !['IN_PROGRESS', 'UNDER_REVIEW','REQUESTED'].includes(p.status)
          ).length,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  




  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-[#E5E7EB]">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#6B7280] mt-2">
          Here's what's happening with your projects today.
        </p>
        <div className="flex gap-2 mt-3">
          {user?.roles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderOpen className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={<Clock className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Completed"
          value={stats.completedProjects}
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<AlertCircle className="w-6 h-6" />}
          color="info"
        />
      </motion.div>

      {/* Quick Actions by Role */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RoleGate allowedRoles={['BUYER']}>
            <QuickActionCard
              title="Create Project"
              description="Start a new project and find solvers"
              href="/dashboard/projects/new"
              icon={<FolderOpen className="w-8 h-8" />}
            />
          </RoleGate>
          <RoleGate allowedRoles={['SOLVER']}>
            <QuickActionCard
              title="Browse Projects"
              description="Find open projects to work on"
              href="/dashboard/browse"
              icon={<BriefcaseBusiness className="w-8 h-8" />}
            />
          </RoleGate>
          <RoleGate allowedRoles={['ADMIN']}>
            <QuickActionCard
              title="Manage Users"
              description="Assign and manage user roles"
              href="/dashboard/admin/users"
              icon={<Users className="w-8 h-8" />}
            />
          </RoleGate>
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#E5E7EB]">Recent Projects</h2>
          <RoleGate allowedRoles={['ADMIN']}>
            <Link 
              href="/dashboard/admin/projects"
              className="text-sm text-[#14B8A6] hover:text-[#10B981] transition-colors flex items-center gap-1"
            >
              View All Projects
              <TrendingUp className="w-4 h-4" />
            </Link>
          </RoleGate>
          <RoleGate allowedRoles={['BUYER']}>
            <Link 
              href="/dashboard/tasks"
              className="text-sm text-[#14B8A6] hover:text-[#10B981] transition-colors flex items-center gap-1"
            >
              View All Projects
              <TrendingUp className="w-4 h-4" />
            </Link>
          </RoleGate>
          <RoleGate allowedRoles={['SOLVER']}>
            <Link 
              href="/dashboard/projects/assigned"
              className="text-sm text-[#14B8A6] hover:text-[#10B981] transition-colors flex items-center gap-1"
            >
              View All Projects
              <TrendingUp className="w-4 h-4" />
            </Link>
          </RoleGate>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FolderOpen className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
            <p className="text-[#6B7280]">No projects yet</p>
            <RoleGate allowedRoles={['BUYER']}>
              <Link href="/dashboard/projects/new" className="btn btn-primary mt-4">
                Create your first project
              </Link>
            </RoleGate>
            <RoleGate allowedRoles={['SOLVER']}>
              <Link href="/dashboard/browse" className="btn btn-primary mt-4">
                Browse open projects
              </Link>
            </RoleGate>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
}) {
  const colorClasses = {
    primary: 'text-[#14B8A6] bg-[#14B8A6]/10',
    success: 'text-[#10B981] bg-[#10B981]/10',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/10',
    info: 'text-[#3B82F6] bg-[#3B82F6]/10',
  };

  return (
    <div className="card hover-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B7280] text-sm">{title}</p>
          <p className="text-3xl font-bold text-[#E5E7EB] mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card hover-glow cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] group-hover:bg-[#14B8A6] group-hover:text-white transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#E5E7EB]">{title}</h3>
            <p className="text-sm text-[#6B7280]">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <motion.div
        whileHover={{ x: 5 }}
        className="card hover-glow cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#E5E7EB] truncate text-sm sm:text-base">{project.title}</h3>
          <p className="text-xs sm:text-sm flex flex-wrap text-[#6B7280]  mt-1 ">{project.description}</p>
        </div>
        <div className="sm:ml-4 flex-shrink-0">
          <StatusBadge status={project.status} />
        </div>
      </motion.div>
    </Link>
  );
}

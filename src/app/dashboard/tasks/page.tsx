'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectsApi } from '@/lib/api';
import StatusBadge from '@/components/status/StatusBadge';
import { Search, Filter, FolderOpen, Briefcase } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function AssignedProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [pagination.page, filterStatus]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      // reusing the getAssignedProjects API which returns projects assigned to the solver
      const response = await projectsApi.getAssignedProjects({
        page: pagination.page,
        limit: 10,
      });
      
      // Filtering locally
   
      let fetchedProjects = response.data.data.projects;
      
      if (filterStatus) {
        fetchedProjects = fetchedProjects.filter((p: any) => p.status === filterStatus);
      }

      setProjects(fetchedProjects);
      setPagination({
        page: response.data.data.pagination.page,
        totalPages: response.data.data.pagination.totalPages,
        total: response.data.data.pagination.total,
      });
    } catch (error) {
       console.error(error);
      toast.error('Failed to load assigned projects');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">My Assigned Projects</h1>
          <p className="text-[#6B7280]">Manage and track your assigned work</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
  <div className="relative">
    {/* Icon - Kept your color and size */}
    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none z-10" />
    
    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="input !pl-10 w-48 appearance-none bg-white"
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
</div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      ) : projects.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="card p-6 block hover:border-[#14B8A6]/50 transition-colors group"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/dashboard/projects/${project.id}`}>
                        <h3 className="text-lg font-semibold text-[#E5E7EB] truncate group-hover:text-[#14B8A6] transition-colors">
                        {project.title}
                        </h3>
                    </Link>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                  <p className="text-[#6B7280] text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>Budget: ${project.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                    {project.buyer && (
                        <div className="flex items-center gap-1">
                            <span className="text-[#9CA3AF]">Buyer:</span>
                            <span className="text-[#E5E7EB]">{project.buyer.name}</span>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href={`/dashboard/projects/${project.id}`}
                        className="btn btn-secondary text-sm whitespace-nowrap"
                    >
                        View Details
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="card text-center py-12">
          <FolderOpen className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-[#E5E7EB] text-lg font-medium mb-1">No assigned projects</p>
          <p className="text-[#6B7280]">You haven&apos;t been assigned to any projects yet.</p>
          <Link href="/dashboard/browse" className="btn btn-primary mt-4 inline-flex items-center gap-2">
            Browse Open Projects
          </Link>
        </div>
      )}

       {/* Pagination */}
       {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-[#6B7280]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

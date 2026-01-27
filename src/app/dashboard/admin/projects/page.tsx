'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import StatusBadge from '@/components/status/StatusBadge';
import { Search, FolderOpen, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
console.log(projects);
  useEffect(() => {
    loadProjects();
  }, [pagination.page, statusFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllProjects({
        page: pagination.page,
        limit: 20,
        status: statusFilter || undefined,
      });
      console.log(response);
      setProjects(response.data.data.projects);
      setPagination({
        page: response.data.data.pagination.page,
        totalPages: response.data.data.pagination.totalPages,
        total: response.data.data.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase())
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'OPEN', label: 'Open' },
    { value: 'REQUESTED', label: 'Requested' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">All Projects</h1>
              <p className="text-[#6B7280]">View and manage all projects in the system</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#14B8A6]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="pl-10 pr-8 py-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#14B8A6]"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects List */}
          {isLoading ? (
            <div className="card p-12 text-center">
              <div className="spinner mx-auto mb-4" />
              <p className="text-[#6B7280]">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="card p-12 text-center">
              <FolderOpen className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
              <p className="text-[#6B7280] text-lg">No projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 hover:border-[#14B8A6]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-xl font-semibold text-[#E5E7EB] hover:text-[#14B8A6] transition-colors"
                        >
                          {project.title}
                        </Link>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-[#9CA3AF] mb-4 line-clamp-2">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[#6B7280] mb-1">Buyer</p>
                          <p className="text-[#E5E7EB]">{project.buyer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] mb-1">Solver</p>
                          <p className="text-[#E5E7EB]">{project.solver?.name || 'Not Assigned'}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] mb-1">Tasks</p>
                          <p className="text-[#E5E7EB]">{project._count?.tasks || 0}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280] mb-1">Requests</p>
                          <p className="text-[#E5E7EB]">{project._count?.requests || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[#6B7280]">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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
        </motion.div>
      </div>
    </div>
  );
}


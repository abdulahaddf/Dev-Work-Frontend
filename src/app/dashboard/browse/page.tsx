'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectsApi, requestsApi } from '@/lib/api';
import StatusBadge from '@/components/status/StatusBadge';
import { Search, BriefcaseBusiness, DollarSign, Calendar, Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [requestingProject, setRequestingProject] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [pagination.page, search]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectsApi.getOpenProjects({
        page: pagination.page,
        limit: 10,
        search: search || undefined,
      });
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

  const handleRequest = async (projectId: string) => {
    try {
      setRequestingProject(projectId);
      await requestsApi.create({ projectId });
      toast.success('Request submitted!');
      loadProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestingProject(null);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Browse Projects</h1>
        <p className="text-[#6B7280]">Find open projects to work on</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
  {/* Icon - Kept your original color and sizing */}
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] z-10" />
  
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search projects..."
    /* Added !pl-10 to force override and removed ml-3 */
    className="input w-full !pl-10 border border-gray-300 rounded-md py-2" 
  />
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
          className="grid gap-4"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={itemVariants}>
              <div className="card hover-glow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#E5E7EB]">
                        {project.title}
                      </h3>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                    <p className="text-[#6B7280] text-sm line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                      <span>By {project.buyer.name}</span>
                      {project.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {Number(project.budget).toLocaleString()}
                        </span>
                      )}
                      {project.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span>{project._count?.requests || 0} requests</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.hasRequested ? (
                      <span className={`badge ${
                        project.requestStatus === 'PENDING' ? 'badge-pending' :
                        project.requestStatus === 'ACCEPTED' ? 'badge-accepted' :
                        'badge-rejected'
                      }`}>
                        {project.requestStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequest(project.id)}
                        disabled={requestingProject === project.id}
                        className="btn btn-primary"
                      >
                        {requestingProject === project.id ? (
                          <span className="spinner" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Request to Work
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="card text-center py-12">
          <BriefcaseBusiness className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-[#6B7280]">No open projects found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-[#6B7280]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

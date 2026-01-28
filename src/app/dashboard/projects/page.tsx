'use client';

import StatusBadge from '@/components/status/StatusBadge';
import { projectsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [pagination.page, filterStatus]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const params: any = { page: pagination.page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      
      const response = await projectsApi.getMyProjects(params);
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

  const handleDeleteClick = (project: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      setIsDeleting(true);
      await projectsApi.delete(projectToDelete.id);
      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      loadProjects(); // Reload projects list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">My Projects</h1>
          <p className="text-[#6B7280]">Manage and track your projects</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-48"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="REQUESTED">Requested</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <span className="text-[#6B7280] text-sm">
          {pagination.total} project{pagination.total !== 1 ? 's' : ''}
        </span>
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
              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="card hover-glow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#E5E7EB] truncate">
                          {project.title}
                        </h3>
                        <StatusBadge status={project.status} size="sm" />
                        {project.status === 'DRAFT' && (
                          <button
                            onClick={(e) => handleDeleteClick(project, e)}
                            className="ml-auto p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-[#6B7280] text-sm line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
                        {project.budget && (
                          <span>${Number(project.budget).toLocaleString()}</span>
                        )}
                        {project.deadline && (
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        )}
                        <span>{project._count?.tasks || 0} tasks</span>
                        <span>{project._count?.requests || 0} requests</span>
                      </div>
                    </div>
                    {project.solver && (
                      <div className="text-right">
                        <p className="text-xs text-[#6B7280]">Assigned to</p>
                        <p className="text-sm text-[#E5E7EB]">{project.solver.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="card text-center py-12">
          <FolderOpen className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
          <p className="text-[#6B7280] mb-4">No projects found</p>
          <Link href="/dashboard/projects/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create your first project
          </Link>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">Delete Project</h3>
            <p className="text-[#6B7280] mb-4">
              Are you sure you want to delete &quot;{projectToDelete?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                disabled={isDeleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

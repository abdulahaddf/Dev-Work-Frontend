'use client';

import StatusBadge from '@/components/status/StatusBadge';
import { adminApi, projectsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Filter, FolderOpen, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
                        <button
                          onClick={(e) => handleDeleteClick(project, e)}
                          className="ml-auto p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">Delete Project</h3>
            <p className="text-[#6B7280] mb-4">
              Are you sure you want to delete &quot;{projectToDelete?.title}&quot;? This action cannot be undone and will also delete all related tasks, submissions, and requests.
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


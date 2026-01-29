'use client';

import Nav from '@/components/layout/Nav';
import { Project, projectsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleViewDetails = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push(`/projects/${projectId}`);
    } else {
      router.push(`/login?redirect=/projects/${projectId}`);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await projectsApi.getOpenProjects({ page: currentPage, limit: 6 });
        if (response.data.success) {
          setProjects(response.data.data.projects);
          setTotalPages(response.data.data.pagination.totalPages);
        }
      } catch (error: any) {
        console.error('Failed to fetch projects', error);
        // Don't show error to user, just log it
        // The component will show "No open projects" message
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative z-10 px-6 py-4 bg-[#020617]/50">
      <Nav/>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-[#E5E7EB]">ALL </span>
            <span className="text-gradient">Opportunities </span>
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            Browse through our curated list of open projects and find your next challenge.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : projects.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="card hover-glow group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    {project.budget && (
                      <span className="text-[#14B8A6] font-medium bg-[#14B8A6]/10 px-3 py-1 rounded-full text-sm">
                        ${Number(project.budget).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2 group-hover:text-[#14B8A6] transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-[#6B7280] text-sm mb-6 line-clamp-3 flex-grow">
                    {project.description}
                  </p>

                  <div className="mt-auto border-t border-[#1E293B] pt-4 flex items-center justify-between text-sm text-[#9CA3AF]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {project.deadline 
                          ? new Date(project.deadline).toLocaleDateString()
                          : 'No deadline'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleViewDetails(project.id, e)}
                      className="flex items-center gap-1 hover:text-[#14B8A6] transition-colors cursor-pointer"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border border-[#1E293B] transition-colors ${
                  currentPage === 1
                    ? 'text-[#4B5563] cursor-not-allowed'
                    : 'text-[#E5E7EB] hover:bg-[#1E293B] hover:text-[#14B8A6]'
                }`}
              >
                Previous
              </button>
              
              <span className="text-[#9CA3AF]">
                Page <span className="text-[#E5E7EB] font-medium">{currentPage}</span> of{' '}
                <span className="text-[#E5E7EB] font-medium">{totalPages}</span>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border border-[#1E293B] transition-colors ${
                  currentPage === totalPages
                    ? 'text-[#4B5563] cursor-not-allowed'
                    : 'text-[#E5E7EB] hover:bg-[#1E293B] hover:text-[#14B8A6]'
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No open projects available at the moment.</p>
          </div>
        )}

        
      </div>
    </section>
  );
}

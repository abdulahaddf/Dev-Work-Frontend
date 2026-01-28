'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, DollarSign, FolderOpen } from 'lucide-react';
import { projectsApi, Project } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        const response = await projectsApi.getOpenProjects({ limit: 6 });
        if (response.data.success) {
          setProjects(response.data.data.projects);
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
  }, []);

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
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-[#E5E7EB]">Latest </span>
            <span className="text-gradient">Opportunities</span>
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
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No open projects available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
           <Link href="/view-all-projects" className="btn btn-secondary px-8 py-3">
            View All Projectsa
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { projectsApi, requestsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import StatusBadge from '@/components/status/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  FolderOpen,
  BriefcaseBusiness,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId, isAuthenticated]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectsApi.getProject(projectId);
      const projectData = response.data.data;
      setProject(projectData);
      setHasRequested(projectData.hasRequested || false);
      setRequestStatus(projectData.requestStatus || null);
    } catch (error: any) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project details');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/projects/${projectId}`);
      return;
    }

    try {
      setIsRequesting(true);
      await requestsApi.create({ projectId });
      toast.success('Request submitted successfully!');
      setHasRequested(true);
      setRequestStatus('PENDING');
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B7280] mb-4">Project not found</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const canRequest = isAuthenticated && user?.roles.includes('SOLVER') && !hasRequested;
  const isBuyer = isAuthenticated && project.buyer?.id === user?.id;

  return (
    <div className="min-h-screen bg-[#020617]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#14B8A6] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          {!isAuthenticated && (
            <Link href={`/login?redirect=/projects/${projectId}`} className="btn btn-primary">
              Sign In to Apply
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Project Header */}
          <div className="card p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6]">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#E5E7EB]">
                      {project.title}
                    </h1>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-[#9CA3AF] text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#1E293B]">
              {project.budget && (
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[#6B7280] text-sm">Budget</p>
                    <p className="text-[#E5E7EB] font-semibold text-lg">
                      ${Number(project.budget).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[#6B7280] text-sm">Deadline</p>
                  <p className="text-[#E5E7EB] font-semibold text-lg">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'No deadline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[#6B7280] text-sm">Posted</p>
                  <p className="text-[#E5E7EB] font-semibold text-lg">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#1E293B]">
                <User className="w-6 h-6 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-[#6B7280] text-sm mb-1">Posted by</p>
                <p className="text-[#E5E7EB] font-semibold text-lg">{project.buyer?.name}</p>
              </div>
            </div>
          </div>

          {/* Request Status */}
          {isAuthenticated && hasRequested && (
            <div className="card p-6 border-l-4 border-[#14B8A6]">
              <div className="flex items-center gap-3">
                {requestStatus === 'ACCEPTED' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : requestStatus === 'REJECTED' ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-500" />
                )}
                <div>
                  <p className="text-[#E5E7EB] font-semibold">
                    Request Status: {requestStatus || 'PENDING'}
                  </p>
                  <p className="text-[#6B7280] text-sm mt-1">
                    {requestStatus === 'ACCEPTED'
                      ? 'Your request has been accepted!'
                      : requestStatus === 'REJECTED'
                      ? 'Your request was not accepted.'
                      : 'Your request is pending review.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isBuyer && (
            <div className="flex gap-4">
              {canRequest ? (
                <button
                  onClick={handleRequest}
                  disabled={isRequesting}
                  className="btn btn-primary flex-1 md:flex-none px-8"
                >
                  {isRequesting ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Apply for Project
                    </>
                  )}
                </button>
              ) : !isAuthenticated ? (
                <Link
                  href={`/login?redirect=/projects/${projectId}`}
                  className="btn btn-primary flex-1 md:flex-none px-8"
                >
                  <BriefcaseBusiness className="w-5 h-5" />
                  Sign In to Apply
                </Link>
              ) : null}
            </div>
          )}

          {/* Additional Info */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">Project Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[#6B7280] text-sm mb-1">Status</p>
                <StatusBadge status={project.status} />
              </div>
              {project._count && (
                <div>
                  <p className="text-[#6B7280] text-sm mb-1">Total Requests</p>
                  <p className="text-[#E5E7EB] font-semibold">{project._count.requests || 0}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { tasksApi, submissionsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import StatusBadge from '@/components/status/StatusBadge';
import LifecycleStepper, { createTaskSteps } from '@/components/steppers/LifecycleStepper';
import FileUpload from '@/components/upload/FileUpload';
import Modal from '@/components/modals/Modal';
import { ArrowLeft, Play, Send, CheckCircle, XCircle, Download, FileArchive } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const response = await tasksApi.getTask(taskId);
      setTask(response.data.data);
    } catch (error) {
      toast.error('Failed to load task');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setIsActionLoading(true);
      await tasksApi.updateStatus(taskId, status);
      toast.success(`Task status updated to ${status}`);
      loadTask();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await submissionsApi.upload(taskId, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        toast.success('Submission uploaded!');
        loadTask();
      }, 500);
    } catch (error: any) {
      setIsUploading(false);
      toast.error(error.response?.data?.message || 'Failed to upload');
    }
  };

  const handleReview = async (action: 'ACCEPT' | 'REJECT') => {
    try {
      setIsActionLoading(true);
      await tasksApi.review(taskId, action, feedback);
      toast.success(`Task ${action === 'ACCEPT' ? 'accepted' : 'rejected'}!`);
      setShowReviewModal(false);
      setFeedback('');
      loadTask();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to review');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownload = async (submissionId: string, fileName: string) => {
    try {
      const response = await submissionsApi.download(submissionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!task) return null;

  const isBuyer = task.accessLevel === 'buyer';
  const isSolver = task.accessLevel === 'solver';

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${task.project.id}`} className="text-[#6B7280] hover:text-[#E5E7EB]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#E5E7EB]">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-[#6B7280] mt-1">
            Project: {task.project.title}
          </p>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-sm font-medium text-[#6B7280] mb-4">Task Lifecycle</h3>
        <LifecycleStepper steps={createTaskSteps(task.status)} />
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-3">Description</h3>
            <p className="text-[#9CA3AF] whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Submissions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#E5E7EB]">
                Submissions ({task.submissions?.length || 0})
              </h3>
              {isSolver && ['IN_PROGRESS', 'REJECTED'].includes(task.status) && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit Work
                </button>
              )}
            </div>
            {task.submissions?.length > 0 ? (
              <div className="space-y-3">
                {task.submissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-[#1E293B] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileArchive className="w-8 h-8 text-[#14B8A6]" />
                      <div>
                        <p className="font-medium text-[#E5E7EB]">{sub.fileName}</p>
                        <p className="text-sm text-[#6B7280]">
                          {(sub.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                          {new Date(sub.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(sub.id, sub.fileName)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B7280] text-center py-8">No submissions yet</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[#6B7280]">Deadline</p>
                <p className="text-[#E5E7EB]">{new Date(task.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[#6B7280]">Created</p>
                <p className="text-[#E5E7EB]">{new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions / Feedback */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-4">
              {isSolver && task.status === 'SUBMITTED' ? 'Feedback' : 'Actions'}
            </h3>

            {isSolver && task.status === 'SUBMITTED' ? (
              <div className="bg-[#1E293B] p-4 rounded-lg border border-[#1E293B]">
                <p className="text-sm text-[#6B7280] mb-2">Buyer feedback:</p>
                <p className="text-[#E5E7EB] whitespace-pre-wrap">
                  {task.reviewFeedback || 'Buyer didnot review yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Solver Actions */}
                {isSolver && task.status === 'CREATED' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={isActionLoading}
                    className="btn btn-primary w-full"
                  >
                    <Play className="w-4 h-4" />
                    Start Working
                  </button>
                )}

                {/* Buyer Actions */}
                {isBuyer && task.status === 'SUBMITTED' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-primary w-full"
                  >
                    Review Submission
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => !isUploading && setShowUploadModal(false)}
        title="Submit Work"
      >
        <div className="space-y-4">
          <p className="text-[#6B7280]">Upload your completed work as a ZIP file.</p>
          <FileUpload
            onFileSelect={setSelectedFile}
            onUpload={handleUpload}
            isUploading={isUploading}
            progress={uploadProgress}
          />
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Submission"
      >
        <div className="space-y-4">
          <p className="text-[#6B7280]">Review the submitted work and provide feedback.</p>
          <div>
            <label className="label">Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Provide feedback to the solver..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleReview('REJECT')}
              disabled={isActionLoading}
              className="btn btn-danger flex-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => handleReview('ACCEPT')}
              disabled={isActionLoading}
              className="btn btn-primary flex-1"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

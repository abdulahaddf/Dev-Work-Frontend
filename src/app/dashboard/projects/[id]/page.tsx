'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { projectsApi, tasksApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import StatusBadge, { RoleBadge } from '@/components/status/StatusBadge';
import LifecycleStepper, { createProjectSteps } from '@/components/steppers/LifecycleStepper';
import Modal from '@/components/modals/Modal';
import {
  ArrowLeft,
  Send,
  UserCheck,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
console.log(tasks)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectsApi.getProject(projectId);
      setProject(response.data.data);

      // Load tasks
      const tasksResponse = await tasksApi.getProjectTasks(projectId);
      setTasks(tasksResponse.data.data);

      // Load requests if buyer
      if (response.data.data.accessLevel === 'buyer') {
        const requestsResponse = await projectsApi.getRequests(projectId);
        setRequests(requestsResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load project');
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsActionLoading(true);
      await projectsApi.publishProject(projectId);
      toast.success('Project published!');
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setIsActionLoading(true);
      await projectsApi.updateStatus(projectId, status);
      toast.success(`Status updated to ${status}`);
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAssignSolver = async (solverId: string) => {
    try {
      setIsActionLoading(true);
      await projectsApi.assignSolver(projectId, solverId);
      toast.success('Solver assigned!');
      setShowRequestsModal(false);
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign solver');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.description || !newTask.deadline) {
        toast.error('Please fill all fields');
        return;
      }
      setIsActionLoading(true);
      await tasksApi.create({
        projectId,
        title: newTask.title,
        description: newTask.description,
        deadline: new Date(newTask.deadline).toISOString(),
      });
      toast.success('Task created!');
      setShowNewTaskModal(false);
      setNewTask({ title: '', description: '', deadline: '' });
      loadProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) return null;

  const isBuyer = project.accessLevel === 'buyer';
  const isSolver = project.accessLevel === 'solver';

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href={isBuyer ? '/dashboard/projects' : '/dashboard/browse'} className="text-[#6B7280] hover:text-[#E5E7EB]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#E5E7EB]">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-[#6B7280] mt-1">Created {new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-x-auto"
      >
        <h3 className="text-sm font-medium text-[#6B7280] mb-4">Project Lifecycle</h3>
        <LifecycleStepper steps={createProjectSteps(project.status)} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-3">Description</h3>
            <p className="text-[#9CA3AF] whitespace-pre-wrap">{project.description}</p>
          </div>

          {/* Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#E5E7EB]">Tasks ({tasks.length})</h3>
                {tasks.length > 0 && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#6B7280]">
                    <span>
                      <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                      {tasks.filter(t => t.status === 'ACCEPTED').length} Accepted
                    </span>
                    <span>
                      <FileText className="w-4 h-4 inline mr-1 text-blue-500" />
                      {tasks.filter(t => t.status === 'SUBMITTED').length} Submitted
                    </span>
                    <span>
                      <Clock className="w-4 h-4 inline mr-1 text-yellow-500" />
                      {tasks.filter(t => ['CREATED', 'IN_PROGRESS'].includes(t.status)).length} In Progress
                    </span>
                    {tasks.some(t => t.status === 'REJECTED') && (
                      <span>
                        <XCircle className="w-4 h-4 inline mr-1 text-red-500" />
                        {tasks.filter(t => t.status === 'REJECTED').length} Rejected
                      </span>
                    )}
                  </div>
                )}
              </div>
              {isSolver && ['ASSIGNED', 'IN_PROGRESS'].includes(project.status) && (
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                    <div className="p-4 bg-[#1E293B] rounded-lg hover:bg-[#334155] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[#E5E7EB]">{task.title}</h4>
                          <p className="text-sm text-[#6B7280] mt-1">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#6B7280] text-center py-8">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-4">Details</h3>
            <div className="space-y-3">
              {project.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[#6B7280]" />
                  <span className="text-[#E5E7EB]">${Number(project.budget).toLocaleString()}</span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#6B7280]" />
                  <span className="text-[#E5E7EB]">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#1E293B]">
                <p className="text-sm text-[#6B7280]">Buyer</p>
                <p className="text-[#E5E7EB]">{project.buyer.name}</p>
              </div>
              {project.solver && (
                <div>
                  <p className="text-sm text-[#6B7280]">Assigned Solver</p>
                  <p className="text-[#E5E7EB]">{project.solver.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold text-[#E5E7EB] mb-4">Actions</h3>
            <div className="space-y-3">
              {/* Buyer Actions */}
              {isBuyer && project.status === 'DRAFT' && (
                <button
                  onClick={handlePublish}
                  disabled={isActionLoading}
                  className="btn btn-primary w-full"
                >
                  <Send className="w-4 h-4" />
                  Publish Project
                </button>
              )}
              
              {isBuyer && ['OPEN', 'REQUESTED'].includes(project.status) && requests.length > 0 && (
                <button
                  onClick={() => setShowRequestsModal(true)}
                  className="btn btn-primary w-full"
                >
                  <UserCheck className="w-4 h-4" />
                  View Requests ({requests.length})
                </button>
              )}

              {isBuyer && project.status === 'UNDER_REVIEW' && (
                <>
                  <button
                    onClick={() => {
                      // Check if all tasks are accepted
                      const allAccepted = tasks.length > 0 && tasks.every(t => t.status === 'ACCEPTED');
                      if (!allAccepted) {
                        toast.error('All tasks must be accepted before reviewing the project');
                        return;
                      }
                      setReviewFeedback('');
                      setShowReviewModal(true);
                    }}
                    disabled={isActionLoading}
                    className="btn btn-primary w-full"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Review Project
                  </button>
                  {tasks.length > 0 && tasks.some(t => t.status !== 'ACCEPTED') && (
                    <p className="text-xs text-[#6B7280] mt-2">
                      {tasks.filter(t => t.status !== 'ACCEPTED').length} task(s) need to be reviewed
                    </p>
                  )}
                </>
              )}

              {/* Solver Actions */}
              {isSolver && project.status === 'ASSIGNED' && (
                <button
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={isActionLoading}
                  className="btn btn-primary w-full"
                >
                  <Clock className="w-4 h-4" />
                  Start Working
                </button>
              )}

              {isSolver && project.status === 'IN_PROGRESS' && tasks.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      // Check if all tasks are submitted
                      const allAccepted = tasks.every(t => t.status === 'ACCEPTED');
                      if (!allAccepted) {
                        toast.error('All tasks must be accepted before submitting the project for review');
                        return;
                      }
                      setShowSubmitModal(true);
                    }}
                    disabled={isActionLoading}
                    className="btn btn-primary w-full"
                  >
                    <FileText className="w-4 h-4" />
                    Submit for Review
                  </button>
                  {tasks.some(t => t.status !== 'ACCEPTED') && (
                    <p className="text-xs text-[#6B7280] mt-2">
                      {tasks.filter(t => t.status !== 'ACCEPTED').length} task(s) need to be accepted
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Modal */}
      <Modal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        title="Project Requests"
        size="lg"
      >
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-4 bg-[#1E293B] rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-[#E5E7EB]">{request.solver.name}</h4>
                    <p className="text-sm text-[#6B7280]">{request.solver.email}</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {request.solver._count?.solverProjects || 0} completed projects
                    </p>
                    {request.message && (
                      <p className="text-[#9CA3AF] mt-2 text-sm">{request.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status} size="sm" />
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleAssignSolver(request.solverId)}
                        disabled={isActionLoading}
                        className="btn btn-primary btn-sm"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B7280] text-center py-8">No requests yet</p>
        )}
      </Modal>

      {/* New Task Modal */}
      <Modal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Task description"
            />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            onClick={handleCreateTask}
            disabled={isActionLoading}
            className="btn btn-primary w-full"
          >
            {isActionLoading ? <span className="spinner" /> : 'Create Task'}
          </button>
        </div>
      </Modal>

      {/* Submit for Review Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Project for Review"
      >
        <div className="space-y-4">
          <p className="text-[#9CA3AF]">
            Are you sure you want to submit this project for review? Once submitted, the buyer will review all tasks.
          </p>
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <p className="text-sm text-[#6B7280] mb-2">Task Status Summary:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Total Tasks:</span>
                <span className="text-[#E5E7EB] font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Submitted:</span>
                <span className="text-green-500 font-medium">
                  {tasks.filter(t => t.status === 'ACCEPTED').length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowSubmitModal(false);
                handleUpdateStatus('UNDER_REVIEW');
              }}
              disabled={isActionLoading}
              className="btn btn-primary flex-1"
            >
              {isActionLoading ? <span className="spinner" /> : 'Submit for Review'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Project Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewFeedback('');
        }}
        title="Review Project"
      >
        <div className="space-y-4">
          <p className="text-[#9CA3AF]">
            Review the project work. You can accept and complete the project, or reject it with feedback for improvements.
          </p>
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <p className="text-sm text-[#6B7280] mb-2">Task Status Summary:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Total Tasks:</span>
                <span className="text-[#E5E7EB] font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Accepted:</span>
                <span className="text-green-500 font-medium">
                  {tasks.filter(t => t.status === 'ACCEPTED').length}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Feedback (required if rejecting):
            </label>
            <textarea
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder="Provide feedback for the solver..."
              rows={4}
              className="input w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewFeedback('');
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  setIsActionLoading(true);
                  await projectsApi.reviewProject(projectId, {
                    action: 'REJECT',
                    feedback: reviewFeedback || undefined,
                  });
                  toast.success('Project rejected. Solver can resubmit with improvements.');
                  setShowReviewModal(false);
                  setReviewFeedback('');
                  loadProject();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to reject project');
                } finally {
                  setIsActionLoading(false);
                }
              }}
              disabled={isActionLoading || !reviewFeedback.trim()}
              className="btn btn-secondary flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {isActionLoading ? <span className="spinner" /> : 'Reject'}
            </button>
            <button
              onClick={async () => {
                try {
                  setIsActionLoading(true);
                  await projectsApi.reviewProject(projectId, {
                    action: 'ACCEPT',
                  });
                  toast.success('Project accepted and marked as completed!');
                  setShowReviewModal(false);
                  setReviewFeedback('');
                  loadProject();
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to accept project');
                } finally {
                  setIsActionLoading(false);
                }
              }}
              disabled={isActionLoading}
              className="btn btn-primary flex-1"
            >
              {isActionLoading ? <span className="spinner" /> : 'Accept & Complete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

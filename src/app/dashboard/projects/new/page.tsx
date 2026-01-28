'use client';

import { projectsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingState, setLoadingState] = useState<'IDLE' | 'DRAFT' | 'PUBLISH'>('IDLE');
  const router = useRouter();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Budget must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();

    if (!validate()) return;

    setLoadingState(publish ? 'PUBLISH' : 'DRAFT');
    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
      };
      if (formData.budget) data.budget = Number(formData.budget);
      if (formData.deadline) data.deadline = new Date(formData.deadline).toISOString();

      const response = await projectsApi.create(data);
      const projectId = response.data.data.id;

      if (publish) {
        await projectsApi.publishProject(projectId);
        toast.success('Project created and published!');
      } else {
        toast.success('Project created as draft');
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
    } finally {
      setLoadingState('IDLE');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#E5E7EB] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Create New Project</h1>
        <p className="text-[#6B7280]">Fill in the details to create your project</p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-6"
        onSubmit={(e) => handleSubmit(e, false)}
      >
        {/* Title */}
        <div>
          <label className="label">Project Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g., E-commerce Website Development"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`input min-h-[150px] resize-y ${errors.description ? 'input-error' : ''}`}
            placeholder="Describe your project requirements, goals, and expectations..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Budget & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="label">Budget (Optional)</label>
           <div className="relative">
             {/* Icon remains absolute */}
             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none z-10" />
             
             <input
               type="number"
               value={formData.budget}
               onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
               /* Use !pl-10 to force the space for the dollar sign */
               className={`input w-full !pl-10 ${errors.budget ? 'input-error' : ''}`}
               placeholder="5000"
             />
           </div>
           {errors.budget && (
             <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
           )}
              </div>

         <div>
            <label className="label">Deadline (Optional)</label>
            <div className="relative">
              {/* Icon stays exactly where you want it */}
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none z-10" />
              
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                /* !pl-10 forces the text to start after your calendar icon */
                className="input w-full !pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loadingState !== 'IDLE'}
            className="btn btn-secondary flex-1"
          >
            {loadingState === 'DRAFT' ? <span className="spinner" /> : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loadingState !== 'IDLE'}
            className="btn btn-primary flex-1"
          >
            {loadingState === 'PUBLISH' ? (
              <span className="spinner" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create & Publish
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

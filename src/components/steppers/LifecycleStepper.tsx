'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'upcoming' | 'current' | 'completed';
}

interface LifecycleStepperProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
}

const stepVariants = {
  upcoming: {
    scale: 1,
    opacity: 0.5,
  },
  current: {
    scale: 1.1,
    opacity: 1,
  },
  completed: {
    scale: 1,
    opacity: 1,
  },
};

export default function LifecycleStepper({
  steps,
  orientation = 'horizontal',
}: LifecycleStepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${
        isHorizontal ? 'items-center' : 'items-start'
      } gap-2`}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} items-center gap-2`}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <motion.div
              variants={stepVariants}
              initial="upcoming"
              animate={step.status}
              transition={{ duration: 0.3 }}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${step.status === 'completed' ? 'bg-[#0F766E] text-white' : ''}
                ${step.status === 'current' ? 'bg-[#14B8A6] text-white' : ''}
                ${step.status === 'upcoming' ? 'bg-[#1E293B] text-[#6B7280]' : ''}
                transition-colors duration-300
              `}
            >
              {step.status === 'completed' && <CheckCircle className="w-5 h-5" />}
              {step.status === 'current' && (
                <Loader className="w-5 h-5 animate-spin" />
              )}
              {step.status === 'upcoming' && <Circle className="w-5 h-5" />}
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  ${isHorizontal ? 'w-12 h-0.5' : 'w-0.5 h-12'}
                  ${step.status === 'completed' ? 'bg-[#0F766E]' : 'bg-[#1E293B]'}
                  transition-colors duration-500
                `}
              />
            )}
          </div>

          {/* Step label */}
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              text-xs font-medium text-center
              ${step.status === 'completed' ? 'text-[#14B8A6]' : ''}
              ${step.status === 'current' ? 'text-[#5EEAD4]' : ''}
              ${step.status === 'upcoming' ? 'text-[#6B7280]' : ''}
              ${isHorizontal ? 'mt-2 max-w-[80px]' : 'ml-2'}
            `}
          >
            {step.label}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

// Helper to convert status to step format
export function createProjectSteps(currentStatus: string): Step[] {
  const statuses = [
    { id: 'DRAFT', label: 'Draft' },
    { id: 'OPEN', label: 'Open' },
    { id: 'REQUESTED', label: 'Requested' },
    { id: 'ASSIGNED', label: 'Assigned' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'UNDER_REVIEW', label: 'Review' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  const currentIndex = statuses.findIndex((s) => s.id === currentStatus);

  return statuses.map((status, index) => ({
    ...status,
    status:
      index < currentIndex
        ? 'completed'
        : index === currentIndex
        ? 'current'
        : 'upcoming',
  }));
}

export function createTaskSteps(currentStatus: string): Step[] {
  const statuses = [
    { id: 'CREATED', label: 'Created' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'ACCEPTED', label: 'Accepted' },
  ];

  // Handle rejected state separately
  if (currentStatus === 'REJECTED') {
    return [
      { id: 'CREATED', label: 'Created', status: 'completed' as const },
      { id: 'IN_PROGRESS', label: 'In Progress', status: 'current' as const },
      { id: 'SUBMITTED', label: 'Submitted', status: 'upcoming' as const },
      { id: 'ACCEPTED', label: 'Accepted', status: 'upcoming' as const },
    ];
  }

  const currentIndex = statuses.findIndex((s) => s.id === currentStatus);

  return statuses.map((status, index) => ({
    ...status,
    status:
      index < currentIndex
        ? 'completed'
        : index === currentIndex
        ? 'current'
        : 'upcoming',
  }));
}

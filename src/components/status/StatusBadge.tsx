'use client';

import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Project statuses
  DRAFT: { label: 'Draft', className: 'badge-draft' },
  OPEN: { label: 'Open', className: 'badge-open' },
  REQUESTED: { label: 'Requested', className: 'badge-requested' },
  ASSIGNED: { label: 'Assigned', className: 'badge-assigned' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in-progress' },
  UNDER_REVIEW: { label: 'Under Review', className: 'badge-under-review' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
  
  // Task statuses
  CREATED: { label: 'Created', className: 'badge-draft' },
  SUBMITTED: { label: 'Submitted', className: 'badge-under-review' },
  ACCEPTED: { label: 'Accepted', className: 'badge-accepted' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
  
  // Request statuses
  PENDING: { label: 'Pending', className: 'badge-pending' },
};

const sizeClasses = {
  sm: 'text-[0.625rem] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-4 py-1.5',
};

export default function StatusBadge({
  status,
  size = 'md',
  animate = true,
}: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-draft' };

  const Badge = animate ? motion.span : 'span';
  const animationProps = animate
    ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Badge
      className={`badge ${config.className} ${sizeClasses[size]}`}
      {...animationProps}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'IN_PROGRESS' || status === 'PENDING'
            ? 'animate-pulse'
            : ''
        }`}
        style={{
          backgroundColor: 'currentColor',
        }}
      />
      {config.label}
    </Badge>
  );
}

// Role Badge Component
interface RoleBadgeProps {
  role: string;
}

const roleConfig: Record<string, { className: string }> = {
  ADMIN: { className: 'role-admin' },
  BUYER: { className: 'role-buyer' },
  SOLVER: { className: 'role-solver' },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || { className: 'role-buyer' };

  return (
    <span className={`role-badge ${config.className}`}>
      {role}
    </span>
  );
}

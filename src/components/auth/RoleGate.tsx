'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * RoleGate Component
 * Only renders children if user has one of the allowed roles
 * Can optionally redirect or show fallback content
 */
export default function RoleGate({
  children,
  allowedRoles,
  fallback = null,
  redirectTo,
}: RoleGateProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const hasAccess = user?.roles.some((role) => allowedRoles.includes(role)) ?? false;

  useEffect(() => {
    if (redirectTo && !hasAccess && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [hasAccess, isAuthenticated, redirectTo, router]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that only renders for authenticated users
 */
export function AuthRequired({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that only renders for guests (not authenticated)
 */
export function GuestOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

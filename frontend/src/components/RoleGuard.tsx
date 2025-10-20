import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/store/context';
import { Role } from '@/types/domain';

export default function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { currentUser } = useApp();
  const role: Role = currentUser?.role ?? 'guest';
  if (!allow.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}


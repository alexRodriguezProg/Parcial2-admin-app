import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'STOCK' | 'PEDIDOS')[];
}

/** Ruta protegida que redirige a /login o /unauthorized según rol. */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol as 'ADMIN' | 'STOCK' | 'PEDIDOS')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
import React from 'react';
import { Navigate } from 'react-router-dom';

const ROLE_HIERARCHY = {
  PLATFORM_ADMIN: 4,
  COMMUNITY_ADMIN: 3,
  OPERATIONS_STAFF: 2,
  DELIVERY_PERSONNEL: 1,
  END_USER: 0,
};

const ROLE_DASHBOARD = {
  PLATFORM_ADMIN: '/admin/dashboard',
  OPERATIONS_STAFF: '/staff/dashboard',
  DELIVERY_PERSONNEL: '/delivery/DeliveryPersonPage',
  COMMUNITY_ADMIN: '/community-admin/dashboard',
  END_USER: '/user-dashboard',
};

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userLevel = ROLE_HIERARCHY[user.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 99;

    if (userLevel < requiredLevel) {
      const fallback = ROLE_DASHBOARD[user.role] || '/';
      const current = window.location.pathname;
      if (current !== fallback) {
        return <Navigate to={fallback} replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

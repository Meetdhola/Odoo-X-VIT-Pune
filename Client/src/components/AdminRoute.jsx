import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default AdminRoute;

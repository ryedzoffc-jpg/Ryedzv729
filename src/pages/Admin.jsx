import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Loading from '../components/common/Loading';

const Admin = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading text="Checking permissions..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <AdminDashboard />;
};

export default Admin;

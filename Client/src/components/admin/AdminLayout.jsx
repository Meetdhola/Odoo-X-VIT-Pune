import React from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../MainLayout.jsx';

const AdminLayout = ({ children, title }) => {
  const location = useLocation();

  // Map path to friendly subtitle
  const pathToSubtitle = {
    '/admin': 'Platform Overview',
    '/admin/users': 'Identity & Access Management',
    '/admin/rules': 'Automated Policy Matrix',
    '/admin/expenses': 'Global Disbursement Audit',
    '/admin/company': 'Organizational Configuration'
  };

  return (
    <MainLayout 
      title="Administrative Command"
      subtitle={pathToSubtitle[location.pathname] || 'System Management'}
    >
      {children}
    </MainLayout>
  );
};

export default AdminLayout;

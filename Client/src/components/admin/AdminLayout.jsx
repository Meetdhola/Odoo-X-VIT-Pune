import React from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../MainLayout.jsx';
import { Users, Shield, DollarSign } from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const location = useLocation();

  // Map path to friendly subtitle
  const pathToSubtitle = {
    '/admin': 'Platform Overview',
    '/admin/users': 'User Management',
    '/admin/rules': 'Approval Rules',
    '/admin/expenses': 'Expense Audit',
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

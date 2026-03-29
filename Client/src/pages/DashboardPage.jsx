import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout.jsx';
import ExpenseDashboard from '../features/expense/ExpenseDashboard.jsx';

const ManagerDashboard = lazy(() => import('./ManagerDashboard.jsx'));

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Role-based default tab landing logic
  const isManager = user?.role === 'Manager' || user?.role === 'Admin';
  const [activeTab, setActiveTab] = useState(isManager ? 'approvals' : 'my-expenses');

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const titles = {
    'my-expenses': { title: 'Personal Workspace', subtitle: 'Expense Hub' },
    'approvals': { title: 'Managerial Oversight', subtitle: 'Approval Matrix' }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      title={titles[activeTab].title}
      subtitle={titles[activeTab].subtitle}
    >
      {activeTab === 'my-expenses' ? (
        <ExpenseDashboard />
      ) : (
        <Suspense fallback={<LoadingPlaceholder />}>
          <ManagerDashboard />
        </Suspense>
      )}
    </MainLayout>
  );
};

const LoadingPlaceholder = () => (
  <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
     <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
     <p className="text-xs text-slate-500 font-black uppercase tracking-widest animate-pulse">Initializing Matrix...</p>
  </div>
);

export default DashboardPage;

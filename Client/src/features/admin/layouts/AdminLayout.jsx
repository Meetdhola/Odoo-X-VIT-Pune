import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';

const AdminLayout = () => {
  const location = useLocation();
  
  // Clean titles from path
  const getPageTitle = (pathname) => {
    const segment = pathname.split('/').pop();
    if (segment === 'dashboard') return 'Stats Overview';
    if (segment === 'users') return 'User Management';
    if (segment === 'rules') return 'Approval Rules';
    if (segment === 'expenses') return 'Expense Oversight';
    if (segment === 'settings') return 'Company Settings';
    return 'Admin Control Panel';
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      {/* Sidebar fixed */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-[256px] flex flex-col">
        <TopBar title={getPageTitle(location.pathname)} />
        
        <main className="p-8 pb-12 overflow-y-auto min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GitBranch, Receipt, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Approval Rules', path: '/admin/rules', icon: GitBranch },
        { name: 'All Expenses', path: '/admin/expenses', icon: Receipt },
      ]
    },
    {
      label: 'Settings',
      items: [
        { name: 'Company Settings', path: '/admin/company', icon: Settings },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex font-sans antialiased text-[#0F172A]">
      {/* Sidebar */}
      <aside className="w-[256px] h-screen bg-[#0F172A] fixed left-0 top-0 flex flex-col z-[100]">
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-4 h-4 bg-[#6366F1] rounded-sm shrink-0" />
          <h1 className="text-white text-[18px] font-semibold tracking-tight">ReimburseIQ</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label} className="mt-6 mb-2">
              <h3 className="px-4 text-[#475569] text-[11px] font-semibold uppercase tracking-[0.08em] mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `
                      flex items-center gap-3 h-10 px-4 rounded-lg transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#1E293B] text-white border-l-[3px] border-[#6366F1]' 
                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-l-[3px] border-transparent'
                      }
                    `}
                  >
                    <item.icon size={18} />
                    <span className="text-[13px] font-medium leading-none">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-[#1E293B]">
          <div className="flex items-center gap-3 px-2 mb-4">
             <div className="w-8 h-8 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-[13px] font-bold">
               {getInitials(user.name)}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-white text-[14px] font-medium truncate leading-none mb-1.5">{user.name || 'Admin'}</span>
               <span className="px-1.5 py-0.5 bg-[#312E81] text-[#A5B4FC] text-[10px] font-bold rounded w-fit leading-none">ADMIN</span>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 h-10 text-[#94A3B8] hover:text-[#EF4444] rounded-lg transition-colors group"
          >
            <LogOut size={18} />
            <span className="text-[13px] font-medium leading-none">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[256px] flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-[64px] bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-50">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">{title || 'Admin Control'}</h2>
          
          <div className="flex items-center gap-6">
            <button className="text-[#64748B] hover:text-[#0F172A] transition-colors relative">
               <Bell size={20} strokeWidth={2} />
               <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 border border-[#E2E8F0] rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] text-[14px] font-bold">
                   {getInitials(user.name)}
                </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8 pb-16 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, ShieldCheck, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Approval Rules', path: '/admin/rules', icon: ShieldCheck },
    { name: 'Expense Oversight', path: '/admin/expenses', icon: FileText },
    { name: 'Company Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="w-[256px] h-screen bg-[#0F172A] fixed left-0 top-0 flex flex-col z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        <h1 className="text-white font-bold text-xl tracking-tight">Reimburse<span className="text-[#6366F1]">IQ</span></h1>
      </div>
      
      <nav className="flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-6 h-12 transition-all duration-200 group
              ${isActive 
                ? 'bg-[#1E293B] text-white border-l-[3px] border-[#6366F1]' 
                : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white border-l-[3px] border-transparent'
              }
            `}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-medium text-[14px]">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 h-12 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#EF4444] rounded-lg transition-all group"
        >
          <LogOut size={20} />
          <span className="font-medium text-[14px]">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  GitBranch, 
  Receipt, 
  Settings, 
  LogOut, 
  CreditCard,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isManager = user?.role === 'Manager' || user?.role === 'Admin';

  const navGroups = isAdmin ? [
    {
      label: 'Admin Panel',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Manage Employees', path: '/admin/users', icon: Users },
        { name: 'Approval Rules', path: '/admin/rules', icon: GitBranch },
        { name: 'All Expenses', path: '/admin/expenses', icon: Receipt },
        { name: 'Company Settings', path: '/admin/company', icon: Settings },
      ]
    }
  ] : [
    {
      label: 'My Workspace',
      items: [
        { 
          name: 'My Expenses', 
          id: 'my-expenses', 
          icon: LayoutDashboard,
          onClick: () => onTabChange('my-expenses')
        },
      ]
    }
  ];

  if (!isAdmin && isManager) {
    navGroups.push({
      label: 'Manager Tools',
      items: [
        { 
          name: 'Team Approvals', 
          id: 'approvals', 
          icon: CheckSquare,
          badge: true,
          onClick: () => onTabChange('approvals')
        },
      ]
    });
  }

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 flex flex-col bg-slate-950 border-r border-white/5 z-50">
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Odoo <span className="text-indigo-500">X</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Expense System</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pt-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{group.label}</h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isAdmin ? location.pathname === item.path : activeTab === item.id;
                
                return isAdmin ? (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 h-12 rounded-2xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-white/5 text-white border border-white/10 shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                      <span className="text-[13px] font-bold uppercase tracking-tight">{item.name}</span>
                    </div>
                    {isActive && <motion.div layoutId="activeInd" className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                  </NavLink>
                ) : (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`
                      w-full flex items-center justify-between px-4 h-12 rounded-2xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-white/5 text-white border border-white/10 shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? (item.id === 'approvals' ? 'text-emerald-400' : 'text-indigo-400') : ''} />
                      <span className="text-[13px] font-bold uppercase tracking-tight">{item.name}</span>
                    </div>
                    {item.badge && !isActive && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="activeInd" 
                        className={`w-1.5 h-1.5 rounded-full shadow-lg ${item.id === 'approvals' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-indigo-500 shadow-indigo-500/40'}`} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Bottom Section */}
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="flex items-center gap-4 px-2 mb-6 group cursor-pointer">
           <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm uppercase group-hover:bg-indigo-500 transition-all duration-500">
              {user?.name?.split(' ').map(n=>n[0]).join('')}
           </div>
           <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-black uppercase truncate tracking-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Shield size={10} className="text-indigo-500" />
                {user?.role}
              </span>
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 h-12 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[13px] font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

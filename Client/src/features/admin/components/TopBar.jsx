import React from 'react';
import { Bell, Search, UserCircle, Settings } from 'lucide-react';

const TopBar = ({ title }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="h-[64px] bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="text-[18px] font-semibold text-[#0F172A]">{title}</h2>
        
        <div className="max-w-[400px] w-full relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#6366F1] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search documents, people, or rules..."
            className="w-full h-[38px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-10 pr-4 text-[14px] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-[32px] w-[1px] bg-[#E2E8F0] mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-semibold text-[#0F172A]">{user.name || 'Admin User'}</span>
            <span className="text-[11px] font-medium uppercase text-[#64748B] tracking-wider">{user.role || 'Administrator'}</span>
          </div>
          <div className="h-10 w-10 bg-[#EEF2FF] border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#4F46E5] overflow-hidden">
             {user.name ? (
               <span className="text-[14px] font-bold">{user.name.split(' ').map(n => n[0]).join('')}</span>
             ) : (
               <UserCircle size={24} />
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

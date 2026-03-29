import React, { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Building, ShieldCheck, Mail } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />

      <div className="relative w-full max-w-2xl">
        <div className="glass-card rounded-[2.5rem] p-10 md:p-14 text-center border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-neonPurple/20 rounded-full flex items-center justify-center mx-auto mb-8 relative border border-neonPurple/30">
            <UserIcon size={48} className="text-neonPurple" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            You are logged in as <span className="text-white font-semibold">@{user?.name.toLowerCase().replace(' ', '')}</span> in our premium ecosystem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Mail size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email</p>
                <p className="text-sm text-slate-200 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Building size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Identity</p>
                <p className="text-sm text-slate-200">{user?.role || 'Member'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={logout}
              className="px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all flex-1"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

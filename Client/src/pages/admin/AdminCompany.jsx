import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Building2, Save, MapPin, Globe, CreditCard, Lock, Users, Shield, ArrowRight, DollarSign, Plus, Settings2, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminCompany = () => {
  const [company, setCompany] = useState(null);
  const [counts, setCounts] = useState({ employee: 0, manager: 0, admin: 0 });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const fetchData = async () => {
    try {
      const [compRes, usersRes, rulesRes] = await Promise.all([
        api.get('/admin/company'),
        api.get('/admin/users'),
        api.get('/admin/rules')
      ]);
      setCompany(compRes.data.company);
      setName(compRes.data.company.name);
      setRules(rulesRes.data.rules);
      
      const roles = { employee: 0, manager: 0, admin: 0 };
      usersRes.data.users.forEach(u => {
        const r = u.role.toLowerCase();
        if (roles[r] !== undefined) roles[r]++;
      });
      setCounts(roles);
    } catch {
      toast.error('Failed to load organizational data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/admin/company', { name });
      toast.success('System: Settings synchronized');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <AdminLayout title="System Settings"><div className="animate-pulse bg-white/5 h-64 rounded-[2.5rem]"></div></AdminLayout>;

  return (
    <AdminLayout title="Organizational Core" subtitle="Global Identity & Financial Configuration">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500 pb-20">
        
        {/* Left Column - Core Settings */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card rounded-[2.5rem] border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
             <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Entity Profile</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 italic">/ Define primary organization identity</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                   <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">Sync Active</span>
                </div>
             </div>
             
             <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-1 italic">Corporate Label</label>
                   <input 
                     type="text" 
                     className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-800"
                     value={name} onChange={(e) => setName(e.target.value)}
                     placeholder="ENTITY DISLAY NAME"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4 opacity-70 group">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-1 italic flex items-center gap-2">
                         Geographic Node <Lock size={12} className="text-slate-700" />
                      </label>
                      <div className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center px-6 text-[11px] text-slate-400 font-black uppercase tracking-widest gap-4 shadow-inner group-hover:border-white/10 transition-all cursor-not-allowed">
                         <Globe size={18} className="text-slate-700" /> {company?.country}
                      </div>
                   </div>
                   <div className="space-y-4 opacity-70 group">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-1 italic flex items-center gap-2">
                         Monetary Base <Lock size={12} className="text-slate-700" />
                      </label>
                      <div className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center px-6 text-[11px] text-slate-400 font-black uppercase tracking-widest gap-4 shadow-inner group-hover:border-white/10 transition-all cursor-not-allowed">
                         <CreditCard size={18} className="text-slate-700" /> {company?.currency}
                      </div>
                   </div>
                </div>
                
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                   <Shield size={20} className="text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest leading-relaxed italic">Immutable Vectors: Region and Currency are locked in the kernel to maintain financial audit integrity. Please contact system architecture support for modifications.</p>
                </div>
                
                <div className="flex justify-end pt-8 border-t border-white/5">
                   <button type="submit" className="h-14 bg-indigo-600 text-white font-black px-10 rounded-2xl uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center gap-3">
                      <Save size={18} /> Synchronize Matrix
                   </button>
                </div>
             </form>
          </div>

          {/* Team Snapshot */}
          <div className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-white/[0.01] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users size={120} className="text-indigo-500" />
             </div>
             <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                   <Activity size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Identity Allocation Overview</h3>
             </div>
             <div className="grid grid-cols-3 gap-10 relative z-10">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center hover:bg-white/[0.05] transition-all shadow-inner">
                   <span className="block text-4xl font-black text-white italic tracking-tighter mb-2">{counts.employee}</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Active Employees</span>
                </div>
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center hover:bg-white/[0.05] transition-all shadow-inner">
                   <span className="block text-4xl font-black text-white italic tracking-tighter mb-2">{counts.manager}</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Authority Figures</span>
                </div>
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center hover:bg-white/[0.05] transition-all shadow-inner">
                   <span className="block text-4xl font-black text-white italic tracking-tighter mb-2">{counts.admin}</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Kernel Admins</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column - Secondary Config */}
        <div className="space-y-10">
           {/* Currency Focus */}
           <div className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-white/[0.01] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <DollarSign size={80} className="text-indigo-500" />
              </div>
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                 <Zap size={24} />
              </div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Monetary Globalisation</h4>
              <div className="text-6xl font-black text-white italic tracking-tighter">{company?.currency}</div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6 leading-relaxed italic">* Unified base currency for automated conversion across all telemetry nodes.</p>
           </div>

           {/* Policy Registry Summary */}
           <div className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-white/[0.01] shadow-2xl">
              <div className="flex items-center gap-3 mb-8 px-1">
                 <Settings2 size={16} className="text-indigo-500" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Strategy Engine Slice</h4>
              </div>
              <div className="space-y-4">
                 {rules.slice(0, 3).map(rule => (
                    <div key={rule._id} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                       <span className="text-[12px] font-black text-slate-300 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{rule.name}</span>
                       <span className={`text-[8px] font-black uppercase tracking-widest w-fit px-2 py-0.5 rounded-lg border ${
                          rule.conditionType === 'sequential' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                       }`}>{rule.conditionType}</span>
                    </div>
                 ))}
                 <Link to="/admin/rules" className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-indigo-300 transition-all pt-4 px-1 group">
                    Logic Matrix Hub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>

           {/* Direct Commands */}
           <div className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-white/[0.01] shadow-2xl">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-8 px-1 italic">Identity Transmissions</h4>
              <div className="space-y-4">
                 <Link to="/admin/users" className="flex items-center justify-between w-full h-14 px-8 bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-indigo-50 transition-all hover:text-indigo-900 group">
                    New Identity <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                 </Link>
                 <Link to="/admin/rules" className="flex items-center justify-between w-full h-14 px-8 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all group shadow-inner">
                    New Policy <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompany;

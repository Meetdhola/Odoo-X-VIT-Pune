import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Building2, Save, MapPin, Globe, CreditCard, Lock, Users, Shield, ArrowRight, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/admin/company', { name });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (loading) return <AdminLayout title="Company Settings"><div className="animate-pulse bg-white border h-64 rounded-xl"></div></AdminLayout>;

  return (
    <AdminLayout title="Company Settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <h3 className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2">
                  <Building2 size={18} className="text-[#6366F1]" /> General Settings
                </h3>
             </div>
             <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Company Display Name</label>
                   <input 
                     type="text" className="w-full h-11 border border-[#D1D5DB] rounded-lg px-4 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
                     value={name} onChange={(e) => setName(e.target.value)}
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5 opacity-70">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide flex items-center gap-1.5">
                         Country <Lock size={12} />
                      </label>
                      <div className="w-full h-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center px-4 text-[14px] text-[#475569] font-medium gap-2">
                         <Globe size={16} /> {company?.country}
                      </div>
                   </div>
                   <div className="space-y-1.5 opacity-70">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide flex items-center gap-1.5">
                         Base Currency <Lock size={12} />
                      </label>
                      <div className="w-full h-11 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center px-4 text-[14px] text-[#475569] font-medium gap-2">
                         <CreditCard size={16} /> {company?.currency}
                      </div>
                   </div>
                </div>
                
                <p className="text-[11px] text-[#64748B] italic">Currency and Country are locked after signup for financial audit integrity. Contact support for changes.</p>
                
                <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
                   <button type="submit" className="bg-[#4F46E5] text-white h-11 px-8 rounded-lg font-bold hover:bg-[#4338CA] transition-all shadow-md">
                      Save Changes
                   </button>
                </div>
             </form>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-sm p-6">
             <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-6 flex items-center gap-2">
                <Users size={16} className="text-[#6366F1]" /> Team Overview
             </h3>
             <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                   <span className="block text-[24px] font-bold text-[#0F172A]">{counts.employee}</span>
                   <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Employees</span>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                   <span className="block text-[24px] font-bold text-[#0F172A]">{counts.manager}</span>
                   <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Managers</span>
                </div>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                   <span className="block text-[24px] font-bold text-[#0F172A]">{counts.admin}</span>
                   <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Admins</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#4F46E5] mb-4">
                 <DollarSign size={20} />
              </div>
              <h4 className="text-[14px] font-bold text-[#0F172A] mb-1">Currency Localisation</h4>
              <span className="text-[32px] font-bold text-[#6366F1]">{company?.currency}</span>
              <p className="text-[12px] text-[#64748B] mt-2 leading-relaxed font-medium">All expense amounts are automatically converted to this currency at submission using live exchange rates.</p>
           </div>

           <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
              <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide mb-4">Active Rules Summary</h4>
              <div className="space-y-3">
                 {rules.slice(0, 3).map(rule => (
                    <div key={rule._id} className="flex flex-col">
                       <span className="text-[14px] font-medium text-[#0F172A]">{rule.name}</span>
                       <span className={`text-[10px] font-bold uppercase w-fit px-1.5 rounded mt-0.5 ${
                          rule.conditionType === 'sequential' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                       }`}>{rule.conditionType}</span>
                    </div>
                 ))}
                 <Link to="/admin/rules" className="block text-[12px] font-bold text-[#6366F1] hover:underline pt-2">Manage rules →</Link>
              </div>
           </div>

           <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
              <h4 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide mb-4">Quick Actions</h4>
              <div className="space-y-3">
                 <Link to="/admin/users" className="flex items-center justify-between w-full h-[38px] px-3 bg-[#4F46E5] text-white text-[13px] font-bold rounded-lg hover:bg-[#4338CA] transition-all">
                    Add Employee <ArrowRight size={14} />
                 </Link>
                 <Link to="/admin/rules" className="flex items-center justify-between w-full h-[38px] px-3 border border-[#D1D5DB] text-[#374151] text-[13px] font-bold rounded-lg hover:bg-gray-50 transition-all">
                    Create Rule <Plus size={14} />
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompany;

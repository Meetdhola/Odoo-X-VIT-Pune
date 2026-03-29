import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, ChevronRight, AlertTriangle, PieChart, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, colorClass, subtext }) => (
  <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01] relative group overflow-hidden">
    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
    <div className="flex justify-between items-center mb-6">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">{label}</span>
      <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="text-3xl font-black text-white tracking-tight italic mb-1 uppercase">{value}</div>
    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{subtext}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, expensesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/expenses?limit=8')
        ]);
        setStats(statsRes.data.stats);
        setRecentExpenses(expensesRes.data.expenses);
      } catch (err) {
        toast.error('Failed to load terminal data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <AdminLayout title="Dashboard"><TableLoader /></AdminLayout>;
  }

  const { totalUsers, expenses, approvalBottlenecks, expensesByCategory } = stats || {};

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Company Summary">

      <div className="space-y-10">

        {/* Row 1 — 5 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Employees" value={totalUsers?.employee || 0} colorClass="text-[#6366F1]" subtext="Total Staff" />
          <StatCard icon={Clock} label="Pending" value={expenses?.pending || 0} colorClass="text-amber-500" subtext="Waiting Review" />
          <StatCard icon={CheckCircle} label="Monthly Appr" value={expenses?.approvedThisMonth || 0} colorClass="text-emerald-500" subtext="Paid Out" />
          <StatCard icon={XCircle} label="Monthly Rej" value={expenses?.rejectedThisMonth || 0} colorClass="text-red-500" subtext="Rejected" />
          <StatCard icon={TrendingUp} label="Total Spend" value={`${stats?.currency || '$'}${((expenses?.totalSpendThisMonth || 0) / 1000).toFixed(1)}K`} colorClass="text-indigo-400" subtext="Money Spent" />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Expenses Table */}
          <div className="lg:col-span-2 glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-indigo-500" />

                <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h3>
              </div >
              <Link to="/admin/expenses" className="group flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-all">
                Full Reports <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div >

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01]">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(!recentExpenses || recentExpenses.length === 0) ? (
                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-700 text-[10px] uppercase font-black tracking-widest">No Recent Data</td></tr>
                  ) : recentExpenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-black uppercase">
                            {exp.employee?.name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-white uppercase tracking-tight leading-none mb-1">{exp.employee?.name}</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic leading-none">{exp.employee?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-slate-500 font-black uppercase tracking-tight group-hover:text-white transition-all">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[13px] font-black text-white uppercase tracking-tight mb-0.5">{exp.currency} {exp.amount.toFixed(2)}</div>
                        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">~ {stats?.currency || '$'} {exp.convertedAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${exp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          exp.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                          {exp.status === 'pending' ? 'Review' : exp.status}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right text-[11px] text-slate-500 font-bold uppercase">
                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div >

          {/* Right Column Analysis */}
          < div className="flex flex-col gap-8" >
            {/* Approval Bottlenecks */}
            < div className="glass-card rounded-[2.5rem] border-white/5 p-8 bg-white/[0.01]" >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Pending Approvals</h3>

              </div >
              <div className="space-y-5">
                {approvalBottlenecks?.map((bot, idx) => (
                  <div key={idx} className="flex items-center justify-between group bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-[11px] font-black uppercase">
                        {bot.approver.name.charAt(0)}
                      </div>
                      <span className="text-[12px] text-white font-black uppercase tracking-tight">{bot.approver.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-black text-amber-500 italic uppercase leading-none mb-1">{bot.pendingCount} Items</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Waiting</span>
                    </div>
                  </div>
                ))}
                {(!approvalBottlenecks || approvalBottlenecks.length === 0) && (
                  <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-widest py-10 italic">No Waiting Items</p>
                )}
              </div>
            </div >

            {/* Expenses by Category */}
            < div className="glass-card rounded-[2.5rem] border-white/5 p-8 bg-white/[0.01]" >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <PieChart size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Spend by Category</h3>

              </div >
              <div className="space-y-6">
                {(expensesByCategory || []).sort((a, b) => b.total - a.total).slice(0, 5).map((cat, idx) => {
                  const maxTotal = Math.max(...(expensesByCategory || []).map(c => c.total));
                  const width = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400 italic">{cat.category}</span>
                        <span className="text-white">{stats?.currency || '$'}{cat.total.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div >
          </div >
        </div >
      </div >
    </AdminLayout >
  );
};

const TableLoader = () => (
  <div className="animate-pulse space-y-10">
    <div className="grid grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-[2.5rem]" />)}
    </div>
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 h-[500px] bg-white/5 rounded-[2.5rem]" />
      <div className="flex flex-col gap-8">
        <div className="h-[235px] bg-white/5 rounded-[2.5rem]" />
        <div className="h-[235px] bg-white/5 rounded-[2.5rem]" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;

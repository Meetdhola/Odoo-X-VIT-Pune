import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, ChevronRight, AlertTriangle, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 flex flex-col items-center text-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colorClass}`}>
      <Icon size={20} />
    </div>
    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.05em] mb-1">{label}</span>
    <span className="text-[22px] font-bold text-[#0F172A]">{value}</span>
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
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load dashboard data';
        toast.error(errorMessage);
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return <AdminLayout title="Dashboard"><div className="animate-pulse space-y-8">
        <div className="grid grid-cols-5 gap-4"><div className="h-32 bg-gray-200 rounded-lg col-span-5"></div></div>
        <div className="grid grid-cols-3 gap-6"><div className="h-64 bg-gray-200 rounded-lg col-span-2"></div><div className="h-64 bg-gray-200 rounded-lg col-span-1"></div></div>
     </div></AdminLayout>;
  }

  const { totalUsers, expenses, approvalBottlenecks, expensesByCategory } = stats || {};

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Row 1 — 5 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total Employees" value={totalUsers?.employee || 0} colorClass="bg-[#EEF2FF] text-[#6366F1]" />
          <StatCard icon={Clock} label="Pending Approvals" value={expenses?.pending || 0} colorClass="bg-[#FEF3C7] text-[#D97706]" />
          <StatCard icon={CheckCircle} label="Approved (Month)" value={expenses?.approvedThisMonth || 0} colorClass="bg-[#D1FAE5] text-[#059669]" />
          <StatCard icon={XCircle} label="Rejected (Month)" value={expenses?.rejectedThisMonth || 0} colorClass="bg-[#FEE2E2] text-[#DC2626]" />
          <StatCard icon={TrendingUp} label="Total Spend" value={`${stats?.currency || '$'} ${(expenses?.totalSpendThisMonth || 0).toLocaleString()}`} colorClass="bg-[#EEF2FF] text-[#4F46E5]" />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Expenses */}
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[10px] flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#F1F5F9]">
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Recent Expenses</h3>
              <Link to="/admin/expenses" className="text-[14px] font-medium text-[#4F46E5] hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                   <tr>
                     <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase">Employee</th>
                     <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase">Category</th>
                     <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase">Amount</th>
                     <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase">Status</th>
                     <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(!recentExpenses || recentExpenses.length === 0) ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8] text-[14px]">No expenses yet</td></tr>
                  ) : recentExpenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-[#F8FAFC] transition-colors h-[52px]">
                      <td className="px-6 flex items-center gap-3 h-[52px]">
                        <div className="w-7 h-7 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[11px] font-bold">
                           {exp.employee?.name?.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="text-[14px] text-[#0F172A]">{exp.employee?.name}</span>
                      </td>
                      <td className="px-4">
                        <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[12px] rounded-md font-medium">{exp.category}</span>
                      </td>
                      <td className="px-4 text-[14px] font-semibold text-[#0F172A]">{exp.currency} {exp.amount}</td>
                      <td className="px-4">
                        <div className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          exp.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 
                          exp.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}>
                          {exp.status}
                        </div>
                      </td>
                      <td className="px-6 text-[13px] text-[#64748B]">{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="space-y-6">
            {/* Approval Bottlenecks */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-[#D97706]" />
                <h3 className="text-[15px] font-semibold text-[#0F172A]">Approval Bottlenecks</h3>
              </div>
              <div className="space-y-4">
                {approvalBottlenecks?.map((bot, idx) => (
                   <div key={idx} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                       <div className="w-7 h-7 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center text-[11px] font-bold">
                         {bot.approver.name.charAt(0)}
                       </div>
                       <span className="text-[14px] text-[#0F172A] font-medium">{bot.approver.name}</span>
                     </div>
                     <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold rounded-full">
                       {bot.pendingCount}
                     </span>
                   </div>
                ))}
                {(!approvalBottlenecks || approvalBottlenecks.length === 0) && (
                  <p className="text-center text-[13px] text-[#64748B] py-4">No pending approvals</p>
                )}
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                 <PieChart size={18} className="text-[#6366F1]" />
                 <h3 className="text-[15px] font-semibold text-[#0F172A]">Expenses by Category</h3>
               </div>
               <div className="space-y-5">
                 {(expensesByCategory || []).sort((a,b) => b.total - a.total).slice(0, 6).map((cat, idx) => {
                   const maxTotal = Math.max(...(expensesByCategory || []).map(c => c.total));
                   const width = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
                   return (
                     <div key={idx} className="space-y-1.5">
                       <div className="flex justify-between text-[12px] font-medium text-[#64748B]">
                         <span>{cat.category}</span>
                         <span className="text-[#0F172A]">{stats?.currency || '$'} {cat.total.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-[#EEF2FF] rounded-full overflow-hidden">
                         <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${width}%` }} />
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

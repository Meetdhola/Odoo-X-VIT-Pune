import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import StatCard from '../components/StatCard.jsx';
import { Users, CreditCard, CheckCircle, XCircle, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-[10px] border border-[#E2E8F0]"></div>
        ))}
      </div>
    );
  }

  const { totalUsers, expenses, approvalBottlenecks, expensesByCategory } = stats || {};

  return (
    <div className="space-y-8">
      {/* Upper Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Employees" 
          value={totalUsers?.employee || 0} 
          color="blue"
        />
        <StatCard 
          icon={CreditCard} 
          label="Total Expenses" 
          value={expenses?.total || 0} 
          color="indigo"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Spend (MTD)" 
          value={`$${(expenses?.totalSpendThisMonth || 0).toLocaleString()}`} 
          color="emerald"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Pending Approvals" 
          value={expenses?.pending || 0} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-[#0F172A]">Spending by Category</h3>
          </div>
          <div className="space-y-4">
            {expensesByCategory?.map((cat) => (
              <div key={cat.category} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold text-[#64748B] group-hover:text-[#0F172A] transition-colors">{cat.category}</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">${cat.total.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#6366F1] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (cat.total / (expenses?.totalSpendThisMonth || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottlenecks / Approvers */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-[#0F172A]">Top Approver Workload</h3>
          </div>
          <div className="space-y-5">
            {approvalBottlenecks?.map((bot, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[12px] font-bold text-[#64748B] border border-[#E2E8F0]">
                    {idx + 1}
                  </div>
                  <span className="text-[14px] font-medium text-[#0F172A]">{bot.approver.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#92400E] bg-[#FEF3C7] px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Clock size={12} />
                  {bot.pendingCount} Pending
                </div>
              </div>
            ))}
            {(!approvalBottlenecks || approvalBottlenecks.length === 0) && (
              <div className="text-center py-10">
                <p className="text-[#64748B] text-[13px]">No pending bottlenecks found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

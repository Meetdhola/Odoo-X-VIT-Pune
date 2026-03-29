import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Search, Filter, Eye, CheckCircle2, XCircle, MoreVertical, CreditCard, Calendar, User, UserCheck } from 'lucide-react';
import { StatusBadge } from '../components/Badges.jsx';
import RightDrawer from '../components/RightDrawer.jsx';
import toast from 'react-hot-toast';

const ExpenseOversight = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [approvalRequests, setApprovalRequests] = useState([]);
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/expenses', { params: filters });
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleViewDetail = async (expenseId) => {
    try {
      const { data } = await api.get(`/admin/expenses/${expenseId}`);
      setSelectedExpense(data.expense);
      setApprovalRequests(data.approvalRequests);
      setIsDrawerOpen(true);
    } catch {
      toast.error('Failed to load expense details');
    }
  };

  const handleOverride = async (action) => {
    if (!window.confirm(`Force ${action} this expense? This bypasses all approval steps.`)) return;
    try {
      await api.post(`/admin/expenses/${selectedExpense._id}/override`, { action, comment: 'Admin Override' });
      toast.success(`Expense ${action}d successfully`);
      setIsDrawerOpen(false);
      fetchExpenses();
    } catch {
      toast.error('Override failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-[10px] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Expense Oversight</h2>
          <p className="text-[13px] text-[#64748B]">Audit and override all expenses across the company.</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            className="input-base w-[160px]"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input 
              type="text" 
              placeholder="Search category..." 
              className="input-base pl-9 w-[200px]"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="table-header-cell pl-6">Employee</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Category</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Current Approver</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i} className="h-[52px] animate-pulse"><td colSpan="7" className="px-6 py-4 bg-gray-50/30"></td></tr>)
            ) : expenses.map((exp) => (
              <tr key={exp._id} className="table-row">
                <td className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-bold text-[#374151]">
                       {exp.employee?.name?.charAt(0)}
                    </div>
                    <span className="text-[14px] font-semibold text-[#0F172A]">{exp.employee?.name}</span>
                  </div>
                </td>
                <td className="px-4 text-[13px] text-[#64748B]">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-4 text-[13px] font-medium text-[#0F172A]">{exp.category}</td>
                <td className="px-4">
                  <span className="text-[14px] font-bold text-[#0F172A]">{exp.currency} {exp.amount.toLocaleString()}</span>
                </td>
                <td className="px-4">
                   {exp.currentApprover ? (
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748B]">
                        <UserCheck size={14} className="text-[#6366F1]" />
                        {exp.currentApprover.name}
                      </div>
                   ) : <span className="text-[12px] text-[#94A3B8]">--</span>}
                </td>
                <td className="px-4">
                  <StatusBadge status={exp.status} />
                </td>
                <td className="px-6 text-right">
                  <button 
                    onClick={() => handleViewDetail(exp._id)}
                    className="p-2 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Expense Verification Detail"
      >
        {selectedExpense && (
          <div className="space-y-8">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Total Amount</span>
                  <span className="text-[24px] font-bold text-[#0F172A]">{selectedExpense.currency} {selectedExpense.amount.toLocaleString()}</span>
                </div>
                <StatusBadge status={selectedExpense.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-2 text-[13px]">
                   <CreditCard size={14} className="text-[#94A3B8]" />
                   <span className="text-[#64748B]">Category:</span>
                   <span className="font-semibold text-[#0F172A]">{selectedExpense.category}</span>
                 </div>
                 <div className="flex items-center gap-2 text-[13px]">
                   <Calendar size={14} className="text-[#94A3B8]" />
                   <span className="text-[#64748B]">Submitted:</span>
                   <span className="font-semibold text-[#0F172A]">{new Date(selectedExpense.date).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[14px] font-bold text-[#0F172A] flex items-center gap-2">
                <UserCheck size={16} className="text-[#6366F1]" />
                Approval History
              </h4>
              <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E2E8F0]">
                {approvalRequests.map((req, idx) => (
                   <div key={idx} className="relative pl-10">
                     <div className={`absolute left-0 top-1 w-[35px] h-[35px] rounded-full border-2 border-white flex items-center justify-center p-2 z-10 ${
                       req.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 
                       req.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#F1F5F9] text-[#64748B]'
                     }`}>
                       {req.status === 'approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[13px] font-bold text-[#0F172A]">{req.approver?.name}</span>
                       <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-tight">Step {req.step === -1 ? 'Manager' : req.step + 1} • {req.status}</span>
                       {req.comment && <p className="mt-1.5 p-2 bg-[#F8FAFC] rounded-lg text-[12px] italic text-[#64748B]">"{req.comment}"</p>}
                     </div>
                   </div>
                ))}
              </div>
            </div>

            {selectedExpense.status === 'pending' && (
              <div className="pt-8 border-t border-[#E2E8F0] space-y-4">
                <div className="p-4 bg-[#FFF1F2] border border-[#FEE2E2] rounded-lg">
                  <h5 className="text-[13px] font-bold text-[#991B1B] mb-1">Administrative Override</h5>
                  <p className="text-[12px] text-[#991B1B]/80 font-medium leading-relaxed">By performing this action, you bypass the configured workflow. This activity will be logged.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleOverride('approve')}
                    className="flex-1 bg-[#10B981] text-white font-bold h-[44px] rounded-lg hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Force Approve
                  </button>
                  <button 
                    onClick={() => handleOverride('reject')}
                    className="flex-1 bg-[#EF4444] text-white font-bold h-[44px] rounded-lg hover:bg-[#DC2626] transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Force Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

// Simple Clock icon helper if not imported
const Clock = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default ExpenseOversight;

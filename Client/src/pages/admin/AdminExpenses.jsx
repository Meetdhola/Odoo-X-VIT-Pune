import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Search, Filter, Eye, ShieldAlert, Download, CreditCard, Calendar, User, UserCheck, CheckCircle, XCircle, Clock, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusPill = ({ label, count, colorClass, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-all ${
      active ? 'bg-white border-[#6366F1] shadow-sm' : 'bg-transparent border-[#E2E8F0] hover:border-[#CBD5E1]'
    }`}
  >
    <span className="text-[13px] font-semibold text-[#64748B]">{label}</span>
    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${colorClass}`}>{count}</span>
  </div>
);

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', from: '', to: '' });
  const [showDetail, setShowDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [overrideComment, setOverrideComment] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/expenses', { params: { ...filters, page, limit: 10 } });
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [page, filters]);

  const handleOpenDetail = async (exp) => {
    try {
      const { data } = await api.get(`/admin/expenses/${exp._id}`);
      setSelectedExpense(data.expense);
      setApprovalHistory(data.approvalRequests);
      setOverrideComment('');
      setShowDetail(true);
    } catch {
      toast.error('Failed to load expense details');
    }
  };

  const handleOverride = async (action) => {
    if (!window.confirm(`Force ${action} this expense? This bypasses the approval chain.`)) return;
    try {
      await api.post(`/admin/expenses/${selectedExpense._id}/override`, { action, comment: overrideComment || 'Admin Override' });
      toast.success(`Expense ${action}d successfully`);
      setShowDetail(false);
      fetchExpenses();
    } catch {
      toast.error('Override failed');
    }
  };

  const categories = ['Travel', 'Meals', 'Accommodation', 'Software', 'Equipment', 'Other'];

  return (
    <AdminLayout title="All Expenses">
      <div className="space-y-6">
        {/* Quick Filters */}
        <div className="flex items-center gap-3">
           <StatusPill label="All" count={total} colorClass="bg-[#F1F5F9] text-[#64748B]" active={filters.status === ''} onClick={() => setFilters({...filters, status: ''})} />
           <StatusPill label="Pending" count={expenses.filter(e => e.status === 'pending').length} colorClass="bg-[#FEF3C7] text-[#92400E]" active={filters.status === 'pending'} onClick={() => setFilters({...filters, status: 'pending'})} />
           <StatusPill label="Approved" count={expenses.filter(e => e.status === 'approved').length} colorClass="bg-[#D1FAE5] text-[#065F46]" active={filters.status === 'approved'} onClick={() => setFilters({...filters, status: 'approved'})} />
           <StatusPill label="Rejected" count={expenses.filter(e => e.status === 'rejected').length} colorClass="bg-[#FEE2E2] text-[#991B1B]" active={filters.status === 'rejected'} onClick={() => setFilters({...filters, status: 'rejected'})} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 border border-[#E2E8F0] rounded-[10px] shadow-sm flex flex-wrap items-center gap-4">
           <select 
             className="h-10 border border-[#D1D5DB] rounded-lg px-3 text-[14px] outline-none min-w-[140px]"
             value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}
           >
             <option value="">All Categories</option>
             {categories.map(c => <option key={c} value={c}>{c}</option>)}
           </select>

           <div className="flex items-center gap-2 border border-[#D1D5DB] rounded-lg px-3 h-10">
             <Calendar size={16} className="text-[#94A3B8]" />
             <input type="date" className="text-[13px] outline-none bg-transparent" value={filters.from} onChange={(e) => setFilters({...filters, from: e.target.value})} />
             <span className="text-[#E2E8F0]">|</span>
             <input type="date" className="text-[13px] outline-none bg-transparent" value={filters.to} onChange={(e) => setFilters({...filters, to: e.target.value})} />
           </div>

           <button className="bg-white border border-[#D1D5DB] text-[#374151] h-10 px-4 rounded-lg flex items-center gap-2 text-[14px] font-medium hover:bg-gray-50 transition-all ml-auto">
             <Download size={16} /> Export CSV
           </button>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC]">
               <tr>
                 <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase">Employee</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Category</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Amount</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Converted</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Waiting on</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">Status</th>
                 <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-[60px]"><td colSpan="7" className="bg-gray-50/30"></td></tr>)
              ) : expenses.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-[#94A3B8] text-[14px]">No expenses found</td></tr>
              ) : expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-[#F8FAFC] transition-colors h-[64px]">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] text-[12px] font-bold">
                         {exp.employee?.name?.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[14px] font-medium text-[#0F172A] leading-none mb-1">{exp.employee?.name}</span>
                         <span className="text-[12px] text-[#64748B] leading-none">{new Date(exp.date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[12px] rounded-md font-medium">{exp.category}</span>
                  </td>
                  <td className="px-4 text-[13px] text-[#64748B]">{exp.currency} {exp.amount.toLocaleString()}</td>
                  <td className="px-4 text-[14px] font-bold text-[#0F172A]">${(exp.convertedAmount || exp.amount).toLocaleString()}</td>
                  <td className="px-4 text-[13px] font-medium text-[#64748B]">
                     {exp.currentApprover ? exp.currentApprover.name : <span className="text-[#E2E8F0]">--</span>}
                  </td>
                  <td className="px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      exp.status === 'approved' ? 'bg-[#D1FAE5] text-[#065F46]' : 
                      exp.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                       <button onClick={() => handleOpenDetail(exp)} className="p-2 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-all">
                         <Eye size={18} />
                       </button>
                       {exp.status === 'pending' && (
                         <button onClick={() => handleOpenDetail(exp)} className="p-2 text-[#D97706] hover:bg-[#FFFBEB] rounded-lg transition-all">
                           <ShieldAlert size={18} />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex items-center justify-between">
             <span className="text-[13px] text-[#64748B]">Showing {((page-1)*10)+1} - {Math.min(page*10, total)} of {total}</span>
             <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 border border-[#E2E8F0] rounded-md hover:bg-[#F8FAFC] disabled:opacity-30"><ChevronLeft size={18} /></button>
                <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="p-1.5 border border-[#E2E8F0] rounded-md hover:bg-[#F8FAFC] disabled:opacity-30"><ChevronRight size={18} /></button>
             </div>
          </div>
        </div>

        {/* Expense Detail Drawer */}
        {showDetail && (
          <div className="fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDetail(false)} />
            <div className="absolute right-0 top-0 h-full w-[520px] bg-white shadow-2xl flex flex-col animate-slideInRight overflow-hidden">
               <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Verification Detail</h3>
                  <button onClick={() => setShowDetail(false)} className="p-2 -mr-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                    <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-y-6 bg-[#F8FAFC] p-6 rounded-xl border border-[#E2E8F0]">
                     <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Employee</span>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[10px] font-bold">
                             {selectedExpense?.employee?.name.charAt(0)}
                           </div>
                           <span className="text-[14px] font-semibold text-[#0F172A]">{selectedExpense?.employee?.name}</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Category</span>
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0F172A]">
                           <span className="px-2 py-0.5 bg-[#E2E8F0] text-[#475569] rounded text-[11px]">{selectedExpense?.category}</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Orig. Amount</span>
                        <span className="block text-[15px] font-bold text-[#0F172A]">{selectedExpense?.currency} {selectedExpense?.amount.toLocaleString()}</span>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">Date Submitted</span>
                        <span className="block text-[15px] font-bold text-[#0F172A]">{new Date(selectedExpense?.date).toLocaleDateString()}</span>
                     </div>
                  </div>

                  {/* Receipt */}
                  <div className="space-y-3">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide flex items-center gap-2">
                       <FileText size={14} className="text-[#6366F1]" /> Receipt Document
                    </label>
                    {selectedExpense?.receiptUrl ? (
                      <div className="group relative w-32 h-32 rounded-lg border-2 border-[#E2E8F0] overflow-hidden cursor-pointer hover:border-[#6366F1] transition-all">
                        <img src={selectedExpense.receiptUrl} className="w-full h-full object-cover" alt="receipt" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <span className="text-white text-[11px] font-bold">Open Link</span>
                        </div>
                      </div>
                    ) : (
                      <p className="p-6 bg-gray-50 border border-dashed border-[#E2E8F0] rounded-xl text-center text-[#94A3B8] text-[13px]">No receipt attached</p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-6">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide flex items-center gap-2">
                       <ShieldAlert size={14} className="text-[#6366F1]" /> Approval Sequence
                    </label>
                    <div className="space-y-6 relative before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E2E8F0]">
                       {approvalHistory.map((req, idx) => (
                         <div key={idx} className="relative pl-9 space-y-1.5">
                            <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white z-10 ${
                              req.status === 'approved' ? 'bg-[#10B981]' : (req.status === 'rejected' ? 'bg-[#EF4444]' : 'bg-[#E2E8F0]')
                            }`}>
                               {req.status === 'approved' ? <CheckCircle size={14} /> : (req.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} className="text-[#64748B]" />)}
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <span className="text-[14px] font-bold text-[#0F172A]">{req.approver?.name}</span>
                                  <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold rounded uppercase">Step {req.step === -1 ? 'Direct' : req.step + 1}</span>
                               </div>
                               {req.decidedAt && <span className="text-[11px] text-[#94A3B8]">{new Date(req.decidedAt).toLocaleDateString()}</span>}
                            </div>
                            <div className={`text-[11px] font-bold uppercase ${req.status === 'approved' ? 'text-[#059669]' : (req.status === 'rejected' ? 'text-[#DC2626]' : 'text-[#64748B]')}`}>
                               {req.status}
                            </div>
                            {req.comment && (
                               <div className="border-l-4 border-[#E2E8F0] bg-[#F8FAFC] p-3 rounded-r-lg">
                                  <p className="text-[12px] text-[#64748B] italic">"{req.comment}"</p>
                               </div>
                            )}
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Admin Override */}
                  {selectedExpense?.status === 'pending' && (
                    <div className="pt-8 border-t border-[#E2E8F0] space-y-6">
                       <div className="flex items-center gap-2 p-3 bg-[#EEF2FF] border border-[#CBD5E1] rounded-lg">
                          <ShieldAlert size={18} className="text-[#4F46E5] shrink-0" />
                          <p className="text-[12px] text-[#1E40AF] font-medium leading-relaxed">Admin override bypasses all pending approval steps. Action is permanent.</p>
                       </div>
                       
                       <div className="space-y-2">
                         <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Override Comment (Optional)</label>
                         <textarea 
                           className="w-full border border-[#D1D5DB] rounded-lg p-3 text-[14px] outline-none h-20"
                           value={overrideComment} onChange={(e) => setOverrideComment(e.target.value)}
                         />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => handleOverride('approve')} className="h-11 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition-all">Force Approve</button>
                         <button onClick={() => handleOverride('reject')} className="h-11 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-lg transition-all">Force Reject</button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminExpenses;

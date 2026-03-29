import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Search, Filter, Eye, ShieldAlert, Download, CreditCard, Calendar, User, UserCheck, CheckCircle, XCircle, Clock, X, ChevronLeft, ChevronRight, FileText, Activity, Layers, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const StatusPill = ({ label, count, active, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start gap-1 px-6 py-3 rounded-2xl border transition-all min-w-[120px] ${active
      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
      }`}
  >
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-slate-500'}`}>{label}</span>
    <span className={`text-xl font-black italic ${active ? 'text-white' : 'text-slate-400'}`}>{count || 0}</span>
  </button>
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
      toast.error('Failed to load expense list');
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
    if (!window.confirm('OVERRIDE: Do you want to force this action? This bypasses all normal approval rules.')) return;
    try {
      await api.post(`/admin/expenses/${selectedExpense._id}/override`, { action, comment: overrideComment || 'Admin Override' });
      toast.success(`Expense ${action}d by admin`);
      setShowDetail(false);
      fetchExpenses();
    } catch {
      toast.error('Override failed');
    }
  };

  const categories = ['Travel', 'Meals', 'Accommodation', 'Software', 'Equipment', 'Other'];

  return (

    <AdminLayout title="Review Expenses" subtitle="Approve or reject company expenses">
      <div className="space-y-10 animate-in fade-in duration-500 pb-20">

        {/* Analytics Header */}
        <div className="flex flex-wrap items-center gap-4">

          <StatusPill label="Total Claims" count={total} active={filters.status === ''} onClick={() => setFilters({ ...filters, status: '' })} />
          <StatusPill label="Waiting" count={expenses.filter(e => e.status === 'pending').length} active={filters.status === 'pending'} onClick={() => setFilters({ ...filters, status: 'pending' })} colorClass="text-amber-500" />
          <StatusPill label="Approved" count={expenses.filter(e => e.status === 'approved').length} active={filters.status === 'approved'} onClick={() => setFilters({ ...filters, status: 'approved' })} colorClass="text-emerald-500" />
          <StatusPill label="Rejected" count={expenses.filter(e => e.status === 'rejected').length} active={filters.status === 'rejected'} onClick={() => setFilters({ ...filters, status: 'rejected' })} colorClass="text-red-500" />
        </div>

        {/* Master Control Bar */}
        <div className="glass-card p-6 border-white/5 rounded-[2.5rem] bg-white/[0.01] flex flex-wrap items-center gap-6 shadow-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1 italic">Choose Category</label>
            <select
              className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-[11px] font-black uppercase text-slate-400 outline-none hover:border-white/20 transition-all cursor-pointer shadow-inner"
              value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="" className="bg-slate-900">All Categories</option>
              {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1 italic">Date Range</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 h-12 shadow-inner">
              <Calendar size={14} className="text-slate-500" />
              <input type="date" className="text-[11px] font-black uppercase outline-none bg-transparent text-slate-300" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
              <span className="text-slate-800">to</span>
              <input type="date" className="text-[11px] font-black uppercase outline-none bg-transparent text-slate-300" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
          </div>

          <button className="h-12 px-6 bg-white/5 border border-white/10 text-slate-500 font-black rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all ml-auto shadow-inner">
            <Download size={14} /> Download Report (CSV)

          </button >
        </div >

        {/* Audit Registry Table */}
        < div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl bg-white/[0.01]" >
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Submitted By</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Category</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-right">Amount</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-right">Amount (USD)</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Approver</th>

                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-right">Actions</th>
              </tr >
            </thead >
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <TableLoader rows={8} />
              ) : expenses.length === 0 ? (
                <tr><td colSpan="7" className="px-8 py-24 text-center text-slate-800 text-[10px] font-black uppercase tracking-[0.4em] italic">No expenses found</td></tr>
              ) : expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-indigo-500/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-black uppercase shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {exp.employee?.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-white uppercase tracking-tight leading-none mb-1.5">{exp.employee?.name}</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none italic">{new Date(exp.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-slate-500 font-black uppercase tracking-tight group-hover:text-white transition-all">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="text-[13px] font-black text-slate-400 uppercase tracking-tight">{exp.currency} {exp.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="text-[14px] font-black text-white uppercase tracking-tight">${(exp.convertedAmount || exp.amount).toLocaleString()}</div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">USD SYNC</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${exp.currentApprover ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`} />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight italic">
                        {exp.currentApprover ? exp.currentApprover.name.split(' ')[0] : 'NONE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${exp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      exp.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                      {exp.status === 'pending' ? 'Review' : exp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenDetail(exp)} className="p-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all shadow-md">
                        <Eye size={18} />
                      </button>
                      {exp.status === 'pending' && (
                        <button onClick={() => handleOpenDetail(exp)} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:text-white hover:bg-amber-500 rounded-xl transition-all shadow-md">
                          <ShieldAlert size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table >

          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic italic">Registry Slice {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} / {total} Total</span>
            <div className="flex gap-3">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronLeft size={18} /></button>
              <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div >

        {/* Global Inspection Drawer */}
        < AnimatePresence >
          {showDetail && (
            <div className="fixed inset-0 z-[200] flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setShowDetail(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full max-w-xl bg-slate-900 border-l border-white/10 shadow-3xl flex flex-col">
                <div className="h-24 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Eye size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Expense Details</h3>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1 italic">/ Review expense details and history</p>

                    </div >
                  </div >
                  <button onClick={() => setShowDetail(false)} className="p-3 -mr-2 text-slate-600 hover:bg-white/5 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
                </div >

                <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-gradient-to-b from-slate-900 to-slate-950">
                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <Activity size={100} className="text-indigo-500" />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Employee</span>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black uppercase">
                          {selectedExpense?.employee?.name.charAt(0)}
                        </div>
                        <span className="text-[15px] font-black text-white uppercase tracking-tight italic">{selectedExpense?.employee?.name}</span>
                      </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Category</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[11px] font-black text-slate-300 uppercase italic tracking-widest">{selectedExpense?.category}</span>
                      </div>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Amount</span>
                      <span className="block text-2xl font-black text-white italic tracking-tighter uppercase">{selectedExpense?.currency} {selectedExpense?.amount.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Date Submitted</span>
                      <span className="block text-[15px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(selectedExpense?.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Receipt Evidence */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic flex items-center gap-2">
                      <FileText size={14} className="text-indigo-500" /> Receipt Image
                    </label>
                    {selectedExpense?.receiptUrl ? (
                      <div className="group relative w-full aspect-video rounded-[2rem] border-2 border-dashed border-white/5 overflow-hidden cursor-pointer hover:border-indigo-500/30 transition-all shadow-inner">
                        <img src={selectedExpense.receiptUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="audit_doc" />
                        <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-4">
                            <Search size={24} />
                          </div>
                          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">View Receipt</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] text-center">
                        <p className="text-[10px] text-slate-800 font-black uppercase tracking-[0.4em] italic leading-relaxed">No Receipt Image Found</p>
                      </div>
                    )}
                  </div>

                  {/* Logic Timeline */}
                  <div className="space-y-8">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic flex items-center gap-2">
                      <Layers size={14} className="text-indigo-500" /> Approval Status
                    </label>
                    <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                      {approvalHistory.map((req, idx) => (
                        <div key={idx} className="relative pl-12 space-y-2 group">
                          <div className={`absolute left-0 top-0 w-8 h-8 rounded-2xl border-2 border-slate-900 group-hover:scale-110 transition-transform flex items-center justify-center text-white z-10 shadow-lg ${req.status === 'approved' ? 'bg-emerald-500 shadow-emerald-500/20' : (req.status === 'rejected' ? 'bg-red-500 shadow-red-500/20' : 'bg-slate-800')
                            }`}>
                            {req.status === 'approved' ? <CheckCircle size={16} className="stroke-[3]" /> : (req.status === 'rejected' ? <XCircle size={16} className="stroke-[3]" /> : <Clock size={16} className="text-slate-500" />)}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-[14px] font-black text-white uppercase tracking-tight italic">{req.approver?.name}</span>
                              <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-slate-500 text-[9px] font-black rounded uppercase tracking-widest italic">{req.step === -1 ? 'Manager' : `Step ${req.step + 1}`}</span>
                            </div>
                            {req.decidedAt && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{new Date(req.decidedAt).toLocaleDateString()}</span>}
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${req.status === 'approved' ? 'text-emerald-500' : (req.status === 'rejected' ? 'text-red-500' : 'text-slate-600')}`}>
                            {req.status === 'pending' ? 'Waiting' : req.status}
                          </div>
                          {req.comment && (
                            <div className="border-l-2 border-indigo-500/30 bg-white/[0.02] p-4 rounded-r-2xl border-y border-r border-white/5">
                              <p className="text-[12px] text-slate-400 italic leading-relaxed">"{req.comment}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="pt-10 border-t border-white/5 space-y-8 pb-10">
                    {selectedExpense?.status === 'approved' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] shadow-inner">
                          <CreditCard size={24} className="text-emerald-400 shrink-0" />
                          <p className="text-[11px] text-emerald-300 font-black uppercase tracking-widest leading-relaxed italic">Expense is approved and ready for reimbursement.</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(`/admin/expenses/${selectedExpense._id}/reimburse`);
                              toast.success('Expense marked as reimbursed');
                              setShowDetail(false);
                              fetchExpenses();
                            } catch (err) {
                              toast.error('Failed to reimburse');
                            }
                          }}
                          className="w-full h-14 bg-emerald-600 shadow-xl shadow-emerald-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-emerald-500 transition-all"
                        >
                          Mark as Reimbursed
                        </button>
                      </div>
                    )}

                    {selectedExpense?.status === 'pending' && (
                      <>
                        <div className="flex items-center gap-4 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] shadow-inner">
                          <ShieldAlert size={24} className="text-indigo-400 shrink-0" />
                          <p className="text-[11px] text-indigo-300 font-black uppercase tracking-widest leading-relaxed italic">Admin Override: This will bypass standard approval steps.</p>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-1 italic italic">Reason for Override</label>
                          <textarea
                            placeholder="Enter reason..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white font-black uppercase outline-none h-32 focus:border-indigo-500 transition-all placeholder:text-slate-800"
                            value={overrideComment} onChange={(e) => setOverrideComment(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6 pb-2">
                          <button onClick={() => handleOverride('approve')} className="h-14 bg-emerald-600 shadow-xl shadow-emerald-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-emerald-500 transition-all">Force Approve</button>
                          <button onClick={() => handleOverride('reject')} className="h-14 bg-red-600 shadow-xl shadow-red-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-red-500 transition-all">Force Reject</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div >
            </div >
          )}
        </AnimatePresence >
      </div >
    </AdminLayout >
  );
};

const TableLoader = ({ rows }) => (
  <tbody className="divide-y divide-white/5">
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td colSpan="7" className="px-8 py-6">
          <div className="h-12 bg-white/5 rounded-2xl w-full" />
        </td>
      </tr>
    ))}
  </tbody>
);

export default AdminExpenses;

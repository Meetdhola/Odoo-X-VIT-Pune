import React, { useEffect, useState } from 'react';
import { useExpenses } from './useExpenses.js';
import { Plus, Upload, Filter, Search, MoreHorizontal, Clock, CheckCircle2, AlertCircle, FileText, Zap } from 'lucide-react';
import ExpenseFormModal from './ExpenseFormModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseDashboard = () => {
  const { expenses, loading, fetchExpenses, createExpense, submitExpense } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Summary logic
  const stats = {
    toSubmit: expenses.filter(e => e.status === 'draft').reduce((acc, curr) => acc + (curr.amount || 0), 0),
    waiting: expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0),
    approved: expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + (curr.amount || 0), 0),
  };

  const handleNew = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/5 text-white/50 border border-white/5 uppercase font-black">Draft</span>;
      case 'pending': return <span className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-black">Pending</span>;
      case 'approved': return <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-black">Approved</span>;
      case 'rejected': return <span className="px-2 py-0.5 rounded-lg text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 uppercase font-black">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Expense Claims</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 italic">* Registry of personal reimbursement data</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNew} 
            className="h-14 px-8 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-[11px] tracking-widest flex items-center gap-2"
          >
            <Upload size={16} />
            Scan Receipt
          </button>
          <button 
            onClick={handleNew} 
            className="h-14 px-10 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all uppercase text-[11px] tracking-widest flex items-center gap-2"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>
      </div>

      {/* Stats Section - Fixed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
         <StatCard 
            label="Draft / To Submit" 
            value={stats.toSubmit} 
            icon={<Clock className="text-slate-400" />} 
            accent="bg-slate-400/20"
            footer="Ready for validation"
         />
         <StatCard 
            label="Awaiting Approval" 
            value={stats.waiting} 
            icon={<Zap className="text-amber-500" />} 
            accent="bg-amber-500/20"
            footer="Currently in pipeline"
         />
         <StatCard 
            label="Total Approved" 
            value={stats.approved} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            accent="bg-emerald-500/20"
            footer="Successfully settled"
         />
      </div>

      {/* Main Registry Table */}
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or category..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500 transition-all placeholder:uppercase font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid By</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.length === 0 ? (
                <tr>
                   <td colSpan="7" className="px-8 py-24 text-center">
                      <FileText size={48} className="mx-auto mb-6 text-slate-800" />
                      <p className="text-xs text-slate-600 font-black uppercase tracking-[0.3em]">No Historical Data</p>
                      <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-2 italic">Initiate a request to populate the registry</p>
                   </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr 
                    key={expense._id} 
                    onClick={() => handleRowClick(expense)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-black text-white uppercase text-[13px] tracking-tight group-hover:text-indigo-400 transition-colors">
                        {expense.description || 'N/A Registry Entry'}
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5 italic">REF: #{expense._id.slice(-6)}</div>
                    </td>
                    <td className="px-8 py-6 text-[12px] text-slate-400 font-bold uppercase">
                      {new Date(expense.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 font-black uppercase">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[12px] text-slate-500 font-bold uppercase italic">
                      {expense.paidBy || 'Personal'}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="font-black text-white uppercase text-sm tracking-tight">{expense.amount.toFixed(2)} {expense.currency}</div>
                       {expense.currency !== 'USD' && (
                         <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">~ {expense.convertedAmount.toFixed(2)} USD</div>
                       )}
                    </td>
                    <td className="px-8 py-6">
                       {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-8 py-6 text-center">
                       <button className="p-2 rounded-xl bg-transparent hover:bg-white/5 text-slate-600 hover:text-white transition-all">
                         <MoreHorizontal size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ExpenseFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            expense={selectedExpense}
            onSave={createExpense}
            onSubmit={submitExpense}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon, accent, footer }) => (
  <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] relative group overflow-hidden">
    <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${accent}`}>
       {React.cloneElement(icon, { size: 80 })}
    </div>
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2 relative z-10">
      <span className="text-5xl font-black text-white italic tracking-tighter">{value.toLocaleString()}</span>
      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic opacity-50">Base Currency</span>
    </div>
    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-3 italic">* {footer}</p>
  </div>
);

export default ExpenseDashboard;

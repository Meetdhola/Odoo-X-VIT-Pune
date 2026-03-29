import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Search, Filter, MoreHorizontal, Clock, User, DollarSign, MessageSquare, ShieldCheck, AlertCircle, BarChart3, Users } from 'lucide-react';
import api from '../features/shared/api.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/expenses/approvals/pending');
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch approvals', error);
      toast.error('Could not load pending approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id, action) => {
    setIsProcessing(true);
    try {
      const response = await api.post(`/expenses/approvals/${id}/action`, {
        action,
        comment
      });
      if (response.data.success) {
        toast.success(`Expense ${action}ed successfully`);
        fetchRequests();
        setSelectedId(null);
        setComment('');
      }
    } catch (error) {
      toast.error(`Failed to ${action} expense`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalValue = requests.reduce((acc, r) => acc + (r.expense?.convertedAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Manager Specific Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
            label="Pending Team Items" 
            value={requests.length} 
            icon={<Users className="text-emerald-500" />} 
            color="border-emerald-500/30"
            subtext="Awaiting your review"
         />
         <StatsCard 
            label="Outstanding Value" 
            value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={<BarChart3 className="text-teal-500" />} 
            color="border-teal-500/30"
            subtext="Total across all pending"
         />
         <StatsCard 
            label="Team Compliance" 
            value="98.2%" 
            icon={<ShieldCheck className="text-emerald-500" />} 
            color="border-emerald-500/30"
            subtext="Accuracy of OCR/Policy"
         />
      </div>

      {/* Main Approval Table */}
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl shadow-emerald-500/5">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-500/[0.02]">
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                 <Clock size={20} />
              </div>
              <div>
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">Pending Approval Queue</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Team Submissions</p>
              </div>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search by employee..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl h-11 pl-11 pr-4 text-white text-xs outline-none focus:border-emerald-500 transition-all font-medium"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Amount (USD)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <TableLoader rows={3} />
              ) : requests.length === 0 ? (
                 <EmptyState />
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-emerald-500/[0.02] transition-colors group border-b border-white/5 last:border-0">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs uppercase shadow-inner">
                            {req.expense?.employee?.name?.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{req.expense?.employee?.name}</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{req.expense?.employee?.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] text-slate-400 font-black uppercase">
                          {req.expense?.category}
                       </span>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                       <p className="text-sm text-slate-300 font-medium truncate uppercase">{req.expense?.description}</p>
                       <p className="text-[10px] text-slate-600 font-bold uppercase truncate">{req.expense?.remarks}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className="text-sm font-black text-white uppercase tracking-tight">${req.expense?.convertedAmount?.toFixed(2)}</p>
                       <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{req.expense?.amount} {req.expense?.currency}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedId(req._id); handleAction(req._id, 'approve'); }}
                            className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20"
                            title="Quick Approve"
                          >
                             <Check size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedId(req._id); }}
                            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                            title="Reject with Comment"
                          >
                             <X size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal with Comment */}
      <AnimatePresence>
        {selectedId && !isProcessing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
               <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                  <AlertCircle size={32} />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Refusal Insight</h3>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 italic">* Why is this request being declined?</p>
               
               <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g., Missing receipt for travel, please re-upload..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-40 p-4 text-white outline-none focus:border-red-500 transition-all font-medium text-sm mb-8 uppercase resize-none shadow-inner"
               />

               <div className="flex gap-4">
                  <button onClick={() => setSelectedId(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Cancel</button>
                  <button 
                    onClick={() => handleAction(selectedId, 'reject')}
                    disabled={!comment.trim()}
                    className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 hover:bg-red-500 transition-all disabled:opacity-50"
                  >Confirm Reject</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatsCard = ({ label, value, icon, color, subtext }) => (
  <div className={`glass-card p-6 rounded-[2rem] border-l-4 ${color} bg-white/[0.01] relative overflow-hidden group`}>
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
       {React.cloneElement(icon, { size: 60 })}
    </div>
    <div className="flex justify-between items-center mb-6">
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-serif italic">{label}</span>
       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5">
          {icon}
       </div>
    </div>
    <div className="text-4xl font-black text-white tracking-tight italic mb-1">{value}</div>
    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{subtext}</p>
  </div>
);

const TableLoader = ({ rows }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td colSpan="5" className="px-8 py-10 bg-white/[0.01]" />
      </tr>
    ))}
  </>
);

const EmptyState = () => (
  <tr>
     <td colSpan="5" className="py-24 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-700 mx-auto mb-6 border border-white/5">
           <ShieldCheck size={40} />
        </div>
        <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">All Clear: No Pending Actions</p>
        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-2">Team is fully compliant with current policies.</p>
     </td>
  </tr>
);

export default ManagerDashboard;

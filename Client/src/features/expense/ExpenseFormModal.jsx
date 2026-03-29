import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, ChevronRight, Info, Plus, Calendar, DollarSign, Tag, FileText, CreditCard, Loader2, Sparkles, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ocrService } from './ocr.service.js';

const ExpenseFormModal = ({ isOpen, onClose, expense, onSave, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    merchant: '',
    amount: '',
    currency: 'USD',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'Self',
    remarks: '',
    receiptUrl: ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    let currentExpenseId = expense?._id;
    if (!currentExpenseId) {
      const saved = await onSave(formData);
      currentExpenseId = saved?._id;
    }
    if (currentExpenseId) {
      await onSubmit(currentExpenseId);
    }
    setLoading(false);
    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setFormData(prev => ({ ...prev, receiptUrl: base64 }));
        
        // Trigger OCR
        setIsScanning(true);
        setScanProgress(0);
        try {
          const results = await ocrService.scanReceipt(file, (progress) => {
            setScanProgress(progress);
          });
          
          setFormData(prev => ({
            ...prev,
            amount: results.amount || prev.amount,
            merchant: results.vendor || prev.merchant,
            description: results.description || prev.description,
            date: results.date || prev.date
          }));
        } catch (err) {
          console.error("OCR Failed", err);
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = expense && expense.status !== 'draft';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0F172A] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Pipeline */}
        <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 shadow-inner">
                <DollarSign size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {expense ? (isReadOnly ? 'Expense Details' : 'Edit Expense') : 'New Expense'}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Transaction Registry</p>
             </div>
          </div>

          {/* Status Pipeline Visual */}
          <div className="flex items-center gap-3 bg-white/5 p-2 px-4 rounded-2xl border border-white/5">
            <PipelineItem label="Draft" active={!expense || expense.status === 'draft'} completed={expense && expense.status !== 'draft'} color="bg-indigo-500" />
            <PipelineLine active={expense && expense.status !== 'draft'} />
            <PipelineItem label="Approval" active={expense?.status === 'pending'} completed={['approved', 'rejected'].includes(expense?.status)} color="bg-amber-500" />
            <PipelineLine active={['approved', 'rejected'].includes(expense?.status)} />
            <PipelineItem 
               label={expense?.status === 'rejected' ? 'Rejected' : 'Final'} 
               active={['approved', 'rejected'].includes(expense?.status)} 
               completed={false} 
               color={expense?.status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'} 
            />
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all absolute top-4 right-4 md:static">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Merchant / Store" icon={<Sparkles size={12} />} disabled={isReadOnly}>
                  <input
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="e.g. Starbucks, Uber"
                    className="w-full bg-transparent text-white outline-none uppercase placeholder:normal-case font-medium"
                  />
                </InputGroup>
                <InputGroup label="What is this for?" icon={<FileText size={12} />} disabled={isReadOnly}>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="e.g. Lunch with client"
                    className="w-full bg-transparent text-white outline-none uppercase placeholder:normal-case font-medium"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Date" icon={<Calendar size={12} />} disabled={isReadOnly}>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full bg-transparent text-white outline-none font-medium"
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Category" icon={<Tag size={12} />} disabled={isReadOnly}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full bg-transparent text-white outline-none uppercase font-medium appearance-none"
                  >
                    <option value="Travel">✈️ Travel</option>
                    <option value="Food">🍔 Food & Dining</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Supplies">📎 Office Supplies</option>
                    <option value="Software">💻 Software/Subs</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </InputGroup>
                <InputGroup label="Who paid?" icon={<CreditCard size={12} />} disabled={isReadOnly}>
                  <select
                    name="paidBy"
                    value={formData.paidBy}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full bg-transparent text-white outline-none uppercase font-medium appearance-none"
                  >
                    <option value="Self">👤 I paid (Reimburse me)</option>
                    <option value="Company Card">💳 Company Card</option>
                    <option value="Petty Cash">💵 Petty Cash</option>
                  </select>
                </InputGroup>
              </div>

              <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] space-y-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <DollarSign size={80} />
                 </div>
                 
                 <div className="flex items-center justify-between relative z-10">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                       Amount
                    </label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-10">
                       <select 
                         name="currency" 
                         value={formData.currency} 
                         onChange={handleChange}
                         disabled={isReadOnly}
                         className="bg-transparent text-xs font-black text-white outline-none uppercase"
                       >
                         {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 relative z-10">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-5xl font-black text-white outline-none"
                    />
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-2">
                    * Final conversion to USD will be processed at submission
                 </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Notes (Optional)</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  placeholder="Additional info for the approver..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-32 p-4 text-white outline-none focus:border-indigo-500 transition-all resize-none font-medium text-sm"
                />
              </div>
            </div>

            {/* Right Column: Receipt & OCR */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Receipt</h4>
                <div className={`aspect-[4/5] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center relative group ${isScanning ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}>
                  
                  {isScanning && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md">
                       <div className="relative w-24 h-24 mb-6">
                          <Loader2 className="w-full h-full text-indigo-500 animate-spin opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl">
                             {scanProgress}%
                          </div>
                       </div>
                       <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
                          <Sparkles size={16} className="animate-pulse" />
                          Reading receipt details...
                       </div>
                       <motion.div 
                         initial={{ top: '0%' }}
                         animate={{ top: '100%' }}
                         transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                         className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-30"
                       />
                    </div>
                  )}

                  {formData.receiptUrl ? (
                    <>
                      <img src={formData.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                      {!isReadOnly && !isScanning && (
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all">
                              <Scan size={20} />
                           </button>
                           <button onClick={() => setFormData(prev => ({ ...prev, receiptUrl: '' }))} className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/40 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                              <X size={20} />
                           </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-6 mx-auto group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-500">
                        <Scan size={32} />
                      </div>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Upload Receipt</p>
                      <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest italic">Auto-fill with AI</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Log */}
              {expense && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Approval History</h4>
                  <div className="glass-card rounded-[2rem] p-6 border-white/5 bg-white/[0.02]">
                    <div className="space-y-4">
                       <StatusLogItem 
                          approver="Sarah Collins" 
                          role="Project Manager" 
                          status="Approved" 
                          time="12:44 4th Oct, 2025" 
                          current={expense.status === 'approved'} 
                       />
                       <div className="ml-4 w-0.5 h-6 bg-white/5" />
                       <StatusLogItem 
                          approver="Receipt Scan" 
                          role="Automatic Check" 
                          status="Details Read" 
                          time="Just now" 
                          current={false} 
                       />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-8 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-end gap-4">
          {!isReadOnly && (
            <>
              <button 
                onClick={handleSave} 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
              >
                Save for Later
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <Check size={18} />
                    Submit Request
                  </>
                )}
              </button>
            </>
          )}
          {isReadOnly && (
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-xs tracking-widest"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Subcomponents ---

const PipelineItem = ({ label, active, completed, color }) => (
  <div className="flex flex-col items-center gap-1.5 px-2">
    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${completed ? color : (active ? `${color} ring-4 ring-white/10` : 'bg-slate-700')}`} />
    <span className={`text-[8px] font-black uppercase tracking-widest ${active || completed ? 'text-white' : 'text-slate-600'}`}>{label}</span>
  </div>
);

const PipelineLine = ({ active }) => (
  <div className={`w-8 h-[2px] mb-4 rounded-full transition-all duration-500 ${active ? 'bg-indigo-500' : 'bg-slate-700'}`} />
);

const InputGroup = ({ label, icon, children, disabled }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
      {icon} {label}
    </label>
    <div className={`w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-4 flex items-center transition-all ${disabled ? 'opacity-50' : 'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50'}`}>
       {children}
    </div>
  </div>
);

const StatusLogItem = ({ approver, role, status, time, current }) => (
  <div className={`flex justify-between items-start ${current ? 'opacity-100' : 'opacity-40'}`}>
     <div>
        <p className="text-xs font-black text-white uppercase">{approver}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{role}</p>
     </div>
     <div className="text-right">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${status === 'Approved' ? 'text-emerald-500 border-emerald-500/30' : 'text-slate-400 border-white/10'}`}>{status}</span>
        <p className="text-[8px] text-slate-600 mt-1 uppercase font-bold">{time}</p>
     </div>
  </div>
);

export default ExpenseFormModal;

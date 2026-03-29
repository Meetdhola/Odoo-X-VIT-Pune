import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Plus, Shield, ArrowRight, Trash2, Settings2, Users, Target, Percent, ChevronRight, GitBranch, GitMerge, UserCheck, GripVertical, X, Layers, Workflow, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ConditionBadge = ({ type }) => {
  const styles = {
    sequential: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    percentage: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    specific: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    hybrid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${styles[type]}`}>{type}</span>;
};

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'sequential',
    steps: [{ sequence: 0, approver: '' }],
    percentageThreshold: 50,
    specificApprover: ''
  });

  const fetchData = async () => {
    try {
      const [rulesRes, usersRes] = await Promise.all([
        api.get('/admin/rules'),
        api.get('/admin/users')
      ]);
      setRules(rulesRes.data.rules);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to load system policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenDrawer = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        conditionType: rule.conditionType,
        steps: rule.steps.map(s => ({ ...s, approver: s.approver?._id || s.approver || '' })),
        percentageThreshold: rule.percentageThreshold || 50,
        specificApprover: rule.specificApprover?._id || rule.specificApprover || ''
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        conditionType: 'sequential',
        steps: [{ sequence: 0, approver: '' }],
        percentageThreshold: 50,
        specificApprover: ''
      });
    }
    setShowDrawer(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRule) {
        await api.patch(`/admin/rules/${editingRule._id}`, formData);
        toast.success('Core logic updated');
      } else {
        await api.post('/admin/rules', formData);
        toast.success('New policy instantiated');
      }
      setShowDrawer(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Validation error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
     if (!window.confirm('IRREVERSIBLE: Purge this policy from kernel?')) return;
     try {
       await api.delete(`/admin/rules/${id}`);
       toast.success('Strategy removed from registry');
       fetchData();
     } catch {
        toast.error('Action failed');
     }
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, { sequence: formData.steps.length, approver: '' }] });
  };

  const removeStep = (idx) => {
    const newSteps = formData.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sequence: i }));
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <AdminLayout title="Policy Matrix" subtitle="Multi-Level Approval Strategies">
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Active Protocols</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 italic">* {rules.length} strategies currently guarding outflows</p>
           </div>
           <button onClick={() => handleOpenDrawer()} className="bg-indigo-600 text-white h-14 px-8 rounded-2xl flex items-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
             <Plus size={18} /> New Architecture
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 border border-white/5 rounded-[2.5rem] animate-pulse"></div>)
          ) : rules.length === 0 ? (
            <div className="col-span-2 glass-card rounded-[2.5rem] border-white/5 p-20 text-center bg-white/[0.01]">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-800 mx-auto mb-6">
                 <Workflow size={40} />
              </div>
              <p className="text-xs text-slate-600 font-black uppercase tracking-[0.3em] mb-2 italic">Policy Registry Empty</p>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Construct an approval strategy to begin audit flow.</p>
            </div>
          ) : rules.map((rule) => (
             <div key={rule._id} className="glass-card rounded-[2.5rem] border-white/5 p-8 shadow-2xl bg-white/[0.01] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <GitBranch size={80} className="text-indigo-500" />
                </div>
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xl font-black text-white uppercase tracking-tight italic group-hover:text-indigo-400 transition-all">{rule.name}</h4>
                    <ConditionBadge type={rule.conditionType} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenDrawer(rule)} className="p-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Settings2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(rule._id)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-8 relative z-10">
                   {rule.steps.map((step, idx) => (
                     <React.Fragment key={idx}>
                       <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl pl-1 pr-4 py-1.5 hover:bg-white/[0.05] transition-all">
                          <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-inner">
                            {step.approver?.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-none mb-1">{step.approver?.name?.split(' ')[0] || 'Unknown'}</span>
                             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Step {idx + 1}</span>
                          </div>
                       </div>
                       {idx < rule.steps.length - 1 && <ChevronRight size={14} className="text-slate-800" />}
                     </React.Fragment>
                   ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic flex items-center gap-2">
                     <Layers size={12} className="text-indigo-500" />
                     {rule.conditionType === 'sequential' && "Strict chronological sequence"}
                     {rule.conditionType === 'percentage' && `Majority consensus: ${rule.percentageThreshold}% Threshold`}
                     {rule.conditionType === 'specific' && `Exclusive delegate: ${rule.specificApprover?.name}`}
                     {rule.conditionType === 'hybrid' && `Dual Gateway: ${rule.percentageThreshold}% OR Delegate Sign-off`}
                   </p>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Active State</span>
                   </div>
                </div>
             </div>
          ))}
        </div>

        {/* Global Policy Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <div className="fixed inset-0 z-[200] flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setShowDrawer(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full max-w-xl bg-slate-900 border-l border-white/10 shadow-3xl flex flex-col">
                 <div className="h-24 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{editingRule ? 'Modify Policy' : 'Build Architecture'}</h3>
                       <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1 italic">/ Define approval flow logic</p>
                    </div>
                    <button onClick={() => setShowDrawer(false)} className="p-3 -mr-2 text-slate-600 hover:bg-white/5 rounded-2xl transition-all">
                      <X size={24} />
                    </button>
                 </div>

                 <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic italic flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" />
                        Policy Identifier
                      </label>
                      <input 
                        type="text" required 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-800"
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="E.G. EMEA FINANCE PROTOCOL"
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic flex items-center gap-2">
                        <Settings2 size={14} className="text-indigo-500" />
                        Execution Logic
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                         {[
                           { id: 'sequential', label: 'Step-by-Step', desc: 'Strict serial approval', icon: ArrowRight },
                           { id: 'percentage', label: 'Consensus', desc: 'Percentage threshold', icon: Percent },
                           { id: 'specific', label: 'Delegate', desc: 'Single expert sign-off', icon: UserCheck },
                           { id: 'hybrid', label: 'Dual Flow', desc: 'Delegate or consensus', icon: GitMerge }
                         ].map(type => (
                            <div 
                              key={type.id} 
                              onClick={() => setFormData({...formData, conditionType: type.id})}
                              className={`p-5 glass-card rounded-2xl border cursor-pointer transition-all ${formData.conditionType === type.id ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'}`}
                            >
                               <div className="flex items-center gap-3 mb-2">
                                  <type.icon size={18} className={formData.conditionType === type.id ? 'text-indigo-400' : 'text-slate-600'} />
                                  <span className="text-[12px] font-black text-white uppercase tracking-tight">{type.label}</span>
                               </div>
                               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-[1.4] italic">{type.desc}</p>
                            </div>
                         ))}
                      </div>
                    </div>

                    {(formData.conditionType !== 'specific') && (
                      <div className="space-y-6">
                         <div className="flex items-center justify-between px-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                             <Users size={14} className="text-indigo-500" />
                             Approval Pipeline
                           </label>
                           <button type="button" onClick={addStep} className="bg-white/5 border border-white/10 text-slate-300 font-black px-4 py-2 rounded-xl uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                             <Plus size={14} /> Add Layer
                           </button>
                         </div>
                         <div className="space-y-3">
                           {formData.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5 group transition-all hover:bg-white/[0.04]">
                                 <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-inner">
                                   {idx+1}
                                 </div>
                                 <select 
                                   className="flex-1 h-12 bg-transparent text-white font-black uppercase text-xs outline-none cursor-pointer"
                                   value={step.approver}
                                   onChange={(e) => {
                                     const newSteps = [...formData.steps];
                                     newSteps[idx].approver = e.target.value;
                                     setFormData({...formData, steps: newSteps});
                                   }}
                                   required
                                 >
                                   <option value="" className="bg-slate-900">Select individual...</option>
                                   {users.filter(u => u.role !== 'Employee').map(u => <option key={u._id} value={u._id} className="bg-slate-900">{u.name} ({u.role})</option>)}
                                 </select>
                                 <button type="button" onClick={() => removeStep(idx)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                                   <X size={18} />
                                 </button>
                              </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {(formData.conditionType === 'percentage' || formData.conditionType === 'hybrid') && (
                      <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Majority Quorum (%)</label>
                         <div className="flex items-center gap-4">
                           <input 
                             type="number" min="1" max="100" 
                             className="w-24 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black text-white italic outline-none focus:border-indigo-500 transition-all shadow-inner"
                             value={formData.percentageThreshold}
                             onChange={(e) => setFormData({...formData, percentageThreshold: e.target.value})}
                           />
                           <div>
                              <p className="text-xl font-black text-indigo-400 italic font-serif">%</p>
                              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">* Required consensus threshold</p>
                           </div>
                         </div>
                      </div>
                    )}

                    {(formData.conditionType === 'specific' || formData.conditionType === 'hybrid') && (
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic flex items-center gap-2">
                           <UserCheck size={14} className="text-indigo-500" />
                           Expert Delegate
                         </label>
                         <select 
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none focus:border-indigo-500 transition-all cursor-pointer"
                           value={formData.specificApprover}
                           onChange={(e) => setFormData({...formData, specificApprover: e.target.value})}
                           required
                         >
                           <option value="" className="bg-slate-900 italic">Select individual delegate...</option>
                           {users.filter(u => u.role !== 'Employee').map(u => <option key={u._id} value={u._id} className="bg-slate-900">{u.name} ({u.role})</option>)}
                         </select>
                      </div>
                    )}

                    <div className="pt-10 flex flex-col gap-4">
                       <button type="submit" disabled={submitting} className="h-14 bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-indigo-500 transition-all disabled:opacity-50">
                         {submitting ? 'EXECUTING ARCHITECTURE SYNC...' : editingRule ? 'UPDATE POLICY' : 'COMMIT ARCHITECTURE'}
                       </button>
                       <button type="button" onClick={() => setShowDrawer(false)} className="h-14 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all">
                          Void Strategy
                       </button>
                    </div>
                 </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminRules;

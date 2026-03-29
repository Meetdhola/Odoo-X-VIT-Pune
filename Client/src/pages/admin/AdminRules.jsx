import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Plus, Shield, ArrowRight, Trash2, Settings2, Users, Target, Percent, ChevronRight, GitBranch, GitMerge, UserCheck, GripVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ConditionBadge = ({ type }) => {
  const styles = {
    sequential: 'bg-[#DBEAFE] text-[#1D4ED8]',
    percentage: 'bg-[#FEF3C7] text-[#92400E]',
    specific: 'bg-[#EDE9FE] text-[#5B21B6]',
    hybrid: 'bg-[#D1FAE5] text-[#065F46]'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles[type]}`}>{type}</span>;
};

const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
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
      toast.error('Failed to load rules');
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
    try {
      if (editingRule) {
        await api.patch(`/admin/rules/${editingRule._id}`, formData);
        toast.success('Rule updated');
      } else {
        await api.post('/admin/rules', formData);
        toast.success('Rule created');
      }
      setShowDrawer(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save rule');
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
    <AdminLayout title="Approval Rules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <h2 className="text-[18px] font-bold text-[#0F172A]">Active Policies</h2>
             <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-[12px] font-bold">{rules.length} total</span>
           </div>
           <button onClick={() => handleOpenDrawer()} className="bg-[#4F46E5] text-white h-10 px-4 rounded-lg flex items-center gap-2 font-medium hover:bg-[#4338CA] transition-colors shadow-sm">
             <Plus size={18} /> Create Rule
           </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-40 bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>)
          ) : rules.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-12 text-center">
              <Shield size={48} className="mx-auto text-[#E2E8F0] mb-4" />
              <p className="text-[#64748B] text-[14px]">No approval rules yet. Create your first rule.</p>
            </div>
          ) : rules.map((rule) => (
             <div key={rule._id} className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm hover:border-[#6366F1] transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[16px] font-bold text-[#0F172A]">{rule.name}</h4>
                    <ConditionBadge type={rule.conditionType} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenDrawer(rule)} className="p-2 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-all">
                      <Settings2 size={16} />
                    </button>
                    <button className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                   {rule.steps.map((step, idx) => (
                     <React.Fragment key={idx}>
                       <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-1 pr-3 py-1">
                          <div className="w-6 h-6 bg-[#6366F1] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {step.approver?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-[12px] font-semibold text-[#0F172A]">{step.approver?.name || 'Unknown'}</span>
                          <span className="text-[10px] font-bold text-[#64748B] bg-[#E2E8F0] px-1.5 rounded">{idx + 1}</span>
                       </div>
                       {idx < rule.steps.length - 1 && <span className="text-[14px] text-[#94A3B8]">→</span>}
                     </React.Fragment>
                   ))}
                </div>

                <p className="text-[13px] text-[#64748B] italic">
                   {rule.conditionType === 'sequential' && "All approvers must approve in sequence"}
                   {rule.conditionType === 'percentage' && `${rule.percentageThreshold}% of approvers must approve`}
                   {rule.conditionType === 'specific' && `Auto-approved if ${rule.specificApprover?.name} approves`}
                   {rule.conditionType === 'hybrid' && `${rule.percentageThreshold}% OR ${rule.specificApprover?.name}'s approval required`}
                </p>
             </div>
          ))}
        </div>

        {/* Right Drawer */}
        {showDrawer && (
          <div className="fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDrawer(false)} />
            <div className="absolute right-0 top-0 h-full w-[480px] bg-white shadow-2xl flex flex-col animate-slideInRight">
               <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                  <h3 className="text-[18px] font-bold text-[#0F172A]">{editingRule ? 'Edit Rule' : 'New Rule'}</h3>
                  <button onClick={() => setShowDrawer(false)} className="p-2 -mr-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                    <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Rule Name</label>
                    <input 
                      type="text" required className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none"
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Finance Approval Policy"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Condition Type</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: 'sequential', label: 'Sequential', desc: 'Step-by-step approval', icon: ArrowRight },
                         { id: 'percentage', label: 'Percentage', desc: 'Group consensus', icon: Percent },
                         { id: 'specific', label: 'Key Approver', desc: 'One person sign-off', icon: UserCheck },
                         { id: 'hybrid', label: 'Hybrid Rule', desc: 'Consensus or Key person', icon: GitMerge }
                       ].map(type => (
                          <div 
                            key={type.id} 
                            onClick={() => setFormData({...formData, conditionType: type.id})}
                            className={`p-3 border-[1.5px] rounded-lg cursor-pointer transition-all ${formData.conditionType === type.id ? 'border-[#6366F1] bg-[#EEF2FF]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
                          >
                             <div className="flex items-center gap-2 mb-1">
                                <type.icon size={16} className={formData.conditionType === type.id ? 'text-[#6366F1]' : 'text-[#64748B]'} />
                                <span className="text-[13px] font-bold text-[#0F172A]">{type.label}</span>
                             </div>
                             <p className="text-[11px] text-[#64748B] leading-tight">{type.desc}</p>
                          </div>
                       ))}
                    </div>
                  </div>

                  {(formData.conditionType !== 'specific') && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Approval Steps</label>
                         <button type="button" onClick={addStep} className="text-[#6366F1] text-[12px] font-bold flex items-center gap-1">
                           <Plus size={14} /> Add Step
                         </button>
                       </div>
                       <div className="space-y-2">
                         {formData.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                               <GripVertical size={16} className="text-[#94A3B8]" />
                               <span className="w-5 h-5 bg-[#6366F1] text-white rounded text-[10px] font-bold flex items-center justify-center shrink-0">{idx+1}</span>
                               <select 
                                 className="flex-1 h-9 bg-white border border-[#D1D5DB] rounded-[6px] text-[13px] px-2 outline-none"
                                 value={step.approver}
                                 onChange={(e) => {
                                   const newSteps = [...formData.steps];
                                   newSteps[idx].approver = e.target.value;
                                   setFormData({...formData, steps: newSteps});
                                 }}
                                 required
                               >
                                 <option value="">Select individual...</option>
                                 {users.filter(u => u.role !== 'Employee').map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                               </select>
                               <button type="button" onClick={() => removeStep(idx)} className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                                 <X size={16} />
                               </button>
                            </div>
                         ))}
                       </div>
                    </div>
                  )}

                  {(formData.conditionType === 'percentage' || formData.conditionType === 'hybrid') && (
                    <div className="space-y-2">
                       <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Approval Threshold (%)</label>
                       <div className="flex items-center gap-3">
                         <input 
                           type="number" min="1" max="100" 
                           className="w-20 h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none"
                           value={formData.percentageThreshold}
                           onChange={(e) => setFormData({...formData, percentageThreshold: e.target.value})}
                         />
                         <span className="text-[14px] font-medium text-[#64748B]">%</span>
                       </div>
                    </div>
                  )}

                  {(formData.conditionType === 'specific' || formData.conditionType === 'hybrid') && (
                    <div className="space-y-2">
                       <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Specific Approver</label>
                       <select 
                         className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none"
                         value={formData.specificApprover}
                         onChange={(e) => setFormData({...formData, specificApprover: e.target.value})}
                         required
                       >
                         <option value="">Select individual...</option>
                         {users.filter(u => u.role !== 'Employee').map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                       </select>
                    </div>
                  )}

                  <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
                     <button type="submit" className="bg-[#4F46E5] text-white h-11 rounded-lg font-bold hover:bg-[#4338CA] transition-all">
                       Save Rule
                     </button>
                     <button type="button" onClick={() => setShowDrawer(false)} className="bg-white border border-[#D1D5DB] text-[#374151] h-11 rounded-lg font-bold hover:bg-gray-50 transition-all">
                        Cancel
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRules;

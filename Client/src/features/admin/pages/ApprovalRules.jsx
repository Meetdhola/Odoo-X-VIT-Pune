import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Plus, Shield, ArrowRight, Trash2, Settings2, Users, Target, Percent, ChevronRight } from 'lucide-react';
import RightDrawer from '../components/RightDrawer.jsx';
import toast from 'react-hot-toast';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    conditionType: 'sequential',
    steps: [],
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
      toast.error('Failed to load rules and users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDrawer = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        conditionType: rule.conditionType,
        steps: rule.steps.map(s => ({ ...s, approver: s.approver?._id || s.approver })),
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
    setIsDrawerOpen(true);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { sequence: formData.steps.length, approver: '' }]
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps.map((s, i) => ({ ...s, sequence: i }))
    });
  };

  const updateStep = (index, approverId) => {
    const newSteps = [...formData.steps];
    newSteps[index].approver = approverId;
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.patch(`/admin/rules/${editingRule._id}`, formData);
        toast.success('Rule updated');
      } else {
        await api.post('/admin/rules', formData);
        toast.success('Rule created');
      }
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this approval policy?')) return;
    try {
      await api.delete(`/admin/rules/${id}`);
      toast.success('Rule removed');
      fetchData();
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border border-[#E2E8F0] rounded-[10px] shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Approval Policies</h2>
          <p className="text-[13px] text-[#64748B]">Define multi-step workflows for expense verification.</p>
        </div>
        <button onClick={() => handleOpenDrawer()} className="btn-primary">
          <Shield size={18} />
          Create New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>)
        ) : rules.map((rule) => (
          <div key={rule._id} className="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm hover:border-[#6366F1] transition-all group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center text-[#4F46E5]">
                   <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#0F172A]">{rule.name}</h4>
                  <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{rule.conditionType} logic</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenDrawer(rule)} className="p-2 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                  <Settings2 size={16} />
                </button>
                <button onClick={() => handleDelete(rule._id)} className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                   <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {rule.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 min-w-[120px]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase mb-1">Step {idx + 1}</span>
                    <span className="text-[12px] font-semibold text-[#0F172A] truncate max-w-[100px]">{step.approver?.name || 'Any Manager'}</span>
                  </div>
                  {idx < rule.steps.length - 1 && <ChevronRight size={16} className="text-[#94A3B8]" />}
                </React.Fragment>
              ))}
            </div>
            
            {rule.conditionType === 'percentage' && (
              <div className="mt-4 flex items-center gap-2 text-[12px] font-bold text-[#1E40AF] bg-[#EFF6FF] w-fit px-3 py-1 rounded-full">
                <Percent size={14} />
                Requires {rule.percentageThreshold}% approval
              </div>
            )}
          </div>
        ))}
      </div>

      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingRule ? 'Configure Policy' : 'New Approval Policy'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Policy Name</label>
            <input 
              type="text" 
              className="input-base" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Executives Policy"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Logic Type</label>
            <select 
              className="input-base"
              value={formData.conditionType}
              onChange={(e) => setFormData({...formData, conditionType: e.target.value})}
            >
              <option value="sequential">Sequential Steps (One by One)</option>
              <option value="percentage">Percentage (Group Consensus)</option>
              <option value="specific">Single Sign-off (Must be specific user)</option>
              <option value="hybrid">Hybrid (Percentage + Sign-off)</option>
            </select>
          </div>

          {formData.conditionType === 'percentage' && (
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Threshold (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" max="100" 
                  className="flex-1 accent-[#6366F1]"
                  value={formData.percentageThreshold}
                  onChange={(e) => setFormData({...formData, percentageThreshold: e.target.value})}
                />
                <span className="text-[14px] font-bold text-[#0F172A] w-10">{formData.percentageThreshold}%</span>
              </div>
            </div>
          )}

          {(formData.conditionType === 'specific' || formData.conditionType === 'hybrid') && (
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Specific Approver</label>
              <select 
                className="input-base"
                value={formData.specificApprover}
                onChange={(e) => setFormData({...formData, specificApprover: e.target.value})}
                required
              >
                <option value="">Select individual...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-semibold text-[#64748B] uppercase">Policy Steps</label>
              <button type="button" onClick={addStep} className="text-[12px] font-bold text-[#6366F1] flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Step
              </button>
            </div>
            {formData.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="w-8 h-[38px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-center text-[12px] font-bold text-[#64748B]">
                  {idx + 1}
                </div>
                <select 
                  className="input-base flex-1"
                  value={step.approver}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  required
                >
                  <option value="">Select Approver...</option>
                  {users.filter(u => u.role !== 'Employee').map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeStep(idx)} className="p-2 text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
            <button type="submit" className="btn-primary w-full h-[44px]">
              {editingRule ? 'Update Policy' : 'Create Policy'}
            </button>
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="btn-secondary w-full h-[44px]">
              Cancel
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default ApprovalRules;

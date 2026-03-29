import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Building2, Save, MapPin, Globe, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const CompanySettings = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await api.get('/admin/company');
        setCompany(data.company);
        setName(data.company.name);
      } catch (err) {
        toast.error('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch('/admin/company', { name });
      toast.success('Company settings updated');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse bg-white border border-[#E2E8F0] rounded-[10px] h-64"></div>;

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="text-[18px] font-bold text-[#0F172A] flex items-center gap-2">
            <Building2 size={20} className="text-[#6366F1]" />
            Organization Profile
          </h2>
          <p className="text-[13px] text-[#64748B]">Update your company's public information and localization settings.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-2 tracking-wider">Company Registered Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input 
                  type="text" 
                  className="input-base pl-10 h-[44px] text-[15px]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter company name..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#F1F5F9]">
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-2 tracking-wider">Default Currency</label>
                <div className="flex items-center h-[44px] px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#64748B] text-[14px] font-medium gap-3">
                  <CreditCard size={16} />
                  {company?.currency || 'USD'}
                  <Lock size={14} className="ml-auto text-[#CBD5E1]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-2 tracking-wider">Country / Region</label>
                <div className="flex items-center h-[44px] px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#64748B] text-[14px] font-medium gap-3">
                  <Globe size={16} />
                  {company?.country || 'Worldwide'}
                  <Lock size={14} className="ml-auto text-[#CBD5E1]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg flex gap-3">
              <Lock size={18} className="text-[#1E40AF] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#1E40AF]/80 font-medium leading-relaxed">
                Localization settings (Country & Currency) are set during the initial registration and cannot be modified to ensure financial audit integrity.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E2E8F0]">
            <button 
              type="submit" 
              className="btn-primary w-full h-[48px] flex items-center justify-center gap-2 text-[15px] font-bold shadow-lg shadow-[#6366F1]/20 hover:shadow-xl hover:shadow-[#6366F1]/30 transition-all"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving changes...' : 'Finalize and Save Settings'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CompanySettings;

import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-[#EFF6FF] text-[#1E40AF]',
    indigo: 'bg-[#EEF2FF] text-[#4F46E5]',
    amber: 'bg-[#FFFBEB] text-[#92400E]',
    emerald: 'bg-[#ECFDF5] text-[#065F46]',
    rose: 'bg-[#FFF1F2] text-[#991B1B]',
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-[20px] transition-all hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorStyles[color] || colorStyles.blue}`}>
           <Icon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">{label}</span>
          <span className="text-[28px] font-bold text-[#0F172A] leading-tight">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

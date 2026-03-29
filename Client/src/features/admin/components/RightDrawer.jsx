import React from 'react';
import { X } from 'lucide-react';

const RightDrawer = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <h3 className="text-[18px] font-semibold text-[#0F172A]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
};

export default RightDrawer;

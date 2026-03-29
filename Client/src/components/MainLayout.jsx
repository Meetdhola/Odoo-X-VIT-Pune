import React from 'react';
import Sidebar from './Sidebar.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children, activeTab, onTabChange, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed top-0 -left-10 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.07] animate-blob pointer-events-none" />
      <div className="fixed -bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.07] animate-blob pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Primary Content Area */}
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        {/* Dynamic Header / Context Bar */}
        <header className="h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center justify-between px-10 shrink-0">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tighter italic">/ {title}</h2>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Active Session</span>
             </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={title + subtitle} // Force re-animation on context change
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

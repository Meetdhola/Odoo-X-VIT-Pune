import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, UserCheck, Loader2 } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose, onCreate, managers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    managerId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await onCreate(formData);
    setLoading(false);
    if (success) {
      setFormData({ name: '', email: '', role: 'Employee', managerId: '' });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-3xl p-8 md:p-10"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">Create New User</h3>
              <p className="text-slate-400 mt-2">Add a new teammate to your organization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder=" "
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="peer glass-input pl-12"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <label className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs bg-slate-950 px-1 rounded">
                  Full Name
                </label>
              </div>

              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="peer glass-input pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                <label className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-neonPurple peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs bg-slate-950 px-1 rounded">
                  Email Address
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full glass-input pl-12 appearance-none cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                </div>

                <div className="relative group">
                  <select
                    disabled={formData.role === 'Manager'}
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className={`w-full glass-input pl-12 appearance-none cursor-pointer ${formData.role === 'Manager' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 btn-neon text-white flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create User & Send Credentials'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateUserModal;

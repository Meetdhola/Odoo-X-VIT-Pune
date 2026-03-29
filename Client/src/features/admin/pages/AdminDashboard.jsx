import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, RefreshCw, Mail, Shield, UserCheck, Key, Loader2, LogOut } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import CreateUserModal from '../components/CreateUserModal.jsx';

const AdminDashboard = () => {
  const { users, managers, loading, fetchUsers, fetchManagers, createUser, updateUser, resetPassword } = useAdmin();
  const { logout, user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, [fetchUsers, fetchManagers]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetPassword = async (userId) => {
    setResettingId(userId);
    await resetPassword(userId);
    setResettingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent"
          >
            User Management
          </motion.h1>
          <p className="text-slate-400 mt-2">Control panel for {currentUser?.name}'s organization</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-neonPurple rounded-2xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlus size={20} />
            Add New User
          </button>
          <button 
            onClick={logout}
            className="p-3 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-500 transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Stats/Controls Barra */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neonPurple transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-12"
          />
        </div>
        <button 
          onClick={fetchUsers}
          className="px-6 py-3 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          Refresh
        </button>
      </div>

      {/* User Table */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/5">
                  <th className="px-6 py-5 text-slate-400 font-semibold text-sm uppercase tracking-wider">User Name</th>
                  <th className="px-6 py-5 text-slate-400 font-semibold text-sm uppercase tracking-wider">Role</th>
                  <th className="px-6 py-5 text-slate-400 font-semibold text-sm uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-5 text-slate-400 font-semibold text-sm uppercase tracking-wider">Email</th>
                  <th className="px-6 py-5 text-slate-400 font-semibold text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-neonPurple" size={40} />
                        <p>Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <motion.tr 
                      layout
                      key={u._id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.role === 'Admin' ? 'bg-amber-500/20 text-amber-500' : u.role === 'Manager' ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-500/20 text-slate-400'}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            {u._id === currentUser?.id && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-0">YOU</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block group/role">
                          <select 
                            value={u.role}
                            onChange={(e) => updateUser(u._id, { role: e.target.value })}
                            className="bg-transparent border-none text-slate-300 text-sm focus:ring-0 cursor-pointer hover:text-white"
                            disabled={u._id === currentUser?.id}
                          >
                            <option value="Employee" className="bg-slate-900">Employee</option>
                            <option value="Manager" className="bg-slate-900">Manager</option>
                            <option value="Admin" className="bg-slate-900" disabled>Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {u.role === 'Manager' ? (
                          <span className="text-xs text-slate-500 italic">Is a Manager</span>
                        ) : u.role === 'Admin' ? (
                          <span className="text-xs text-slate-500 italic">Organization Lead</span>
                        ) : (
                          <select 
                            value={u.managerId?._id || ''}
                            onChange={(e) => updateUser(u._id, { managerId: e.target.value })}
                            className="bg-transparent border-none text-slate-300 text-sm focus:ring-0 cursor-pointer hover:text-white"
                          >
                            <option value="" className="bg-slate-900">Unassigned</option>
                            {managers.map(m => (
                              <option key={m._id} value={m._id} className="bg-slate-900">{m.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleResetPassword(u._id)}
                          disabled={resettingId === u._id}
                          className="p-2.5 bg-slate-800/50 rounded-xl hover:bg-neonPurple/20 hover:text-neonPurple transition-all group/btn disabled:opacity-50"
                          title="Generate New Password & Email User"
                        >
                          {resettingId === u._id ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} className="transition-transform group-hover/btn:scale-110" />}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createUser}
        managers={managers}
      />
    </div>
  );
};

export default AdminDashboard;

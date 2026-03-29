import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Search, UserPlus, MoreVertical, Edit2, Trash2, X, Plus, Check, Minus, Shield, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RoleBadge = ({ role }) => {
  const styles = {
    Admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Manager: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Employee: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };
  return <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[role] || styles.Employee}`}>{role}</span>;
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    managerId: '',
    isManagerApprover: false
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenDrawer = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        managerId: user.managerId?._id || user.managerId || '',
        isManagerApprover: user.isManagerApprover || false
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        managerId: '',
        isManagerApprover: false
      });
    }
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('New user created successfully');
      }
      setShowDrawer(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return toast.error('You cannot delete your own account');
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout title="User Directory" subtitle="Manage your team members and their access levels">

      <div className="space-y-8 animate-in fade-in duration-500">

        {/* Advanced Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1 italic">Search Team</label>
            <div className="relative group w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="NAME OR EMAIL..."
                className="w-full h-14 pl-12 pr-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[12px] font-black uppercase text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:bg-white/[0.04] outline-none transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1 italic">Filter by Role</label>
              <select
                className="h-14 px-6 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] font-black uppercase text-slate-400 outline-none hover:border-white/10 transition-all cursor-pointer shadow-inner"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">ALL ROLES</option>
                <option value="admin">ADMINS ONLY</option>
                <option value="manager">MANAGERS ONLY</option>
                <option value="employee">EMPLOYEES ONLY</option>

              </select >
            </div >

            <div className="flex flex-col gap-3">
              <div className="h-10 invisible" /> {/* Spacer */}
              <button onClick={() => handleOpenDrawer()} className="bg-indigo-600 text-white h-14 px-8 rounded-2xl flex items-center gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                <UserPlus size={18} /> Add User
              </button>
            </div>
          </div >
        </div >

        {/* Directory Table */}
        < div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl bg-white/[0.01]" >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">User</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Role</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Manager</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-center">Approver?</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <TableLoader rows={5} />
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-24 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] italic">No users found</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-indigo-500/[0.02] transition-colors border-b border-white/5 last:border-0 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-black uppercase shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-white uppercase tracking-tight leading-none mb-1.5">{user.name}</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none italic">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 italic"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-6">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-tight italic">{user.managerId?.name || <span className="text-slate-800 tracking-widest">NONE</span>}</span>
                  </td>
                  <td className="px-6 py-6">
                    {user.isManagerApprover ? (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 mx-auto shadow-lg shadow-emerald-500/10">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-800 mx-auto">
                        <Minus size={14} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-6 text-[11px] text-slate-600 font-bold uppercase tracking-widest italic">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenDrawer(user)} className="p-3 bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all shadow-md">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-md">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div >

        {/* Premium Dark Drawer Overlay */}
        < AnimatePresence >
          {showDrawer && (
            <div className="fixed inset-0 z-[200] flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setShowDrawer(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative h-full w-full max-w-md bg-slate-900 border-l border-white/10 shadow-3xl flex flex-col">
                <div className="h-24 px-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{editingUser ? 'Update User' : 'New User'}</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1 italic">/ Modify access and role</p>

                  </div >
                  <button onClick={() => setShowDrawer(false)} className="p-3 -mr-2 text-slate-600 hover:bg-white/5 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
                </div >

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-gradient-to-b from-slate-900 to-slate-950">
                  <FormInput
                    label="Full Name"
                    icon={<Shield size={16} />}
                    value={formData.name}
                    onChange={(v) => setFormData({ ...formData, name: v })}
                    placeholder="SAM ROGERS"
                  />

                  <FormInput
                    label="Email Address"
                    icon={<Mail size={16} />}
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    placeholder="USER@COMPANY.COM"
                    readOnly={!!editingUser}
                  />

                  {!editingUser && (
                    <FormInput
                      label="Security Password"

                      icon={<Calendar size={16} />}
                      type="password"
                      value={formData.password}
                      onChange={(v) => setFormData({ ...formData, password: v })}
                      placeholder="••••••••"
                    />
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Role</label>
                    <select
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >

                      <option value="Employee">Employee (Normal)</option>
                      <option value="Manager">Manager (Approver)</option>
                      <option value="Admin">Admin (Full Access)</option>
                    </select >
                  </div >

                  {
                    formData.role === 'Employee' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 italic">Assigned Manager</label>
                        <select
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none"
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        >
                          <option value="">No Direct Manager</option>

                          {
                            users.filter(u => u.role === 'Manager' && u._id !== editingUser?._id).map(u => (
                              <option key={u._id} value={u._id}>{u.name}</option>
                            ))
                          }
                        </select >
                      </div >
                    )}

                  {
                    formData.role === 'Manager' && (
                      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-black text-white uppercase tracking-tight italic">Can Approve Expenses?</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isManagerApprover: !formData.isManagerApprover })}
                            className={`w-12 h-7 rounded-full transition-all relative flex items-center px-1.5 shadow-inner ${formData.isManagerApprover ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md ${formData.isManagerApprover ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">* Allows the manager to approve their team's requests.</p>
                      </div>
                    )
                  }

                  <div className="pt-10 flex flex-col gap-4">
                    <button type="submit" disabled={submitting} className="h-14 bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-indigo-500 transition-all disabled:opacity-50">

                      {submitting ? 'UPDATING...' : editingUser ? 'UPDATE USER' : 'ADD USER'}

                    </button >
                    <button type="button" onClick={() => setShowDrawer(false)} className="h-14 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all">
                      Cancel
                    </button>
                  </div >
                </form >
              </motion.div >
            </div >
          )}
        </AnimatePresence >
      </div >
    </AdminLayout >
  );
};

const FormInput = ({ label, icon, value, onChange, type = "text", placeholder, readOnly }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{label}</label>
      {icon && <div className="text-slate-600">{icon}</div>}
    </div>
    <input
      type={type}
      required
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-700 ${readOnly ? 'opacity-40 cursor-not-allowed shadow-inner' : ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TableLoader = ({ rows }) => (
  <div className="space-y-6">
    {[...Array(rows)].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
  </div>
);

export default AdminUsers;

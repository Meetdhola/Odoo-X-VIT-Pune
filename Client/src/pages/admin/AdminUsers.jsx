import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import api from '../../lib/axios.js';
import { Search, UserPlus, MoreVertical, Edit2, Trash2, X, Plus, Check, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleBadge = ({ role }) => {
  const styles = {
    Admin: 'bg-[#EEF2FF] text-[#3730A3]',
    Manager: 'bg-[#EFF6FF] text-[#1E40AF]',
    Employee: 'bg-[#F3F4F6] text-[#374151]'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${styles[role] || styles.Employee}`}>{role}</span>;
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
      toast.error('Failed to load users');
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
        toast.success('User updated');
      } else {
        await api.post('/admin/users', formData);
        toast.success('User created');
      }
      setShowDrawer(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return toast.error('You cannot delete your own account');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Deletion failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getAvatarColor = (role) => {
    if (role === 'Admin') return 'bg-[#6366F1]';
    if (role === 'Manager') return 'bg-[#3B82F6]';
    return 'bg-[#64748B]';
  };

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group w-full md:w-[280px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
             <input 
               type="text" 
               placeholder="Search by name or email" 
               className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-lg text-[14px] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-3">
             <select 
               className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-[14px] outline-none"
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
             >
               <option value="all">All Roles</option>
               <option value="admin">Admin</option>
               <option value="manager">Manager</option>
               <option value="employee">Employee</option>
             </select>
             <button onClick={() => handleOpenDrawer()} className="bg-[#4F46E5] text-white h-10 px-4 rounded-lg flex items-center gap-2 font-medium hover:bg-[#4338CA] transition-colors">
               <UserPlus size={18} /> Add User
             </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAFC] border-b-[1.5px] border-[#E2E8F0]">
               <tr>
                 <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">User</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Role</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Manager</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Is Approver</th>
                 <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Joined</th>
                 <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-[60px]"><td colSpan="6" className="bg-gray-50/50"></td></tr>)
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8] text-[14px]">No users found</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold ${getAvatarColor(user.role)}`}>
                         {user.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[14px] font-medium text-[#0F172A] leading-none mb-1">{user.name}</span>
                         <span className="text-[12px] text-[#64748B] leading-none">{user.email}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-4"><RoleBadge role={user.role} /></td>
                  <td className="px-4 text-[14px] text-[#0F172A] font-medium">{user.managerId?.name || <span className="text-[#94A3B8]">--</span>}</td>
                  <td className="px-4 text-center">
                    {user.isManagerApprover ? <Check className="mx-auto text-[#10B981]" size={18} /> : <Minus className="mx-auto text-[#94A3B8]" size={18} />}
                  </td>
                  <td className="px-4 text-[13px] text-[#64748B]">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                       <button onClick={() => handleOpenDrawer(user)} className="p-2 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-all">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(user._id)} className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-all">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Drawer */}
        {showDrawer && (
          <div className="fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDrawer(false)} />
            <div className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-2xl flex flex-col transform transition-transform animate-slideInRight">
               <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                  <h3 className="text-[18px] font-bold text-[#0F172A]">{editingUser ? 'Edit User' : 'Add User'}</h3>
                  <button onClick={() => setShowDrawer(false)} className="p-2 -mr-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      readOnly={!!editingUser}
                      className={`w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all ${editingUser ? 'bg-[#F8FAFC] cursor-not-allowed' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  {!editingUser && (
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Temporary Password</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Role</label>
                    <select 
                      className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  {formData.role === 'Employee' && (
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wide">Assign Manager</label>
                      <select 
                        className="w-full h-10 border border-[#D1D5DB] rounded-lg px-3 outline-none"
                        value={formData.managerId}
                        onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                      >
                        <option value="">No manager</option>
                        {users.filter(u => u.role === 'Manager' && u._id !== editingUser?._id).map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.role === 'Manager' && (
                    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                       <span className="text-[13px] font-medium text-[#0F172A]">Include as first approver for their direct reports</span>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, isManagerApprover: !formData.isManagerApprover})}
                         className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${formData.isManagerApprover ? 'bg-[#6366F1]' : 'bg-[#CBD5E1]'}`}
                       >
                         <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isManagerApprover ? 'translate-x-5' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  )}

                  <div className="pt-6 border-t border-[#E2E8F0] flex flex-col gap-3">
                     <button type="submit" disabled={submitting} className="bg-[#4F46E5] text-white h-11 rounded-lg font-bold hover:bg-[#4338CA] transition-all disabled:opacity-50">
                       {submitting ? 'Saving...' : 'Save User'}
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

export default AdminUsers;

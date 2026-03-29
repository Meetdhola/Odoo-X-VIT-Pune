import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios.js';
import { Plus, Search, MoreVertical, Edit2, Trash2, Mail, UserPlus, ChevronRight } from 'lucide-react';
import { StatusBadge, RoleBadge } from '../components/Badges.jsx';
import RightDrawer from '../components/RightDrawer.jsx';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.id) return toast.error('Check yourself, you cannot delete yourself');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border border-[#E2E8F0] rounded-[10px] shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Company Directory</h2>
          <p className="text-[13px] text-[#64748B]">Manage all employees and their hierarchical roles.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="btn-primary"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="table-header-cell pl-6">Full Name</th>
              <th className="table-header-cell">Company Role</th>
              <th className="table-header-cell">Reporting Manager</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse h-[52px]">
                  <td colSpan="5" className="px-6 py-4 bg-gray-50/50"></td>
                </tr>
              ))
            ) : users.map((user) => (
              <tr key={user._id} className="table-row">
                <td className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[12px] font-bold text-[#374151]">
                       {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[#0F172A]">{user.name}</span>
                      <span className="text-[12px] text-[#64748B]">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#0F172A]">{user.managerId?.name || 'N/A'}</span>
                    {user.isManagerApprover && <span className="text-[10px] font-bold text-[#6366F1] uppercase">Approver</span>}
                  </div>
                </td>
                <td className="px-4">
                  <StatusBadge status="approved" /> {/* Placeholder status since not in user model explicitly for this view */}
                </td>
                <td className="px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenDrawer(user)}
                      className="p-1.5 text-[#64748B] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-md transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded-md transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RightDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingUser ? 'Edit System User' : 'Register New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Full Name</label>
            <input 
              type="text" 
              className="input-base" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Jean Doe"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="input-base" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g. jean@company.com"
              required
            />
          </div>
          
          {!editingUser && (
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Initial Password</label>
              <input 
                type="password" 
                className="input-base" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">System Role</label>
              <select 
                className="input-base"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Is Approver?</label>
              <div className="flex items-center h-[38px]">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-[#6366F1] rounded cursor-pointer"
                  checked={formData.isManagerApprover}
                  onChange={(e) => setFormData({...formData, isManagerApprover: e.target.checked})}
                />
                <span className="ml-2 text-[14px] text-[#0F172A]">Yes, can approve</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#64748B] uppercase mb-1.5">Reporting Manager</label>
            <select 
              className="input-base"
              value={formData.managerId}
              onChange={(e) => setFormData({...formData, managerId: e.target.value})}
            >
              <option value="">No Manager Assigned</option>
              {users.filter(u => u._id !== editingUser?._id).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-3">
            <button type="submit" className="btn-primary w-full h-[44px]">
              {editingUser ? 'Save Updates' : 'Add to Directory'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsDrawerOpen(false)}
              className="btn-secondary w-full h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </RightDrawer>
    </div>
  );
};

export default UserManagement;

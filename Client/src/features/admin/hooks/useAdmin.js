import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/managers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch managers');
    }
  }, []);

  const createUser = async (userData) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User created successfully');
        fetchUsers();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error('Failed to create user');
      return false;
    }
  };

  const updateUser = async (userId, updateData) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User updated');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const resetPassword = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('New password sent to user');
        return data.newPassword;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  return {
    users,
    managers,
    loading,
    fetchUsers,
    fetchManagers,
    createUser,
    updateUser,
    resetPassword
  };
};

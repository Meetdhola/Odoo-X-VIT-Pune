import { useState, useCallback } from 'react';
import { expenseService } from './expense.service.js';
import toast from 'react-hot-toast';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expenseService.getMyExpenses();
      if (data.success) {
        setExpenses(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = async (expenseData) => {
    setLoading(true);
    try {
      const data = await expenseService.createExpense(expenseData);
      if (data.success) {
        toast.success('Expense saved as draft');
        fetchExpenses();
        return data.data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const submitExpense = async (id) => {
    setLoading(true);
    try {
      const data = await expenseService.submitExpense(id);
      if (data.success) {
        toast.success('Expense submitted for approval');
        fetchExpenses();
        return data.data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    submitExpense
  };
};

import api from '../shared/api.js';

export const expenseService = {
  getMyExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getExpense: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  submitExpense: async (id) => {
    const response = await api.patch(`/expenses/${id}/submit`);
    return response.data;
  }
};

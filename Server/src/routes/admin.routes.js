import express from 'express';
import bcrypt from 'bcryptjs';
import { verifyJWT, requireRole } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import ApprovalRule from '../models/approvalRule.model.js';
import Expense from '../models/expense.model.js';
import ApprovalRequest from '../models/approvalRequest.model.js';

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole('admin'));

// --- USER MANAGEMENT ---

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.company })
      .populate('managerId', 'name email')
      .populate('companyId', 'name');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, managerId, isManagerApprover } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      companyId: req.user.company,
      managerId,
      isManagerApprover: isManagerApprover || false
    });

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, managerId, isManagerApprover } = req.body;
    
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.company });
    if (!user) return res.status(404).json({ error: 'User not found in your company' });

    if (role !== undefined) user.role = role;
    if (managerId !== undefined) user.managerId = managerId;
    if (isManagerApprover !== undefined) user.isManagerApprover = isManagerApprover;

    await user.save({ validateBeforeSave: false });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user.company });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- APPROVAL RULES ---

router.get('/rules', async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.user.company })
      .populate('steps.approver', 'name email role');
    res.json({ rules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const { name, steps, conditionType, percentageThreshold, specificApprover } = req.body;
    
    const rule = await ApprovalRule.create({
      company: req.user.company,
      name,
      steps,
      conditionType,
      percentageThreshold,
      specificApprover
    });

    res.status(201).json({ rule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/rules/:id', async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ _id: req.params.id, company: req.user.company });
    if (!rule) return res.status(404).json({ error: 'Approval rule not found' });

    const { steps, conditionType, percentageThreshold, specificApprover } = req.body;
    
    if (steps) rule.steps = steps;
    if (conditionType) rule.conditionType = conditionType;
    if (percentageThreshold !== undefined) rule.percentageThreshold = percentageThreshold;
    if (specificApprover !== undefined) rule.specificApprover = specificApprover;

    await rule.save();
    res.json({ rule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const rule = await ApprovalRule.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EXPENSE OVERSIGHT ---

router.get('/expenses', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = { company: req.user.company };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const expenses = await Expense.find(query)
      .populate('employee', 'name email')
      .populate('approvalRule', 'name')
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await Expense.countDocuments(query);

    const enhancedExpenses = await Promise.all(expenses.map(async (exp) => {
      let currentApprover = null;
      if (exp.status === 'pending') {
        const pendingRequest = await ApprovalRequest.findOne({ expense: exp._id, status: 'pending' })
          .populate('approver', 'name email role');
        if (pendingRequest) {
          currentApprover = pendingRequest.approver;
        }
      }
      return { ...exp, currentApprover };
    }));

    res.json({ expenses: enhancedExpenses, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, company: req.user.company })
      .populate('employee', 'name email')
      .populate('approvalRule', 'name');
      
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const approvalRequests = await ApprovalRequest.find({ expense: expense._id })
      .populate('approver', 'name email role'); // assuming 'role' is valid check

    res.json({ expense, approvalRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses/:id/override', async (req, res) => {
  try {
    const { action, comment } = req.body; 
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use approve or reject.' });
    }

    const expense = await Expense.findOne({ _id: req.params.id, company: req.user.company });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    expense.status = newStatus;
    await expense.save();

    await ApprovalRequest.updateMany(
      { expense: expense._id, status: 'pending' },
      { $set: { status: newStatus, comment: comment || 'Admin override', decidedAt: new Date() } }
    );

    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DASHBOARD STATS ---

router.get('/stats', async (req, res) => {
  try {
    const companyId = req.user.company;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // --- totalUsers ---
    const allUsers = await User.find({ companyId });
    const totalUsers = allUsers.reduce(
      (acc, curr) => {
        const r = (curr.role || 'employee').toLowerCase();
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      },
      { admin: 0, manager: 0, employee: 0 }
    );

    // --- expenses stats ---
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allExps = await Expense.find({ company: companyId });

    let total = allExps.length;
    let pending = 0;
    let approvedThisMonth = 0;
    let rejectedThisMonth = 0;
    let totalSpendThisMonth = 0;

    allExps.forEach((exp) => {
      if (exp.status === 'pending') pending++;
      const inThisMonth = new Date(exp.updatedAt) >= firstDayOfMonth;
      if (inThisMonth) {
        if (exp.status === 'approved') {
          approvedThisMonth++;
          totalSpendThisMonth += exp.convertedAmount || exp.amount || 0;
        }
        if (exp.status === 'rejected') rejectedThisMonth++;
      }
    });

    // --- expensesByCategory ---
    const expensesByCategory = Object.values(
      allExps.reduce((acc, exp) => {
        const cat = exp.category || 'Other';
        if (!acc[cat]) acc[cat] = { category: cat, count: 0, total: 0 };
        acc[cat].count++;
        acc[cat].total += exp.convertedAmount || exp.amount || 0;
        return acc;
      }, {})
    );

    // --- approvalBottlenecks (FIXED) ---
    // Get expense IDs for this company only, then query requests directly
    const companyExpenseIds = allExps.map((e) => e._id);

    const pendingReqs = await ApprovalRequest.find({
      status: 'pending',
      expense: { $in: companyExpenseIds }, // ← scope to company without populate
      approver: { $exists: true, $ne: null }, // ← guard against null approver
    });

    const approverCount = pendingReqs.reduce((acc, r) => {
      const apvId = r.approver.toString();
      acc[apvId] = (acc[apvId] || 0) + 1;
      return acc;
    }, {});

    const sortedApproverIds = Object.keys(approverCount)
      .sort((a, b) => approverCount[b] - approverCount[a])
      .slice(0, 5);

    const bottlenecks = await Promise.all(
      sortedApproverIds.map(async (id) => {
        const u = await User.findById(id).select('name role');
        return {
          approver: { name: u?.name || 'Unknown', role: u?.role || '' },
          pendingCount: approverCount[id],
        };
      })
    );

    res.json({
      stats: {
        totalUsers,
        expenses: { total, pending, approvedThisMonth, rejectedThisMonth, totalSpendThisMonth },
        approvalBottlenecks: bottlenecks,
        expensesByCategory,
        currency: company.currency || 'USD'
      },
    });
  } catch (error) {
    console.error('--- STATS ROUTE ERROR ---');
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

// --- COMPANY SETTINGS ---

router.get('/company', async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/company', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });

    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    company.name = name;
    await company.save();

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

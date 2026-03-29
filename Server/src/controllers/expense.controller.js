import Expense from '../models/expense.model.js';
import Company from '../models/company.model.js';
import ApprovalRule from '../models/approvalRule.model.js';
import ApprovalRequest from '../models/approvalRequest.model.js';
import { createInitialApprovalRequest, advanceApproval } from '../services/approvalEngine.service.js';

// @desc    Get all expenses for the logged in employee
// @route   GET /api/expenses
// @access  Private/Employee
export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employee: req.user.id })
      .populate('approvalRule', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single expense detail
// @route   GET /api/expenses/:id
// @access  Private/Employee
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, employee: req.user.id })
      .populate('approvalRule', 'name');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new expense (Draft)
// @route   POST /api/expenses
// @access  Private/Employee
export const createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date, receiptUrl, paidBy, remarks } = req.body;

    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    let convertedAmount = amount;
    if (currency !== company.currency) {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
        const data = await response.json();
        if (data.result === 'success') {
          const rate = data.rates[company.currency];
          convertedAmount = amount * rate;
        }
      } catch (err) {
        console.error('Currency conversion failed:', err.message);
      }
    }

    // Assign default approval rule if exists
    const rule = await ApprovalRule.findOne({ company: req.user.company });

    const expense = await Expense.create({
      employee: req.user.id,
      company: req.user.company,
      amount,
      currency,
      convertedAmount,
      category,
      description,
      date: date || Date.now(),
      receiptUrl,
      paidBy,
      remarks,
      approvalRule: rule ? rule._id : undefined
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit expense for approval
// @route   PATCH /api/expenses/:id/submit
// @access  Private/Employee
export const submitExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, employee: req.user.id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft expenses can be submitted' });
    }

    expense.status = 'pending';
    await expense.save();

    // Trigger approval flow
    await createInitialApprovalRequest(expense);

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all pending approval requests for the manager
// @route   GET /api/expenses/approvals/pending
// @access  Private (Manager/Admin)
export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await ApprovalRequest.find({
      approver: req.user.id,
      status: 'pending'
    })
    .populate({
      path: 'expense',
      populate: { path: 'employee', select: 'name email avatar' }
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: approvals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject an expense
// @route   POST /api/expenses/approvals/:id/action
// @access  Private (Manager/Admin)
export const actOnApproval = async (req, res) => {
  const { action, comment } = req.body;
  
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  try {
    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    if (request.approver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to act on this request' });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.comment = comment || '';
    request.actionDate = Date.now();
    await request.save();

    // Advance the approval engine
    await advanceApproval(request.expense);

    res.status(200).json({
      success: true,
      message: `Expense ${action}ed successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

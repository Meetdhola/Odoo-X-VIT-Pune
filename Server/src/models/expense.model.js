import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  convertedAmount: {
    type: Number
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  merchant: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  receiptUrl: {
    type: String
  },
  paidBy: {
    type: String,
    enum: ['Self', 'Company Card', 'Petty Cash'],
    default: 'Self'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'reimbursed'],
    default: 'draft'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  approvalRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule'
  }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

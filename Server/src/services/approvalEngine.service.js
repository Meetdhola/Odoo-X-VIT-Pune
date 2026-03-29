import Expense from '../models/expense.model.js';
import ApprovalRule from '../models/approvalRule.model.js';
import ApprovalRequest from '../models/approvalRequest.model.js';
import User from '../models/user.model.js';

/**
 * Finalizes an expense once all approval conditions are met.
 */
export const finalizeExpense = async (id, status) => {
  const expense = await Expense.findById(id);
  if (!expense) return null;
  expense.status = status;
  await expense.save();
  return expense;
};

/**
 * Creates the initial approval request for a new expense submission.
 * Follows the "Manager First" rule.
 */
export const createInitialApprovalRequest = async (expense) => {
  if (!expense) return;

  const employee = await User.findById(expense.employee).populate('managerId');
  
  // Logic: "The expense is first approved by his manager, if the IS MANAGER APPROVER field is checked."
  if (employee && employee.managerId && employee.managerId.isManagerApprover) {
    await ApprovalRequest.create({
      expense: expense._id,
      approver: employee.managerId._id,
      step: -1, // Manager step is -1
      status: 'pending'
    });
    expense.currentStep = -1;
    await expense.save();
    return;
  }

  // If no manager approval needed, move directly to rules
  await startRuleApproval(expense);
};

/**
 * Starts the rule-based approval process.
 */
const startRuleApproval = async (expense) => {
  const rule = await ApprovalRule.findById(expense.approvalRule);
  if (!rule) {
    // If no rule assigned, auto-approve after manager (or if no manager)
    return await finalizeExpense(expense._id, 'approved');
  }

  if (rule.conditionType === 'sequential') {
    if (rule.steps && rule.steps.length > 0) {
      await createRequestForStep(expense, rule, 0);
      expense.currentStep = 0;
    } else {
      await finalizeExpense(expense._id, 'approved');
    }
  } else {
    // For Percentage, Specific, or Hybrid, we might create all requests at once
    // so they can be approved in parallel or evaluated as they come.
    for (let i = 0; i < rule.steps.length; i++) {
      await createRequestForStep(expense, rule, i);
    }
    expense.currentStep = 0;
  }
  await expense.save();
};

const createRequestForStep = async (expense, rule, stepIndex) => {
  const step = rule.steps[stepIndex];
  if (!step) return;

  await ApprovalRequest.create({
    expense: expense._id,
    approver: step.approver,
    step: stepIndex,
    status: 'pending'
  });
};

/**
 * Advances the approval process after a request is acted upon.
 */
export const advanceApproval = async (expenseId) => {
  const expense = await Expense.findById(expenseId).populate('approvalRule');
  if (!expense || expense.status !== 'pending') return;

  const rule = expense.approvalRule;
  const requests = await ApprovalRequest.find({ expense: expenseId });
  
  // 1. Handle Manager Step (-1)
  if (expense.currentStep === -1) {
    const managerReq = requests.find(r => r.step === -1);
    if (managerReq) {
      if (managerReq.status === 'rejected') {
        return await finalizeExpense(expenseId, 'rejected');
      } else if (managerReq.status === 'approved') {
        return await startRuleApproval(expense);
      }
    }
    return; 
  }

  // 2. Handle Rule Logic
  if (!rule) return;

  if (rule.conditionType === 'sequential') {
    const currentReq = requests.find(r => r.step === expense.currentStep);
    if (currentReq && currentReq.status === 'rejected') {
      await finalizeExpense(expenseId, 'rejected');
    } else if (currentReq && currentReq.status === 'approved') {
      const nextStep = expense.currentStep + 1;
      if (nextStep < rule.steps.length) {
        expense.currentStep = nextStep;
        await expense.save();
        await createRequestForStep(expense, rule, nextStep);
      } else {
        await finalizeExpense(expenseId, 'approved');
      }
    }
  } else if (rule.conditionType === 'percentage') {
    evaluatePercentageRule(expense, rule, requests);
  } else if (rule.conditionType === 'specific') {
    evaluateSpecificRule(expense, rule, requests);
  } else if (rule.conditionType === 'hybrid') {
    evaluateHybridRule(expense, rule, requests);
  }
};

const evaluatePercentageRule = async (expense, rule, requests) => {
  const total = rule.steps.length;
  const approved = requests.filter(r => r.step >= 0 && r.status === 'approved').length;
  const rejected = requests.filter(r => r.step >= 0 && r.status === 'rejected').length;

  const approvedPercent = (approved / total) * 100;
  if (approvedPercent >= rule.percentageThreshold) {
    await finalizeExpense(expense._id, 'approved');
  } else {
    const maxPossible = ((total - rejected) / total) * 100;
    if (maxPossible < rule.percentageThreshold) {
      await finalizeExpense(expense._id, 'rejected');
    }
  }
};

const evaluateSpecificRule = async (expense, rule, requests) => {
  const targetReq = requests.find(r => r.step >= 0 && r.approver.toString() === rule.specificApprover.toString());
  if (targetReq) {
    if (targetReq.status === 'approved') {
      await finalizeExpense(expense._id, 'approved');
    } else if (targetReq.status === 'rejected') {
      await finalizeExpense(expense._id, 'rejected');
    }
  }
};

const evaluateHybridRule = async (expense, rule, requests) => {
  // Hybrid: Percentage OR Specific Approver
  const total = rule.steps.length;
  const approved = requests.filter(r => r.step >= 0 && r.status === 'approved').length;
  const rejected = requests.filter(r => r.step >= 0 && r.status === 'rejected').length;
  const approvedPercent = (approved / total) * 100;
  
  const targetReq = requests.find(r => r.step >= 0 && r.approver.toString() === rule.specificApprover.toString());
  const specificApproved = targetReq && targetReq.status === 'approved';
  
  if (approvedPercent >= rule.percentageThreshold || specificApproved) {
    await finalizeExpense(expense._id, 'approved');
  } else {
    // If we can no longer reach threshold AND specific approver rejected, it's rejected
    const maxPossible = ((total - rejected) / total) * 100;
    const specificRejected = targetReq && targetReq.status === 'rejected';
    if (maxPossible < rule.percentageThreshold && specificRejected) {
      await finalizeExpense(expense._id, 'rejected');
    }
  }
};

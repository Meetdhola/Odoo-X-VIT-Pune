import Expense from '../models/expense.model.js';
import ApprovalRule from '../models/approvalRule.model.js';
import ApprovalRequest from '../models/approvalRequest.model.js';
import User from '../models/user.model.js';

export const finalizeExpense = async (id, status) => {
  const expense = await Expense.findById(id);
  if (!expense) return null;
  expense.status = status;
  await expense.save();
  return expense;
};

export const createInitialApprovalRequest = async (expense) => {
  if (!expense || !expense.approvalRule) return;

  const rule = await ApprovalRule.findById(expense.approvalRule);
  const employee = await User.findById(expense.employee).populate('managerId');
  
  if (!rule) return;

  if (employee && employee.managerId && employee.managerId.isManagerApprover) {
    // Create for manager first (step -1)
    await ApprovalRequest.create({
      expense: expense._id,
      approver: employee.managerId._id,
      step: -1,
      status: 'pending'
    });
    expense.currentStep = -1;
    await expense.save();
  } else {
    // Create for rule.steps[0]
    if (rule.steps && rule.steps.length > 0) {
      if (rule.conditionType === 'sequential') {
        const firstStep = rule.steps[0];
        if (firstStep.approver) {
          await ApprovalRequest.create({
            expense: expense._id,
            approver: firstStep.approver,
            step: 0,
            status: 'pending'
          });
        }
        expense.currentStep = 0;
        await expense.save();
      } else {
        // For non-sequential, we create requests for all steps so they can approve in parallel
        for (let i = 0; i < rule.steps.length; i++) {
          if (rule.steps[i].approver) {
            await ApprovalRequest.create({
              expense: expense._id,
              approver: rule.steps[i].approver,
              step: i,
              status: 'pending'
            });
          }
        }
        expense.currentStep = 0;
        await expense.save();
      }
    }
  }
};

export const advanceApproval = async (expenseId) => {
  const expense = await Expense.findById(expenseId).populate('approvalRule');
  if (!expense || !expense.approvalRule) return;

  const rule = expense.approvalRule;
  const requests = await ApprovalRequest.find({ expense: expenseId });
  
  if (expense.status !== 'pending') return;

  // Let's handle the manager step (-1) if it exists and we haven't advanced yet.
  if (expense.currentStep === -1) {
    const managerReq = requests.find(r => r.step === -1);
    if (managerReq) {
      if (managerReq.status === 'rejected') {
        await finalizeExpense(expenseId, 'rejected');
        return;
      } else if (managerReq.status === 'approved') {
        // Advance to step 0
        if (rule.steps && rule.steps.length > 0) {
          if (rule.conditionType === 'sequential') {
            await ApprovalRequest.create({
              expense: expense._id,
              approver: rule.steps[0].approver,
              step: 0,
              status: 'pending'
            });
          } else {
            // spawn all
            for (let i = 0; i < rule.steps.length; i++) {
              if (rule.steps[i].approver) {
                await ApprovalRequest.create({
                  expense: expense._id,
                  approver: rule.steps[i].approver,
                  step: i,
                  status: 'pending'
                });
              }
            }
          }
          expense.currentStep = 0;
          await expense.save();
        } else {
          // No steps in rule, auto approve
          await finalizeExpense(expenseId, 'approved');
        }
        // Since we created new requests, we need to refetch them for the next logic or wait.
        // It's safer to just return and let them approve step 0.
        return;
      }
    }
    return; // Wait for manager
  }

  // Handle actual rule logic
  if (rule.conditionType === 'sequential') {
    const currentReq = requests.find(r => r.step === expense.currentStep);
    
    if (currentReq && currentReq.status === 'rejected') {
      await finalizeExpense(expenseId, 'rejected');
    } else if (currentReq && currentReq.status === 'approved') {
      const nextStep = expense.currentStep + 1;
      
      if (rule.steps && nextStep < rule.steps.length) {
        expense.currentStep = nextStep;
        await expense.save();
        
        await ApprovalRequest.create({
          expense: expense._id,
          approver: rule.steps[nextStep].approver,
          step: nextStep,
          status: 'pending'
        });
      } else {
        await finalizeExpense(expenseId, 'approved');
      }
    }
  } else if (rule.conditionType === 'percentage') {
    const totalSteps = rule.steps.length;
    if (totalSteps === 0) return finalizeExpense(expenseId, 'approved');

    let approvedCount = 0;
    let rejectedCount = 0;
    
    // We only count requests >= 0 to ignore manager step
    requests.filter(r => r.step >= 0).forEach(r => {
      if (r.status === 'approved') approvedCount++;
      if (r.status === 'rejected') rejectedCount++;
    });
    
    const percentApproved = (approvedCount / totalSteps) * 100;
    if (percentApproved >= rule.percentageThreshold) {
      await finalizeExpense(expenseId, 'approved');
    } else {
      const maxPossiblePercent = ((totalSteps - rejectedCount) / totalSteps) * 100;
      if (maxPossiblePercent < rule.percentageThreshold) {
        await finalizeExpense(expenseId, 'rejected');
      }
    }
  } else if (rule.conditionType === 'specific') {
    if (!rule.specificApprover) return finalizeExpense(expenseId, 'approved');

    const targetReq = requests.find(r => r.step >= 0 && r.approver.toString() === rule.specificApprover.toString());
    if (targetReq) {
      if (targetReq.status === 'approved') {
        await finalizeExpense(expenseId, 'approved');
      } else if (targetReq.status === 'rejected') {
        await finalizeExpense(expenseId, 'rejected');
      }
    }
  } else if (rule.conditionType === 'hybrid') {
    const totalSteps = rule.steps.length;
    if (totalSteps === 0) return finalizeExpense(expenseId, 'approved');

    let approvedCount = 0;
    let rejectedCount = 0;
    requests.filter(r => r.step >= 0).forEach(r => {
      if (r.status === 'approved') approvedCount++;
      if (r.status === 'rejected') rejectedCount++;
    });
    
    const percentApproved = (approvedCount / totalSteps) * 100;
    let specificApproved = false;
    let specificRejected = false;
    
    if (rule.specificApprover) {
      const targetReq = requests.find(r => r.step >= 0 && r.approver.toString() === rule.specificApprover.toString());
      if (targetReq) {
         if (targetReq.status === 'approved') specificApproved = true;
         if (targetReq.status === 'rejected') specificRejected = true;
      }
    }
    
    if (percentApproved >= rule.percentageThreshold || specificApproved) {
      await finalizeExpense(expenseId, 'approved');
    } else {
      // If we can no longer reach threshold AND specific approver rejected, it's dead.
      const maxPossiblePercent = ((totalSteps - rejectedCount) / totalSteps) * 100;
      if (maxPossiblePercent < rule.percentageThreshold && specificRejected) {
         await finalizeExpense(expenseId, 'rejected');
      }
    }
  }
};

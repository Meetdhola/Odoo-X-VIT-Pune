import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approverRole: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee'] // Matching User roles
  }
});

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  steps: [stepSchema],
  conditionType: {
    type: String,
    enum: ['sequential', 'percentage', 'specific', 'hybrid'],
    default: 'sequential'
  },
  percentageThreshold: {
    type: Number,
    min: 0,
    max: 100
  },
  specificApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const ApprovalRule = mongoose.model('ApprovalRule', approvalRuleSchema);
export default ApprovalRule;

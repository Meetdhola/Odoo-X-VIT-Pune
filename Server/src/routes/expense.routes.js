import express from 'express';
import { 
  getMyExpenses, 
  getExpense, 
  createExpense, 
  submitExpense,
  getPendingApprovals,
  actOnApproval
} from '../controllers/expense.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyExpenses)
  .post(createExpense);

router.get('/approvals/pending', getPendingApprovals);
router.post('/approvals/:id/action', actOnApproval);

router.route('/:id')
  .get(getExpense);

router.patch('/:id/submit', submitExpense);

export default router;

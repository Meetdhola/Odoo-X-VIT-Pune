import express from 'express';
import { getUsers, getManagers, createUser, updateUser, resetPassword } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply protection and authorization to all routes below
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.get('/managers', getManagers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.post('/users/:id/reset-password', resetPassword);

export default router;

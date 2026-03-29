import express from 'express';
import { register, login, getMe, verifyEmail, logout } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
// @desc register user
// @route POST /api/auth/register
// @access Public
router.post('/register', register);

// @desc login user
// @route POST /api/auth/login
// @access Public
router.post('/login', login);

// @desc get current user
// @route GET /api/auth/me
// @access Private
router.get('/me', protect, getMe);

// @desc verify user email
// @route POST /api/auth/verify-email
// @access Public
router.post('/verify-email', verifyEmail);

// @desc logout user
// @route GET /api/auth/logout
// @access Private
router.get('/logout', logout);

export default router;

import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Generate JWT Helper
const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    company: user.companyId,
    name: user.name,
    email: user.email
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Helper for error response
const handleErrorResponse = (res, error) => {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email address is already in use' });
  }
  return res.status(500).json({ success: false, message: error.message || 'Server Error. Please try again later.' });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, companyName, country, currency } = req.body;

    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Please provide a company name' });
    }

    // Check if company exists
    let company = await Company.findOne({ name: companyName });
    let role = 'Employee';

    if (!company) {
      // First user of a new company becomes Admin
      company = await Company.create({ 
        name: companyName,
        country: country || 'Not Specified',
        currency: currency || 'USD'
      });
      role = 'Admin';
    }

    // Create user. Validation runs here automatically
    const user = await User.create({ 
      name, 
      email, 
      password, 
      companyId: company._id,
      role
    });

    // Update company admin if not set
    if (role === 'Admin' && !company.admin) {
      company.admin = user._id;
      await company.save();
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save({ validateBeforeSave: false });

    const message = `Your verification code is: ${otp}\n\nThis code will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Email Verification Code',
        message,
        html: `<div style="font-family: sans-serif; text-align: center;">
                 <h2>Welcome!</h2>
                 <p>Your email verification code is:</p>
                 <h1 style="letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
                 <p>This code expires in 15 minutes.</p>
               </div>`,
      });

      res.status(201).json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
      });
    } catch (err) {
      console.log(err);
      user.otp = undefined;
      user.otpExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password exists
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email to login' });
    }

    const token = generateToken(user);

    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: false, // Set to false for local development on HTTP
      sameSite: 'lax',
      path: '/'
    };

    res.status(200)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      });
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(0), // Immediate expiration
    httpOnly: true,
    secure: false, // Match login settings
    sameSite: 'lax',
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Set new values
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified',
    });
  } catch (error) {
    handleErrorResponse(res, error);
  }
};

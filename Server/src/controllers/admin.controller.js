import User from '../models/user.model.js';
import Company from '../models/company.model.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Get all users in the same company
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .populate('managerId', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all available managers in the same company
// @route   GET /api/admin/managers
// @access  Private/Admin
export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ 
      companyId: req.user.companyId, 
      role: 'Manager' 
    }).select('name email');

    res.status(200).json({
      success: true,
      data: managers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new user (Employee/Manager)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, role, managerId } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate random password
    const password = crypto.randomBytes(8).toString('hex');

    user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      managerId: managerId || undefined,
      companyId: req.user.companyId,
      isVerified: true // Admin created users are pre-verified
    });

    // Send email with credentials
    const message = `Welcome to the team, ${name}!\n\nYour account has been created.\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease login and change your password immediately.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Account Credentials',
        message,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                 <h2 style="color: #4F46E5;">Welcome aboard, ${name}!</h2>
                 <p>Your workspace account has been created by the administrator.</p>
                 <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                   <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; color: #4F46E5; font-weight: bold;">${password}</span></p>
                 </div>
                 <p style="color: #6b7280; font-size: 14px;">Please change your password after your first login.</p>
               </div>`
      });

      res.status(201).json({
        success: true,
        data: user,
        tempPassword: password // Return to show in console if needed during dev
      });
    } catch (err) {
      console.error(err);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created but email could not be sent',
        tempPassword: password
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or manager
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { role, managerId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure user belongs to the same company
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (role) user.role = role;
    if (managerId !== undefined) user.managerId = managerId || null;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate and send new password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const newPassword = crypto.randomBytes(8).toString('hex');
    user.password = newPassword;
    await user.save();

    const message = `Your password has been reset by the administrator.\nNew Password: ${newPassword}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Notification',
      message,
      html: `<div style="font-family: sans-serif; padding: 20px;">
               <h3 style="color: #ef4444;">Password Reset</h3>
               <p>Your password has been reset by your administrator.</p>
               <p>Your new temporary password is: <strong>${newPassword}</strong></p>
               <p>Please login and update it immediately.</p>
             </div>`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful and email sent',
      newPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

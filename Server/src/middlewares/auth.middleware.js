import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.error("JWT Verification Error (protect):", error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication session.' });
  }
};

export const verifyJWT = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ error: 'Authentication required. No token found.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    next();
  } catch (error) {
    console.error("JWT Verification Error (verifyJWT):", error.message);
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ error: 'Forbidden: No role found' });
  }
  
  const userRoleLower = req.user.role.toLowerCase();
  const allowedRoles = roles.map(r => r.toLowerCase());
  
  if (!allowedRoles.includes(userRoleLower)) {
    return res.status(403).json({ error: `Forbidden: Requires one of [${roles.join(', ')}]` });
  }
  next();
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

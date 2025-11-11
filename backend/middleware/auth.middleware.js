const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await query(
      'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user[0].is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Attach user to request
    req.user = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      firstName: user[0].first_name,
      lastName: user[0].last_name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: error.message
    });
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user is the owner of the resource or admin
const authorizeOwnerOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    const resourceUserId = parseInt(req.params[userIdParam]);
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (user && user.length > 0) {
      req.user = {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        firstName: user[0].first_name,
        lastName: user[0].last_name
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  verifyToken,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in transaction
    const result = await transaction(async (connection) => {
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [email, passwordHash, role, firstName, lastName, phone || null]
      );

      const userId = userResult.insertId;

      // Create role-specific profile
      if (role === 'patient') {
        await connection.execute(
          'INSERT INTO patient_profiles (user_id) VALUES (?)',
          [userId]
        );
      } else if (role === 'doctor') {
        // Doctor profile will be completed separately and needs approval
        // Generate unique temporary license number to avoid duplicate key error
        const tempLicenseNumber = `PENDING_${userId}_${Date.now()}`;
        await connection.execute(
          'INSERT INTO doctor_profiles (user_id, license_number, specialization, is_approved) VALUES (?, ?, ?, ?)',
          [userId, tempLicenseNumber, 'Not Specified', false]
        );
      }

      return userId;
    });

    // Generate token
    const token = generateToken(result, role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: result,
        email,
        role,
        firstName,
        lastName,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const users = await query(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Get user basic info
    const users = await query(
      'SELECT id, email, role, first_name, last_name, phone, profile_picture, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    let profile = {};

    // Get role-specific profile
    if (role === 'patient') {
      const patientProfiles = await query(
        'SELECT * FROM patient_profiles WHERE user_id = ?',
        [userId]
      );
      profile = patientProfiles[0] || {};
    } else if (role === 'doctor') {
      const doctorProfiles = await query(
        'SELECT * FROM doctor_profiles WHERE user_id = ?',
        [userId]
      );
      profile = doctorProfiles[0] || {};
    }

    res.json({
      success: true,
      data: {
        ...user,
        profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    // Update basic user info if provided
    const userFields = ['firstName', 'lastName', 'phone'];
    const userUpdates = {};
    
    userFields.forEach(field => {
      if (updates[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        userUpdates[dbField] = updates[field];
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      const setClause = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(userUpdates), userId];
      
      await query(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );
    }

    // Update role-specific profile
    if (role === 'patient' && updates.profile) {
      const profileFields = [
        'dateOfBirth', 'gender', 'address', 'city', 'state', 'zipCode',
        'latitude', 'longitude', 'emergencyContactName', 'emergencyContactPhone',
        'insuranceProvider', 'insurancePolicyNumber', 'budgetRange'
      ];
      
      const profileUpdates = {};
      profileFields.forEach(field => {
        if (updates.profile[field] !== undefined) {
          const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
          profileUpdates[dbField] = updates.profile[field];
        }
      });

      if (Object.keys(profileUpdates).length > 0) {
        const setClause = Object.keys(profileUpdates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(profileUpdates), userId];
        
        await query(
          `UPDATE patient_profiles SET ${setClause} WHERE user_id = ?`,
          values
        );
      }
    } else if (role === 'doctor' && updates.profile) {
      const profileFields = [
        'licenseNumber', 'specialization', 'qualifications', 'experienceYears',
        'bio', 'consultationFee', 'address', 'city', 'state', 'zipCode',
        'latitude', 'longitude', 'availabilitySchedule'
      ];
      
      const profileUpdates = {};
      profileFields.forEach(field => {
        if (updates.profile[field] !== undefined) {
          const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
          profileUpdates[dbField] = updates.profile[field];
        }
      });

      if (Object.keys(profileUpdates).length > 0) {
        const setClause = Object.keys(profileUpdates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(profileUpdates), userId];
        
        await query(
          `UPDATE doctor_profiles SET ${setClause} WHERE user_id = ?`,
          values
        );
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const users = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Delete user profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { password } = req.body;

    // Get current password hash to verify
    const users = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password for security
    const isPasswordValid = await bcrypt.compare(password, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Profile deletion cancelled.'
      });
    }

    // Soft delete - deactivate account instead of hard delete to preserve data integrity
    await query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile deleted successfully. Your account has been deactivated.'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile
};


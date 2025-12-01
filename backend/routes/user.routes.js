const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { query } = require('../config/database');

// Upload profile picture
router.post('/profile-picture', verifyToken, uploadSingle('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    const userId = req.user.id;

    await query(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [filePath, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        filePath
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    let sql = 'SELECT id, email, role, first_name, last_name, phone, is_active, is_verified, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (isActive !== undefined) {
      sql += ' AND is_active = ?';
      params.push(isActive === 'true' || isActive === true);
    }

    sql += ' ORDER BY created_at DESC';
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Deactivate user account (admin only)
router.post('/:id/deactivate', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
});

// Activate user account (admin only)
router.post('/:id/activate', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE users SET is_active = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User account activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
});

// Delete user account (admin only) - soft delete
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Update doctor salary (admin only)
router.put('/:id/salary', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { baseSalary } = req.body;

    if (baseSalary === undefined || baseSalary < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary amount'
      });
    }

    // Check if user is a doctor
    const [user] = await query(
      'SELECT role FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await query(
      `UPDATE doctor_profiles 
       SET base_salary = ?, last_salary_update = NOW() 
       WHERE user_id = ?`,
      [baseSalary, id]
    );

    res.json({
      success: true,
      message: 'Doctor salary updated successfully',
      data: { baseSalary }
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary',
      error: error.message
    });
  }
});

// Give bonus to doctor (admin only)
router.post('/:id/bonus', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bonusAmount, reason } = req.body;

    if (!bonusAmount || bonusAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bonus amount'
      });
    }

    // Check if user is a doctor
    const [user] = await query(
      'SELECT role FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get current bonus and add new bonus
    const [profile] = await query(
      'SELECT total_bonus FROM doctor_profiles WHERE user_id = ?',
      [id]
    );

    const currentBonus = parseFloat(profile?.total_bonus || 0);
    const newTotalBonus = currentBonus + parseFloat(bonusAmount);

    await query(
      `UPDATE doctor_profiles 
       SET total_bonus = ?, last_bonus_date = NOW() 
       WHERE user_id = ?`,
      [newTotalBonus, id]
    );

    res.json({
      success: true,
      message: 'Bonus given successfully',
      data: {
        bonusAmount: parseFloat(bonusAmount),
        totalBonus: newTotalBonus,
        reason
      }
    });
  } catch (error) {
    console.error('Give bonus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to give bonus',
      error: error.message
    });
  }
});

module.exports = router;


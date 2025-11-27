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

module.exports = router;


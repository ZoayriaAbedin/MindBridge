const { query, transaction } = require('../config/database');

// Get support groups
const getSupportGroups = async (req, res) => {
  try {
    const { groupType, focusArea, isActive = true, page = 1, limit = 10 } = req.query;

    let sql = `
      SELECT 
        sg.*,
        u.first_name as facilitator_first_name,
        u.last_name as facilitator_last_name,
        dp.specialization,
        (SELECT COUNT(*) FROM support_group_members WHERE group_id = sg.id AND status = 'active') as current_members
      FROM support_groups sg
      JOIN users u ON sg.facilitator_id = u.id
      LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE 1=1
    `;
    
    const params = [];

    // Filters
    if (isActive !== undefined) {
      sql += ' AND sg.is_active = ?';
      params.push(isActive === 'true' || isActive === true);
    }

    if (groupType) {
      sql += ' AND sg.group_type = ?';
      params.push(groupType);
    }

    if (focusArea) {
      sql += ' AND sg.focus_area LIKE ?';
      params.push(`%${focusArea}%`);
    }

    sql += ' ORDER BY sg.created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const groups = await query(sql, params);

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Get support groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support groups',
      error: error.message
    });
  }
};

// Get single support group
const getSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const groups = await query(
      `SELECT 
        sg.*,
        u.first_name as facilitator_first_name,
        u.last_name as facilitator_last_name,
        u.email as facilitator_email,
        dp.specialization,
        dp.qualifications
      FROM support_groups sg
      JOIN users u ON sg.facilitator_id = u.id
      LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE sg.id = ?`,
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support group not found'
      });
    }

    const group = groups[0];

    // Get members
    const members = await query(
      `SELECT 
        sgm.id, sgm.role, sgm.joined_at, sgm.status,
        u.first_name, u.last_name, u.profile_picture
      FROM support_group_members sgm
      JOIN users u ON sgm.user_id = u.id
      WHERE sgm.group_id = ? AND sgm.status = 'active'
      ORDER BY sgm.joined_at ASC`,
      [id]
    );

    group.members = members;
    group.current_members = members.length;

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get support group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support group',
      error: error.message
    });
  }
};

// Create support group (doctor/admin only)
const createSupportGroup = async (req, res) => {
  try {
    const facilitatorId = req.user.id;
    const {
      name,
      description,
      groupType,
      focusArea,
      maxMembers,
      meetingSchedule,
      meetingMode,
      location,
      meetingLink
    } = req.body;

    const result = await query(
      `INSERT INTO support_groups 
       (name, description, facilitator_id, group_type, focus_area, max_members, 
        meeting_schedule, meeting_mode, location, meeting_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        facilitatorId,
        groupType,
        focusArea || null,
        maxMembers || 20,
        JSON.stringify(meetingSchedule) || null,
        meetingMode,
        location || null,
        meetingLink || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Support group created successfully',
      data: {
        groupId: result.insertId
      }
    });
  } catch (error) {
    console.error('Create support group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support group',
      error: error.message
    });
  }
};

// Update support group
const updateSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    // Get group
    const groups = await query(
      'SELECT * FROM support_groups WHERE id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support group not found'
      });
    }

    const group = groups[0];

    // Check authorization
    if (role !== 'admin' && group.facilitator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the facilitator or admin can update this group.'
      });
    }

    // Build update query
    const allowedFields = [
      'name', 'description', 'groupType', 'focusArea', 'maxMembers',
      'meetingSchedule', 'meetingMode', 'location', 'meetingLink', 'isActive'
    ];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (field === 'meetingSchedule' && typeof updates[field] === 'object') {
          updateData[dbField] = JSON.stringify(updates[field]);
        } else {
          updateData[dbField] = updates[field];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await query(
      `UPDATE support_groups SET ${setClause} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Support group updated successfully'
    });
  } catch (error) {
    console.error('Update support group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support group',
      error: error.message
    });
  }
};

// Join support group
const joinSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get group
    const groups = await query(
      'SELECT * FROM support_groups WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support group not found or inactive'
      });
    }

    const group = groups[0];

    // Check if already a member
    const existing = await query(
      'SELECT * FROM support_group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this group'
        });
      } else {
        // Reactivate membership
        await query(
          'UPDATE support_group_members SET status = "active", joined_at = NOW() WHERE group_id = ? AND user_id = ?',
          [id, userId]
        );
        
        return res.json({
          success: true,
          message: 'Rejoined support group successfully'
        });
      }
    }

    // Check if group is full
    const [{ count }] = await query(
      'SELECT COUNT(*) as count FROM support_group_members WHERE group_id = ? AND status = "active"',
      [id]
    );

    if (count >= group.max_members) {
      return res.status(400).json({
        success: false,
        message: 'Support group is full'
      });
    }

    // Join group
    await query(
      'INSERT INTO support_group_members (group_id, user_id, role, status) VALUES (?, ?, "member", "active")',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Joined support group successfully'
    });
  } catch (error) {
    console.error('Join support group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join support group',
      error: error.message
    });
  }
};

// Leave support group
const leaveSupportGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check membership
    const members = await query(
      'SELECT * FROM support_group_members WHERE group_id = ? AND user_id = ? AND status = "active"',
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Update status to inactive
    await query(
      'UPDATE support_group_members SET status = "inactive" WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Left support group successfully'
    });
  } catch (error) {
    console.error('Leave support group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave support group',
      error: error.message
    });
  }
};

// Get user's support groups
const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await query(
      `SELECT 
        sg.*,
        u.first_name as facilitator_first_name,
        u.last_name as facilitator_last_name,
        sgm.role as my_role,
        sgm.joined_at,
        (SELECT COUNT(*) FROM support_group_members WHERE group_id = sg.id AND status = 'active') as current_members
      FROM support_group_members sgm
      JOIN support_groups sg ON sgm.group_id = sg.id
      JOIN users u ON sg.facilitator_id = u.id
      WHERE sgm.user_id = ? AND sgm.status = 'active'
      ORDER BY sgm.joined_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your groups',
      error: error.message
    });
  }
};

module.exports = {
  getSupportGroups,
  getSupportGroup,
  createSupportGroup,
  updateSupportGroup,
  joinSupportGroup,
  leaveSupportGroup,
  getMyGroups
};

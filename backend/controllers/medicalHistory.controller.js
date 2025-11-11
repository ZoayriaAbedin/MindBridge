const { query, transaction } = require('../config/database');

// Get medical history for a patient
const getMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Check authorization
    if (role === 'patient' && parseInt(patientId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // For doctors, check if they have treated this patient
    if (role === 'doctor') {
      const appointments = await query(
        'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
        [userId, patientId]
      );

      if (appointments.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view medical history of your patients.'
        });
      }
    }

    const history = await query(
      `SELECT 
        mh.*,
        u.first_name as reported_by_first_name,
        u.last_name as reported_by_last_name
      FROM medical_history mh
      LEFT JOIN users u ON mh.reported_by = u.id
      WHERE mh.patient_id = ?
      ORDER BY mh.diagnosis_date DESC, mh.created_at DESC`,
      [patientId]
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medical history',
      error: error.message
    });
  }
};

// Add medical history entry
const addMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const { conditionName, diagnosisDate, severity, status, symptoms, notes } = req.body;

    // Check authorization
    if (role === 'patient' && parseInt(patientId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // For doctors, check if they have treated this patient
    if (role === 'doctor') {
      const appointments = await query(
        'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
        [userId, patientId]
      );

      if (appointments.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only add medical history for your patients.'
        });
      }
    }

    const result = await query(
      `INSERT INTO medical_history (patient_id, condition_name, diagnosis_date, severity, status, symptoms, notes, reported_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, conditionName, diagnosisDate || null, severity || null, status || 'active', symptoms || null, notes || null, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Medical history entry added successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Add medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add medical history',
      error: error.message
    });
  }
};

// Update medical history entry
const updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    // Get the medical history entry
    const entries = await query(
      'SELECT * FROM medical_history WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical history entry not found'
      });
    }

    const entry = entries[0];

    // Check authorization
    if (role === 'patient' && entry.patient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (role === 'doctor' && entry.reported_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update entries you created.'
      });
    }

    // Build update query
    const allowedFields = ['conditionName', 'diagnosisDate', 'severity', 'status', 'symptoms', 'notes'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateData[dbField] = updates[field];
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
      `UPDATE medical_history SET ${setClause} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Medical history updated successfully'
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical history',
      error: error.message
    });
  }
};

// Delete medical history entry
const deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Get the medical history entry
    const entries = await query(
      'SELECT * FROM medical_history WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical history entry not found'
      });
    }

    const entry = entries[0];

    // Only allow deletion by patient owner or the doctor who created it
    if (role !== 'admin' && entry.patient_id !== userId && entry.reported_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await query('DELETE FROM medical_history WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Medical history entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical history',
      error: error.message
    });
  }
};

module.exports = {
  getMedicalHistory,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory
};

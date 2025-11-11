const { query } = require('../config/database');

// Get all appointments for a user
const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let sql = `
      SELECT 
        a.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.email as doctor_email,
        dp.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
      WHERE 1=1
    `;
    
    const params = [];

    // Filter by role
    if (role === 'patient') {
      sql += ' AND a.patient_id = ?';
      params.push(userId);
    } else if (role === 'doctor') {
      sql += ' AND a.doctor_id = ?';
      params.push(userId);
    }

    // Filter by status
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    // Filter by date range
    if (startDate) {
      sql += ' AND a.appointment_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND a.appointment_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const appointments = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM appointments a WHERE 1=1';
    const countParams = [];
    
    if (role === 'patient') {
      countSql += ' AND a.patient_id = ?';
      countParams.push(userId);
    } else if (role === 'doctor') {
      countSql += ' AND a.doctor_id = ?';
      countParams.push(userId);
    }
    if (status) {
      countSql += ' AND a.status = ?';
      countParams.push(status);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// Get single appointment
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const appointments = await query(
      `SELECT 
        a.*,
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.email as doctor_email,
        dp.specialization, dp.consultation_fee
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      LEFT JOIN doctor_profiles dp ON d.id = dp.user_id
      WHERE a.id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check authorization
    if (role !== 'admin' && appointment.patient_id !== userId && appointment.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: error.message
    });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, appointmentDate, appointmentTime, appointmentType, meetingMode, notes } = req.body;

    // Check if doctor exists and is approved
    const doctors = await query(
      'SELECT u.id, dp.is_approved FROM users u JOIN doctor_profiles dp ON u.id = dp.user_id WHERE u.id = ? AND u.role = "doctor"',
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctors[0].is_approved) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not approved yet'
      });
    }

    // Check for conflicting appointments
    const conflicts = await query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
       AND status NOT IN ('cancelled', 'no_show')`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, meeting_mode, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [patientId, doctorId, appointmentDate, appointmentTime, appointmentType, meetingMode, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointmentId: result.insertId
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    // Get appointment
    const appointments = await query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check authorization
    if (role !== 'admin' && appointment.patient_id !== userId && appointment.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build update query
    const allowedFields = ['status', 'appointmentDate', 'appointmentTime', 'notes', 'meetingLink'];
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
      `UPDATE appointments SET ${setClause} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { cancellationReason } = req.body;

    // Get appointment
    const appointments = await query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check authorization
    if (appointment.patient_id !== userId && appointment.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Cancel appointment
    await query(
      'UPDATE appointments SET status = "cancelled", cancellation_reason = ?, cancelled_by = ? WHERE id = ?',
      [cancellationReason || null, userId, id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};

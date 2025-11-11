const { query, transaction } = require('../config/database');

// Get prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { patientId, status, page = 1, limit = 10 } = req.query;

    let sql = `
      SELECT 
        p.*,
        pat.first_name as patient_first_name, pat.last_name as patient_last_name,
        doc.first_name as doctor_first_name, doc.last_name as doctor_last_name,
        dp.specialization
      FROM prescriptions p
      JOIN users pat ON p.patient_id = pat.id
      JOIN users doc ON p.doctor_id = doc.id
      LEFT JOIN doctor_profiles dp ON doc.id = dp.user_id
      WHERE 1=1
    `;
    
    const params = [];

    // Filter by role
    if (role === 'patient') {
      sql += ' AND p.patient_id = ?';
      params.push(userId);
    } else if (role === 'doctor') {
      sql += ' AND p.doctor_id = ?';
      params.push(userId);
    }

    // Filter by patient (for doctors and admins)
    if (patientId && (role === 'doctor' || role === 'admin')) {
      sql += ' AND p.patient_id = ?';
      params.push(patientId);
    }

    // Filter by status
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.prescription_date DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const prescriptions = await query(sql, params);

    // Get prescription items for each prescription
    for (let prescription of prescriptions) {
      const items = await query(
        'SELECT * FROM prescription_items WHERE prescription_id = ?',
        [prescription.id]
      );
      prescription.items = items;
    }

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: error.message
    });
  }
};

// Get single prescription
const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const prescriptions = await query(
      `SELECT 
        p.*,
        pat.first_name as patient_first_name, pat.last_name as patient_last_name,
        doc.first_name as doctor_first_name, doc.last_name as doctor_last_name,
        dp.specialization, dp.license_number
      FROM prescriptions p
      JOIN users pat ON p.patient_id = pat.id
      JOIN users doc ON p.doctor_id = doc.id
      LEFT JOIN doctor_profiles dp ON doc.id = dp.user_id
      WHERE p.id = ?`,
      [id]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const prescription = prescriptions[0];

    // Check authorization
    if (role !== 'admin' && prescription.patient_id !== userId && prescription.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get prescription items
    const items = await query(
      'SELECT * FROM prescription_items WHERE prescription_id = ?',
      [id]
    );
    prescription.items = items;

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescription',
      error: error.message
    });
  }
};

// Create prescription (doctor only)
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, prescriptionDate, validUntil, notes, items } = req.body;

    // Verify doctor has treated this patient
    const appointments = await query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
      [doctorId, patientId]
    );

    if (appointments.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for your patients.'
      });
    }

    // Create prescription with items in transaction
    const result = await transaction(async (connection) => {
      // Insert prescription
      const [prescriptionResult] = await connection.execute(
        `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, prescription_date, valid_until, status, notes)
         VALUES (?, ?, ?, ?, ?, 'active', ?)`,
        [patientId, doctorId, appointmentId || null, prescriptionDate, validUntil || null, notes || null]
      );

      const prescriptionId = prescriptionResult.insertId;

      // Insert prescription items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO prescription_items (prescription_id, item_type, item_name, dosage, frequency, duration, instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            prescriptionId,
            item.itemType,
            item.itemName,
            item.dosage || null,
            item.frequency || null,
            item.duration || null,
            item.instructions || null
          ]
        );
      }

      return prescriptionId;
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescriptionId: result
      }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

// Update prescription (doctor only)
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Get prescription
    const prescriptions = await query(
      'SELECT * FROM prescriptions WHERE id = ?',
      [id]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const prescription = prescriptions[0];

    // Only the prescribing doctor can update
    if (prescription.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the prescribing doctor can update this prescription.'
      });
    }

    // Build update query
    const allowedFields = ['validUntil', 'status', 'notes'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateData[dbField] = updates[field];
      }
    });

    if (Object.keys(updateData).length > 0) {
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];

      await query(
        `UPDATE prescriptions SET ${setClause} WHERE id = ?`,
        values
      );
    }

    // Update items if provided
    if (updates.items) {
      await transaction(async (connection) => {
        // Delete existing items
        await connection.execute(
          'DELETE FROM prescription_items WHERE prescription_id = ?',
          [id]
        );

        // Insert new items
        for (const item of updates.items) {
          await connection.execute(
            `INSERT INTO prescription_items (prescription_id, item_type, item_name, dosage, frequency, duration, instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.itemType,
              item.itemName,
              item.dosage || null,
              item.frequency || null,
              item.duration || null,
              item.instructions || null
            ]
          );
        }
      });
    }

    res.json({
      success: true,
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

module.exports = {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription
};

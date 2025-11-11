const { query } = require('../config/database');

// Search doctors
const searchDoctors = async (req, res) => {
  try {
    const { 
      specialization, 
      city, 
      state, 
      minFee, 
      maxFee, 
      minRating,
      latitude,
      longitude,
      radius = 50, // km
      page = 1,
      limit = 10
    } = req.query;

    let sql = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
        dp.specialization, dp.qualifications, dp.experience_years, dp.bio,
        dp.consultation_fee, dp.city, dp.state, dp.latitude, dp.longitude,
        dp.rating, dp.total_reviews, dp.is_approved
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor' AND dp.is_approved = TRUE AND u.is_active = TRUE
    `;
    
    const params = [];

    // Filter by specialization
    if (specialization) {
      sql += ' AND dp.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    // Filter by location
    if (city) {
      sql += ' AND dp.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (state) {
      sql += ' AND dp.state LIKE ?';
      params.push(`%${state}%`);
    }

    // Filter by consultation fee
    if (minFee) {
      sql += ' AND dp.consultation_fee >= ?';
      params.push(parseFloat(minFee));
    }
    if (maxFee) {
      sql += ' AND dp.consultation_fee <= ?';
      params.push(parseFloat(maxFee));
    }

    // Filter by rating
    if (minRating) {
      sql += ' AND dp.rating >= ?';
      params.push(parseFloat(minRating));
    }

    // Distance-based search (if coordinates provided)
    if (latitude && longitude) {
      sql += ` AND (
        6371 * acos(
          cos(radians(?)) * cos(radians(dp.latitude)) *
          cos(radians(dp.longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(dp.latitude))
        )
      ) <= ?`;
      params.push(parseFloat(latitude), parseFloat(longitude), parseFloat(latitude), parseFloat(radius));
    }

    sql += ' ORDER BY dp.rating DESC, dp.total_reviews DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const doctors = await query(sql, params);

    // Get total count
    let countSql = `
      SELECT COUNT(*) as total 
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor' AND dp.is_approved = TRUE AND u.is_active = TRUE
    `;
    const countParams = [];
    
    if (specialization) {
      countSql += ' AND dp.specialization LIKE ?';
      countParams.push(`%${specialization}%`);
    }
    if (city) {
      countSql += ' AND dp.city LIKE ?';
      countParams.push(`%${city}%`);
    }

    const [{ total }] = await query(countSql, countParams);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctors = await query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
        dp.license_number, dp.specialization, dp.qualifications, dp.experience_years, 
        dp.bio, dp.consultation_fee, dp.address, dp.city, dp.state, dp.zip_code,
        dp.latitude, dp.longitude, dp.availability_schedule, dp.rating, dp.total_reviews
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.id = ? AND u.role = 'doctor' AND dp.is_approved = TRUE`,
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not approved'
      });
    }

    res.json({
      success: true,
      data: doctors[0]
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor',
      error: error.message
    });
  }
};

// Get recommended doctors for patient
const getRecommendedDoctors = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient profile
    const patientProfiles = await query(
      'SELECT latitude, longitude, budget_range FROM patient_profiles WHERE user_id = ?',
      [userId]
    );

    if (patientProfiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found. Please complete your profile first.'
      });
    }

    const patient = patientProfiles[0];
    const budgetMap = {
      '0-50': [0, 50],
      '51-100': [51, 100],
      '101-200': [101, 200],
      '201-500': [201, 500],
      '500+': [500, 999999]
    };

    const [minBudget, maxBudget] = budgetMap[patient.budget_range] || [0, 999999];

    let sql = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_picture,
        dp.specialization, dp.experience_years, dp.bio, dp.consultation_fee,
        dp.city, dp.state, dp.rating, dp.total_reviews,
        ${patient.latitude && patient.longitude ? `
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(dp.latitude)) *
            cos(radians(dp.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(dp.latitude))
          )
        ) as distance` : 'NULL as distance'}
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor' AND dp.is_approved = TRUE AND u.is_active = TRUE
        AND dp.consultation_fee BETWEEN ? AND ?
    `;

    const params = patient.latitude && patient.longitude 
      ? [patient.latitude, patient.longitude, patient.latitude, minBudget, maxBudget]
      : [minBudget, maxBudget];

    sql += patient.latitude && patient.longitude 
      ? ' ORDER BY distance ASC, dp.rating DESC LIMIT 10'
      : ' ORDER BY dp.rating DESC, dp.total_reviews DESC LIMIT 10';

    const doctors = await query(sql, params);

    res.json({
      success: true,
      data: doctors,
      message: doctors.length === 0 ? 'No doctors found matching your criteria. Try adjusting your budget or location.' : undefined
    });
  } catch (error) {
    console.error('Get recommended doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// Approve doctor (admin only)
const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    await query(
      'UPDATE doctor_profiles SET is_approved = TRUE, approved_by = ?, approved_at = NOW() WHERE user_id = ?',
      [adminId, id]
    );

    res.json({
      success: true,
      message: 'Doctor approved successfully'
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor',
      error: error.message
    });
  }
};

// Get pending doctor approvals (admin only)
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at,
        dp.license_number, dp.specialization, dp.qualifications, dp.experience_years
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor' AND dp.is_approved = FALSE
      ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending doctors',
      error: error.message
    });
  }
};

module.exports = {
  searchDoctors,
  getDoctorById,
  getRecommendedDoctors,
  approveDoctor,
  getPendingDoctors
};

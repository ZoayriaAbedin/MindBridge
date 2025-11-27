const { query } = require('../config/database');

// Get assessment history for a user
const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentType } = req.query;

    let sql = `
      SELECT 
        id, assessment_type, assessment_name, score, max_score, 
        severity, answers, created_at
      FROM assessment_history
      WHERE user_id = ?
    `;
    
    const params = [userId];

    if (assessmentType) {
      sql += ' AND assessment_type = ?';
      params.push(assessmentType);
    }

    sql += ' ORDER BY created_at DESC';

    const history = await query(sql, params);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment history',
      error: error.message
    });
  }
};

// Save assessment result
const saveAssessmentResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentType, assessmentName, score, maxScore, severity, answers } = req.body;

    const result = await query(
      `INSERT INTO assessment_history 
       (user_id, assessment_type, assessment_name, score, max_score, severity, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, assessmentType, assessmentName, score, maxScore, severity, JSON.stringify(answers)]
    );

    res.status(201).json({
      success: true,
      message: 'Assessment result saved successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Save assessment result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save assessment result',
      error: error.message
    });
  }
};

// Get assessment statistics (trends over time)
const getAssessmentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentType } = req.params;

    const history = await query(
      `SELECT score, severity, created_at
       FROM assessment_history
       WHERE user_id = ? AND assessment_type = ?
       ORDER BY created_at ASC`,
      [userId, assessmentType]
    );

    if (history.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          trend: 'no_data',
          history: []
        }
      });
    }

    // Calculate trend
    const firstScore = history[0].score;
    const lastScore = history[history.length - 1].score;
    let trend = 'stable';
    
    if (lastScore < firstScore) {
      trend = 'improving';
    } else if (lastScore > firstScore) {
      trend = 'worsening';
    }

    res.json({
      success: true,
      data: {
        total: history.length,
        firstScore,
        lastScore,
        trend,
        history
      }
    });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAssessmentHistory,
  saveAssessmentResult,
  getAssessmentStats
};

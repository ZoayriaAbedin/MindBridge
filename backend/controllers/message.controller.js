const db = require('../config/database');

/**
 * Get all conversations for the logged-in user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await db.query(`
      SELECT 
        c.*,
        CASE 
          WHEN c.patient_id = ? THEN c.doctor_id
          ELSE c.patient_id
        END as other_user_id,
        CASE 
          WHEN c.patient_id = ? THEN CONCAT(du.first_name, ' ', du.last_name)
          ELSE CONCAT(pu.first_name, ' ', pu.last_name)
        END as other_user_name,
        CASE 
          WHEN c.patient_id = ? THEN du.profile_picture
          ELSE pu.profile_picture
        END as other_user_picture,
        CASE 
          WHEN c.patient_id = ? THEN 'doctor'
          ELSE 'patient'
        END as other_user_role,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.sender_id != ? 
            AND m.is_read = FALSE
        ) as unread_count,
        (
          SELECT message_text 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message
      FROM conversations c
      LEFT JOIN users pu ON c.patient_id = pu.id
      LEFT JOIN users du ON c.doctor_id = du.id
      WHERE c.patient_id = ? OR c.doctor_id = ?
      ORDER BY c.last_message_at DESC
    `, [userId, userId, userId, userId, userId, userId, userId]);

    res.json(conversations || []);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get conversations',
      error: error.message 
    });
  }
};

/**
 * Get messages in a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this conversation
    const conversations = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (patient_id = ? OR doctor_id = ?)',
      [conversationId, userId, userId]
    );

    if (!conversations || conversations.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this conversation' 
      });
    }

    // Get all messages in the conversation
    const messages = await db.query(`
      SELECT 
        m.*,
        u.first_name,
        u.last_name,
        u.profile_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, userId]
    );

    res.json(messages || []);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get messages',
      error: error.message 
    });
  }
};

/**
 * Send a new message
 */
const sendMessage = async (req, res) => {
  try {
    const { recipientId, messageText } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    // Validate input
    if (!recipientId) {
      return res.status(400).json({ 
        success: false,
        message: 'Recipient ID is required' 
      });
    }

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Message text is required' 
      });
    }

    // Determine patient and doctor IDs based on sender role
    let patientId, doctorId;
    if (senderRole === 'patient') {
      patientId = senderId;
      doctorId = recipientId;
    } else if (senderRole === 'doctor') {
      patientId = recipientId;
      doctorId = senderId;
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid role for messaging' 
      });
    }

    // Find or create conversation
    let conversations = await db.query(
      'SELECT id FROM conversations WHERE patient_id = ? AND doctor_id = ?',
      [patientId, doctorId]
    );

    let conversationId;
    if (!conversations || conversations.length === 0) {
      // Create new conversation
      const result = await db.query(
        'INSERT INTO conversations (patient_id, doctor_id) VALUES (?, ?)',
        [patientId, doctorId]
      );
      conversationId = result.insertId;
    } else {
      conversationId = conversations[0].id;
    }

    // Insert the message
    const messageResult = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)',
      [conversationId, senderId, messageText.trim()]
    );

    // Update conversation last_message_at
    await db.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = ?',
      [conversationId]
    );

    // Fetch the created message with user info
    const newMessages = await db.query(`
      SELECT 
        m.*,
        u.first_name,
        u.last_name,
        u.profile_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [messageResult.insertId]);

    if (!newMessages || newMessages.length === 0) {
      throw new Error('Failed to retrieve created message');
    }

    res.status(201).json(newMessages[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message',
      error: error.message 
    });
  }
};

/**
 * Get or create a conversation between doctor and patient
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Determine the final patient and doctor IDs
    let finalPatientId, finalDoctorId;

    if (userRole === 'patient') {
      finalPatientId = userId;
      finalDoctorId = doctorId;
    } else if (userRole === 'doctor') {
      finalDoctorId = userId;
      finalPatientId = patientId;
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid role for conversations' 
      });
    }

    // Validate IDs
    if (!finalPatientId || !finalDoctorId) {
      return res.status(400).json({ 
        success: false,
        message: 'Both patient and doctor IDs are required' 
      });
    }

    // Check if conversation exists
    let conversations = await db.query(
      'SELECT * FROM conversations WHERE patient_id = ? AND doctor_id = ?',
      [finalPatientId, finalDoctorId]
    );

    let conversation;
    if (!conversations || conversations.length === 0) {
      // Create new conversation
      const result = await db.query(
        'INSERT INTO conversations (patient_id, doctor_id) VALUES (?, ?)',
        [finalPatientId, finalDoctorId]
      );

      const newConversations = await db.query(
        'SELECT * FROM conversations WHERE id = ?',
        [result.insertId]
      );
      conversation = newConversations && newConversations.length > 0 ? newConversations[0] : null;
    } else {
      conversation = conversations[0];
    }

    if (!conversation) {
      throw new Error('Failed to create or retrieve conversation');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get or create conversation',
      error: error.message 
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation
};

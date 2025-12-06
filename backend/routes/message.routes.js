const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All message routes require authentication
router.use(verifyToken);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get or create conversation (for patient with doctor)
router.get('/conversations/doctor/:doctorId', messageController.getOrCreateConversation);

// Get or create conversation (for doctor with patient)
router.get('/conversations/patient/:patientId', messageController.getOrCreateConversation);

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', messageController.getMessages);

// Send a message
router.post('/messages', messageController.sendMessage);

module.exports = router;

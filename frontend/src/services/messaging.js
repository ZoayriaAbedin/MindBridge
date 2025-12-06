import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const messagingAPI = {
  /**
   * Get all conversations for the current user
   */
  getConversations: () => api.get('/messages/conversations'),

  /**
   * Get or create conversation with a doctor (for patients)
   * @param {number} doctorId - The doctor's user ID
   */
  getOrCreateConversationWithDoctor: (doctorId) => 
    api.get(`/messages/conversations/doctor/${doctorId}`),

  /**
   * Get or create conversation with a patient (for doctors)
   * @param {number} patientId - The patient's user ID
   */
  getOrCreateConversationWithPatient: (patientId) =>
    api.get(`/messages/conversations/patient/${patientId}`),

  /**
   * Get all messages in a conversation
   * @param {number} conversationId - The conversation ID
   */
  getMessages: (conversationId) => 
    api.get(`/messages/conversations/${conversationId}/messages`),

  /**
   * Send a message
   * @param {number} recipientId - The recipient's user ID
   * @param {string} messageText - The message text
   */
  sendMessage: (recipientId, messageText) =>
    api.post('/messages/messages', { recipientId, messageText }),
};

// Appointments availability API (moved from old messaging file)
export const appointmentsAPI = {
  getAvailableDates: (doctorId) =>
    api.get(`/appointments/available-dates/${doctorId}`),
  
  getAvailableSlots: (doctorId, date) =>
    api.get('/appointments/available-slots', { params: { doctorId, date } }),
};

// Legacy export for backward compatibility
export const messagesAPI = messagingAPI;

export default messagingAPI;

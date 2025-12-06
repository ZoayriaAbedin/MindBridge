const axios = require('axios');

const API_URL = 'http://localhost:5002/api/v1';

async function runTest() {
  try {
    console.log('Starting messaging system test...');

    // 1. Register Doctor
    const doctorEmail = `doctor_${Date.now()}@test.com`;
    const doctorPassword = 'Password123!';
    console.log(`Registering doctor: ${doctorEmail}`);
    const doctorReg = await axios.post(`${API_URL}/auth/register`, {
      email: doctorEmail,
      password: doctorPassword,
      firstName: 'Test',
      lastName: 'Doctor',
      role: 'doctor',
      specialization: 'General',
      licenseNumber: `LIC-${Date.now()}`
    });
    const doctorToken = doctorReg.data.data.token;
    const doctorId = doctorReg.data.data.id;
    console.log('Doctor registered. ID:', doctorId);

    // 2. Register Patient
    const patientEmail = `patient_${Date.now()}@test.com`;
    const patientPassword = 'Password123!';
    console.log(`Registering patient: ${patientEmail}`);
    const patientReg = await axios.post(`${API_URL}/auth/register`, {
      email: patientEmail,
      password: patientPassword,
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient'
    });
    const patientToken = patientReg.data.data.token;
    const patientId = patientReg.data.data.id;
    console.log('Patient registered. ID:', patientId);

    // 3. Patient starts conversation/sends message to Doctor
    console.log('Patient sending message to doctor...');
    const messageText = 'Hello Doctor, I need help.';
    const sendMsgRes = await axios.post(
      `${API_URL}/messages/messages`,
      {
        recipientId: doctorId,
        messageText: messageText
      },
      {
        headers: { Authorization: `Bearer ${patientToken}` }
      }
    );
    console.log('Message sent response:', sendMsgRes.data);
    const conversationId = sendMsgRes.data.conversation_id;

    // 4. Doctor gets conversations
    console.log('Doctor fetching conversations...');
    const conversationsRes = await axios.get(
      `${API_URL}/messages/conversations`,
      {
        headers: { Authorization: `Bearer ${doctorToken}` }
      }
    );
    console.log('Doctor conversations:', conversationsRes.data);

    if (conversationsRes.data.length === 0) {
      throw new Error('Doctor should have at least one conversation');
    }

    const doctorConversation = conversationsRes.data.find(c => c.id === conversationId);
    if (!doctorConversation) {
        console.log("Conversation ID from send message:", conversationId);
        console.log("Conversations found:", conversationsRes.data.map(c => c.id));
        // It might be that conversation_id in message response is correct, let's check.
    }

    // 5. Doctor gets messages
    console.log(`Doctor fetching messages for conversation ${conversationId}...`);
    const messagesRes = await axios.get(
      `${API_URL}/messages/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${doctorToken}` }
      }
    );
    console.log('Messages fetched:', messagesRes.data);

    if (messagesRes.data.length === 0) {
      throw new Error('Should have messages');
    }

    // 6. Doctor replies
    console.log('Doctor replying...');
    const replyText = 'Hello Patient, how can I help?';
    const replyRes = await axios.post(
      `${API_URL}/messages/messages`,
      {
        recipientId: patientId,
        messageText: replyText
      },
      {
        headers: { Authorization: `Bearer ${doctorToken}` }
      }
    );
    console.log('Reply sent:', replyRes.data);

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

runTest();

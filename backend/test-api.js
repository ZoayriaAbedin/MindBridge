const axios = require('axios');
const { query } = require('./config/database');

async function testAPI() {
  console.log('Testing MindBridge API...\n');
  
  // Check database tables
  try {
    console.log('1. Checking database tables...');
    const tables = await query('SHOW TABLES');
    console.log('✓ Tables found:', tables.length);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));
    console.log();
  } catch (error) {
    console.error('✗ Database error:', error.message);
    return;
  }
  
  // Test registration
  try {
    console.log('2. Testing registration...');
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
      email: 'test' + Date.now() + '@example.com',
      password: 'Test1234!',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient',
      phone: '555-1234'
    });
    console.log('✓ Registration successful');
    console.log('Response:', response.data);
    console.log();
  } catch (error) {
    console.error('✗ Registration failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.errno) console.error('Errno:', error.errno);
    console.log();
  }
  
  // Test login with a known user (if exists)
  try {
    console.log('3. Testing login...');
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'Test1234!'
    });
    console.log('✓ Login successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('✗ Login failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.errno) console.error('Errno:', error.errno);
  }
}

testAPI().then(() => {
  console.log('\nTest completed');
  process.exit(0);
});

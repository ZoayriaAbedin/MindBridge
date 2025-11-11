// Run this script to generate a password hash for the seed data
const bcrypt = require('bcryptjs');

const password = 'Password123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nReplace $2b$10$YourHashedPasswordHere in seed.sql with this hash');
  }
});

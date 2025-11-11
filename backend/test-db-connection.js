const mysql = require('mysql2');

console.log('Testing database connection...\n');

// Test with empty password (XAMPP default)
const testConnection = (password) => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password,
    port: 3306
  });

  return new Promise((resolve) => {
    connection.connect((err) => {
      if (err) {
        console.log(`❌ Failed with password: "${password || '(empty)'}"`);
        console.log(`   Error: ${err.message}\n`);
        connection.destroy();
        resolve(false);
      } else {
        console.log(`✅ SUCCESS with password: "${password || '(empty)'}"\n`);
        console.log('Update your .env file with:');
        console.log(`DB_PASSWORD=${password}\n`);
        connection.end();
        resolve(true);
      }
    });
  });
};

// Test different common passwords
(async () => {
  const passwords = [
    '',                           // Empty (XAMPP default)
    'anikahmed20030312',         // Your current .env password
    'root',                      // Common default
    'password',                  // Common default
  ];

  for (const pwd of passwords) {
    const success = await testConnection(pwd);
    if (success) {
      process.exit(0);
    }
  }

  console.log('\n⚠️  None of the common passwords worked.');
  console.log('\nTo reset your MySQL root password in XAMPP:');
  console.log('1. Stop MySQL in XAMPP Control Panel');
  console.log('2. Open XAMPP Shell');
  console.log('3. Run: mysqladmin -u root password ""');
  console.log('4. Start MySQL again');
  console.log('5. Set DB_PASSWORD= (empty) in .env file\n');
  
  process.exit(1);
})();

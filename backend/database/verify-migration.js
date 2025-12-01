const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function verifyMigration() {
  let connection;
  
  try {
    console.log('🔍 Verifying database migration...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mindbridge_db',
      port: process.env.DB_PORT || 3306,
    });

    // Check new columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'doctor_profiles' 
      AND COLUMN_NAME IN ('base_salary', 'total_bonus', 'last_salary_update', 'last_bonus_date')
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'mindbridge_db']);

    if (columns.length === 4) {
      console.log('✅ All required columns exist:\n');
      columns.forEach(col => {
        console.log(`   ✓ ${col.COLUMN_NAME.padEnd(25)} (${col.DATA_TYPE})`);
      });
      
      // Check sample data
      const [doctors] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM doctor_profiles
      `);
      
      console.log(`\n📊 Database Status:`);
      console.log(`   - Total doctors: ${doctors[0].total}`);
      
      if (doctors[0].total > 0) {
        const [sampleDoctors] = await connection.execute(`
          SELECT u.first_name, u.last_name, dp.base_salary, dp.total_bonus
          FROM doctor_profiles dp
          JOIN users u ON dp.user_id = u.id
          LIMIT 3
        `);
        
        console.log(`\n   Sample doctor data:`);
        sampleDoctors.forEach(doc => {
          console.log(`   - Dr. ${doc.first_name} ${doc.last_name}: Salary=$${doc.base_salary || 0}, Bonus=$${doc.total_bonus || 0}`);
        });
      }
      
      console.log('\n✅ Migration verification complete!\n');
      console.log('Next steps:');
      console.log('1. Start/restart backend server: npm start');
      console.log('2. Login as admin');
      console.log('3. Go to Salary Management to set doctor salaries');
      console.log('4. Doctors can view their compensation in Profile page\n');
      
    } else {
      console.log('❌ Migration incomplete. Missing columns:\n');
      const expected = ['base_salary', 'total_bonus', 'last_salary_update', 'last_bonus_date'];
      const found = columns.map(c => c.COLUMN_NAME);
      const missing = expected.filter(col => !found.includes(col));
      missing.forEach(col => console.log(`   ✗ ${col}`));
      console.log('\nPlease run the migration again.\n');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyMigration();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mindbridge_db',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✓ Connected to database successfully\n');
    console.log('🔄 Running migration: Adding salary and bonus fields...\n');

    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'doctor_profiles' 
      AND COLUMN_NAME IN ('base_salary', 'total_bonus', 'last_salary_update', 'last_bonus_date')
    `, [process.env.DB_NAME || 'mindbridge_db']);

    if (columns.length > 0) {
      console.log('ℹ️  Columns already exist:');
      columns.forEach(col => console.log(`   - ${col.COLUMN_NAME}`));
      console.log('\n✓ Migration already applied. No changes needed.\n');
      await connection.end();
      return;
    }

    // Run migration
    await connection.execute(`
      ALTER TABLE doctor_profiles 
      ADD COLUMN base_salary DECIMAL(10, 2) DEFAULT 0.00 AFTER consultation_fee
    `);
    console.log('✓ Added base_salary column');

    await connection.execute(`
      ALTER TABLE doctor_profiles 
      ADD COLUMN total_bonus DECIMAL(10, 2) DEFAULT 0.00 AFTER base_salary
    `);
    console.log('✓ Added total_bonus column');

    await connection.execute(`
      ALTER TABLE doctor_profiles 
      ADD COLUMN last_salary_update TIMESTAMP NULL AFTER total_bonus
    `);
    console.log('✓ Added last_salary_update column');

    await connection.execute(`
      ALTER TABLE doctor_profiles 
      ADD COLUMN last_bonus_date TIMESTAMP NULL AFTER last_salary_update
    `);
    console.log('✓ Added last_bonus_date column');

    // Create index
    try {
      await connection.execute(`
        CREATE INDEX idx_salary ON doctor_profiles(base_salary)
      `);
      console.log('✓ Created index on base_salary');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   Salary and bonus fields have been added to doctor_profiles table.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL server is not running. Please start MySQL and try again.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Database credentials are incorrect. Please check your .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist. Please create it first or check your .env file.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
console.log('═══════════════════════════════════════════════════');
console.log('   MindBridge Database Migration');
console.log('   Adding Salary and Bonus Fields');
console.log('═══════════════════════════════════════════════════\n');

runMigration();

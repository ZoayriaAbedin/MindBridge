# Salary and Bonus System Implementation

This update adds salary and bonus management functionality for doctors, allowing admins to set base salaries and give bonuses that are visible in doctor profiles.

## Changes Made

### 1. Database Changes
- **New fields added to `doctor_profiles` table:**
  - `base_salary` (DECIMAL(10,2)): Doctor's base salary
  - `total_bonus` (DECIMAL(10,2)): Cumulative bonuses received
  - `last_salary_update` (TIMESTAMP): Last salary modification date
  - `last_bonus_date` (TIMESTAMP): Last bonus given date

### 2. Backend Changes

#### New API Endpoints (user.routes.js)
- **PUT /api/v1/users/:id/salary** - Update doctor's base salary (Admin only)
  - Request: `{ baseSalary: number }`
  - Response: Updated salary information

- **POST /api/v1/users/:id/bonus** - Give bonus to doctor (Admin only)
  - Request: `{ bonusAmount: number, reason: string }`
  - Response: Bonus details and updated total

#### Updated Controllers
- `doctor.controller.js`: Now returns `base_salary` and `total_bonus` in search results
- `auth.controller.js`: Already returns all doctor_profiles fields including new ones

### 3. Frontend Changes

#### AdminSalary.js
- Now persists salary and bonus changes to the database
- Displays actual values from database
- Real-time updates after changes

#### DoctorProfile.js
- New compensation information section
- Displays:
  - Base Salary
  - Total Bonuses
  - Total Compensation (salary + bonuses)
- Only shown if salary or bonus > 0

#### Updated API Service (api.js)
- `usersAPI.updateSalary(id, baseSalary)` - Update salary
- `usersAPI.giveBonus(id, bonusAmount, reason)` - Give bonus

## Installation

### Step 1: Run Database Migration

**Option A: Using the migration script**
```bash
cd backend/database
run_migration.bat
```

**Option B: Manual SQL execution**
```bash
mysql -u root -p mindbridge_db < backend/database/add_salary_fields.sql
```

**Option C: Using MySQL Workbench or phpMyAdmin**
- Open `backend/database/add_salary_fields.sql`
- Copy and execute the SQL commands

### Step 2: Restart Backend Server
```bash
cd backend
npm start
```

The frontend will automatically use the new features once the backend is updated.

## Usage

### For Admins

1. **Set Base Salary:**
   - Go to Admin Dashboard → Salary Management
   - Click "Adjust Salary" for any doctor
   - Enter the base salary amount

2. **Give Bonus:**
   - Click "Give Bonus" for any doctor
   - Enter bonus amount and reason
   - Bonus is added to the doctor's total

### For Doctors

- View your compensation in Profile page
- See base salary, bonuses, and total compensation
- Read-only display (only admins can modify)

## Database Schema

```sql
ALTER TABLE doctor_profiles 
ADD COLUMN base_salary DECIMAL(10, 2) DEFAULT 0.00 AFTER consultation_fee,
ADD COLUMN total_bonus DECIMAL(10, 2) DEFAULT 0.00 AFTER base_salary,
ADD COLUMN last_salary_update TIMESTAMP NULL AFTER total_bonus,
ADD COLUMN last_bonus_date TIMESTAMP NULL AFTER last_salary_update;
```

## API Examples

### Update Doctor Salary
```javascript
// Admin only
PUT /api/v1/users/5/salary
{
  "baseSalary": 75000
}

Response:
{
  "success": true,
  "message": "Doctor salary updated successfully",
  "data": {
    "baseSalary": 75000
  }
}
```

### Give Doctor Bonus
```javascript
// Admin only
POST /api/v1/users/5/bonus
{
  "bonusAmount": 5000,
  "reason": "Excellent patient satisfaction ratings"
}

Response:
{
  "success": true,
  "message": "Bonus given successfully",
  "data": {
    "bonusAmount": 5000,
    "totalBonus": 12000,
    "reason": "Excellent patient satisfaction ratings"
  }
}
```

## Features

✅ Persistent salary and bonus storage
✅ Admin-only access for modifications
✅ Real-time updates in doctor profiles
✅ Cumulative bonus tracking
✅ Timestamp tracking for auditing
✅ Elegant UI display
✅ Input validation

## Notes

- Bonuses are cumulative - each bonus adds to the total
- Salary updates replace the previous salary
- Both fields default to 0.00 if not set
- Only visible to doctors in their own profile
- Admins can see all compensation data in Salary Management

## Troubleshooting

**Issue:** "Field doesn't exist" error
- **Solution:** Make sure you ran the migration SQL script

**Issue:** Salary/bonus not showing in doctor profile
- **Solution:** Check if values are > 0, section only shows when there's data

**Issue:** Admin can't update salary
- **Solution:** Ensure user is logged in as admin role

## Security

- All salary/bonus endpoints require admin authentication
- JWT token validation
- Input sanitization and validation
- Database constraints prevent negative values

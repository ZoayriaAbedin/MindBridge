-- Add salary and bonus fields to doctor_profiles table
ALTER TABLE doctor_profiles 
ADD COLUMN base_salary DECIMAL(10, 2) DEFAULT 0.00 AFTER consultation_fee,
ADD COLUMN total_bonus DECIMAL(10, 2) DEFAULT 0.00 AFTER base_salary,
ADD COLUMN last_salary_update TIMESTAMP NULL AFTER total_bonus,
ADD COLUMN last_bonus_date TIMESTAMP NULL AFTER last_salary_update;

-- Add index for salary queries
CREATE INDEX idx_salary ON doctor_profiles(base_salary);

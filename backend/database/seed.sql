-- MindBridge Seed Data
-- Sample data for testing and development

-- Insert admin user
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
('admin@mindbridge.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'admin', 'Admin', 'User', '555-0000', TRUE, TRUE);

-- Insert sample doctors
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
('dr.rahman@mindbridge.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'doctor', 'Fatima', 'Rahman', '01712-345678', TRUE, TRUE),
('dr.ahmed@mindbridge.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'doctor', 'Khalid', 'Ahmed', '01812-456789', TRUE, TRUE),
('dr.hossain@mindbridge.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'doctor', 'Nazia', 'Hossain', '01912-567890', TRUE, TRUE),
('dr.islam@mindbridge.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'doctor', 'Tahmid', 'Islam', '01612-678901', TRUE, TRUE);

-- Insert sample patients
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
('patient1@example.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'patient', 'John', 'Doe', '555-1001', TRUE, TRUE),
('patient2@example.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'patient', 'Jane', 'Wilson', '555-1002', TRUE, TRUE),
('patient3@example.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'patient', 'Robert', 'Davis', '555-1003', TRUE, TRUE),
('patient4@example.com', '$2a$10$WkFNCkKbPcqayfHJespqDexH/olgSG5qORVaK50HV4i0HuINLuTrq', 'patient', 'Lisa', 'Martinez', '555-1004', TRUE, TRUE);

-- Insert doctor profiles with availability schedules
INSERT INTO doctor_profiles (user_id, license_number, specialization, qualifications, experience_years, bio, consultation_fee, address, city, state, zip_code, latitude, longitude, is_approved, approved_by, approved_at, rating, total_reviews, availability_schedule) VALUES
(2, 'BMDC-12345', 'Clinical Psychology', 'Ph.D. in Clinical Psychology, Licensed Therapist', 15, 'Specializing in anxiety, depression, and trauma therapy with over 15 years of experience.', 1500.00, 'House 12, Road 5, Dhanmondi', 'Dhaka', 'Dhaka', '1205', 23.7461, 90.3742, TRUE, 1, NOW(), 4.8, 127, '{"sunday":{"available":true,"startTime":"10:00","endTime":"16:00"},"monday":{"available":true,"startTime":"09:00","endTime":"17:00"},"tuesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"wednesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"thursday":{"available":true,"startTime":"09:00","endTime":"17:00"},"friday":{"available":true,"startTime":"09:00","endTime":"14:00"},"saturday":{"available":false,"startTime":"09:00","endTime":"17:00"}}'),
(3, 'BMDC-23456', 'Psychiatry', 'MBBS, FCPS (Psychiatry), Board Certified Psychiatrist', 10, 'Expert in medication management and treatment of mood disorders.', 2000.00, 'Gulshan Avenue, Gulshan-1', 'Dhaka', 'Dhaka', '1212', 23.7809, 90.4132, TRUE, 1, NOW(), 4.6, 98, '{"sunday":{"available":true,"startTime":"14:00","endTime":"20:00"},"monday":{"available":true,"startTime":"10:00","endTime":"18:00"},"tuesday":{"available":true,"startTime":"10:00","endTime":"18:00"},"wednesday":{"available":true,"startTime":"10:00","endTime":"18:00"},"thursday":{"available":true,"startTime":"10:00","endTime":"18:00"},"friday":{"available":true,"startTime":"10:00","endTime":"15:00"},"saturday":{"available":true,"startTime":"10:00","endTime":"16:00"}}'),
(4, 'BMDC-34567', 'Family Therapy', 'M.Phil in Clinical Psychology, Certified Family Therapist', 8, 'Helping families navigate relationships and communication challenges.', 1200.00, 'Banani Road 11, Banani', 'Dhaka', 'Dhaka', '1213', 23.7937, 90.4066, TRUE, 1, NOW(), 4.9, 156, '{"sunday":{"available":false,"startTime":"09:00","endTime":"17:00"},"monday":{"available":true,"startTime":"09:00","endTime":"17:00"},"tuesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"wednesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"thursday":{"available":true,"startTime":"09:00","endTime":"17:00"},"friday":{"available":true,"startTime":"09:00","endTime":"13:00"},"saturday":{"available":true,"startTime":"10:00","endTime":"16:00"}}'),
(5, 'BMDC-45678', 'Cognitive Behavioral Therapy', 'Ph.D., CBT Specialist', 12, 'Evidence-based treatment for anxiety, OCD, and phobias.', 1750.00, 'Mohakhali DOHS, Mohakhali', 'Dhaka', 'Dhaka', '1206', 23.7783, 90.4044, TRUE, 1, NOW(), 4.7, 89, '{"sunday":{"available":true,"startTime":"11:00","endTime":"18:00"},"monday":{"available":true,"startTime":"09:00","endTime":"17:00"},"tuesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"wednesday":{"available":true,"startTime":"09:00","endTime":"17:00"},"thursday":{"available":true,"startTime":"09:00","endTime":"17:00"},"friday":{"available":false,"startTime":"09:00","endTime":"17:00"},"saturday":{"available":true,"startTime":"09:00","endTime":"15:00"}}');

-- Insert patient profiles
INSERT INTO patient_profiles (user_id, date_of_birth, gender, address, city, state, zip_code, latitude, longitude, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, budget_range) VALUES
(6, '1985-05-15', 'male', 'Uttara Sector 3', 'Dhaka', 'Dhaka', '1230', 23.8759, 90.3795, 'Mary Doe', '01711-234567', 'Delta Life', 'DL123456', '101-200'),
(7, '1990-08-22', 'female', 'Bashundhara R/A, Block D', 'Dhaka', 'Dhaka', '1229', 23.8223, 90.4270, 'Tom Wilson', '01811-345678', 'Green Delta', 'GD789012', '51-100'),
(8, '1978-03-10', 'male', 'Mirpur DOHS', 'Dhaka', 'Dhaka', '1216', 23.8223, 90.3654, 'Susan Davis', '01911-456789', 'Pragati Life', 'PL345678', '201-500'),
(9, '1995-11-30', 'female', 'Lalmatia Block A', 'Dhaka', 'Dhaka', '1207', 23.7575, 90.3687, 'Carlos Martinez', '01611-567890', 'MetLife Bangladesh', 'ML901234', '0-50');

-- Insert medical history
INSERT INTO medical_history (patient_id, condition_name, diagnosis_date, severity, status, symptoms, notes, reported_by) VALUES
(6, 'Generalized Anxiety Disorder', '2023-01-15', 'moderate', 'active', 'Persistent worry, restlessness, difficulty concentrating', 'Patient reports symptoms worsening during work stress', 2),
(6, 'Insomnia', '2023-03-20', 'mild', 'active', 'Difficulty falling asleep, frequent night waking', 'Related to anxiety condition', 2),
(7, 'Major Depressive Disorder', '2022-11-10', 'moderate', 'active', 'Low mood, loss of interest, fatigue, appetite changes', 'Ongoing treatment with therapy and medication', 3),
(8, 'Post-Traumatic Stress Disorder', '2021-06-05', 'severe', 'in_remission', 'Flashbacks, nightmares, hypervigilance', 'Significant improvement with EMDR therapy', 4),
(9, 'Social Anxiety Disorder', '2024-02-14', 'moderate', 'active', 'Fear of social situations, panic attacks in groups', 'Starting CBT treatment', 5);

-- Insert appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, meeting_mode, notes) VALUES
(6, 2, '2024-12-15', '10:00:00', 60, 'therapy', 'scheduled', 'video', 'Regular therapy session'),
(6, 2, '2024-12-22', '10:00:00', 60, 'therapy', 'scheduled', 'video', 'Follow-up session'),
(7, 3, '2024-12-18', '14:00:00', 45, 'consultation', 'scheduled', 'in_person', 'Medication review'),
(8, 4, '2024-12-20', '15:30:00', 90, 'therapy', 'scheduled', 'in_person', 'Family therapy session'),
(9, 5, '2024-12-16', '11:00:00', 60, 'consultation', 'scheduled', 'video', 'Initial CBT assessment'),
(6, 2, '2024-11-01', '10:00:00', 60, 'therapy', 'completed', 'video', 'Discussed coping strategies'),
(7, 3, '2024-10-15', '14:00:00', 30, 'follow_up', 'completed', 'in_person', 'Medication adjustment');

-- Insert prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, prescription_date, valid_until, status, notes) VALUES
(6, 2, 6, '2024-11-01', '2024-12-31', 'active', 'Continue current treatment plan'),
(7, 3, 7, '2024-10-15', '2025-01-15', 'active', 'Adjusted medication dosage'),
(9, 5, NULL, '2024-11-05', '2024-12-05', 'active', 'Initial treatment plan');

-- Insert prescription items
INSERT INTO prescription_items (prescription_id, item_type, item_name, dosage, frequency, duration, instructions) VALUES
(1, 'medication', 'Sertraline', '50mg', 'Once daily', '90 days', 'Take in the morning with food'),
(1, 'exercise', 'Deep Breathing Exercise', NULL, 'Twice daily', '30 days', '5 minutes of deep breathing when feeling anxious'),
(1, 'therapy', 'Cognitive Restructuring', NULL, 'As needed', 'Ongoing', 'Practice identifying and challenging negative thoughts'),
(2, 'medication', 'Escitalopram', '20mg', 'Once daily', '90 days', 'Take at bedtime'),
(2, 'lifestyle', 'Sleep Hygiene', NULL, 'Daily', 'Ongoing', 'Maintain regular sleep schedule, avoid screens 1 hour before bed'),
(3, 'therapy', 'Exposure Therapy Exercises', NULL, 'Three times weekly', '60 days', 'Gradual exposure to social situations, start with low-anxiety scenarios');

-- Insert support groups
INSERT INTO support_groups (name, description, facilitator_id, group_type, focus_area, max_members, meeting_schedule, meeting_mode, location, meeting_link, is_active) VALUES
('Anxiety Support Circle', 'A safe space for individuals dealing with anxiety disorders to share experiences and coping strategies', 2, 'support', 'Anxiety Disorders', 15, '{"day": "Tuesday", "time": "18:00", "frequency": "weekly"}', 'hybrid', 'Dhanmondi, Dhaka', 'https://meet.mindbridge.com/anxiety-support', TRUE),
('Depression Recovery Group', 'Supporting each other through depression with professional guidance', 3, 'therapy', 'Depression', 12, '{"day": "Thursday", "time": "17:00", "frequency": "weekly"}', 'online', NULL, 'https://meet.mindbridge.com/depression-recovery', TRUE),
('Mindfulness & Wellness', 'Learn and practice mindfulness techniques for mental wellness', 4, 'educational', 'Mindfulness', 20, '{"day": "Saturday", "time": "10:00", "frequency": "biweekly"}', 'in_person', 'Banani, Dhaka', NULL, TRUE),
('PTSD Peer Support', 'Peer-led support group for PTSD survivors', 5, 'peer', 'PTSD', 10, '{"day": "Monday", "time": "19:00", "frequency": "weekly"}', 'hybrid', 'Mohakhali, Dhaka', 'https://meet.mindbridge.com/ptsd-support', TRUE);

-- Insert support group members
INSERT INTO support_group_members (group_id, user_id, role, status) VALUES
(1, 6, 'member', 'active'),
(1, 9, 'member', 'active'),
(2, 7, 'member', 'active'),
(3, 6, 'member', 'active'),
(3, 7, 'member', 'active'),
(3, 9, 'member', 'active'),
(4, 8, 'member', 'active');

-- Note: Password hashes in this file are placeholders
-- In production, use bcrypt to generate proper password hashes
-- Example password for testing: "Password123!"

@echo off
echo Adding salary and bonus fields to doctor_profiles table...
echo.

cd ..
node database/migrate-salary.js

echo.
pause

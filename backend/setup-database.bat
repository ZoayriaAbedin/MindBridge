@echo off
echo ========================================
echo MindBridge Database Setup Script
echo ========================================
echo.

REM Check for XAMPP MySQL
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo Found XAMPP MySQL installation
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
    goto :setup
)

REM Check for MySQL in Program Files
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    echo Found MySQL Server 8.0 installation
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
    goto :setup
)

if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
    echo Found MySQL Server 5.7 installation
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe
    goto :setup
)

echo ERROR: MySQL not found!
echo.
echo Please install one of the following:
echo   1. XAMPP - https://www.apachefriends.org/
echo   2. MySQL Server - https://dev.mysql.com/downloads/mysql/
echo.
echo After installation, run this script again.
pause
exit /b 1

:setup
echo.
echo MySQL found at: %MYSQL_PATH%
echo.

REM Get MySQL password
set /p MYSQL_PASSWORD="Enter your MySQL root password (press Enter if empty): "

echo.
echo Creating database...
echo.

if "%MYSQL_PASSWORD%"=="" (
    "%MYSQL_PATH%" -u root -e "CREATE DATABASE IF NOT EXISTS mindbridge_db;"
) else (
    "%MYSQL_PATH%" -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS mindbridge_db;"
)

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database. Check your password and try again.
    pause
    exit /b 1
)

echo Database created successfully!
echo.
echo Importing schema...
echo.

if "%MYSQL_PASSWORD%"=="" (
    "%MYSQL_PATH%" -u root mindbridge_db < database\schema.sql
) else (
    "%MYSQL_PATH%" -u root -p%MYSQL_PASSWORD% mindbridge_db < database\schema.sql
)

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to import schema.
    pause
    exit /b 1
)

echo Schema imported successfully!
echo.

set /p IMPORT_SEED="Do you want to import sample data? (y/n): "

if /i "%IMPORT_SEED%"=="y" (
    echo.
    echo Importing sample data...
    echo.
    
    if "%MYSQL_PASSWORD%"=="" (
        "%MYSQL_PATH%" -u root mindbridge_db < database\seed.sql
    ) else (
        "%MYSQL_PATH%" -u root -p%MYSQL_PASSWORD% mindbridge_db < database\seed.sql
    )
    
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Failed to import sample data.
        echo You can import it manually later.
    ) else (
        echo Sample data imported successfully!
    )
)

echo.
echo ========================================
echo Database setup completed!
echo ========================================
echo.
echo Database name: mindbridge_db
echo.
echo Don't forget to update your .env file with:
echo   DB_HOST=localhost
echo   DB_USER=root
if "%MYSQL_PASSWORD%"=="" (
    echo   DB_PASSWORD=
) else (
    echo   DB_PASSWORD=%MYSQL_PASSWORD%
)
echo   DB_NAME=mindbridge_db
echo.
echo You can now run: npm run dev
echo.
pause

@echo off
echo ========================================
echo Car Rental Database Setup
echo ========================================
echo.

echo This script will:
echo 1. Drop existing database (if any)
echo 2. Create fresh database
echo 3. Import schema with lowercase tables
echo 4. Insert sample data
echo.

set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Setup cancelled.
    exit /b
)

echo.
echo Setting up database...
echo.

REM Get MySQL credentials
set /p MYSQL_USER="MySQL Username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASS="MySQL Password: "

echo.
echo Creating database...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "DROP DATABASE IF EXISTS car; CREATE DATABASE car CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create database!
    echo Please check your MySQL credentials and try again.
    pause
    exit /b 1
)

echo.
echo Importing schema...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% car < schema_lowercase.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to import schema!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Database setup complete.
echo ========================================
echo.
echo Database: car
echo Tables created (lowercase):
echo   - systemadmins
echo   - customers
echo   - vehicles
echo   - documents
echo   - rentals
echo   - payments
echo   - maintenance
echo   - systemsettings
echo.
echo Default Admin User:
echo   Username: admin
echo   Password: admin123
echo.
echo Sample Data:
echo   - 3 vehicles
echo   - 2 customers
echo.
echo Next Steps:
echo 1. Run: npm run dev
echo 2. Reload frontend (press 'r' in Expo)
echo.
pause

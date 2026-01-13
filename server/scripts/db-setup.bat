@echo off
REM Database setup script for Qurilish (Windows)

set DB_USER=postgres
set DB_NAME=qurilish_db
set SCRIPT_DIR=%~dp0

echo.
echo ================================
echo  Qurilish Database Setup
echo ================================
echo.
echo Select an option:
echo 1) Create database
echo 2) Initialize schema
echo 3) Reset database (drop tables and recreate)
echo 4) Drop database
echo 5) Full setup (create + initialize)
echo 6) Exit
echo.

set /p choice="Enter choice [1-6]: "

if "%choice%"=="1" goto create_db
if "%choice%"=="2" goto init_schema
if "%choice%"=="3" goto reset_db
if "%choice%"=="4" goto drop_db
if "%choice%"=="5" goto full_setup
if "%choice%"=="6" goto exit_script
echo Invalid option
goto end

:create_db
echo Creating database: %DB_NAME%
psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
if %errorlevel% equ 0 (
    echo Database created successfully
) else (
    echo Database may already exist or creation failed
)
goto end

:init_schema
echo Initializing database schema...
psql -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%..\database\init.sql"
if %errorlevel% equ 0 (
    echo Schema initialized successfully
) else (
    echo Schema initialization failed
)
goto end

:reset_db
echo Resetting database...
psql -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%..\database\reset-db.sql"
echo Database reset
goto init_schema

:drop_db
echo WARNING: This will delete all data!
set /p confirm="Are you sure you want to drop %DB_NAME%? (yes/no): "
if "%confirm%"=="yes" (
    psql -U %DB_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
    echo Database dropped
) else (
    echo Operation cancelled
)
goto end

:full_setup
call :create_db
call :init_schema
goto end

:exit_script
echo Goodbye!
goto end

:end
echo.
echo Done!
pause

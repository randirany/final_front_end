@echo off
REM Deployment script for Insurance Management System Frontend (Windows)
REM Usage: deploy.bat [environment]
REM Example: deploy.bat production

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

set IMAGE_NAME=insurance-frontend
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set mytime=%%a%%b)
set VERSION=%mydate%-%mytime%

echo ======================================
echo Deploying Insurance Frontend
echo Environment: %ENVIRONMENT%
echo Version: %VERSION%
echo ======================================

REM Check if .env file exists
if exist ".env.%ENVIRONMENT%" (
    echo Loading environment variables from .env.%ENVIRONMENT%
    for /f "usebackq tokens=*" %%a in (".env.%ENVIRONMENT%") do (
        set "%%a"
    )
) else (
    echo Warning: .env.%ENVIRONMENT% not found, using defaults
)

REM Build the Docker image
echo Building Docker image...
docker build --build-arg VITE_API_URL=%VITE_API_URL% -t %IMAGE_NAME%:%VERSION% -t %IMAGE_NAME%:latest .

if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo Build completed successfully!

REM Stop and remove existing container
echo Stopping existing container...
docker-compose down 2>nul

REM Start the new container
echo Starting new container...
docker-compose up -d

if %errorlevel% neq 0 (
    echo Failed to start container!
    exit /b %errorlevel%
)

REM Wait for container to start
echo Waiting for application to be healthy...
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps | findstr %IMAGE_NAME% >nul
if %errorlevel% equ 0 (
    echo ======================================
    echo Deployment successful!
    echo Application is running at: http://localhost:3000
    echo ======================================

    echo.
    echo Recent logs:
    docker-compose logs --tail=20
) else (
    echo ======================================
    echo Deployment failed!
    echo ======================================
    docker-compose logs
    exit /b 1
)

echo.
echo Deployment complete!
endlocal

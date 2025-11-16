@echo off
echo ========================================
echo   Firebase Deployment Script
echo ========================================
echo.

echo Step 1: Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b %errorlevel%
)
echo Build completed successfully!
echo.

echo Step 2: Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 (
    echo Deployment failed! Please check your Firebase configuration.
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Your app is now live on Firebase Hosting!
echo Check Firebase Console for the URL.
echo.
pause

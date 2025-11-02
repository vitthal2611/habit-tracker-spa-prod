@echo off
echo Building production version...
call npm run build

echo.
echo Deploying to Firebase...
call firebase deploy --only hosting

echo.
echo Deployment complete!
echo Your app is available at: https://habit-tracker-spa-prod.web.app
pause
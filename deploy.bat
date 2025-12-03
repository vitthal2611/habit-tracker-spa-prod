@echo off
echo Building the app...
npm run build

echo Deploying to Firebase...
firebase deploy

echo Deployment complete!
pause
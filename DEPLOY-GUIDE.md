# Firebase Deployment Guide

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

## Deployment Steps

### 1. Build the app
```bash
npm run build
```

### 2. Deploy to Firebase
```bash
firebase deploy
```

### 3. Alternative: Use the deploy script
```bash
deploy.bat
```

## Your Firebase Project
- Project ID: `habit-tracker-spa-prod`
- Hosting URL: `https://habit-tracker-spa-prod.web.app`

## Troubleshooting
If deployment fails:
1. Check if you're logged in: `firebase login:list`
2. Verify project: `firebase use --add`
3. Check build folder exists: `dir dist`

## Manual Steps Required
1. Open terminal/command prompt
2. Navigate to project folder
3. Run: `firebase login` (this will open browser)
4. Run: `npm run build`
5. Run: `firebase deploy`

Your app will be live at: https://habit-tracker-spa-prod.web.app
# Firebase Deployment Guide 🚀

## Quick Deploy

### Option 1: Using Batch Script (Windows)
```bash
deploy-firebase.bat
```

### Option 2: Using NPM Script
```bash
npm run deploy
```

### Option 3: Manual Steps
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy
```

## First Time Setup

### 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not done)
```bash
firebase init
```
Select:
- Hosting
- Firestore
- Use existing project
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deploys: `No`

## Deploy Only Hosting
```bash
npm run deploy:hosting
```

## Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Verify Deployment

1. Check the deployment URL in terminal output
2. Visit Firebase Console: https://console.firebase.google.com
3. Go to Hosting section to see your live URL
4. Test the app functionality

## Rollback (if needed)
```bash
firebase hosting:rollback
```

## Common Issues

### Build Fails
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript/ESLint errors
- Clear cache: `npm run build -- --force`

### Deploy Fails
- Ensure you're logged in: `firebase login`
- Check project ID: `firebase projects:list`
- Verify firebase.json configuration

### App Not Loading
- Check browser console for errors
- Verify Firebase config in src/firebase.js
- Check Firestore security rules

## Production Checklist

- [ ] Environment variables set
- [ ] Firebase config updated
- [ ] Firestore rules deployed
- [ ] Build successful
- [ ] Deployment successful
- [ ] App tested on live URL
- [ ] Authentication working
- [ ] Data persistence working

## Monitoring

After deployment, monitor:
- Firebase Console > Hosting > Usage
- Firebase Console > Firestore > Usage
- Firebase Console > Authentication > Users

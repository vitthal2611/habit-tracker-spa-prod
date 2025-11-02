# Firebase Deployment Instructions

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Have a Google account for Firebase

## Deployment Steps

### 1. Login to Firebase
```bash
firebase login
```

### 2. Create Firebase Project
```bash
firebase projects:create habit-tracker-spa-prod
```
Or use the Firebase Console: https://console.firebase.google.com

### 3. Initialize Firebase (if needed)
```bash
firebase init hosting
```
- Select existing project: `habit-tracker-spa-prod`
- Public directory: `dist`
- Single-page app: `Yes`
- Overwrite index.html: `No`

### 4. Build and Deploy
```bash
npm run deploy
```

Or manually:
```bash
npm run build
firebase deploy --only hosting
```

## Project Configuration
- **Project ID**: habit-tracker-spa-prod
- **Public Directory**: dist
- **Build Command**: npm run build
- **Deploy Command**: npm run deploy

## Production Features
- ✅ Optimized build with code splitting
- ✅ Minified and compressed assets
- ✅ SEO meta tags
- ✅ PWA-ready structure
- ✅ Cache headers for static assets
- ✅ SPA routing support

## Post-Deployment
After deployment, your app will be available at:
`https://habit-tracker-spa-prod.web.app`

## Custom Domain (Optional)
To add a custom domain:
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration steps
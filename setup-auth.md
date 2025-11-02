# Enable Email/Password Authentication

## Steps to Enable Authentication:

1. **Go to Firebase Console**: 
   https://console.firebase.google.com/project/habit-tracker-spa-prod/authentication/providers

2. **Enable Email/Password**:
   - Click "Email/Password" provider
   - Toggle "Enable" switch
   - Click "Save"

3. **Deploy the app**:
   ```bash
   npm run build && firebase deploy
   ```

## Authentication Flow:
- Users must sign up/login with email and password
- Each user gets isolated habit data in Firestore
- Logout button in navigation
- Secure user-specific data access

After enabling Email/Password authentication in Firebase Console, the app will work properly.
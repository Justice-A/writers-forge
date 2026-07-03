# Firestore Security Rules

Copy and paste these rules into your Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to access only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Collections under user's document
      match /{collection=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Add Rules to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database
3. Click "Rules" tab at the top
4. Replace the default rules with the rules above
5. Click "Publish"

## What These Rules Do

- ✅ Users can read/write data under `users/{their-uid}/characters`, `users/{their-uid}/scenes`, etc.
- ✅ Users can ONLY access their own data (not other users')
- ✅ No unauthenticated access to user data
- ✅ Denies all other access patterns

## Testing Locally

1. Fill in `.env.local` with your Firebase config
2. Run `npm run dev`
3. Visit `http://localhost:3000/auth`
4. Sign up with a test email
5. Add a character/scene/timeline/outline item
6. Check Firebase Console → Firestore → Data to see your data in `users/{uid}/{collection}`
7. Sign out and sign in as a different user
8. Verify you can't see the first user's data

Done! Rules are set and app is ready to test.

# Firebase Console setup for Phase 2

Before switching AutoTeams to Firebase Auth:

## 1. Enable Google Authentication

Firebase Console:

```text
Authentication
→ Sign-in method
→ Google
→ Enable
```

Choose the support email and save.

## 2. Add authorised domains

For local development Firebase normally permits:

```text
localhost
```

For Vercel, add your deployment domains under:

```text
Authentication
→ Settings
→ Authorised domains
```

For example:

```text
your-app.vercel.app
```

## 3. Firestore

Create a Firestore database if one does not already exist.

Phase 2 writes authenticated users into:

```text
users/{uid}
```

and prepares workspace membership documents under:

```text
workspaceMemberships/{workspaceId_userId}
```

## 4. Keep storage local

For this phase:

```env
AUTOTEAMS_STORAGE_ENGINE=local
```

## 5. Test Firebase Auth

When ready, temporarily set:

```env
AUTOTEAMS_AUTH_PROVIDER=firebase
```

Restart Next.js and open:

```text
http://localhost:3000/firebase-auth-test
```

Sign in with Google.

After testing, you can switch back to:

```env
AUTOTEAMS_AUTH_PROVIDER=local
```

until the main AuthProvider migration is completed.

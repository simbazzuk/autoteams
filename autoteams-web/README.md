# AutoTeams Next.js v3

This v3 package is designed for your existing root-level Next.js structure:

```text
autoteams-web/
├── app/
├── components/
├── lib/
├── public/
└── package.json
```

## Features

- Firebase email/password registration and login
- Google sign-in
- Email verification message
- Password reset
- Sign out
- Protected dashboard
- Cloud Firestore Team Persona storage
- Create, view, edit and delete Team Personas
- User-scoped Firestore security rules

## 1. Install Firebase

From `autoteams-web`:

```powershell
npm install firebase
```

## 2. Copy the v3 files

Copy these folders/files into `autoteams-web`:

```text
app/
components/
lib/
.env.local.example
firestore.rules
firebase.json
```

Replace existing files when prompted.

## 3. Create the Firebase project

1. Open the Firebase Console.
2. Create or select a project.
3. Add a Web App.
4. Copy the Firebase web configuration.
5. Enable Authentication providers:
   - Email/Password
   - Google
6. Create a Cloud Firestore database.
7. Start in Production mode.

## 4. Configure environment variables

Copy:

```text
.env.local.example
```

to:

```text
.env.local
```

Then enter the values from Firebase.

Do not commit `.env.local`.

## 5. Apply Firestore rules

In the Firebase Console:

```text
Firestore Database → Rules
```

Paste the contents of `firestore.rules`, then publish.

Alternatively, after installing and configuring the Firebase CLI:

```powershell
firebase deploy --only firestore:rules
```

## 6. Run locally

```powershell
npm run dev
```

Test:

```text
/signup
/login
/forgot-password
/register
/dashboard
```

## 7. Add Vercel environment variables

In Vercel:

```text
Project → Settings → Environment Variables
```

Add every `NEXT_PUBLIC_FIREBASE_*` value, then redeploy.

## 8. Commit

From the repository root:

```powershell
git add .
git commit -m "Add Firebase authentication and Firestore personas"
git push
```

## Important

This is an MVP implementation. Before collecting real personal or sensitive data, complete a privacy review, define retention rules, validate security rules, and add appropriate legal notices.


# v4 — AI Team Intelligence

## New features

- `/intelligence` — natural-language profile analysis
- Gemini-powered Team DNA creation
- Safe deterministic demo fallback when no Gemini key is configured
- `/matches` — rules-based, explainable team recommendations
- Candidate compatibility scoring across:
  - goals
  - availability
  - interests or skills
  - location
  - complementary Team DNA
  - trust level
- Explainable reasons and cautions for each match
- Dashboard links to Team DNA and matching

## Install the Gemini SDK

```powershell
npm install @google/genai
```

Firebase remains required:

```powershell
npm install firebase
```

## Gemini configuration

Create a Gemini API key and add this to `.env.local`:

```text
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` is server-side only. Do not prefix it with `NEXT_PUBLIC`.

Add the same server-side variables to Vercel before deploying.

## Test journey

```text
/login
→ /intelligence
→ create Team DNA
→ /matches
→ change scenario and review recommendations
```

The matching engine is intentionally deterministic and explainable. Gemini is used
for profile understanding, not as the final matching decision-maker.

## Production note

The v4 API route is an MVP. Before public launch, validate authenticated Firebase
ID tokens server-side, add rate limiting, structured audit logs, consent controls,
model evaluation and abuse protection.

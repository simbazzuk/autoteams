# AutoTeams v4.0 Phase 3 setup

## 1. Apply the Phase 3 Firestore rules

The patch contains:

```text
FIRESTORE_RULES_PHASE3.txt
```

Review the rules and apply them to your Firebase project before migration.

## 2. Keep Firebase Authentication enabled

Use:

```env
AUTOTEAMS_AUTH_PROVIDER=firebase
NEXT_PUBLIC_AUTOTEAMS_AUTH_PROVIDER=firebase
```

## 3. Keep the main storage engine local

For this controlled migration phase:

```env
AUTOTEAMS_STORAGE_ENGINE=local
NEXT_PUBLIC_AUTOTEAMS_STORAGE_ENGINE=local
```

The migration page talks to Firestore explicitly. Existing AutoTeams screens
still use their current local data.

## 4. Start AutoTeams

```powershell
npm run dev
```

## 5. Sign in

Confirm the top-right account menu shows your Firebase/Google account.

## 6. Open the migration page

```text
http://localhost:3000/firebase-workspace-migration
```

The page should show your current local workspace count.

## 7. Run migration

Click:

```text
Migrate Workspaces to Firestore
```

The migration is idempotent for workspaces owned by the same Firebase user.

It creates:

```text
workspaces/{workspaceId}

workspaceMemberships/{workspaceId_userId}

userPreferences/{userId}

migrationStatus/{userId}
```

## 8. Verify Firestore

In Firebase Console confirm the documents exist.

The migration does NOT delete localStorage data.

## 9. Do not switch storage yet

Leave:

```env
AUTOTEAMS_STORAGE_ENGINE=local
```

Phase 4 will migrate people and then introduce a safe cloud-data cutover.

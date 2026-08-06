# AutoTeams v11.5 — Registration, Privacy & Security

## Scope

This release improves the account and profile journey before the planned Cloud
Edition.

## Registration

- Stronger 10-character password policy
- Password confirmation and strength indicator
- Mandatory 18+ confirmation
- Mandatory Terms acceptance
- Mandatory Privacy Notice acknowledgement
- Separate optional marketing consent
- Email verification remains handled by Firebase Authentication
- New users continue to `/onboarding/profile`

## Workspace-aware profiles

- Business
- Friendship
- Community
- Sports
- Education

Business profiles avoid age and gender. Social profiles offer optional age
range and gender fields with `Prefer not to say`.

## Consent

- Workspace profile visibility
- Team DNA matching
- Aggregated insights
- Profile-photo visibility
- Friendship discovery

## Security

- Functional email-verification resend and refresh
- Security preferences and role-based MFA policy
- TOTP recommended for privileged roles
- MFA enrolment is deliberately not simulated
- Actual MFA requires Firebase Authentication with Identity Platform to be
  enabled and configured

## Privacy

- Privacy Centre
- Download local registration data
- Delete local registration profile
- Draft Terms page
- Atlas sensitive-characteristic protection statement

## Test routes

- `/signup`
- `/onboarding/profile`
- `/security`
- `/privacy`
- `/terms`
- `/settings`
- `/getting-started`

## Important

The profile and security-policy preferences in this release are stored in local
browser storage for testing. Firebase Authentication and the existing user
document remain active. The Cloud Edition should move all profile and consent
records to Firestore and enforce access server-side.

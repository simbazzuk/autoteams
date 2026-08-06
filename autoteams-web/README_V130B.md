# AutoTeams v13.0b — Privacy & Security Centre

## New routes

- `/profile/privacy`
- `/profile/security`

## Profile Privacy

- Select a contextual profile
- Private, workspace or discovery visibility
- Atlas matching consent
- Aggregated-insights consent
- Profile-photo visibility
- Discovery consent
- Searchability
- Optional future research consent
- Business discovery disabled
- Sensitive-characteristic protection statement

## Profile Security

- Firebase email-verification controls
- Security alerts and email preferences
- Trusted-device notification preference
- Session timeout preference
- MFA policy readiness
- Authenticator app recommended
- SMS shown only as a potential fallback
- Local session overview and placeholder for server logging

## Important

Actual MFA is not enabled or simulated. Firebase Authentication with Identity
Platform must be reviewed and configured before TOTP or SMS enrolment and
enforcement are added.

Session and privacy preferences remain stored locally in this test release.

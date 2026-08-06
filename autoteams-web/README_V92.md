# AutoTeams v9.2 — Roles, Invitations & Consent

## New capabilities

- Workspace roles:
  - Owner
  - Administrator
  - Team Leader
  - Team Member
- Friendship/community-friendly role labels:
  - Group Owner
  - Group Organiser
  - Activity Organiser
  - Member
- Role-based restrictions for workspace and team creation
- Member invitation creation and revocation
- Per-member Team DNA consent controls
- Team Builder excludes people who disable matching consent
- Test-role simulator for trying Owner, Team Leader and Team Member views
- Members & Roles page at `/members`

## Recommended test

1. Open `/members`.
2. Use **Test as** to switch between Owner, Team Leader and Team Member.
3. As Owner, create a member invitation and assign a role.
4. Change a member role.
5. As Team Member, confirm invitation controls are restricted.
6. Change matching consent.
7. Open `/team-builder`.
8. As Team Member, confirm team creation is blocked.
9. Switch to Team Leader or Owner and create a team.
10. Open `/workspaces` and confirm only the Owner can create workspaces.

## Prototype storage

Roles, invitations and consent are currently stored in browser local
storage for testing. A production version should store these records in
Firestore and enforce permissions with Firestore Security Rules and
server-side authorization.

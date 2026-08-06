# AutoTeams v10.0 — Workspace Ownership Flow

## Main changes

- Removed the normal-screen `Test as` role simulator.
- The current signed-in account determines workspace permissions.
- The creator of a workspace automatically becomes its Owner.
- Invited users inherit the role assigned by the Owner or Administrator.
- Redesigned Create Workspace screen:
  - Wider panel
  - Better form spacing
  - Visual workspace-type cards
  - Clear ownership explanation
  - Correctly sized inputs and textarea
  - Responsive layout
- Personal workspaces support friendship, community and social groups.
- Organisation workspaces support employees, departments and Team Leaders.

## Registration and workspace flow

1. User registers.
2. User creates their first workspace.
3. AutoTeams assigns the user the Owner role.
4. Owner invites people and assigns roles.
5. Members accept invitations and control Team DNA consent.
6. Team Leaders build teams from eligible members.

## Test

1. Open `/workspaces`.
2. Enter a workspace name.
3. Select Organisation or Personal/Friendship Group.
4. Add a description.
5. Select `Create Workspace and Become Owner`.
6. Confirm the new workspace becomes active.
7. Open `/members`.
8. Invite members and assign roles.
9. Open `/team-builder`.
10. Confirm the signed-in Owner can build a team.

## Prototype note

Workspace ownership and access are still stored in browser local storage
for testing. A production implementation should use Firebase Authentication,
Firestore memberships and server-enforced authorization.

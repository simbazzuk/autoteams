# AutoTeams v13.0d TypeScript Hotfix

## Fixed

- Replaced stale `AppNotification` usage with `NotificationRecord`.
- Updated notification fields from `text` and `time` to `message` and `createdAt`.
- Updated notification icons to the current notification types.
- Aligned workspace roles with the existing `WorkspaceRole` union:
  - `owner`
  - `admin`
  - `leader`
  - `member`
- Updated role dropdown values and Team Leader counts.
- Member removal now removes the membership entry instead of assigning an unsupported `removed` status.

## Files changed

- `components/notifications/NotificationCentre.tsx`
- `components/profile/WorkspaceMembershipDashboard.tsx`

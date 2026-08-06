# AutoTeams v9.0 — Workspaces & People

## New routes
- `/workspaces`
- `/people`
- `/talent-pools`
- `/team-builder` updated for workspace-scoped selection

## Test sequence
1. Open Workspaces and select `Example Company`.
2. Open People and add or remove employees.
3. Create a Talent Pool.
4. Open Team Builder.
5. Choose the active workspace, department or talent pool.
6. Optionally restrict eligible candidates manually.
7. Ask Atlas to build the team.

The prototype stores workspace data in browser local storage. It does not search or select users outside the active workspace. Firebase Authentication, Firestore personas and Gemini profile analysis are unchanged.

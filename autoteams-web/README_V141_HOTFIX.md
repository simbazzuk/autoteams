# AutoTeams v14.1 Hotfix

Corrected the Home page workspace import:

- Replaced `loadPools` with `loadTalentPools`
- Updated the corresponding function call

This resolves the Next.js/Turbopack missing-export build failure in:

- `components/home/HomeExperience.tsx`

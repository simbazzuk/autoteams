# AutoTeams v8.0 — Atlas Experience

**Build Teams That Work**

**Powered by Atlas**

*Explainable AI for better team decisions.*

## New in v8.0

- Founding Members programme page
- Early Access homepage banner
- About AutoTeams page
- Public product roadmap
- Founding Members navigation and footer links
- Free Beta and future pricing messaging
- Existing Atlas, Team DNA, Team Builder, Team Canvas, Matches and Insights retained

## New routes

- `/founding-members`
- `/about`
- `/roadmap`

## Existing product routes

- `/dashboard`
- `/atlas`
- `/team-dna`
- `/team-builder`
- `/team-canvas`
- `/matches`
- `/insights`
- `/notifications`
- `/settings`
- `/trust-centre`

## Install

Copy this release over the existing `autoteams-web` project. Keep the existing:

- `.env.local`
- `package.json`
- `package-lock.json`
- Vercel environment variables

Then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

No MCP functionality is included.
No new npm packages are required.

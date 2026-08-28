export const appConfig = {
  name: "AutoTeams",
  version:
    process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    "1.0.0",
} as const;
export type RecommendationEngine =
  | "deterministic"
  | "gemini";

export type StorageEngine =
  | "local"
  | "firebase";

export type AuthProvider =
  | "local"
  | "firebase";

export type AutoTeamsRuntimeConfig = {
  recommendationEngine: RecommendationEngine;
  storageEngine: StorageEngine;
  authProvider: AuthProvider;
};

export function getAutoTeamsRuntimeConfig(): AutoTeamsRuntimeConfig {
  return {
    recommendationEngine: readRecommendationEngine(),
    storageEngine: readStorageEngine(),
    authProvider: readAuthProvider(),
  };
}

export function readRecommendationEngine(): RecommendationEngine {
  const configured =
    process.env.AUTOTEAMS_RECOMMENDATION_ENGINE
      ?.trim()
      .toLowerCase();

  return configured === "gemini"
    ? "gemini"
    : "deterministic";
}

export function readStorageEngine(): StorageEngine {
  const configured =
    (
      process.env.NEXT_PUBLIC_AUTOTEAMS_STORAGE_ENGINE ||
      process.env.AUTOTEAMS_STORAGE_ENGINE
    )
      ?.trim()
      .toLowerCase();

  return configured === "firebase"
    ? "firebase"
    : "local";
}

export function readAuthProvider(): AuthProvider {
  const configured =
    (
      process.env.NEXT_PUBLIC_AUTOTEAMS_AUTH_PROVIDER ||
      process.env.AUTOTEAMS_AUTH_PROVIDER
    )
      ?.trim()
      .toLowerCase();

  return configured === "firebase"
    ? "firebase"
    : "local";
}

export function validateAutoTeamsRuntimeConfig(): void {
  const config = getAutoTeamsRuntimeConfig();

  if (
    config.storageEngine === "firebase" ||
    config.authProvider === "firebase"
  ) {
    validateFirebasePublicConfig();
  }
}

function validateFirebasePublicConfig(): void {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;

  const missing = required.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      [
        "Firebase is enabled but required Firebase configuration is missing.",
        `Missing: ${missing.join(", ")}`,
      ].join(" "),
    );
  }
}

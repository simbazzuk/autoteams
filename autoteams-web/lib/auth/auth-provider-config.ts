import {
  readAuthProvider,
  type AuthProvider,
} from "@/lib/config/autoteams-config";

export type AuthProviderStatus = {
  provider: AuthProvider;
  productionReady: boolean;
};

export function getAuthProviderStatus(): AuthProviderStatus {
  const provider = readAuthProvider();

  if (provider === "firebase") {
    return {
      provider,
      productionReady: false,
    };
  }

  return {
    provider: "local",
    productionReady: false,
  };
}

/**
 * Firebase Auth wiring is intentionally introduced in the next phase.
 * This prevents switching the environment variable before the AuthProvider
 * implementation exists.
 */
export function assertAuthProviderReady(): void {
  const provider = readAuthProvider();

  if (provider === "firebase") {
    throw new Error(
      "Firebase auth is selected but Firebase Auth wiring has not been enabled yet. Install AutoTeams v4.0 Phase 1 before using AUTOTEAMS_AUTH_PROVIDER=firebase.",
    );
  }
}

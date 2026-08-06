export type ProfileMode =
  | "business"
  | "friendship"
  | "community"
  | "sports"
  | "education";

export type RegistrationProfile = {
  mode: ProfileMode;
  preferredName: string;
  generalLocation: string;
  jobTitle: string;
  department: string;
  experienceLevel: string;
  ageRange: string;
  gender: string;
  interests: string[];
  photoVisible: boolean;
  profileVisible: boolean;
  allowTeamMatching: boolean;
  allowAggregatedInsights: boolean;
  allowFriendshipDiscovery: boolean;
  marketingConsent: boolean;
  updatedAt: string;
};

export type SecurityPreferences = {
  requireMfaForPrivilegedRoles: boolean;
  signInAlerts: boolean;
  securityEmails: boolean;
  sessionTimeoutMinutes: number;
};

const PROFILE_KEY = "autoteams-registration-profile";
const SECURITY_KEY = "autoteams-security-preferences";

export const defaultRegistrationProfile: RegistrationProfile = {
  mode: "business",
  preferredName: "",
  generalLocation: "",
  jobTitle: "",
  department: "",
  experienceLevel: "",
  ageRange: "",
  gender: "Prefer not to say",
  interests: [],
  photoVisible: false,
  profileVisible: true,
  allowTeamMatching: true,
  allowAggregatedInsights: true,
  allowFriendshipDiscovery: false,
  marketingConsent: false,
  updatedAt: "",
};

export const defaultSecurityPreferences: SecurityPreferences = {
  requireMfaForPrivilegedRoles: true,
  signInAlerts: true,
  securityEmails: true,
  sessionTimeoutMinutes: 60,
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadRegistrationProfile(): RegistrationProfile {
  return readLocal(PROFILE_KEY, defaultRegistrationProfile);
}

export function saveRegistrationProfile(profile: RegistrationProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function deleteRegistrationProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}

export function loadSecurityPreferences(): SecurityPreferences {
  return readLocal(SECURITY_KEY, defaultSecurityPreferences);
}

export function saveSecurityPreferences(
  preferences: SecurityPreferences,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SECURITY_KEY, JSON.stringify(preferences));
}

export function exportRegistrationData(): string {
  return JSON.stringify(
    {
      profile: loadRegistrationProfile(),
      securityPreferences: loadSecurityPreferences(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

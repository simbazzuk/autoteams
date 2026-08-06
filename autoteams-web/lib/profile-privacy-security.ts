export type ProfilePrivacySettings = {
  profileId: string;
  visibility: "private" | "workspace" | "discovery";
  searchable: boolean;
  allowMatching: boolean;
  allowAggregatedInsights: boolean;
  allowPhotoDisplay: boolean;
  allowDiscovery: boolean;
  allowResearch: boolean;
  updatedAt: string;
};

export type AccountSecurityState = {
  signInAlerts: boolean;
  securityEmails: boolean;
  trustedDeviceNotifications: boolean;
  sessionTimeoutMinutes: number;
  mfaPolicyAccepted: boolean;
  updatedAt: string;
};

export type SessionRecord = {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
};

const PRIVACY_KEY = "autoteams-profile-privacy-settings";
const SECURITY_KEY = "autoteams-account-security-state";
const SESSIONS_KEY = "autoteams-session-records";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadPrivacySettings(): ProfilePrivacySettings[] {
  return readLocal(PRIVACY_KEY, []);
}

export function savePrivacySettings(
  settings: ProfilePrivacySettings[],
): void {
  writeLocal(PRIVACY_KEY, settings);
}

export function loadProfilePrivacy(
  profileId: string,
  defaults: Partial<ProfilePrivacySettings> = {},
): ProfilePrivacySettings {
  const existing = loadPrivacySettings().find(
    (item) => item.profileId === profileId,
  );

  return (
    existing || {
      profileId,
      visibility: "workspace",
      searchable: false,
      allowMatching: true,
      allowAggregatedInsights: true,
      allowPhotoDisplay: false,
      allowDiscovery: false,
      allowResearch: false,
      updatedAt: "",
      ...defaults,
    }
  );
}

export function upsertProfilePrivacy(
  value: ProfilePrivacySettings,
): void {
  const existing = loadPrivacySettings();
  savePrivacySettings([
    ...existing.filter((item) => item.profileId !== value.profileId),
    value,
  ]);
}

export function loadAccountSecurity(): AccountSecurityState {
  return readLocal(SECURITY_KEY, {
    signInAlerts: true,
    securityEmails: true,
    trustedDeviceNotifications: true,
    sessionTimeoutMinutes: 60,
    mfaPolicyAccepted: false,
    updatedAt: "",
  });
}

export function saveAccountSecurity(value: AccountSecurityState): void {
  writeLocal(SECURITY_KEY, value);
}

export function loadSessions(): SessionRecord[] {
  return readLocal(SESSIONS_KEY, [
    {
      id: "current-session",
      device: "Windows PC",
      browser: "Current browser",
      location: "United Kingdom",
      lastActive: new Date().toISOString(),
      current: true,
    },
  ]);
}

export function saveSessions(items: SessionRecord[]): void {
  writeLocal(SESSIONS_KEY, items);
}

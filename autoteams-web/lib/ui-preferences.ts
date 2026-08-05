export type UiPreferences = {
  appearance: "dark" | "dark";
  compactMode: boolean;
  emailNotifications: boolean;
  matchNotifications: boolean;
  aiInsightNotifications: boolean;
};

const STORAGE_KEY = "autoteams-ui-preferences";

export const defaultPreferences: UiPreferences = {
  appearance: "light",
  compactMode: false,
  emailNotifications: true,
  matchNotifications: true,
  aiInsightNotifications: true,
};

export function loadPreferences(): UiPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: UiPreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  document.documentElement.dataset.theme = preferences.appearance;
  document.documentElement.dataset.compact = preferences.compactMode ? "true" : "false";
}

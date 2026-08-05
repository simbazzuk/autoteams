export type Appearance = "light" | "dark";

export interface UiPreferences {
  appearance: Appearance;
  compactMode: boolean;
  emailNotifications: boolean;
  matchNotifications: boolean;
  aiInsightNotifications: boolean;
}

const STORAGE_KEY = "autoteams-ui-preferences";

export const defaultPreferences: UiPreferences = {
  appearance: "dark", // Default theme
  compactMode: false,
  emailNotifications: true,
  matchNotifications: true,
  aiInsightNotifications: true,
};

export function loadPreferences(): UiPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(stored) as Partial<UiPreferences>;

    return {
      ...defaultPreferences,
      ...parsed,
      appearance:
        parsed.appearance === "light" || parsed.appearance === "dark"
          ? parsed.appearance
          : defaultPreferences.appearance,
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: UiPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

  document.documentElement.dataset.theme = preferences.appearance;
  document.documentElement.dataset.compact = preferences.compactMode
    ? "true"
    : "false";
}
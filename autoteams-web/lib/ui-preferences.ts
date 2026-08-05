export type Appearance = "light" | "dark";

export type UiPreferences = {
  appearance: Appearance;
  compactMode: boolean;
  emailNotifications: boolean;
  matchNotifications: boolean;
  aiInsightNotifications: boolean;
};

const STORAGE_KEY = "autoteams-ui-preferences";

export const defaultPreferences: UiPreferences = {
  appearance: "dark",
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
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultPreferences;
    }

    const saved = JSON.parse(raw) as Partial<UiPreferences>;

    return {
      ...defaultPreferences,
      ...saved,
      appearance:
        saved.appearance === "light" || saved.appearance === "dark"
          ? saved.appearance
          : defaultPreferences.appearance,
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: UiPreferences): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences),
  );

  document.documentElement.dataset.theme = preferences.appearance;
  document.documentElement.dataset.compact =
    preferences.compactMode ? "true" : "false";
}

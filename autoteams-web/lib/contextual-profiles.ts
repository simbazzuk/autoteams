export type ContextMode =
  | "business"
  | "friendship"
  | "community"
  | "sports"
  | "education";

export type ContextualProfile = {
  id: string;
  mode: ContextMode;
  label: string;
  preferredName: string;
  generalLocation: string;
  interests: string[];
  availability: string;
  photoVisible: boolean;
  profileVisible: boolean;
  allowTeamMatching: boolean;
  allowAggregatedInsights: boolean;
  allowDiscovery: boolean;
  fields: Record<string, string | string[] | boolean>;
  createdAt: string;
  updatedAt: string;
};

const KEY = "autoteams-contextual-profiles";
const ACTIVE_KEY = "autoteams-active-contextual-profile";

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

export function loadContextualProfiles(): ContextualProfile[] {
  return readLocal(KEY, []);
}

export function saveContextualProfiles(items: ContextualProfile[]): void {
  writeLocal(KEY, items);
}

export function loadActiveContextualProfileId(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACTIVE_KEY) || "";
}

export function saveActiveContextualProfileId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function createContextualProfile(
  mode: ContextMode,
  preferredName = "",
): ContextualProfile {
  const now = new Date().toISOString();
  return {
    id: `context-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mode,
    label: contextLabel(mode),
    preferredName,
    generalLocation: "",
    interests: [],
    availability: "",
    photoVisible: false,
    profileVisible: true,
    allowTeamMatching: true,
    allowAggregatedInsights: true,
    allowDiscovery: false,
    fields: defaultFields(mode),
    createdAt: now,
    updatedAt: now,
  };
}

export function contextLabel(mode: ContextMode): string {
  const labels: Record<ContextMode, string> = {
    business: "Business profile",
    friendship: "Friendship profile",
    community: "Community profile",
    sports: "Sports profile",
    education: "Education profile",
  };
  return labels[mode];
}

export function defaultFields(
  mode: ContextMode,
): Record<string, string | string[] | boolean> {
  switch (mode) {
    case "business":
      return {
        jobTitle: "",
        department: "",
        experienceLevel: "",
        skills: [],
        timezone: "",
      };
    case "friendship":
      return {
        ageRange: "",
        gender: "Prefer not to say",
        preferredActivities: [],
        socialGroupSize: "",
        planningStyle: "",
      };
    case "community":
      return {
        cause: "",
        volunteerInterests: [],
        relevantExperience: "",
        preferredResponsibilities: [],
        accessibilityRequirements: "",
      };
    case "sports":
      return {
        sport: "",
        participationRole: "",
        experienceLevel: "",
        preferredPosition: "",
        competitivePreference: "",
        leadershipInterest: "",
      };
    case "education":
      return {
        educationLevel: "",
        subject: "",
        studyPreferences: [],
        projectExperience: "",
        presentationConfidence: "",
      };
  }
}

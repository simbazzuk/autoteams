export type NotificationType =
  | "atlas"
  | "workspace"
  | "team"
  | "security"
  | "profile";

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type NotificationPreferences = {
  atlasReminders: boolean;
  workspaceInvites: boolean;
  teamRecommendations: boolean;
  profileUpdates: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
};

const NOTIFICATIONS_KEY = "autoteams-notifications";
const PREFERENCES_KEY = "autoteams-notification-preferences";

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

export function loadNotifications(): NotificationRecord[] {
  const fallback: NotificationRecord[] = [
    {
      id: "notification-atlas",
      type: "atlas",
      title: "Atlas interview ready",
      message: "Continue your Business profile interview to improve confidence.",
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      read: false,
      href: "/atlas",
    },
    {
      id: "notification-workspace",
      type: "workspace",
      title: "Workspace role confirmed",
      message: "You are the Owner of the active workspace.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: false,
      href: "/profile/membership",
    },
    {
      id: "notification-team",
      type: "team",
      title: "Team recommendation available",
      message: "Atlas has generated a draft recommendation for review.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      read: true,
      href: "/teams",
    },
    {
      id: "notification-security",
      type: "security",
      title: "Review account security",
      message: "Email verification and MFA readiness can be reviewed now.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      read: true,
      href: "/profile/security",
    },
  ];

  return readLocal(NOTIFICATIONS_KEY, fallback);
}

export function saveNotifications(items: NotificationRecord[]): void {
  writeLocal(NOTIFICATIONS_KEY, items);
}

export function loadNotificationPreferences(): NotificationPreferences {
  return readLocal(PREFERENCES_KEY, {
    atlasReminders: true,
    workspaceInvites: true,
    teamRecommendations: true,
    profileUpdates: true,
    securityAlerts: true,
    weeklyDigest: false,
  });
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
): void {
  writeLocal(PREFERENCES_KEY, preferences);
}

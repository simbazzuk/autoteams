export type AppNotification = {
  id: string;
  title: string;
  text: string;
  time: string;
  type: "match" | "insight" | "profile" | "system";
  read: boolean;
};

const STORAGE_KEY = "autoteams-notifications";

export const initialNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "New high-confidence match",
    text: "A new Business candidate scored above 90% against your current profile.",
    time: "10 minutes ago",
    type: "match",
    read: false,
  },
  {
    id: "n2",
    title: "Team DNA insight ready",
    text: "Gemini has generated a new recommendation for improving collaboration.",
    time: "1 hour ago",
    type: "insight",
    read: false,
  },
  {
    id: "n3",
    title: "Profile completeness improved",
    text: "Your Business Persona is now 90% complete.",
    time: "Yesterday",
    type: "profile",
    read: true,
  },
];

export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return initialNotifications;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

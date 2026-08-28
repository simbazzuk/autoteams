"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  NotificationPreferences,
  NotificationRecord,
  loadNotificationPreferences,
  loadNotifications,
  saveNotificationPreferences,
  saveNotifications,
} from "@/lib/notifications";

export function NotificationsCentre() {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setItems(loadNotifications());
    setPreferences(loadNotificationPreferences());
  }, []);

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((item) => !item.read) : items),
    [filter, items],
  );

  const unreadCount = items.filter((item) => !item.read).length;

  function persist(next: NotificationRecord[]) {
    setItems(next);
    saveNotifications(next);
  }

  function markRead(id: string) {
    persist(
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  function markAllRead() {
    persist(items.map((item) => ({ ...item, read: true })));
  }

  function dismiss(id: string) {
    persist(items.filter((item) => item.id !== id));
  }

  function updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) {
    setPreferences((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setSaved(false);
  }

  function savePreferences() {
    if (!preferences) return;
    saveNotificationPreferences(preferences);
    setSaved(true);
  }

  return (
    <main className="notify130d-page">
      <section className="notify130d-hero">
        <div className="container notify130d-hero-row">
          <div>
            <span className="eyebrow">Notifications</span>
            <h1>Keep track of what needs your attention.</h1>
            <p>
              Review Atlas reminders, workspace changes, team recommendations
              and security updates in one place.
            </p>
          </div>

          <div className="notify130d-count">
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>
      </section>

      <section className="notify130d-body">
        <div className="container notify130d-layout">
          <section className="notify130d-main">
            <div className="notify130d-toolbar">
              <div>
                <button
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                  type="button"
                >
                  All
                </button>
                <button
                  className={filter === "unread" ? "active" : ""}
                  onClick={() => setFilter("unread")}
                  type="button"
                >
                  Unread
                </button>
              </div>

              <button
                className="button secondary"
                disabled={unreadCount === 0}
                onClick={markAllRead}
                type="button"
              >
                Mark All as Read
              </button>
            </div>

            <div className="notify130d-list">
              {visible.length ? (
                visible.map((item) => (
                  <article className={item.read ? "" : "unread"} key={item.id}>
                    <span className={`notify130d-icon ${item.type}`}>
                      {notificationIcon(item.type)}
                    </span>

                    <div>
                      <div className="notify130d-title-row">
                        <h2>{item.title}</h2>
                        {!item.read && <span>New</span>}
                      </div>
                      <p>{item.message}</p>
                      <small>{formatRelative(item.createdAt)}</small>
                    </div>

                    <div className="notify130d-actions">
                      {item.href && (
                        <Link
                          className="button secondary"
                          href={item.href}
                          onClick={() => markRead(item.id)}
                        >
                          Open
                        </Link>
                      )}
                      {!item.read && (
                        <button onClick={() => markRead(item.id)} type="button">
                          Mark read
                        </button>
                      )}
                      <button onClick={() => dismiss(item.id)} type="button">
                        Dismiss
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="notify130d-empty">
                  <h2>Nothing to review.</h2>
                  <p>Your notification list is clear.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="notify130d-side">
            <article className="notify130d-panel">
              <span className="eyebrow">Notification preferences</span>
              <h2>Choose what TeamScience.ai sends you.</h2>

              {preferences && (
                <div className="notify130d-preferences">
                  <Preference
                    title="Atlas reminders"
                    text="Profile interview and Team DNA refresh reminders."
                    checked={preferences.atlasReminders}
                    onChange={(value) =>
                      updatePreference("atlasReminders", value)
                    }
                  />
                  <Preference
                    title="Workspace invitations"
                    text="Invitations, role changes and membership updates."
                    checked={preferences.workspaceInvites}
                    onChange={(value) =>
                      updatePreference("workspaceInvites", value)
                    }
                  />
                  <Preference
                    title="Team recommendations"
                    text="Updates when Atlas generates or changes a team."
                    checked={preferences.teamRecommendations}
                    onChange={(value) =>
                      updatePreference("teamRecommendations", value)
                    }
                  />
                  <Preference
                    title="Profile updates"
                    text="Profile completion, confidence and consent changes."
                    checked={preferences.profileUpdates}
                    onChange={(value) =>
                      updatePreference("profileUpdates", value)
                    }
                  />
                  <Preference
                    title="Security alerts"
                    text="Important sign-in and permission changes."
                    checked={preferences.securityAlerts}
                    onChange={(value) =>
                      updatePreference("securityAlerts", value)
                    }
                  />
                  <Preference
                    title="Weekly digest"
                    text="A weekly summary of workspace and Atlas activity."
                    checked={preferences.weeklyDigest}
                    onChange={(value) =>
                      updatePreference("weeklyDigest", value)
                    }
                  />
                </div>
              )}

              {saved && (
                <div className="notify130d-success">
                  ✓ Notification preferences saved
                </div>
              )}

              <button
                className="button"
                onClick={savePreferences}
                type="button"
              >
                Save Preferences
              </button>
            </article>

            <article className="notify130d-panel">
              <span className="eyebrow">Quick links</span>
              <h2>Related areas</h2>
              <div className="notify130d-links">
                <Link href="/profile">My Profile <span>→</span></Link>
                <Link href="/team-dna">My Team DNA <span>→</span></Link>
                <Link href="/profile/membership">Workspace Membership <span>→</span></Link>
                <Link href="/profile/security">Profile Security <span>→</span></Link>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Preference({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function notificationIcon(type: NotificationRecord["type"]): string {
  return {
    atlas: "✦",
    workspace: "◇",
    team: "▥",
    security: "✓",
    profile: "♙",
  }[type];
}

function formatRelative(dateValue: string): string {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(dateValue).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

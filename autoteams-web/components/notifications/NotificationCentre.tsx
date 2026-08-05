"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppNotification,
  loadNotifications,
  saveNotifications,
} from "@/lib/notifications";

const icons: Record<AppNotification["type"], string> = {
  match: "◎",
  insight: "✦",
  profile: "♙",
  system: "◌",
};

export function NotificationCentre() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  const unread = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  function markAllRead() {
    const updated = notifications.map((notification) => ({ ...notification, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }

  function toggle(id: string) {
    const updated = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, read: !notification.read }
        : notification
    );
    setNotifications(updated);
    saveNotifications(updated);
  }

  return (
    <div className="notification-centre">
      <div className="notification-toolbar">
        <div>
          <span className="eyebrow">Product notifications</span>
          <h2>{unread} unread update{unread === 1 ? "" : "s"}</h2>
        </div>
        <button className="button secondary" onClick={markAllRead} type="button">
          Mark all as read
        </button>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <button
            className={`notification-row ${notification.read ? "" : "unread"}`}
            key={notification.id}
            onClick={() => toggle(notification.id)}
            type="button"
          >
            <span className={`notification-icon ${notification.type}`}>
              {icons[notification.type]}
            </span>
            <span>
              <strong>{notification.title}</strong>
              <small>{notification.text}</small>
            </span>
            <em>{notification.time}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

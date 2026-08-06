"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NotificationRecord,
  loadNotifications,
  saveNotifications,
} from "@/lib/notifications";

const icons: Record<NotificationRecord["type"], string> = {
  atlas: "✦",
  workspace: "◇",
  team: "▥",
  security: "✓",
  profile: "♙",
};

export function NotificationCentre() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

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
              <small>{notification.message}</small>
            </span>
            <em>{new Date(notification.createdAt).toLocaleString()}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

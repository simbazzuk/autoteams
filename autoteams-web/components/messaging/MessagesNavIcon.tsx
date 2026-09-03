"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  subscribeToInbox,
  type TeamScienceInboxConversation,
} from "@/lib/team-messaging";

export function MessagesNavIcon() {
  const { user } = useAuth();
  const [items, setItems] = useState<TeamScienceInboxConversation[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    return subscribeToInbox(
      user.uid,
      setItems,
      () => setItems([]),
    );
  }, [user]);

  const unread = useMemo(
    () => items.filter((item) => item.unread).length,
    [items],
  );

  const badge = unread > 9 ? "9+" : String(unread);

  return (
    <span
      className="teamscience-message-nav-icon"
      aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
      title={unread ? `${unread} unread message${unread === 1 ? "" : "s"}` : "Messages"}
    >
      <svg
        aria-hidden="true"
        className="teamscience-message-nav-svg"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5.5 6.25h13a2.25 2.25 0 0 1 2.25 2.25v7a2.25 2.25 0 0 1-2.25 2.25H11l-4.65 3.1.9-3.1H5.5A2.25 2.25 0 0 1 3.25 15.5v-7A2.25 2.25 0 0 1 5.5 6.25Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 10.25h9M7.5 13.25h6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>

      {unread > 0 && (
        <span
          className="teamscience-message-nav-badge"
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
    </span>
  );
}
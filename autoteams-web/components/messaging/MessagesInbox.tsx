"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  subscribeToInbox,
  type TeamScienceInboxConversation,
} from "@/lib/team-messaging";
import styles from "./TeamScienceMessaging.module.css";

function timeLabel(item: TeamScienceInboxConversation) {
  try {
    const value = item.updatedAt?.toDate?.();
    if (!value) return "";
    return value.toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function conversationHref(item: TeamScienceInboxConversation) {
  const params = new URLSearchParams({
    type: item.type,
    id: item.entityId,
    title: item.title,
  });

  if (item.scope) params.set("scope", item.scope);
  if (item.ownerId) params.set("ownerId", item.ownerId);

  return `/messages?${params.toString()}`;
}

export function MessagesInbox() {
  const { user } = useAuth();
  const [items, setItems] = useState<TeamScienceInboxConversation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setError("");

    return subscribeToInbox(
      user.uid,
      setItems,
      () => setError("Your conversations could not be loaded."),
    );
  }, [user]);

  const opportunityItems = useMemo(
    () => items.filter((item) => item.type === "opportunity"),
    [items],
  );

  const teamItems = useMemo(
    () => items.filter((item) => item.type === "team"),
    [items],
  );

  const unread = items.filter((item) => item.unread).length;

  return (
    <main className={styles.page}>
      <section className={styles.inboxHero}>
        <div>
          <span className={styles.eyebrow}>TeamScience Messaging</span>
          <h1>Messages</h1>
          <p>
            Opportunity conversations and team chats in one place.
          </p>
        </div>

        <div className={styles.inboxSummary}>
          <strong>{items.length}</strong>
          <span>conversations</span>
          <b>{unread}</b>
          <span>unread</span>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {items.length === 0 && !error ? (
        <section className={styles.inboxEmpty}>
          <div>💬</div>
          <h2>No conversations yet.</h2>
          <p>
            Opportunity chat unlocks at Invite. Saved teams can start a Team Chat
            from Team Insights.
          </p>
          <div className={styles.emptyActions}>
            <Link className="button" href="/opportunities">
              View Opportunities
            </Link>
            <Link className="button secondary" href="/team-insights">
              Team Insights
            </Link>
          </div>
        </section>
      ) : (
        <>
          <ConversationSection
            title="Opportunity chats"
            eyebrow="Opportunities"
            items={opportunityItems}
            currentUserId={user?.uid || ""}
          />

          <ConversationSection
            title="Team conversations"
            eyebrow="Teams"
            items={teamItems}
            currentUserId={user?.uid || ""}
          />
        </>
      )}
    </main>
  );
}

function ConversationSection({
  title,
  eyebrow,
  items,
  currentUserId,
}: {
  title: string;
  eyebrow: string;
  items: TeamScienceInboxConversation[];
  currentUserId: string;
}) {
  if (!items.length) return null;

  return (
    <section className={styles.inboxSection}>
      <div className={styles.inboxSectionHeading}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <span>{items.length}</span>
      </div>

      <div className={styles.inboxList}>
        {items.map((item) => {
          const fromMe = item.lastSenderId === currentUserId;

          return (
            <Link
              className={`${styles.inboxItem} ${item.unread ? styles.inboxUnread : ""}`}
              href={conversationHref(item)}
              key={item.id}
            >
              <div className={styles.inboxIcon}>
                {item.type === "opportunity" ? "◎" : "◆"}
              </div>

              <div className={styles.inboxBody}>
                <div className={styles.inboxTitleRow}>
                  <strong>{item.title}</strong>
                  <span>{timeLabel(item)}</span>
                </div>

                <p>
                  {item.lastMessage
                    ? `${fromMe ? "You: " : ""}${item.lastMessage}`
                    : item.type === "opportunity"
                      ? "Opportunity conversation is ready."
                      : "Team conversation is ready."}
                </p>

                <div className={styles.inboxMeta}>
                  <span>
                    {item.type === "opportunity"
                      ? "Opportunity chat"
                      : "Team chat"}
                  </span>
                  {item.unread && <b>New</b>}
                </div>
              </div>

              <span className={styles.inboxArrow}>→</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
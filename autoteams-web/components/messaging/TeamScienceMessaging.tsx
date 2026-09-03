"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  ensureConversation,
  markConversationRead,
  sendConversationMessage,
  subscribeToConversation,
  type TeamScienceConversationType,
  type TeamScienceMessage,
} from "@/lib/team-messaging";
import { MessagesInbox } from "./MessagesInbox";
import styles from "./TeamScienceMessaging.module.css";

function formatTime(message: TeamScienceMessage) {
  try {
    const value = message.createdAt?.toDate?.();
    if (!value) return "Sending...";
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

export function TeamScienceMessaging() {
  const { user } = useAuth();
  const params = useSearchParams();

  const typeParam = params.get("type");
  const entityId = params.get("id") || "";
  const title = params.get("title") || "TeamScience conversation";
  const scope = params.get("scope") || undefined;
  const ownerId = params.get("ownerId") || undefined;
  // AUTOTEAMS_V715715245_MESSAGING_SECURITY

  const type: TeamScienceConversationType | null =
    typeParam === "opportunity" || typeParam === "team" ? typeParam : null;

  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<TeamScienceMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const subtitle = useMemo(() => {
    if (type === "opportunity") {
      return "Private Opportunity conversation";
    }
    if (type === "team") {
      return "Team member conversation";
    }
    return "Messaging";
  }, [type]);

  useEffect(() => {
    if (!user || !type || !entityId) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const id = await ensureConversation({
          type,
          entityId,
          title,
          scope,
          createdBy: user.uid,
          ownerId: type === "opportunity" ? ownerId : undefined,
          candidateId: type === "opportunity" ? scope : undefined,
        });

        if (cancelled) return;
        setConversationId(id);

        // AUTOTEAMS_V71571525_MARK_READ
        await markConversationRead(id, user.uid);
        unsubscribe = subscribeToConversation(
          id,
          setMessages,
          () => {
            setError(
              "Messages could not be loaded. Check Firestore messaging permissions.",
            );
          },
        );
      } catch (err) {
        console.error("[TeamScience] messaging setup failed", err);
        setError(
          "This conversation could not be opened. Check Firestore messaging permissions.",
        );
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, type, entityId, title, scope, ownerId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !conversationId || !text.trim() || sending) return;

    try {
      setSending(true);
      setError("");

      await sendConversationMessage({
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || user.email || "TeamScience member",
        text,
      });

      setText("");
    } catch (err) {
      console.error("[TeamScience] message send failed", err);
      setError(
        "Your message could not be sent. Check Firestore messaging permissions.",
      );
    } finally {
      setSending(false);
    }
  }
  if (!type || !entityId) {
    return <MessagesInbox />;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.chatIcon} aria-hidden="true">
          ✦
        </div>
        <div>
          <span className={styles.eyebrow}>{subtitle}</span>
          <h1>{title}</h1>
          <p>
            {type === "opportunity"
              ? "Chat before joining. Ask questions, clarify expectations and decide whether the team is right for you."
              : "A shared space for current team members to communicate inside TeamScience."}
          </p>
        </div>
        <span className={styles.liveBadge}>Live conversation</span>
      </section>

      <section className={styles.chatShell}>
        <div className={styles.contextBar}>
          <div>
            <strong>
              {type === "opportunity" ? "Opportunity chat" : "Team chat"}
            </strong>
            <span>
              {type === "opportunity"
                ? "Unlocked at the Invite stage"
                : "For members of this team"}
            </span>
          </div>
          <Link
            className={styles.backLink}
            href={type === "opportunity" ? "/opportunities" : "/teams"}
          >
            Back
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.messages} aria-live="polite">
          {messages.length === 0 && !error ? (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>💬</div>
              <strong>Start the conversation.</strong>
              <p>
                {type === "opportunity"
                  ? "This is a good place to discuss the Opportunity before the invitation is accepted."
                  : "Say hello, share an update or start planning the team's next step."}
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.senderId === user?.uid;
              return (
                <article
                  className={`${styles.message} ${mine ? styles.mine : ""}`}
                  key={message.id}
                >
                  <div className={styles.messageMeta}>
                    <strong>{mine ? "You" : message.senderName}</strong>
                    <span>{formatTime(message)}</span>
                  </div>
                  <p>{message.text}</p>
                </article>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <form className={styles.composer} onSubmit={send}>
          <textarea
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a message..."
            maxLength={2000}
          />
          <div className={styles.composerFooter}>
            <span>{text.length}/2000</span>
            <button
              className="button"
              type="submit"
              disabled={!conversationId || !text.trim() || sending}
            >
              {sending ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.atlasHint}>
        <span>ATLAS</span>
        <div>
          <strong>Conversation intelligence can come next.</strong>
          <p>
            This messaging foundation can later support Atlas summaries,
            outstanding actions, suggested agendas and team-context prompts.
          </p>
        </div>
      </section>
    </main>
  );
}
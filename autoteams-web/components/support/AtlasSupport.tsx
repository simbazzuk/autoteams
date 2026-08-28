"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./AtlasSupport.module.css";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: Array<{ label: string; href: string }>;
  source?: string;
};

const QUICK = [
  "How do I build a team?",
  "Why are these skills suggested?",
  "What is Team Science?",
  "How does confidence work?",
];

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AtlasSupport() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to AutoTeams. I can help you create a profile, invite people or build your first team. What would you like to do?",
    },
  ]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function ask(question: string) {
    const clean = question.trim();
    if (!clean || sending) return;

    const previous = messages;
    setMessages((m) => [...m, { id: id(), role: "user", content: clean }]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          pathname,
          history: previous
            .filter((m) => m.id !== "welcome")
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Support request failed.");

      setMessages((m) => [
        ...m,
        {
          id: id(),
          role: "assistant",
          content: payload.answer,
          links: payload.links,
          source: payload.source,
        },
      ]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          id: id(),
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : "Atlas Support is temporarily unavailable.",
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <>
      {open && (
        <aside className={styles.panel} aria-label="Atlas Support">
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.avatar}>✦</span>
              <div>
                <strong>Ask Atlas</strong>
                <small>AutoTeams help</small>
              </div>
            </div>
            <button
              className={styles.close}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Atlas Support"
            >
              ×
            </button>
          </header>

          <div className={styles.status}>
            <span>Read-only support</span>
            <em>Page aware</em>
          </div>

          <div className={styles.messages}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                <p>{message.content}</p>

                {!!message.links?.length && (
                  <div className={styles.links}>
                    {message.links.map((link) => (
                      <Link key={link.href} href={link.href}>
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                )}

                {message.role === "assistant" && message.source && (
                  <small className={styles.source}>
                    {message.source === "gemini" ? "Atlas AI" : "AutoTeams support"}
                  </small>
                )}
              </article>
            ))}

            {sending && (
              <article className={styles.assistantMessage}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </article>
            )}
          </div>

          {messages.length <= 2 && (
            <div className={styles.quick}>
              {QUICK.map((q) => (
                <button type="button" key={q} onClick={() => void ask(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className={styles.form} onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AutoTeams..."
              maxLength={3000}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              ↑
            </button>
          </form>

          <footer className={styles.footer}>
            Atlas Support guides you but does not change data or make team decisions.
          </footer>
        </aside>
      )}

      <button
        className={styles.launcher}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-expanded={open}
      >
        <span>✦</span>
        <strong>Ask Atlas</strong>
      </button>
    </>
  );
}

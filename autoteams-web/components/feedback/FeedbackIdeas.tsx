"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import styles from "./FeedbackIdeas.module.css";

const categories = [
  { id: "idea", icon: "✦", title: "Suggest an idea", text: "Something new you would love AutoTeams to do." },
  { id: "works", icon: "✓", title: "Tell us what works", text: "Something useful that we should keep or build on." },
  { id: "improve", icon: "↗", title: "Something could be better", text: "An experience that could be clearer, easier or faster." },
  { id: "problem", icon: "!", title: "Report a problem", text: "Something that did not work as you expected." },
  { id: "feature", icon: "+", title: "Request a feature", text: "A capability you think would make AutoTeams more useful." },
] as const;

type Category = (typeof categories)[number]["id"];

export function FeedbackIdeas() {
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>("idea");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    setStatus("idle");

    try {
      await addDoc(collection(db, "feedback"), {
        category,
        message: message.trim(),
        status: "new",
        source: "feedback-page",
        page: typeof window !== "undefined" ? window.location.pathname : "/feedback",
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      setStatus("sent");
    } catch (error) {
      console.error("[AutoTeams] Feedback submission failed:", error);
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>FEEDBACK &amp; IDEAS</div>
        <h1>Help shape AutoTeams.</h1>
        <p>
          Tell us what you like, what could be better, or what you would like
          us to build next. Your feedback helps us focus on problems that
          matter to real teams.
        </p>
      </header>

      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.fieldset}>
          <legend>What would you like to share?</legend>
          <div className={styles.categories}>
            {categories.map((item) => (
              <button
                aria-pressed={category === item.id}
                className={`${styles.category} ${category === item.id ? styles.selected : ""}`}
                key={item.id}
                onClick={() => setCategory(item.id)}
                type="button"
              >
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.messageLabel}>
          <span>What would you like to tell us?</span>
          <textarea
            maxLength={3000}
            onChange={(event) => {
              setMessage(event.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="Share your feedback, recommendation or idea..."
            required
            rows={8}
            value={message}
          />
          <small>{message.length} / 3000</small>
        </label>

        <div className={styles.submitRow}>
          <div aria-live="polite">
            {status === "sent" && (
              <p className={styles.success}>Thank you. Your feedback has been sent.</p>
            )}
            {status === "error" && (
              <p className={styles.error}>
                We could not save your feedback. Please try again. If this is
                the first deployment of this feature, check the Firestore rule
                included with this patch.
              </p>
            )}
          </div>
          <button className="button" disabled={!message.trim() || sending} type="submit">
            {sending ? "Sending..." : "Send feedback"}
          </button>
        </div>
      </form>

      <aside className={styles.note}>
        <span aria-hidden="true">✦</span>
        <div>
          <strong>Built with our users.</strong>
          <p>
            AutoTeams started with an idea about making team formation better.
            The people using it will help decide where that idea goes next.
          </p>
        </div>
      </aside>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import styles from "./ProfileContextSelection.module.css";

const PROFILE_KEY = "autoteams-onboarding-profile-context-v793";
const ONBOARDING_KEY = "autoteams-onboarding-v79";

const contexts = [
  {
    id: "business",
    icon: "💼",
    title: "Work",
    description: "Professional teams, projects, skills, roles and workplace collaboration.",
    next: "/profile?context=business",
  },
  {
    id: "sports",
    icon: "⚽",
    title: "Sport",
    description: "Sports teams, positions, playing strengths, experience and preferred roles.",
    next: "/profile?context=sports",
  },
  {
    id: "friendship",
    icon: "🤝",
    title: "Friendship",
    description: "Interests, social preferences and the kinds of groups you enjoy being part of.",
    next: "/profile?context=friendship",
  },
  {
    id: "community",
    icon: "🌍",
    title: "Community",
    description: "Volunteering, clubs, causes, community groups and ways you like to contribute.",
    next: "/profile?context=community",
  },
  {
    id: "education",
    icon: "🎓",
    title: "Education",
    description: "Study groups, learning preferences, project skills and education teams.",
    next: "/profile?context=education",
  },
] as const;

export function ProfileContextSelection() {
  const router = useRouter();

  function choose(context: (typeof contexts)[number]) {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          context: context.id,
          label: context.title,
          selectedAt: new Date().toISOString(),
        }),
      );

      const existing = JSON.parse(
        localStorage.getItem(ONBOARDING_KEY) || "{}",
      );

      localStorage.setItem(
        ONBOARDING_KEY,
        JSON.stringify({
          ...existing,
          profileStarted: true,
          profileContext: context.id,
        }),
      );
    } catch {}

    router.push(context.next);
  }

  return (
    <main className={styles.page}>
      <div className={`container ${styles.container}`}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>STEP 2 · YOUR PROFILE</span>
          <h1>How will you use AutoTeams?</h1>
          <p>
            Choose the context you want to create first. Your profile questions,
            Atlas insights and future team recommendations should reflect that
            context.
          </p>
        </section>

        <section className={styles.grid} aria-label="Profile types">
          {contexts.map((context) => (
            <button
              className={styles.card}
              key={context.id}
              onClick={() => choose(context)}
              type="button"
            >
              <span className={styles.icon} aria-hidden="true">
                {context.icon}
              </span>
              <span className={styles.cardBody}>
                <strong>{context.title}</strong>
                <span>{context.description}</span>
              </span>
              <span className={styles.arrow}>→</span>
            </button>
          ))}
        </section>

        <section className={styles.explainer}>
          <span className={styles.atlas}>✦</span>
          <div>
            <strong>One person can have more than one profile.</strong>
            <p>
              A Work profile and a Sport profile can describe different sides
              of the same person. AutoTeams should use the profile that matches
              the team being built rather than mixing contexts.
            </p>
          </div>
        </section>

        <p className={styles.note}>
          You can add other profile types later. This choice simply sets up your
          first AutoTeams profile.
        </p>
      </div>
    </main>
  );
}

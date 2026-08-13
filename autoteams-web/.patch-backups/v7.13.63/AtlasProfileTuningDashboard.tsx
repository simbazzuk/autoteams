"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ContextMode,
  ContextualProfile,
  loadContextualProfiles,
  saveActiveContextualProfileId,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import styles from "./AtlasProfileTuningDashboard.module.css";

const MODES: ContextMode[] = [
  "community",
  "business",
  "friendship",
  "sports",
  "education",
];

const MODE_META: Record<
  ContextMode,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  business: {
    label: "Business",
    icon: "B",
    description:
      "How you prefer to communicate, plan and contribute in work and organisation settings.",
  },
  friendship: {
    label: "Friendship",
    icon: "F",
    description:
      "How you connect, support others and contribute in social and friendship settings.",
  },
  community: {
    label: "Community",
    icon: "C",
    description:
      "How you prefer to communicate, plan, collaborate and contribute within community groups.",
  },
  sports: {
    label: "Sports",
    icon: "S",
    description:
      "How you contribute, communicate and work with others in sporting environments.",
  },
  education: {
    label: "Education",
    icon: "E",
    description:
      "How you learn, collaborate, communicate and contribute in education and study settings.",
  },
};

const SIGNALS = [
  {
    title: "Strengths",
    icon: "*",
    description:
      "Your natural talents and what you bring to teams.",
    action: "Review & Tune",
    href: "/onboarding/profile",
  },
  {
    title: "Working Style",
    icon: "=",
    description:
      "How you like to work, collaborate and decide.",
    action: "Review & Tune",
    href: "/atlas",
  },
  {
    title: "Collaboration",
    icon: "C",
    description:
      "How you interact, communicate and support others.",
    action: "Review & Tune",
    href: "/atlas",
  },
  {
    title: "Motivation",
    icon: "O",
    description:
      "What drives you and what gives you energy.",
    action: "Review & Tune",
    href: "/atlas",
  },
  {
    title: "Values",
    icon: "V",
    description:
      "Your core values and what matters to you.",
    action: "Review & Tune",
    href: "/atlas",
  },
];

export function AtlasProfileTuningDashboard() {
  const [profiles, setProfiles] =
    useState<ContextualProfile[]>([]);
  const [selectedId, setSelectedId] =
    useState("");

  useEffect(() => {
    const loaded =
      loadContextualProfiles();

    setProfiles(loaded);

    const first =
      loaded[0]?.id || "";

    setSelectedId(first);

    if (first) {
      saveActiveContextualProfileId(first);
    }
  }, []);

  const selectedProfile =
    useMemo(
      () =>
        profiles.find(
          (profile) =>
            profile.id === selectedId,
        ) || null,
      [profiles, selectedId],
    );

  const interview =
    selectedProfile
      ? loadContextInterview(
          selectedProfile.id,
          selectedProfile.mode,
        )
      : null;

  const freshness =
    profileFreshness(
      interview?.completedAt ?? null,
    );

  const readiness =
    selectedProfile
      ? Math.max(
          55,
          Math.min(
            100,
            freshness.confidence,
          ),
        )
      : 0;

  const activeMeta =
    selectedProfile
      ? MODE_META[selectedProfile.mode]
      : null;

  function chooseProfile(
    profile: ContextualProfile,
  ) {
    setSelectedId(profile.id);
    saveActiveContextualProfileId(
      profile.id,
    );
  }

  function openForProfile(
    href: string,
  ) {
    if (selectedProfile) {
      saveActiveContextualProfileId(
        selectedProfile.id,
      );
    }

    window.location.href = href;
  }

  if (profiles.length === 0) {
    return (
      <main className={styles.page}>
        <section className={styles.empty}>
          <span className="eyebrow">
            My Atlas Profile
          </span>
          <h1>
            Build your individual Atlas Profile.
          </h1>
          <p>
            Create a contextual profile first so Atlas
            can learn about your strengths, preferences
            and working style.
          </p>
          <div className="actions">
            <Link
              className="button"
              href="/onboarding/profile"
            >
              Create My Profile
            </Link>
            <Link
              className="button secondary"
              href="/people"
            >
              Back to People
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className="eyebrow">
            My Atlas Profile
          </span>
          <h1>
            Tune how Atlas understands you.
          </h1>
          <p>
            This is your individual Atlas Profile.
            Tune your strengths, preferences and
            working style so Atlas can better
            understand you and recommend the right
            people for the right teams.
          </p>
        </div>

        <div className={styles.freshness}>
          <strong>
            {freshness.status === "fresh"
              ? "Profile up to date"
              : "Profile refresh recommended"}
          </strong>
          <span>{freshness.label}</span>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div>
                <span>1</span>
                <div>
                  <h2>
                    Your Contextual Profile
                  </h2>
                  <p>
                    Choose the context where you
                    want Atlas to understand you.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.contextGrid}>
              {MODES.map((mode) => {
                const profile =
                  profiles.find(
                    (item) =>
                      item.mode === mode,
                  );

                const active =
                  profile?.id === selectedId;

                return (
                  <button
                    className={
                      active
                        ? styles.contextActive
                        : styles.contextCard
                    }
                    disabled={!profile}
                    key={mode}
                    onClick={() =>
                      profile &&
                      chooseProfile(
                        profile,
                      )
                    }
                    type="button"
                  >
                    <span
                      className={
                        styles.contextIcon
                      }
                    >
                      {
                        MODE_META[mode]
                          .icon
                      }
                    </span>

                    <strong>
                      {
                        MODE_META[mode]
                          .label
                      }
                    </strong>

                    <small>
                      {active
                        ? "Active"
                        : profile
                          ? "Switch"
                          : "Not created"}
                    </small>
                  </button>
                );
              })}
            </div>

            {activeMeta && (
              <div className={styles.contextInfo}>
                <p>
                  Your{" "}
                  <strong>
                    {activeMeta.label}
                  </strong>{" "}
                  profile helps Atlas understand{" "}
                  {activeMeta.description
                    .charAt(0)
                    .toLowerCase() +
                    activeMeta.description.slice(
                      1,
                    )}
                </p>

                <Link
                  className="button secondary"
                  href="/onboarding/profile"
                >
                  Manage Profiles
                </Link>
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <div>
                <span>2</span>
                <div>
                  <h2>
                    Your Atlas Signals
                  </h2>
                  <p>
                    These are the key areas Atlas
                    uses to understand your fit
                    with teams.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.signalGrid}>
              {SIGNALS.map(
                (signal) => (
                  <article
                    key={signal.title}
                  >
                    <span
                      className={
                        styles.signalIcon
                      }
                    >
                      {signal.icon}
                    </span>

                    <strong>
                      {signal.title}
                    </strong>

                    <p>
                      {signal.description}
                    </p>

                    <button
                      className={
                        styles.signalAction
                      }
                      onClick={() =>
                        openForProfile(
                          signal.href,
                        )
                      }
                      type="button"
                    >
                      {signal.action}
                    </button>
                  </article>
                ),
              )}
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.readiness}>
            <h2>Profile Readiness</h2>

            <div className={styles.readinessBody}>
              <div
                className={styles.ring}
                style={{
                  background: `conic-gradient(#39c66d ${readiness}%, rgba(148,163,184,.15) 0)`,
                }}
              >
                <div>
                  <strong>
                    {readiness}%
                  </strong>
                  <span>
                    {readiness >= 85
                      ? "Great work!"
                      : "Keep tuning"}
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.checklist
                }
              >
                <p>
                  {readiness >= 85
                    ? "Your profile is strong and up to date."
                    : "Add more profile signals to improve Atlas recommendations."}
                </p>

                <span>
                  Atlas interview{" "}
                  {interview?.completedAt
                    ? "completed"
                    : "not completed"}
                </span>
                <span>
                  Context profile selected
                </span>
                <span>
                  Strengths available
                </span>
                <span>
                  Working style available
                </span>
              </div>
            </div>

            <button
              className="button secondary"
              onClick={() =>
                openForProfile("/atlas")
              }
              type="button"
            >
              Refresh Profile Signals
            </button>
          </section>

          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>

            <button
              onClick={() =>
                openForProfile("/atlas")
              }
              type="button"
            >
              <div>
                <strong>
                  Update Atlas Interview
                </strong>
                <span>
                  Answer or update your Atlas
                  questions
                </span>
              </div>
              <b>-&gt;</b>
            </button>

            <button
              onClick={() =>
                openForProfile(
                  "/onboarding/profile",
                )
              }
              type="button"
            >
              <div>
                <strong>
                  Review Strengths
                </strong>
                <span>
                  View and refine your strengths
                </span>
              </div>
              <b>-&gt;</b>
            </button>

            <button
              onClick={() =>
                openForProfile("/atlas")
              }
              type="button"
            >
              <div>
                <strong>
                  Update Working Style
                </strong>
                <span>
                  Tune how you like to work
                </span>
              </div>
              <b>-&gt;</b>
            </button>

            <Link href="/my-atlas-profile">
              <div>
                <strong>
                  View Profile History
                </strong>
                <span>
                  Review the currently selected
                  profile state
                </span>
              </div>
              <b>-&gt;</b>
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}

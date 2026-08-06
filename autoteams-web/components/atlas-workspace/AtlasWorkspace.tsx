"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  buildTeamDnaInsight,
} from "@/lib/team-dna-insights";
import {
  loadDemoRecommendations,
  loadDemoTeams,
} from "@/lib/demo-environment";
import {
  loadNotifications,
} from "@/lib/notifications";
import styles from "./AtlasWorkspace.module.css";
import { AtlasAssistant } from "@/components/atlas-assistant/AtlasAssistant";

type AtlasAction = {
  href: string;
  icon: string;
  title: string;
  text: string;
  badge?: string;
  primary?: boolean;
};

export function AtlasWorkspace() {
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);

  useEffect(() => {
    setProfiles(loadContextualProfiles());
  }, []);

  const insights = useMemo(
    () =>
      profiles.map((profile) => ({
        profile,
        insight: buildTeamDnaInsight(profile.id, profile.mode),
      })),
    [profiles],
  );

  const completed = insights.filter(
    ({ insight }) => insight.interviewComplete,
  ).length;

  const stale = insights.filter(
    ({ insight }) =>
      insight.freshnessStatus === "stale" ||
      insight.freshnessStatus === "aging",
  ).length;

  const teams = loadDemoTeams();
  const recommendations = loadDemoRecommendations();
  const unread = loadNotifications().filter((item) => !item.read).length;

  const nextAction = determineNextAction(profiles, completed, stale);

  const actions: AtlasAction[] = [
    {
      href: "/atlas",
      icon: "✦",
      title: completed > 0 ? "Review Atlas Interview" : "Complete Atlas Interview",
      text:
        completed > 0
          ? "Review or refresh the questions used to build your individual Atlas Profile."
          : "Answer the core and contextual questions Atlas needs to understand how you collaborate.",
      badge: completed > 0 ? `${completed} complete` : "Start here",
      primary: completed === 0,
    },
    {
      href: "/my-atlas-profile",
      icon: "♙",
      title: "My Atlas Profile",
      text:
        "Review your individual collaboration traits, confidence, freshness, strengths and matching consent.",
      badge: profiles.length ? `${profiles.length} profile${profiles.length === 1 ? "" : "s"}` : "Not created",
      primary: profiles.length > 0 && completed > 0,
    },
    {
      href: "/team-builder",
      icon: "◈",
      title: "Build a Team",
      text:
        "Describe the purpose, size, location, skills and Team DNA balance required.",
      badge: "Team Leader",
    },
    {
      href: "/matches",
      icon: "◎",
      title: "Recommendations",
      text:
        "Review why Atlas recommends each person and how candidate changes affect the proposed team.",
      badge: recommendations.length
        ? `${recommendations.length} available`
        : "None yet",
    },
    {
      href: "/team-dna",
      icon: "◌",
      title: "Team DNA",
      text:
        "Understand the combined strengths, balance and potential gaps of an actual or proposed team.",
      badge: teams.length ? `${teams.length} team${teams.length === 1 ? "" : "s"}` : "Build a team first",
    },
    {
      href: "/insights",
      icon: "▥",
      title: "Atlas Insights",
      text:
        "Explore workspace readiness, profile coverage and broader collaboration themes.",
      badge: "Insights",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Atlas Workspace</span>
            <h1>Your AI workspace for profiles, teams and recommendations.</h1>
            <p>
              Atlas learns about individuals, helps design teams and explains
              the combined Team DNA. Start with the recommended action below.
            </p>

            <div className="actions">
              <Link className="button" href={nextAction.href}>
                {nextAction.label}
              </Link>
              <Link className="button secondary" href="/learning-centre">
                Learn How Atlas Works
              </Link>
            </div>
          </div>

          <aside className={styles.health}>
            <span className="eyebrow">Atlas health</span>
            <strong>{atlasHealth(profiles.length, completed, stale)}%</strong>
            <div className={styles.healthBar}>
              <i
                style={{
                  width: `${atlasHealth(
                    profiles.length,
                    completed,
                    stale,
                  )}%`,
                }}
              />
            </div>
            <p>
              {completed} completed profile{completed === 1 ? "" : "s"} ·{" "}
              {stale} requiring review
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.nextStep}>
            <div>
              <span className="eyebrow">Recommended next step</span>
              <h2>{nextAction.title}</h2>
              <p>{nextAction.text}</p>
            </div>
            <Link className="button" href={nextAction.href}>
              Continue
            </Link>
          </section>

          <section className={styles.metrics}>
            <Metric
              label="Contextual profiles"
              value={profiles.length}
              detail="Business, Friendship, Community, Sports or Education"
            />
            <Metric
              label="Interviews complete"
              value={`${completed}/${profiles.length}`}
              detail="Individual Atlas Profiles ready"
            />
            <Metric
              label="Teams available"
              value={teams.length}
              detail="Ready for Team DNA review"
            />
            <Metric
              label="Unread updates"
              value={unread}
              detail="Notifications requiring attention"
            />
          </section>

          <section className={styles.sectionHeading}>
            <div>
              <span className="eyebrow">Atlas capabilities</span>
              <h2>Choose what you want Atlas to help with.</h2>
              <p>
                Individual profile features are kept separate from collective
                team analysis.
              </p>
            </div>
          </section>

<div className={styles.workspaceGrid}>

            <section className={styles.actionGrid}>
              {actions.map((action) => (
                <Link
                  className={action.primary ? styles.primaryCard : ""}
                  href={action.href}
                  key={action.href}
                >
                  <header>
                    <span>{action.icon}</span>
                    {action.badge && <small>{action.badge}</small>}
                  </header>

                  <h3>{action.title}</h3>

                  <p>{action.text}</p>

                  <footer>Open {action.title} →</footer>
                </Link>
              ))}
            </section>

            <aside className={styles.assistantPanel}>
              <AtlasAssistant
                context="atlas"
                profiles={profiles.length}
                completedProfiles={completed}
                staleProfiles={stale}
                pendingInvitations={0}
                recommendations={recommendations.length}
                teams={teams.length}
              />
            </aside>

          </div>

          <section className={styles.flow}>
            <span className="eyebrow">How Atlas works</span>
            <h2>From individual understanding to team insight.</h2>

            <div className={styles.flowSteps}>
              <FlowStep number="01" title="Atlas Interview" text="Tell Atlas how you work in a selected context." />
              <FlowStep number="02" title="My Atlas Profile" text="Review your individual collaboration profile." />
              <FlowStep number="03" title="Build Team" text="Describe the outcome and eligible population." />
              <FlowStep number="04" title="Recommendations" text="Review candidates and explanations." />
              <FlowStep number="05" title="Team DNA" text="Understand the combined team balance and gaps." />
            </div>
          </section>

          <section className={styles.guidance}>
            <div>
              <span className="eyebrow">Important distinction</span>
              <h2>My Atlas Profile describes a person. Team DNA describes a team.</h2>
              <p>
                Atlas uses individual profile signals as one input when forming
                a team. Team DNA only exists once several people are combined.
              </p>
            </div>
            <div className="actions">
              <Link className="button" href="/my-atlas-profile">
                View My Atlas Profile
              </Link>
              <Link className="button secondary" href="/team-dna">
                View Team DNA
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article>
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function determineNextAction(
  profiles: ContextualProfile[],
  completed: number,
  stale: number,
) {
  if (!profiles.length) {
    return {
      href: "/profile",
      label: "Create Your First Profile",
      title: "Create a contextual profile",
      text:
        "Choose Business, Friendship, Community, Sports or Education before starting the Atlas interview.",
    };
  }

  if (!completed) {
    return {
      href: "/atlas",
      label: "Complete Atlas Interview",
      title: "Complete the Atlas interview",
      text:
        "Atlas needs your core and contextual answers before it can build your individual Atlas Profile.",
    };
  }

  if (stale > 0) {
    return {
      href: "/my-atlas-profile",
      label: "Review Atlas Profile",
      title: "Review profiles that may need refreshing",
      text:
        "One or more contextual profiles are aging or stale. Confirm they still represent how you collaborate.",
    };
  }

  return {
    href: "/team-builder",
    label: "Build a Team",
    title: "Use Atlas to design a team",
    text:
      "Your individual profile is ready. Describe the team requirement and let Atlas explain the recommendation.",
  };
}

function atlasHealth(
  profiles: number,
  completed: number,
  stale: number,
): number {
  if (!profiles) return 0;
  const completionScore = (completed / profiles) * 85;
  const freshnessPenalty = Math.min(25, stale * 8);
  return Math.max(
    0,
    Math.min(100, Math.round(completionScore + 15 - freshnessPenalty)),
  );
}

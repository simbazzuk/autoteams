"use client";

import type { ReactNode } from "react";

import { appConfig } from "@/lib/app-config";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import {
  Workspace,
  WorkspacePerson,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./AiFirstHome.module.css";

export function AiFirstHome() {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);
  const [people, setPeople] =
    useState<WorkspacePerson[]>([]);
  const [profiles, setProfiles] =
    useState<ContextualProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] =
    useState("");
  const [savedTeams, setSavedTeams] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setProfiles(loadContextualProfiles());
    setActiveWorkspaceId(loadActiveWorkspaceId());
    setSavedTeams(loadSavedTeamCount());
    setReady(true);
  }, []);

  const workspace = workspaces.find(
    (item) => item.id === activeWorkspaceId,
  );

  const workspacePeople = people.filter(
    (person) =>
      person.workspaceId === activeWorkspaceId &&
      person.status === "active",
  );

  const myProfiles = useMemo(
    () =>
      profiles.filter((profile) =>
        belongsToCurrentUser(
          profile,
          user?.displayName,
          user?.email,
        ),
      ),
    [profiles, user?.displayName, user?.email],
  );

  const profile = myProfiles[0];

  const interview = profile
    ? loadContextInterview(
        profile.id,
        profile.mode,
      )
    : undefined;

  const freshness = profile
    ? profileFreshness(
        interview?.completedAt ?? null,
      )
    : {
        confidence: 0,
        label: "Not started",
        status: "missing",
      };

  const completion = profile
    ? profileCompletion(profile)
    : 0;

  const profileQuality = Math.min(
    100,
    Math.round(
      completion * 0.55 +
        freshness.confidence * 0.35 +
        (interview?.completedAt ? 10 : 0),
    ),
  );

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing TeamScience.ai…
      </section>
    );
  }

  const hasGroup = Boolean(workspace);
  const hasPeople = workspacePeople.length > 0;
  const canBuild = hasGroup && hasPeople;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">
              TeamScience.ai
            </span>

            <h1>
              Good {dayPart()},{" "}
              {firstName(
                user?.displayName || user?.email,
              )}.
            </h1>

            <p>
              Build stronger teams with AI-powered
              recommendations, explainable insights and
              human review.
            </p>

            <div className={styles.heroActions}>
              <Link
                className="button"
                href="/team-builder"
              >
                Build a Team →
              </Link>

              <Link
                className="button secondary"
                href="/gemini-team-coach"
              >
                ✦ Gemini Team Coach
              </Link>
            </div>
          </div>

          <aside className={styles.coachCard}>
            <div className={styles.coachTitle}>
              <ProductIcon
                label="Gemini Team Coach"
                size="lg"
              >
                ✦
              </ProductIcon>

              <div>
                <small>
                  Powered by Google Gemini
                </small>
                <strong>
                  Gemini Team Coach
                </strong>
              </div>
            </div>

            <div className={styles.qualityRow}>
              <span>AI Profile Quality</span>
              <strong>{profileQuality}%</strong>
            </div>

            <div className={styles.progress}>
              <i
                style={{
                  width: `${profileQuality}%`,
                }}
              />
            </div>

            <p>
              {profileQuality >= 80
                ? "Your profile provides strong evidence for AI recommendations."
                : "Complete your Team Coach profile to improve future recommendations."}
            </p>

            <Link
              href="/gemini-team-coach"
            >
              {profileQuality > 0
                ? "Continue Team Coach →"
                : "Start Team Coach →"}
            </Link>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.nextSection}>
            <span className="eyebrow">
              Continue where you left off
            </span>

            <h2>
              What would you like to do?
            </h2>

            <div className={styles.actionGrid}>
              <ActionCard
                icon={<TeamScienceHomeIcon kind="team" />}
                title="Build a Team"
                text={
                  canBuild
                    ? `${workspacePeople.length} active people are available in ${workspace?.name}.`
                    : "TeamScience.ai will guide you through creating a group and adding people."
                }
                status={
                  canBuild
                    ? "Ready"
                    : "Setup required"
                }
                href="/team-builder"
                label="Start Team Builder"
                primary
              />

              <ActionCard
                icon={<TeamScienceHomeIcon kind="sparkles" />}
                title="Gemini Team Coach"
                text="Improve recommendation quality by helping Gemini understand how you collaborate."
                status={`${profileQuality}% profile quality`}
                href="/gemini-team-coach"
                label={
                  profileQuality
                    ? "Continue Team Coach"
                    : "Start Team Coach"
                }
              />

              <ActionCard
                icon={<TeamScienceHomeIcon kind="group" />}
                title="Manage My Group"
                text={
                  workspace
                    ? `${workspace.name} has ${workspacePeople.length} active people.`
                    : "Create the group where your teams and people belong."
                }
                status={
                  workspace
                    ? workspaceTypeLabel(
                        workspace.type,
                      )
                    : "Not created"
                }
                href="/organisation"
                label="Open My Group"
              />
            </div>
          </section>

          <section className={styles.overview}>
            <div className={styles.heading}>
              <div>
                <span className="eyebrow">
                  Your TeamScience.ai
                </span>
                <h2>
                  Everything in one simple view.
                </h2>
              </div>
            </div>

            <div className={styles.metrics}>
              <Metric
                icon={<TeamScienceHomeIcon kind="groups" />}
                label="Groups"
                value={workspaces.length}
                href="/organisation"
              />
              <Metric
                icon={<TeamScienceHomeIcon kind="person" />}
                label="People"
                value={workspacePeople.length}
                href="/people"
              />
              <Metric
                icon={<TeamScienceHomeIcon kind="bookmark" />}
                label="Saved teams"
                value={savedTeams}
                href="/teams"
              />
              <Metric
                icon={<TeamScienceHomeIcon kind="chart" />}
                label="AI profile quality"
                value={`${profileQuality}%`}
                href="/gemini-team-coach"
              />
            </div>
          </section>

          <section className={styles.aiBanner}>
            <ProductIcon
              label="AI recommendation"
              size="lg"
            >
              ✦
            </ProductIcon>

            <div>
              <span className="eyebrow">
                AI-powered team intelligence
              </span>
              <h2>
                Gemini recommends. You decide.
              </h2>
              <p>
                TeamScience.ai combines authorised people,
                skills and collaboration evidence with
                Gemini analysis. Every recommendation is
                explainable and remains subject to human
                review.
              </p>
            </div>

            <Link
              className="button secondary"
              href="/matches"
            >
              View Recommendations
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  icon,
  title,
  text,
  status,
  href,
  label,
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  status: string;
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <article
      className={`${styles.actionCard} ${
        primary ? styles.primary : ""
      }`}
    >
      <header>
        <ProductIcon
          label={title}
          size="lg"
        >
          {icon}
        </ProductIcon>

        <span>{status}</span>
      </header>

      <h3>{title}</h3>
      <p>{text}</p>

      <Link
        className="button"
        href={href}
      >
        {label} →
      </Link>
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href}>
      <ProductIcon
        label={label}
        size="sm"
        subtle
      >
        {icon}
      </ProductIcon>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>

      <span>Open →</span>
    </Link>
  );
}

function loadSavedTeamCount(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw =
      window.localStorage.getItem(
        "autoteams-v20-saved-teams",
      );

    if (!raw) return 0;

    const value = JSON.parse(raw);

    return Array.isArray(value)
      ? value.length
      : 0;
  } catch {
    return 0;
  }
}

function profileCompletion(
  profile: ContextualProfile,
): number {
  const values = [
    profile.preferredName,
    profile.generalLocation,
    profile.availability,
    profile.interests.length
      ? "yes"
      : "",
    ...Object.values(profile.fields).map(
      (value) =>
        Array.isArray(value)
          ? value.length
            ? "yes"
            : ""
          : String(value || ""),
    ),
  ];

  return Math.round(
    (values.filter(
      (value) => value.trim().length > 0,
    ).length /
      Math.max(values.length, 1)) *
      100,
  );
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(
    profile.preferredName,
  );
  const fullName = normalise(displayName);
  const emailName = normalise(
    (email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " "),
  );

  return Boolean(
    profileName &&
      (profileName === fullName ||
        profileName === emailName ||
        (fullName &&
          profileName ===
            normalise(
              fullName.split(" ")[0],
            ))),
  );
}

function normalise(
  value?: string | null,
): string {
  return (value || "")
    .trim()
    .toLowerCase();
}

function firstName(
  value?: string | null,
): string {
  if (!value) return "there";

  return (
    value
      .trim()
      .split(/[\s@]/)[0] || "there"
  );
}

function dayPart(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";

  return "evening";
}



/* TEAMSCIENCE_AI_HOME_SVG_ICONS_PATCH7_FIX1 */
function TeamScienceHomeIcon({
  kind,
}: {
  kind:
    | "team"
    | "sparkles"
    | "group"
    | "groups"
    | "person"
    | "bookmark"
    | "chart";
}) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "team" || kind === "groups") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        {kind === "team" ? (
          <>
            <path d="M19 8v6" />
            <path d="M16 11h6" />
          </>
        ) : null}
      </svg>
    );
  }

  if (kind === "sparkles") {
    return (
      <svg {...common}>
        <path d="m12 3-1.2 3.3a4 4 0 0 1-2.5 2.5L5 10l3.3 1.2a4 4 0 0 1 2.5 2.5L12 17l1.2-3.3a4 4 0 0 1 2.5-2.5L19 10l-3.3-1.2a4 4 0 0 1-2.5-2.5L12 3Z" />
        <path d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3Z" />
      </svg>
    );
  }

  if (kind === "group") {
    return (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M5 21V10h14v11" />
        <path d="m4 10 8-6 8 6" />
        <path d="M9 14h6" />
        <path d="M9 18h6" />
      </svg>
    );
  }

  if (kind === "person") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (kind === "bookmark") {
    return (
      <svg {...common}>
        <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20V7" />
    </svg>
  );
}
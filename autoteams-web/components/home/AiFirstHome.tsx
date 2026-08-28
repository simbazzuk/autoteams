"use client";

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
                icon="â–¥"
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
                icon="✦"
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
                icon="â—‡"
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
                icon="â—‡"
                label="Groups"
                value={workspaces.length}
                href="/organisation"
              />
              <Metric
                icon="â™™"
                label="People"
                value={workspacePeople.length}
                href="/people"
              />
              <Metric
                icon="â–¥"
                label="Saved teams"
                value={savedTeams}
                href="/teams"
              />
              <Metric
                icon="✦"
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
  icon: string;
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
  icon: string;
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



"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextMode,
  ContextualProfile,
  createContextualProfile,
  loadContextualProfiles,
  saveActiveContextualProfileId,
  saveContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import {
  Workspace,
  defaultContextForWorkspace,
  loadActiveWorkspaceId,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./GeminiTeamCoach.module.css";

type Dimension = {
  id: string;
  label: string;
  text: string;
  score: number;
};

export function GeminiTeamCoach() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfiles(loadContextualProfiles());
    setWorkspaces(loadWorkspaces());
    setActiveWorkspaceId(loadActiveWorkspaceId());
    setReady(true);
  }, []);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
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

  const profile = selectPrimaryProfile(myProfiles, activeWorkspace);
  const interview = profile
    ? loadContextInterview(profile.id, profile.mode)
    : undefined;
  const completed = Boolean(interview?.completedAt);
  const completion = profile ? profileCompletion(profile) : 0;
  const freshness = profile
  ? profileFreshness(interview?.completedAt ?? null)
  : {
      confidence: 0,
      label: "Not started",
      status: "missing",
    };
  const quality = Math.min(
    100,
    Math.round(
      completion * 0.55 +
        freshness.confidence * 0.35 +
        (completed ? 10 : 0),
    ),
  );
  const dimensions = profile
    ? buildDimensions(profile, completed)
    : emptyDimensions();

  function startCoach() {
    let current = profile;

    if (!current) {
      const mode: ContextMode = activeWorkspace
        ? contextToMode(
            activeWorkspace.defaultContext ||
              defaultContextForWorkspace(activeWorkspace.type),
          )
        : "business";

      current = createContextualProfile(
        mode,
        user?.displayName || emailName(user?.email),
      );

      const updated = [...profiles, current];
      saveContextualProfiles(updated);
      setProfiles(updated);
    }

    saveActiveContextualProfileId(current.id);
    window.location.href = "/atlas";
  }

  function openInsights() {
    if (!profile) return;
    saveActiveContextualProfileId(profile.id);
    window.location.href = "/my-atlas-profile";
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing Gemini Team Coach…
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <div className={styles.productLabel}>
              <ProductIcon label="Gemini Team Coach" size="lg">
                ✦
              </ProductIcon>
              <div>
                <span className="eyebrow">Gemini Team Coach</span>
                <small>Powered by Google Gemini</small>
              </div>
            </div>

            <h1>Help AI understand how you work with others.</h1>
            <p>
              Complete a short Team Coach profile to improve future
              recommendations, strengthen explanations and help
              AutoTeams understand collaboration preferences.
            </p>

            <div className={styles.actions}>
              <button className="button" onClick={startCoach} type="button">
                {!profile
                  ? "Start Gemini Team Coach"
                  : completed
                    ? "Refresh My Team Coach Profile"
                    : completion > 15
                      ? "Continue Gemini Team Coach"
                      : "Start Gemini Team Coach"}{" "}
                →
              </button>

              {completed && (
                <button
                  className="button secondary"
                  onClick={openInsights}
                  type="button"
                >
                  View My AI Insights
                </button>
              )}
            </div>
          </div>

          <aside className={styles.qualityCard}>
            <span className="eyebrow">AI profile quality</span>
            <div className={styles.qualityScore}>
              <strong>{quality}%</strong>
              <small>
                {quality >= 85
                  ? "Strong"
                  : quality >= 55
                    ? "Developing"
                    : "Needs more information"}
              </small>
            </div>
            <div className={styles.bar}>
              <i style={{ width: `${quality}%` }} />
            </div>
            <p>
              Better profile information gives Gemini more evidence to
              explain team recommendations.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.metrics}>
            <Metric label="Profile completion" value={`${completion}%`} />
            <Metric label="AI confidence" value={`${freshness.confidence}%`} />
            <Metric label="Last updated" value={freshness.label} />
            <Metric
              label="Current context"
              value={
                activeWorkspace
                  ? workspaceTypeLabel(activeWorkspace.type)
                  : "General"
              }
            />
          </section>

          <section className={styles.section}>
            <div className={styles.heading}>
              <span className="eyebrow">
                What Gemini Team Coach learns
              </span>
              <h2>
                Six dimensions that improve team recommendations.
              </h2>
              <p>
                These dimensions use your existing Team Coach
                questions. They support explainable, human-reviewed
                recommendations.
              </p>
            </div>

            <div className={styles.dimensionGrid}>
              {dimensions.map((dimension) => (
                <article key={dimension.id}>
                  <header>
                    <ProductIcon
                      label={dimension.label}
                      size="sm"
                      subtle
                    >
                      {dimensionIcon(dimension.id)}
                    </ProductIcon>
                    <span>{dimension.score}%</span>
                  </header>
                  <h3>{dimension.label}</h3>
                  <p>{dimension.text}</p>
                  <div className={styles.smallBar}>
                    <i style={{ width: `${dimension.score}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.heading}>
              <span className="eyebrow">How Gemini uses your profile</span>
              <h2>Richer explanations, not automatic decisions.</h2>
            </div>

            <div className={styles.helpGrid}>
              <Help
                icon="✓"
                title="Recommendation quality"
                text="Compare skills with communication, leadership and working-style evidence."
              />
              <Help
                icon="◇"
                title="Explainability"
                text="Explain strengths, uncertainties and missing evidence."
              />
              <Help
                icon="△"
                title="Risk awareness"
                text="Treat incomplete profiles as uncertainty, not negative judgement."
              />
              <Help
                icon="♙"
                title="Human control"
                text="A person always reviews and confirms the final team."
              />
            </div>
          </section>

          <section className={styles.context}>
            <div>
              <span className="eyebrow">Current Coach context</span>
              <h2>
                {activeWorkspace?.name || "General collaboration profile"}
              </h2>
              <p>
                {activeWorkspace
                  ? `Aligned to the ${workspaceTypeLabel(
                      activeWorkspace.type,
                    ).toLowerCase()} context.`
                  : "Create or select a group to align future questions to a specific setting."}
              </p>
            </div>

            <div className={styles.contextActions}>
              <Link className="button secondary" href="/organisation">
                Manage My Group
              </Link>
              <Link className="button secondary" href="/profile/privacy">
                Profile Privacy
              </Link>
              <Link className="button secondary" href="/trust-centre">
                Trust Centre
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function Help({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article>
      <ProductIcon label={title} size="md">
        {icon}
      </ProductIcon>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function selectPrimaryProfile(
  profiles: ContextualProfile[],
  workspace?: Workspace,
): ContextualProfile | undefined {
  if (!profiles.length) return undefined;

  if (workspace) {
    const mode = contextToMode(
      workspace.defaultContext ||
        defaultContextForWorkspace(workspace.type),
    );
    return profiles.find((profile) => profile.mode === mode) || profiles[0];
  }

  return profiles[0];
}

function contextToMode(
  context:
    | "business"
    | "community"
    | "sports"
    | "education"
    | "friendship",
): ContextMode {
  const map: Record<
    "business" | "community" | "sports" | "education" | "friendship",
    ContextMode
  > = {
    business: "business",
    community: "community",
    sports: "sports",
    education: "education",
    friendship: "friendship",
  };
  return map[context];
}

function profileCompletion(profile: ContextualProfile): number {
  const values = [
    profile.preferredName,
    profile.generalLocation,
    profile.availability,
    profile.interests.length ? "yes" : "",
    ...Object.values(profile.fields).map((value) =>
      Array.isArray(value)
        ? value.length
          ? "yes"
          : ""
        : String(value || ""),
    ),
  ];

  return Math.round(
    (values.filter((value) => value.trim()).length /
      Math.max(values.length, 1)) *
      100,
  );
}

function buildDimensions(
  profile: ContextualProfile,
  completed: boolean,
): Dimension[] {
  const values = Object.values(profile.fields);
  const base = Math.round(
    (values.filter((value) =>
      Array.isArray(value)
        ? value.length
        : String(value || "").trim(),
    ).length /
      Math.max(values.length, 1)) *
      100,
  );
  const boost = completed ? 12 : 0;

  return [
    ["communication", "Communication", "How you share and receive information.", 4],
    ["leadership", "Leadership", "How you guide and support a team.", -2],
    ["decisions", "Decision making", "How you balance evidence, speed and consultation.", 0],
    ["motivation", "Motivation", "What helps you contribute and perform.", -5],
    ["conflict", "Conflict approach", "How you handle disagreement and rebuild alignment.", -7],
    ["collaboration", "Working style", "How you plan, adapt and work with others.", 2],
  ].map(([id, label, text, adjustment]) => ({
    id: String(id),
    label: String(label),
    text: String(text),
    score: Math.min(
      100,
      Math.max(0, base + boost + Number(adjustment)),
    ),
  }));
}

function emptyDimensions(): Dimension[] {
  return [
    ["communication", "Communication", "How you prefer to communicate."],
    ["leadership", "Leadership", "How you guide and support others."],
    ["decisions", "Decision making", "How you contribute to decisions."],
    ["motivation", "Motivation", "What helps you perform."],
    ["conflict", "Conflict approach", "How you handle disagreement."],
    ["collaboration", "Working style", "How you collaborate with others."],
  ].map(([id, label, text]) => ({
    id,
    label,
    text,
    score: 0,
  }));
}

function dimensionIcon(id: string): string {
  return {
    communication: "◔",
    leadership: "♙",
    decisions: "◇",
    motivation: "✦",
    conflict: "△",
    collaboration: "◎",
  }[id] || "○";
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const mailName = normalise(emailName(email));

  return Boolean(
    profileName &&
      (profileName === fullName ||
        profileName === mailName ||
        (fullName &&
          profileName === normalise(fullName.split(" ")[0]))),
  );
}

function emailName(
  email?: string | null,
): string {
  return (email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
}

function normalise(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

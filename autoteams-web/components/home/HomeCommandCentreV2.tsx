"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
} from "@/lib/atlas-interview-state";
import {
  Workspace,
  WorkspacePerson,
  loadActiveWorkspaceId,
  loadPeople,
  loadTalentPools,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./HomeCommandCentreV2.module.css";

export function HomeCommandCentreV2() {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [profiles, setProfiles] =
    useState<ContextualProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] =
    useState("");
  const [poolCount, setPoolCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentWorkspaceId = loadActiveWorkspaceId();

    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setProfiles(loadContextualProfiles());
    setActiveWorkspaceId(currentWorkspaceId);
    setPoolCount(
      loadTalentPools().filter(
        (pool) => pool.workspaceId === currentWorkspaceId,
      ).length,
    );
    setReady(true);
  }, []);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  const activePeople = people.filter(
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

  const completedProfiles = myProfiles.filter((profile) => {
    const interview = loadContextInterview(
      profile.id,
      profile.mode,
    );

    return Boolean(interview.completedAt);
  }).length;

  const hasGroup = Boolean(activeWorkspace);
  const hasPeople = activePeople.length > 0;
  const hasProfile = completedProfiles > 0;
  const canBuildTeam = hasGroup && hasPeople;

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing your AutoTeams home…
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Home</span>
            <h1>
              Good {dayPart()}, {firstName(
                user?.displayName || user?.email,
              )}.
            </h1>
            <p>
              AutoTeams helps you understand people and create better
              teams. Start with the outcome you need today.
            </p>
          </div>

          <aside className={styles.activeGroup}>
            <ProductIcon label="Current group" size="lg">
              ◇
            </ProductIcon>

            <div>
              <small>Currently working in</small>
              <strong>
                {activeWorkspace?.name || "No group selected"}
              </strong>
              <p>
                {activeWorkspace
                  ? `${workspaceTypeLabel(
                      activeWorkspace.type,
                    )} · ${activePeople.length} active people`
                  : "Create or select a group to begin."}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.nextAction}>
            <span className="eyebrow">Start here</span>
            <h2>What would you like to do today?</h2>

            <div className={styles.actionGrid}>
              <GoalCard
                icon="▥"
                title="Build a Team"
                text={
                  canBuildTeam
                    ? `Choose from ${activePeople.length} active people in ${activeWorkspace?.name}.`
                    : "AutoTeams will guide you through creating a group and adding people first."
                }
                status={
                  canBuildTeam
                    ? `${activePeople.length} people ready`
                    : "Setup required"
                }
                href="/team-builder"
                label="Start Team Builder"
                featured
              />

              <GoalCard
                icon="♙"
                title="Manage People"
                text={
                  hasGroup
                    ? `Add, invite and review people in ${activeWorkspace?.name}.`
                    : "Create a group before adding the people you want to work with."
                }
                status={
                  hasPeople
                    ? `${activePeople.length} active`
                    : "No people yet"
                }
                href={hasGroup ? "/people" : "/organisation"}
                label={hasGroup ? "Open People" : "Create My Group"}
              />

              <GoalCard
                icon="♡"
                title="Complete My Profile"
                text={
                  hasProfile
                    ? "Review how AutoTeams understands your collaboration preferences."
                    : "Complete a short interview so recommendations can consider how you work."
                }
                status={
                  hasProfile
                    ? `${completedProfiles} complete`
                    : "Not completed"
                }
                href="/profile"
                label={
                  hasProfile
                    ? "Review My Profile"
                    : "Start My Profile"
                }
              />
            </div>
          </section>

          <section className={styles.setup}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Getting ready</span>
                <h2>Three simple steps before your first team.</h2>
                <p>
                  AutoTeams checks what is missing and always sends you
                  to the next useful action.
                </p>
              </div>

              <strong>
                {readinessPercent(
                  hasGroup,
                  hasPeople,
                  hasProfile,
                )}
                %
              </strong>
            </div>

            <div className={styles.progressBar}>
              <i
                style={{
                  width: `${readinessPercent(
                    hasGroup,
                    hasPeople,
                    hasProfile,
                  )}%`,
                }}
              />
            </div>

            <div className={styles.setupGrid}>
              <SetupStep
                complete={hasGroup}
                number="1"
                title="Create your group"
                text="Your company, sports club, community, education group, friends or family."
                href="/organisation"
              />

              <SetupStep
                complete={hasPeople}
                number="2"
                title="Add people"
                text="The people AutoTeams is allowed to consider when creating teams."
                href={hasGroup ? "/people" : "/organisation"}
              />

              <SetupStep
                complete={hasProfile}
                number="3"
                title="Complete your profile"
                text="Your collaboration preferences improve the quality of recommendations."
                href="/profile"
              />
            </div>
          </section>

          <section className={styles.overview}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Overview</span>
                <h2>Your current AutoTeams setup.</h2>
              </div>
            </div>

            <div className={styles.metricGrid}>
              <Metric
                icon="◇"
                label="Groups"
                value={workspaces.length}
                href="/organisation"
              />

              <Metric
                icon="♙"
                label="People"
                value={activePeople.length}
                href="/people"
              />

              <Metric
                icon="◎"
                label="Saved people groups"
                value={poolCount}
                href="/talent-pools"
              />

              <Metric
                icon="♡"
                label="Completed profiles"
                value={completedProfiles}
                href="/profile"
              />
            </div>
          </section>

          <section className={styles.explain}>
            <div>
              <span className="eyebrow">
                How recommendations work
              </span>
              <h2>
                AutoTeams recommends. You make the final decision.
              </h2>
              <p>
                The recommendation can consider the team requirement,
                available people, skills, availability and collaboration
                preferences. The result remains explainable and
                reviewable by a person.
              </p>
            </div>

            <Link
              className="button secondary"
              href="/learning-centre"
            >
              Learn How It Works
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function GoalCard({
  icon,
  title,
  text,
  status,
  href,
  label,
  featured = false,
}: {
  icon: string;
  title: string;
  text: string;
  status: string;
  href: string;
  label: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`${styles.goalCard} ${
        featured ? styles.featured : ""
      }`}
    >
      <header>
        <ProductIcon label={title} size="lg">
          {icon}
        </ProductIcon>

        <span>{status}</span>
      </header>

      <h3>{title}</h3>
      <p>{text}</p>

      <Link className="button" href={href}>
        {label} →
      </Link>
    </article>
  );
}

function SetupStep({
  complete,
  number,
  title,
  text,
  href,
}: {
  complete: boolean;
  number: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <span
        className={
          complete
            ? styles.completeStep
            : styles.pendingStep
        }
      >
        {complete ? "✓" : number}
      </span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <em>{complete ? "Ready" : "Set up"} →</em>
    </Link>
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
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <ProductIcon label={label} size="sm" subtle>
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

function readinessPercent(
  hasGroup: boolean,
  hasPeople: boolean,
  hasProfile: boolean,
): number {
  return Math.round(
    ([hasGroup, hasPeople, hasProfile].filter(Boolean).length /
      3) *
      100,
  );
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const emailName = normalise(
    (email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " "),
  );

  if (!profileName) return false;

  return (
    profileName === fullName ||
    profileName === emailName ||
    Boolean(
      fullName &&
        profileName === normalise(fullName.split(" ")[0]),
    )
  );
}

function normalise(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function firstName(value?: string | null): string {
  if (!value) return "there";

  return value.trim().split(/[\s@]/)[0] || "there";
}

function dayPart(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";

  return "evening";
}

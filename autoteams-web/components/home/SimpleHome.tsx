"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ContextualProfile, loadContextualProfiles } from "@/lib/contextual-profiles";
import { loadContextInterview } from "@/lib/atlas-interview-state";
import {
  loadActiveWorkspaceId,
  loadPeople,
  loadTalentPools,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { loadDemoRecommendations, loadDemoTeams } from "@/lib/demo-environment";
import styles from "./SimpleHome.module.css";

export function SimpleHome() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfiles(loadContextualProfiles());
    setReady(true);
  }, []);

  const workspaces = ready ? loadWorkspaces() : [];
  const people = ready ? loadPeople() : [];
  const pools = ready ? loadTalentPools() : [];
  const teams = ready ? loadDemoTeams() : [];
  const recommendations = ready ? loadDemoRecommendations() : [];
  const activeWorkspaceId = ready ? loadActiveWorkspaceId() : "";
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const workspacePeople = people.filter((person) => person.workspaceId === activeWorkspaceId);
  const workspacePools = pools.filter((pool) => pool.workspaceId === activeWorkspaceId);

  const myProfiles = useMemo(
    () => profiles.filter((profile) => belongsToCurrentUser(profile, user?.displayName, user?.email)),
    [profiles, user?.displayName, user?.email],
  );

  const completedProfiles = myProfiles.filter((profile) => {
    const interview = loadContextInterview(profile.id, profile.mode);
    return Boolean(interview.completedAt);
  }).length;

  const profileAction = myProfiles.length === 0
    ? {
        title: "Complete My Profile",
        text: "Tell AutoTeams how you naturally collaborate with other people.",
        label: "Start My Profile",
        href: "/profile",
        status: "Not started",
      }
    : completedProfiles < myProfiles.length
      ? {
          title: "Complete My Profile",
          text: "Continue the short interview so recommendations can use your collaboration preferences.",
          label: "Continue My Profile",
          href: "/atlas",
          status: `${completedProfiles}/${myProfiles.length} complete`,
        }
      : {
          title: "Review My Profile",
          text: "Review how AutoTeams understands your collaboration preferences.",
          label: "Open My Profile",
          href: "/profile",
          status: "Ready",
        };

  const organisationAction = activeWorkspace
    ? {
        title: "Manage My Group",
        text: `${activeWorkspace.name} contains ${workspacePeople.length} people and ${workspacePools.length} saved groups.`,
        label: "Open My Group",
        href: "/organisation",
        status: workspaceTypeLabel(activeWorkspace.type),
      }
    : {
        title: "Create My Group",
        text: "Create the company, club, community or friendship group where you want to build teams.",
        label: "Create My Group",
        href: "/organisation",
        status: "Required",
      };

  const canBuildTeam = Boolean(activeWorkspace) && workspacePeople.length > 0;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Home</span>
            <h1>Good {dayPart()}, {firstName(user?.displayName || user?.email)}.</h1>
            <p>AutoTeams helps you understand people and build better teams. Choose what you want to do today.</p>
          </div>

          <aside className={styles.contextCard}>
            <span className={styles.contextIcon}>◇</span>
            <div>
              <small>Currently working in</small>
              <strong>{activeWorkspace?.name || "No group selected"}</strong>
              <p>
                {activeWorkspace
                  ? `${workspaceTypeLabel(activeWorkspace.type)} · ${workspacePeople.length} people`
                  : "Create or select a group before building a team."}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.start}>
            <span className="eyebrow">Start here</span>
            <h2>What would you like to do today?</h2>

            <div className={styles.actionGrid}>
              <ActionCard
                icon="▥"
                title="Build a Team"
                text={
                  canBuildTeam
                    ? `Choose from ${workspacePeople.length} people in ${activeWorkspace?.name}.`
                    : "Add people to your group before asking AutoTeams to recommend a team."
                }
                label={canBuildTeam ? "Build My Team" : "Add People First"}
                href={canBuildTeam ? "/team-builder" : "/people"}
                status={canBuildTeam ? `${workspacePeople.length} people available` : "Not ready"}
                primary
              />

              <ActionCard
                icon="♙"
                title={profileAction.title}
                text={profileAction.text}
                label={profileAction.label}
                href={profileAction.href}
                status={profileAction.status}
              />

              <ActionCard
                icon="◇"
                title={organisationAction.title}
                text={organisationAction.text}
                label={organisationAction.label}
                href={organisationAction.href}
                status={organisationAction.status}
              />
            </div>
          </section>

          <section className={styles.readiness}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Your setup</span>
                <h2>Three things are needed to build a team.</h2>
              </div>
            </div>

            <div className={styles.readinessGrid}>
              <ReadinessItem number="1" title="A group" text="Your company, club, community or friendship group." complete={Boolean(activeWorkspace)} href="/organisation" />
              <ReadinessItem number="2" title="People" text="The members AutoTeams is allowed to consider." complete={workspacePeople.length > 0} href="/people" />
              <ReadinessItem number="3" title="Profiles" text="Collaboration preferences that improve recommendations." complete={completedProfiles > 0} href="/profile" />
            </div>
          </section>

          <section className={styles.overview}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">Overview</span>
                <h2>Your AutoTeams activity.</h2>
              </div>
            </div>

            <div className={styles.metrics}>
              <Metric label="People" value={workspacePeople.length} href="/people" />
              <Metric label="Saved groups" value={workspacePools.length} href="/talent-pools" />
              <Metric label="Teams" value={teams.length} href="/teams" />
              <Metric label="Recommendations" value={recommendations.length} href="/matches" />
            </div>
          </section>

          <section className={styles.explanation}>
            <div>
              <span className="eyebrow">AutoTeams intelligence</span>
              <h2>You make the decision. AutoTeams explains the evidence.</h2>
              <p>
                AutoTeams considers the team requirement, eligible people, availability, skills and collaboration preferences. It then presents an explainable recommendation for human review.
              </p>
            </div>
            <Link className="button secondary" href="/learning-centre">Learn How It Works</Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function ActionCard({ icon, title, text, label, href, status, primary = false }: {
  icon: string;
  title: string;
  text: string;
  label: string;
  href: string;
  status: string;
  primary?: boolean;
}) {
  return (
    <article className={`${styles.actionCard} ${primary ? styles.primaryAction : ""}`}>
      <header>
        <span>{icon}</span>
        <small>{status}</small>
      </header>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="button" href={href}>{label} →</Link>
    </article>
  );
}

function ReadinessItem({ number, title, text, complete, href }: {
  number: string;
  title: string;
  text: string;
  complete: boolean;
  href: string;
}) {
  return (
    <Link href={href}>
      <span className={complete ? styles.completeStep : styles.incompleteStep}>{complete ? "✓" : number}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <em>{complete ? "Ready" : "Set up"} →</em>
    </Link>
  );
}

function Metric({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>Open →</span>
    </Link>
  );
}

function belongsToCurrentUser(profile: ContextualProfile, displayName?: string | null, email?: string | null): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const emailName = normalise((email || "").split("@")[0].replace(/[._-]+/g, " "));

  if (!profileName) return false;

  return profileName === fullName || profileName === emailName || Boolean(fullName && profileName === normalise(fullName.split(" ")[0]));
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

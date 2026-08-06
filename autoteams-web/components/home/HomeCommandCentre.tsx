"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import { buildTeamDnaInsight } from "@/lib/team-dna-insights";
import {
  loadDemoRecommendations,
  loadDemoTeams,
} from "@/lib/demo-environment";
import { loadNotifications } from "@/lib/notifications";
import {
  loadActiveWorkspaceId,
  loadPeople,
  loadTalentPools,
  loadWorkspaces,
} from "@/lib/workspaces";
import {
  loadInvitations,
  loadMemberships,
} from "@/lib/workspace-access";
import { AtlasAssistant } from "@/components/atlas-assistant/AtlasAssistant";
import {
  AtlasIcon,
  DnaIcon,
  PeopleIcon,
  TalentPoolIcon,
  WorkspaceIcon,
  RecommendationIcon,
  TeamIcon,
  NotificationIcon,
} from "@/components/ui/AppIcons";
import styles from "./HomeCommandCentre.module.css";

type ActivityItem = {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
};

export function HomeCommandCentre() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfiles(loadContextualProfiles());
    setReady(true);
  }, []);

  const insights = useMemo(
    () =>
      profiles.map((profile) => ({
        profile,
        insight: buildTeamDnaInsight(profile.id, profile.mode),
      })),
    [profiles],
  );

  const workspaces = ready ? loadWorkspaces() : [];
  const people = ready ? loadPeople() : [];
  const talentPools = ready ? loadTalentPools() : [];
  const memberships = ready ? loadMemberships() : [];
  const invitations = ready ? loadInvitations() : [];
  const teams = ready ? loadDemoTeams() : [];
  const recommendations = ready ? loadDemoRecommendations() : [];
  const notifications = ready ? loadNotifications() : [];

  const workspaceId = ready ? loadActiveWorkspaceId() : "";
  const workspace = workspaces.find((item) => item.id === workspaceId);

  const workspacePeople = people.filter(
    (item) => item.workspaceId === workspaceId,
  );

  const workspacePools = talentPools.filter(
    (item) => item.workspaceId === workspaceId,
  );

  const activeMembers = memberships.filter(
    (item) =>
      item.workspaceId === workspaceId &&
      item.status === "active",
  );

  const pendingInvites = invitations.filter(
    (item) =>
      item.workspaceId === workspaceId &&
      item.status === "pending",
  );

  const unread = notifications.filter((item) => !item.read);

  const completeProfiles = insights.filter(
    ({ insight }) => insight.interviewComplete,
  );

  const staleProfiles = insights.filter(
    ({ insight }) =>
      insight.freshnessStatus === "stale" ||
      insight.freshnessStatus === "aging",
  );

  const profileCoverage = profiles.length
    ? Math.round((completeProfiles.length / profiles.length) * 100)
    : 0;

  const peopleReady = workspacePeople.filter(
    (person) => person.teamDnaStatus === "ready",
  ).length;

  const atlasHealth = calculateAtlasHealth(
    profileCoverage,
    staleProfiles.length,
    workspacePeople.length,
    peopleReady,
  );

  const activities = buildActivities({
    workspaceName: workspace?.name,
    teams: teams.length,
    recommendations: recommendations.length,
    pendingInvites: pendingInvites.length,
    unread: unread.length,
    staleProfiles: staleProfiles.length,
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Home</span>
            <h1>
              Good {dayPart()}, {firstName(user?.displayName || user?.email)}.
            </h1>
            <p>
              Continue your work, review Atlas readiness and manage the active
              workspace from one place.
            </p>

            <div className="actions">
              <Link className="button" href="/team-builder">
                Build a Team
              </Link>
              <Link className="button secondary" href="/atlas-workspace">
                Open Atlas Workspace
              </Link>
            </div>
          </div>

          <aside className={styles.workspaceCard}>
            <span className="eyebrow">Active workspace</span>
            <h2>{workspace?.name || "No workspace selected"}</h2>
            <p>
              {workspace
                ? `${activeMembers.length} active members and ${workspacePools.length} Talent Pools`
                : "Create or select a workspace to begin building teams."}
            </p>
            <Link href="/workspaces">
              {workspace ? "Manage workspace →" : "Create workspace →"}
            </Link>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.metricGrid}>
            <Metric
              label="Workspace members"
              value={activeMembers.length}
              detail={`${pendingInvites.length} invitation${
                pendingInvites.length === 1 ? "" : "s"
              } pending`}
              href="/profile/membership"
            />
            <Metric
              label="People Atlas-ready"
              value={`${peopleReady}/${workspacePeople.length}`}
              detail="Talent with completed collaboration profiles"
              href="/talent"
            />
            <Metric
              label="Active teams"
              value={teams.length}
              detail="Saved or demo teams available"
              href="/teams"
            />
            <Metric
              label="Recommendations"
              value={recommendations.length}
              detail="Atlas recommendations available for review"
              href="/matches"
            />
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.primaryColumn}>
              <section className={styles.quickActions}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className="eyebrow">Quick actions</span>
                    <h2>What would you like to do?</h2>
                  </div>
                </div>

                <div className={styles.actionGrid}>
                  <QuickAction
                    icon={<AtlasIcon size="lg" />}
                    title="Build a Team"
                    text="Describe a requirement and let Atlas recommend a balanced team."
                    href="/team-builder"
                    primary
                  />
                  <QuickAction
                    icon={<PeopleIcon size="lg" />}
                    title="Invite Members"
                    text="Add people to the active workspace and assign roles."
                    href="/profile/membership"
                  />
                  <QuickAction
                    icon={<TalentPoolIcon size="lg" />}
                    title="Create Talent Pool"
                    text="Define the eligible population Atlas may consider."
                    href="/talent-pools"
                  />
                  <QuickAction
                    icon={<DnaIcon size="lg" />}
                    title="Review My Atlas Profile"
                    text="Check confidence, freshness and collaboration traits."
                    href="/my-atlas-profile"
                  />
                </div>
              </section>

              <section className={styles.healthPanel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className="eyebrow">Workspace health</span>
                    <h2>Is the workspace ready for Atlas?</h2>
                  </div>
                  <strong>{atlasHealth}%</strong>
                </div>

                <div className={styles.healthBar}>
                  <i style={{ width: `${atlasHealth}%` }} />
                </div>

                <div className={styles.healthMetrics}>
                  <HealthMetric
                    label="Profile coverage"
                    value={`${profileCoverage}%`}
                    good={profileCoverage >= 80}
                  />
                  <HealthMetric
                    label="People ready"
                    value={`${peopleReady}/${workspacePeople.length}`}
                    good={
                      workspacePeople.length > 0 &&
                      peopleReady / workspacePeople.length >= 0.8
                    }
                  />
                  <HealthMetric
                    label="Profiles to review"
                    value={staleProfiles.length}
                    good={staleProfiles.length === 0}
                  />
                  <HealthMetric
                    label="Pending invitations"
                    value={pendingInvites.length}
                    good={pendingInvites.length === 0}
                  />
                </div>
              </section>

              <section className={styles.activityPanel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className="eyebrow">Recent activity</span>
                    <h2>What needs your attention.</h2>
                  </div>
                  <Link href="/notifications">All notifications →</Link>
                </div>

                <div className={styles.activityList}>
                  {activities.map((item) => (
                    <Link href={item.href} key={`${item.title}-${item.text}`}>
                      {item.icon}
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </div>
                      <em>Open →</em>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.assistantColumn}>
              <AtlasAssistant
                context="home"
                profiles={profiles.length}
                completedProfiles={completeProfiles.length}
                staleProfiles={staleProfiles.length}
                pendingInvitations={pendingInvites.length}
                recommendations={recommendations.length}
                teams={teams.length}
              />
            </aside>
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
  href,
}: {
  label: string;
  value: string | number;
  detail: string;
  href: string;
}) {
  return (
    <Link className={styles.metric} href={href}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{detail}</span>
    </Link>
  );
}

function QuickAction({
  icon,
  title,
  text,
  href,
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      className={primary ? styles.primaryAction : ""}
      href={href}
    >
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
      <footer>Continue →</footer>
    </Link>
  );
}

function HealthMetric({
  label,
  value,
  good,
}: {
  label: string;
  value: string | number;
  good: boolean;
}) {
  return (
    <article>
      <span className={good ? styles.good : styles.attention} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function buildActivities({
  workspaceName,
  teams,
  recommendations,
  pendingInvites,
  unread,
  staleProfiles,
}: {
  workspaceName?: string;
  teams: number;
  recommendations: number;
  pendingInvites: number;
  unread: number;
  staleProfiles: number;
}): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (workspaceName) {
    items.push({
      icon: <WorkspaceIcon size="sm" />,
      title: workspaceName,
      text: "This is your active workspace.",
      href: "/workspaces",
    });
  }

  if (recommendations > 0) {
    items.push({
      icon: <RecommendationIcon size="sm" />,
      title: "Atlas recommendations available",
      text: `${recommendations} recommendation${
        recommendations === 1 ? "" : "s"
      } can be reviewed.`,
      href: "/matches",
    });
  }

  if (staleProfiles > 0) {
    items.push({
      icon: <DnaIcon size="sm" />,
      title: "Atlas Profiles need review",
      text: `${staleProfiles} profile${
        staleProfiles === 1 ? "" : "s"
      } are aging or stale.`,
      href: "/my-atlas-profile",
    });
  }

  if (pendingInvites > 0) {
    items.push({
      icon: <PeopleIcon size="sm" />,
      title: "Workspace invitations pending",
      text: `${pendingInvites} invitation${
        pendingInvites === 1 ? "" : "s"
      } are waiting for a response.`,
      href: "/profile/membership",
    });
  }

  if (unread > 0) {
    items.push({
      icon: <NotificationIcon size="sm" />,
      title: "Unread notifications",
      text: `${unread} update${unread === 1 ? "" : "s"} require attention.`,
      href: "/notifications",
    });
  }

  if (teams > 0) {
    items.push({
      icon: <TeamIcon size="sm" />,
      title: "Teams ready for review",
      text: `${teams} team${teams === 1 ? "" : "s"} can be opened or analysed.`,
      href: "/teams",
    });
  }

  return items.slice(0, 5);
}

function calculateAtlasHealth(
  profileCoverage: number,
  staleProfiles: number,
  people: number,
  peopleReady: number,
): number {
  const readiness = people ? (peopleReady / people) * 100 : 0;
  const freshnessPenalty = Math.min(25, staleProfiles * 7);

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(profileCoverage * 0.5 + readiness * 0.5 - freshnessPenalty),
    ),
  );
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

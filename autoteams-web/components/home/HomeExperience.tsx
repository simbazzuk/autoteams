"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  loadContextualProfiles,
  ContextualProfile,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
  profileFreshness,
} from "@/lib/atlas-interview-state";
import {
  loadActiveWorkspaceId,
  loadWorkspaces,
  loadPeople,
  loadTalentPools,
} from "@/lib/workspaces";
import {
  loadInvitations,
  loadMemberships,
} from "@/lib/workspace-access";
import { loadNotifications } from "@/lib/notifications";

type JourneyItem = {
  title: string;
  text: string;
  href: string;
  complete: boolean;
  time: string;
};

export function HomeExperience() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    setProfiles(loadContextualProfiles());
    setWorkspaceId(loadActiveWorkspaceId());
  }, []);

  const workspaces = loadWorkspaces();
  const people = loadPeople();
  const pools = loadTalentPools();
  const memberships = loadMemberships();
  const invitations = loadInvitations();
  const notifications = loadNotifications();

  const workspace = workspaces.find((item) => item.id === workspaceId);
  const workspacePeople = people.filter((item) => item.workspaceId === workspaceId);
  const workspacePools = pools.filter((item) => item.workspaceId === workspaceId);
  const workspaceMembers = memberships.filter(
    (item) => item.workspaceId === workspaceId && item.status === "active",
  );
  const pendingInvites = invitations.filter(
    (item) => item.workspaceId === workspaceId && item.status === "pending",
  );
  const unreadNotifications = notifications.filter((item) => !item.read);

  const profileInsights = useMemo(
    () =>
      profiles.map((profile) => ({
        profile,
        interview: loadContextInterview(profile.id, profile.mode),
      })),
    [profiles],
  );

  const completedProfiles = profileInsights.filter(
    ({ interview }) => Boolean(interview.completedAt),
  );
  const staleProfiles = profileInsights.filter(({ interview }) =>
    ["stale", "aging"].includes(profileFreshness(interview.completedAt).status),
  );

  const journey: JourneyItem[] = [
    {
      title: "Create or join a workspace",
      text: "A workspace keeps people and recommendations inside the correct boundary.",
      href: "/workspaces",
      complete: Boolean(workspace),
      time: "2 min",
    },
    {
      title: "Create your contextual profile",
      text: "Choose Business, Friendship, Community, Sports or Education.",
      href: "/profile",
      complete: profiles.length > 0,
      time: "3 min",
    },
    {
      title: "Complete the Atlas interview",
      text: "Answer core questions once, then add the selected context.",
      href: "/atlas",
      complete: completedProfiles.length > 0,
      time: "8 min",
    },
    {
      title: "Review your Team DNA",
      text: "Check confidence, freshness, strengths and development themes.",
      href: "/team-dna",
      complete: completedProfiles.length > 0,
      time: "2 min",
    },
    {
      title: "Create a Talent Pool",
      text: "Define the eligible population Atlas should consider.",
      href: "/talent-pools",
      complete: workspacePools.length > 0,
      time: "3 min",
    },
    {
      title: "Build and review a team",
      text: "Describe the need, then review Atlas recommendations and explanations.",
      href: "/team-builder",
      complete: false,
      time: "5 min",
    },
  ];

  const progress = Math.round(
    (journey.filter((item) => item.complete).length / journey.length) * 100,
  );

  const nextStep = journey.find((item) => !item.complete) || journey[journey.length - 1];

  return (
    <main className="ux14-home">
      <section className="ux14-home-hero">
        <div className="container ux14-home-hero-grid">
          <div>
            <span className="eyebrow">Home</span>
            <h1>
              Good {dayPart()}, {firstName(user?.displayName || user?.email)}.
            </h1>
            <p>
              AutoTeams is ready to guide you from profile creation through to
              an explainable Atlas team recommendation.
            </p>

            <div className="actions">
              <Link className="button" href={nextStep.href}>
                Continue: {nextStep.title}
              </Link>
              <Link className="button secondary" href="/product-guide">
                View Product Guide
              </Link>
            </div>
          </div>

          <aside className="ux14-progress-card">
            <span className="eyebrow">Your progress</span>
            <strong>{progress}%</strong>
            <div className="bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              {journey.filter((item) => item.complete).length} of {journey.length}
              {" "}core steps complete
            </p>
          </aside>
        </div>
      </section>

      <section className="ux14-home-body">
        <div className="container">
          <section className="ux14-next-step">
            <div>
              <span className="eyebrow">Recommended next step</span>
              <h2>{nextStep.title}</h2>
              <p>{nextStep.text}</p>
            </div>
            <div>
              <span>{nextStep.time}</span>
              <Link className="button" href={nextStep.href}>
                Continue
              </Link>
            </div>
          </section>

          <section className="ux14-health-grid">
            <HealthCard
              label="Workspace members"
              value={workspaceMembers.length}
              detail={workspace?.name || "No active workspace"}
              href="/profile/membership"
            />
            <HealthCard
              label="People ready"
              value={`${workspacePeople.filter((person) => person.teamDnaStatus === "ready").length}/${workspacePeople.length}`}
              detail="Talent with completed Team DNA"
              href="/talent"
            />
            <HealthCard
              label="Talent Pools"
              value={workspacePools.length}
              detail="Eligible Atlas populations"
              href="/talent-pools"
            />
            <HealthCard
              label="Profiles to review"
              value={staleProfiles.length}
              detail="Aging or stale Team DNA"
              href="/team-dna"
            />
            <HealthCard
              label="Pending invitations"
              value={pendingInvites.length}
              detail="People waiting to join"
              href="/profile/membership"
            />
            <HealthCard
              label="Unread updates"
              value={unreadNotifications.length}
              detail="Notifications needing attention"
              href="/notifications"
            />
          </section>

          <section className="ux14-home-grid">
            <article className="ux14-home-panel">
              <div className="ux14-section-heading">
                <div>
                  <span className="eyebrow">Guided journey</span>
                  <h2>How AutoTeams works.</h2>
                </div>
                <Link href="/product-guide">Full guide →</Link>
              </div>

              <div className="ux14-journey-list">
                {journey.map((item, index) => (
                  <Link className={item.complete ? "complete" : ""} href={item.href} key={item.title}>
                    <span>{item.complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </div>
                    <em>{item.time}</em>
                  </Link>
                ))}
              </div>
            </article>

            <aside className="ux14-home-panel">
              <div className="ux14-section-heading">
                <div>
                  <span className="eyebrow">Atlas status</span>
                  <h2>Your Team DNA.</h2>
                </div>
              </div>

              <div className="ux14-profile-health-list">
                {profileInsights.length ? (
                  profileInsights.slice(0, 5).map(({ profile, interview }) => {
                    const freshness = profileFreshness(interview.completedAt);
                    return (
                      <Link href="/team-dna" key={profile.id}>
                        <span>{profileIcon(profile.mode)}</span>
                        <div>
                          <strong>{profile.label}</strong>
                          <small>{freshness.label}</small>
                        </div>
                        <em className={freshness.status}>
                          {freshness.confidence}%
                        </em>
                      </Link>
                    );
                  })
                ) : (
                  <div className="ux14-empty-card">
                    <p>No contextual profile has been created yet.</p>
                    <Link className="button" href="/profile">
                      Create Profile
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function HealthCard({
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
    <Link className="ux14-health-card" href={href}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{detail}</span>
    </Link>
  );
}

function firstName(value?: string | null): string {
  if (!value) return "there";
  return value.split(/[\s@]/)[0] || "there";
}

function dayPart(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function profileIcon(mode: ContextualProfile["mode"]): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

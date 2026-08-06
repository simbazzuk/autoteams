"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  ContextMode,
  ContextualProfile,
  contextLabel,
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
  loadActiveWorkspaceId,
  loadWorkspaces,
} from "@/lib/workspaces";
import { loadMemberships, roleLabel } from "@/lib/workspace-access";

const allModes: ContextMode[] = [
  "business",
  "friendship",
  "community",
  "sports",
  "education",
];

export function MyProfileDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");

  useEffect(() => {
    setProfiles(loadContextualProfiles());
    setActiveWorkspaceId(loadActiveWorkspaceId());
  }, []);

  const workspaces = loadWorkspaces();
  const memberships = loadMemberships();

  const currentWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  const currentMembership = memberships.find(
    (membership) =>
      membership.workspaceId === activeWorkspaceId &&
      membership.userId === "demo-owner" &&
      membership.status === "active",
  );

  const profileStats = useMemo(() => {
    const completed = profiles.filter((profile) => {
      const interview = loadContextInterview(profile.id, profile.mode);
      return Boolean(interview.completedAt);
    }).length;

    const averageConfidence =
      profiles.length === 0
        ? 0
        : Math.round(
            profiles.reduce((total, profile) => {
              const interview = loadContextInterview(profile.id, profile.mode);
              return total + profileFreshness(interview.completedAt).confidence;
            }, 0) / profiles.length,
          );

    const stale = profiles.filter((profile) => {
      const interview = loadContextInterview(profile.id, profile.mode);
      return profileFreshness(interview.completedAt).status === "stale";
    }).length;

    return {
      completed,
      averageConfidence,
      stale,
    };
  }, [profiles]);

  function createProfile(mode: ContextMode) {
    const created = createContextualProfile(mode, user?.displayName || "");
    const updated = [...profiles, created];
    saveContextualProfiles(updated);
    saveActiveContextualProfileId(created.id);
    setProfiles(updated);
  }

  function openProfile(profile: ContextualProfile, href: string) {
    saveActiveContextualProfileId(profile.id);
    window.location.href = href;
  }

  return (
    <main className="profile130-page">
      <section className="profile130-hero">
        <div className="container profile130-hero-grid">
          <div>
            <span className="eyebrow">My Profile</span>
            <h1>Manage every part of your AutoTeams identity.</h1>
            <p>
              Update personal information, create contextual profiles, review
              Team DNA health and continue Atlas interviews without returning to
              onboarding.
            </p>
          </div>

          <aside className="profile130-account-card">
            <div className="profile130-avatar">
              {(user?.displayName || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <span className="eyebrow">Signed-in account</span>
              <h2>{user?.displayName || "AutoTeams User"}</h2>
              <p>{user?.email}</p>
              <span className={user?.emailVerified ? "verified" : "unverified"}>
                {user?.emailVerified ? "Email verified" : "Email not verified"}
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="profile130-body">
        <div className="container">
          <section className="profile130-summary-grid">
            <article>
              <small>Context profiles</small>
              <strong>{profiles.length}</strong>
            </article>
            <article>
              <small>Completed Team DNA</small>
              <strong>{profileStats.completed}</strong>
            </article>
            <article>
              <small>Average confidence</small>
              <strong>{profileStats.averageConfidence}%</strong>
            </article>
            <article>
              <small>Refresh recommended</small>
              <strong>{profileStats.stale}</strong>
            </article>
          </section>

          <section className="profile130-section">
            <div className="profile130-section-heading">
              <div>
                <span className="eyebrow">Context profiles</span>
                <h2>Your Team DNA for different contexts.</h2>
                <p>
                  Editing profile information does not restart the Atlas
                  interview. Refresh Team DNA only when you choose to.
                </p>
              </div>
              <Link className="button secondary" href="/onboarding/profile">
                Manage All Profiles
              </Link>
            </div>

            <div className="profile130-profile-grid">
              {allModes.map((mode) => {
                const profile = profiles.find((item) => item.mode === mode);

                if (!profile) {
                  return (
                    <article className="profile130-context-card empty" key={mode}>
                      <div className="profile130-card-top">
                        <span>{modeIcon(mode)}</span>
                        <em>Not created</em>
                      </div>
                      <h3>{contextLabel(mode)}</h3>
                      <p>
                        Create a separate profile for your {mode} context.
                      </p>
                      <button
                        className="button secondary"
                        onClick={() => createProfile(mode)}
                        type="button"
                      >
                        Create Profile
                      </button>
                    </article>
                  );
                }

                const interview = loadContextInterview(
                  profile.id,
                  profile.mode,
                );
                const freshness = profileFreshness(interview.completedAt);

                return (
                  <article
                    className="profile130-context-card"
                    key={profile.id}
                  >
                    <div className="profile130-card-top">
                      <span>{modeIcon(profile.mode)}</span>
                      <em>{freshness.status}</em>
                    </div>

                    <h3>{profile.label}</h3>
                    <p>
                      Separate profile and Team DNA for your {profile.mode}
                      context.
                    </p>

                    <div className={`profile130-health ${freshness.status}`}>
                      <div>
                        <small>Confidence</small>
                        <strong>{freshness.confidence}%</strong>
                      </div>
                      <div>
                        <small>Last updated</small>
                        <strong>{freshness.label}</strong>
                      </div>
                    </div>

                    <div className="profile130-completion">
                      <div>
                        <span>Profile completion</span>
                        <strong>{profileCompletion(profile)}%</strong>
                      </div>
                      <div className="bar">
                        <i
                          style={{ width: `${profileCompletion(profile)}%` }}
                        />
                      </div>
                    </div>

                    <div className="profile130-card-actions">
                      <button
                        className="button secondary"
                        onClick={() =>
                          openProfile(profile, "/onboarding/profile")
                        }
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => openProfile(profile, "/atlas")}
                        type="button"
                      >
                        Atlas
                      </button>
                      <button
                        className="button"
                        onClick={() => openProfile(profile, "/team-dna")}
                        type="button"
                      >
                        Team DNA
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="profile130-two-column">
            <article className="profile130-panel">
              <div className="profile130-section-heading compact">
                <div>
                  <span className="eyebrow">Workspace membership</span>
                  <h2>Where you currently belong.</h2>
                </div>
              </div>

              {currentWorkspace ? (
                <div className="profile130-membership-card">
                  <span>◇</span>
                  <div>
                    <strong>{currentWorkspace.name}</strong>
                    <small>{currentWorkspace.description}</small>
                  </div>
                  <em>
                    {currentMembership
                      ? roleLabel(currentMembership.role, "business")
                      : "Member"}
                  </em>
                </div>
              ) : (
                <div className="profile130-empty-state">
                  <p>You are not currently using a workspace.</p>
                  <Link className="button" href="/workspaces">
                    Choose Workspace
                  </Link>
                </div>
              )}

              <div className="profile130-panel-actions">
                <Link className="button secondary" href="/profile/membership">
                  Workspace Membership
                </Link>
                <Link className="button secondary" href="/members">
                  Members & Roles
                </Link>
              </div>
            </article>

            <article className="profile130-panel">
              <div className="profile130-section-heading compact">
                <div>
                  <span className="eyebrow">Profile controls</span>
                  <h2>Privacy, security and account settings.</h2>
                </div>
              </div>

              <div className="profile130-control-list">
                <Link href="/profile/privacy">
                  <span>◇</span>
                  <div>
                    <strong>Privacy Centre</strong>
                    <small>Consent, visibility, export and deletion.</small>
                  </div>
                  <em>→</em>
                </Link>
                <Link href="/profile/security">
                  <span>✓</span>
                  <div>
                    <strong>Account Security</strong>
                    <small>Email verification, sessions and MFA readiness.</small>
                  </div>
                  <em>→</em>
                </Link>
                <Link href="/notifications">
                  <span>◔</span>
                  <div>
                    <strong>Notifications</strong>
                    <small>Reminders, invitations and security updates.</small>
                  </div>
                  <em>→</em>
                </Link>
                <Link href="/settings">
                  <span>⚙</span>
                  <div>
                    <strong>Settings</strong>
                    <small>Theme, notifications and account preferences.</small>
                  </div>
                  <em>→</em>
                </Link>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

function modeIcon(mode: ContextMode): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

function profileCompletion(profile: ContextualProfile): number {
  const commonValues = [
    profile.preferredName,
    profile.generalLocation,
    profile.availability,
    profile.interests.length ? "yes" : "",
  ];

  const contextValues = Object.values(profile.fields).map((value) =>
    Array.isArray(value) ? (value.length ? "yes" : "") : String(value || ""),
  );

  const values = [...commonValues, ...contextValues];
  const completed = values.filter((value) => value.trim().length > 0).length;

  return Math.round((completed / Math.max(values.length, 1)) * 100);
}

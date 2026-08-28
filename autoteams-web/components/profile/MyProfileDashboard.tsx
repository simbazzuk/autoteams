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
  WorkspaceContext,
  defaultContextForWorkspace,
  loadActiveWorkspaceId,
  loadWorkspaces,
} from "@/lib/workspaces";
import {
  loadMemberships,
  roleLabel,
} from "@/lib/workspace-access";
import styles from "./MyProfileDashboard.module.css";

const allModes: ContextMode[] = [
  "business",
  "friendship",
  "community",
  "sports",
  "education",
];

export function MyProfileDashboard() {
  const { user } = useAuth();
  const [allProfiles, setAllProfiles] = useState<ContextualProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadedProfiles = loadContextualProfiles();
    const workspaceId = loadActiveWorkspaceId();

    setAllProfiles(loadedProfiles);
    setActiveWorkspaceId(workspaceId);
    setReady(true);
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

  const myProfiles = useMemo(
    () =>
      allProfiles.filter((profile) =>
        belongsToCurrentUser(
          profile,
          user?.displayName,
          user?.email,
        ),
      ),
    [allProfiles, user?.displayName, user?.email],
  );

  useEffect(() => {
    if (!ready || !currentWorkspace || myProfiles.length > 0) {
      return;
    }

    const defaultMode = workspaceContextToMode(
      currentWorkspace.defaultContext ||
        defaultContextForWorkspace(currentWorkspace.type),
    );

    const created = createContextualProfile(
      defaultMode,
      user?.displayName || emailDisplayName(user?.email),
    );

    const updated = [...allProfiles, created];

    saveContextualProfiles(updated);
    saveActiveContextualProfileId(created.id);
    setAllProfiles(updated);
  }, [
    ready,
    currentWorkspace,
    myProfiles.length,
    allProfiles,
    user?.displayName,
    user?.email,
  ]);

  const availableModes = allModes.filter(
    (mode) =>
      !myProfiles.some((profile) => profile.mode === mode),
  );

  const profileStats = useMemo(() => {
    const completed = myProfiles.filter((profile) => {
      const interview = loadContextInterview(
        profile.id,
        profile.mode,
      );

      return Boolean(interview.completedAt);
    }).length;

    const averageConfidence =
      myProfiles.length === 0
        ? 0
        : Math.round(
            myProfiles.reduce((total, profile) => {
              const interview = loadContextInterview(
                profile.id,
                profile.mode,
              );

              return (
                total +
                profileFreshness(interview.completedAt).confidence
              );
            }, 0) / myProfiles.length,
          );

    const stale = myProfiles.filter((profile) => {
      const interview = loadContextInterview(
        profile.id,
        profile.mode,
      );

      return (
        profileFreshness(interview.completedAt).status === "stale"
      );
    }).length;

    return {
      completed,
      averageConfidence,
      stale,
    };
  }, [myProfiles]);

  function createProfile(mode: ContextMode) {
    if (myProfiles.some((profile) => profile.mode === mode)) {
      return;
    }

    const created = createContextualProfile(
      mode,
      user?.displayName || emailDisplayName(user?.email),
    );

    const updated = [...allProfiles, created];

    saveContextualProfiles(updated);
    saveActiveContextualProfileId(created.id);
    setAllProfiles(updated);
    setShowAddProfile(false);
    window.location.href = "/atlas";
  }

  function openProfile(
    profile: ContextualProfile,
    href: string,
  ) {
    saveActiveContextualProfileId(profile.id);
    window.location.href = href;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">My Atlas Profiles</span>
            <h1>Manage how Atlas understands you.</h1>
            <p>
              Each Atlas Profile is separate. Your Business,
              Friendship, Community, Sports and Education answers are
              only used in the relevant setting.
            </p>
          </div>

          <aside className={styles.accountCard}>
            <div className={styles.avatar}>
              {(user?.displayName || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <span className="eyebrow">Signed-in account</span>
              <h2>{user?.displayName || "TeamScience.ai User"}</h2>
              <p>{user?.email}</p>
              <span
                className={
                  user?.emailVerified
                    ? styles.verified
                    : styles.unverified
                }
              >
                {user?.emailVerified
                  ? "Email verified"
                  : "Email not verified"}
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <section className={styles.summaryGrid}>
            <Metric
              label="My profiles"
              value={myProfiles.length}
            />
            <Metric
              label="Completed"
              value={profileStats.completed}
            />
            <Metric
              label="Average confidence"
              value={`${profileStats.averageConfidence}%`}
            />
            <Metric
              label="Refresh recommended"
              value={profileStats.stale}
            />
          </section>

          <section className={styles.profileSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className="eyebrow">My profiles</span>
                <h2>Only the profiles you have created appear here.</h2>
                <p>
                  Your active workspace recommends the first context.
                  Add another profile only when you need Atlas in a
                  different setting.
                </p>
              </div>

              {availableModes.length > 0 && (
                <button
                  className="button"
                  onClick={() =>
                    setShowAddProfile((current) => !current)
                  }
                  type="button"
                >
                  + Add Atlas Profile
                </button>
              )}
            </div>

            {showAddProfile && (
              <section className={styles.addPanel}>
                <div>
                  <span className="eyebrow">
                    Create another Atlas Profile
                  </span>
                  <h3>Choose a context.</h3>
                  <p>
                    Existing contexts are hidden to prevent duplicate
                    profiles.
                  </p>
                </div>

                <div className={styles.contextChoices}>
                  {availableModes.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => createProfile(mode)}
                      type="button"
                    >
                      <ContextIcon mode={mode} />
                      <div>
                        <strong>{contextLabel(mode)}</strong>
                        <small>{contextDescription(mode)}</small>
                      </div>
                      <em>Create →</em>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {myProfiles.length > 0 ? (
              <div className={styles.profileGrid}>
                {myProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onOpen={openProfile}
                  />
                ))}
              </div>
            ) : (
              <section className={styles.empty}>
                <ContextIcon mode="business" />
                <h3>No Atlas Profile is available yet.</h3>
                <p>
                  Create your first profile to begin the Atlas
                  Interview.
                </p>
                <button
                  className="button"
                  onClick={() => setShowAddProfile(true)}
                  type="button"
                >
                  Create My Atlas Profile
                </button>
              </section>
            )}
          </section>

          <section className={styles.twoColumns}>
            <article className={styles.panel}>
              <div className={styles.panelHeading}>
                <span className="eyebrow">
                  Workspace membership
                </span>
                <h2>Where you currently belong.</h2>
              </div>

              {currentWorkspace ? (
                <div className={styles.membershipCard}>
                  <BlueIcon symbol="◇" />

                  <div>
                    <strong>{currentWorkspace.name}</strong>
                    <small>{currentWorkspace.description}</small>
                  </div>

                  <em>
                    {currentMembership
                      ? roleLabel(
                          currentMembership.role,
                          "business",
                        )
                      : "Member"}
                  </em>
                </div>
              ) : (
                <div className={styles.panelEmpty}>
                  <p>You are not currently using a workspace.</p>
                  <Link className="button" href="/workspaces">
                    Choose Workspace
                  </Link>
                </div>
              )}

              <div className={styles.panelActions}>
                <Link
                  className="button secondary"
                  href="/profile/membership"
                >
                  Workspace Membership
                </Link>

                <Link
                  className="button secondary"
                  href="/members"
                >
                  Members & Roles
                </Link>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeading}>
                <span className="eyebrow">Profile controls</span>
                <h2>Privacy, security and account settings.</h2>
              </div>

              <div className={styles.controlList}>
                <ControlLink
                  href="/profile/privacy"
                  icon="◇"
                  title="Privacy Centre"
                  text="Consent, visibility, export and deletion."
                />
                <ControlLink
                  href="/profile/security"
                  icon="✓"
                  title="Account Security"
                  text="Email verification, sessions and MFA readiness."
                />
                <ControlLink
                  href="/notifications"
                  icon="◔"
                  title="Notifications"
                  text="Reminders, invitations and security updates."
                />
                <ControlLink
                  href="/settings"
                  icon="⚙"
                  title="Settings"
                  text="Theme, notifications and account preferences."
                />
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

function ProfileCard({
  profile,
  onOpen,
}: {
  profile: ContextualProfile;
  onOpen: (
    profile: ContextualProfile,
    href: string,
  ) => void;
}) {
  const interview = loadContextInterview(
    profile.id,
    profile.mode,
  );

  const freshness = profileFreshness(interview.completedAt);
  const completion = profileCompletion(profile);

  const action = profileAction(
    completion,
    Boolean(interview.completedAt),
  );

  return (
    <article className={styles.profileCard}>
      <div className={styles.cardTop}>
        <ContextIcon mode={profile.mode} />
        <span className={styles.status}>
          {statusText(
            completion,
            Boolean(interview.completedAt),
          )}
        </span>
      </div>

      <h3>{contextLabel(profile.mode)}</h3>
      <p>{contextDescription(profile.mode)}</p>

      <div className={styles.health}>
        <div>
          <small>Confidence</small>
          <strong>{freshness.confidence}%</strong>
        </div>
        <div>
          <small>Last updated</small>
          <strong>{freshness.label}</strong>
        </div>
      </div>

      <div className={styles.completion}>
        <div>
          <span>Profile completion</span>
          <strong>{completion}%</strong>
        </div>

        <div className={styles.bar}>
          <i style={{ width: `${completion}%` }} />
        </div>
      </div>

      <button
        className="button"
        onClick={() => onOpen(profile, action.href)}
        type="button"
      >
        {action.label}
      </button>

      <div className={styles.secondaryActions}>
        <button
          onClick={() =>
            onOpen(profile, "/onboarding/profile")
          }
          type="button"
        >
          Edit details
        </button>

        {interview.completedAt && (
          <button
            onClick={() =>
              onOpen(profile, "/my-atlas-profile")
            }
            type="button"
          >
            View profile
          </button>
        )}
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function ControlLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link href={href}>
      <BlueIcon symbol={icon} />
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <em>→</em>
    </Link>
  );
}

function ContextIcon({ mode }: { mode: ContextMode }) {
  return <BlueIcon symbol={modeSymbol(mode)} />;
}

function BlueIcon({ symbol }: { symbol: string }) {
  return (
    <span className={styles.blueIcon} aria-hidden="true">
      {symbol}
    </span>
  );
}

function profileAction(
  completion: number,
  completed: boolean,
): {
  label: string;
  href: string;
} {
  if (completed) {
    return {
      label: "View Atlas Profile →",
      href: "/my-atlas-profile",
    };
  }

  if (completion > 15) {
    return {
      label: "Continue Interview →",
      href: "/atlas",
    };
  }

  return {
    label: "Start Atlas Interview →",
    href: "/atlas",
  };
}

function statusText(
  completion: number,
  completed: boolean,
): string {
  if (completed) return "Complete";
  if (completion > 15) return "In progress";
  return "Not started";
}

function modeSymbol(mode: ContextMode): string {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

function contextDescription(mode: ContextMode): string {
  return {
    business:
      "How you collaborate in professional and delivery environments.",
    friendship:
      "How you connect, plan and contribute in friendship groups.",
    community:
      "How you contribute to communities and volunteering.",
    sports:
      "How you collaborate in clubs, teams and sporting activities.",
    education:
      "How you learn, study and contribute to education groups.",
  }[mode];
}

function workspaceContextToMode(
  context: WorkspaceContext,
): ContextMode {
  const modeByContext: Record<WorkspaceContext, ContextMode> = {
    business: "business",
    community: "community",
    sports: "sports",
    education: "education",
    friendship: "friendship",
  };

  return modeByContext[context];
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const emailName = normalise(emailDisplayName(email));

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

function emailDisplayName(
  email?: string | null,
): string {
  return (email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();
}

function normalise(
  value?: string | null,
): string {
  return (value || "").trim().toLowerCase();
}

function profileCompletion(
  profile: ContextualProfile,
): number {
  const commonValues = [
    profile.preferredName,
    profile.generalLocation,
    profile.availability,
    profile.interests.length ? "yes" : "",
  ];

  const contextValues = Object.values(profile.fields).map(
    (value) =>
      Array.isArray(value)
        ? value.length
          ? "yes"
          : ""
        : String(value || ""),
  );

  const values = [...commonValues, ...contextValues];

  const completed = values.filter(
    (value) => value.trim().length > 0,
  ).length;

  return Math.round(
    (completed / Math.max(values.length, 1)) * 100,
  );
}

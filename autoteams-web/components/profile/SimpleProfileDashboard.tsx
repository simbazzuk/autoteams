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
  Workspace,
  defaultContextForWorkspace,
  loadActiveWorkspaceId,
  loadWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./SimpleProfileDashboard.module.css";

type ProfileState = {
  completion: number;
  completed: boolean;
  confidence: number;
  freshnessLabel: string;
  freshnessStatus: string;
};

export function SimpleProfileDashboard() {
  const { user } = useAuth();

  const [allProfiles, setAllProfiles] =
    useState<ContextualProfile[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [ready, setReady] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAllProfiles(loadContextualProfiles());
    setWorkspaces(loadWorkspaces());
    setActiveWorkspaceId(loadActiveWorkspaceId());
    setReady(true);
  }, []);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
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

  const primaryProfile = selectPrimaryProfile(
    myProfiles,
    activeWorkspace,
  );

  const secondaryProfiles = myProfiles.filter(
    (profile) => profile.id !== primaryProfile?.id,
  );

  const primaryState = primaryProfile
    ? getProfileState(primaryProfile)
    : undefined;

  function createPrimaryProfile() {
    const mode = activeWorkspace
      ? workspaceContextToMode(
          activeWorkspace.defaultContext ||
            defaultContextForWorkspace(activeWorkspace.type),
        )
      : "business";

    const created = createContextualProfile(
      mode,
      user?.displayName || emailDisplayName(user?.email),
    );

    const updated = [...allProfiles, created];

    saveContextualProfiles(updated);
    saveActiveContextualProfileId(created.id);
    setAllProfiles(updated);
    setMessage("Your profile is ready to begin.");
    window.location.href = "/atlas";
  }

  function openProfile(
    profile: ContextualProfile,
    href: string,
  ) {
    saveActiveContextualProfileId(profile.id);
    window.location.href = href;
  }

  function createAdditionalProfile(mode: ContextMode) {
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
    setMessage(`${friendlyProfileName(mode)} was created.`);
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing My Profile…
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">My Profile</span>
            <h1>Help AutoTeams understand how you work.</h1>
            <p>
              Your profile captures how you prefer to communicate,
              collaborate and contribute. It belongs to you and is
              separate from your group and its members.
            </p>
          </div>

          <aside className={styles.accountCard}>
            <div className={styles.avatar}>
              {(user?.displayName || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <small>Signed-in account</small>
              <strong>
                {user?.displayName || "AutoTeams User"}
              </strong>
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
          {message && (
            <div className={styles.message}>{message}</div>
          )}

          {!primaryProfile ? (
            <section className={styles.emptyProfile}>
              <ProductIcon label="My Profile" size="lg">
                ♡
              </ProductIcon>

              <span className="eyebrow">Start here</span>
              <h2>Create your personal collaboration profile.</h2>
              <p>
                The interview is short and helps AutoTeams explain why
                particular people may work well together.
              </p>

              {activeWorkspace && (
                <div className={styles.contextHint}>
                  <small>Recommended for your current group</small>
                  <strong>
                    {friendlyProfileName(
                      workspaceContextToMode(
                        activeWorkspace.defaultContext ||
                          defaultContextForWorkspace(
                            activeWorkspace.type,
                          ),
                      ),
                    )}
                  </strong>
                  <span>
                    {activeWorkspace.name} ·{" "}
                    {workspaceTypeLabel(activeWorkspace.type)}
                  </span>
                </div>
              )}

              <button
                className="button"
                onClick={createPrimaryProfile}
                type="button"
              >
                Start My Profile →
              </button>
            </section>
          ) : (
            <>
              <section className={styles.primarySection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className="eyebrow">My Profile</span>
                    <h2>{friendlyProfileName(primaryProfile.mode)}</h2>
                    <p>
                      This is the profile AutoTeams currently uses for
                      your active group and team recommendations.
                    </p>
                  </div>

                  <ProfileStatusBadge state={primaryState} />
                </div>

                <div className={styles.primaryGrid}>
                  <article className={styles.profileCard}>
                    <header>
                      <ProductIcon
                        label={friendlyProfileName(
                          primaryProfile.mode,
                        )}
                        size="lg"
                      >
                        {profileIcon(primaryProfile.mode)}
                      </ProductIcon>

                      <div>
                        <small>Current profile</small>
                        <strong>
                          {friendlyProfileName(
                            primaryProfile.mode,
                          )}
                        </strong>
                        <p>
                          {profileDescription(primaryProfile.mode)}
                        </p>
                      </div>
                    </header>

                    <div className={styles.metrics}>
                      <Metric
                        label="Profile completion"
                        value={`${primaryState?.completion || 0}%`}
                      />
                      <Metric
                        label="Confidence"
                        value={`${primaryState?.confidence || 0}%`}
                      />
                      <Metric
                        label="Last updated"
                        value={
                          primaryState?.freshnessLabel ||
                          "Not completed"
                        }
                      />
                    </div>

                    <div className={styles.progressBar}>
                      <i
                        style={{
                          width: `${
                            primaryState?.completion || 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className={styles.primaryActions}>
                      <button
                        className="button"
                        onClick={() =>
                          openProfile(
                            primaryProfile,
                            primaryState?.completed
                              ? "/my-atlas-profile"
                              : "/atlas",
                          )
                        }
                        type="button"
                      >
                        {primaryState?.completed
                          ? "View My Profile"
                          : primaryState &&
                              primaryState.completion > 15
                            ? "Continue My Profile"
                            : "Start My Profile"}{" "}
                        →
                      </button>

                      <button
                        className="button secondary"
                        onClick={() =>
                          openProfile(
                            primaryProfile,
                            "/onboarding/profile",
                          )
                        }
                        type="button"
                      >
                        Edit Personal Details
                      </button>

                      {primaryState?.completed && (
                        <button
                          className="button secondary"
                          onClick={() =>
                            openProfile(primaryProfile, "/atlas")
                          }
                          type="button"
                        >
                          Refresh My Profile
                        </button>
                      )}
                    </div>
                  </article>

                  <aside className={styles.explanationCard}>
                    <ProductIcon
                      label="How your profile is used"
                      size="md"
                    >
                      ✦
                    </ProductIcon>

                    <span className="eyebrow">
                      How your profile is used
                    </span>
                    <h3>
                      It supports recommendations. It does not make the
                      decision.
                    </h3>

                    <div className={styles.explanationList}>
                      <span>✓ Understand collaboration preferences</span>
                      <span>✓ Explain possible team strengths</span>
                      <span>✓ Highlight areas to discuss</span>
                      <span>✓ Support human review</span>
                    </div>

                    <p>
                      AutoTeams should only use your profile where the
                      relevant permission and group access allow it.
                    </p>

                    <Link href="/trust-centre">
                      Read about trust and explainability →
                    </Link>
                  </aside>
                </div>
              </section>

              <section className={styles.controls}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className="eyebrow">
                      Profile controls
                    </span>
                    <h2>Privacy, security and account preferences.</h2>
                  </div>
                </div>

                <div className={styles.controlGrid}>
                  <ControlCard
                    icon="◇"
                    title="Privacy"
                    text="Review consent, visibility, export and deletion options."
                    href="/profile/privacy"
                  />
                  <ControlCard
                    icon="✓"
                    title="Security"
                    text="Review email verification, sessions and account security."
                    href="/profile/security"
                  />
                  <ControlCard
                    icon="◔"
                    title="Notifications"
                    text="Choose which profile reminders and updates you receive."
                    href="/notifications"
                  />
                  <ControlCard
                    icon="⚙"
                    title="Settings"
                    text="Manage account and application preferences."
                    href="/settings"
                  />
                </div>
              </section>

              <section className={styles.advanced}>
                <button
                  className={styles.advancedToggle}
                  onClick={() =>
                    setShowAdvanced((current) => !current)
                  }
                  type="button"
                >
                  <div>
                    <span className="eyebrow">
                      Advanced profiles
                    </span>
                    <strong>
                      Need a different profile for another setting?
                    </strong>
                    <p>
                      Most users only need one profile. Additional
                      profiles are optional.
                    </p>
                  </div>

                  <span>{showAdvanced ? "−" : "+"}</span>
                </button>

                {showAdvanced && (
                  <AdvancedProfiles
                    currentProfiles={myProfiles}
                    secondaryProfiles={secondaryProfiles}
                    onCreate={createAdditionalProfile}
                    onOpen={openProfile}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function AdvancedProfiles({
  currentProfiles,
  secondaryProfiles,
  onCreate,
  onOpen,
}: {
  currentProfiles: ContextualProfile[];
  secondaryProfiles: ContextualProfile[];
  onCreate: (mode: ContextMode) => void;
  onOpen: (
    profile: ContextualProfile,
    href: string,
  ) => void;
}) {
  const modes: ContextMode[] = [
    "business",
    "friendship",
    "community",
    "sports",
    "education",
  ];

  const availableModes = modes.filter(
    (mode) =>
      !currentProfiles.some((profile) => profile.mode === mode),
  );

  return (
    <div className={styles.advancedContent}>
      {secondaryProfiles.length > 0 && (
        <div>
          <span className="eyebrow">Your additional profiles</span>

          <div className={styles.secondaryGrid}>
            {secondaryProfiles.map((profile) => {
              const state = getProfileState(profile);

              return (
                <article key={profile.id}>
                  <ProductIcon
                    label={friendlyProfileName(profile.mode)}
                    size="md"
                  >
                    {profileIcon(profile.mode)}
                  </ProductIcon>

                  <div>
                    <strong>
                      {friendlyProfileName(profile.mode)}
                    </strong>
                    <small>
                      {state.completed
                        ? "Complete"
                        : `${state.completion}% complete`}
                    </small>
                  </div>

                  <button
                    onClick={() =>
                      onOpen(
                        profile,
                        state.completed
                          ? "/my-atlas-profile"
                          : "/atlas",
                      )
                    }
                    type="button"
                  >
                    Open →
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {availableModes.length > 0 && (
        <div>
          <span className="eyebrow">Add another profile</span>

          <div className={styles.addGrid}>
            {availableModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onCreate(mode)}
                type="button"
              >
                <ProductIcon
                  label={friendlyProfileName(mode)}
                  size="sm"
                  subtle
                >
                  {profileIcon(mode)}
                </ProductIcon>

                <div>
                  <strong>{friendlyProfileName(mode)}</strong>
                  <small>{profileDescription(mode)}</small>
                </div>

                <span>Create →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileStatusBadge({
  state,
}: {
  state?: ProfileState;
}) {
  if (!state) return null;

  return (
    <span
      className={`${styles.statusBadge} ${
        state.completed
          ? styles.complete
          : styles.inProgress
      }`}
    >
      {state.completed
        ? "Profile complete"
        : state.completion > 15
          ? "In progress"
          : "Not started"}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function ControlCard({
  icon,
  title,
  text,
  href,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <ProductIcon label={title} size="md">
        {icon}
      </ProductIcon>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <span>Open →</span>
    </Link>
  );
}

function getProfileState(
  profile: ContextualProfile,
): ProfileState {
  const interview = loadContextInterview(
    profile.id,
    profile.mode,
  );
  const freshness = profileFreshness(interview.completedAt);

  return {
    completion: profileCompletion(profile),
    completed: Boolean(interview.completedAt),
    confidence: freshness.confidence,
    freshnessLabel: freshness.label,
    freshnessStatus: freshness.status,
  };
}

function selectPrimaryProfile(
  profiles: ContextualProfile[],
  workspace?: Workspace,
): ContextualProfile | undefined {
  if (!profiles.length) return undefined;

  if (workspace) {
    const desiredMode = workspaceContextToMode(
      workspace.defaultContext ||
        defaultContextForWorkspace(workspace.type),
    );

    const matching = profiles.find(
      (profile) => profile.mode === desiredMode,
    );

    if (matching) return matching;
  }

  return profiles[0];
}

function workspaceContextToMode(
  context:
    | "business"
    | "community"
    | "sports"
    | "education"
    | "friendship",
): ContextMode {
  const modeByContext: Record<
    "business" | "community" | "sports" | "education" | "friendship",
    ContextMode
  > = {
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

function friendlyProfileName(mode: ContextMode): string {
  const names: Record<ContextMode, string> = {
    business: "Work Profile",
    friendship: "Friendship Profile",
    community: "Community Profile",
    sports: "Sports Profile",
    education: "Education Profile",
  };

  return names[mode];
}

function profileDescription(mode: ContextMode): string {
  const descriptions: Record<ContextMode, string> = {
    business:
      "How you communicate, organise and contribute in professional teams.",
    friendship:
      "How you connect and contribute in friendship and social groups.",
    community:
      "How you support, organise and collaborate in community settings.",
    sports:
      "How you contribute to clubs, squads and sporting activities.",
    education:
      "How you learn, plan and collaborate in education groups.",
  };

  return descriptions[mode];
}

function profileIcon(mode: ContextMode): string {
  const icons: Record<ContextMode, string> = {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▤",
  };

  return icons[mode];
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

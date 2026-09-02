"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  loadContextInterviews,
  profileFreshness,
  saveContextInterviews,
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
import refresh from "./SimpleProfileDashboard.v71321.module.css";

type ProfileState = {
  completion: number;
  completed: boolean;
  confidence: number;
  freshnessLabel: string;
  freshnessStatus: string;
  answeredFields: number;
  totalFields: number;
  readinessLabel: string;
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
  const [manualMode, setManualMode] =
    useState<ContextMode | undefined>(undefined);

  const searchParams = useSearchParams();
  const requestedMode = contextQueryToMode(
    searchParams.get("context"),
  );

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

  const effectiveRequestedMode =
    manualMode ?? requestedMode;

  const primaryProfile = selectPrimaryProfile(
    myProfiles,
    activeWorkspace,
    effectiveRequestedMode,
  );

  const requestedProfile =
    effectiveRequestedMode
      ? myProfiles.find(
          (profile) =>
            profile.mode === effectiveRequestedMode,
        )
      : undefined;

  // v7.13.23: an explicit URL/manual profile context is authoritative
  // for what the page displays, even when that profile has not yet
  // been created. This prevents ?context=sport from falling back to
  // Friendship merely because Friendship is the first saved profile.
  const displayMode =
    effectiveRequestedMode ??
    primaryProfile?.mode;

  const displayProfile =
    requestedProfile ??
    (
      !effectiveRequestedMode
        ? primaryProfile
        : undefined
    );

  const secondaryProfiles = myProfiles.filter(
    (profile) => profile.id !== displayProfile?.id,
  );

  const primaryState = displayProfile
    ? getProfileState(displayProfile)
    : undefined;

  function chooseProfileMode(mode: ContextMode) {
    setManualMode(mode);

    const matching = myProfiles.find(
      (profile) => profile.mode === mode,
    );

    if (matching) {
      saveActiveContextualProfileId(matching.id);
    }

    const queryValue =
      mode === "sports"
        ? "sport"
        : mode === "business"
          ? "work"
          : mode;

    const url = new URL(window.location.href);
    url.searchParams.set("context", queryValue);
    window.history.replaceState({}, "", url.toString());
  }

  function createProfileForMode(mode: ContextMode) {
    const existing = myProfiles.find(
      (profile) => profile.mode === mode,
    );

    if (existing) {
      openProfile(existing, "/onboarding/profile");
      return;
    }

    const profile = createContextualProfile(
      mode,
      user?.displayName || emailDisplayName(user?.email),
    );

    const updated = [
      ...allProfiles,
      profile,
    ];

    saveContextualProfiles(updated);
    saveActiveContextualProfileId(profile.id);
    setAllProfiles(updated);
    setManualMode(mode);
    setMessage(
      `${friendlyProfileName(mode)} was created.`,
    );
  }

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

  function deleteProfile(profile: ContextualProfile) {
    const label = friendlyProfileName(profile.mode);

    const confirmed = window.confirm(
      `Delete ${label}?\n\nThis removes this profile and its saved Atlas interview answers from this browser. Teams and other people are not deleted.`,
    );

    if (!confirmed) {
      return;
    }

    const updated = allProfiles.filter(
      (item) => item.id !== profile.id,
    );

    saveContextualProfiles(updated);

    saveContextInterviews(
      loadContextInterviews().filter(
        (item) => item.profileId !== profile.id,
      ),
    );

    const nextProfile = updated.find((item) =>
      belongsToCurrentUser(
        item,
        user?.displayName,
        user?.email,
      ),
    );

    saveActiveContextualProfileId(
      nextProfile?.id || "",
    );

    setAllProfiles(updated);
    setMessage(`${label} was deleted.`);
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing My Profile…
      </section>
    );
  }

  return (
    <main className={styles.page} data-autoteams-profile="v7.13.23" data-ts-profile-refresh="v715715213">
      <section className={`${styles.hero} ${refresh.hero}`}>
        <div className={`container ${styles.heroGrid} ${refresh.heroGrid}`}>
          <div>
            <span className="eyebrow">My Profile</span>
            <h1>Your AutoTeams Profile</h1>
            <p>
              Help Atlas understand how you communicate, collaborate
              and contribute across different settings.
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

          {!displayMode ? (
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
              <section
                className={`${styles.primarySection} ${refresh.dashboard}`}
                data-profile-mode={displayMode}
              >
                <div className={refresh.dashboardHeader}>
                  <div>
                    <span className="eyebrow">PROFILE DASHBOARD</span>
                    <h2>{friendlyProfileName(displayMode!)}</h2>
                    <p>{profileDescription(displayMode!)}</p>
                  </div>

                  <div className={refresh.headerControls}>
                    {myProfiles.length > 1 && (
                      <label className={refresh.profileSelector}>
                        <span>Profile</span>
                        <select
                          value={displayMode}
                          onChange={(event) =>
                            chooseProfileMode(
                              event.target.value as ContextMode,
                            )
                          }
                        >
                          {(
                            [
                              ...new Set<ContextMode>([
                                ...myProfiles.map(
                                  (profile) => profile.mode,
                                ),
                                ...(displayMode
                                  ? [displayMode]
                                  : []),
                              ]),
                            ]
                          ).map((mode) => (
                            <option
                              key={mode}
                              value={mode}
                            >
                              {friendlyProfileName(mode)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    <ProfileStatusBadge state={primaryState} />
                  </div>
                </div>

                {!displayProfile && (
                  <div className={refresh.missingProfileNotice}>
                    <strong>
                      {friendlyProfileName(displayMode!)} has not been created yet.
                    </strong>
                    <span>
                      Create this profile to give Atlas the right context for
                      team recommendations and matching.
                    </span>
                  </div>
                )}

                <div className={refresh.metricGrid}>
                  <ProfileMetric
                    label="Profile Strength"
                    value={`${primaryState?.completion || 0}%`}
                    detail="Profile information completed"
                    tone="violet"
                  />
                  <ProfileMetric
                    label="Atlas Readiness"
                    value={primaryState?.readinessLabel || "Low"}
                    detail={`${primaryState?.confidence || 0}% confidence`}
                    tone="blue"
                  />
                  <ProfileMetric
                    label="Profile Fields"
                    value={`${primaryState?.answeredFields || 0}/${primaryState?.totalFields || 0}`}
                    detail="Useful signals available"
                    tone="teal"
                  />
                  <ProfileMetric
                    label="Freshness"
                    value={primaryState?.freshnessLabel || "Not started"}
                    detail={
                      primaryState?.completed
                        ? "Based on latest Atlas interview"
                        : "Complete Atlas to improve freshness"
                    }
                    tone="amber"
                  />
                </div>

                <div className={refresh.contentGrid}>
                  <article className={`${styles.profileCard} ${refresh.profileCard}`}>
                    <header className={refresh.profileIdentity}>
                      <div className={refresh.iconShell}>
                        <ProductIcon
                          label={friendlyProfileName(
                            displayMode!,
                          )}
                          size="lg"
                        >
                          {profileIcon(displayMode!)}
                        </ProductIcon>
                      </div>

                      <div>
                        <small>Selected profile</small>
                        <strong>
                          {friendlyProfileName(
                            displayMode!,
                          )}
                        </strong>
                        <p>
                          {profileDescription(displayMode!)}
                        </p>
                      </div>
                    </header>

                    <div className={refresh.signalGrid}>
                      <ProfileSignal
                        icon="◉"
                        title="Communication"
                        text="How you prefer to communicate and share information."
                      />
                      <ProfileSignal
                        icon="◇"
                        title="Collaboration"
                        text="How you work with others and contribute to a group."
                      />
                      <ProfileSignal
                        icon="✦"
                        title="Strengths"
                        text="Signals Atlas can use when explaining team fit."
                      />
                      <ProfileSignal
                        icon="↗"
                        title="Development"
                        text="Missing information that could improve recommendations."
                      />
                    </div>

                    <div className={refresh.progressWrap}>
                      <div>
                        <span>Profile completion</span>
                        <strong>{primaryState?.completion || 0}%</strong>
                      </div>
                      <div className={`${styles.progressBar} ${refresh.progressBar}`}>
                        <i
                          style={{
                            width: `${
                              primaryState?.completion || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className={`${styles.primaryActions} ${refresh.primaryActions}`}>
                      {displayProfile ? (
                        <>
                          <button
                            className="button"
                            onClick={() =>
                              openProfile(
                                displayProfile,
                                primaryState?.completed
                                  ? "/my-atlas-profile"
                                  : "/atlas",
                              )
                            }
                            type="button"
                          >
                            {primaryState?.completed
                              ? "View Atlas Profile"
                              : primaryState &&
                                  primaryState.completion > 15
                                ? "Continue Profile"
                                : "Start Profile"}{" "}
                            →
                          </button>

                          <button
                            className="button secondary"
                            onClick={() =>
                              openProfile(
                                displayProfile,
                                "/onboarding/profile",
                              )
                            }
                            type="button"
                          >
                            Edit Details
                          </button>

                          {primaryState?.completed && (
                            <button
                              className="button secondary"
                              onClick={() =>
                                openProfile(displayProfile, "/atlas")
                              }
                              type="button"
                            >
                              Refresh Profile
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          className="button"
                          onClick={() =>
                            createProfileForMode(displayMode!)
                          }
                          type="button"
                        >
                          Create {friendlyProfileName(displayMode!)} →
                        </button>
                      )}
                    </div>
                  </article>

                  <aside className={`${styles.explanationCard} ${refresh.atlasCard}`}>
                    <div className={refresh.atlasHeading}>
                      <ProductIcon
                        label="How Atlas uses your profile"
                        size="md"
                      >
                        ✦
                      </ProductIcon>
                      <div>
                        <span className="eyebrow">ATLAS</span>
                        <h3>How this profile helps.</h3>
                      </div>
                    </div>

                    <div className={styles.explanationList}>
                      <span>✓ Understand collaboration preferences</span>
                      <span>✓ Explain possible team strengths</span>
                      <span>✓ Highlight areas to discuss</span>
                      <span>✓ Support human review</span>
                    </div>

                    <div className={refresh.contextCard}>
                      <small>Current context</small>
                      <strong>
                        {friendlyProfileName(displayMode!)}
                      </strong>
                      <p>
                        Atlas will use this profile when the selected
                        team or workflow uses the same context.
                      </p>
                    </div>

                    <Link href="/trust-centre">
                      Trust & explainability →
                    </Link>
                  </aside>
                </div>
              </section>

                      {/* AUTOTEAMS_V715715212_CV_CARD */}
        <section
          style={{
            marginBottom: 22,
            border: "1px solid rgba(91, 121, 255, .28)",
            borderRadius: 20,
            padding: 22,
            background:
              "linear-gradient(135deg, rgba(71, 57, 154, .22), rgba(8, 24, 45, .78))",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 20,
            alignItems: "center",
          }}
         data-ts-profile-zone="career">
          <div>
            <span
              style={{
                display: "inline-block",
                marginBottom: 9,
                borderRadius: 999,
                padding: "5px 10px",
                background: "rgba(255,255,255,.96)",
                color: "#7657ff",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Career & Experience
            </span>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 24,
              }}
            >
              Give Atlas your CV evidence.
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: 760,
                lineHeight: 1.6,
                color: "rgba(205, 220, 239, .76)",
              }}
            >
              Upload your CV so Atlas can extract roles, skills, experience and
              qualifications for future Opportunity matching. Your CV supports
              the Atlas Profile rather than replacing it.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 14,
              }}
            >
              <span
                style={{
                  borderRadius: 999,
                  padding: "6px 9px",
                  background: "rgba(79, 142, 247, .10)",
                  border: "1px solid rgba(79, 142, 247, .18)",
                  fontSize: 12,
                }}
              >
                Skills & roles
              </span>
              <span
                style={{
                  borderRadius: 999,
                  padding: "6px 9px",
                  background: "rgba(45, 211, 171, .09)",
                  border: "1px solid rgba(45, 211, 171, .18)",
                  fontSize: 12,
                }}
              >
                Experience evidence
              </span>
              <span
                style={{
                  borderRadius: 999,
                  padding: "6px 9px",
                  background: "rgba(168, 85, 247, .09)",
                  border: "1px solid rgba(168, 85, 247, .18)",
                  fontSize: 12,
                }}
              >
                Opportunity matching
              </span>
            </div>
          </div>

          <Link
            className="button"
            href="/profile/cv"
            style={{
              minWidth: 190,
              textAlign: "center",
            }}
          >
            CV & Atlas Intelligence
          </Link>
        </section>

<section className={styles.controls} data-ts-profile-zone="controls">
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

              <section className={styles.advanced} data-ts-profile-zone="advanced">
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
                    onDelete={deleteProfile}
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
  onDelete,
}: {
  currentProfiles: ContextualProfile[];
  secondaryProfiles: ContextualProfile[];
  onCreate: (mode: ContextMode) => void;
  onOpen: (
    profile: ContextualProfile,
    href: string,
  ) => void;
  onDelete: (profile: ContextualProfile) => void;
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

                  <div>
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

                    <button
                      onClick={() => onDelete(profile)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
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

function ProfileMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "blue" | "teal" | "amber";
}) {
  return (
    <article
      className={`${refresh.profileMetric} ${refresh[tone]}`}
     data-ts-profile-zone="work">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ProfileSignal({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className={refresh.signal}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
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
  const progress = profileFieldProgress(profile);
  const completed = Boolean(interview.completedAt);
  const confidence = freshness.confidence;

  return {
    completion: profileCompletion(profile),
    completed,
    confidence,
    freshnessLabel: freshness.label,
    freshnessStatus: freshness.status,
    answeredFields: progress.answered,
    totalFields: progress.total,
    readinessLabel:
      completed && confidence >= 80
        ? "High"
        : progress.answered / Math.max(progress.total, 1) >= 0.5
          ? "Medium"
          : "Low",
  };
}

function selectPrimaryProfile(
  profiles: ContextualProfile[],
  workspace?: Workspace,
  requestedMode?: ContextMode,
): ContextualProfile | undefined {
  if (!profiles.length) return undefined;

  // v7.13.20: Team Insights passes ?context=<profile type>.
  // Honour that explicit context before workspace/default selection.
  if (requestedMode) {
    const requestedProfile = profiles.find(
      (profile) => profile.mode === requestedMode,
    );

    if (requestedProfile) {
      return requestedProfile;
    }
  }

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

function contextQueryToMode(
  context: string | null,
): ContextMode | undefined {
  const value =
    context?.trim().toLowerCase();

  if (!value) {
    return undefined;
  }

  const aliases: Record<string, ContextMode> = {
    work: "business",
    business: "business",
    professional: "business",
    sport: "sports",
    sports: "sports",
    community: "community",
    friendship: "friendship",
    friends: "friendship",
    education: "education",
  };

  return aliases[value];
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

function profileFieldProgress(
  profile: ContextualProfile,
) {
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
  const answered = values.filter(
    (value) => value.trim().length > 0,
  ).length;

  return {
    answered,
    total: Math.max(values.length, 1),
  };
}

function profileCompletion(
  profile: ContextualProfile,
): number {
  const progress = profileFieldProgress(profile);

  return Math.round(
    (progress.answered / progress.total) * 100,
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

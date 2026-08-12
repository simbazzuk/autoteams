"use client";

import {
  persistInvitation,
  updateInvitationEmailStatus,
} from "@/lib/firebase/invitations";
import { useAuth } from "@/components/AuthProvider";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useWorkspaceAccess } from "./AccessContext";
import {
  MemberConsent,
  WorkspaceInvitation,
  WorkspaceMembership,
  WorkspaceRole,
  createAccessId,
  createInviteToken,
  loadConsents,
  loadInvitations,
  loadMemberships,
  roleCanManageMembers,
  roleLabel,
  saveConsents,
  saveInvitations,
  saveMemberships,
} from "@/lib/workspace-access";
import { loadActiveWorkspaceId, loadWorkspaces } from "@/lib/workspaces";
import {
  ContextMode,
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import styles from "./MembersPanel.v71325.module.css";


function profileModeLabel(mode: ContextMode) {
  return {
    business: "Work",
    friendship: "Friendship",
    community: "Community",
    sports: "Sport",
    education: "Education",
  }[mode];
}

function profileModeIcon(mode: ContextMode) {
  return {
    business: "⌂",
    friendship: "♡",
    community: "♙",
    sports: "◎",
    education: "▥",
  }[mode];
}

const CANONICAL_PROFILE_MODES: ContextMode[] = [
  "business",
  "sports",
  "friendship",
  "community",
  "education",
];


function workspaceTypeToProfileMode(
  type?: string | null,
): ContextMode | undefined {
  switch ((type ?? "").toLowerCase()) {
    case "organisation":
    case "business":
    case "work":
      return "business";
    case "sports":
    case "sport":
      return "sports";
    case "friends_family":
    case "friendship":
    case "personal":
      return "friendship";
    case "community":
      return "community";
    case "education":
      return "education";
    default:
      return undefined;
  }
}

function memberBelongsToProfile(
  member: WorkspaceMembership,
  mode: ContextMode,
  currentUserId: string,
  legacyMode?: ContextMode,
) {
  // The signed-in owner/person can operate across their own profile contexts.
  if (
    member.userId === currentUserId ||
    member.role === "owner"
  ) {
    return true;
  }

  if (member.profileContexts?.length) {
    return member.profileContexts.includes(mode);
  }

  // Legacy memberships pre-date profileContexts. Associate them only with
  // the context implied by their old container, rather than showing them
  // under every profile.
  return legacyMode === mode;
}

function invitationBelongsToProfile(
  invitation: WorkspaceInvitation,
  mode: ContextMode,
  legacyMode?: ContextMode,
) {
  if (invitation.profileContext) {
    return invitation.profileContext === mode;
  }

  // Legacy invitations had no profileContext; keep them only with their
  // original context instead of duplicating them across all profiles.
  return legacyMode === mode;
}

function normalise(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function emailDisplayName(email?: string | null) {
  return (email ?? "").split("@")[0]?.replace(/[._-]+/g, " ").trim() || "";
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
) {
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

const INVITE_PROFILE_CONTEXT_KEY =
  "autoteams-invite-profile-context-v71325";

function readPreferredProfileMode(): ContextMode | undefined {
  try {
    const value = localStorage.getItem(INVITE_PROFILE_CONTEXT_KEY);
    if (
      value === "business" ||
      value === "friendship" ||
      value === "community" ||
      value === "sports" ||
      value === "education"
    ) {
      return value;
    }
  } catch {}

  return undefined;
}

function rememberPreferredProfileMode(mode: ContextMode) {
  try {
    localStorage.setItem(INVITE_PROFILE_CONTEXT_KEY, mode);
  } catch {}
}


function invitationUrl(token: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/invite/${encodeURIComponent(token)}`;
}

export function MembersPanel() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState("");
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [consents, setConsents] = useState<MemberConsent[]>([]);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [lastInvitationToken, setLastInvitationToken] = useState("");
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [profileMode, setProfileMode] = useState<ContextMode | "">("");

  const access = useWorkspaceAccess(workspaceId);
  const workspaces = loadWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  const category =
    workspace?.type === "personal" ? "friendship" : "business";
  const canManage = roleCanManageMembers(access.role);

  useEffect(() => {
    setWorkspaceId(loadActiveWorkspaceId());
    setMemberships(loadMemberships());
    setInvitations(loadInvitations());
    setConsents(loadConsents());

    const availableProfiles = loadContextualProfiles();
    setProfiles(availableProfiles);

    const preferred = readPreferredProfileMode();

    setProfileMode(
      preferred && CANONICAL_PROFILE_MODES.includes(preferred)
        ? preferred
        : "business",
    );
  }, []);

  const workspaceMembers = useMemo(
    () => memberships.filter((item) => item.workspaceId === workspaceId),
    [memberships, workspaceId],
  );

  const workspaceInvitations = useMemo(
    () =>
      invitations.filter(
        (item) => item.workspaceId === workspaceId && item.status === "pending",
      ),
    [invitations, workspaceId],
  );

  const legacyProfileMode =
    workspaceTypeToProfileMode(workspace?.type);

  const profileMembers = useMemo(() => {
    if (!profileMode) return [];

    return workspaceMembers.filter((member) =>
      memberBelongsToProfile(
        member,
        profileMode,
        access.currentUserId,
        legacyProfileMode,
      ),
    );
  }, [
    workspaceMembers,
    profileMode,
    access.currentUserId,
    legacyProfileMode,
  ]);

  const profileInvitations = useMemo(() => {
    if (!profileMode) return [];

    return workspaceInvitations.filter((invitation) =>
      invitationBelongsToProfile(
        invitation,
        profileMode,
        legacyProfileMode,
      ),
    );
  }, [
    workspaceInvitations,
    profileMode,
    legacyProfileMode,
  ]);

  const profileOptions = useMemo(() => {
    // v7.13.31: Invite must use the same canonical profile model as
    // My AutoTeams Summary. Saved contextual-profile data enriches the
    // option where available, but missing local records must not hide
    // Work, Sport, Friendship, Community or Education.
    const savedByMode = new Map<ContextMode, ContextualProfile>();

    for (const profile of profiles) {
      if (!savedByMode.has(profile.mode)) {
        savedByMode.set(profile.mode, profile);
      }
    }

    return CANONICAL_PROFILE_MODES.map((mode) => ({
      mode,
      profile: savedByMode.get(mode),
    }));
  }, [profiles]);

  const selectedProfileOption =
    profileOptions.find((item) => item.mode === profileMode) ??
    profileOptions[0];

  const selectedProfile =
    selectedProfileOption?.profile;

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !user) return;

    const invitation: WorkspaceInvitation = {
      id: createAccessId("invite"),
      workspaceId,
      email: inviteEmail.trim(),
      name: inviteName.trim() || inviteEmail.trim().split("@")[0],
      role: inviteRole,
      profileContext: profileMode || undefined,
      token: createInviteToken(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [invitation, ...invitations];

    // Keep the existing local store for backwards compatibility/UI speed.
    setInvitations(updated);
    saveInvitations(updated);

    setInviteMessage("Creating invitation...");
    setCopyMessage("");
    setLastInvitationToken(invitation.token);

    try {
      // Firestore is the cross-device source of truth for invitation tokens.
      await persistInvitation(
        invitation,
        user.uid,
        {
          name: user.displayName,
          email: user.email,
        },
      );

      const idToken = await user.getIdToken();

      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: invitation.token,
          ownerId: user.uid,
          recipientName: invitation.name,
          recipientEmail: invitation.email,
          profileContext: invitation.profileContext,
          role: invitation.role,
          inviterName: user.displayName || "An AutoTeams member",
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        inviteUrl?: string;
      };

      if (!response.ok) {
        await updateInvitationEmailStatus(
          invitation.token,
          "failed",
        );

        throw new Error(
          result.error || "The invitation email could not be sent.",
        );
      }

      await updateInvitationEmailStatus(
        invitation.token,
        "sent",
      );

      setInviteMessage(
        `Invitation emailed to ${invitation.email}${
          invitation.profileContext
            ? ` - ${profileModeLabel(invitation.profileContext)} profile`
            : ""
        }.`,
      );
    } catch (error) {
      console.error(
        "[AutoTeams] invitation email failed",
        error,
      );

      // The invitation still exists and the user can share the link manually.
      setInviteMessage(
        `Invite created for ${invitation.email}, but the email could not be sent. You can still copy the invite link below.`,
      );
    }

    setInviteName("");
    setInviteEmail("");
    setInviteRole("member");
  }

  function revoke(id: string) {
    if (!canManage) return;
    const updated = invitations.map((item) =>
      item.id === id ? { ...item, status: "revoked" as const } : item,
    );
    setInvitations(updated);
    saveInvitations(updated);
  }

  function changeRole(id: string, role: WorkspaceRole) {
    if (!canManage) return;
    const updated = memberships.map((item) =>
      item.id === id ? { ...item, role } : item,
    );
    setMemberships(updated);
    saveMemberships(updated);
  }

  function updateConsent(
    userId: string,
    field: "teamDnaVisible" | "allowTeamMatching" | "allowInsights",
    value: boolean,
  ) {
    const existing = consents.find(
      (item) => item.workspaceId === workspaceId && item.userId === userId,
    );

    const consent: MemberConsent = {
      workspaceId,
      userId,
      teamDnaVisible: existing?.teamDnaVisible ?? true,
      allowTeamMatching: existing?.allowTeamMatching ?? true,
      allowInsights: existing?.allowInsights ?? true,
      updatedAt: new Date().toISOString(),
      [field]: value,
    };

    const updated = [
      ...consents.filter(
        (item) =>
          !(item.workspaceId === workspaceId && item.userId === userId),
      ),
      consent,
    ];
    setConsents(updated);
    saveConsents(updated);
  }

  const currentConsent =
    consents.find(
      (item) =>
        item.workspaceId === workspaceId &&
        item.userId === access.currentUserId,
    ) || {
      workspaceId,
      userId: access.currentUserId,
      teamDnaVisible: true,
      allowTeamMatching: true,
      allowInsights: true,
      updatedAt: new Date().toISOString(),
    };

  return (
    <main className="access-page" data-autoteams-invite="v7.13.33">
      <section className={`access-hero ${styles.hero}`}>
        <div className={`container access-hero-row ${styles.heroRow}`}>
          <div>
            <span className="eyebrow">Invite people</span>
            <h1>Invite someone to your AutoTeams profile context.</h1>
            <p>
              Choose the profile context, enter their details and send the
              invitation. They can then join AutoTeams, create their own profile
              and become available for team building.
            </p>
            <div className={styles.heroPills}>
              <span>♙ Invite people</span>
              <span>✦ Choose profile context</span>
              <span>◇ Build teams together</span>
            </div>
          </div>

          <div className={`access-account-summary ${styles.contextCard}`}>
            <label className={styles.profileControl}>
              <span>
                Invite to profile
                {` · ${profileOptions.length} available`}
              </span>
              <select
                value={profileMode}
                onChange={(event) => {
                  const next = event.target.value as ContextMode;
                  setProfileMode(next);
                  rememberPreferredProfileMode(next);
                }}
              >
                {profileOptions.map((item) => (
                  <option key={item.mode} value={item.mode}>
                    {profileModeLabel(item.mode)}
                  </option>
                ))}
              </select>
              <small>
                Choose the AutoTeams profile context this invitation relates to.
              </small>
            </label>
          </div>
        </div>
      </section>

      <section className="access-content">
        <div className="container access-layout">
          <section className="access-main">
            <div className={`access-summary-grid ${styles.summaryGrid}`}>
              <article className={styles.peopleMetric}>
                <small>Profile members</small>
                <strong>{profileMembers.length}</strong>
              </article>
              <article className={styles.inviteMetric}>
                <small>Pending invitations</small>
                <strong>{profileInvitations.length}</strong>
              </article>
              <article className={styles.profileMetric}>
                <small>Selected profile</small>
                <strong>
                  {selectedProfileOption
                    ? profileModeLabel(selectedProfileOption.mode)
                    : "Not selected"}
                </strong>
              </article>
            </div>

            <section className="access-panel">
              <div className="access-panel-heading">
                <div>
                  <span className="eyebrow">Profile members</span>
                  <h2>
                    {selectedProfileOption
                      ? `${profileModeLabel(selectedProfileOption.mode)} members`
                      : "Profile members"}
                  </h2>
                </div>
                <span>{profileMembers.length}</span>
              </div>

              <div className="access-member-list">
                {profileMembers.length === 0 && (
                  <div className={styles.profileEmptyState}>
                    <strong>
                      No members in this profile yet.
                    </strong>
                    <span>
                      Invite someone using the form to add them to the selected
                      profile context.
                    </span>
                  </div>
                )}

                {profileMembers.map((member) => (
                  <article key={member.id}>
                    <span className="avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </div>

                    {canManage && member.role !== "owner" ? (
                      <select
                        value={member.role}
                        onChange={(event) =>
                          changeRole(
                            member.id,
                            event.target.value as WorkspaceRole,
                          )
                        }
                      >
                        <option value="admin">
                          {roleLabel("admin", category)}
                        </option>
                        <option value="leader">
                          {roleLabel("leader", category)}
                        </option>
                        <option value="member">
                          {roleLabel("member", category)}
                        </option>
                      </select>
                    ) : (
                      <span className="role-pill">
                        {roleLabel(member.role, category)}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="access-panel">
              <div className="access-panel-heading">
                <div>
                  <span className="eyebrow">Member consent</span>
                  <h2>Control how your Team DNA is used</h2>
                </div>
              </div>

              <div className="consent-grid">
                <label>
                  <span>
                    <strong>Visible in this workspace</strong>
                    <small>
                      Allow approved leaders to see that your Team DNA is ready.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={currentConsent.teamDnaVisible}
                    onChange={(event) =>
                      updateConsent(
                        access.currentUserId,
                        "teamDnaVisible",
                        event.target.checked,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <strong>Allow team matching</strong>
                    <small>
                      Include your profile in Team Builder recommendations.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={currentConsent.allowTeamMatching}
                    onChange={(event) =>
                      updateConsent(
                        access.currentUserId,
                        "allowTeamMatching",
                        event.target.checked,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    <strong>Allow team insights</strong>
                    <small>
                      Use your Team DNA in aggregated team analysis.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={currentConsent.allowInsights}
                    onChange={(event) =>
                      updateConsent(
                        access.currentUserId,
                        "allowInsights",
                        event.target.checked,
                      )
                    }
                  />
                </label>
              </div>
            </section>
          </section>

          <aside className="access-side">
            <section
              className={`access-panel ${styles.invitePanel}`}
              id="invite"
              style={{
                scrollMarginTop: 110,
                borderColor: "rgba(129,140,248,.42)",
                boxShadow: "0 18px 50px rgba(79,70,229,.10)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-grid",
                    width: 42,
                    height: 42,
                    placeItems: "center",
                    borderRadius: 13,
                    background: "linear-gradient(135deg, #4f8ef7, #a855f7)",
                    color: "white",
                    fontSize: 22,
                  }}
                >
                  ♙+
                </span>
                <div>
                  <span className="eyebrow">Invite to profile</span>
                  <h2 style={{ margin: "3px 0 0" }}>Invite someone</h2>
                </div>
              </div>
              <p className={styles.inviteIntro}>
                Invite someone to the selected AutoTeams profile context. They
                create and own their own profile after joining, and can then
                become available for team building.
              </p>

              {!canManage ? (
                <div className="access-denied">
                  <strong>Invitation access restricted</strong>
                  <p>
                    Only the Owner or Administrator can invite and manage
                    members.
                  </p>
                </div>
              ) : (
                <form onSubmit={invite}>
                  <label>
                    Name
                    <input
                      value={inviteName}
                      onChange={(event) => setInviteName(event.target.value)}
                      placeholder="Member name"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      required
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="name@example.com"
                    />
                  </label>

<label>
                    Team role
                    <select
                      value={inviteRole}
                      onChange={(event) =>
                        setInviteRole(event.target.value as WorkspaceRole)
                      }
                    >
                      <option value="member">
                        {roleLabel("member", category)}
                      </option>
                      <option value="leader">
                        {roleLabel("leader", category)}
                      </option>
                      <option value="admin">
                        {roleLabel("admin", category)}
                      </option>
                    </select>
                  </label>
                  <button className="button" type="submit">
                    Create Invite →
                  </button>
                  {inviteMessage && (
                    <div className={styles.inviteCreated}>
                      <p role="status">
                        ✓ {inviteMessage}
                      </p>

                      {lastInvitationToken && (
                        <div className={styles.inviteShareActions}>
                          <button
                            className="button secondary"
                            onClick={async () => {
                              const url = invitationUrl(lastInvitationToken);

                              try {
                                await navigator.clipboard.writeText(url);
                                setCopyMessage("Invite link copied.");
                              } catch {
                                setCopyMessage(
                                  `Copy this link: ${url}`,
                                );
                              }
                            }}
                            type="button"
                          >
                            Copy Invite Link
                          </button>

                          <a
                            className="button secondary"
                            href={invitationUrl(lastInvitationToken)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Invite
                          </a>
                        </div>
                      )}

                      {copyMessage && (
                        <small className={styles.copyMessage}>
                          {copyMessage}
                        </small>
                      )}

                      <small className={styles.deliveryNote}>
                        AutoTeams has created the invitation, but no email has
                        been sent automatically yet.
                      </small>
                    </div>
                  )}
                </form>
              )}
            </section>

            <section className="access-panel">
              <div className="access-panel-heading">
                <div>
                  <span className="eyebrow">Pending invitations</span>
                  <h2>Invite links</h2>
                </div>
              </div>

              <div className="invitation-list">
                {profileInvitations.length === 0 ? (
                  <p>No pending invitations.</p>
                ) : (
                  workspaceInvitations.map((invitation) => (
                    <article key={invitation.id}>
                      <div>
                        <strong>{invitation.name}</strong>
                        <small>{invitation.email}</small>
                      </div>
                      <code>{invitation.token}</code>
                      <span>{roleLabel(invitation.role, category)}</span>
                      <button
                        className={styles.copyInviteMini}
                        onClick={async () => {
                          const url = invitationUrl(invitation.token);

                          try {
                            await navigator.clipboard.writeText(url);
                            setCopyMessage(
                              `Invite link copied for ${invitation.email}.`,
                            );
                          } catch {
                            setCopyMessage(`Copy this link: ${url}`);
                          }
                        }}
                        type="button"
                      >
                        Copy link
                      </button>
                      <span className={styles.pendingContext}>
                        {invitation.profileContext
                          ? `${profileModeIcon(invitation.profileContext)} ${profileModeLabel(
                              invitation.profileContext,
                            )}`
                          : "No profile selected"}
                      </span>
                      {canManage && (
                        <button
                          onClick={() => revoke(invitation.id)}
                          type="button"
                        >
                          Revoke
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="access-panel access-role-guide">
              <span className="eyebrow">Permission guide</span>
              <h2>Who can do what?</h2>
              <div>
                <strong>Owner</strong>
                <p>Workspace, membership, team and billing control.</p>
              </div>
              <div>
                <strong>Administrator</strong>
                <p>Members, invitations, directories and talent pools.</p>
              </div>
              <div>
                <strong>Team Leader</strong>
                <p>Create teams and review recommendations.</p>
              </div>
              <div>
                <strong>Team Member</strong>
                <p>Manage their own Team DNA and participate by consent.</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

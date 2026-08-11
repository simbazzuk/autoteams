"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
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

export function MembersPanel() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [consents, setConsents] = useState<MemberConsent[]>([]);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviteMessage, setInviteMessage] = useState("");

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

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;

    const invitation: WorkspaceInvitation = {
      id: createAccessId("invite"),
      workspaceId,
      email: inviteEmail.trim(),
      name: inviteName.trim() || inviteEmail.trim().split("@")[0],
      role: inviteRole,
      token: createInviteToken(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [invitation, ...invitations];
    setInvitations(updated);
    saveInvitations(updated);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("member");
    setInviteMessage(
      `Invitation created for ${invitation.email}.`,
    );
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
    <main className="access-page">
      <section className="access-hero">
        <div className="container access-hero-row">
          <div>
            <span className="eyebrow">Roles, invitations and consent</span>
            <h1>Invite people without giving everyone admin access.</h1>
            <p>
              Owners and administrators manage the workspace. Team Leaders can
              build teams. Members control how their Team DNA is used.
            </p>
          </div>
          <div className="access-account-summary">
            <WorkspaceSwitcher value={workspaceId} onChange={setWorkspaceId} />
<div>
              <span>Signed-in role</span>
              <strong>
                {access.role ? roleLabel(access.role, category) : "No workspace access"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="access-content">
        <div className="container access-layout">
          <section className="access-main">
            <div className="access-summary-grid">
              <article>
                <small>Workspace</small>
                <strong>{workspace?.name || "Not selected"}</strong>
              </article>
              <article>
                <small>Your role</small>
                <strong>
                  {access.role ? roleLabel(access.role, category) : "No access"}
                </strong>
              </article>
              <article>
                <small>Active members</small>
                <strong>{workspaceMembers.length}</strong>
              </article>
              <article>
                <small>Pending invitations</small>
                <strong>{workspaceInvitations.length}</strong>
              </article>
            </div>

            <section className="access-panel">
              <div className="access-panel-heading">
                <div>
                  <span className="eyebrow">Workspace members</span>
                  <h2>People and permissions</h2>
                </div>
                <span>{workspaceMembers.length}</span>
              </div>

              <div className="access-member-list">
                {workspaceMembers.map((member) => (
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
              className="access-panel"
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
                  <span className="eyebrow">Invite people</span>
                  <h2 style={{ margin: "3px 0 0" }}>Grow this workspace</h2>
                </div>
              </div>
              <p style={{ marginTop: 0 }}>
                Invite someone to AutoTeams. They can join this workspace, create
                their own profile and become available for team building.
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
                    Role
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
                    Send Invitation →
                  </button>
                  {inviteMessage && (
                    <p
                      role="status"
                      style={{
                        margin: "12px 0 0",
                        color: "#86efac",
                        fontWeight: 700,
                      }}
                    >
                      ✓ {inviteMessage}
                    </p>
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
                {workspaceInvitations.length === 0 ? (
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

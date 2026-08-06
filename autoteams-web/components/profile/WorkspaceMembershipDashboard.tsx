"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Workspace,
  loadActiveWorkspaceId,
  loadWorkspaces,
  saveActiveWorkspaceId,
} from "@/lib/workspaces";
import {
  WorkspaceInvitation,
  WorkspaceMembership,
  WorkspaceRole,
  loadInvitations,
  loadMemberships,
  roleLabel,
  saveInvitations,
  saveMemberships,
} from "@/lib/workspace-access";

export function WorkspaceMembershipDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setWorkspaces(loadWorkspaces());
    setMemberships(loadMemberships());
    setInvitations(loadInvitations());
    setActiveId(loadActiveWorkspaceId());
  }, []);

  const activeWorkspace = workspaces.find((item) => item.id === activeId);
  const workspaceMembers = memberships.filter(
    (item) => item.workspaceId === activeId && item.status === "active",
  );
  const pendingInvitations = invitations.filter(
    (item) => item.workspaceId === activeId && item.status === "pending",
  );

  const grouped = useMemo(() => {
    const roles: WorkspaceRole[] = [
      "owner",
      "admin",
      "leader",
      "member",
    ];
    return roles.map((role) => ({
      role,
      members: workspaceMembers.filter((item) => item.role === role),
    }));
  }, [workspaceMembers]);

  function chooseWorkspace(id: string) {
    setActiveId(id);
    saveActiveWorkspaceId(id);
    setSaved("");
  }

  function updateRole(memberId: string, role: WorkspaceRole) {
    const updated = memberships.map((member) =>
      member.id === memberId ? { ...member, role } : member,
    );
    setMemberships(updated);
    saveMemberships(updated);
    setSaved("Member role updated.");
  }

  function removeMember(memberId: string) {
    const updated = memberships.filter((member) => member.id !== memberId);
    setMemberships(updated);
    saveMemberships(updated);
    setSaved("Member removed from the workspace.");
  }

  function revokeInvitation(invitationId: string) {
    const updated = invitations.map((invitation) =>
      invitation.id === invitationId
        ? { ...invitation, status: "revoked" as const }
        : invitation,
    );
    setInvitations(updated);
    saveInvitations(updated);
    setSaved("Invitation revoked.");
  }

  return (
    <main className="membership130d-page">
      <section className="membership130d-hero">
        <div className="container">
          <span className="eyebrow">Workspace Membership</span>
          <h1>See who belongs to each workspace.</h1>
          <p>
            Review Owners, Administrators, Team Leaders, Team Members and
            pending invitations from a single membership dashboard.
          </p>
        </div>
      </section>

      <section className="membership130d-body">
        <div className="container membership130d-layout">
          <aside className="membership130d-workspaces">
            <span className="eyebrow">Your workspaces</span>
            <h2>Select a workspace</h2>

            <div className="membership130d-workspace-list">
              {workspaces.map((workspace) => (
                <button
                  className={workspace.id === activeId ? "active" : ""}
                  key={workspace.id}
                  onClick={() => chooseWorkspace(workspace.id)}
                  type="button"
                >
                  <span>◇</span>
                  <div>
                    <strong>{workspace.name}</strong>
                    <small>{workspace.type}</small>
                  </div>
                </button>
              ))}
            </div>

            <Link className="button secondary" href="/workspaces">
              Manage Workspaces
            </Link>
          </aside>

          <section className="membership130d-main">
            <div className="membership130d-summary">
              <article>
                <small>Total members</small>
                <strong>{workspaceMembers.length}</strong>
              </article>
              <article>
                <small>Team Leaders</small>
                <strong>
                  {
                    workspaceMembers.filter(
                      (member) => member.role === "leader",
                    ).length
                  }
                </strong>
              </article>
              <article>
                <small>Pending invitations</small>
                <strong>{pendingInvitations.length}</strong>
              </article>
              <article>
                <small>Active workspace</small>
                <strong>{activeWorkspace?.name || "None"}</strong>
              </article>
            </div>

            {saved && <div className="membership130d-success">{saved}</div>}

            <div className="membership130d-role-groups">
              {grouped.map((group) => (
                <article key={group.role}>
                  <div className="membership130d-group-heading">
                    <div>
                      <span>{roleIcon(group.role)}</span>
                      <div>
                        <h2>{roleLabel(group.role, "business")}</h2>
                        <p>{roleDescription(group.role)}</p>
                      </div>
                    </div>
                    <strong>{group.members.length}</strong>
                  </div>

                  <div className="membership130d-member-list">
                    {group.members.length ? (
                      group.members.map((member) => (
                        <div key={member.id}>
                          <div className="membership130d-avatar">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{member.name}</strong>
                            <small>{member.email}</small>
                          </div>

                          <select
                            value={member.role}
                            onChange={(event) =>
                              updateRole(
                                member.id,
                                event.target.value as WorkspaceRole,
                              )
                            }
                            disabled={member.role === "owner"}
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Administrator</option>
                            <option value="leader">Team Leader</option>
                            <option value="member">Team Member</option>
                          </select>

                          <button
                            disabled={member.role === "owner"}
                            onClick={() => removeMember(member.id)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="membership130d-empty">
                        No members currently have this role.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <article className="membership130d-invitations">
              <div className="membership130d-section-heading">
                <div>
                  <span className="eyebrow">Pending invitations</span>
                  <h2>People who have not joined yet.</h2>
                </div>
                <Link className="button" href="/members">
                  Invite Member
                </Link>
              </div>

              <div className="membership130d-invite-list">
                {pendingInvitations.length ? (
                  pendingInvitations.map((invitation) => (
                    <div key={invitation.id}>
                      <span>✉</span>
                      <div>
                        <strong>{invitation.email}</strong>
                        <small>
                          Invited as {roleLabel(invitation.role, "business")}
                        </small>
                      </div>
                      <em>{invitation.status}</em>
                      <button
                        onClick={() => revokeInvitation(invitation.id)}
                        type="button"
                      >
                        Revoke
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="membership130d-empty">
                    No invitations are currently pending.
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

function roleIcon(role: WorkspaceRole): string {
  return {
    owner: "★",
    admin: "✓",
    leader: "♙",
    member: "◌",
  }[role];
}

function roleDescription(role: WorkspaceRole): string {
  return {
    owner: "Full control of the workspace, roles and membership.",
    admin: "Manages members, invitations and workspace settings.",
    leader: "Creates and reviews teams from eligible Talent.",
    member: "Manages their own profile and participates in teams.",
  }[role];
}

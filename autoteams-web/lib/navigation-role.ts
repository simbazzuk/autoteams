import type { WorkspaceRole } from "@/lib/workspace-access";
import {
  loadMemberships,
} from "@/lib/workspace-access";
import { loadActiveWorkspaceId } from "@/lib/workspaces";

export type NavigationRole =
  | "owner"
  | "admin"
  | "leader"
  | "member";

export function resolveNavigationRole(
  email?: string | null,
): NavigationRole {
  if (typeof window === "undefined") return "member";

  const activeWorkspaceId = loadActiveWorkspaceId();
  const memberships = loadMemberships();

  const membership = memberships.find(
    (item) =>
      item.workspaceId === activeWorkspaceId &&
      item.status === "active" &&
      Boolean(email) &&
      item.email.toLowerCase() === email?.toLowerCase(),
  );

  return normaliseRole(membership?.role);
}

export function normaliseRole(
  role?: WorkspaceRole | string | null,
): NavigationRole {
  if (role === "owner") return "owner";
  if (role === "admin" || role === "administrator") return "admin";
  if (role === "leader" || role === "team_leader") return "leader";
  return "member";
}

export function roleDisplayName(role: NavigationRole): string {
  return {
    owner: "Workspace Owner",
    admin: "Administrator",
    leader: "Team Leader",
    member: "Team Member",
  }[role];
}

export function canManageWorkspace(role: NavigationRole): boolean {
  return role === "owner" || role === "admin";
}

export function canBuildTeams(role: NavigationRole): boolean {
  return role === "owner" || role === "admin" || role === "leader";
}

export function canAccessAdministration(role: NavigationRole): boolean {
  return role === "owner" || role === "admin";
}

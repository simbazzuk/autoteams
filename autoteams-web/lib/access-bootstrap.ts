import {
  WorkspaceMembership,
  loadMemberships,
  saveMemberships,
  createAccessId,
} from "@/lib/workspace-access";
import {
  Workspace,
  createWorkspaceId,
  loadWorkspaces,
  saveActiveWorkspaceId,
  saveWorkspaces,
} from "@/lib/workspaces";

const CURRENT_ACCOUNT_KEY = "autoteams-current-account";

export type CurrentAccount = {
  userId: string;
  name: string;
  email: string;
};

const fallbackAccount: CurrentAccount = {
  userId: "demo-owner",
  name: "Workspace Owner",
  email: "owner@example.com",
};

export function loadCurrentAccount(): CurrentAccount {
  if (typeof window === "undefined") return fallbackAccount;

  try {
    const raw = window.localStorage.getItem(CURRENT_ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as CurrentAccount) : fallbackAccount;
  } catch {
    return fallbackAccount;
  }
}

export function saveCurrentAccount(account: CurrentAccount): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account));
}

export function ensureWorkspaceOwner(
  workspace: Workspace,
  account: CurrentAccount = loadCurrentAccount(),
): WorkspaceMembership {
  const memberships = loadMemberships();
  const existing = memberships.find(
    (membership) =>
      membership.workspaceId === workspace.id &&
      membership.userId === account.userId,
  );

  if (existing) return existing;

  const membership: WorkspaceMembership = {
    id: createAccessId("membership"),
    workspaceId: workspace.id,
    userId: account.userId,
    name: account.name,
    email: account.email,
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
  };

  saveMemberships([...memberships, membership]);
  return membership;
}

export function createOwnedWorkspace(input: {
  name: string;
  type: "personal" | "organisation";
  description: string;
}): Workspace {
  const workspace: Workspace = {
    id: createWorkspaceId("workspace"),
    name: input.name.trim(),
    type: input.type,
    description:
      input.description.trim() ||
      (input.type === "organisation"
        ? "Organisation workspace"
        : "Personal group workspace"),
  };

  const workspaces = loadWorkspaces();
  saveWorkspaces([...workspaces, workspace]);
  ensureWorkspaceOwner(workspace);
  saveActiveWorkspaceId(workspace.id);
  return workspace;
}

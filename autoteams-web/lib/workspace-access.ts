export type WorkspaceRole = "owner" | "admin" | "leader" | "member";
export type WorkspaceCategory =
  | "personal"
  | "friendship"
  | "community"
  | "sports"
  | "education"
  | "business";

export type WorkspaceMembership = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: "active" | "invited";
  joinedAt: string | null;
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  token: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
};

export type MemberConsent = {
  workspaceId: string;
  userId: string;
  teamDnaVisible: boolean;
  allowTeamMatching: boolean;
  allowInsights: boolean;
  updatedAt: string;
};

const MEMBERSHIPS_KEY = "autoteams-workspace-memberships";
const INVITATIONS_KEY = "autoteams-workspace-invitations";
const CONSENT_KEY = "autoteams-member-consent";
const CURRENT_USER_KEY = "autoteams-demo-current-user";

const defaultMemberships: WorkspaceMembership[] = [
  {
    id: "membership-owner",
    workspaceId: "workspace-company",
    userId: "demo-owner",
    name: "Workspace Owner",
    email: "owner@example.com",
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
  },
  {
    id: "membership-leader",
    workspaceId: "workspace-company",
    userId: "demo-leader",
    name: "Team Leader",
    email: "leader@example.com",
    role: "leader",
    status: "active",
    joinedAt: new Date().toISOString(),
  },
  {
    id: "membership-member",
    workspaceId: "workspace-company",
    userId: "demo-member",
    name: "Team Member",
    email: "member@example.com",
    role: "member",
    status: "active",
    joinedAt: new Date().toISOString(),
  },
  {
    id: "membership-personal-owner",
    workspaceId: "workspace-personal",
    userId: "demo-owner",
    name: "Workspace Owner",
    email: "owner@example.com",
    role: "owner",
    status: "active",
    joinedAt: new Date().toISOString(),
  },
];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadMemberships(): WorkspaceMembership[] {
  const items = readLocal(MEMBERSHIPS_KEY, defaultMemberships);
  if (
    typeof window !== "undefined" &&
    !window.localStorage.getItem(MEMBERSHIPS_KEY)
  ) {
    writeLocal(MEMBERSHIPS_KEY, defaultMemberships);
  }
  return items;
}

export function saveMemberships(items: WorkspaceMembership[]): void {
  writeLocal(MEMBERSHIPS_KEY, items);
}

export function loadInvitations(): WorkspaceInvitation[] {
  return readLocal(INVITATIONS_KEY, []);
}

export function saveInvitations(items: WorkspaceInvitation[]): void {
  writeLocal(INVITATIONS_KEY, items);
}

export function loadConsents(): MemberConsent[] {
  return readLocal(CONSENT_KEY, []);
}

export function saveConsents(items: MemberConsent[]): void {
  writeLocal(CONSENT_KEY, items);
}

export function loadCurrentDemoUserId(): string {
  if (typeof window === "undefined") return "demo-owner";
  return window.localStorage.getItem(CURRENT_USER_KEY) || "demo-owner";
}

export function saveCurrentDemoUserId(userId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function roleCanCreateWorkspace(role: WorkspaceRole | null): boolean {
  return role === "owner";
}

export function roleCanManageMembers(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function roleCanCreateTeams(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin" || role === "leader";
}

export function roleCanManagePools(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin" || role === "leader";
}

export function roleLabel(
  role: WorkspaceRole,
  category: WorkspaceCategory = "business",
): string {
  if (category === "friendship" || category === "community") {
    const labels: Record<WorkspaceRole, string> = {
      owner: "Group Owner",
      admin: "Group Organiser",
      leader: "Activity Organiser",
      member: "Member",
    };
    return labels[role];
  }

  const labels: Record<WorkspaceRole, string> = {
    owner: "Owner",
    admin: "Administrator",
    leader: "Team Leader",
    member: "Team Member",
  };
  return labels[role];
}

export function createAccessId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createInviteToken(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

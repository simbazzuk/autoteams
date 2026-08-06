export type WorkspaceType =
  | "organisation"
  | "community"
  | "sports"
  | "education"
  | "friends_family"
  | "personal";

export type WorkspaceContext =
  | "business"
  | "community"
  | "sports"
  | "education"
  | "friendship";

export type Workspace = {
  id: string;
  name: string;
  type: WorkspaceType;
  description: string;
  defaultContext?: WorkspaceContext;
};

export type WorkspacePerson = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  location: string;
  status: "active" | "inactive";
  teamDnaStatus: "ready" | "not-started";
  strengths: string[];
};

export type TalentPool = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  personIds: string[];
};

const WK = "autoteams-v9-workspaces";
const PK = "autoteams-v9-people";
const TK = "autoteams-v9-pools";
const AK = "autoteams-v9-active-workspace";

const workspaces: Workspace[] = [
  {
    id: "workspace-personal",
    name: "My Workspace",
    type: "friends_family",
    defaultContext: "friendship",
    description: "Private people you create or invite.",
  },
  {
    id: "workspace-company",
    name: "Example Company",
    type: "organisation",
    defaultContext: "business",
    description: "Sample employee-only organisation workspace.",
  },
];

const people: WorkspacePerson[] = [
  {
    id: "p1",
    workspaceId: "workspace-company",
    name: "Amara Singh",
    email: "amara@example.com",
    department: "Product",
    jobTitle: "Product Manager",
    location: "London",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Communication", "Customer focus", "Collaboration"],
  },
  {
    id: "p2",
    workspaceId: "workspace-company",
    name: "James Wilson",
    email: "james@example.com",
    department: "Engineering",
    jobTitle: "Lead Engineer",
    location: "Manchester",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Delivery", "Leadership", "Planning"],
  },
  {
    id: "p3",
    workspaceId: "workspace-company",
    name: "Maya Patel",
    email: "maya@example.com",
    department: "Data",
    jobTitle: "Data Scientist",
    location: "Leeds",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Analysis", "Challenge", "Problem solving"],
  },
  {
    id: "p4",
    workspaceId: "workspace-company",
    name: "Daniel Green",
    email: "daniel@example.com",
    department: "Operations",
    jobTitle: "Delivery Manager",
    location: "Birmingham",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Organisation", "Reliability", "Stakeholders"],
  },
  {
    id: "p5",
    workspaceId: "workspace-company",
    name: "Aisha Khan",
    email: "aisha@example.com",
    department: "Design",
    jobTitle: "Service Designer",
    location: "London",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Creativity", "Facilitation", "Empathy"],
  },
  {
    id: "p6",
    workspaceId: "workspace-company",
    name: "Tom Evans",
    email: "tom@example.com",
    department: "Engineering",
    jobTitle: "Software Engineer",
    location: "Leeds",
    status: "active",
    teamDnaStatus: "not-started",
    strengths: ["Engineering", "Adaptability"],
  },
  {
    id: "p7",
    workspaceId: "workspace-personal",
    name: "Alex Morgan",
    email: "alex@example.com",
    department: "Community",
    jobTitle: "Volunteer Coordinator",
    location: "Leeds",
    status: "active",
    teamDnaStatus: "ready",
    strengths: ["Community", "Communication", "Organisation"],
  },
];

const pools: TalentPool[] = [
  {
    id: "t1",
    workspaceId: "workspace-company",
    name: "Engineering Delivery",
    description: "Engineering and delivery colleagues.",
    personIds: ["p2", "p3", "p4", "p6"],
  },
  {
    id: "t2",
    workspaceId: "workspace-company",
    name: "Product Innovation",
    description: "Product, data and design colleagues.",
    personIds: ["p1", "p3", "p5"],
  },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function defaultContextForWorkspace(
  type: WorkspaceType,
): WorkspaceContext {
  const contextByType: Record<WorkspaceType, WorkspaceContext> = {
    organisation: "business",
    community: "community",
    sports: "sports",
    education: "education",
    friends_family: "friendship",
    personal: "friendship",
  };

  return contextByType[type];
}

export function workspaceTypeLabel(type: WorkspaceType): string {
  return {
    organisation: "Organisation",
    community: "Community Group",
    sports: "Sports Club",
    education: "Education",
    friends_family: "Friends & Family",
    personal: "Friends & Family",
  }[type];
}

export function workspaceContextLabel(
  workspace: Workspace,
): string {
  const context =
    workspace.defaultContext ||
    defaultContextForWorkspace(workspace.type);

  return {
    business: "Business Atlas Profile",
    community: "Community Atlas Profile",
    sports: "Sports Atlas Profile",
    education: "Education Atlas Profile",
    friendship: "Friendship Atlas Profile",
  }[context];
}

function normaliseWorkspace(workspace: Workspace): Workspace {
  const type =
    workspace.type === "personal"
      ? "friends_family"
      : workspace.type;

  return {
    ...workspace,
    type,
    defaultContext:
      workspace.defaultContext ||
      defaultContextForWorkspace(type),
  };
}

export const loadWorkspaces = (): Workspace[] =>
  load<Workspace[]>(WK, workspaces).map(normaliseWorkspace);

export const saveWorkspaces = (value: Workspace[]): void =>
  save(
    WK,
    value.map(normaliseWorkspace),
  );

export const loadPeople = (): WorkspacePerson[] =>
  load<WorkspacePerson[]>(PK, people);

export const savePeople = (value: WorkspacePerson[]): void =>
  save(PK, value);

export const loadTalentPools = (): TalentPool[] =>
  load<TalentPool[]>(TK, pools);

export const saveTalentPools = (value: TalentPool[]): void =>
  save(TK, value);

export const loadActiveWorkspaceId = (): string =>
  typeof window === "undefined"
    ? "workspace-company"
    : localStorage.getItem(AK) || "workspace-company";

export const saveActiveWorkspaceId = (id: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AK, id);
  }
};

export const createWorkspaceId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

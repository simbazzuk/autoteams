import type {
  TalentPool,
  Workspace,
  WorkspacePerson,
} from "@/lib/workspaces";
import type {
  WorkspaceInvitation,
  WorkspaceMembership,
} from "@/lib/workspace-access";
import type {
  ContextMode,
  ContextualProfile,
} from "@/lib/contextual-profiles";
import type {
  ContextInterviewState,
  CoreInterviewState,
} from "@/lib/atlas-interview-state";
import type {
  NotificationPreferences,
  NotificationRecord,
} from "@/lib/notifications";

export type DemoDatasetId =
  | "empty"
  | "business"
  | "friendship"
  | "community"
  | "sports";

export type DemoDatasetDefinition = {
  id: DemoDatasetId;
  name: string;
  description: string;
  people: number;
  profiles: number;
  teams: number;
};

export type DemoTeam = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  memberIds: string[];
  confidence: number;
  status: "active" | "draft" | "review";
};

export type DemoRecommendation = {
  id: string;
  workspaceId: string;
  title: string;
  memberIds: string[];
  confidence: number;
  reasons: string[];
  risks: string[];
};

export const demoDatasets: DemoDatasetDefinition[] = [
  {
    id: "empty",
    name: "Empty Workspace",
    description: "Remove demo content and test first-use and empty states.",
    people: 0,
    profiles: 0,
    teams: 0,
  },
  {
    id: "business",
    name: "Acme Technology",
    description:
      "A software company with Engineering, Product, Data, AI, Operations and Architecture.",
    people: 24,
    profiles: 10,
    teams: 3,
  },
  {
    id: "friendship",
    name: "City Social Circle",
    description:
      "A private friendship network interested in walking, food, cinema, travel and board games.",
    people: 18,
    profiles: 8,
    teams: 4,
  },
  {
    id: "community",
    name: "Community Action Network",
    description:
      "Volunteers supporting food banks, outreach, mentoring, fundraising and practical support.",
    people: 20,
    profiles: 9,
    teams: 3,
  },
  {
    id: "sports",
    name: "Northside Sports Club",
    description:
      "A mixed-ability sports club covering football, cricket, running and cycling.",
    people: 22,
    profiles: 9,
    teams: 4,
  },
];

const ACTIVE_DEMO_KEY = "autoteams-active-demo-dataset";

const STORAGE_KEYS = {
  workspaces: "autoteams-v9-workspaces",
  people: "autoteams-v9-people",
  pools: "autoteams-v9-pools",
  activeWorkspace: "autoteams-v9-active-workspace",
  memberships: "autoteams-workspace-memberships",
  invitations: "autoteams-workspace-invitations",
  profiles: "autoteams-contextual-profiles",
  activeProfile: "autoteams-active-contextual-profile",
  coreInterview: "autoteams-atlas-core-interview",
  contextInterviews: "autoteams-atlas-context-interviews",
  notifications: "autoteams-notifications",
  notificationPreferences: "autoteams-notification-preferences",
  demoTeams: "autoteams-demo-teams",
  demoRecommendations: "autoteams-demo-recommendations",
};

export function loadActiveDemoDataset(): DemoDatasetId {
  if (typeof window === "undefined") return "empty";
  return (
    (window.localStorage.getItem(ACTIVE_DEMO_KEY) as DemoDatasetId) || "empty"
  );
}

export function applyDemoDataset(datasetId: DemoDatasetId): void {
  if (typeof window === "undefined") return;

  if (datasetId === "empty") {
    clearDemoDataset();
    return;
  }

  const dataset = buildDataset(datasetId);
  writeJson(STORAGE_KEYS.workspaces, dataset.workspaces);
  writeJson(STORAGE_KEYS.people, dataset.people);
  writeJson(STORAGE_KEYS.pools, dataset.pools);
  window.localStorage.setItem(
    STORAGE_KEYS.activeWorkspace,
    dataset.workspaces[0].id,
  );
  writeJson(STORAGE_KEYS.memberships, dataset.memberships);
  writeJson(STORAGE_KEYS.invitations, dataset.invitations);
  writeJson(STORAGE_KEYS.profiles, dataset.profiles);
  window.localStorage.setItem(
    STORAGE_KEYS.activeProfile,
    dataset.profiles[0]?.id || "",
  );
  writeJson(STORAGE_KEYS.coreInterview, dataset.coreInterview);
  writeJson(STORAGE_KEYS.contextInterviews, dataset.contextInterviews);
  writeJson(STORAGE_KEYS.notifications, dataset.notifications);
  writeJson(
    STORAGE_KEYS.notificationPreferences,
    dataset.notificationPreferences,
  );
  writeJson(STORAGE_KEYS.demoTeams, dataset.teams);
  writeJson(STORAGE_KEYS.demoRecommendations, dataset.recommendations);
  window.localStorage.setItem(ACTIVE_DEMO_KEY, datasetId);
}

export function clearDemoDataset(): void {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) =>
    window.localStorage.removeItem(key),
  );
  window.localStorage.setItem(ACTIVE_DEMO_KEY, "empty");
}

export function loadDemoTeams(): DemoTeam[] {
  return readJson<DemoTeam[]>(STORAGE_KEYS.demoTeams, []);
}

export function loadDemoRecommendations(): DemoRecommendation[] {
  return readJson<DemoRecommendation[]>(
    STORAGE_KEYS.demoRecommendations,
    [],
  );
}

function writeJson(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type Dataset = {
  workspaces: Workspace[];
  people: WorkspacePerson[];
  pools: TalentPool[];
  memberships: WorkspaceMembership[];
  invitations: WorkspaceInvitation[];
  profiles: ContextualProfile[];
  coreInterview: CoreInterviewState;
  contextInterviews: ContextInterviewState[];
  notifications: NotificationRecord[];
  notificationPreferences: NotificationPreferences;
  teams: DemoTeam[];
  recommendations: DemoRecommendation[];
};

type PersonSeed = {
  name: string;
  department: string;
  role: string;
  location: string;
  strengths: string[];
};

function buildDataset(
  datasetId: Exclude<DemoDatasetId, "empty">,
): Dataset {
  const config = datasetConfig(datasetId);
  const workspaceId = `demo-${datasetId}`;
  const people = buildPeople(workspaceId, config.people);
  const workspaces: Workspace[] = [
    {
      id: workspaceId,
      name: config.name,
      type: datasetId === "business" ? "organisation" : "personal",
      description: config.description,
    },
  ];

  const pools = buildPools(workspaceId, datasetId, people);
  const memberships = buildMemberships(workspaceId, people);
  const invitations = buildInvitations(workspaceId, datasetId);
  const profiles = buildProfiles(datasetId, people, config.profileCount);
  const coreInterview = buildCoreInterview();
  const contextInterviews = buildContextInterviews(profiles);
  const teams = buildTeams(workspaceId, datasetId, people);
  const recommendations = buildRecommendations(
    workspaceId,
    datasetId,
    people,
  );

  return {
    workspaces,
    people,
    pools,
    memberships,
    invitations,
    profiles,
    coreInterview,
    contextInterviews,
    notifications: buildNotifications(datasetId, config.name),
    notificationPreferences: {
      atlasReminders: true,
      workspaceInvites: true,
      teamRecommendations: true,
      profileUpdates: true,
      securityAlerts: true,
      weeklyDigest: true,
    },
    teams,
    recommendations,
  };
}

function datasetConfig(
  datasetId: Exclude<DemoDatasetId, "empty">,
): {
  name: string;
  description: string;
  profileCount: number;
  people: PersonSeed[];
} {
  const configs = {
    business: {
      name: "Acme Technology",
      description: "Digital products, cloud platforms and AI engineering.",
      profileCount: 10,
      people: businessPeople(),
    },
    friendship: {
      name: "City Social Circle",
      description: "A private group for activities and shared interests.",
      profileCount: 8,
      people: friendshipPeople(),
    },
    community: {
      name: "Community Action Network",
      description: "Volunteers supporting outreach, food banks and mentoring.",
      profileCount: 9,
      people: communityPeople(),
    },
    sports: {
      name: "Northside Sports Club",
      description: "Football, cricket, running and cycling for mixed abilities.",
      profileCount: 9,
      people: sportsPeople(),
    },
  };
  return configs[datasetId];
}

function buildPeople(
  workspaceId: string,
  seeds: PersonSeed[],
): WorkspacePerson[] {
  return seeds.map((seed, index) => ({
    id: `demo-person-${index + 1}`,
    workspaceId,
    name: seed.name,
    email: `${seed.name
      .toLowerCase()
      .replace(/[^a-z]+/g, ".")
      .replace(/\.$/, "")}@demo.autoteams`,
    department: seed.department,
    jobTitle: seed.role,
    location: seed.location,
    status: index === seeds.length - 1 ? "inactive" : "active",
    teamDnaStatus: index < Math.ceil(seeds.length * 0.75)
      ? "ready"
      : "not-started",
    strengths: seed.strengths,
  }));
}

function buildPools(
  workspaceId: string,
  datasetId: DemoDatasetId,
  people: WorkspacePerson[],
): TalentPool[] {
  const midpoint = Math.ceil(people.length / 2);
  return [
    {
      id: `demo-pool-${datasetId}-1`,
      workspaceId,
      name: primaryPoolName(datasetId),
      description: "Primary eligible population for Atlas recommendations.",
      personIds: people.slice(0, midpoint).map((person) => person.id),
    },
    {
      id: `demo-pool-${datasetId}-2`,
      workspaceId,
      name: secondaryPoolName(datasetId),
      description: "Secondary population for filtering and comparison.",
      personIds: people.slice(midpoint).map((person) => person.id),
    },
  ];
}

function buildMemberships(
  workspaceId: string,
  people: WorkspacePerson[],
): WorkspaceMembership[] {
  return people.slice(0, 12).map((person, index) => ({
    id: `demo-membership-${index + 1}`,
    workspaceId,
    userId: index === 0 ? "demo-owner" : `demo-user-${index + 1}`,
    name: index === 0 ? "Sukhvinder Panesar" : person.name,
    email: index === 0 ? "owner@autoteams.demo" : person.email,
    role:
      index === 0
        ? "owner"
        : index <= 2
          ? "admin"
          : index <= 5
            ? "leader"
            : "member",
    status: "active",
    joinedAt: new Date(
      Date.now() - 86400000 * (90 - index * 3),
    ).toISOString(),
  }));
}

function buildInvitations(
  workspaceId: string,
  datasetId: DemoDatasetId,
): WorkspaceInvitation[] {
  const counts = datasetId === "community" ? 3 : 2;
  return Array.from({ length: counts }, (_, index) => ({
    id: `demo-invite-${datasetId}-${index + 1}`,
    workspaceId,
    email: `pending${index + 1}@${datasetId}.demo`,
    name: `Pending Member ${index + 1}`,
    role: index === 0 ? "leader" : "member",
    token: `DEMO${datasetId.toUpperCase()}${index + 1}`,
    status: "pending",
    createdAt: new Date(
      Date.now() - 86400000 * (index + 1),
    ).toISOString(),
  }));
}

function buildProfiles(
  datasetId: Exclude<DemoDatasetId, "empty">,
  people: WorkspacePerson[],
  count: number,
): ContextualProfile[] {
  const mode = datasetId as ContextMode;
  return people.slice(0, count).map((person, index) => ({
    id: `demo-profile-${datasetId}-${index + 1}`,
    mode,
    label: `${person.name} ${profileLabel(mode)}`,
    preferredName: person.name,
    generalLocation: person.location,
    interests: person.strengths,
    availability: index % 2 === 0 ? "Flexible" : "Weekdays",
    photoVisible: true,
    profileVisible: true,
    allowTeamMatching: true,
    allowAggregatedInsights: true,
    allowDiscovery: mode !== "business",
    fields: {
      jobTitle: person.jobTitle,
      department: person.department,
      experienceLevel: ["Developing", "Experienced", "Senior", "Leadership"][
        index % 4
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    updatedAt: new Date(
      Date.now() - 86400000 * (10 + index * 30),
    ).toISOString(),
  }));
}

function buildCoreInterview(): CoreInterviewState {
  const completedAt = new Date(Date.now() - 86400000 * 20).toISOString();
  return {
    answers: {
      "core-communication":
        "I explain the goal clearly, listen to concerns and confirm the next step.",
      "core-collaboration":
        "I connect people, contribute structure and help remove blockers.",
      "core-planning":
        "I prefer a clear plan with enough flexibility for new information.",
      "core-adaptability":
        "I reassess priorities quickly and communicate the impact of change.",
      "core-leadership":
        "I step forward when direction is missing and support others when appropriate.",
      "core-conflict":
        "I focus on evidence, listen carefully and find the shared objective.",
    },
    completedAt,
    updatedAt: completedAt,
  };
}

function buildContextInterviews(
  profiles: ContextualProfile[],
): ContextInterviewState[] {
  return profiles.map((profile, index) => {
    const completed = index < Math.ceil(profiles.length * 0.7);
    const ageDays = index === 5 ? 430 : 15 + index * 40;
    const completedAt = completed
      ? new Date(Date.now() - 86400000 * ageDays).toISOString()
      : null;

    return {
      profileId: profile.id,
      mode: profile.mode,
      answers: completed
        ? {
            [`${profile.mode}-demo-1`]:
              "I contribute through clear communication and dependable follow-through.",
            [`${profile.mode}-demo-2`]:
              "I adapt my approach to the group and the outcome required.",
            [`${profile.mode}-demo-3`]:
              "I welcome honest feedback and use it to improve.",
          }
        : {},
      completedAt,
      updatedAt: completedAt || new Date().toISOString(),
    };
  });
}

function buildNotifications(
  datasetId: DemoDatasetId,
  workspaceName: string,
): NotificationRecord[] {
  return [
    {
      id: `demo-notification-${datasetId}-1`,
      type: "workspace",
      title: `${workspaceName} demo loaded`,
      message: "Workspace members and invitations are ready to test.",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      read: false,
      href: "/profile/membership",
    },
    {
      id: `demo-notification-${datasetId}-2`,
      type: "atlas",
      title: "Atlas profile needs attention",
      message:
        "One profile is incomplete and another is due for a Team DNA refresh.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      href: "/team-dna",
    },
    {
      id: `demo-notification-${datasetId}-3`,
      type: "team",
      title: "Team recommendation available",
      message:
        "Atlas generated a recommendation from the active demo Talent Pool.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      href: "/teams",
    },
    {
      id: `demo-notification-${datasetId}-4`,
      type: "security",
      title: "Review account security",
      message:
        "Email verification and MFA readiness remain available for testing.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      href: "/profile/security",
    },
  ];
}

function buildTeams(
  workspaceId: string,
  datasetId: DemoDatasetId,
  people: WorkspacePerson[],
): DemoTeam[] {
  const names = {
    business: ["Platform Engineering", "Cloud Migration", "AI Enablement"],
    friendship: [
      "Weekend Walkers",
      "Food Explorers",
      "Cinema Circle",
      "Travel Group",
    ],
    community: ["Outreach Team", "Food Support Crew", "Fundraising Group"],
    sports: ["First Team", "Development Squad", "Running Group", "Cycling Group"],
    empty: [],
  }[datasetId];

  return names.map((name, index) => ({
    id: `demo-team-${datasetId}-${index + 1}`,
    workspaceId,
    name,
    purpose: teamPurpose(datasetId),
    memberIds: people
      .slice(index * 3, index * 3 + 5)
      .map((person) => person.id),
    confidence: 92 - index * 3,
    status: index === 0 ? "active" : index === 1 ? "review" : "draft",
  }));
}

function buildRecommendations(
  workspaceId: string,
  datasetId: DemoDatasetId,
  people: WorkspacePerson[],
): DemoRecommendation[] {
  return [
    {
      id: `demo-recommendation-${datasetId}-1`,
      workspaceId,
      title: `Recommended ${teamLabel(datasetId)}`,
      memberIds: people.slice(0, 5).map((person) => person.id),
      confidence: 92,
      reasons: [
        "Strong communication balance",
        "Complementary planning and delivery styles",
        "Leadership is present without being over-concentrated",
        "Good adaptability and resilience coverage",
      ],
      risks: ["Conflict mediation is the main remaining development area"],
    },
  ];
}

function primaryPoolName(datasetId: DemoDatasetId): string {
  return {
    empty: "Primary Pool",
    business: "Engineering & Product",
    friendship: "Weekend Activities",
    community: "Outreach Volunteers",
    sports: "Competitive Members",
  }[datasetId];
}

function secondaryPoolName(datasetId: DemoDatasetId): string {
  return {
    empty: "Secondary Pool",
    business: "Data & AI",
    friendship: "Food & Culture",
    community: "Fundraising & Events",
    sports: "Recreational Members",
  }[datasetId];
}

function profileLabel(mode: ContextMode): string {
  return {
    business: "Business Profile",
    friendship: "Friendship Profile",
    community: "Community Profile",
    sports: "Sports Profile",
    education: "Education Profile",
  }[mode];
}

function teamLabel(datasetId: DemoDatasetId): string {
  return {
    empty: "team",
    business: "delivery team",
    friendship: "activity group",
    community: "volunteer team",
    sports: "sports squad",
  }[datasetId];
}

function teamPurpose(datasetId: DemoDatasetId): string {
  return {
    empty: "General collaboration",
    business: "Cross-functional delivery",
    friendship: "Shared social activity",
    community: "Community service and outreach",
    sports: "Balanced participation and performance",
  }[datasetId];
}

function person(
  name: string,
  role: string,
  department: string,
  location: string,
  strengths: string[],
): PersonSeed {
  return { name, role, department, location, strengths };
}

function businessPeople(): PersonSeed[] {
  return [
    person("Sarah Johnson", "Engineering Manager", "Engineering", "Leeds", ["Leadership", "Cloud", "Coaching"]),
    person("David Chen", "Software Engineer", "Engineering", "London", ["React", "TypeScript", "APIs"]),
    person("Priya Patel", "Solution Architect", "Architecture", "Manchester", ["Architecture", "GCP", "Security"]),
    person("James Wilson", "Product Manager", "Product", "Birmingham", ["Product", "Strategy", "Discovery"]),
    person("Emma Brown", "Data Engineer", "Data", "Leeds", ["BigQuery", "Python", "dbt"]),
    person("Michael Evans", "AI Engineer", "AI", "London", ["Gemini", "Machine Learning", "Python"]),
    person("Rachel Green", "Delivery Lead", "Operations", "Manchester", ["Facilitation", "Delivery", "Risk"]),
    person("Tom Roberts", "DevOps Engineer", "Engineering", "Leeds", ["Terraform", "Harness", "Cloud Run"]),
    person("Aisha Khan", "UX Designer", "Product", "London", ["Research", "Design", "Accessibility"]),
    person("Daniel Smith", "Business Analyst", "Product", "Birmingham", ["Analysis", "Stakeholders", "Process"]),
    person("Olivia Martin", "Security Engineer", "Engineering", "Glasgow", ["IAM", "Threat Modelling", "GCP"]),
    person("Noah Williams", "Platform Engineer", "Engineering", "Manchester", ["Kubernetes", "Observability", "Networking"]),
    person("Sophie Taylor", "Data Scientist", "AI", "Leeds", ["Analytics", "ML", "Experimentation"]),
    person("Ethan Jones", "QA Engineer", "Engineering", "London", ["Automation", "Testing", "Quality"]),
    person("Mia Thomas", "Scrum Master", "Operations", "Birmingham", ["Coaching", "Agile", "Facilitation"]),
    person("Leo White", "Cloud Engineer", "Engineering", "Leeds", ["GCP", "Cloud Run", "FinOps"]),
    person("Grace Hall", "Researcher", "Product", "London", ["Interviews", "Insights", "Usability"]),
    person("Adam Clark", "Data Analyst", "Data", "Manchester", ["SQL", "Dashboards", "Risk"]),
    person("Nina Singh", "Technical Writer", "Product", "Leeds", ["Documentation", "Enablement", "Content"]),
    person("Sam Walker", "Operations Analyst", "Operations", "Glasgow", ["Incidents", "Reporting", "SLA"]),
    person("Harry Lewis", "Backend Engineer", "Engineering", "London", ["Java", "APIs", "Databases"]),
    person("Ella Young", "Frontend Engineer", "Engineering", "Leeds", ["React", "Accessibility", "Design Systems"]),
    person("Jack King", "ML Engineer", "AI", "Manchester", ["Vertex AI", "MLOps", "Python"]),
    person("Lily Scott", "Change Manager", "Operations", "Birmingham", ["Change", "Communications", "Training"]),
  ];
}

function friendshipPeople(): PersonSeed[] {
  return [
    person("Maya Shah", "Social Organiser", "Friendship", "Leeds", ["Walking", "Food", "Travel"]),
    person("Ben Adams", "Activity Member", "Friendship", "London", ["Cinema", "Music", "Coffee"]),
    person("Zara Ali", "Community Connector", "Friendship", "Manchester", ["Board Games", "Food", "Culture"]),
    person("Liam Davis", "Activity Member", "Friendship", "Birmingham", ["Running", "Travel", "Photography"]),
    person("Ruby Moore", "Group Host", "Friendship", "Leeds", ["Dinner", "Events", "Theatre"]),
    person("Finn Baker", "Activity Member", "Friendship", "London", ["Hiking", "Cycling", "Coffee"]),
    person("Isla Cooper", "Activity Member", "Friendship", "Manchester", ["Books", "Cinema", "Museums"]),
    person("Arjun Mehta", "Travel Planner", "Friendship", "Birmingham", ["Travel", "Food", "Walking"]),
    person("Holly Ward", "Activity Member", "Friendship", "Leeds", ["Yoga", "Brunch", "Wellbeing"]),
    person("Omar Hussain", "Activity Member", "Friendship", "London", ["Football", "Food", "Music"]),
    person("Lucy Price", "Group Host", "Friendship", "Manchester", ["Crafts", "Coffee", "Events"]),
    person("Theo Gray", "Activity Member", "Friendship", "Birmingham", ["Gaming", "Cinema", "Technology"]),
    person("Amina Yusuf", "Activity Member", "Friendship", "Leeds", ["Walking", "Community", "Food"]),
    person("George Hill", "Activity Member", "Friendship", "London", ["Pubs", "Sport", "Travel"]),
    person("Freya Wood", "Activity Member", "Friendship", "Manchester", ["Art", "Museums", "Books"]),
    person("Isaac Turner", "Activity Member", "Friendship", "Birmingham", ["Running", "Cycling", "Music"]),
    person("Amelia Ross", "Social Organiser", "Friendship", "Leeds", ["Events", "Travel", "Food"]),
    person("Yusuf Malik", "Activity Member", "Friendship", "London", ["Cricket", "Coffee", "Travel"]),
  ];
}

function communityPeople(): PersonSeed[] {
  return [
    person("Anita Kaur", "Volunteer Coordinator", "Community", "Leeds", ["Coordination", "Outreach", "Mentoring"]),
    person("Mark Jackson", "Outreach Volunteer", "Community", "London", ["Homeless Outreach", "Listening", "Support"]),
    person("Fatima Noor", "Food Bank Lead", "Community", "Manchester", ["Food Support", "Logistics", "Community"]),
    person("Peter Hughes", "Driver", "Community", "Birmingham", ["Transport", "Reliability", "Practical Support"]),
    person("Sana Mir", "Mentor", "Community", "Leeds", ["Mentoring", "Education", "Youth Support"]),
    person("Joseph Lee", "Fundraiser", "Community", "London", ["Fundraising", "Events", "Communication"]),
    person("Kavita Rao", "Community Connector", "Community", "Manchester", ["Languages", "Outreach", "Inclusion"]),
    person("Chris Morgan", "Practical Volunteer", "Community", "Birmingham", ["Repairs", "Logistics", "Set-up"]),
    person("Nadia Ahmed", "Support Volunteer", "Community", "Leeds", ["Listening", "Safeguarding", "Empathy"]),
    person("Paul Bell", "Events Organiser", "Community", "London", ["Events", "Planning", "Volunteers"]),
    person("Meera Das", "Communications Volunteer", "Community", "Manchester", ["Social Media", "Writing", "Campaigns"]),
    person("Stephen Reed", "Food Support Volunteer", "Community", "Birmingham", ["Food", "Packing", "Delivery"]),
    person("Yasmin Begum", "Mentor", "Community", "Leeds", ["Careers", "Coaching", "Youth"]),
    person("Robert Kelly", "Outreach Volunteer", "Community", "London", ["Street Outreach", "Support", "First Aid"]),
    person("Simran Gill", "Volunteer Coordinator", "Community", "Manchester", ["Scheduling", "People", "Training"]),
    person("Diane Foster", "Fundraiser", "Community", "Birmingham", ["Donors", "Events", "Partnerships"]),
    person("Imran Qureshi", "Driver", "Community", "Leeds", ["Transport", "Food Delivery", "Reliability"]),
    person("Claire Bennett", "Support Volunteer", "Community", "London", ["Listening", "Wellbeing", "Community"]),
    person("Raj Singh", "Practical Volunteer", "Community", "Manchester", ["Maintenance", "Logistics", "Set-up"]),
    person("Helen Cook", "Community Researcher", "Community", "Birmingham", ["Research", "Needs Analysis", "Reporting"]),
  ];
}

function sportsPeople(): PersonSeed[] {
  return [
    person("Alex Murphy", "Team Captain", "Football", "Leeds", ["Leadership", "Midfield", "Motivation"]),
    person("Jay Singh", "Player", "Football", "London", ["Defence", "Fitness", "Teamwork"]),
    person("Morgan Lee", "Player", "Football", "Manchester", ["Attack", "Pace", "Creativity"]),
    person("Samira Khan", "Running Lead", "Running", "Birmingham", ["Endurance", "Coaching", "Planning"]),
    person("Owen Price", "Runner", "Running", "Leeds", ["10K", "Pacing", "Consistency"]),
    person("Leila Rahman", "Runner", "Running", "London", ["5K", "Social Running", "Motivation"]),
    person("Dan Wright", "Cricket Captain", "Cricket", "Manchester", ["Captaincy", "Batting", "Tactics"]),
    person("Ravi Sharma", "Cricketer", "Cricket", "Birmingham", ["Bowling", "Fielding", "Teamwork"]),
    person("Chloe King", "Cycling Lead", "Cycling", "Leeds", ["Road Cycling", "Routes", "Safety"]),
    person("Matt Evans", "Cyclist", "Cycling", "London", ["Endurance", "Maintenance", "Group Rides"]),
    person("Sophia Doyle", "Player", "Football", "Manchester", ["Goalkeeping", "Communication", "Resilience"]),
    person("Aaron Patel", "Cricketer", "Cricket", "Birmingham", ["Batting", "Fitness", "Consistency"]),
    person("Jess Harris", "Runner", "Running", "Leeds", ["Trail Running", "Wellbeing", "Pacing"]),
    person("Reece Thomas", "Cyclist", "Cycling", "London", ["Climbing", "Speed", "Navigation"]),
    person("Nisha Verma", "Player", "Football", "Manchester", ["Midfield", "Passing", "Teamwork"]),
    person("Callum Scott", "Cricketer", "Cricket", "Birmingham", ["Wicketkeeping", "Tactics", "Communication"]),
    person("Erin Clarke", "Runner", "Running", "Leeds", ["Half Marathon", "Planning", "Motivation"]),
    person("Adil Mahmood", "Cyclist", "Cycling", "London", ["Road Cycling", "Fitness", "Group Support"]),
    person("Beth Williams", "Player", "Football", "Manchester", ["Defence", "Leadership", "Resilience"]),
    person("Kieran Brown", "Cricketer", "Cricket", "Birmingham", ["Bowling", "Strategy", "Coaching"]),
    person("Layla Jones", "Runner", "Running", "Leeds", ["Beginners", "Inclusion", "Motivation"]),
    person("Dylan Green", "Cyclist", "Cycling", "London", ["Routes", "Maintenance", "Safety"]),
  ];
}

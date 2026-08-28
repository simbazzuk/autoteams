export type TeamSciencePlan = "free" | "pro" | "organisation";

export type TeamScienceEntitlement =
  | "build_team"
  | "atlas_basic"
  | "team_dna_basic"
  | "academy_foundations"
  | "compare_teams"
  | "what_if"
  | "atlas_advanced"
  | "team_dna_advanced"
  | "team_health"
  | "academy_advanced"
  | "multiple_workspaces"
  | "organisation_admin"
  | "role_governance"
  | "organisation_analytics"
  | "learning_dashboards"
  | "audit_governance";

export type PlanLimits = {
  savedTeams: number | null;
  recommendations: number | null;
  workspaces: number | null;
};

export type PlanDefinition = {
  id: TeamSciencePlan;
  name: string;
  rank: number;
  entitlements: readonly TeamScienceEntitlement[];
  limits: PlanLimits;
};

export const TEAMSCIENCE_PLANS: Record<TeamSciencePlan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    rank: 0,
    entitlements: [
      "build_team",
      "atlas_basic",
      "team_dna_basic",
      "academy_foundations",
    ],
    limits: {
      savedTeams: 5,
      recommendations: 10,
      workspaces: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    rank: 1,
    entitlements: [
      "build_team",
      "atlas_basic",
      "team_dna_basic",
      "academy_foundations",
      "compare_teams",
      "what_if",
      "atlas_advanced",
      "team_dna_advanced",
      "team_health",
      "academy_advanced",
    ],
    limits: {
      savedTeams: null,
      recommendations: null,
      workspaces: 1,
    },
  },
  organisation: {
    id: "organisation",
    name: "Organisation",
    rank: 2,
    entitlements: [
      "build_team",
      "atlas_basic",
      "team_dna_basic",
      "academy_foundations",
      "compare_teams",
      "what_if",
      "atlas_advanced",
      "team_dna_advanced",
      "team_health",
      "academy_advanced",
      "multiple_workspaces",
      "organisation_admin",
      "role_governance",
      "organisation_analytics",
      "learning_dashboards",
      "audit_governance",
    ],
    limits: {
      savedTeams: null,
      recommendations: null,
      workspaces: null,
    },
  },
};

const PLAN_STORAGE_KEY = "teamscience-ai-v7157-workspace-plans";

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function normalisePlan(value?: string | null): TeamSciencePlan {
  if (value === "pro" || value === "organisation") return value;
  return "free";
}

export function getWorkspacePlan(workspaceId?: string | null): TeamSciencePlan {
  if (!workspaceId) return "free";
  const storage = browserStorage();
  if (!storage) return "free";

  try {
    const plans = JSON.parse(storage.getItem(PLAN_STORAGE_KEY) || "{}") as Record<string, string>;
    return normalisePlan(plans[workspaceId]);
  } catch {
    return "free";
  }
}

export function setWorkspacePlan(workspaceId: string, plan: TeamSciencePlan): void {
  const storage = browserStorage();
  if (!storage || !workspaceId) return;

  let plans: Record<string, string> = {};
  try {
    plans = JSON.parse(storage.getItem(PLAN_STORAGE_KEY) || "{}");
  } catch {
    plans = {};
  }
  plans[workspaceId] = plan;
  storage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  window.dispatchEvent(new CustomEvent("teamscience-plan-changed", { detail: { workspaceId, plan } }));
}

export function planDefinition(plan: TeamSciencePlan): PlanDefinition {
  return TEAMSCIENCE_PLANS[plan];
}

export function hasEntitlement(
  plan: TeamSciencePlan,
  entitlement: TeamScienceEntitlement,
): boolean {
  return TEAMSCIENCE_PLANS[plan].entitlements.includes(entitlement);
}

export function requiredPlan(entitlement: TeamScienceEntitlement): TeamSciencePlan {
  if (TEAMSCIENCE_PLANS.free.entitlements.includes(entitlement)) return "free";
  if (TEAMSCIENCE_PLANS.pro.entitlements.includes(entitlement)) return "pro";
  return "organisation";
}

export function planLabel(plan: TeamSciencePlan): string {
  return TEAMSCIENCE_PLANS[plan].name;
}

export function withinLimit(
  plan: TeamSciencePlan,
  limit: keyof PlanLimits,
  currentCount: number,
): boolean {
  const maximum = TEAMSCIENCE_PLANS[plan].limits[limit];
  return maximum === null || currentCount < maximum;
}

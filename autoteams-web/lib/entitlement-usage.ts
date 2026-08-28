import type { TeamSciencePlan } from "@/lib/entitlements";
import { planDefinition } from "@/lib/entitlements";

export type EntitlementUsageKey = "recommendations";

type UsageRecord = {
  recommendations: number;
};

const USAGE_KEY = "teamscience-ai-v71571-entitlement-usage";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function loadAll(): Record<string, UsageRecord> {
  const target = storage();
  if (!target) return {};

  try {
    return JSON.parse(target.getItem(USAGE_KEY) || "{}") as Record<string, UsageRecord>;
  } catch {
    return {};
  }
}

function saveAll(value: Record<string, UsageRecord>): void {
  const target = storage();
  if (!target) return;
  target.setItem(USAGE_KEY, JSON.stringify(value));
}

export function getEntitlementUsage(
  workspaceId: string,
  key: EntitlementUsageKey,
): number {
  if (!workspaceId) return 0;
  const record = loadAll()[workspaceId];
  return Math.max(0, Number(record?.[key] || 0));
}

export function incrementEntitlementUsage(
  workspaceId: string,
  key: EntitlementUsageKey,
): number {
  if (!workspaceId) return 0;

  const all = loadAll();
  const current = all[workspaceId] || { recommendations: 0 };
  const next = Math.max(0, Number(current[key] || 0)) + 1;
  all[workspaceId] = { ...current, [key]: next };
  saveAll(all);
  return next;
}

export function recommendationAllowance(
  workspaceId: string,
  plan: TeamSciencePlan,
): { used: number; limit: number | null; allowed: boolean } {
  const used = getEntitlementUsage(workspaceId, "recommendations");
  const limit = planDefinition(plan).limits.recommendations;
  return {
    used,
    limit,
    allowed: limit === null || used < limit,
  };
}

export function countSavedTeamsForWorkspace(
  workspaceId: string,
  storageKey = "autoteams-v20-saved-teams",
): number {
  if (!workspaceId || typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(storageKey);
    const teams = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(teams)) return 0;
    return teams.filter(
      (team) => team && typeof team === "object" && team.workspaceId === workspaceId,
    ).length;
  } catch {
    return 0;
  }
}

export function resetEntitlementUsage(
  workspaceId: string,
  key: EntitlementUsageKey,
): void {
  if (!workspaceId) return;

  const all = loadAll();
  const current = all[workspaceId] || { recommendations: 0 };
  all[workspaceId] = { ...current, [key]: 0 };
  saveAll(all);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("teamscience-usage-changed", {
        detail: { workspaceId, key, value: 0 },
      }),
    );
  }
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TeamSciencePlan,
  getWorkspacePlan,
  planDefinition,
  planLabel,
} from "@/lib/entitlements";
import {
  countSavedTeamsForWorkspace,
  getEntitlementUsage,
} from "@/lib/entitlement-usage";
import {
  loadActiveWorkspaceId,
  loadWorkspaces,
} from "@/lib/workspaces";

type UsageItem = {
  label: string;
  used: number;
  limit: number | null;
  locked?: boolean;
  lockedLabel?: string;
};

export function PlanUsageDashboard() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [plan, setPlan] = useState<TeamSciencePlan>("free");
  const [savedTeams, setSavedTeams] = useState(0);
  const [recommendations, setRecommendations] = useState(0);
  const [workspaceCount, setWorkspaceCount] = useState(0);

  useEffect(() => {
    function refresh() {
      const activeId = loadActiveWorkspaceId();
      setWorkspaceId(activeId);
      setPlan(getWorkspacePlan(activeId));
      setSavedTeams(countSavedTeamsForWorkspace(activeId));
      setRecommendations(getEntitlementUsage(activeId, "recommendations"));
      setWorkspaceCount(loadWorkspaces().length);
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("teamscience-plan-changed", refresh);
    window.addEventListener("teamscience-usage-changed", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("teamscience-plan-changed", refresh);
      window.removeEventListener("teamscience-usage-changed", refresh);
    };
  }, []);

  const definition = planDefinition(plan);

  const items = useMemo<UsageItem[]>(
    () => [
      {
        label: "Saved teams",
        used: savedTeams,
        limit: definition.limits.savedTeams,
      },
      {
        label: "Atlas recommendations",
        used: recommendations,
        limit: definition.limits.recommendations,
      },
      {
        label: "Workspaces",
        used: workspaceCount,
        limit: definition.limits.workspaces,
      },
      {
        label: "Compare Teams",
        used: 0,
        limit: null,
        locked: plan === "free",
        lockedLabel: "Pro",
      },
      {
        label: "What-if analysis",
        used: 0,
        limit: null,
        locked: plan === "free",
        lockedLabel: "Pro",
      },
    ],
    [definition.limits.recommendations, definition.limits.savedTeams, definition.limits.workspaces, plan, recommendations, savedTeams, workspaceCount],
  );

  return (
    <section className="teamscience-plan-usage-v71572">
      <div className="teamscience-plan-usage-head-v71572">
        <div>
          <span>PLAN &amp; USAGE</span>
          <h2>Your {planLabel(plan)} plan</h2>
          <p>
            Track what you have used before you reach an allowance.
          </p>
        </div>
        <div className="teamscience-plan-usage-actions-v71572">
          <span className={`teamscience-plan-usage-badge-v71572 plan-${plan}`}>
            {planLabel(plan)}
          </span>
          <Link href="/pricing">View plans</Link>
        </div>
      </div>

      <div className="teamscience-plan-usage-grid-v71572">
        {items.map((item) => (
          <UsageCard key={item.label} item={item} />
        ))}
      </div>

      {!workspaceId && (
        <p className="teamscience-plan-usage-note-v71572">
          Select a workspace to see workspace-specific usage.
        </p>
      )}
    </section>
  );
}

function UsageCard({ item }: { item: UsageItem }) {
  if (item.locked) {
    return (
      <article className="teamscience-plan-usage-card-v71572 locked">
        <div>
          <strong>{item.label}</strong>
          <span>{item.lockedLabel} capability</span>
        </div>
        <div className="teamscience-plan-usage-lock-v71572">LOCKED</div>
      </article>
    );
  }

  if (item.limit === null) {
    return (
      <article className="teamscience-plan-usage-card-v71572">
        <div>
          <strong>{item.label}</strong>
          <span>Unlimited</span>
        </div>
        <div className="teamscience-plan-usage-unlimited-v71572">Unlimited</div>
      </article>
    );
  }

  const used = Math.min(item.used, item.limit);
  const percentage = item.limit > 0 ? Math.min(100, Math.round((used / item.limit) * 100)) : 0;
  const remaining = Math.max(0, item.limit - used);

  return (
    <article className={`teamscience-plan-usage-card-v71572 ${remaining === 0 ? "exhausted" : remaining === 1 ? "warning" : ""}`}>
      <div>
        <strong>{item.label}</strong>
        <span>{used} of {item.limit} used</span>
      </div>

      <div className="teamscience-plan-usage-meter-v71572" aria-hidden="true">
        <i style={{ width: `${percentage}%` }} />
      </div>

      <small>
        {remaining === 0
          ? "Allowance used - upgrade for more"
          : remaining === 1
            ? "1 remaining"
            : `${remaining} remaining`}
      </small>
    </article>
  );
}

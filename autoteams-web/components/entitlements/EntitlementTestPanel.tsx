"use client";

import { useEffect, useState } from "react";
import {
  TeamSciencePlan,
  getWorkspacePlan,
  planDefinition,
  planLabel,
  setWorkspacePlan,
} from "@/lib/entitlements";
import {
  countSavedTeamsForWorkspace,
  getEntitlementUsage,
  resetEntitlementUsage,
} from "@/lib/entitlement-usage";
import {
  loadActiveWorkspaceId,
  loadWorkspaces,
} from "@/lib/workspaces";

export function EntitlementTestPanel() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [plan, setPlan] = useState<TeamSciencePlan>("free");
  const [recommendations, setRecommendations] = useState(0);
  const [savedTeams, setSavedTeams] = useState(0);
  const [workspaceCount, setWorkspaceCount] = useState(0);
  const [message, setMessage] = useState("");

  function refresh() {
    const activeId = loadActiveWorkspaceId();
    setWorkspaceId(activeId);
    setPlan(getWorkspacePlan(activeId));
    setRecommendations(getEntitlementUsage(activeId, "recommendations"));
    setSavedTeams(countSavedTeamsForWorkspace(activeId));
    setWorkspaceCount(loadWorkspaces().length);
  }

  useEffect(() => {
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

  function choosePlan(next: TeamSciencePlan) {
    if (!workspaceId) {
      setMessage("Select or create a workspace before changing the test plan.");
      return;
    }

    setWorkspacePlan(workspaceId, next);
    setPlan(next);
    setMessage(`${planLabel(next)} plan is now active for this workspace.`);
  }

  function resetRecommendations() {
    if (!workspaceId) {
      setMessage("Select or create a workspace first.");
      return;
    }

    resetEntitlementUsage(workspaceId, "recommendations");
    setRecommendations(0);
    setMessage("Recommendation credit usage reset to 0 for this workspace.");
  }

  const definition = planDefinition(plan);

  return (
    <section className="teamscience-entitlement-test-v71574">
      <div className="teamscience-entitlement-test-head-v71574">
        <div>
          <span>DEVELOPMENT ONLY</span>
          <h2>Entitlement Testing</h2>
          <p>
            Switch the active workspace between plans and reset recommendation
            usage so Free, Pro and Organisation behaviour can be tested repeatedly.
          </p>
        </div>
        <strong>{planLabel(plan)}</strong>
      </div>

      <div className="teamscience-entitlement-test-workspace-v71574">
        <span>Active workspace</span>
        <strong>{workspaceId || "No workspace selected"}</strong>
      </div>

      <div className="teamscience-entitlement-plan-buttons-v71574">
        {(["free", "pro", "organisation"] as TeamSciencePlan[]).map((item) => (
          <button
            key={item}
            type="button"
            className={plan === item ? "active" : ""}
            onClick={() => choosePlan(item)}
          >
            {planLabel(item)}
          </button>
        ))}
      </div>

      <div className="teamscience-entitlement-test-grid-v71574">
        <Usage
          label="Saved team credits"
          used={savedTeams}
          limit={definition.limits.savedTeams}
        />
        <Usage
          label="Recommendation credits"
          used={recommendations}
          limit={definition.limits.recommendations}
        />
        <Usage
          label="Workspaces"
          used={workspaceCount}
          limit={definition.limits.workspaces}
        />
      </div>

      <div className="teamscience-entitlement-test-actions-v71574">
        <button type="button" onClick={resetRecommendations}>
          Reset recommendation credits
        </button>
        <span>
          Saved-team usage comes from actual saved teams, so this control does not
          delete teams.
        </span>
      </div>

      {message && (
        <div className="teamscience-entitlement-test-message-v71574">
          {message}
        </div>
      )}
    </section>
  );
}

function Usage({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const display = limit === null ? "Unlimited" : `${used} / ${limit}`;
  const remaining = limit === null ? null : Math.max(0, limit - used);

  return (
    <article>
      <span>{label}</span>
      <strong>{display}</strong>
      <small>
        {remaining === null
          ? "No credit limit"
          : remaining === 0
            ? "Limit reached"
            : `${remaining} remaining`}
      </small>
    </article>
  );
}

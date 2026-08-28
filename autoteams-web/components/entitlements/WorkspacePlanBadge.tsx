"use client";

import { useEffect, useState } from "react";
import {
  TeamSciencePlan,
  getWorkspacePlan,
  planLabel,
} from "@/lib/entitlements";

export function WorkspacePlanBadge({ workspaceId }: { workspaceId?: string | null }) {
  const [plan, setPlan] = useState<TeamSciencePlan>("free");

  useEffect(() => {
    const refresh = () => setPlan(getWorkspacePlan(workspaceId));
    refresh();
    window.addEventListener("teamscience-plan-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("teamscience-plan-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [workspaceId]);

  return (
    <span className={`teamscience-plan-badge-v7157 plan-${plan}`}>
      {planLabel(plan)}
    </span>
  );
}

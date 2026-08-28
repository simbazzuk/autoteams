"use client";

import { useEffect, useState } from "react";
import {
  TeamSciencePlan,
  getWorkspacePlan,
  setWorkspacePlan,
} from "@/lib/entitlements";

export function PlanDevSwitcher({ workspaceId }: { workspaceId?: string | null }) {
  const [plan, setPlan] = useState<TeamSciencePlan>("free");

  useEffect(() => {
    setPlan(getWorkspacePlan(workspaceId));
  }, [workspaceId]);

  if (process.env.NODE_ENV === "production" || !workspaceId) return null;

  function change(next: TeamSciencePlan) {
    setWorkspacePlan(workspaceId!, next);
    setPlan(next);
  }

  return (
    <aside className="teamscience-plan-dev-v7157">
      <strong>Entitlement test</strong>
      <span>Active workspace plan</span>
      <div>
        {(["free", "pro", "organisation"] as TeamSciencePlan[]).map((item) => (
          <button
            type="button"
            key={item}
            className={plan === item ? "active" : ""}
            onClick={() => change(item)}
          >
            {item === "organisation" ? "Organisation" : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </aside>
  );
}

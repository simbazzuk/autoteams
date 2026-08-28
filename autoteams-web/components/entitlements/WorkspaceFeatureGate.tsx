"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loadActiveWorkspaceId } from "@/lib/workspaces";
import {
  TeamScienceEntitlement,
  TeamSciencePlan,
  getWorkspacePlan,
} from "@/lib/entitlements";
import { EntitlementGate } from "@/components/entitlements/EntitlementGate";

type Props = {
  entitlement: TeamScienceEntitlement;
  title: string;
  children: ReactNode;
};

export function WorkspaceFeatureGate({ entitlement, title, children }: Props) {
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState<TeamSciencePlan>("free");

  useEffect(() => {
    const refresh = () => {
      const workspaceId = loadActiveWorkspaceId();
      setPlan(getWorkspacePlan(workspaceId));
      setReady(true);
    };

    refresh();
    window.addEventListener("teamscience-plan-changed", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("teamscience-plan-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!ready) {
    return (
      <section className="teamscience-entitlement-loading-v71571">
        Checking workspace plan...
      </section>
    );
  }

  return (
    <EntitlementGate plan={plan} entitlement={entitlement} title={title}>
      {children}
    </EntitlementGate>
  );
}

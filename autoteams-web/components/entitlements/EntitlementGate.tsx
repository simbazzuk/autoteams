"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  TeamScienceEntitlement,
  TeamSciencePlan,
  hasEntitlement,
  planLabel,
  requiredPlan,
} from "@/lib/entitlements";

type Props = {
  plan: TeamSciencePlan;
  entitlement: TeamScienceEntitlement;
  title: string;
  children: ReactNode;
};

export function EntitlementGate({ plan, entitlement, title, children }: Props) {
  if (hasEntitlement(plan, entitlement)) return <>{children}</>;

  const required = requiredPlan(entitlement);

  return (
    <section className="teamscience-entitlement-gate-v7157">
      <span className="teamscience-entitlement-lock-v7157" aria-hidden="true">PRO</span>
      <div>
        <strong>{title} is a {planLabel(required)} capability</strong>
        <p>
          Your workspace is currently on the {planLabel(plan)} plan.
          Upgrade to unlock this AutoTeams capability.
        </p>
      </div>
      <Link href="/pricing">View plans</Link>
    </section>
  );
}

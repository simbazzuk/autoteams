"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CONTEXT_LABELS: Record<string, string> = {
  business: "Work",
  work: "Work",
  sports: "Sport",
  sport: "Sport",
  friendship: "Friendship",
  community: "Community",
  education: "Education",
};

export function InviteOnboardingExperience() {
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite") ?? "";
  const context = searchParams.get("context") ?? "";

  useEffect(() => {
    if (!invite) return;

    document.documentElement.dataset.autoteamsInviteOnboarding = "true";

    return () => {
      delete document.documentElement.dataset.autoteamsInviteOnboarding;
    };
  }, [invite]);

  if (!invite) return null;

  const label = CONTEXT_LABELS[context.toLowerCase()] ?? "AutoTeams";

  return (
    <section className="invite-onboarding-banner" aria-label="AutoTeams invitation">
      <div className="invite-onboarding-badge">YOU'RE INVITED</div>
      <div className="invite-onboarding-copy">
        <span className="invite-onboarding-icon">✦</span>
        <div>
          <h1>Join AutoTeams</h1>
          <p>
            Complete your details to join the <strong>{label}</strong> profile
            context. Your profile belongs to you and helps Atlas understand how
            you prefer to work with others.
          </p>
        </div>
      </div>
      <div className="invite-onboarding-steps">
        <span className="active">1 Confirm details</span>
        <span>2 Create profile</span>
        <span>3 Join context</span>
      </div>
    </section>
  );
}

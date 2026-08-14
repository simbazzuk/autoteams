"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./AtlasAssistant.module.css";

type AssistantContext = "home" | "atlas";

type AssistantPrompt = {
  title: string;
  response: string;
  href: string;
  action: string;
};

export function AtlasAssistant({
  context,
  profiles,
  completedProfiles,
  staleProfiles,
  pendingInvitations,
  recommendations,
  teams,
}: {
  context: AssistantContext;
  profiles: number;
  completedProfiles: number;
  staleProfiles: number;
  pendingInvitations: number;
  recommendations: number;
  teams: number;
}) {
  const prompts = useMemo(
    () =>
      buildPrompts({
        profiles,
        completedProfiles,
        staleProfiles,
        pendingInvitations,
        recommendations,
        teams,
      }),
    [
      profiles,
      completedProfiles,
      staleProfiles,
      pendingInvitations,
      recommendations,
      teams,
    ],
  );

  const [selected, setSelected] = useState(0);
  const active = prompts[selected] || prompts[0];

  return (
    <section className={styles.assistant}>
      <header>
        <span className={styles.orb}>✦</span>
        <div>
          <small>Atlas Assistant</small>
          <strong>
            {context === "home"
              ? "How can I help today?"
              : "What should we do next?"}
          </strong>
        </div>
      </header>

      <div className={styles.message}>
        <p>{active.response}</p>
        <Link className="button" href={active.href}>
          {active.action}
        </Link>
      </div>

      <div className={styles.prompts}>
        {prompts.map((prompt, index) => (
          <button
            className={index === selected ? styles.active : ""}
            key={prompt.title}
            onClick={() => setSelected(index)}
            type="button"
          >
            {prompt.title}
          </button>
        ))}
      </div>

      <footer>
        <span>Atlas recommendations remain subject to human review.</span>
        <Link href="/learning-centre">Learn more →</Link>
      </footer>
    </section>
  );
}

function buildPrompts({
  profiles,
  completedProfiles,
  staleProfiles,
  pendingInvitations,
  recommendations,
  teams,
}: {
  profiles: number;
  completedProfiles: number;
  staleProfiles: number;
  pendingInvitations: number;
  recommendations: number;
  teams: number;
}): AssistantPrompt[] {
  const prompts: AssistantPrompt[] = [];
  /*
   * AutoTeams v7.15.2 first-run guidance
   *
   * New users receive a simple task-led introduction before the more
   * contextual Atlas prompts. Existing users keep the normal experience.
   */
  if (
    profiles === 0 &&
    teams === 0 &&
    recommendations === 0
  ) {
    prompts.push({
      title: "Getting started",
      response:
        "Welcome to AutoTeams. I can help you create a profile, invite people or build your first team. What would you like to do?",
      href: "/profile",
      action: "Create My Profile",
    });
  }

  if (!profiles) {
    prompts.push({
      title: "Create my first profile",
      response:
        "Start by creating a contextual profile. Choose Business, Friendship, Community, Sports or Education.",
      href: "/profile",
      action: "Create Profile",
    });
  } else if (completedProfiles < profiles) {
    prompts.push({
      title: "Continue my interview",
      response:
        `${profiles - completedProfiles} contextual profile${profiles - completedProfiles === 1 ? " is" : "s are"} still waiting for a completed Atlas interview.`,
      href: "/atlas",
      action: "Continue Interview",
    });
  } else {
    prompts.push({
      title: "Build a team",
      response:
        "Your individual Atlas Profile is ready. Describe the team requirement and let Atlas explain the recommendation.",
      href: "/team-builder",
      action: "Build Team",
    });
  }

  if (staleProfiles > 0) {
    prompts.push({
      title: "Refresh my profile",
      response:
        `${staleProfiles} Atlas Profile${staleProfiles === 1 ? " may" : "s may"} no longer reflect current circumstances.`,
      href: "/my-atlas-profile",
      action: "Review Profiles",
    });
  } else {
    prompts.push({
      title: "Explain my Atlas Profile",
      response:
        "Your Atlas Profile describes individual collaboration preferences, strengths, confidence and freshness.",
      href: "/my-atlas-profile",
      action: "Open My Atlas Profile",
    });
  }

  if (recommendations > 0) {
    prompts.push({
      title: "Review recommendations",
      response:
        `${recommendations} Atlas recommendation${recommendations === 1 ? " is" : "s are"} available. Review why each person was selected before making a decision.`,
      href: "/matches",
      action: "Review Recommendations",
    });
  } else {
    prompts.push({
      title: "Create recommendations",
      response:
        "No recommendation is currently available. Start with Team Builder and select the correct workspace and Talent Pool.",
      href: "/team-builder",
      action: "Open Team Builder",
    });
  }

  if (teams > 0) {
    prompts.push({
      title: "Explain Team DNA",
      response:
        `${teams} team${teams === 1 ? " is" : "s are"} available for collective Team DNA analysis.`,
      href: "/team-dna",
      action: "View Team DNA",
    });
  }

  if (pendingInvitations > 0) {
    prompts.push({
      title: "Review invitations",
      response:
        `${pendingInvitations} workspace invitation${pendingInvitations === 1 ? " is" : "s are"} still pending.`,
      href: "/profile/membership",
      action: "Review Membership",
    });
  }

  return prompts.slice(0, 5);
}

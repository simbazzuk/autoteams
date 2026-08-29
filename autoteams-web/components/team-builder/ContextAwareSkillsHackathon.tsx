"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  outcome: string;
  teamName: string;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
};

type TeamContext =
  | "business"
  | "sports"
  | "friendship"
  | "community"
  | "education"
  | "hackathon";

const contexts: Array<{
  id: TeamContext;
  label: string;
  displayLabel?: string;
  icon: string;
  reason: string;
  skills: string[];
}> = [
  {
    id: "business",
    label: "Business",
    icon: "▥",
    reason: "Teams formed to deliver outcomes, solve problems and coordinate work.",
    skills: ["Leadership", "Communication", "Planning", "Delivery", "Problem solving", "Collaboration", "Organisation", "Adaptability"],
  },
  {
    id: "sports",
    label: "Sports",
    icon: "◎",
    reason: "Teams formed around complementary roles, performance, coordination and resilience.",
    skills: ["Communication", "Teamwork", "Discipline", "Leadership", "Resilience", "Decision making", "Adaptability", "Reliability"],
  },
  {
    id: "friendship",
    label: "Friendship",
    icon: "♡",
    reason: "Groups formed around compatible interests, social preferences and mutual support.",
    skills: ["Communication", "Empathy", "Listening", "Reliability", "Adaptability", "Social awareness", "Support", "Inclusivity"],
  },
  {
    id: "community",
    label: "Community",
    icon: "◉",
    reason: "Teams formed to organise, support communities and deliver shared local outcomes.",
    skills: ["Communication", "Collaboration", "Organisation", "Empathy", "Initiative", "Reliability", "Community engagement", "Facilitation"],
  },
  {
    id: "education",
    label: "Education",
    icon: "◇",
    reason: "Teams formed to learn, research, create and share knowledge effectively.",
    skills: ["Research", "Analysis", "Communication", "Collaboration", "Writing", "Presentation", "Critical thinking", "Organisation"],
  },
  {
    id: "hackathon",
    label: "Hackathon",
    displayLabel: "Hackathon & Innovation",
    icon: "⚡",
    reason: "Teams assembled for rapid innovation, prototyping and time-boxed challenges.",
    skills: ["Software Engineering", "AI / Data", "Product thinking", "UX / Design", "Rapid prototyping", "Creativity", "Commercial thinking", "Presentation", "Collaboration"],
  },
];

function inferContext(teamName: string, outcome: string, routeContext: string | null): TeamContext {
  const explicit = (routeContext || "").toLowerCase();
  if (contexts.some((item) => item.id === explicit)) return explicit as TeamContext;

  const text = `${teamName} ${outcome}`.toLowerCase();

  if (/\b(hackathon|hack day|innovation challenge|ideathon|prototype|rapid prototype|pitch|48 hours|48-hour|48 hour)\b/.test(text)) {
    return "hackathon";
  }
  if (/\b(sport|sports|football|soccer|rugby|cricket|basketball|hockey|squad|match|tournament|club)\b/.test(text)) {
    return "sports";
  }
  if (/\b(friend|friendship|social|social circle|companionship|meet people)\b/.test(text)) {
    return "friendship";
  }
  if (/\b(community|volunteer|volunteering|charity|fundraising|neighbourhood|nonprofit|non-profit)\b/.test(text)) {
    return "community";
  }
  if (/\b(education|study|student|learning|school|university|college|revision|course|class)\b/.test(text)) {
    return "education";
  }

  return "business";
}

export function ContextAwareSkillsHackathon({
  outcome,
  teamName,
  selectedSkills,
  onToggleSkill,
}: Props) {
  const searchParams = useSearchParams();

  const inferredContext = useMemo(
    () => inferContext(teamName, outcome, searchParams.get("context")),
    [teamName, outcome, searchParams],
  );

  const [manualContext, setManualContext] = useState<TeamContext | null>(null);
  const activeContext = manualContext ?? inferredContext;
  const active = contexts.find((item) => item.id === activeContext) ?? contexts[0];

  const selectedCount = active.skills.filter((skill) => selectedSkills.includes(skill)).length;
  const percentage = Math.round((selectedCount / Math.max(active.skills.length, 1)) * 100);

  return (
    <section
      className="hackathon-context-v7157132"
      data-autoteams-hackathon-context-v7157132="true"
      data-autoteams-active-context={activeContext}
    >
      <div className="hackathon-context-v7157132__head">
        <div>
          <small>TEAM SCIENCE ENGINE</small>
          <h3>Design the strengths this team needs.</h3>
          <p>
            AutoTeams uses the team name and desired outcome to infer a starting
            context. Review the suggested strengths before Atlas generates a recommendation.
          </p>
        </div>

        <div className="hackathon-context-v7157132__inferred">
          <span>{active.icon}</span>
          <div>
            <small>{manualContext ? "Selected context" : "Inferred context"}</small>
            <strong>{active.displayLabel ?? active.label}</strong>
          </div>
        </div>
      </div>

      <div className="hackathon-context-v7157132__tabs" aria-label="Team Science contexts">
        {contexts.map((context) => (
          <button
            className={context.id === activeContext ? "active" : ""}
            key={context.id}
            onClick={() => setManualContext(context.id)}
            type="button"
            data-autoteams-context-button={context.id}
          >
            <span aria-hidden="true">{context.icon}</span>
            {context.label}
          </button>
        ))}
      </div>

      <div className="hackathon-context-v7157132__reason">
        <strong>Why this context?</strong>
        <span>{active.reason}</span>
      </div>

      <div className="hackathon-context-v7157132__coverage">
        <div>
          <small>REQUIREMENT COVERAGE</small>
          <strong>{selectedCount}/{active.skills.length} suggested strengths</strong>
        </div>
        <b>{percentage}%</b>
        <div className="hackathon-context-v7157132__bar">
          <i style={{ width: `${percentage}%` }} />
        </div>
        <p>
          {activeContext === "hackathon"
            ? "Hackathon teams benefit from a deliberate mix of build, product, design and pitch capability."
            : "Choose the strengths that matter for this specific team."}
        </p>
      </div>

      <div className="hackathon-context-v7157132__skills">
        <div className="hackathon-context-v7157132__skills-title">
          <strong>Suggested strengths</strong>
          <span>{active.displayLabel ?? active.label}</span>
        </div>

        <div className="hackathon-context-v7157132__chips">
          {active.skills.map((skill) => {
            const selected = selectedSkills.includes(skill);
            return (
              <button
                className={selected ? "selected" : ""}
                key={skill}
                onClick={() => onToggleSkill(skill)}
                type="button"
              >
                <span>{selected ? "✓" : "+"}</span>
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hackathon-context-v7157132__core">
        <span>✦</span>
        <p>
          <strong>Universal Team Science core:</strong> Communication,
          Collaboration and Adaptability remain useful across every context.
        </p>
      </div>
    </section>
  );
}

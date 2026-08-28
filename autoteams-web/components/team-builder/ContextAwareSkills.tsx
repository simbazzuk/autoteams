"use client";

import {
  useMemo,
  useState,
} from "react";
import styles from "./TeamScienceEngine.module.css";

export type TeamContext =
  | "work"
  | "sports"
  | "friendships"
  | "community"
  | "education";

type ContextAwareSkillsProps = {
  outcome: string;
  teamName?: string;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
};

type ContextDefinition = {
  label: string;
  icon: string;
  description: string;
  skills: string[];
  watchouts: string[];
};

const CORE_SKILLS = [
  "Communication",
  "Collaboration",
  "Adaptability",
];

const CONTEXTS: Record<
  TeamContext,
  ContextDefinition
> = {
  work: {
    label: "Business",
    icon: "◫",
    description:
      "Teams formed to deliver outcomes, solve problems and coordinate work.",
    skills: [
      "Leadership",
      "Planning",
      "Delivery",
      "Problem solving",
      "Organisation",
      "Stakeholder management",
    ],
    watchouts: [
      "Leadership concentrated in one person",
      "Strong delivery with weak stakeholder communication",
      "Too much similarity in working style",
    ],
  },
  sports: {
    label: "Sports",
    icon: "◉",
    description:
      "Teams that need coordination, resilience and role clarity under pressure.",
    skills: [
      "Teamwork",
      "Resilience",
      "Decision making",
      "Discipline",
      "Coachability",
      "Leadership",
    ],
    watchouts: [
      "Too many similar playing or leadership styles",
      "Low resilience under pressure",
      "Weak communication between roles",
    ],
  },
  friendships: {
    label: "Friendship",
    icon: "♡",
    description:
      "Groups built around compatibility, reliability, openness and shared interests.",
    skills: [
      "Empathy",
      "Shared interests",
      "Reliability",
      "Sociability",
      "Openness",
      "Listening",
    ],
    watchouts: [
      "Low reliability",
      "Very different expectations of the group",
      "Poor listening or low openness",
    ],
  },
  community: {
    label: "Community",
    icon: "◎",
    description:
      "Groups that bring people together around shared community outcomes.",
    skills: [
      "Empathy",
      "Organisation",
      "Initiative",
      "Reliability",
      "Community engagement",
      "Facilitation",
    ],
    watchouts: [
      "Strong ideas but weak organisation",
      "Low facilitation coverage",
      "Over-reliance on one organiser",
    ],
  },
  education: {
    label: "Education",
    icon: "◇",
    description:
      "Learning teams that benefit from curiosity, mentoring and knowledge sharing.",
    skills: [
      "Knowledge sharing",
      "Mentoring",
      "Curiosity",
      "Organisation",
      "Critical thinking",
      "Collaboration",
    ],
    watchouts: [
      "Knowledge concentrated in one person",
      "Low confidence challenging ideas",
      "Weak mentoring or knowledge sharing",
    ],
  },
};
const CONTEXT_ORDER: TeamContext[] = [
  "work",
  "sports",
  "friendships",
  "community",
  "education",

];

function inferContext(
  text: string,
): TeamContext {
  const value =
    text.toLowerCase();

  if (
    /(sport|football|rugby|cricket|squad|coach|match|player|club|training)/.test(
      value,
    )
  ) {
    return "sports";
  }

  if (
    /(friend|social|activity partner|meet people|social circle|friendship)/.test(
      value,
    )
  ) {
    return "friendships";
  }

  if (
    /(volunteer|charity|fundrais|nonprofit|non-profit|service project)/.test(
      value,
    )
  ) {
    return "community";
  }

  if (
    /(student|study|education|learning|mentor|school|university|college|course)/.test(
      value,
    )
  ) {
    return "education";
  }

  if (
    /(community|local group|neighbour|neighborhood|faith group|community project)/.test(
      value,
    )
  ) {
    return "community";
  }

  return "work";
}

function unique(
  values: string[],
) {
  return Array.from(
    new Set(values),
  );
}

export function ContextAwareSkills({
  outcome,
  teamName = "",
  selectedSkills,
  onToggleSkill,
}: ContextAwareSkillsProps) {
  const inferred =
    useMemo(
      () =>
        inferContext(
          `${teamName} ${outcome}`,
        ),
      [
        teamName,
        outcome,
      ],
    );

  const [
    contextOverride,
    setContextOverride,
  ] = useState<
    TeamContext | null
  >(null);

  const context =
    contextOverride ||
    inferred;

  const definition =
    CONTEXTS[context];

  const suggestedSkills =
    useMemo(
      () =>
        unique([
          ...CORE_SKILLS,
          ...definition.skills,
        ]),
      [definition],
    );

  const selectedSuggested =
    suggestedSkills.filter(
      (skill) =>
        selectedSkills.includes(
          skill,
        ),
    );

  const coverage =
    suggestedSkills.length
      ? Math.round(
          (selectedSuggested.length /
            suggestedSkills.length) *
            100,
        )
      : 0;

  const missingCore =
    CORE_SKILLS.filter(
      (skill) =>
        !selectedSkills.includes(
          skill,
        ),
    );

  const reasoning = useMemo(
    () => {
      if (
        !teamName.trim() &&
        !outcome.trim()
      ) {
        return "Add a team name or desired outcome so AutoTeams can infer a more meaningful Team Science context.";
      }

      if (
        coverage >= 80
      ) {
        return "Your selected strengths provide broad coverage for this context. Atlas can now evaluate whether the people you choose provide complementary coverage across them.";
      }

      if (
        coverage >= 45
      ) {
        return "You have selected some relevant strengths. Review the remaining suggestions and keep only those that genuinely matter for this team's purpose.";
      }

      return "The current requirement has limited Team Science coverage. Consider the suggested strengths before generating a recommendation.";
    },
    [
      coverage,
      outcome,
      teamName,
    ],
  );

  function addAll() {
    suggestedSkills.forEach(
      (skill) => {
        if (
          !selectedSkills.includes(
            skill,
          )
        ) {
          onToggleSkill(
            skill,
          );
        }
      },
    );
  }

  return (
    <section
      className={
        styles.engine
      }
      data-autoteams-team-science-engine="v7.5"
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            TEAM SCIENCE ENGINE
          </span>

          <h3>
            Design the strengths this
            team needs.
          </h3>

          <p>
            AutoTeams uses the team
            name and desired outcome
            to infer a starting
            context. Review the
            suggested strengths before
            Atlas generates a
            recommendation.
          </p>
        </div>

        <div
          className={
            styles.contextBadge
          }
        >
          <span>
            {
              definition.icon
            }
          </span>

          <div>
            <small>
              {contextOverride
                ? "Selected context"
                : "Inferred context"}
            </small>
            <strong>
              {
                definition.label
              }
            </strong>
          </div>
        </div>
      </header>

      <div
        className={
          styles.contextSelector
        }
      >
        {CONTEXT_ORDER.map(
          (item) => {
            const itemDefinition =
              CONTEXTS[
                item
              ];

            const active =
              item ===
              context;

            return (
              <button
                type="button"
                key={item}
                className={
                  active
                    ? styles.contextActive
                    : ""
                }
                onClick={() =>
                  setContextOverride(
                    item ===
                      inferred
                      ? null
                      : item,
                  )
                }
              >
                <span>
                  {
                    itemDefinition.icon
                  }
                </span>
                {
                  itemDefinition.label
                }
              </button>
            );
          },
        )}
      </div>

      <div
        className={
          styles.explanation
        }
      >
        <strong>
          Why this context?
        </strong>
        <p>
          {
            definition.description
          }
        </p>

        {contextOverride && (
          <button
            type="button"
            onClick={() =>
              setContextOverride(
                null,
              )
            }
          >
            Use inferred context:{" "}
            {
              CONTEXTS[
                inferred
              ].label
            }
          </button>
        )}
      </div>

      <div
        className={
          styles.coverage
        }
      >
        <div
          className={
            styles.coverageHeader
          }
        >
          <div>
            <span>
              Requirement coverage
            </span>
            <strong>
              {
                selectedSuggested.length
              }
              /
              {
                suggestedSkills.length
              }{" "}
              suggested strengths
            </strong>
          </div>

          <b>
            {coverage}%
          </b>
        </div>

        <div
          className={
            styles.coverageBar
          }
        >
          <i
            style={{
              width: `${coverage}%`,
            }}
          />
        </div>

        <p>
          {reasoning}
        </p>
      </div>

      <div
        className={
          styles.sectionHeading
        }
      >
        <div>
          <span>
            Suggested strengths
          </span>
          <small>
            Click to add or remove
          </small>
        </div>

        <button
          type="button"
          onClick={
            addAll
          }
        >
          Add all suggested
        </button>
      </div>

      <div
        className={
          styles.skills
        }
      >
                {/* TEAMSCIENCE_AI_V715782_BUILD_TEAM_PLUS_LEGEND */}
        <div
          data-teamscience-skill-legend-v715782="true"
          aria-label="Suggested strength controls"
        >
          <span aria-hidden="true">+</span>
          <strong>Add suggested strength</strong>
          <small>Select a strength to include it in the team requirement.</small>
        </div>
{suggestedSkills.map(
          (skill) => {
            const selected =
              selectedSkills.includes(
                skill,
              );

            const core =
              CORE_SKILLS.includes(
                skill,
              );

            return (
              <button
                key={
                  skill
                }
                type="button"
                className={
                  selected
                    ? styles.skillSelected
                    : ""
                }
                onClick={() =>
                  onToggleSkill(
                    skill,
                  )
                }
              >
                <span
                  data-teamscience-skill-toggle-v715782={selected ? "selected" : "add"}
                  aria-hidden="true"
                >
                  {selected
                    ? "\u2713"
                    : "+"}
                </span>

                {
                  skill
                }

                {core && (
                  <small>
                    CORE
                  </small>
                )}
              </button>
            );
          },
        )}
      </div>

      <div
        className={
          styles.insightGrid
        }
      >
        <article
          className={
            styles.core
          }
        >
          <span>
            UNIVERSAL CORE
          </span>

          <h4>
            Team Science foundations
          </h4>

          <p>
            Communication,
            Collaboration and
            Adaptability are useful
            across almost every team
            context.
          </p>

          {missingCore.length >
          0 ? (
            <small>
              Still to consider:{" "}
              {missingCore.join(
                ", ",
              )}
            </small>
          ) : (
            <small>
              ✓ Universal core covered
            </small>
          )}
        </article>

        <article
          className={
            styles.watchouts
          }
        >
          <span>
            TEAM DESIGN WATCH-OUTS
          </span>

          <h4>
            What Atlas should examine
          </h4>

          <ul>
            {definition.watchouts.map(
              (
                watchout,
              ) => (
                <li
                  key={
                    watchout
                  }
                >
                  <b>
                    !
                  </b>
                  {
                    watchout
                  }
                </li>
              ),
            )}
          </ul>
        </article>
      </div>

      <footer
        className={
          styles.footer
        }
      >
        <span>
          ✦
        </span>

        <p>
          <strong>
            AI recommends. Humans
            decide.
          </strong>{" "}
          These suggestions shape the
          requirement; they do not
          automatically decide who
          belongs in the team.
        </p>
      </footer>
    </section>
  );
}




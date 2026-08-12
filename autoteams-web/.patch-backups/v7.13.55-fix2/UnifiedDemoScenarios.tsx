"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
} from "@/lib/workspaces";

type Scenario = {
  id: "business" | "friendship" | "community" | "sports" | "education";
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  peopleHint: string;
  coverage: string;
  tags: string[];
  buttonTerms: string[];
  workspaceTerms: string[];
};

const scenarios: Scenario[] = [
  {
    id: "business",
    eyebrow: "Work scenario",
    title: "Work & Organisations",
    description:
      "Test cross-functional team formation using employees with different roles, departments, leadership styles and delivery strengths.",
    icon: "WORK",
    peopleHint: "Employees",
    coverage: "Cross-functional",
    tags: [
      "Engineering",
      "Product",
      "Delivery",
      "Leadership",
      "Cloud",
      "Planning",
      "Communication",
    ],
    buttonTerms: [
      "load business",
      "business team",
      "load work",
      "work demo",
      "sample business",
    ],
    workspaceTerms: ["demo-business", "business", "work"],
  },
  {
    id: "friendship",
    eyebrow: "Friendship scenario",
    title: "Friendship & Social",
    description:
      "Explore social-team matching using interests, lifestyle, local preferences and complementary personality strengths.",
    icon: "FRI",
    peopleHint: "People",
    coverage: "Social fit",
    tags: [
      "Local interests",
      "Lifestyle",
      "Social",
      "Compatibility",
      "Activities",
      "Communication",
    ],
    buttonTerms: [
      "load friendship",
      "friendship demo",
      "load friends",
      "social demo",
    ],
    workspaceTerms: ["demo-friendship", "friendship", "friends"],
  },
  {
    id: "community",
    eyebrow: "Community scenario",
    title: "Community & Volunteering",
    description:
      "Build volunteer and community-action teams with organisers, facilitators and people bringing different practical strengths.",
    icon: "COM",
    peopleHint: "Volunteers",
    coverage: "Community mix",
    tags: [
      "Volunteering",
      "Organisation",
      "Facilitation",
      "Empathy",
      "Outreach",
      "Reliability",
    ],
    buttonTerms: [
      "load community",
      "community demo",
      "volunteer demo",
    ],
    workspaceTerms: ["demo-community", "community"],
  },
  {
    id: "sports",
    eyebrow: "Sports scenario",
    title: "Sports & Clubs",
    description:
      "Test club and squad formation using positions, availability, leadership, teamwork and complementary sporting strengths.",
    icon: "SPORT",
    peopleHint: "Players",
    coverage: "Squad balance",
    tags: [
      "Players",
      "Positions",
      "Leadership",
      "Teamwork",
      "Availability",
      "Performance",
    ],
    buttonTerms: [
      "load sports",
      "sports demo",
      "load sport",
      "club demo",
    ],
    workspaceTerms: ["demo-sports", "sports", "sport"],
  },
  {
    id: "education",
    eyebrow: "Education scenario",
    title: "Education & Learning",
    description:
      "Test AutoTeams with students across different subjects, strengths and locations for project, study and interdisciplinary teams.",
    icon: "EDU",
    peopleHint: "Students",
    coverage: "Cross-discipline",
    tags: [
      "Computer Science",
      "Business",
      "Psychology",
      "Engineering",
      "Medicine",
      "Data Science",
      "Law",
    ],
    buttonTerms: [
      "load education",
      "education demo",
      "reload education",
    ],
    workspaceTerms: ["education learning demo", "demo-education", "education"],
  },
];

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function findLegacyButton(scenario: Scenario): HTMLButtonElement | null {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button"),
  );

  return (
    buttons.find((button) => {
      if (button.closest(".demo55-unified")) {
        return false;
      }

      const label = normalise(button.textContent || "");

      return scenario.buttonTerms.some((term) =>
        label.includes(normalise(term)),
      );
    }) || null
  );
}

function hideLegacyLoaders() {
  const terms = [
    "load sample data",
    "load business",
    "load work",
    "load friendship",
    "load friends",
    "load community",
    "load sport",
    "load sports",
    "load education",
    "education demo",
  ];

  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button"),
  );

  buttons.forEach((button) => {
    if (button.closest(".demo55-unified")) {
      return;
    }

    const label = normalise(button.textContent || "");

    if (!terms.some((term) => label.includes(term))) {
      return;
    }

    let node: HTMLElement | null = button;

    for (let depth = 0; depth < 5 && node; depth += 1) {
      const parentNode: HTMLElement | null =
        node.parentElement;

      if (!parentNode) break;

      const parentText = normalise(
        parentNode.textContent || "",
      );

      if (
        parentNode.tagName === "ARTICLE" ||
        parentNode.tagName === "SECTION" ||
        (
          parentNode.tagName === "DIV" &&
          parentText.length < 1800
        )
      ) {
        parentNode.dataset.demo55LegacyLoader =
          "true";
      }

      node = parentNode;
    }
  });
}

export function UnifiedDemoScenarios() {
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<string>("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      hideLegacyLoaders();
      setRevision((value) => value + 1);
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  const workspaces = useMemo(
    () => loadWorkspaces(),
    [revision],
  );

  const people = useMemo(
    () => loadPeople(),
    [revision],
  );

  const activeWorkspaceId = useMemo(
    () => loadActiveWorkspaceId(),
    [revision],
  );

  function statusFor(scenario: Scenario) {
    const workspace = workspaces.find((item) => {
      const haystack = normalise(`${item.id} ${item.name}`);

      return scenario.workspaceTerms.some((term) =>
        haystack.includes(normalise(term)),
      );
    });

    const count = workspace
      ? people.filter(
          (person) =>
            person.workspaceId === workspace.id &&
            person.status === "active",
        ).length
      : 0;

    return {
      workspace,
      count,
      active:
        Boolean(workspace) &&
        workspace?.id === activeWorkspaceId,
    };
  }

  async function loadScenario(scenario: Scenario) {
    const button = findLegacyButton(scenario);

    if (!button) {
      setMessage(
        `I could not locate the existing ${scenario.title} loader. The original loader is still on this page, so please refresh once and try again.`,
      );
      return;
    }

    setLoading(scenario.id);
    setMessage("");

    button.click();

    window.setTimeout(() => {
      hideLegacyLoaders();
      setRevision((value) => value + 1);
      setLoading("");

      const updatedWorkspaces = loadWorkspaces();
      const updatedActive = loadActiveWorkspaceId();
      const active = updatedWorkspaces.find(
        (item) => item.id === updatedActive,
      );

      setMessage(
        active
          ? `${scenario.title} demo loaded. ${active.name} is now the active group.`
          : `${scenario.title} demo loader completed.`,
      );
    }, 300);
  }

  return (
    <section className="demo55-unified">
      <header className="demo55-header">
        <span className="eyebrow">Demo scenarios</span>
        <h1>Choose a scenario to explore AutoTeams.</h1>
        <p>
          Each scenario loads realistic people, strengths and profile data so
          you can move straight into People, Team Builder and Atlas insights.
        </p>
      </header>

      <div className="demo55-grid">
        {scenarios.map((scenario) => {
          const status = statusFor(scenario);

          return (
            <article
              className={`demo55-card demo55-${scenario.id} ${
                status.active ? "is-active" : ""
              }`}
              key={scenario.id}
            >
              <div className="demo55-card-heading">
                <div className="demo55-icon" aria-hidden="true">
                  {scenario.icon}
                </div>

                <div>
                  <span className="eyebrow">
                    {scenario.eyebrow}
                  </span>
                  <h2>{scenario.title}</h2>
                  <p>{scenario.description}</p>
                </div>
              </div>

              <div className="demo55-stats">
                <div>
                  <small>People</small>
                  <strong>
                    {status.count > 0 ? status.count : "Ready"}
                  </strong>
                  <span>{scenario.peopleHint}</span>
                </div>
                <div>
                  <small>Profile state</small>
                  <strong>Ready</strong>
                  <span>Team DNA capable</span>
                </div>
                <div>
                  <small>Coverage</small>
                  <strong>{scenario.coverage}</strong>
                  <span>Scenario signals</span>
                </div>
                <div>
                  <small>Status</small>
                  <strong>
                    {status.count > 0 ? "Loaded" : "Ready"}
                  </strong>
                  <span>
                    {status.active
                      ? "Active group"
                      : status.count > 0
                        ? "Available"
                        : "Not loaded"}
                  </span>
                </div>
              </div>

              <div className="demo55-tags">
                {scenario.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="demo55-actions">
                <button
                  className="button demo55-load"
                  disabled={loading === scenario.id}
                  onClick={() => loadScenario(scenario)}
                  type="button"
                >
                  {loading === scenario.id
                    ? "Loading..."
                    : status.count > 0
                      ? `Reload ${scenario.title}`
                      : `Load ${scenario.title}`}
                </button>

                {status.count > 0 && (
                  <>
                    <Link
                      className="button secondary"
                      href="/people"
                    >
                      View People
                    </Link>
                    <Link
                      className="button secondary"
                      href="/team-builder"
                    >
                      Build a Team
                    </Link>
                  </>
                )}

                {status.active && (
                  <span className="demo55-active">
                    Active demo group
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {message && (
        <div className="demo55-message" role="status">
          {message}
        </div>
      )}
    </section>
  );
}

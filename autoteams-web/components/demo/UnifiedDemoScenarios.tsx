"use client";

import { EntitlementTestPanel } from "@/components/entitlements/EntitlementTestPanel";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  Workspace,
  WorkspacePerson,
  createWorkspaceId,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  saveActiveWorkspaceId,
  savePeople,
} from "@/lib/workspaces";

type ScenarioId =
  | "business"
  | "friendship"
  | "community"
  | "sports"
  | "education";

type DemoPersonSeed = {
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  location: string;
  strengths: string[];
};

type Scenario = {
  id: ScenarioId;
  eyebrow: string;
  title: string;
  workspaceName: string;
  workspaceType:
    | "organisation"
    | "friends_family"
    | "community"
    | "sports"
    | "education";
  description: string;
  icon: string;
  peopleHint: string;
  coverage: string;
  tags: string[];
  people: DemoPersonSeed[];
};

const scenarios: Scenario[] = [
  {
    id: "business",
    eyebrow: "Work scenario",
    title: "Work & Organisations",
    workspaceName: "Work Organisation Demo",
    workspaceType: "organisation",
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
    people: [
      {
        name: "Alex Murphy",
        email: "alex.murphy@demo.autoteams.app",
        department: "Engineering",
        jobTitle: "Cloud Engineer",
        location: "Leeds",
        strengths: ["Cloud", "Problem solving", "Reliability", "Delivery"],
      },
      {
        name: "Samira Khan",
        email: "samira.khan@demo.autoteams.app",
        department: "Product",
        jobTitle: "Product Manager",
        location: "Leeds",
        strengths: ["Strategy", "Communication", "Prioritisation", "Leadership"],
      },
      {
        name: "Dan Wright",
        email: "dan.wright@demo.autoteams.app",
        department: "Delivery",
        jobTitle: "Delivery Lead",
        location: "Manchester",
        strengths: ["Planning", "Organisation", "Facilitation", "Adaptability"],
      },
      {
        name: "Callum Scott",
        email: "callum.scott@demo.autoteams.app",
        department: "Engineering",
        jobTitle: "Software Engineer",
        location: "Sheffield",
        strengths: ["JavaScript", "APIs", "Collaboration", "Problem solving"],
      },
      {
        name: "Nina Shah",
        email: "nina.shah@demo.autoteams.app",
        department: "Data",
        jobTitle: "Data Engineer",
        location: "Leeds",
        strengths: ["SQL", "Data modelling", "Analysis", "Automation"],
      },
      {
        name: "Marcus Reed",
        email: "marcus.reed@demo.autoteams.app",
        department: "Security",
        jobTitle: "Security Engineer",
        location: "York",
        strengths: ["Security", "Risk", "Attention to detail", "Governance"],
      },
      {
        name: "Helen Brooks",
        email: "helen.brooks@demo.autoteams.app",
        department: "Operations",
        jobTitle: "Operations Manager",
        location: "Leeds",
        strengths: ["Organisation", "Leadership", "Reliability", "Communication"],
      },
      {
        name: "Tariq Hussain",
        email: "tariq.hussain@demo.autoteams.app",
        department: "Architecture",
        jobTitle: "Solution Architect",
        location: "Bradford",
        strengths: ["Architecture", "Systems thinking", "Communication", "Strategy"],
      },
      {
        name: "Lucy Green",
        email: "lucy.green@demo.autoteams.app",
        department: "UX",
        jobTitle: "UX Designer",
        location: "Leeds",
        strengths: ["User research", "Creativity", "Empathy", "Collaboration"],
      },
      {
        name: "Ben Carter",
        email: "ben.carter@demo.autoteams.app",
        department: "Finance",
        jobTitle: "Finance Analyst",
        location: "York",
        strengths: ["Analysis", "Cost awareness", "Planning", "Attention to detail"],
      },
    ],
  },
  {
    id: "friendship",
    eyebrow: "Friendship scenario",
    title: "Friendship & Social",
    workspaceName: "Friendship Social Demo",
    workspaceType: "friends_family",
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
    people: [
      {
        name: "Ryan Cole",
        email: "ryan.cole@demo.autoteams.app",
        department: "Social",
        jobTitle: "Outdoor enthusiast",
        location: "Leeds",
        strengths: ["Conversation", "Walking", "Travel", "Optimism"],
      },
      {
        name: "Amelia Stone",
        email: "amelia.stone@demo.autoteams.app",
        department: "Social",
        jobTitle: "Food and culture fan",
        location: "Leeds",
        strengths: ["Empathy", "Food", "Culture", "Communication"],
      },
      {
        name: "Imran Malik",
        email: "imran.malik@demo.autoteams.app",
        department: "Social",
        jobTitle: "Football supporter",
        location: "Bradford",
        strengths: ["Football", "Humour", "Reliability", "Conversation"],
      },
      {
        name: "Charlotte Dean",
        email: "charlotte.dean@demo.autoteams.app",
        department: "Social",
        jobTitle: "Coffee and books",
        location: "York",
        strengths: ["Listening", "Books", "Coffee", "Empathy"],
      },
      {
        name: "Amit Verma",
        email: "amit.verma@demo.autoteams.app",
        department: "Social",
        jobTitle: "Fitness and travel",
        location: "Leeds",
        strengths: ["Fitness", "Travel", "Energy", "Planning"],
      },
      {
        name: "Rebecca Hall",
        email: "rebecca.hall@demo.autoteams.app",
        department: "Social",
        jobTitle: "Creative hobbies",
        location: "Leeds",
        strengths: ["Creativity", "Art", "Listening", "Warmth"],
      },
      {
        name: "Owen Price",
        email: "owen.price@demo.autoteams.app",
        department: "Social",
        jobTitle: "Music enthusiast",
        location: "Wakefield",
        strengths: ["Music", "Conversation", "Curiosity", "Humour"],
      },
      {
        name: "Meera Joshi",
        email: "meera.joshi@demo.autoteams.app",
        department: "Social",
        jobTitle: "Community socialiser",
        location: "Leeds",
        strengths: ["Empathy", "Community", "Food", "Reliability"],
      },
      {
        name: "Tom Ellis",
        email: "tom.ellis@demo.autoteams.app",
        department: "Social",
        jobTitle: "Cycling and outdoors",
        location: "Harrogate",
        strengths: ["Cycling", "Outdoors", "Planning", "Optimism"],
      },
      {
        name: "Sarah Lowe",
        email: "sarah.lowe@demo.autoteams.app",
        department: "Social",
        jobTitle: "Travel and events",
        location: "Leeds",
        strengths: ["Travel", "Events", "Communication", "Organisation"],
      },
    ],
  },
  {
    id: "community",
    eyebrow: "Community scenario",
    title: "Community & Volunteering",
    workspaceName: "Community Action Demo",
    workspaceType: "community",
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
    people: [
      {
        name: "Grace Bennett",
        email: "grace.bennett@demo.autoteams.app",
        department: "Community",
        jobTitle: "Volunteer Coordinator",
        location: "Leeds",
        strengths: ["Organisation", "Leadership", "Empathy", "Reliability"],
      },
      {
        name: "Ravi Gill",
        email: "ravi.gill@demo.autoteams.app",
        department: "Community",
        jobTitle: "Community Outreach",
        location: "Bradford",
        strengths: ["Outreach", "Communication", "Community engagement", "Empathy"],
      },
      {
        name: "Megan Fox",
        email: "megan.fox@demo.autoteams.app",
        department: "Community",
        jobTitle: "Events Volunteer",
        location: "Leeds",
        strengths: ["Events", "Planning", "Creativity", "Teamwork"],
      },
      {
        name: "Haroon Ahmed",
        email: "haroon.ahmed@demo.autoteams.app",
        department: "Community",
        jobTitle: "Fundraising Volunteer",
        location: "Leeds",
        strengths: ["Fundraising", "Communication", "Initiative", "Networking"],
      },
      {
        name: "Julie Mason",
        email: "julie.mason@demo.autoteams.app",
        department: "Community",
        jobTitle: "Support Volunteer",
        location: "Wakefield",
        strengths: ["Listening", "Empathy", "Reliability", "Support"],
      },
      {
        name: "Kieran Wood",
        email: "kieran.wood@demo.autoteams.app",
        department: "Community",
        jobTitle: "Logistics Volunteer",
        location: "Leeds",
        strengths: ["Logistics", "Organisation", "Problem solving", "Reliability"],
      },
      {
        name: "Fatima Noor",
        email: "fatima.noor@demo.autoteams.app",
        department: "Community",
        jobTitle: "Youth Mentor",
        location: "Leeds",
        strengths: ["Mentoring", "Empathy", "Facilitation", "Communication"],
      },
      {
        name: "Peter Shaw",
        email: "peter.shaw@demo.autoteams.app",
        department: "Community",
        jobTitle: "Project Volunteer",
        location: "York",
        strengths: ["Planning", "Delivery", "Teamwork", "Adaptability"],
      },
      {
        name: "Leah Clarke",
        email: "leah.clarke@demo.autoteams.app",
        department: "Community",
        jobTitle: "Communications Volunteer",
        location: "Leeds",
        strengths: ["Writing", "Social media", "Communication", "Creativity"],
      },
      {
        name: "George King",
        email: "george.king@demo.autoteams.app",
        department: "Community",
        jobTitle: "Community Facilitator",
        location: "Harrogate",
        strengths: ["Facilitation", "Leadership", "Listening", "Organisation"],
      },
    ],
  },
  {
    id: "sports",
    eyebrow: "Sports scenario",
    title: "Sports & Clubs",
    workspaceName: "Northside Sports Demo",
    workspaceType: "sports",
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
    people: [
      {
        name: "Sophia Doyle",
        email: "sophia.doyle@demo.autoteams.app",
        department: "Football",
        jobTitle: "Midfielder",
        location: "Leeds",
        strengths: ["Passing", "Vision", "Teamwork", "Leadership"],
      },
      {
        name: "Adam Foster",
        email: "adam.foster@demo.autoteams.app",
        department: "Football",
        jobTitle: "Goalkeeper",
        location: "Leeds",
        strengths: ["Communication", "Reflexes", "Reliability", "Leadership"],
      },
      {
        name: "Lewis Grant",
        email: "lewis.grant@demo.autoteams.app",
        department: "Football",
        jobTitle: "Defender",
        location: "Bradford",
        strengths: ["Defending", "Positioning", "Teamwork", "Discipline"],
      },
      {
        name: "Maya Collins",
        email: "maya.collins@demo.autoteams.app",
        department: "Football",
        jobTitle: "Forward",
        location: "Leeds",
        strengths: ["Finishing", "Speed", "Initiative", "Confidence"],
      },
      {
        name: "Ethan Cooper",
        email: "ethan.cooper@demo.autoteams.app",
        department: "Football",
        jobTitle: "Full Back",
        location: "Wakefield",
        strengths: ["Stamina", "Teamwork", "Adaptability", "Defending"],
      },
      {
        name: "Hannah Reed",
        email: "hannah.reed@demo.autoteams.app",
        department: "Football",
        jobTitle: "Midfielder",
        location: "Leeds",
        strengths: ["Control", "Communication", "Planning", "Teamwork"],
      },
      {
        name: "Noah Turner",
        email: "noah.turner@demo.autoteams.app",
        department: "Football",
        jobTitle: "Winger",
        location: "York",
        strengths: ["Speed", "Creativity", "Crossing", "Energy"],
      },
      {
        name: "Isla Morgan",
        email: "isla.morgan@demo.autoteams.app",
        department: "Football",
        jobTitle: "Centre Back",
        location: "Leeds",
        strengths: ["Leadership", "Positioning", "Reliability", "Communication"],
      },
      {
        name: "Jamie Bell",
        email: "jamie.bell@demo.autoteams.app",
        department: "Football",
        jobTitle: "Forward",
        location: "Harrogate",
        strengths: ["Finishing", "Movement", "Confidence", "Teamwork"],
      },
      {
        name: "Ella Morris",
        email: "ella.morris@demo.autoteams.app",
        department: "Football",
        jobTitle: "Utility Player",
        location: "Leeds",
        strengths: ["Adaptability", "Teamwork", "Stamina", "Communication"],
      },
    ],
  },
  {
    id: "education",
    eyebrow: "Education scenario",
    title: "Education & Learning",
    workspaceName: "Education Learning Demo",
    workspaceType: "education",
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
    people: [
      {
        name: "Aisha Khan",
        email: "aisha.khan@demo.autoteams.app",
        department: "Computer Science",
        jobTitle: "Student - Computer Science",
        location: "Leeds",
        strengths: ["Python", "AI", "Problem solving", "Analytical thinking"],
      },
      {
        name: "James Wilson",
        email: "james.wilson@demo.autoteams.app",
        department: "Business Management",
        jobTitle: "Student - Business Management",
        location: "Leeds",
        strengths: ["Leadership", "Communication", "Presenting", "Collaboration"],
      },
      {
        name: "Priya Patel",
        email: "priya.patel@demo.autoteams.app",
        department: "Psychology",
        jobTitle: "Student - Psychology",
        location: "Bradford",
        strengths: ["Research", "Analysis", "Writing", "Empathy"],
      },
      {
        name: "Daniel Evans",
        email: "daniel.evans@demo.autoteams.app",
        department: "Engineering",
        jobTitle: "Student - Engineering",
        location: "Sheffield",
        strengths: ["Design", "Mathematics", "Prototyping", "Problem solving"],
      },
      {
        name: "Sophie Taylor",
        email: "sophie.taylor@demo.autoteams.app",
        department: "Marketing",
        jobTitle: "Student - Marketing",
        location: "Leeds",
        strengths: ["Creativity", "Communication", "Social media", "Presenting"],
      },
      {
        name: "Harpreet Singh",
        email: "harpreet.singh@demo.autoteams.app",
        department: "Computer Science",
        jobTitle: "Student - Software Engineering",
        location: "Bradford",
        strengths: ["JavaScript", "Cloud", "APIs", "Collaboration"],
      },
      {
        name: "Emily Roberts",
        email: "emily.roberts@demo.autoteams.app",
        department: "Medicine",
        jobTitle: "Student - Medicine",
        location: "Leeds",
        strengths: ["Research", "Organisation", "Communication", "Planning"],
      },
      {
        name: "Mohammed Ali",
        email: "mohammed.ali@demo.autoteams.app",
        department: "Data Science",
        jobTitle: "Student - Data Science",
        location: "Manchester",
        strengths: ["SQL", "Python", "Statistics", "Analytical thinking"],
      },
      {
        name: "Chloe Davies",
        email: "chloe.davies@demo.autoteams.app",
        department: "Graphic Design",
        jobTitle: "Student - Graphic Design",
        location: "Leeds",
        strengths: ["UX", "Visual design", "Creativity", "Collaboration"],
      },
      {
        name: "Oliver Brown",
        email: "oliver.brown@demo.autoteams.app",
        department: "Economics",
        jobTitle: "Student - Economics",
        location: "York",
        strengths: ["Data analysis", "Finance", "Strategy", "Problem solving"],
      },
      {
        name: "Simran Kaur",
        email: "simran.kaur@demo.autoteams.app",
        department: "Law",
        jobTitle: "Student - Law",
        location: "Leeds",
        strengths: ["Research", "Communication", "Critical thinking", "Attention to detail"],
      },
      {
        name: "Jack Morgan",
        email: "jack.morgan@demo.autoteams.app",
        department: "Cyber Security",
        jobTitle: "Student - Cyber Security",
        location: "Sheffield",
        strengths: ["Security", "Networking", "Problem solving", "Technical analysis"],
      },
    ],
  },
];

function workspaceForScenario(
  scenario: Scenario,
  workspaces: Workspace[],
) {
  return workspaces.find(
    (workspace) =>
      workspace.name.trim().toLowerCase() ===
      scenario.workspaceName.toLowerCase(),
  );
}

export function UnifiedDemoScenarios() {
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<ScenarioId | "">("");

  useEffect(() => {
    setRevision((value) => value + 1);
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
    const workspace = workspaceForScenario(
      scenario,
      workspaces,
    );

    const count = workspace
      ? people.filter(
          (person) =>
            person.workspaceId === workspace.id &&
            person.status === "active" &&
            scenario.people.some(
              (seed) =>
                seed.email.toLowerCase() ===
                person.email.toLowerCase(),
            ),
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

  function loadScenario(scenario: Scenario) {
    setLoading(scenario.id);
    setMessage("");

    try {
      let workspace = workspaceForScenario(
        scenario,
        loadWorkspaces(),
      );

      if (!workspace) {
        workspace = createOwnedWorkspace({
          name: scenario.workspaceName,
          type: scenario.workspaceType,
          description: `${scenario.title} demo scenario for AutoTeams testing.`,
        });
      }

      saveActiveWorkspaceId(workspace.id);

      const currentPeople = loadPeople();

      const existingEmails = new Set(
        currentPeople
          .filter(
            (person) =>
              person.workspaceId === workspace!.id,
          )
          .map((person) =>
            person.email.toLowerCase(),
          ),
      );

      const additions: WorkspacePerson[] =
        scenario.people
          .filter(
            (seed) =>
              !existingEmails.has(
                seed.email.toLowerCase(),
              ),
          )
          .map((seed) => ({
            ...seed,
            id: createWorkspaceId("person"),
            workspaceId: workspace!.id,
            status: "active",
            teamDnaStatus: "ready",
          }));

      const updatedPeople = [
        ...currentPeople,
        ...additions,
      ];

      savePeople(updatedPeople);

      setRevision((value) => value + 1);

      setMessage(
        additions.length > 0
          ? `${scenario.title} demo loaded. ${additions.length} people added and ${workspace.name} is now active.`
          : `${scenario.title} demo is already loaded. ${workspace.name} is now the active group.`,
      );
    } catch (error) {
      console.error(
        "[AutoTeams] demo load failed",
        error,
      );

      setMessage(
        `Could not load the ${scenario.title} demo. Check the browser console for details.`,
      );
    } finally {
      setLoading("");
    }
  }

  return (
    <section className="demo55-unified">
      <header className="demo55-header">
        <span className="eyebrow">
          Demo scenarios
        </span>
        <h1>
          Choose a scenario to explore AutoTeams.
        </h1>
        <p>
          Each scenario loads realistic people, strengths
          and profile data so you can move straight into
          People, Team Builder and Atlas insights.
        </p>
      </header>

      <div className="demo55-grid">
        {scenarios.map((scenario) => {
          const status =
            statusFor(scenario);

          return (
            <article
              className={`demo55-card demo55-${scenario.id} ${
                status.active
                  ? "is-active"
                  : ""
              }`}
              key={scenario.id}
            >
              <div className="demo55-card-heading">
                <div
                  className="demo55-icon"
                  aria-hidden="true"
                >
                  {scenario.icon}
                </div>

                <div>
                  <span className="eyebrow">
                    {scenario.eyebrow}
                  </span>
                  <h2>
                    {scenario.title}
                  </h2>
                  <p>
                    {scenario.description}
                  </p>
                </div>
              </div>

              <div className="demo55-stats">
                <div>
                  <small>People</small>
                  <strong>
                    {status.count > 0
                      ? status.count
                      : scenario.people.length}
                  </strong>
                  <span>
                    {scenario.peopleHint}
                  </span>
                </div>

                <div>
                  <small>
                    Profile state
                  </small>
                  <strong>Ready</strong>
                  <span>
                    Team DNA capable
                  </span>
                </div>

                <div>
                  <small>Coverage</small>
                  <strong>
                    {scenario.coverage}
                  </strong>
                  <span>
                    Scenario signals
                  </span>
                </div>

                <div>
                  <small>Status</small>
                  <strong>
                    {status.count > 0
                      ? "Loaded"
                      : "Ready"}
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
                {scenario.tags.map(
                  (tag) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ),
                )}
              </div>

              <div className="demo55-actions">
                <button
                  className="button demo55-load"
                  disabled={
                    loading === scenario.id
                  }
                  onClick={() =>
                    loadScenario(scenario)
                  }
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
        <div
          className="demo55-message"
          role="status"
        >
          {message}
</div>
      )}

      <section className="container teamscience-entitlement-test-unified-v715741">
        <EntitlementTestPanel />
      </section>
</section>
  );
}

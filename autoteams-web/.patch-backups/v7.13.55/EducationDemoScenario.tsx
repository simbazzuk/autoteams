"use client";

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

const EDUCATION_WORKSPACE_NAME = "Education Learning Demo";

const EDUCATION_DEMO = [
  {
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    department: "Computer Science",
    jobTitle: "Student - Computer Science",
    location: "Leeds",
    strengths: ["Python", "AI", "Problem solving", "Analytical thinking"],
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    department: "Business Management",
    jobTitle: "Student - Business Management",
    location: "Leeds",
    strengths: ["Leadership", "Communication", "Presenting", "Collaboration"],
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    department: "Psychology",
    jobTitle: "Student - Psychology",
    location: "Bradford",
    strengths: ["Research", "Analysis", "Writing", "Empathy"],
  },
  {
    name: "Daniel Evans",
    email: "daniel.evans@example.com",
    department: "Engineering",
    jobTitle: "Student - Engineering",
    location: "Sheffield",
    strengths: ["Design", "Mathematics", "Prototyping", "Problem solving"],
  },
  {
    name: "Sophie Taylor",
    email: "sophie.taylor@example.com",
    department: "Marketing",
    jobTitle: "Student - Marketing",
    location: "Leeds",
    strengths: ["Creativity", "Communication", "Social media", "Presenting"],
  },
  {
    name: "Harpreet Singh",
    email: "harpreet.singh@example.com",
    department: "Computer Science",
    jobTitle: "Student - Software Engineering",
    location: "Bradford",
    strengths: ["JavaScript", "Cloud", "APIs", "Collaboration"],
  },
  {
    name: "Emily Roberts",
    email: "emily.roberts@example.com",
    department: "Medicine",
    jobTitle: "Student - Medicine",
    location: "Leeds",
    strengths: ["Research", "Organisation", "Communication", "Planning"],
  },
  {
    name: "Mohammed Ali",
    email: "mohammed.ali@example.com",
    department: "Data Science",
    jobTitle: "Student - Data Science",
    location: "Manchester",
    strengths: ["SQL", "Python", "Statistics", "Analytical thinking"],
  },
  {
    name: "Chloe Davies",
    email: "chloe.davies@example.com",
    department: "Graphic Design",
    jobTitle: "Student - Graphic Design",
    location: "Leeds",
    strengths: ["UX", "Visual design", "Creativity", "Collaboration"],
  },
  {
    name: "Oliver Brown",
    email: "oliver.brown@example.com",
    department: "Economics",
    jobTitle: "Student - Economics",
    location: "York",
    strengths: ["Data analysis", "Finance", "Strategy", "Problem solving"],
  },
  {
    name: "Simran Kaur",
    email: "simran.kaur@example.com",
    department: "Law",
    jobTitle: "Student - Law",
    location: "Leeds",
    strengths: ["Research", "Communication", "Critical thinking", "Attention to detail"],
  },
  {
    name: "Jack Morgan",
    email: "jack.morgan@example.com",
    department: "Cyber Security",
    jobTitle: "Student - Cyber Security",
    location: "Sheffield",
    strengths: ["Security", "Networking", "Problem solving", "Technical analysis"],
  },
];

export function EducationDemoScenario() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setActiveWorkspaceId(loadActiveWorkspaceId());
  }, []);

  const educationWorkspace = useMemo(
    () =>
      workspaces.find(
        (workspace) =>
          workspace.name.trim().toLowerCase() ===
          EDUCATION_WORKSPACE_NAME.toLowerCase(),
      ),
    [workspaces],
  );

  const loadedCount = useMemo(() => {
    if (!educationWorkspace) return 0;

    const demoEmails = new Set(
      EDUCATION_DEMO.map((item) => item.email.toLowerCase()),
    );

    return people.filter(
      (person) =>
        person.workspaceId === educationWorkspace.id &&
        person.status === "active" &&
        demoEmails.has(person.email.toLowerCase()),
    ).length;
  }, [educationWorkspace, people]);

  function loadEducationScenario() {
    let workspace = loadWorkspaces().find(
      (item) =>
        item.name.trim().toLowerCase() ===
        EDUCATION_WORKSPACE_NAME.toLowerCase(),
    );

    if (!workspace) {
      workspace = createOwnedWorkspace({
        name: EDUCATION_WORKSPACE_NAME,
        type: "education",
        description:
          "Demo education group for university project, study and learning-team scenarios.",
      });
    }

    saveActiveWorkspaceId(workspace.id);
    setActiveWorkspaceId(workspace.id);

    const currentPeople = loadPeople();
    const existingEmails = new Set(
      currentPeople
        .filter((person) => person.workspaceId === workspace!.id)
        .map((person) => person.email.toLowerCase()),
    );

    const additions: WorkspacePerson[] = EDUCATION_DEMO
      .filter((person) => !existingEmails.has(person.email.toLowerCase()))
      .map((person) => ({
        ...person,
        id: createWorkspaceId("person"),
        workspaceId: workspace!.id,
        status: "active",
        teamDnaStatus: "ready",
      }));

    const updatedPeople = [...currentPeople, ...additions];
    savePeople(updatedPeople);

    setWorkspaces(loadWorkspaces());
    setPeople(updatedPeople);

    if (additions.length === 0) {
      setMessage(
        "Education demo is already loaded. The Education Learning Demo group is now active.",
      );
    } else {
      setMessage(
        `${additions.length} Education demo people loaded. Education Learning Demo is now the active group.`,
      );
    }
  }

  const isActive =
    Boolean(educationWorkspace) &&
    activeWorkspaceId === educationWorkspace?.id;

  return (
    <section className="demo54-education">
      <div className="demo54-education-heading">
        <div className="demo54-education-icon" aria-hidden="true">
          EDU
        </div>

        <div>
          <span className="eyebrow">Education scenario</span>
          <h2>Education & Learning</h2>
          <p>
            Test AutoTeams with 12 realistic students across different subjects,
            strengths and locations. Ideal for project teams, study groups and
            interdisciplinary university scenarios.
          </p>
        </div>
      </div>

      <div className="demo54-education-stats">
        <article>
          <small>People</small>
          <strong>12</strong>
          <span>Demo students</span>
        </article>
        <article>
          <small>Profile state</small>
          <strong>Ready</strong>
          <span>Team DNA available</span>
        </article>
        <article>
          <small>Subjects</small>
          <strong>12</strong>
          <span>Cross-discipline mix</span>
        </article>
        <article>
          <small>Status</small>
          <strong>{loadedCount === 12 ? "Loaded" : "Ready"}</strong>
          <span>{loadedCount} of 12 present</span>
        </article>
      </div>

      <div className="demo54-education-subjects">
        <span>Computer Science</span>
        <span>Business</span>
        <span>Psychology</span>
        <span>Engineering</span>
        <span>Marketing</span>
        <span>Medicine</span>
        <span>Data Science</span>
        <span>Design</span>
        <span>Economics</span>
        <span>Law</span>
        <span>Cyber Security</span>
      </div>

      <div className="demo54-education-actions">
        <button
          className="button demo54-load"
          onClick={loadEducationScenario}
          type="button"
        >
          {loadedCount === 12
            ? "Reload Education Demo"
            : "Load Education Demo"}
        </button>

        {loadedCount > 0 && (
          <>
            <Link className="button secondary" href="/people">
              View People
            </Link>
            <Link className="button secondary" href="/team-builder">
              Build a Team
            </Link>
          </>
        )}

        {isActive && (
          <span className="demo54-active">
            Active demo group
          </span>
        )}
      </div>

      {message && (
        <div className="demo54-message" role="status">
          {message}
        </div>
      )}
    </section>
  );
}

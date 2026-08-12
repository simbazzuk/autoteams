"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  WorkspacePerson,
  createWorkspaceId,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  savePeople,
} from "@/lib/workspaces";

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

export function EducationDemoLoader() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setWorkspaceId(loadActiveWorkspaceId());
    setPeople(loadPeople());
  }, []);

  const workspace = useMemo(
    () => loadWorkspaces().find((item) => item.id === workspaceId),
    [workspaceId],
  );

  const loadedCount = useMemo(() => {
    const demoEmails = new Set(
      EDUCATION_DEMO.map((person) => person.email.toLowerCase()),
    );

    return people.filter(
      (person) =>
        person.workspaceId === workspaceId &&
        demoEmails.has(person.email.toLowerCase()) &&
        person.status === "active",
    ).length;
  }, [people, workspaceId]);

  function loadDemo() {
    if (!workspaceId) {
      setMessage("Choose an active group before loading demo people.");
      return;
    }

    const current = loadPeople();
    const existingEmails = new Set(
      current
        .filter((person) => person.workspaceId === workspaceId)
        .map((person) => person.email.toLowerCase()),
    );

    const newPeople: WorkspacePerson[] = EDUCATION_DEMO
      .filter((person) => !existingEmails.has(person.email.toLowerCase()))
      .map((person) => ({
        ...person,
        id: createWorkspaceId("person"),
        workspaceId,
        status: "active",
        teamDnaStatus: "ready",
      }));

    const updated = [...current, ...newPeople];
    savePeople(updated);
    setPeople(updated);

    if (newPeople.length === 0) {
      setMessage("The Education demo people are already loaded in this group.");
      return;
    }

    setMessage(
      `${newPeople.length} Education demo people were added to ${
        workspace?.name || "the active group"
      }.`,
    );
  }

  return (
    <section className="education-demo54">
      <div className="education-demo54-copy">
        <span className="education-demo54-icon" aria-hidden="true">
          EDU
        </span>
        <div>
          <small>Demo data</small>
          <h2>Education & Learning</h2>
          <p>
            Load 12 realistic students across different subjects, strengths and
            locations for Team Builder testing.
          </p>
          <div className="education-demo54-tags">
            <span>12 people</span>
            <span>Team DNA ready</span>
            <span>No duplicates</span>
          </div>
        </div>
      </div>

      <div className="education-demo54-actions">
        <span className="education-demo54-status">
          {loadedCount > 0
            ? `${loadedCount} of 12 loaded`
            : workspace
              ? `Loads into ${workspace.name}`
              : "No active group selected"}
        </span>

        <button
          className="button education-demo54-button"
          onClick={loadDemo}
          type="button"
        >
          {loadedCount === 12
            ? "Education Demo Loaded"
            : "Load Education Demo"}
        </button>

        {loadedCount > 0 && (
          <Link className="button secondary" href="/team-builder">
            Build a Team
          </Link>
        )}
      </div>

      {message && (
        <div className="education-demo54-message" role="status">
          {message}
        </div>
      )}
    </section>
  );
}
